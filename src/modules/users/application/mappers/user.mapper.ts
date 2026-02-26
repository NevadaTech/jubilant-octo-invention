import { User } from "@/modules/users/domain/entities/user.entity";
import type { UserResponseDto } from "@/modules/users/application/dto/user.dto";

export class UserMapper {
  static toDomain(dto: UserResponseDto): User {
    return User.create({
      id: dto.id,
      email: dto.email,
      username: dto.username,
      firstName: dto.firstName,
      lastName: dto.lastName,
      status: dto.status,
      roles: dto.roles,
      lastLoginAt: dto.lastLoginAt ? new Date(dto.lastLoginAt) : null,
      createdAt: new Date(dto.createdAt),
      updatedAt: new Date(dto.updatedAt),
    });
  }
}
