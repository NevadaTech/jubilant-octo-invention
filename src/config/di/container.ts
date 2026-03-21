// ── Port types (import as type-only) ────────────────────────────────
import type { AuthRepositoryPort } from "@/modules/authentication/domain/ports/auth-repository.port";
import type { ProductRepositoryPort } from "@/modules/inventory/application/ports/product.repository.port";
import type { CategoryRepositoryPort } from "@/modules/inventory/application/ports/category.repository.port";
import type { WarehouseRepositoryPort } from "@/modules/inventory/application/ports/warehouse.repository.port";
import type { StockRepositoryPort } from "@/modules/inventory/application/ports/stock.repository.port";
import type { StockMovementRepositoryPort } from "@/modules/inventory/application/ports/stock-movement.repository.port";
import type { TransferRepositoryPort } from "@/modules/inventory/application/ports/transfer.repository.port";
import type { SaleRepositoryPort } from "@/modules/sales/application/ports/sale.repository.port";
import type { ReturnRepositoryPort } from "@/modules/returns/application/ports/return.repository.port";
import type { UserRepositoryPort } from "@/modules/users/application/ports/user.repository.port";
import type { RoleRepositoryPort } from "@/modules/roles/application/ports/role.repository.port";
import type { AuditLogRepositoryPort } from "@/modules/audit/application/ports/audit-log.repository.port";
import type { ReportRepositoryPort } from "@/modules/reports/application/ports/report.repository.port";
import type { CompanyRepositoryPort } from "@/modules/companies/application/ports/company.repository.port";
import type { SettingsRepositoryPort } from "@/modules/settings/application/ports/settings.port";
import type { ImportRepositoryPort } from "@/modules/imports/application/ports/import.repository.port";
import type { ContactRepositoryPort } from "@/modules/contacts/application/ports/contact.repository.port";
import type { IntegrationRepositoryPort } from "@/modules/integrations/application/ports/integration.repository.port";
import type { ComboRepositoryPort } from "@/modules/inventory/application/ports/combo.repository.port";

// ── Adapter implementations ─────────────────────────────────────────
import { AuthApiAdapter } from "@/modules/authentication/infrastructure/adapters/auth-api.adapter";
import { ProductApiAdapter } from "@/modules/inventory/infrastructure/adapters/product-api.adapter";
import { CategoryApiAdapter } from "@/modules/inventory/infrastructure/adapters/category-api.adapter";
import { WarehouseApiAdapter } from "@/modules/inventory/infrastructure/adapters/warehouse-api.adapter";
import { StockApiAdapter } from "@/modules/inventory/infrastructure/adapters/stock-api.adapter";
import { StockMovementApiAdapter } from "@/modules/inventory/infrastructure/adapters/stock-movement-api.adapter";
import { TransferApiAdapter } from "@/modules/inventory/infrastructure/adapters/transfer-api.adapter";
import { SaleApiAdapter } from "@/modules/sales/infrastructure/adapters/sale-api.adapter";
import { ReturnApiAdapter } from "@/modules/returns/infrastructure/adapters/return-api.adapter";
import { UserApiAdapter } from "@/modules/users/infrastructure/adapters/user-api.adapter";
import { RoleApiAdapter } from "@/modules/roles/infrastructure/adapters/role-api.adapter";
import { AuditLogApiAdapter } from "@/modules/audit/infrastructure/adapters/audit-log-api.adapter";
import { ReportApiAdapter } from "@/modules/reports/infrastructure/adapters/report-api.adapter";
import { CompanyApiAdapter } from "@/modules/companies/infrastructure/adapters/company-api.adapter";
import { SettingsApiAdapter } from "@/modules/settings/infrastructure/adapters/settings-api.adapter";
import { ImportApiAdapter } from "@/modules/imports/infrastructure/adapters/import-api.adapter";
import { ContactApiAdapter } from "@/modules/contacts/infrastructure/adapters/contact-api.adapter";
import { IntegrationApiAdapter } from "@/modules/integrations/infrastructure/adapters/integration-api.adapter";
import { ComboApiAdapter } from "@/modules/inventory/infrastructure/adapters/combo-api.adapter";

// ── Use case implementations ────────────────────────────────────────
import {
  ConfirmSaleUseCase,
  CancelSaleUseCase,
  StartPickingUseCase,
  ShipSaleUseCase,
  CompleteSaleUseCase,
} from "@/modules/sales/application/use-cases";
import {
  PostMovementUseCase,
  VoidMovementUseCase,
} from "@/modules/inventory/application/use-cases";
import {
  ConfirmReturnUseCase,
  CancelReturnUseCase,
} from "@/modules/returns/application/use-cases";

