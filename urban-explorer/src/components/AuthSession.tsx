'use client';

import { SessionProvider } from 'next-auth/react';
import { ReactNode } from 'react';
import NavBar from "./NavBar";

export default function AuthSession({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <NavBar />
      {children}
    </SessionProvider>
  );
}