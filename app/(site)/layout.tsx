import Header from "@/components/app/site/layout/header";
import Footer from "@/components/app/site/layout/footer";

export default function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto px-4 py-12">{children}</main>
      <Footer />
    </div>
  );
}
