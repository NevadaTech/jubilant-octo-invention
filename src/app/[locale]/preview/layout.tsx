import type { ReactNode } from "react";
import { setRequestLocale } from "next-intl/server";
import { PreviewShell } from "@/modules/preview";

interface PreviewLayoutProps {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function PreviewLayout({
  children,
  params,
}: PreviewLayoutProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <PreviewShell>{children}</PreviewShell>;
}
