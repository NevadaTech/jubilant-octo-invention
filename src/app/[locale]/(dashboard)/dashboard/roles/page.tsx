import { setRequestLocale } from "next-intl/server";
import { HydrationBoundary } from "@tanstack/react-query";
import { RoleList } from "@/modules/roles/presentation/components";
import { RequirePermission } from "@/shared/presentation/components/require-permission";
import { PERMISSIONS } from "@/shared/domain/permissions";
import {
  createServerQueryClient,
  dehydrateState,
} from "@/shared/infrastructure/prefetch/server-prefetch";
import { serverFetch } from "@/shared/infrastructure/http/server-fetch";
import { roleKeys } from "@/modules/roles/presentation/hooks/role.keys";
import { RoleMapper } from "@/modules/roles/application/mappers/role.mapper";

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function RolesPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const queryClient = createServerQueryClient();
  try {
    await queryClient.prefetchQuery({
      queryKey: roleKeys.lists(),
      queryFn: async () => {
        const res = await serverFetch<{ data: any[] }>("/roles");
        return res.data.map((item: any) => RoleMapper.toDomain(item));
      },
    });
  } catch {
    /* client-side fallback */
  }

  return (
    <HydrationBoundary state={dehydrateState(queryClient)}>
      <RequirePermission permission={PERMISSIONS.ROLES_READ}>
        <RoleList />
      </RequirePermission>
    </HydrationBoundary>
  );
}
