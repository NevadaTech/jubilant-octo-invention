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
      phone: dto.phone,
      timezone: dto.timezone,
      language: dto.language,
      jobTitle: dto.jobTitle,
      department: dto.department,
      roles: dto.roles,
      permissions: dto.permissions,
    });
  }
}
