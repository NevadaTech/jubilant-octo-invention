import { setRequestLocale } from "next-intl/server";
import { ContactDetail } from "@/modules/contacts/presentation/components";
import { RequirePermission } from "@/shared/presentation/components/require-permission";
import { PERMISSIONS } from "@/shared/domain/permissions";

interface Props {
  params: Promise<{ locale: string; id: string }>;
}

export default async function ContactDetailPage({ params }: Props) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  return (
    <RequirePermission permission={PERMISSIONS.CONTACTS_READ}>
      <ContactDetail contactId={id} />
    </RequirePermission>
  );
}
