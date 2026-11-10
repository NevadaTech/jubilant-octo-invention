import { setRequestLocale } from "next-intl/server";
import { LoginForm } from "@/modules/authentication/presentation/components/login-form";

interface LoginPageProps {
  params: Promise<{ locale: string }>;
}

export default async function LoginPage({ params }: LoginPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <LoginForm />;
}
