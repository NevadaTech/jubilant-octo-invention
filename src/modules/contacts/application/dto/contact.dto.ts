import type { ContactType } from "@/modules/contacts/domain/entities/contact.entity";

export interface ContactResponseDto {
  id: string;
  name: string;
  identification: string;
  type: ContactType;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  notes?: string | null;
  isActive: boolean;
  salesCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ContactListResponseDto {
  success: boolean;
  message: string;
  data: ContactResponseDto[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  timestamp: string;
}

export interface ContactDetailResponseDto {
  success: boolean;
  message: string;
  data: ContactResponseDto;
  timestamp: string;
}

export interface CreateContactDto {
  name: string;
  identification: string;
  type?: ContactType;
  email?: string;
  phone?: string;
  address?: string;
  notes?: string;
}

export interface UpdateContactDto {
  name?: string;
  identification?: string;
  type?: ContactType;
  email?: string;
  phone?: string;
  address?: string;
  notes?: string;
  isActive?: boolean;
}

export interface ContactFilters {
  search?: string;
  type?: ContactType;
  types?: ContactType[];
  isActive?: boolean;
  statuses?: string[];
  sortBy?:
    | "name"
    | "identification"
    | "type"
    | "isActive"
    | "createdAt"
    | "updatedAt";
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}
