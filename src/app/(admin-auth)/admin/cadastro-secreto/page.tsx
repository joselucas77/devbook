import { AdminRegisterForm } from "@/components/admin/admin-register-form";

export const metadata = {
  title: "Registro Secreto de Administrador | DevBook",
  description: "Criação de conta administrativa restrita",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminCadastroSecretoPage() {
  return (
    <div className="flex min-h-[85vh] w-full items-center justify-center p-4 py-8 md:py-14">
      <div className="w-full max-w-md">
        <AdminRegisterForm />
      </div>
    </div>
  );
}
