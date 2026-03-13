import { setRequestLocale } from "next-intl/server";
import { HydrationBoundary } from "@tanstack/react-query";
import { SettingsPage as SettingsPageContent } from "@/modules/settings/presentation/components";
import {
  createServerQueryClient,
  dehydrateState,
} from "@/shared/infrastructure/prefetch/server-prefetch";
import { serverFetch } from "@/shared/infrastructure/http/server-fetch";
import { profileKeys } from "@/modules/settings/presentation/hooks/profile.keys";
import { alertKeys } from "@/modules/settings/presentation/hooks/alert.keys";

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function SettingsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const queryClient = createServerQueryClient();
  try {
    await Promise.all([
      queryClient.prefetchQuery({
        queryKey: profileKeys.me(),
        queryFn: () => serverFetch("/users/me"),
      }),
      queryClient.prefetchQuery({
        queryKey: alertKeys.config(),
        queryFn: () => serverFetch("/settings/alerts"),
      }),
    ]);
  } catch {
    /* client-side fallback */
  }

  return (
    <HydrationBoundary state={dehydrateState(queryClient)}>
      <SettingsPageContent />
    </HydrationBoundary>
  );
}
