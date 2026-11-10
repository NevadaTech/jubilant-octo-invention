import { setRequestLocale } from "next-intl/server";
import { AuditLogList } from "@/modules/audit/presentation/components";
import { RequirePermission } from "@/shared/presentation/components/require-permission";
import { PERMISSIONS } from "@/shared/domain/permissions";

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function AuditPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <RequirePermission permission={PERMISSIONS.AUDIT_READ}>
      <AuditLogList />
    </RequirePermission>
  );
}
