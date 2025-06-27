import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "Matrix Apps",
  description: "Empresa de soluções em apps",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
