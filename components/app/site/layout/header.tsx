"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { usePathname, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import ThemeToggle from "./theme-toggle";

const Links = [
  { href: "/", label: "Principal" },
  { href: "/tecnologias", label: "Tecnologias" },
  { href: "/sobre", label: "Sobre" },
];

export default function Header() {
  const currentPath = usePathname();
  const router = useRouter();

  const showNav = Links.some((link) => link.href === currentPath);

  return (
    <header className=" py-4 border-b border-gray-800">
      <div className="container mx-auto flex items-center justify-between">
        <Link href="/" className="text-xl font-bold tracking-tighter">
          Dev<span className="text-blue-500">Book</span>
        </Link>
        {showNav && (
          // <div className="flex items-center space-x-6">
          //   <Button
          //     className="bg-blue-600 text-white hover:bg-blue-600/90 transition-colors"
          //     asChild>
          //     <Link href="/login">Entrar</Link>
          //   </Button>
          // </div>
          <ThemeToggle />
        )}
        {!showNav && (
          <div className="flex items-center justify-center space-x-6">
            <Button
              variant="link"
              onClick={() => router.back()}
              className="text-gray-400 hover:text-white">
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}
