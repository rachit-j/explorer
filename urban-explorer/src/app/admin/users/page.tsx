'use client';

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function AdminUserPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [allowSignup, setAllowSignup] = useState(true);
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState("user");
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "loading") return;

    if (!session || !session.user || session.user.role !== "admin") {
      router.push(session ? "/" : "/signin");
      return;
    }

    fetchUsers();
    fetchToggle();
  }, [status, session, router]);

  async function fetchUsers() {
    const res = await fetch("/api/admin/users");
    const data = await res.json();
    setUsers(data.users);
  }

  async function fetchToggle() {
    const res = await fetch("/api/admin/settings");
    const data = await res.json();
    setAllowSignup(data.allowSignup);
  }

  async function toggleSignup() {
    const res = await fetch("/api/admin/settings", {
      method: "POST",
      body: JSON.stringify({ allowSignup: !allowSignup }),
      headers: { "Content-Type": "application/json" },
    });

    if (res.ok) {
      const data = await res.json();
      setAllowSignup(data.setting.allowSignup);
    }
  }

  async function handleCreateUser(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: newEmail, password: newPassword, role: newRole }),
    });

    if (res.ok) {
      setNewEmail("");
      setNewPassword("");
      setNewRole("user");
      fetchUsers();
    } else {
      const data = await res.json();
      setError(data.error || "Could not create user");
    }
  }

  async function handleRoleChange(userId: string, currentRole: string) {
    const newRole = currentRole === "admin" ? "user" : "admin";

    await fetch(`/api/admin/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: newRole }),
    });

    fetchUsers();
  }

  async function handleDelete(userId: string) {
    await fetch(`/api/admin/users/${userId}`, { method: "DELETE" });
    fetchUsers();
  }

  if (
    status === "loading" ||
    !session ||
    !session.user ||
    session.user.role !== "admin"
  ) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <p>Loading admin panel...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">User Management</h1>
        <button
          onClick={toggleSignup}
          className={`px-4 py-2 rounded ${
            allowSignup ? "bg-green-600" : "bg-red-600"
          }`}
        >
          Sign-up: {allowSignup ? "Enabled" : "Disabled"}
        </button>
      </div>

      <form onSubmit={handleCreateUser} className="bg-gray-800 p-4 rounded mb-6 space-y-3">
        <h2 className="text-xl font-semibold mb-2">Create New User</h2>
        {error && <p className="text-red-400">{error}</p>}
        <input
          type="email"
          placeholder="Email"
          value={newEmail}
          onChange={(e) => setNewEmail(e.target.value)}
          required
          className="w-full p-2 rounded bg-gray-700"
        />
        <input
          type="password"
          placeholder="Password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
          className="w-full p-2 rounded bg-gray-700"
        />
        <select
          value={newRole}
          onChange={(e) => setNewRole(e.target.value)}
          className="w-full p-2 rounded bg-gray-700"
        >
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
        <button className="w-full bg-blue-600 hover:bg-blue-700 py-2 rounded">
          Create User
        </button>
      </form>

      <h2 className="text-xl font-semibold mb-3">All Users</h2>
      <div className="space-y-3">
        {users.map((user: any) => (
          <div
            key={user.id}
            className="bg-gray-800 p-4 rounded flex justify-between items-center"
          >
            <div>
              <p>{user.email}</p>
              <p className="text-sm text-gray-400">Role: {user.role}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleRoleChange(user.id, user.role)}
                className="bg-yellow-500 px-3 py-1 rounded hover:bg-yellow-600 text-sm"
              >
                Make {user.role === "admin" ? "User" : "Admin"}
              </button>
              <button
                onClick={() => handleDelete(user.id)}
                className="bg-red-600 px-3 py-1 rounded hover:bg-red-700 text-sm"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
