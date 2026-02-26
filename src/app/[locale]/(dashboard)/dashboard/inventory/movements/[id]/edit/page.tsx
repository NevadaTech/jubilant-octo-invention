import { Suspense } from "react";
import { setRequestLocale } from "next-intl/server";
import { MovementFormPage } from "@/modules/inventory/presentation/components";
import { Skeleton } from "@/ui/components/skeleton";
import { RequirePermission } from "@/shared/presentation/components/require-permission";
import { PERMISSIONS } from "@/shared/domain/permissions";

interface Props {
  params: Promise<{ locale: string; id: string }>;
}

export default async function EditMovementPage({ params }: Props) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  return (
    <RequirePermission permission={PERMISSIONS.INVENTORY_ENTRY}>
      <Suspense
        fallback={
          <div className="space-y-6">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-64 w-full" />
          </div>
        }
      >
        <MovementFormPage movementId={id} />
      </Suspense>
    </RequirePermission>
  );
}
