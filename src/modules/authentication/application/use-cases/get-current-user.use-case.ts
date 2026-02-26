import type { UseCase } from "@/shared/application/use-case";
import type { AuthRepositoryPort } from "@/modules/authentication/domain/ports/auth-repository.port";
import type { User } from "@/modules/authentication/domain/entities/user";

export class GetCurrentUserUseCase implements UseCase<void, User | null> {
  constructor(private readonly authRepository: AuthRepositoryPort) {}

  async execute(): Promise<User | null> {
    return this.authRepository.getCurrentUser();
  }
}
