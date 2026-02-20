import { setRequestLocale } from "next-intl/server";
import { MovementFormPage } from "@/modules/inventory/presentation/components";

interface Props {
  params: Promise<{ locale: string; id: string }>;
}

export default async function EditMovementPage({ params }: Props) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  return <MovementFormPage movementId={id} />;
}
