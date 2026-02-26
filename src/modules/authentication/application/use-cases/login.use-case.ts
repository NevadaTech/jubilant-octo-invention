import type { UseCase } from "@/shared/application/use-case";
import type {
  AuthRepositoryPort,
  LoginCredentials,
} from "@/modules/authentication/domain/ports/auth-repository.port";
import type { User } from "@/modules/authentication/domain/entities/user";
import type { Tokens } from "@/modules/authentication/domain/value-objects/tokens";

export interface LoginResult {
  user: User;
  tokens: Tokens;
}

export class LoginUseCase implements UseCase<LoginCredentials, LoginResult> {
  constructor(private readonly authRepository: AuthRepositoryPort) {}

  async execute(credentials: LoginCredentials): Promise<LoginResult> {
    return this.authRepository.login(credentials);
  }
}
