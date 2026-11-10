import { setRequestLocale } from "next-intl/server";
import { CompanyList } from "@/modules/companies/presentation/components";
import { RequirePermission } from "@/shared/presentation/components/require-permission";
import { PERMISSIONS } from "@/shared/domain/permissions";

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function CompaniesPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <RequirePermission permission={PERMISSIONS.COMPANIES_READ}>
      <CompanyList />
    </RequirePermission>
  );
}
