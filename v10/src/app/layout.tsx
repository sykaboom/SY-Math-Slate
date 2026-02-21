import type { Metadata } from "next";
import "./globals.css";
import "../features/editor/canvas/styles/content-layer.css";
import "../features/editor/canvas/styles/mathjax.css";
import "../features/editor/animation/styles/rich-text-animation.css";
import "../features/chrome/layout/styles/prompter.css";
import { ThemeProvider } from "@features/chrome/theming-ui/ThemeProvider";

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
      <body className="antialiased">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
