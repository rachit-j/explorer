import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  const setting = await prisma.setting.findFirst();
  return NextResponse.json({ allowSignup: setting?.allowSignup ?? true });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { allowSignup } = await req.json();
  const updated = await prisma.setting.upsert({
    where: { id: (await prisma.setting.findFirst())?.id || "" },
    update: { allowSignup },
    create: { allowSignup },
  });

  return NextResponse.json({ success: true, setting: updated });
}
