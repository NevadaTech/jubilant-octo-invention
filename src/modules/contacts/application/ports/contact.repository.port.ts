import type { Contact } from "@/modules/contacts/domain/entities/contact.entity";
import type {
  ContactFilters,
  CreateContactDto,
  UpdateContactDto,
} from "@/modules/contacts/application/dto/contact.dto";

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface ContactRepositoryPort {
  findAll(filters?: ContactFilters): Promise<PaginatedResult<Contact>>;
  findById(id: string): Promise<Contact | null>;
  create(data: CreateContactDto): Promise<Contact>;
  update(id: string, data: UpdateContactDto): Promise<Contact>;
  delete(id: string): Promise<void>;
}
