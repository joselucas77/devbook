import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import Header from "@/components/app/layout/header";
import Footer from "@/components/app/layout/footer";

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
      <body className={`${inter.className} antialiased bg-black text-white`}>
        <div className="min-h-screen">
          <Header />
          <main className="container mx-auto px-4 py-12">{children}</main>
          <Footer />
        </div>
        <Toaster />
      </body>
    </html>
  );
}
