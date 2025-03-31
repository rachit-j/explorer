'use client';

import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { useSession } from "next-auth/react";

export default function NavBar() {
  const router = useRouter();
  const { data: session } = useSession();

  return (
    <nav className="bg-gray-800 text-white flex items-center gap-4 p-4 shadow-md">
      <button onClick={() => router.push("/")} className="hover:underline">Home</button>
      <button onClick={() => router.push("/map")} className="hover:underline">Map</button>
      {session?.user?.role === "admin" && (
        <button onClick={() => router.push("/admin/users")} className="hover:underline">
          Admin Panel
        </button>
      )}
      {session?.user?.role === "admin" && (
        <button onClick={() => router.push("/spots/crud")} className="hover:underline">
          Spots DB
        </button>
      )}
      <button onClick={() => signOut({ callbackUrl: "/signin" })} className="ml-auto bg-red-600 px-3 py-1 rounded hover:bg-red-700">
        Sign Out
      </button>
    </nav>
  );
}
