import { apiClient } from "@/shared/infrastructure/http";
import type { User } from "@/modules/users/domain/entities/user.entity";
import type {
  UserRepositoryPort,
  PaginatedResult,
} from "@/modules/users/application/ports/user.repository.port";
import type {
  UserResponseDto,
  CreateUserDto,
  UpdateUserDto,
  ChangeUserStatusDto,
  AssignRoleDto,
  UserFilters,
} from "@/modules/users/application/dto/user.dto";
import { UserMapper } from "@/modules/users/application/mappers/user.mapper";

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

interface ApiListResponse<T> {
  success: boolean;
  message: string;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  timestamp: string;
}

export class UserApiAdapter implements UserRepositoryPort {
  private readonly basePath = "/users";

  async findAll(filters?: UserFilters): Promise<PaginatedResult<User>> {
    const response = await apiClient.get<ApiListResponse<UserResponseDto>>(
      this.basePath,
      { params: this.buildQueryParams(filters) },
    );

    return {
      data: response.data.data.map(UserMapper.toDomain),
      pagination: response.data.pagination,
    };
  }

  async findById(id: string): Promise<User | null> {
    try {
      const response = await apiClient.get<ApiResponse<UserResponseDto>>(
        `${this.basePath}/${id}`,
      );
      return UserMapper.toDomain(response.data.data);
    } catch (error) {
      if (this.isNotFoundError(error)) return null;
      throw error;
    }
  }

  async create(data: CreateUserDto): Promise<User> {
    const response = await apiClient.post<ApiResponse<UserResponseDto>>(
      this.basePath,
      data,
    );
    return UserMapper.toDomain(response.data.data);
  }

  async update(id: string, data: UpdateUserDto): Promise<User> {
    const response = await apiClient.put<ApiResponse<UserResponseDto>>(
      `${this.basePath}/${id}`,
      data,
    );
    return UserMapper.toDomain(response.data.data);
  }

  async changeStatus(id: string, data: ChangeUserStatusDto): Promise<User> {
    const response = await apiClient.patch<ApiResponse<UserResponseDto>>(
      `${this.basePath}/${id}/status`,
      data,
    );
    return UserMapper.toDomain(response.data.data);
  }

  async assignRole(userId: string, data: AssignRoleDto): Promise<void> {
    await apiClient.post(`${this.basePath}/${userId}/roles`, data);
  }

  async removeRole(userId: string, roleId: string): Promise<void> {
    await apiClient.delete(`${this.basePath}/${userId}/roles/${roleId}`);
  }

  private buildQueryParams(filters?: UserFilters): Record<string, unknown> {
    if (!filters) return {};
    const params: Record<string, unknown> = {};
    if (filters.status?.length) params.status = filters.status.join(",");
    if (filters.search) params.search = filters.search;
    if (filters.page) params.page = filters.page;
    if (filters.limit) params.limit = filters.limit;
    return params;
  }

  private isNotFoundError(error: unknown): boolean {
    return (
      typeof error === "object" &&
      error !== null &&
      "response" in error &&
      typeof (error as { response?: { status?: number } }).response ===
        "object" &&
      (error as { response: { status?: number } }).response?.status === 404
    );
  }
}
