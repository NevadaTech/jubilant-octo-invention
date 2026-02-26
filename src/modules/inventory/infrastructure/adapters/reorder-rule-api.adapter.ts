import { apiClient } from "@/shared/infrastructure/http";
import type {
  ReorderRuleListResponseDto,
  ReorderRuleSingleResponseDto,
  CreateReorderRuleDto,
  UpdateReorderRuleDto,
  ReorderRuleApiDto,
} from "@/modules/inventory/application/dto/reorder-rule.dto";

class ReorderRuleApiAdapter {
  private readonly basePath = "/inventory/stock/reorder-rules";

  async findAll(): Promise<ReorderRuleApiDto[]> {
    const response = await apiClient.get<ReorderRuleListResponseDto>(
      this.basePath,
    );
    return response.data.data ?? [];
  }

  async create(dto: CreateReorderRuleDto): Promise<ReorderRuleApiDto> {
    const response = await apiClient.post<ReorderRuleSingleResponseDto>(
      this.basePath,
      dto,
    );
    return response.data.data;
  }

  async update(
    id: string,
    dto: UpdateReorderRuleDto,
  ): Promise<ReorderRuleApiDto> {
    const response = await apiClient.put<ReorderRuleSingleResponseDto>(
      `${this.basePath}/${id}`,
      dto,
    );
    return response.data.data;
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete(`${this.basePath}/${id}`);
  }
}

export const reorderRuleApiAdapter = new ReorderRuleApiAdapter();
