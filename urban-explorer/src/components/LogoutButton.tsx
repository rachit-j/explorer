'use client';

import { signOut } from "next-auth/react";

export default function LogoutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/signin" })}
      className="text-sm bg-red-600 px-4 py-2 rounded hover:bg-red-700 transition"
    >
      Log Out
    </button>
  );
}
