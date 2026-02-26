import type {
  Role,
  PermissionProps,
} from "@/modules/roles/domain/entities/role.entity";
import type {
  CreateRoleDto,
  UpdateRoleDto,
  AssignPermissionsDto,
} from "@/modules/roles/application/dto/role.dto";

export interface RoleRepositoryPort {
  findAll(): Promise<Role[]>;
  findById(id: string): Promise<Role>;
  create(dto: CreateRoleDto): Promise<Role>;
  update(id: string, dto: UpdateRoleDto): Promise<Role>;
  delete(id: string): Promise<void>;
  assignPermissions(id: string, dto: AssignPermissionsDto): Promise<void>;
  getPermissions(): Promise<PermissionProps[]>;
  getRolePermissions(roleId: string): Promise<PermissionProps[]>;
}
