import { setRequestLocale } from "next-intl/server";
import { ContactFormPage } from "@/modules/contacts/presentation/components";
import { RequirePermission } from "@/shared/presentation/components/require-permission";
import { PERMISSIONS } from "@/shared/domain/permissions";

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function NewContactPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <RequirePermission permission={PERMISSIONS.CONTACTS_CREATE}>
      <ContactFormPage mode="create" />
    </RequirePermission>
  );
}
