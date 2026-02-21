import { setRequestLocale } from "next-intl/server";
import { MovementDetail } from "@/modules/inventory/presentation/components/movements/movement-detail";

interface Props {
  params: Promise<{ locale: string; id: string }>;
}

export default async function MovementDetailPage({ params }: Props) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  return <MovementDetail movementId={id} />;
}
