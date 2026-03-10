# Integrations Module

> **[English](./integrations.md)** | [Espanol](./integrations.es.md)

Complete documentation for the frontend integrations module (VTEX + extensible).

---

## Table of Contents

- [Purpose](#purpose)
- [Routes and Pages](#routes-and-pages)
- [Module Structure](#module-structure)
- [Domain Entities](#domain-entities)
- [DTOs](#dtos)
- [Mappers](#mappers)
- [Port and Implementation](#port-and-implementation)
- [Hooks (React Query)](#hooks-react-query)
- [Schemas (Zod)](#schemas-zod)
- [Components](#components)
- [Main Page (Tabs by Provider)](#main-page-tabs-by-provider)
- [Detail Page](#detail-page)
- [Feature Gate](#feature-gate)
- [Permissions](#permissions)
- [Translations](#translations)
- [API Endpoints Consumed](#api-endpoints-consumed)
- [Adding a New Provider (Guide)](#adding-a-new-provider-guide)
- [Troubleshooting](#troubleshooting)

---

## Purpose

Manages connections with external e-commerce platforms to automatically synchronize orders, products, and contacts.

- **VTEX** is the first implemented provider, with full inbound/outbound synchronization support.
- **MercadoLibre** is planned as the second provider (a "Coming Soon" placeholder is already visible in the UI).
- The module supports multiple simultaneous connections per provider, with SKU mapping and failed sync handling.

---

## Routes and Pages

| Resource        | Location                                                            |
| --------------- | ------------------------------------------------------------------- |
| **Module**      | `src/modules/integrations/`                                         |
| **List page**   | `src/app/[locale]/(dashboard)/dashboard/integrations/page.tsx`      |
| **Detail page** | `src/app/[locale]/(dashboard)/dashboard/integrations/[id]/page.tsx` |
| **List URL**    | `/dashboard/integrations`                                           |
| **Detail URL**  | `/dashboard/integrations/[id]`                                      |
| **Sidebar**     | `Plug` icon, after Imports, before Users                            |

---

## Module Structure

```
src/modules/integrations/
├── application/
│   ├── dto/
│   │   ├── integration-connection.dto.ts    # Response, List, Detail, Create, Update, Filters, Test, Sync DTOs
│   │   ├── integration-sku-mapping.dto.ts   # Response, List, Create, Unmatched DTOs
│   │   └── integration-sync-log.dto.ts      # Response, List, Filters DTOs
│   ├── mappers/
│   │   ├── integration-connection.mapper.ts # API DTO -> IntegrationConnection entity
│   │   └── integration-sync-log.mapper.ts   # API DTO -> IntegrationSyncLog entity
│   └── ports/
│       └── integration.repository.port.ts   # IntegrationRepositoryPort (14 methods) + PaginatedResult<T>
├── domain/
│   └── entities/
│       ├── integration-connection.entity.ts # IntegrationConnection + types (Provider, Status, Strategy, Direction)
│       └── integration-sync-log.entity.ts   # IntegrationSyncLog + SyncAction type
├── infrastructure/
│   └── adapters/
│       └── integration-api.adapter.ts       # IntegrationApiAdapter -- implements the port via apiClient
└── presentation/
    ├── components/
    │   ├── connection-card.tsx               # Individual connection card
    │   ├── connection-status-badge.tsx       # Badge with color based on status
    │   ├── coming-soon-provider-tab.tsx      # Placeholder for future providers
    │   ├── failed-syncs-tab.tsx              # Failed syncs tab with retry
    │   ├── integration-list.tsx              # Legacy connection list (deprecated)
    │   ├── integrations-enabled-banner.tsx   # Enabled/disabled status banner
    │   ├── integrations-page.tsx             # Main page with tabs by provider
    │   ├── provider-tab-content.tsx          # Tab content: header + cards + form + delete
    │   ├── sku-mapping-form.tsx              # Form to add SKU mapping
    │   ├── sku-mapping-table.tsx             # SKU mappings table
    │   ├── sync-log-table.tsx               # Sync logs table
    │   ├── unmatched-skus-alert.tsx          # Alert for unmapped SKUs
    │   ├── vtex-connection-detail.tsx        # Detail page with tabs (logs, SKU, failed)
    │   ├── vtex-connection-form.tsx          # Form dialog to create/edit VTEX connection
    │   ├── vtex-provider-header.tsx          # Descriptive header with statistics
    │   └── index.ts                         # Barrel exports
    ├── hooks/
    │   └── use-integrations.ts              # 14 React Query hooks + query key factory
    └── schemas/
        └── integration-connection.schema.ts # Zod schemas + helpers toCreateConnectionDto/toUpdateConnectionDto
```

---

## Domain Entities

### IntegrationConnection

Entity representing an active connection to an e-commerce platform. Extends `Entity<string>` from `@/shared/domain`.

**Props** (`IntegrationConnectionProps`):

| Property             | Type                  | Description                                       |
| -------------------- | --------------------- | ------------------------------------------------- |
| `id`                 | `string`              | Connection UUID                                   |
| `provider`           | `IntegrationProvider` | Provider: `"VTEX"` or `"MERCADOLIBRE"`            |
| `accountName`        | `string`              | Account name on the platform (e.g., `"my-store"`) |
| `storeName`          | `string`              | Descriptive store name                            |
| `status`             | `ConnectionStatus`    | `"CONNECTED"`, `"DISCONNECTED"`, or `"ERROR"`     |
| `syncStrategy`       | `SyncStrategy`        | `"WEBHOOK"`, `"POLLING"`, or `"BOTH"`             |
| `syncDirection`      | `SyncDirection`       | `"INBOUND"`, `"OUTBOUND"`, or `"BIDIRECTIONAL"`   |
| `defaultWarehouseId` | `string`              | Default warehouse for synced orders               |
| `warehouseName`      | `string \| null`      | Warehouse name (joined from backend)              |
| `defaultContactId`   | `string \| null`      | Default contact for VTEX orders                   |
| `defaultContactName` | `string \| null`      | Contact name (joined)                             |
| `companyId`          | `string \| null`      | Associated company (multi-company)                |
| `companyName`        | `string \| null`      | Company name (joined)                             |
| `connectedAt`        | `Date \| null`        | Successful connection date                        |
| `lastSyncAt`         | `Date \| null`        | Last synchronization                              |
| `lastSyncError`      | `string \| null`      | Last sync error                                   |
| `syncedOrdersCount`  | `number`              | Total synced orders                               |
| `createdAt`          | `Date`                | Creation date                                     |
| `updatedAt`          | `Date`                | Update date                                       |

**Computed getters**:

| Getter        | Return    | Logic                    |
| ------------- | --------- | ------------------------ |
| `isConnected` | `boolean` | `status === "CONNECTED"` |
| `hasError`    | `boolean` | `status === "ERROR"`     |

### IntegrationSyncLog

Entity representing an individual sync log entry. Extends `Entity<string>`.

**Props** (`IntegrationSyncLogProps`):

| Property          | Type              | Description                                |
| ----------------- | ----------------- | ------------------------------------------ |
| `id`              | `string`          | Log UUID                                   |
| `connectionId`    | `string`          | Associated connection ID                   |
| `externalOrderId` | `string`          | Order ID on the external platform          |
| `action`          | `SyncAction`      | Action performed                           |
| `saleId`          | `string \| null`  | ID of the sale created in Nevada           |
| `contactId`       | `string \| null`  | ID of the created/associated contact       |
| `errorMessage`    | `string \| null`  | Error message (if failed)                  |
| `rawPayload`      | `unknown \| null` | Original payload (not exposed in list API) |
| `processedAt`     | `Date`            | Processing date                            |

**Computed getters**:

| Getter             | Return    | Logic                          |
| ------------------ | --------- | ------------------------------ |
| `isFailed`         | `boolean` | `action === "FAILED"`          |
| `isOutboundFailed` | `boolean` | `action === "OUTBOUND_FAILED"` |

### Types

```typescript
type IntegrationProvider = "VTEX" | "MERCADOLIBRE";
type ConnectionStatus = "CONNECTED" | "DISCONNECTED" | "ERROR";
type SyncStrategy = "WEBHOOK" | "POLLING" | "BOTH";
type SyncDirection = "INBOUND" | "OUTBOUND" | "BIDIRECTIONAL";
type SyncAction =
  | "CREATED"
  | "UPDATED"
  | "SKIPPED"
  | "FAILED"
  | "OUTBOUND_OK"
  | "OUTBOUND_FAILED";
```

---

## DTOs

### Connection DTOs (`integration-connection.dto.ts`)

| DTO                                      | Usage                                                                                                                                                 |
| ---------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `IntegrationConnectionResponseDto`       | A single connection record (raw from API, dates as `string`)                                                                                          |
| `IntegrationConnectionListResponseDto`   | `{ success, message, data: ResponseDto[], timestamp }`                                                                                                |
| `IntegrationConnectionDetailResponseDto` | `{ success, message, data: ResponseDto, timestamp }`                                                                                                  |
| `CreateIntegrationConnectionDto`         | Body for creation: provider, accountName, storeName, appKey, appToken, syncStrategy, syncDirection, defaultWarehouseId, defaultContactId?, companyId? |
| `UpdateIntegrationConnectionDto`         | Body for update: all optional except credentials                                                                                                      |
| `IntegrationConnectionFilters`           | List filters: `provider?`, `status?`                                                                                                                  |
| `TestConnectionResponseDto`              | `{ success, message, timestamp }`                                                                                                                     |
| `TriggerSyncResponseDto`                 | `{ success, message, timestamp }`                                                                                                                     |

### SyncLog DTOs (`integration-sync-log.dto.ts`)

| DTO                                 | Usage                                                         |
| ----------------------------------- | ------------------------------------------------------------- |
| `IntegrationSyncLogResponseDto`     | A single log record (without `rawPayload`)                    |
| `IntegrationSyncLogListResponseDto` | `{ success, message, data: LogDto[], pagination, timestamp }` |
| `SyncLogFilters`                    | `action?`, `page?`, `limit?`                                  |

### SKU Mapping DTOs (`integration-sku-mapping.dto.ts`)

| DTO                                    | Usage                                                                            |
| -------------------------------------- | -------------------------------------------------------------------------------- |
| `IntegrationSkuMappingResponseDto`     | `id, connectionId, externalSku, productId, productName?, productSku?, createdAt` |
| `IntegrationSkuMappingListResponseDto` | `{ success, message, data: MappingDto[], timestamp }`                            |
| `CreateSkuMappingDto`                  | `{ externalSku, productId }`                                                     |
| `UnmatchedSkuDto`                      | `{ externalSku, externalOrderId, errorMessage, processedAt }`                    |
| `UnmatchedSkusResponseDto`             | `{ success, message, data: UnmatchedSkuDto[], timestamp }`                       |

---

## Mappers

### IntegrationConnectionMapper

```typescript
class IntegrationConnectionMapper {
  static toDomain(dto: IntegrationConnectionResponseDto): IntegrationConnection;
}
```

Converts date strings to `Date`, normalizes nullable fields with `?? null`, and parses `syncedOrdersCount` with fallback to `0`.

### IntegrationSyncLogMapper

```typescript
class IntegrationSyncLogMapper {
  static toDomain(dto: IntegrationSyncLogResponseDto): IntegrationSyncLog;
}
```

Converts `processedAt` to `Date`. The `rawPayload` field is set to `null` (not included in the list API).

---

## Port and Implementation

### IntegrationRepositoryPort

Defines 14 methods:

| Method             | Parameters                           | Return                                | Description                            |
| ------------------ | ------------------------------------ | ------------------------------------- | -------------------------------------- |
| `findAll`          | `filters?`                           | `IntegrationConnection[]`             | List connections with optional filters |
| `findById`         | `id`                                 | `IntegrationConnection \| null`       | Get connection by ID                   |
| `create`           | `CreateIntegrationConnectionDto`     | `IntegrationConnection`               | Create new connection                  |
| `update`           | `id, UpdateIntegrationConnectionDto` | `IntegrationConnection`               | Update connection                      |
| `delete`           | `id`                                 | `void`                                | Delete connection                      |
| `testConnection`   | `id`                                 | `TestConnectionResponseDto`           | Test connectivity with the platform    |
| `triggerSync`      | `id`                                 | `TriggerSyncResponseDto`              | Force manual synchronization           |
| `getSyncLogs`      | `id, filters?`                       | `PaginatedResult<IntegrationSyncLog>` | Sync logs (paginated)                  |
| `getSkuMappings`   | `connectionId`                       | `IntegrationSkuMappingResponseDto[]`  | SKU mappings for the connection        |
| `createSkuMapping` | `connectionId, CreateSkuMappingDto`  | `IntegrationSkuMappingResponseDto`    | Create SKU mapping                     |
| `deleteSkuMapping` | `connectionId, mappingId`            | `void`                                | Delete SKU mapping                     |
| `getUnmatchedSkus` | `connectionId`                       | `UnmatchedSkuDto[]`                   | External SKUs without mapping          |
| `retrySyncLog`     | `connectionId, logId`                | `void`                                | Retry a failed log                     |
| `retryAllFailed`   | `connectionId`                       | `void`                                | Retry all failed logs                  |

`PaginatedResult<T>` is defined **locally** in this port file (project pattern: each module defines its own `PaginatedResult`).

### IntegrationApiAdapter

Implements `IntegrationRepositoryPort` using `apiClient` from `@/shared/infrastructure/http`.

**Base path**: `/integrations`

| Method             | Endpoint                                      | HTTP Method |
| ------------------ | --------------------------------------------- | ----------- |
| `findAll`          | `/integrations?provider=&status=`             | GET         |
| `findById`         | `/integrations/:id`                           | GET         |
| `create`           | `/integrations`                               | POST        |
| `update`           | `/integrations/:id`                           | PATCH       |
| `delete`           | `/integrations/:id`                           | DELETE      |
| `testConnection`   | `/integrations/:id/test`                      | POST        |
| `triggerSync`      | `/integrations/:id/sync`                      | POST        |
| `getSyncLogs`      | `/integrations/:id/logs?action=&page=&limit=` | GET         |
| `getSkuMappings`   | `/integrations/:id/sku-mappings`              | GET         |
| `createSkuMapping` | `/integrations/:id/sku-mappings`              | POST        |
| `deleteSkuMapping` | `/integrations/:id/sku-mappings/:mappingId`   | DELETE      |
| `getUnmatchedSkus` | `/integrations/:id/unmatched-skus`            | GET         |
| `retrySyncLog`     | `/integrations/:id/retry/:logId`              | POST        |
| `retryAllFailed`   | `/integrations/:id/retry-all`                 | POST        |

---

## Hooks (React Query)

File: `use-integrations.ts`

### Query Key Factory

```typescript
const integrationKeys = {
  all: ["integrations"],
  lists: () => [...all, "list"],
  list: (filters?) => [...lists(), filters],
  details: () => [...all, "detail"],
  detail: (id) => [...details(), id],
  logs: (id) => [...all, "logs", id],
  logList: (id, filters?) => [...logs(id), filters],
  skuMappings: (id) => [...all, "sku-mappings", id],
  unmatchedSkus: (id) => [...all, "unmatched-skus", id],
  failedSyncs: (id) => [...all, "failed-syncs", id],
};
```

### Hooks

| Hook                                | Type     | Description           | Invalidations                          |
| ----------------------------------- | -------- | --------------------- | -------------------------------------- |
| `useIntegrations(filters?)`         | Query    | List of connections   | -                                      |
| `useIntegration(id)`                | Query    | Connection detail     | -                                      |
| `useCreateIntegration()`            | Mutation | Create connection     | `lists()`                              |
| `useUpdateIntegration()`            | Mutation | Update connection     | `lists()`, `detail(id)`                |
| `useDeleteIntegration()`            | Mutation | Delete connection     | `lists()`                              |
| `useTestIntegration()`              | Mutation | Test connectivity     | -                                      |
| `useTriggerSync()`                  | Mutation | Force manual sync     | `detail(id)`, `logs(id)`               |
| `useSyncLogs(id, filters?)`         | Query    | Sync logs (paginated) | -                                      |
| `useSkuMappings(connectionId)`      | Query    | SKU mappings          | -                                      |
| `useCreateSkuMapping(connectionId)` | Mutation | Create SKU mapping    | `skuMappings(id)`, `unmatchedSkus(id)` |
| `useDeleteSkuMapping(connectionId)` | Mutation | Delete SKU mapping    | `skuMappings(id)`                      |
| `useUnmatchedSkus(connectionId)`    | Query    | Unmapped SKUs         | -                                      |
| `useRetrySyncLog(connectionId)`     | Mutation | Retry a failed log    | `logs(id)`, `detail(id)`               |
| `useRetryAllFailed(connectionId)`   | Mutation | Retry all failed logs | `logs(id)`, `detail(id)`               |

**Stale time**: 5 minutes (`STALE_TIME = 5 * 60 * 1000`).

All mutations show `toast.success` on success and `toast.error` (via `getApiErrorMessage`) on error.

---

## Schemas (Zod)

File: `integration-connection.schema.ts`

### vtexConnectionSchema

Schema for creating a VTEX connection:

| Field                | Validation                                                                   |
| -------------------- | ---------------------------------------------------------------------------- |
| `accountName`        | `string`, min 1, max 100, regex `/^[a-zA-Z0-9-]+$/` (alphanumeric + hyphens) |
| `storeName`          | `string`, min 1, max 200                                                     |
| `appKey`             | `string`, min 1                                                              |
| `appToken`           | `string`, min 1                                                              |
| `syncStrategy`       | enum `["WEBHOOK", "POLLING", "BOTH"]`                                        |
| `syncDirection`      | enum `["INBOUND", "OUTBOUND", "BIDIRECTIONAL"]`                              |
| `defaultWarehouseId` | `string`, min 1                                                              |
| `defaultContactId`   | `string`, optional                                                           |
| `companyId`          | `string`, optional                                                           |

### updateConnectionSchema

Same as `vtexConnectionSchema` but `appKey` and `appToken` are optional (can be left blank to keep existing credentials unchanged).

### skuMappingSchema

| Field         | Validation      |
| ------------- | --------------- |
| `externalSku` | `string`, min 1 |
| `productId`   | `string`, min 1 |

### Helpers

```typescript
toCreateConnectionDto(data: VtexConnectionFormData): CreateIntegrationConnectionDto
// Adds provider: "VTEX", cleans empty fields to undefined

toUpdateConnectionDto(data): UpdateIntegrationConnectionDto
// Omits provider and accountName, cleans empty fields to undefined
```

---

## Components

| Component                   | Props                                                       | Description                                                                                                                                                           |
| --------------------------- | ----------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `IntegrationsPage`          | -                                                           | Main page with title, banner, and tabs by provider (VTEX, MercadoLibre)                                                                                               |
| `IntegrationsEnabledBanner` | -                                                           | Informational banner: green if `integrationsEnabled`, amber if disabled. Link to Settings.                                                                            |
| `ProviderTabContent`        | `provider: IntegrationProvider`                             | VTEX tab content: header, card grid, add button, form dialog, confirm delete                                                                                          |
| `VtexProviderHeader`        | `connections: IntegrationConnection[]`                      | Provider descriptive header with statistics (total connections, connected, errors, synced orders)                                                                     |
| `ConnectionCard`            | `connection, onTest, onSync, onDelete`                      | Individual connection card: name, account, status badge, last sync, orders, dropdown menu (test/sync/edit/delete)                                                     |
| `ComingSoonProviderTab`     | `providerKey: string`                                       | Placeholder for future providers (MercadoLibre)                                                                                                                       |
| `ConnectionStatusBadge`     | `status: ConnectionStatus`                                  | Badge with color variant based on status: success (CONNECTED), secondary (DISCONNECTED), destructive (ERROR)                                                          |
| `VtexConnectionForm`        | `open, onOpenChange, mode: "create" \| "edit", connection?` | Dialog for creating or editing a VTEX connection. Includes selects for warehouse, contact, company (if multiCompanyEnabled). Credential fields use `type="password"`. |
| `VtexConnectionDetail`      | `connectionId: string`                                      | Complete detail page: header with actions (test, sync, edit, delete), info card, unmatched SKUs alert, tabs (logs, SKU mappings, failed syncs)                        |
| `SyncLogTable`              | `connectionId: string`                                      | Paginated sync log table with action filter                                                                                                                           |
| `SkuMappingTable`           | `connectionId: string`                                      | SKU mappings table with per-row delete button                                                                                                                         |
| `SkuMappingForm`            | `connectionId: string`                                      | Inline form to add a new mapping (externalSku + product select)                                                                                                       |
| `UnmatchedSkusAlert`        | `connectionId: string`                                      | Alert shown when unmapped external SKUs exist; displays list with details                                                                                             |
| `FailedSyncsTab`            | `connectionId: string`                                      | Tab showing failed syncs (FAILED + OUTBOUND_FAILED) with individual retry and retry-all buttons                                                                       |
| `IntegrationList`           | -                                                           | Legacy connection list without tabs (deprecated; use IntegrationsPage instead)                                                                                        |

---

## Main Page (Tabs by Provider)

URL: `/dashboard/integrations`

### Layout

1. **Title and description** of the module
2. **IntegrationsEnabledBanner** -- shows whether integrations are enabled or disabled in the organization
3. **Tabs** with one tab per provider:

#### VTEX Tab

- `VtexProviderHeader` with connection statistics
- Responsive grid (1-2-3 columns) of `ConnectionCard`
- "Add connection" button that opens `VtexConnectionForm` in create mode
- AlertDialog for delete confirmation

#### MercadoLibre Tab

- `ComingSoonProviderTab` -- placeholder with "coming soon" message

### Interaction Flow

1. The user sees cards for existing connections
2. Can test connection, force sync, or delete from each card's dropdown
3. Clicking the store name navigates to the detail page
4. "Add" button opens the creation dialog

---

## Detail Page

URL: `/dashboard/integrations/[id]`

### Layout

1. **Header**:
   - "Back" button to list
   - Store name + provider + account
   - Actions: Test, Sync (disabled if not CONNECTED), Edit, Delete

2. **Info Card**:
   - Status badge
   - Sync strategy and direction badges
   - Default warehouse
   - Default contact (if exists)
   - Company (if exists)
   - Connection date, last sync, synced orders
   - Last error (if exists, in red, full col-span)

3. **UnmatchedSkusAlert** -- only visible when there are unmapped SKUs

4. **Tabs**:
   - **Sync Logs**: `SyncLogTable` with pagination and action filter
   - **SKU Mappings**: `SkuMappingForm` + `SkuMappingTable`
   - **Failed Syncs**: `FailedSyncsTab` with individual retry and retry-all

5. **Modal Dialogs**:
   - `VtexConnectionForm` in edit mode (opens from Edit button)
   - AlertDialog for delete confirmation (redirects to list afterwards)

---

## Feature Gate

Integrations are gated by the organization setting `integrationsEnabled`:

```typescript
const { integrationsEnabled } = useOrgSettings();
```

### Behavior

| State        | Effect                                                                                               |
| ------------ | ---------------------------------------------------------------------------------------------------- |
| **Enabled**  | Green banner, sidebar visible, full functionality                                                    |
| **Disabled** | Amber banner with warning, user can see the page but sync operations are not executed on the backend |

### Activation

Activated from the **Settings** page (admin-only). The banner includes a direct link to Settings to enable/disable.

---

## Permissions

| Permission            | Usage                                                |
| --------------------- | ---------------------------------------------------- |
| `INTEGRATIONS:CREATE` | Create new connections                               |
| `INTEGRATIONS:READ`   | View connection list and details                     |
| `INTEGRATIONS:UPDATE` | Edit existing connections                            |
| `INTEGRATIONS:DELETE` | Delete connections                                   |
| `INTEGRATIONS:SYNC`   | Run connection test and force manual synchronization |

### Route Protection

Both pages are protected by `RequirePermission` with `PERMISSIONS.INTEGRATIONS_READ`:

```typescript
<RequirePermission permission={PERMISSIONS.INTEGRATIONS_READ}>
  <IntegrationsPage />
</RequirePermission>
```

---

## Translations

All translations are under the `"integrations"` namespace in `src/lib/messages/{en,es}.json`.

### Main Sections

| Key                                     | Content                                                                                                 |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| `integrations.title`                    | Page title                                                                                              |
| `integrations.description`              | Page description                                                                                        |
| `integrations.providers.vtex.*`         | VTEX provider name, description, addConnection                                                          |
| `integrations.providers.mercadolibre.*` | MercadoLibre provider name, description                                                                 |
| `integrations.enabledBanner.*`          | Banner text (enabled, disabled, goToSettings)                                                           |
| `integrations.form.*`                   | Form labels (accountName, storeName, appKey, appToken, etc.)                                            |
| `integrations.fields.*`                 | Read-only field labels (status, connectedAt, lastSync, syncedOrders, lastError)                         |
| `integrations.status.*`                 | Status labels (connected, disconnected, error)                                                          |
| `integrations.actions.*`                | Action buttons (test, sync, edit, delete, connect)                                                      |
| `integrations.syncDirection.*`          | Direction labels (inbound, outbound, bidirectional)                                                     |
| `integrations.messages.*`               | Success/error messages (created, updated, deleted, testSuccess, testFailed, syncStarted, confirmDelete) |
| `integrations.syncLogs.*`               | Logs tab (title, columns)                                                                               |
| `integrations.skuMapping.*`             | SKU mappings tab (title, added, deleted, form labels)                                                   |
| `integrations.failedSyncs.*`            | Failed syncs tab (title, retrySuccess, retryAllSuccess)                                                 |
| `integrations.detail.*`                 | Detail page (info, notFound, notFoundDescription)                                                       |
| `integrations.list.*`                   | List (empty, emptyDescription)                                                                          |
| `integrations.error.*`                  | Error messages (loading)                                                                                |

---

## API Endpoints Consumed

| Method | Endpoint                                    | Description                                                |
| ------ | ------------------------------------------- | ---------------------------------------------------------- |
| GET    | `/integrations`                             | List connections (filters: `provider`, `status`)           |
| GET    | `/integrations/:id`                         | Connection detail                                          |
| POST   | `/integrations`                             | Create connection (body includes credentials in plaintext) |
| PATCH  | `/integrations/:id`                         | Update connection                                          |
| DELETE | `/integrations/:id`                         | Delete connection                                          |
| POST   | `/integrations/:id/test`                    | Test connectivity with the platform                        |
| POST   | `/integrations/:id/sync`                    | Trigger manual synchronization                             |
| GET    | `/integrations/:id/logs`                    | Sync logs (paginated, filter: `action`, `page`, `limit`)   |
| GET    | `/integrations/:id/sku-mappings`            | SKU mappings for the connection                            |
| POST   | `/integrations/:id/sku-mappings`            | Create SKU mapping                                         |
| DELETE | `/integrations/:id/sku-mappings/:mappingId` | Delete SKU mapping                                         |
| GET    | `/integrations/:id/unmatched-skus`          | External SKUs without mapping                              |
| POST   | `/integrations/:id/retry/:logId`            | Retry a failed log                                         |
| POST   | `/integrations/:id/retry-all`               | Retry all failed logs                                      |

**Response pattern**: `{ success: boolean, message: string, data: T | T[], timestamp: string }` (log lists include `pagination`).

**Credentials**: Sent in plaintext via HTTPS. The backend encrypts them with AES-256-GCM. Credentials are **never** returned to the frontend.

---

## Adding a New Provider (Guide)

To integrate a new platform (e.g., MercadoLibre), follow these steps:

### 1. Add type to the union type

In `integration-connection.entity.ts`:

```typescript
export type IntegrationProvider = "VTEX" | "MERCADOLIBRE" | "NEW_PROVIDER";
```

### 2. Create provider header component

Create `presentation/components/new-provider-header.tsx` (similar to `vtex-provider-header.tsx`). It displays statistics and a description specific to the provider.

### 3. Create connection form component

Create `presentation/components/new-connection-form.tsx` with provider-specific fields (credentials, configuration). Add the corresponding Zod schema in `schemas/`.

### 4. Add tab to the main page

In `integrations-page.tsx`, replace the `ComingSoonProviderTab` for the provider with a `ProviderTabContent` with its own header and form:

```tsx
<TabsContent value="new-provider">
  <NewProviderTabContent provider="NEW_PROVIDER" />
</TabsContent>
```

### 5. Add translations

In `src/lib/messages/{en,es}.json`, under `integrations.providers`:

```json
{
  "integrations": {
    "providers": {
      "newprovider": {
        "name": "New Provider",
        "description": "Provider description",
        "addConnection": "Add connection"
      }
    }
  }
}
```

### 6. Create backend module

In the backend (`improved-parakeet`), create `src/integrations/new-provider/` with:

- Provider API client
- Webhook controller (if applicable)
- Polling job (if applicable)
- Mappers from external orders to Nevada sales

### 7. Export from barrel

Add the new components to the `index.ts` barrel file for components.

---

## Troubleshooting

### Connection test fails with "Unauthorized"

- Verify that the VTEX `appKey` and `appToken` are correct and have the required permissions in the VTEX admin panel.
- Ensure the `accountName` matches exactly (case-sensitive, alphanumeric and hyphens only).

### Sync runs but no orders appear

- Check the **Sync Logs** tab for entries with action `SKIPPED` or `FAILED`.
- Verify the `syncDirection` is set to `INBOUND` or `BIDIRECTIONAL`.
- Ensure the connection status is `CONNECTED` (not `DISCONNECTED` or `ERROR`).

### Unmapped SKUs keep appearing

- Navigate to the **SKU Mappings** tab and map each external SKU to its corresponding Nevada product.
- The **Unmatched SKUs Alert** on the detail page lists all SKUs that failed to match. Use the inline form to create mappings.

### Feature gate banner shows "disabled"

- An admin must enable integrations from the **Settings** page. The banner provides a direct link.
- After enabling, refresh the page or navigate away and back.

### Sync logs show "OUTBOUND_FAILED"

- This indicates that Nevada failed to push a status change back to the external platform.
- Check the `errorMessage` in the log entry for details.
- Use the **Failed Syncs** tab to retry individual entries or all failed entries at once.

### Bidirectional sync causes duplicate orders

- The backend uses an **anti-loop guard** (`skipOutbound` flag) to prevent this. If duplicates occur, check that the backend is running the latest version with the anti-loop mechanism.
- Verify in the sync logs that inbound entries are not triggering outbound events.

### Form does not show company selector

- The `companyId` field only appears when `multiCompanyEnabled` is active in the organization settings.

### Credentials are not returned after saving

- This is by design. Credentials are encrypted server-side with AES-256-GCM and are never sent back to the frontend. When editing, leave credential fields blank to keep existing values.

---

## Technical Notes

- **Anti-loop guard**: The backend uses a `skipOutbound` flag during inbound sync to prevent infinite loops when synchronization is bidirectional (an incoming order does not trigger an outbound event).
- **Credentials in edit mode**: The edit form shows placeholders in credential fields. If the user leaves them empty, the backend does not modify the existing credentials.
- **Multi-company**: The `companyId` field in the form only appears when `multiCompanyEnabled` is active in the organization.
- **Contacts dependency**: The form uses `useContacts()` for the default contact select. The form uses `useWarehouses()` for the default warehouse select.
