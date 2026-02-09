import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SY Math Slate (v10)",
  description: "Replatformed Math Slate app (Next.js + Prisma)",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="dark">
      <body className="antialiased">{children}</body>
    </html>
  );
}
