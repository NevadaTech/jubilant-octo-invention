// Domain
export { Role } from "./domain/entities/role.entity";
export type { RoleProps, PermissionProps } from "./domain/entities/role.entity";

// Application - DTOs
export type {
  RoleResponseDto,
  PermissionResponseDto,
  CreateRoleDto,
  UpdateRoleDto,
  AssignPermissionsDto,
  RoleFilters,
} from "./application/dto/role.dto";

// Application - Ports
export type { RoleRepositoryPort } from "./application/ports/role.repository.port";

// Presentation - Hooks
export {
  useRoles,
  useRole,
  usePermissions,
  useRolePermissions,
  useCreateRole,
  useUpdateRole,
  useDeleteRole,
  useAssignPermissions,
} from "./presentation/hooks/use-roles";

// Presentation - Components
export {
  RoleList,
  RoleForm,
  RoleTypeBadge,
  RolePermissionsDialog,
} from "./presentation/components";
