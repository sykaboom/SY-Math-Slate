import type { Metadata } from "next";
import "./globals.css";
import "../features/canvas/styles/content-layer.css";
import "../features/canvas/styles/mathjax.css";
import "../features/animation/styles/rich-text-animation.css";
import "../features/layout/styles/prompter.css";

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
