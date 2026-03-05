import { Company } from "@/modules/companies/domain/entities/company.entity";
import type { CompanyResponseDto } from "@/modules/companies/application/dto/company.dto";

export class CompanyMapper {
  static toDomain(dto: CompanyResponseDto): Company {
    return Company.create({
      id: dto.id,
      name: dto.name,
      code: dto.code,
      description: typeof dto.description === "string" ? dto.description : null,
      isActive: dto.isActive,
      productCount: dto.productCount,
      createdAt: new Date(dto.createdAt),
      updatedAt: new Date(dto.updatedAt),
    });
  }

  static toDto(entity: Company): CompanyResponseDto {
    return {
      id: entity.id,
      name: entity.name,
      code: entity.code,
      description: entity.description,
      isActive: entity.isActive,
      productCount: entity.productCount,
      createdAt: entity.createdAt.toISOString(),
      updatedAt: entity.updatedAt.toISOString(),
    };
  }
}
