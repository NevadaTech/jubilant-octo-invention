import { setRequestLocale } from "next-intl/server";
import { Card, CardContent } from "@/ui/components/card";
import { ForgotPasswordForm } from "@/modules/authentication/presentation/components/forgot-password-form";

interface ForgotPasswordPageProps {
  params: Promise<{ locale: string }>;
}

export default async function ForgotPasswordPage({
  params,
}: ForgotPasswordPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <Card>
      <CardContent className="pt-6">
        <ForgotPasswordForm />
      </CardContent>
    </Card>
  );
}
