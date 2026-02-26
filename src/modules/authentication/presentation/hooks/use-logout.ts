"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "@/i18n/navigation";
import { useAuthStore } from "@/modules/authentication/presentation/store/auth.store";

export function useLogout() {
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);

  const mutation = useMutation({
    mutationFn: async () => {
      await logout();
    },
    onSuccess: () => {
      router.push("/login");
    },
  });

  return {
    logout: mutation.mutate,
    logoutAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
  };
}
