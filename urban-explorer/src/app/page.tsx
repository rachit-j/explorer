'use client';

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/signin");
    }
  }, [status, router]);

  if (status === "loading") {
    return <div className="text-white">Loading...</div>;
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-black text-white">
      <h1 className="text-3xl">Welcome, {session?.user?.email}!</h1>
    </div>
  );
}
