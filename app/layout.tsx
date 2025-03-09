import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Prix NC AI",
  description: "Dev.HNC",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
