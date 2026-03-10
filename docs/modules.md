> **[English](./modules.md)** | [Espanol](./modules.es.md)

# Modules Guide

Detailed documentation for the 14 business modules of the frontend.

---

## Table of Contents

- [Authentication](#authentication)
- [Dashboard](#dashboard)
- [Inventory](#inventory)
- [Sales](#sales)
- [Returns](#returns)
- [Contacts](#contacts)
- [Reports](#reports)
- [Imports](#imports)
- [Users](#users)
- [Roles](#roles)
- [Audit](#audit)
- [Companies](#companies)
- [Settings](#settings)
- [Integrations](#integrations)

---

## Authentication

**Path**: `src/modules/authentication/`
**Page**: `/login`

### Purpose

Manages login, user session, JWT tokens, and permissions.

### Structure

```
authentication/
├── domain/
│   ├── entities/
│   │   └── user.entity.ts          # User with hasPermission(), hasRole()
│   ├── value-objects/
│   │   └── tokens.vo.ts            # AccessToken, RefreshToken
│   └── ports/
│       └── auth-repository.port.ts  # login(), logout(), refresh(), getCurrentUser()
├── application/
│   ├── dto/                        # LoginDto, UserDto
│   ├── mappers/                    # UserMapper
│   └── use-cases/                  # LoginUseCase, LogoutUseCase
├── infrastructure/
│   ├── adapters/
│   │   └── auth-api.adapter.ts     # POST /auth/login, /auth/refresh, /auth/logout
│   └── services/
│       └── token.service.ts        # localStorage + cookies management
└── presentation/
    ├── store/
    │   └── auth.store.ts           # Zustand: user, isAuthenticated, isHydrated
    ├── hooks/
    │   ├── use-auth.ts             # useLogin(), useLogout()
    │   └── use-permissions.ts      # hasPermission(), hasAnyPermission()
    └── components/
        └── login-form.tsx
```

### Zustand Store

```typescript
interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isHydrated: boolean;
  login(user, tokens): void;
  logout(): void;
  hydrate(): Promise<void>;
}
```

### API Endpoints Consumed

| Method | Endpoint        | Description              |
| ------ | --------------- | ------------------------ |
| POST   | `/auth/login`   | Login with email + password |
| POST   | `/auth/refresh` | Refresh access token     |
| POST   | `/auth/logout`  | Close session            |
| GET    | `/users/me`     | Get current user         |

---

## Dashboard

**Path**: `src/modules/dashboard/`
**Page**: `/dashboard`

### Purpose

Displays aggregated metrics and charts showing the state of the business.

### Metrics

| Metric             | Description                            | Visualization       |
| ------------------ | -------------------------------------- | -------------------- |
| `inventorySummary` | Total products, warehouses, categories | Stat Cards           |
| `lowStockCount`    | Products below minimum level           | Stat Card            |
| `monthlySales`     | Sales for the month (volume + value)   | Stat Card            |
| `salesTrend`       | Revenue per day (last 7 days)          | AreaChart            |
| `topProducts`      | Top 5 products by revenue              | BarChart horizontal  |
| `stockByWarehouse` | Stock distribution by warehouse        | PieChart (donut)     |
| `recentActivity`   | Latest activities                      | Feed with icons      |

### Components

| Component                | File                           | Description                                  |
| ------------------------ | ------------------------------ | -------------------------------------------- |
| `DashboardContent`       | `dashboard-content.tsx`        | Orchestrator: loading/error/empty + charts   |
| `SalesTrendChart`        | `sales-trend-chart.tsx`        | Recharts AreaChart                           |
| `TopProductsChart`       | `top-products-chart.tsx`       | Horizontal BarChart                          |
| `StockDistributionChart` | `stock-distribution-chart.tsx` | Donut PieChart                               |
| `RecentActivityFeed`     | `recent-activity-feed.tsx`     | List with icons                              |

### API

| Method | Endpoint             | Description                          |
| ------ | -------------------- | ------------------------------------ |
| GET    | `/dashboard/metrics` | All metrics in a single call         |

**Response**: `{ success, message, data: DashboardMetricsDto, timestamp }`

---

## Inventory

**Path**: `src/modules/inventory/`
**Pages**: `/dashboard/inventory/*`

### Purpose

Complete inventory management: products, categories, warehouses, stock, movements, and transfers.

### Sub-modules

#### Products

| Component     | Route                                  | Description                     |
| ------------- | -------------------------------------- | ------------------------------- |
| ProductList   | `/inventory/products`                  | List with filters + pagination  |
| ProductDetail | `/inventory/products/[id]`             | Detail with stock per warehouse |
| ProductForm   | `/inventory/products/new`, `[id]/edit` | Create/edit                     |

**Entity**: Includes SKU, barcode, brand, price, costMethod (AVG/FIFO), rotation metrics (daysOfStock, turnoverRate).

**Filters**: status (ACTIVE/INACTIVE), category, warehouse, search.

**Notes**:

- The backend does not accept `isActive=true`; use `status=ACTIVE`
- Has `statusChangedBy` and `statusChangedAt` for tracking who deactivated

#### Categories

| Component    | Route                       | Description     |
| ------------ | --------------------------- | --------------- |
| CategoryList | `/inventory/categories`     | Category list   |
| CategoryForm | `/inventory/categories/new` | Create/edit     |

#### Warehouses

| Component       | Route                        | Description            |
| --------------- | ---------------------------- | ---------------------- |
| WarehouseList   | `/inventory/warehouses`      | Warehouse list         |
| WarehouseDetail | `/inventory/warehouses/[id]` | Detail with locations  |

#### Stock

| Component | Route              | Description                            |
| --------- | ------------------ | -------------------------------------- |
| StockList | `/inventory/stock` | Stock levels by product/warehouse      |

**Notes**:

- Does not have its own `id` field -- uses composite ID: `${productId}-${warehouseId}`
- API does not return product/warehouse names, only IDs
- Includes `averageCost`, `totalValue`, `currency`

#### Movements

| Component      | Route                       | Description       |
| -------------- | --------------------------- | ----------------- |
| MovementList   | `/inventory/movements`      | Movement list     |
| MovementDetail | `/inventory/movements/[id]` | Detail with lines |
| MovementForm   | `/inventory/movements/new`  | Create movement   |

**Types**: IN (inbound), OUT (outbound), ADJUSTMENT (adjustment).

**Workflow**: `DRAFT -> POSTED -> VOID`

#### Transfers

| Component      | Route                       | Description       |
| -------------- | --------------------------- | ----------------- |
| TransferList   | `/inventory/transfers`      | Transfer list     |
| TransferDetail | `/inventory/transfers/[id]` | Detail with lines |
| TransferForm   | `/inventory/transfers/new`  | Create transfer   |

**Workflow**: `DRAFT -> IN_TRANSIT -> RECEIVED` (or `REJECTED` / `CANCELLED`)

**Notes**: The list does not include `lines`, `fromWarehouseName`, `toWarehouseName` -- uses `TransferApiRawDto` + `fromApiRaw()`.

### Zustand Store

```typescript
// useInventoryStore
{
  productFilters: ProductFilters;
  warehouseFilters: WarehouseFilters;
  stockFilters: StockFilters;
  categoryFilters: CategoryFilters;
  isProductFormOpen: boolean;
  editingProductId: string | null;
  // + setters for each
}
```

---

## Sales

**Path**: `src/modules/sales/`
**Pages**: `/dashboard/sales/*`

### Purpose

Sales management with a complete 5-state workflow.

### Workflow

```
DRAFT --> CONFIRMED --> PICKING --> SHIPPED --> COMPLETED
  |           |
  +-> CANCELLED  +-> CANCELLED                RETURNED
```

Each transition has a use case and an action button in the detail view.

### Entity

```typescript
class Sale extends AggregateRoot<string> {
  // Main fields
  saleNumber: string; // SALE-YYYY-NNN
  status: SaleStatus;
  customerId: string;
  warehouseId: string;
  lines: SaleLine[];

  // Audit trail per status
  confirmedAt?: Date;
  confirmedBy?: string;
  pickedAt?: Date;
  shippedAt?: Date;
  completedAt?: Date;
  cancelledAt?: Date;

  // Workflow validations
  get canConfirm(): boolean;
  get canStartPicking(): boolean;
  get canShip(): boolean;
  get canComplete(): boolean;
  get canCancel(): boolean;
}
```

### Key Components

| Component         | Description                                        |
| ----------------- | -------------------------------------------------- |
| `SaleList`        | List with filters, status badge, pagination        |
| `SaleDetail`      | Detail with lines + action buttons per status      |
| `SaleForm`        | Form with dynamic lines                            |
| `SaleTimeline`    | Visual lifecycle timeline                          |
| `SaleStatusBadge` | Badge with color per status                        |
| `SaleFilters`     | Filters: status, dateRange, customer, warehouse    |

### API Response Pattern

The sales API wraps responses in Effect format:

```typescript
// Raw API response
{ _tag: "Ok", _value: { success: true, message: "...", data: [...], pagination: {...} } }

// Unwrapped with unwrapResponse()
const { data, pagination } = unwrapResponse(apiResponse);
```

---

## Returns

**Path**: `src/modules/returns/`
**Pages**: `/dashboard/returns/*`

### Purpose

Management of customer returns and returns to suppliers.

### Types

| Type              | Code              | Description              |
| ----------------- | ----------------- | ------------------------ |
| Customer return   | `RETURN_CUSTOMER` | Customer returns product |
| Supplier return   | `RETURN_SUPPLIER` | Return to supplier       |

### Workflow

```
DRAFT --> CONFIRMED
  |
  +-> CANCELLED
```

### Entity

```typescript
class Return extends AggregateRoot<string> {
  returnNumber: string; // RETURN-YYYY-NNN
  returnType: ReturnType; // RETURN_CUSTOMER | RETURN_SUPPLIER
  status: ReturnStatus;
  saleId?: string; // Original sale (for customer returns)
  lines: ReturnLine[];
  reason: string;
}

class ReturnLine {
  productId: string;
  quantity: number;
  originalSalePrice: number; // Original sale price
  originalUnitCost: number; // Original unit cost
}
```

### API Response Pattern

Same Effect wrapper as Sales -- uses `unwrapResponse()`.

---

## Contacts

**Path**: `src/modules/contacts/`
**Pages**: `/dashboard/contacts/*`

### Purpose

Management of customers and suppliers as contacts. Each contact can be classified as a customer, a supplier, or both, and can optionally be linked to sales.

### Contact Types

| Type       | Code       | Description                                   |
| ---------- | ---------- | --------------------------------------------- |
| Customer   | `CUSTOMER` | End customer who buys products                |
| Supplier   | `SUPPLIER` | Supplier who provides products                |
| Both       | `BOTH`     | Acts as both customer and supplier            |

### Entity

```typescript
class Contact extends Entity<string> {
  name: string;
  identification: string; // Unique per organization
  type: ContactType;      // CUSTOMER | SUPPLIER | BOTH
  email?: string;
  phone?: string;
  address?: string;
  notes?: string;
  isActive: boolean;
}
```

### Key Components

| Component      | Route                  | Description                                |
| -------------- | ---------------------- | ------------------------------------------ |
| ContactList    | `/contacts`            | List with filters, search, and pagination  |
| ContactDetail  | `/contacts/[id]`       | Detail view                                |
| ContactForm    | `/contacts/new`, `[id]/edit` | Create/edit form                     |

### Fields

| Field            | Type     | Required | Description                             |
| ---------------- | -------- | -------- | --------------------------------------- |
| `name`           | string   | Yes      | Contact name                            |
| `identification` | string   | Yes      | Unique identifier per organization      |
| `type`           | enum     | Yes      | CUSTOMER, SUPPLIER, or BOTH             |
| `email`          | string   | No       | Email address                           |
| `phone`          | string   | No       | Phone number                            |
| `address`        | string   | No       | Physical address                        |
| `notes`          | string   | No       | Additional notes                        |
| `isActive`       | boolean  | Yes      | Active status                           |

### Sales Integration

Sales have an optional `contactId` + `contactName` (joined from the Contact table). When creating a sale, the user can select an existing contact as the customer.

### API Endpoints

| Method | Endpoint        | Description          |
| ------ | --------------- | -------------------- |
| GET    | `/contacts`     | List contacts        |
| POST   | `/contacts`     | Create contact       |
| GET    | `/contacts/:id` | Contact detail       |
| PATCH  | `/contacts/:id` | Update contact       |
| DELETE | `/contacts/:id` | Delete contact       |

**Response**: `{ success, message, data, timestamp }`

### Permissions

| Permission        | Description               |
| ----------------- | ------------------------- |
| `CONTACTS:CREATE` | Create new contacts       |
| `CONTACTS:READ`   | View contacts             |
| `CONTACTS:UPDATE` | Update existing contacts  |
| `CONTACTS:DELETE` | Delete contacts           |

### Notes

- The `identification` field has a unique constraint per organization (`@@unique([identification, orgId])` in Prisma).
- Navigation: Sidebar item after Returns, using the `UserRoundSearch` icon.
- API response follows the `{ success, message, data, timestamp }` wrapper pattern (same as auth/sales).

---

## Reports

**Path**: `src/modules/reports/`
**Pages**: `/dashboard/reports`, `/dashboard/reports/[type]`

### Purpose

17 report types with dynamic filters and Excel export.

### Catalog Page (`/dashboard/reports`)

Shows cards grouped by category:

| Category      | Reports                                                                                          |
| ------------- | ------------------------------------------------------------------------------------------------ |
| **Inventory** | Available Inventory, Movement History, Valuation, Low Stock, Movements, ABC Analysis, Dead Stock |
| **Sales**     | Sales, Sales by Product, Sales by Warehouse, Financial, Turnover                                 |
| **Returns**   | Returns, Returns by Type, Returns by Product, Returns Customer, Returns Supplier                 |

### Viewer Page (`/dashboard/reports/[type]`)

- Dynamic filters depending on the report type
- Table with dynamic columns
- Excel export button

### Special Reports

**ABC Analysis**: Pareto classification of products.

- A: Top 80% of revenue
- B: Next 15%
- C: Remaining 5%
- Filters: dateRange, warehouseId, category

**Dead Stock**: Products with stock > 0 but no sales in N days.

- Risk levels: HIGH (>180 days), MEDIUM (90-180), LOW (<90)
- Filters: warehouseId, deadStockDays (default 90), includeInactive

### Utilities

```typescript
// Conversion between report type and URL slug
reportTypeToSlug("ABC_ANALYSIS"); // -> 'abc-analysis'
slugToReportType("abc-analysis"); // -> 'ABC_ANALYSIS'
```

### API Pattern

```
GET  /reports/{module}/{name}/view    -> Report data (JSON)
POST /reports/{module}/{name}/export  -> Export (Excel/CSV)
```

---

## Imports

**Path**: `src/modules/imports/`
**Pages**: `/dashboard/imports`

### Purpose

Bulk data import from Excel (.xlsx) and CSV files. Supports five import types with a two-phase workflow (Preview then Execute) that validates data before committing changes.

### Import Types

| Type        | Code        | Description                                 |
| ----------- | ----------- | ------------------------------------------- |
| Products    | `PRODUCTS`  | Import product catalog (SKU, name, price, etc.) |
| Movements   | `MOVEMENTS` | Import stock movements (IN/OUT/ADJUST)      |
| Transfers   | `TRANSFERS` | Import transfer records between warehouses  |
| Sales       | `SALES`     | Import historical sales                     |
| Returns     | `RETURNS`   | Import return records                       |

### Two-Phase Workflow

```
1. Upload file  ->  POST /imports/preview  ->  Validation results (errors + preview rows)
2. Review       ->  User inspects errors, corrects file if needed
3. Execute      ->  POST /imports/execute  ->  Records created in database
```

**Phase 1 -- Preview**: The backend parses the file, validates each row (required fields, data types, foreign key references), and returns a preview with:
- Total rows found
- Valid rows count
- Error rows with line number and error description
- Preview of first N valid rows

**Phase 2 -- Execute**: If the user is satisfied with the preview, they confirm execution. The backend processes all valid rows and creates the corresponding records.

### Key Components

| Component         | Description                                          |
| ----------------- | ---------------------------------------------------- |
| `ImportsPage`     | Main page with import type selector and file upload  |
| `ImportPreview`   | Preview table showing validated rows and errors      |
| `ImportErrors`    | Error list with row numbers and descriptions         |
| `ImportProgress`  | Progress indicator during execution                  |

### File Requirements

- **Formats**: Excel (.xlsx) and CSV (.csv)
- **Headers**: First row must contain column headers matching expected field names
- **Encoding**: UTF-8 for CSV files

### API Endpoints

| Method | Endpoint            | Description                              |
| ------ | ------------------- | ---------------------------------------- |
| POST   | `/imports/preview`  | Upload file and get validation preview   |
| POST   | `/imports/execute`  | Execute import with validated data       |

**Request**: `multipart/form-data` with `file` field and `type` field (PRODUCTS, MOVEMENTS, etc.)

**Response**: `{ success, message, data: { totalRows, validRows, errors, preview }, timestamp }`

### Permissions

| Permission      | Description                    |
| --------------- | ------------------------------ |
| `IMPORTS:CREATE`| Upload and execute imports     |
| `IMPORTS:READ`  | View import history            |

### Notes

- Navigation: Sidebar item after Contacts, using the `Upload` icon.
- The preview phase does not modify the database; it is a dry run.
- Large files are processed server-side; the frontend shows a progress indicator.

---

## Users

**Path**: `src/modules/users/`
**Pages**: `/dashboard/users/*`

### Purpose

User CRUD with status management and role assignment.

### User Statuses

| Status     | Description                                    |
| ---------- | ---------------------------------------------- |
| `ACTIVE`   | Active user, can use the system                |
| `INACTIVE` | Deactivated, cannot log in                     |
| `LOCKED`   | Locked (e.g., too many failed login attempts)  |

### Entity

```typescript
class User extends Entity<string> {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  timezone?: string;
  language?: string;
  jobTitle?: string;
  department?: string;
  status: UserStatus;
  roles: string[];
  permissions: string[];

  hasPermission(permission: string): boolean;
  hasRole(role: string): boolean;
  hasAnyPermission(permissions: string[]): boolean;
  hasAllPermissions(permissions: string[]): boolean;
}
```

### API Response Pattern

```typescript
// Response: { success, message, data: UserDto[], pagination, timestamp }
```

---

## Roles

**Path**: `src/modules/roles/`
**Pages**: `/dashboard/roles/*`

### Purpose

CRUD for roles (system and custom) with permission management.

### Role Types

| Type     | Description                                  | Editable      |
| -------- | -------------------------------------------- | ------------- |
| `SYSTEM` | Predefined roles (ADMIN, SUPERVISOR, etc.)   | Read-only     |
| `CUSTOM` | Custom roles per organization                | Yes           |

### System Roles

| Role                 | Description                       |
| -------------------- | --------------------------------- |
| `SYSTEM_ADMIN`       | Full access, permission bypass    |
| `ADMIN`              | Organization administrator        |
| `SUPERVISOR`         | Operations supervisor             |
| `WAREHOUSE_OPERATOR` | Warehouse operator                |
| `CONSULTANT`         | Read-only (analyst)               |
| `IMPORT_OPERATOR`    | Import operator                   |
| `SALES_PERSON`       | Sales staff                       |

### Permission Management

- Dialog to view/assign permissions per role
- System roles are read-only (permissions cannot be modified)
- Custom roles allow assigning any combination of permissions

### API Endpoints

| Method | Endpoint                 | Description                     |
| ------ | ------------------------ | ------------------------------- |
| GET    | `/roles`                 | List roles (no pagination)      |
| GET    | `/roles/permissions`     | All available permissions       |
| GET    | `/roles/:id/permissions` | Permissions for a role          |
| POST   | `/roles/:id/permissions` | Assign permissions to a role    |

---

## Audit

**Path**: `src/modules/audit/`
**Page**: `/dashboard/audit`

### Purpose

View system activity history with advanced filters and export.

### Available Filters

| Filter                  | Type   | Description                                    |
| ----------------------- | ------ | ---------------------------------------------- |
| `entityType`            | Select | Entity type (Product, Sale, User, etc.)        |
| `action`                | Select | Action (CREATE, UPDATE, DELETE, etc.)          |
| `httpMethod`            | Select | HTTP method (GET, POST, PUT, PATCH, DELETE)    |
| `performedBy`           | Input  | ID of the user who performed the action        |
| `entityId`              | Input  | ID of the affected entity                      |
| `startDate` / `endDate` | Date   | Date range                                     |

### Components

| Component              | Description                     |
| ---------------------- | ------------------------------- |
| `AuditLogList`         | Table with pagination           |
| `AuditLogFilters`      | Filter panel                    |
| `AuditLogDetailDialog` | Dialog with change details      |
| `AuditActionBadge`     | Badge by action type            |
| `AuditMethodBadge`     | Badge by HTTP method            |
| `AuditStatusIndicator` | Status indicator                |

### Export

Excel export via SheetJS, fetches up to 10,000 records from the backend.

---

## Companies

**Path**: `src/modules/companies/`
**Page**: `/dashboard/inventory/companies`

### Purpose

Management of companies/business lines within an organization (multi-company). Allows segmenting products, sales, stock, movements, returns, reports, and dashboard by company.

### Enablement

Feature gated by `Organization.settings.multiCompanyEnabled`. Activated from the Settings page (admin-only) with a toggle that calls `PATCH /organizations/:id/settings/multi-company`.

### Structure

```
companies/
├── domain/
│   ├── entities/
│   │   └── company.entity.ts          # Company with id, name, code, description, isActive
│   └── ports/
│       └── company-repository.port.ts  # CRUD + list
├── application/
│   ├── dto/                           # CompanyDto, CompanyFilters
│   └── mappers/                       # CompanyMapper
├── infrastructure/
│   ├── adapters/
│   │   └── company-api.adapter.ts     # /inventory/companies endpoints
│   └── store/
│       └── company.store.ts           # Zustand: selectedCompanyId (persisted to localStorage)
└── presentation/
    ├── hooks/
    │   └── use-companies.ts           # useCompanies(), useCreateCompany(), etc.
    ├── schemas/
    │   └── company.schema.ts          # Zod validation
    └── components/
        ├── company-list.tsx           # CRUD list with search, pagination, dialog form
        ├── company-form.tsx           # Create/edit form dialog
        ├── company-selector.tsx       # Select for forms (e.g., product form)
        └── global-company-selector.tsx # Header selector, filters all modules
```

### Global Selector

In the DashboardHeader, a selector (Building2 icon) appears when `multiCompanyEnabled` is true. Uses a Zustand store to persist `selectedCompanyId` in localStorage. All modules read this value to filter data.

### Filtering by companyId

| Module    | Where it applies                                                         |
| --------- | ------------------------------------------------------------------------ |
| Products  | ProductFilters, list, form (CompanySelector in form)                     |
| Stock     | StockFilters, table                                                      |
| Movements | StockMovementFilters, list, form                                         |
| Sales     | SaleFilters, list, form (filters available products)                     |
| Returns   | ReturnFilters, list, form                                                |
| Transfers | Form (filters available products)                                        |
| Reports   | ReportParameters, all report filters, pre-selects company                |
| Dashboard | useDashboardMetrics(companyId) -- passes to backend                      |

### API Endpoints

| Method | Endpoint                                    | Description            |
| ------ | ------------------------------------------- | ---------------------- |
| GET    | `/inventory/companies`                      | List companies         |
| POST   | `/inventory/companies`                      | Create company         |
| GET    | `/inventory/companies/:id`                  | Company detail         |
| PUT    | `/inventory/companies/:id`                  | Update company         |
| DELETE | `/inventory/companies/:id`                  | Delete company         |
| PATCH  | `/organizations/:id/settings/multi-company` | Toggle multi-company   |

### Notes

- When a company is selected in the global selector, products without `companyId` are hidden from the list. The user must select "All companies" to view/edit unassigned products.
- The product form shows the CompanySelector only when `multiCompanyEnabled` is active.
- Permissions are: `COMPANIES:CREATE`, `COMPANIES:READ`, `COMPANIES:UPDATE`, `COMPANIES:DELETE`.

---

## Settings

**Path**: `src/modules/settings/`
**Page**: `/dashboard/settings`

### Purpose

User profile configuration and stock alerts.

### Sections

#### Profile (all users)

| Field        | Type   | Description    |
| ------------ | ------ | -------------- |
| `phone`      | Input  | Phone          |
| `timezone`   | Select | Timezone       |
| `language`   | Select | Preferred language |
| `jobTitle`   | Input  | Job title      |
| `department` | Input  | Department     |

#### Stock Alerts (admin only, gated by `SETTINGS:MANAGE`)

| Field                 | Type    | Description                                           |
| --------------------- | ------- | ----------------------------------------------------- |
| `cronFrequency`       | Select  | EVERY_HOUR, EVERY_6_HOURS, EVERY_12_HOURS, EVERY_DAY |
| `notifyLowStock`      | Switch  | Notify on low stock                                   |
| `notifyCriticalStock` | Switch  | Notify on critical stock                              |
| `notifyOutOfStock`    | Switch  | Notify on out of stock                                |
| `recipientEmails`     | Input[] | Recipient email addresses                             |
| `isEnabled`           | Switch  | Enable/disable alerts                                 |

### API Endpoints

| Method | Endpoint           | Description      |
| ------ | ------------------ | ---------------- |
| GET    | `/users/me`        | Get profile      |
| PUT    | `/users/me`        | Update profile   |
| GET    | `/settings/alerts` | Alert config     |
| PUT    | `/settings/alerts` | Update alerts    |

---

## Integrations

**Path**: `src/modules/integrations/`
**Pages**: `/dashboard/integrations`, `/dashboard/integrations/[id]`

### Purpose

Management of connections with external e-commerce platforms (VTEX as the first provider, extensible to MercadoLibre) for automatic synchronization of orders, products, and contacts.

### Main Functionality

- Multiple simultaneous connections per provider
- Connectivity testing and manual synchronization
- Mapping of external SKUs to Nevada products
- Synchronization logs with retries (individual and bulk)
- Alert for unmapped SKUs
- Feature gated by `integrationsEnabled` in organization settings

### Key Components

| Component | Description |
| --- | --- |
| `IntegrationsPage` | Main page with tabs per provider (VTEX, MercadoLibre) |
| `ProviderTabContent` | Grid of connection cards + header + form |
| `ConnectionCard` | Individual card with status, last sync, and actions |
| `VtexConnectionForm` | Dialog to create/edit connection (credentials, warehouse, contact) |
| `VtexConnectionDetail` | Detail with tabs: sync logs, SKU mappings, failed syncs |
| `FailedSyncsTab` | Failed syncs with individual retry and retry-all |

### API Endpoints

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/integrations` | List connections |
| GET | `/integrations/:id` | Connection detail |
| POST | `/integrations` | Create connection |
| PATCH | `/integrations/:id` | Update connection |
| DELETE | `/integrations/:id` | Delete connection |
| POST | `/integrations/:id/test` | Test connectivity |
| POST | `/integrations/:id/sync` | Force synchronization |
| GET | `/integrations/:id/logs` | Synchronization logs |
| GET | `/integrations/:id/sku-mappings` | SKU mappings |
| POST | `/integrations/:id/sku-mappings` | Create SKU mapping |
| DELETE | `/integrations/:id/sku-mappings/:mid` | Delete mapping |
| GET | `/integrations/:id/unmatched-skus` | Unmapped SKUs |
| POST | `/integrations/:id/retry/:logId` | Retry failed log |
| POST | `/integrations/:id/retry-all` | Retry all failed |

**Response**: `{ success, message, data, timestamp }` (logs include `pagination`).

> Full documentation in [`docs/integrations.md`](./integrations.md).
