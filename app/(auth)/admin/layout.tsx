export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen">
      <main className="container mx-auto px-4 py-12">{children}</main>
    </div>
  );
}
