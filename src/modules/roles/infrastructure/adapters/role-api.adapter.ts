import { apiClient } from "@/shared/infrastructure/http";
import type { Role, PermissionProps } from "../../domain/entities/role.entity";
import type { RoleRepositoryPort } from "../../application/ports/role.repository.port";
import type {
  RoleResponseDto,
  PermissionResponseDto,
  CreateRoleDto,
  UpdateRoleDto,
  AssignPermissionsDto,
} from "../../application/dto/role.dto";
import { RoleMapper } from "../../application/mappers/role.mapper";

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

export class RoleApiAdapter implements RoleRepositoryPort {
  private readonly basePath = "/roles";

  async findAll(): Promise<Role[]> {
    const response = await apiClient.get<ApiResponse<RoleResponseDto[]>>(
      this.basePath,
    );
    return response.data.data.map(RoleMapper.toDomain);
  }

  async findById(id: string): Promise<Role> {
    const response = await apiClient.get<ApiResponse<RoleResponseDto>>(
      `${this.basePath}/${id}`,
    );
    return RoleMapper.toDomain(response.data.data);
  }

  async create(data: CreateRoleDto): Promise<Role> {
    const response = await apiClient.post<ApiResponse<RoleResponseDto>>(
      this.basePath,
      data,
    );
    return RoleMapper.toDomain(response.data.data);
  }

  async update(id: string, data: UpdateRoleDto): Promise<Role> {
    const response = await apiClient.patch<ApiResponse<RoleResponseDto>>(
      `${this.basePath}/${id}`,
      data,
    );
    return RoleMapper.toDomain(response.data.data);
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete(`${this.basePath}/${id}`);
  }

  async assignPermissions(
    id: string,
    dto: AssignPermissionsDto,
  ): Promise<void> {
    await apiClient.post(`${this.basePath}/${id}/permissions`, dto);
  }

  async getPermissions(): Promise<PermissionProps[]> {
    const response = await apiClient.get<ApiResponse<PermissionResponseDto[]>>(
      `${this.basePath}/permissions`,
    );
    return response.data.data.map(RoleMapper.permissionToDomain);
  }

  async getRolePermissions(roleId: string): Promise<PermissionProps[]> {
    const response = await apiClient.get<ApiResponse<PermissionResponseDto[]>>(
      `${this.basePath}/${roleId}/permissions`,
    );
    return response.data.data.map(RoleMapper.permissionToDomain);
  }
}

export const roleApiAdapter = new RoleApiAdapter();
