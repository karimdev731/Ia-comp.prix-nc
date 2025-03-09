"use client";

import { SessionProvider } from "next-auth/react";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <html lang="fr">
        <body>{children}</body>
      </html>
    </SessionProvider>
  );
}
