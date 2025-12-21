import Header from "@/components/app/auth/layout/header";

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto px-4 py-12">{children}</main>
    </div>
  );
}
