import { User } from "@/modules/authentication/domain/entities/user";
import { Tokens } from "@/modules/authentication/domain/value-objects/tokens";

export interface LoginCredentials {
  organizationSlug: string;
  email: string;
  password: string;
}

export interface AuthRepositoryPort {
  login(credentials: LoginCredentials): Promise<{ user: User; tokens: Tokens }>;
  logout(): Promise<void>;
  getCurrentUser(): Promise<User | null>;
  refreshToken(refreshToken: string): Promise<Tokens>;
}
