import { Role } from "@/modules/roles/domain/entities/role.entity";
import type { PermissionProps } from "@/modules/roles/domain/entities/role.entity";
import type {
  RoleResponseDto,
  PermissionResponseDto,
} from "@/modules/roles/application/dto/role.dto";

export class RoleMapper {
  static toDomain(dto: RoleResponseDto): Role {
    return new Role({
      id: dto.id,
      name: dto.name,
      description: dto.description,
      isActive: dto.isActive,
      isSystem: dto.isSystem,
      permissions: dto.permissions?.map(RoleMapper.permissionToDomain) ?? [],
      createdAt: new Date(dto.createdAt),
      updatedAt: new Date(dto.updatedAt),
    });
  }

  static permissionToDomain(dto: PermissionResponseDto): PermissionProps {
    return {
      id: dto.id,
      name: dto.name,
      description: dto.description,
      module: dto.module,
      action: dto.action,
    };
  }
}
