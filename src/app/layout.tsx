import type { Metadata } from "next";
import { Navbar } from "@/components/ui/navbar";
import "./globals.css";

export const metadata: Metadata = {
  title: "DevRoast",
  description: "DevRoast",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="bg-bg-page text-text-primary">
        <Navbar />
        {children}
      </body>
    </html>
  );
}
