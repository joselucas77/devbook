import { RegisterForm } from "@/components/site/register-form";

export const metadata = {
  title: "Criar Conta",
  description: "Crie sua conta no DevBook",
};

export default function RegisterPage() {
  return (
    <div className="flex min-h-[75vh] w-full items-center justify-center p-4 py-8 md:py-14">
      <div className="w-full max-w-md">
        <RegisterForm />
      </div>
    </div>
  );
}
