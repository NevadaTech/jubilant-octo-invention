import { setRequestLocale } from "next-intl/server";
import { HydrationBoundary } from "@tanstack/react-query";
import {
  createServerQueryClient,
  dehydrateState,
} from "@/shared/infrastructure/prefetch/server-prefetch";
import { serverFetch } from "@/shared/infrastructure/http/server-fetch";
import { productKeys } from "@/modules/inventory/presentation/hooks/product.keys";
import { warehouseKeys } from "@/modules/inventory/presentation/hooks/warehouse.keys";
import { contactKeys } from "@/modules/contacts/presentation/hooks/contact.keys";
import { ProductMapper } from "@/modules/inventory/application/mappers/product.mapper";
import { mapApiProductToDto } from "@/modules/inventory/infrastructure/adapters/product-api.adapter";
import { WarehouseMapper } from "@/modules/inventory/application/mappers/warehouse.mapper";
import { ContactMapper } from "@/modules/contacts/application/mappers/contact.mapper";
import { SaleFormPage } from "@/modules/sales/presentation/components";
import { RequirePermission } from "@/shared/presentation/components/require-permission";
import { PERMISSIONS } from "@/shared/domain/permissions";

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function NewSalePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const queryClient = createServerQueryClient();
  try {
    await Promise.all([
      queryClient.prefetchQuery({
        queryKey: productKeys.list(),
        queryFn: async () => {
          const res = await serverFetch<{ data: any[]; pagination: any }>(
            "/inventory/products",
          );
          return {
            data: res.data.map((item: any) =>
              ProductMapper.toDomain(mapApiProductToDto(item)),
            ),
            pagination: res.pagination,
          };
        },
      }),
      queryClient.prefetchQuery({
        queryKey: warehouseKeys.list(),
        queryFn: async () => {
          const res = await serverFetch<{ data: any[]; pagination: any }>(
            "/inventory/warehouses",
          );
          return {
            data: res.data.map((item: any) => WarehouseMapper.toDomain(item)),
            pagination: res.pagination,
          };
        },
      }),
      queryClient.prefetchQuery({
        queryKey: contactKeys.list(),
        queryFn: async () => {
          const res = await serverFetch<{ data: any[]; pagination: any }>(
            "/contacts",
          );
          return {
            data: res.data.map((item: any) => ContactMapper.toDomain(item)),
            pagination: res.pagination,
          };
        },
      }),
    ]);
  } catch {
    /* client-side fallback */
  }

  return (
    <HydrationBoundary state={dehydrateState(queryClient)}>
      <RequirePermission permission={PERMISSIONS.SALES_CREATE}>
        <SaleFormPage />
      </RequirePermission>
    </HydrationBoundary>
  );
}
