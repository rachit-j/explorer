import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";
import { mkdirSync, writeFileSync } from "fs";
import { join } from "path";

const prisma = new PrismaClient();

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ spotId: string }> }
) {
  const { spotId } = await params;

  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  if (!spotId) {
    return NextResponse.json({ error: "Spot ID is missing" }, { status: 400 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File;

  if (!file) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const uploadPath = join(process.cwd(), "public", "uploads", spotId);
  const filename = `${Date.now()}_${file.name}`;

  mkdirSync(uploadPath, { recursive: true });
  writeFileSync(join(uploadPath, filename), buffer);

  const fileUrl = `/uploads/${spotId}/${filename}`;

  await prisma.spotImage.create({
    data: {
      spotId,
      url: fileUrl,
    },
  });

  return NextResponse.json({ success: true, url: fileUrl });
}
