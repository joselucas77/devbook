export default function Footer() {
  return (
    <footer className="border-t border-gray-800 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <p>
            © {new Date().getFullYear()} DevBook. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
