import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const prisma = new PrismaClient();

export async function GET() {
  const spots = await prisma.spot.findMany({
    include: {
      images: true,
    },
  });

  return NextResponse.json({ spots });
}
export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
  
    const body = await req.json();
  
    const spot = await prisma.spot.create({
      data: {
        title: body.title,
        description: body.description,
        latitude: body.latitude,
        longitude: body.longitude,
        visitedAt: new Date(body.visitedAt),
        createdBy: session.user.email,
      },
    });
  
    return NextResponse.json({ success: true, spot });
  }
  