import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "API Crime Scene",
  description: "A privacy-first browser network forensics tool."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
