import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AegisSmoke — See danger before it starts",
  description:
    "AI-powered fire intelligence for the places that can't afford a second of uncertainty.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
