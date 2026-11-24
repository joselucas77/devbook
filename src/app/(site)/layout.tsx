import { HeaderSite } from "@/components/layout/header-site";
import { Footer } from "@/components/layout/footer";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let user = null;
  try {
    user = await getCurrentUser();
  } catch {
    user = null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground overflow-x-clip">
      <HeaderSite
        user={
          user
            ? {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                image: user.image,
              }
            : null
        }
      />
      <main className="container mx-auto px-4 pt-6 sm:pt-8 md:pt-10 pb-4 md:pb-6 flex-1 w-full max-w-full min-w-0">
        {children}
      </main>
      <Footer />
    </div>
  );
}
