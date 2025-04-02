import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";
import { unlinkSync, existsSync } from "fs";
import { join } from "path";

const prisma = new PrismaClient();

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ spotId: string }> }
) {
  const { spotId } = await params;

  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const spot = await prisma.spot.findUnique({
      where: { id: spotId },
    });

    if (!spot) {
      return NextResponse.json({ error: "Spot not found" }, { status: 404 });
    }

    await prisma.spot.delete({
      where: { id: spotId },
    });

    const images = await prisma.spotImage.findMany({ where: { spotId } });
    for (const image of images) {
      const filePath = join(process.cwd(), "public", image.url);
      if (existsSync(filePath)) {
        unlinkSync(filePath);
      }
      await prisma.spotImage.delete({ where: { id: image.id } });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[DELETE SPOT ERROR]", err);
    return NextResponse.json({ error: "Failed to delete spot" }, { status: 500 });
  }
}
