import { setRequestLocale } from "next-intl/server";
import { ComboForm } from "@/modules/inventory/presentation/components/combos";
import { RequirePermission } from "@/shared/presentation/components/require-permission";
import { PERMISSIONS } from "@/shared/domain/permissions";

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function NewComboPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <RequirePermission permission={PERMISSIONS.COMBOS_CREATE}>
      <ComboForm />
    </RequirePermission>
  );
}
