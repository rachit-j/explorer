import { getServerSession } from "next-auth";
import { authOptions } from "./auth";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";

// ✅ Use inside pages (SSR or Server Components)
export async function requireUserSessionPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/signin");
  return session;
}

export async function requireAdminSessionPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    redirect("/signin");
  }
  return session;
}

// ✅ Use inside API routes
export async function requireUserSessionAPI() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  return session;
}

export async function requireAdminSessionAPI() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  return session;
}
