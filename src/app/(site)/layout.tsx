import { HeaderSite } from "@/components/layout/header-site";
import { Footer } from "@/components/layout/footer";

export const dynamic = "force-dynamic";

export default function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <HeaderSite />
      <main className="container mx-auto px-4 py-8 md:py-12 flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}
