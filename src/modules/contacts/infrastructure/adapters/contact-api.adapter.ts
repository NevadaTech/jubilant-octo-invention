import { apiClient } from "@/shared/infrastructure/http";
import type { Contact } from "@/modules/contacts/domain/entities/contact.entity";
import type {
  ContactRepositoryPort,
  PaginatedResult,
} from "@/modules/contacts/application/ports/contact.repository.port";
import type {
  ContactListResponseDto,
  ContactDetailResponseDto,
  CreateContactDto,
  UpdateContactDto,
  ContactFilters,
} from "@/modules/contacts/application/dto/contact.dto";
import { ContactMapper } from "@/modules/contacts/application/mappers/contact.mapper";

export class ContactApiAdapter implements ContactRepositoryPort {
  private readonly basePath = "/contacts";

  async findAll(filters?: ContactFilters): Promise<PaginatedResult<Contact>> {
    const response = await apiClient.get<ContactListResponseDto>(
      this.basePath,
      {
        params: this.buildQueryParams(filters),
      },
    );

    return {
      data: response.data.data.map(ContactMapper.toDomain),
      pagination: response.data.pagination,
    };
  }

  async findById(id: string): Promise<Contact | null> {
    try {
      const response = await apiClient.get<ContactDetailResponseDto>(
        `${this.basePath}/${id}`,
      );
      return ContactMapper.toDomain(response.data.data);
    } catch (error) {
      if (this.isNotFoundError(error)) {
        return null;
      }
      throw error;
    }
  }

  async create(data: CreateContactDto): Promise<Contact> {
    const response = await apiClient.post<ContactDetailResponseDto>(
      this.basePath,
      data,
    );
    return ContactMapper.toDomain(response.data.data);
  }

  async update(id: string, data: UpdateContactDto): Promise<Contact> {
    const response = await apiClient.put<ContactDetailResponseDto>(
      `${this.basePath}/${id}`,
      data,
    );
    return ContactMapper.toDomain(response.data.data);
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete(`${this.basePath}/${id}`);
  }

  private buildQueryParams(filters?: ContactFilters): Record<string, unknown> {
    if (!filters) return {};

    const params: Record<string, unknown> = {};

    if (filters.search) params.search = filters.search;
    if (filters.type) params.type = filters.type;
    if (filters.isActive !== undefined) params.isActive = filters.isActive;
    if (filters.page) params.page = filters.page;
    if (filters.limit) params.limit = filters.limit;
    if (filters.sortBy) params.sortBy = filters.sortBy;
    if (filters.sortOrder) params.sortOrder = filters.sortOrder;

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
