import { setRequestLocale } from "next-intl/server";
import { ReturnFormPage } from "@/modules/returns/presentation/components";
import { RequirePermission } from "@/shared/presentation/components/require-permission";
import { PERMISSIONS } from "@/shared/domain/permissions";

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function NewReturnPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <RequirePermission permission={PERMISSIONS.RETURNS_CREATE}>
      <ReturnFormPage />
    </RequirePermission>
  );
}
