import { getTranslations, setRequestLocale } from "next-intl/server";
import { CategoryList } from "@/modules/inventory/presentation/components/categories";

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function CategoriesPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("inventory.categories");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
          {t("title")}
        </h1>
        <p className="text-neutral-500 dark:text-neutral-400">
          {t("description")}
        </p>
      </div>
      <CategoryList />
    </div>
  );
}