// ── Container interface ─────────────────────────────────────────────
export interface Container {
  // Authentication
  authRepository: AuthRepositoryPort;

  // Inventory
  productRepository: ProductRepositoryPort;
  categoryRepository: CategoryRepositoryPort;
  warehouseRepository: WarehouseRepositoryPort;
  stockRepository: StockRepositoryPort;
  movementRepository: StockMovementRepositoryPort;
  transferRepository: TransferRepositoryPort;

  // Inventory use cases
  postMovement: PostMovementUseCase;
  voidMovement: VoidMovementUseCase;

  // Sales
  saleRepository: SaleRepositoryPort;

  // Sales use cases
  confirmSale: ConfirmSaleUseCase;
  cancelSale: CancelSaleUseCase;
  startPicking: StartPickingUseCase;
  shipSale: ShipSaleUseCase;
  completeSale: CompleteSaleUseCase;

  // Returns
  returnRepository: ReturnRepositoryPort;

  // Returns use cases
  confirmReturn: ConfirmReturnUseCase;
  cancelReturn: CancelReturnUseCase;

  // Users
  userRepository: UserRepositoryPort;

  // Roles
  roleRepository: RoleRepositoryPort;

  // Audit
  auditLogRepository: AuditLogRepositoryPort;

  // Reports
  reportRepository: ReportRepositoryPort;

  // Companies
  companyRepository: CompanyRepositoryPort;

  // Settings
  settingsRepository: SettingsRepositoryPort;

  // Imports
  importRepository: ImportRepositoryPort;

  // Contacts
  contactRepository: ContactRepositoryPort;

  // Integrations
  integrationRepository: IntegrationRepositoryPort;

  // Combos
  comboRepository: ComboRepositoryPort;
}

// ── Factory ─────────────────────────────────────────────────────────
export function createContainer(): Container {
  // Create repository instances
  const authRepository = new AuthApiAdapter();
  const productRepository = new ProductApiAdapter();
  const categoryRepository = new CategoryApiAdapter();
  const warehouseRepository = new WarehouseApiAdapter();
  const stockRepository = new StockApiAdapter();
  const movementRepository = new StockMovementApiAdapter();
  const transferRepository = new TransferApiAdapter();
  const saleRepository = new SaleApiAdapter();
  const returnRepository = new ReturnApiAdapter();
  const userRepository = new UserApiAdapter();
  const roleRepository = new RoleApiAdapter();
  const auditLogRepository = new AuditLogApiAdapter();
  const reportRepository = new ReportApiAdapter();
  const companyRepository = new CompanyApiAdapter();
  const settingsRepository = new SettingsApiAdapter();
  const importRepository = new ImportApiAdapter();
  const contactRepository = new ContactApiAdapter();
  const integrationRepository = new IntegrationApiAdapter();
  const comboRepository = new ComboApiAdapter();

  return {
    // Authentication
    authRepository,

    // Inventory
    productRepository,
    categoryRepository,
    warehouseRepository,
    stockRepository,
    movementRepository,
    transferRepository,

    // Inventory use cases
    postMovement: new PostMovementUseCase(movementRepository),
    voidMovement: new VoidMovementUseCase(movementRepository),

    // Sales
    saleRepository,

    // Sales use cases
    confirmSale: new ConfirmSaleUseCase(saleRepository),
    cancelSale: new CancelSaleUseCase(saleRepository),
    startPicking: new StartPickingUseCase(saleRepository),
    shipSale: new ShipSaleUseCase(saleRepository),
    completeSale: new CompleteSaleUseCase(saleRepository),

    // Returns
    returnRepository,

    // Returns use cases
    confirmReturn: new ConfirmReturnUseCase(returnRepository),
    cancelReturn: new CancelReturnUseCase(returnRepository),

    // Users
    userRepository,

    // Roles
    roleRepository,

    // Audit
    auditLogRepository,

    // Reports
    reportRepository,

    // Companies
    companyRepository,

    // Settings
    settingsRepository,

    // Imports
    importRepository,

    // Contacts
    contactRepository,

    // Integrations
    integrationRepository,

    // Combos
    comboRepository,
  };
}

// ── Singleton access ────────────────────────────────────────────────
let container: Container | null = null;

export function getContainer(): Container {
  if (!container) {
    container = createContainer();
  }
  return container;
}

// ── Testing helper: override any repository ─────────────────────────
export function setContainer(overrides: Partial<Container>): () => void {
  const prev = getContainer();
  container = { ...prev, ...overrides };
  return () => {
    container = prev;
  };
}
