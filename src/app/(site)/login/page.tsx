import { LoginForm } from "@/components/site/login-form";

export const metadata = {
  title: "Entrar | DevBook",
  description: "Acesse a área administrativa do DevBook",
};

export default function LoginPage() {
  return (
    <div className="flex min-h-[75vh] w-full items-center justify-center p-4 py-8 md:py-14">
      <div className="w-full max-w-md">
        <LoginForm />
      </div>
    </div>
  );
}
