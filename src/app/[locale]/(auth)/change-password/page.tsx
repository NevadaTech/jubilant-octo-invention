import { getTranslations, setRequestLocale } from "next-intl/server";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/ui/components/card";
import { ForceChangePasswordForm } from "@/modules/authentication/presentation/components/force-change-password-form";

interface ChangePasswordPageProps {
  params: Promise<{ locale: string }>;
}

export default async function ChangePasswordPage({
  params,
}: ChangePasswordPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("auth.forceChangePassword");

  return (
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl">{t("title")}</CardTitle>
        <CardDescription>{t("description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <ForceChangePasswordForm />
      </CardContent>
    </Card>
  );
}
