import { setRequestLocale } from "next-intl/server";
import { RoleList } from "@/modules/roles/presentation/components";
import { RequirePermission } from "@/shared/presentation/components/require-permission";
import { PERMISSIONS } from "@/shared/domain/permissions";

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function RolesPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <RequirePermission permission={PERMISSIONS.ROLES_READ}>
      <RoleList />
    </RequirePermission>
  );
}
