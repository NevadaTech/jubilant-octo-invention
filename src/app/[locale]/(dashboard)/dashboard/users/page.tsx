import { setRequestLocale } from "next-intl/server";
import { UserList } from "@/modules/users/presentation/components";
import { RequirePermission } from "@/shared/presentation/components/require-permission";
import { PERMISSIONS } from "@/shared/domain/permissions";

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function UsersPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <RequirePermission permission={PERMISSIONS.USERS_READ}>
      <UserList />
    </RequirePermission>
  );
}
