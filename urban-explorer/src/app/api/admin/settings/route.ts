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

  try {
    const existingSetting = await prisma.setting.findFirst();

    let updated;
    if (existingSetting) {
      updated = await prisma.setting.update({
        where: { id: existingSetting.id },
        data: { allowSignup },
      });
    } else {
      updated = await prisma.setting.create({
        data: { allowSignup },
      });
    }

    return NextResponse.json({ success: true, setting: updated });
  } catch (error) {
    console.error("[SETTINGS UPDATE ERROR]", error);
    return NextResponse.json({ error: "Failed to update setting" }, { status: 500 });
  }
}
