import { AdminLoginForm } from "@/components/admin/admin-login-form";

export const metadata = {
  title: "Login de Administrador | DevBook",
  description: "Acesso restrito ao painel de administração do DevBook",
};

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-[85vh] w-full items-center justify-center p-4 py-8 md:py-14">
      <div className="w-full max-w-md">
        <AdminLoginForm />
      </div>
    </div>
  );
}
