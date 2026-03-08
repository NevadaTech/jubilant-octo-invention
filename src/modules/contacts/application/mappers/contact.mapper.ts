import { Contact } from "@/modules/contacts/domain/entities/contact.entity";
import type { ContactResponseDto } from "@/modules/contacts/application/dto/contact.dto";
import type { ContactType } from "@/modules/contacts/domain/entities/contact.entity";

export class ContactMapper {
  static toDomain(dto: ContactResponseDto): Contact {
    return Contact.create({
      id: dto.id,
      name: dto.name,
      identification: dto.identification,
      type: (dto.type as ContactType) || "CUSTOMER",
      address: dto.address ?? null,
      notes: dto.notes ?? null,
      isActive: dto.isActive,
      salesCount: dto.salesCount ?? 0,
      createdAt: new Date(dto.createdAt),
      updatedAt: new Date(dto.updatedAt),
    });
  }
}
