import { User } from "@/modules/authentication/domain/entities/user";
import type { LoginResponseDto } from "@/modules/authentication/application/dto/login.dto";

type UserDto = LoginResponseDto["data"]["user"];

export class UserMapper {
  static toDomain(dto: UserDto): User {
    return User.create({
      id: dto.id,
      email: dto.email,
      username: dto.username,
      firstName: dto.firstName,
      lastName: dto.lastName,
      roles: dto.roles,
      permissions: dto.permissions,
    });
  }
}
