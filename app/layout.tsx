import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "DevBook",
  description: "Sua documentação não oficial favorita.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="dark">
      <body
        className={`${inter.className} antialiased bg-black text-white no-scrollbar`}
      >
        {children}
        <Toaster position="top-center" />
      </body>
    </html>
  );
}
