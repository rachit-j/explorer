'use client';

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import LogoutButton from "@/components/LogoutButton";

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/signin");
    }
  }, [status, router]);

  if (status === "loading") return <div className="text-white">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="flex justify-between items-center p-6 bg-gray-800">
        <h1 className="text-xl font-bold">Welcome, {session?.user?.email}</h1>
        <LogoutButton />
      </header>

      <main className="p-6 space-y-4">
        <p className="text-lg">Your urban exploring spots will go here.</p>

        {session?.user?.role === "admin" && (
          <button
            onClick={() => router.push("/admin/users")}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
          >
            Manage Users
          </button>
        )}
      </main>
    </div>
  );
}
