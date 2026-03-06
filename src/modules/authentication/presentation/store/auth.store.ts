import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { User } from "@/modules/authentication/domain/entities/user";
import type { LoginCredentials } from "@/modules/authentication/domain/ports/auth-repository.port";
import { getContainer } from "@/config/di/container";
import { TokenService } from "@/modules/authentication/infrastructure/services/token.service";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isHydrated: boolean;
  error: string | null;
}

interface AuthActions {
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  forceLogout: () => void;
  hydrate: () => Promise<void>;
  setHydrated: (hydrated: boolean) => void;
  clearError: () => void;
}

type AuthStore = AuthState & AuthActions;

const authRepository = getContainer().authRepository;

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, _get) => ({
      // State
      user: null,
      isAuthenticated: false,
      isLoading: false,
      isHydrated: false,
      error: null,

      // Actions
      login: async (credentials: LoginCredentials) => {
        set({ isLoading: true, error: null });

        try {
          const { user } = await authRepository.login(credentials);

          set({
            user,
            isAuthenticated: true,
            isHydrated: true,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "Login failed";
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: message,
          });
          throw error;
        }
      },

      logout: async () => {
        set({ isLoading: true });

        try {
          await authRepository.logout();
        } finally {
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        }
      },

      forceLogout: () => {
        // Immediate cleanup without backend call (session already expired)
        TokenService.clearSession();
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
      },

      hydrate: async () => {
        const hasSession = TokenService.hasValidSession();

        if (!hasSession) {
          set({ isHydrated: true, isAuthenticated: false, user: null });
          return;
        }

        set({ isLoading: true });

        try {
          // Check if token is about to expire and refresh via BFF
          if (TokenService.isTokenAboutToExpire()) {
            await authRepository.refreshToken();
          }

          const user = await authRepository.getCurrentUser();

          if (user) {
            set({
              user,
              isAuthenticated: true,
              isLoading: false,
              isHydrated: true,
            });
          } else {
            TokenService.clearSession();
            set({
              user: null,
              isAuthenticated: false,
              isLoading: false,
              isHydrated: true,
            });
          }
        } catch {
          TokenService.clearSession();
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            isHydrated: true,
          });
        }
      },

      setHydrated: (hydrated: boolean) => {
        set({ isHydrated: hydrated });
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: "nevada-auth-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        // Only persist minimal data, tokens are handled by TokenService
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.setHydrated(true);
        }
      },
    },
  ),
);
