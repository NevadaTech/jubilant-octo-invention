import { setRequestLocale } from "next-intl/server";
import { HydrationBoundary } from "@tanstack/react-query";
import { ContactDetail } from "@/modules/contacts/presentation/components";
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

interface Props {
  params: Promise<{ locale: string; id: string }>;
}

export default async function ContactDetailPage({ params }: Props) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const queryClient = createServerQueryClient();
  try {
    await queryClient.prefetchQuery({
      queryKey: contactKeys.detail(id),
      queryFn: async () => {
        const res = await serverFetch<{ data: ContactResponseDto }>(`/contacts/${id}`);
        return ContactMapper.toDomain(res.data);
      },
    });
  } catch {
    /* client-side fallback */
  }

  return (
    <HydrationBoundary state={dehydrateState(queryClient)}>
      <RequirePermission permission={PERMISSIONS.CONTACTS_READ}>
        <ContactDetail contactId={id} />
      </RequirePermission>
    </HydrationBoundary>
  );
}
