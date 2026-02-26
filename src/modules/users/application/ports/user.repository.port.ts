import type { PaginatedResult } from "@/shared/application/dto/pagination.dto";
import type { User } from "@/modules/users/domain/entities/user.entity";
import type {
  CreateUserDto,
  UpdateUserDto,
  ChangeUserStatusDto,
  AssignRoleDto,
  UserFilters,
} from "@/modules/users/application/dto/user.dto";

export type { PaginatedResult };

export interface UserRepositoryPort {
  findAll(filters?: UserFilters): Promise<PaginatedResult<User>>;
  findById(id: string): Promise<User | null>;
  create(data: CreateUserDto): Promise<User>;
  update(id: string, data: UpdateUserDto): Promise<User>;
  changeStatus(id: string, data: ChangeUserStatusDto): Promise<User>;
  assignRole(userId: string, data: AssignRoleDto): Promise<void>;
  removeRole(userId: string, roleId: string): Promise<void>;
}
