import type { UserStatus } from "@/modules/users/domain/entities/user.entity";

export interface UserResponseDto {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  status: UserStatus;
  roles: string[];
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UserListResponseDto {
  data: UserResponseDto[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CreateUserDto {
  email: string;
  username: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface UpdateUserDto {
  email?: string;
  username?: string;
  firstName?: string;
  lastName?: string;
}

export interface ChangeUserStatusDto {
  status: UserStatus;
  reason?: string;
  lockDurationMinutes?: number;
}

export interface AssignRoleDto {
  roleId: string;
}

export interface UserFilters {
  status?: UserStatus;
  search?: string;
  page?: number;
  limit?: number;
}
