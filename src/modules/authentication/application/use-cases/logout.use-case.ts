import type { UseCase } from "@/shared/application/use-case";
import type { AuthRepositoryPort } from "@/modules/authentication/domain/ports/auth-repository.port";

export class LogoutUseCase implements UseCase<void, void> {
  constructor(private readonly authRepository: AuthRepositoryPort) {}

  async execute(): Promise<void> {
    return this.authRepository.logout();
  }
}
