import { setRequestLocale } from "next-intl/server";
import { CategoryFormPage } from "@/modules/inventory/presentation/components/categories";

interface Props {
  params: Promise<{ locale: string; id: string }>;
}

export default async function EditCategoryPage({ params }: Props) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  return <CategoryFormPage categoryId={id} />;
}
