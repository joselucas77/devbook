import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { AppSidebar } from "@/components/layout/sidebar";
import { SiteHeader } from "@/components/layout/site-header";
import { BottomNavigation } from "@/components/layout/bottom-navigation";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";

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
    <SidebarProvider defaultOpen={true}>
      <AppSidebar variant="inset" />
      <SidebarInset className="bg-background min-h-screen flex flex-col">
        <SiteHeader
          user={{
            name: user.name,
            email: user.email,
            role: user.role,
          }}
        />
        <div className="flex flex-1 flex-col pb-24 md:pb-6 px-4 md:px-8 py-6">
          {children}
        </div>
        <BottomNavigation />
      </SidebarInset>
    </SidebarProvider>
  );
}
