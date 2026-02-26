// Domain
export { User } from "./domain/entities/user.entity";
export type { UserProps, UserStatus } from "./domain/entities/user.entity";

// Application - DTOs
export type {
  UserResponseDto,
  UserListResponseDto,
  CreateUserDto,
  UpdateUserDto,
  ChangeUserStatusDto,
  AssignRoleDto,
  UserFilters,
} from "./application/dto/user.dto";

// Application - Ports
export type { UserRepositoryPort } from "./application/ports/user.repository.port";

// Presentation - Hooks
export {
  useUsers,
  useUser,
  useCreateUser,
  useUpdateUser,
  useChangeUserStatus,
  useAssignRole,
  useRemoveRole,
} from "./presentation/hooks/use-users";

// Presentation - Components
export {
  UserList,
  UserForm,
  UserRolesDialog,
  UserStatusBadge,
} from "./presentation/components";
