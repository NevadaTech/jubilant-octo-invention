import { setRequestLocale } from "next-intl/server";
import { ForceChangePasswordForm } from "@/modules/authentication/presentation/components/force-change-password-form";

interface ChangePasswordPageProps {
  params: Promise<{ locale: string }>;
}

export default async function ChangePasswordPage({
  params,
}: ChangePasswordPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <ForceChangePasswordForm />;
}
