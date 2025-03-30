import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";
import { unlinkSync, existsSync } from "fs";
import { join } from "path";

const prisma = new PrismaClient();

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  // Extract from the full URL
  const pathname = req.nextUrl.pathname;
  const parts = pathname.split("/"); // ['', 'api', 'spots', 'spotId', 'upload', 'imageId']
  const spotId = parts[3];
  const imageId = parts[5];

  if (!spotId || !imageId) {
    return NextResponse.json({ error: "Invalid path" }, { status: 400 });
  }

  const image = await prisma.spotImage.findUnique({ where: { id: imageId } });

  if (!image) {
    return NextResponse.json({ error: "Image not found" }, { status: 404 });
  }

  const filePath = join(process.cwd(), "public", image.url);
  if (existsSync(filePath)) {
    unlinkSync(filePath);
  }

  await prisma.spotImage.delete({ where: { id: imageId } });

  return NextResponse.json({ success: true });
}

