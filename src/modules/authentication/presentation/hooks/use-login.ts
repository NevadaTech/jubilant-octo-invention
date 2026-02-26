"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "@/i18n/navigation";
import { useAuthStore } from "@/modules/authentication/presentation/store/auth.store";
import type { LoginDto } from "@/modules/authentication/application/dto/login.dto";

export function useLogin() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  const clearError = useAuthStore((state) => state.clearError);

  const mutation = useMutation({
    mutationFn: async (credentials: LoginDto) => {
      clearError();
      await login(credentials);
    },
    onSuccess: () => {
      router.push("/dashboard");
    },
  });

  return {
    login: mutation.mutate,
    loginAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error,
    isError: mutation.isError,
    reset: mutation.reset,
  };
}
