import { setRequestLocale } from "next-intl/server";
import { HydrationBoundary } from "@tanstack/react-query";
import { UserList } from "@/modules/users/presentation/components";
import { RequirePermission } from "@/shared/presentation/components/require-permission";
import { PERMISSIONS } from "@/shared/domain/permissions";
import {
  createServerQueryClient,
  dehydrateState,
} from "@/shared/infrastructure/prefetch/server-prefetch";
import { serverFetch } from "@/shared/infrastructure/http/server-fetch";
import { userKeys } from "@/modules/users/presentation/hooks/user.keys";
import { UserMapper } from "@/modules/users/application/mappers/user.mapper";
import type { UserResponseDto } from "@/modules/users/application/dto/user.dto";
import type { Pagination } from "@/shared/application/dto";

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function UsersPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const queryClient = createServerQueryClient();
  try {
    await queryClient.prefetchQuery({
      queryKey: userKeys.list(),
      queryFn: async () => {
        const res = await serverFetch<{ data: UserResponseDto[]; pagination: Pagination }>(
          "/users",
        );
        return {
          data: res.data.map((item) => UserMapper.toDomain(item)),
          pagination: res.pagination,
        };
      },
    });
  } catch {
    /* client-side fallback */
  }

  return (
    <HydrationBoundary state={dehydrateState(queryClient)}>
      <RequirePermission permission={PERMISSIONS.USERS_READ}>
        <UserList />
      </RequirePermission>
    </HydrationBoundary>
  );
}
