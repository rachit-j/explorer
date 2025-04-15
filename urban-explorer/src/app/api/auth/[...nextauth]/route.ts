import NextAuth from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import { authOptions } from "@/lib/auth";

const prisma = new PrismaClient();

const handler = NextAuth({
    adapter: PrismaAdapter(prisma),
    providers: [
      CredentialsProvider({
        name: "Credentials",
        credentials: {
          email: { label: "Email", type: "text" },
          password: { label: "Password", type: "password" },
        },
        async authorize(credentials) {
          if (!credentials?.email || !credentials?.password) return null;
  
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
          });
  
          if (!user || !user.password) return null;
  
          const isValid = await bcrypt.compare(credentials.password, user.password);
          if (!isValid) return null;
  
          return user;
        },
      }),
    ],
    callbacks: {
      async session({ session, token }) {
        if (token) {
          session.user.id = token.id;
          session.user.email = token.email;
          session.user.role = token.role;
        }
        return session;
      },
      async jwt({ token, user }) {
        if (user) {
          token.id = user.id;
          token.email = user.email!;
          token.role = user.role;
        }
        return token;
      },
    },
    session: {
      strategy: "jwt", // ✅ This is the key fix
    },
    secret: process.env.NEXTAUTH_SECRET,
  });


export { handler as GET, handler as POST };
