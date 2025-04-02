import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string; // ✅ Add this line
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role: string; // ✅ add role to the session type
    };
  }
  interface User {
    id: string; // ✅ Optional, helps when using token.user = user
    role: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    email: string;
    role: string;
  }
}
