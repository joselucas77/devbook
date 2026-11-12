export function Footer() {
  return (
    <footer className="py-6 border-t border-border/40 text-center text-sm text-muted-foreground">
      <div className="container mx-auto">
        <p>© {new Date().getFullYear()} DevBook. Sua documentação não oficial favorita.</p>
      </div>
    </footer>
  );
}
