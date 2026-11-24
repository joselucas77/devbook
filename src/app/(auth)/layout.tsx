import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { SiteHeader } from "@/components/layout/site-header";

export const dynamic = "force-dynamic";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/admin/login");
  }

  if (user.role !== "ADMIN" && user.role !== "EDITOR") {
    redirect("/tecnologias");
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground overflow-x-clip">
      <SiteHeader
        user={{
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          image: user.image,
        }}
      />
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-12">
        {children}
      </main>
    </div>
  );
}
