"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";
import { Input } from "@/components/ui/input";

const Links = [
  { href: "/", label: "Principal" },
  { href: "/tecnologias", label: "Tecnologias" },
  { href: "/sobre", label: "Sobre" },
];

export default function Header() {
  const currentPath = usePathname();

  const isActive = (path: string) => currentPath === path;

  const showNav = Links.some((link) => link.href === currentPath);

  return (
    <header className="container mx-auto py-6">
      <div className="flex items-center justify-between mx-8">
        <Link href="/" className="text-xl font-bold tracking-tighter">
          Dev<span className="text-blue-500">Book</span>
        </Link>
        {showNav && (
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
        )}
        <div className="flex items-center space-x-6">
          <Input type="text" placeholder="Buscar..." className="max-w-sm" />
          <Button className="bg-blue-600 text-white hover:bg-blue-600/90 transition-colors">
            Login
          </Button>
        </div>
      </div>
    </header>
  );
}
