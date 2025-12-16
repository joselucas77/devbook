import { Linkedin, Github } from "lucide-react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-gray-800 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <Link href="/" className="text-xl font-bold tracking-tighter">
            Dev<span className="text-purple-500">Book</span>
          </Link>
          <p className="text-gray-400 text-sm mt-4 mb-6">
            Fique por dentro das últimas novidades em desenvolvimento web,
            tecnologias e tendências do mercado. Junte-se à nossa comunidade e
            impulsione sua carreira!
          </p>
          <div className="flex justify-center space-x-4">
            <Link
              href="https://github.com/joselucas77/devbook"
              className="text-gray-400 hover:text-white"
            >
              <Github className="h-5 w-5" />
            </Link>
            <Link
              href="https://www.linkedin.com/in/jose-lucas-dev"
              className="text-gray-400 hover:text-white"
            >
              <Linkedin className="h-5 w-5" />
            </Link>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-6 text-sm text-gray-400">
            <p>
              © {new Date().getFullYear()} DevBook. Todos os direitos
              reservados.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
