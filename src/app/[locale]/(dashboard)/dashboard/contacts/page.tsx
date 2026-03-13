import { getTranslations, setRequestLocale } from "next-intl/server";
import { HydrationBoundary } from "@tanstack/react-query";
import { ContactList } from "@/modules/contacts/presentation/components";
import { RequirePermission } from "@/shared/presentation/components/require-permission";
import { PERMISSIONS } from "@/shared/domain/permissions";
import {
  createServerQueryClient,
  dehydrateState,
} from "@/shared/infrastructure/prefetch/server-prefetch";
import { serverFetch } from "@/shared/infrastructure/http/server-fetch";
import { contactKeys } from "@/modules/contacts/presentation/hooks/contact.keys";
import { ContactMapper } from "@/modules/contacts/application/mappers/contact.mapper";
import type { ContactResponseDto } from "@/modules/contacts/application/dto/contact.dto";
import type { Pagination } from "@/shared/application/dto";

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function ContactsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("contacts");

  const queryClient = createServerQueryClient();
  try {
    await queryClient.prefetchQuery({
      queryKey: contactKeys.list(),
      queryFn: async () => {
        const res = await serverFetch<{
          data: ContactResponseDto[];
          pagination: Pagination;
        }>("/contacts");
        return {
          data: res.data.map((item) => ContactMapper.toDomain(item)),
          pagination: res.pagination,
        };
      },
    });
  } catch {
    /* client-side fallback */
  }

  return (
    <HydrationBoundary state={dehydrateState(queryClient)}>
      <RequirePermission permission={PERMISSIONS.CONTACTS_READ}>
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
            <p className="text-muted-foreground">{t("description")}</p>
          </div>
          <ContactList />
        </div>
      </RequirePermission>
    </HydrationBoundary>
  );
}
