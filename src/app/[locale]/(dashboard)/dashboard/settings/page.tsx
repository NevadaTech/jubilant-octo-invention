import { setRequestLocale } from "next-intl/server";
import { SettingsPage as SettingsPageContent } from "@/modules/settings/presentation/components";

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function SettingsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <SettingsPageContent />;
}
