import { setRequestLocale } from "next-intl/server";
import { CategoryFormPage } from "@/modules/inventory/presentation/components/categories";

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function NewCategoryPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <CategoryFormPage />;
}
