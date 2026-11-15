import { HeaderSite } from "@/components/layout/header-site";
import { Footer } from "@/components/layout/footer";

export const dynamic = "force-dynamic";

export default function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground overflow-x-clip">
      <HeaderSite />
      <main className="container mx-auto px-4 pt-6 sm:pt-8 md:pt-10 pb-4 md:pb-6 flex-1 w-full max-w-full min-w-0">
        {children}
      </main>
      <Footer />
    </div>
  );
}
