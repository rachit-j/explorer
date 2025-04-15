import { NextRequest, NextResponse } from "next/server";
import { join } from "path";
import { statSync, createReadStream } from "fs";
import mime from "mime";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(
  req: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "admin") {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const filePath = join(process.cwd(), "public", "uploads", ...params.path);

  try {
    const stat = statSync(filePath);
    const stream = createReadStream(filePath);
    const mimeType = mime.getType(filePath) || "application/octet-stream";

    return new NextResponse(stream as any, {
      status: 200,
      headers: {
        "Content-Type": mimeType,
        "Content-Length": stat.size.toString(),
      },
    });
  } catch (err) {
    return new NextResponse("File not found", { status: 404 });
  }
}