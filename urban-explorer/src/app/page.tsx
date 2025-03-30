import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import LogoutButton from "@/components/LogoutButton";

export default async function HomePage() {
  const session = await requireUserSessionPage();

  if (!session) {
    redirect("/signin"); // ✅ Full server-side block
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="flex justify-between items-center p-6 bg-gray-800">
        <h1 className="text-xl font-bold">
          Welcome, {session.user.email}
        </h1>
        <LogoutButton />
      </header>

      <main className="p-6 space-y-4">
        <p className="text-lg">Your urban exploring spots will go here.</p>

        {session.user.role === "admin" && (
          <a
            href="/admin/users"
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
          >
            Manage Users
          </a>
        )}
      </main>
    </div>
  );
}
import { requireUserSessionPage } from "@/lib/session-helpers";
