import { NextRequest, NextResponse } from "next/server";
import { mkdirSync, writeFileSync, unlinkSync, existsSync } from "fs";
import { join } from "path";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(
  req: NextRequest,
  { params }: { params: { spotId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File;

  if (!file) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const uploadPath = join(process.cwd(), "public", "uploads", params.spotId);
  const filename = `${Date.now()}_${file.name}`;
  const fileUrl = `/uploads/${params.spotId}/${filename}`;

  mkdirSync(uploadPath, { recursive: true });
  writeFileSync(join(uploadPath, filename), buffer);

  const savedImage = await prisma.spotImage.create({
    data: {
      spotId: params.spotId,
      url: fileUrl,
    },
  });

  return NextResponse.json({ success: true, url: savedImage.url, id: savedImage.id });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { spotId: string; imageId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { spotId, imageId } = params;

  try {
    const image = await prisma.spotImage.findUnique({
      where: { id: imageId },
    });

    if (!image) {
      return NextResponse.json({ error: "Image not found" }, { status: 404 });
    }

    const filePath = join(process.cwd(), "public", image.url);
    if (existsSync(filePath)) {
      unlinkSync(filePath);
    }

    await prisma.spotImage.delete({ where: { id: imageId } });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[DELETE IMAGE ERROR]", err);
    return NextResponse.json({ error: "Failed to delete image" }, { status: 500 });
  }
}
