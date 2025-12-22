"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { usePathname, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

const Links = [
  { href: "/", label: "Principal" },
  { href: "/tecnologias", label: "Tecnologias" },
  { href: "/sobre", label: "Sobre" },
];

export default function Header() {
  const currentPath = usePathname();
  const router = useRouter();

  // const isActive = (path: string) => currentPath === path;

  const showNav = Links.some((link) => link.href === currentPath);

  return (
    <header className=" py-4 border-b border-gray-800">
      <div className="container mx-auto flex items-center justify-between">
        <Link href="/" className="text-xl font-bold tracking-tighter">
          Dev<span className="text-blue-500">Book</span>
        </Link>
        {/* {showNav && (
          <nav className="hidden md:flex items-center space-x-6 text-sm">
            {Links.map(({ href, label }) => (
              <Link
                key={label}
                href={href}
                className={`transition-colors ${
                  isActive(href)
                    ? "text-white border-b-2 pb-1 border-blue-500"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                {label}
              </Link>
            ))}
          </nav>
        )} */}
        {showNav && (
          <div className="flex items-center space-x-6">
            <Button
              className="bg-blue-600 text-white hover:bg-blue-600/90 transition-colors"
              asChild
            >
              <Link href="/login">Entrar</Link>
            </Button>
          </div>
        )}
        {!showNav && (
          <div className="flex items-center justify-center space-x-6">
            <Button
              variant="link"
              onClick={() => router.back()}
              className="text-gray-400 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}
