# Modulo de Integraciones

> [English](./integrations.md) | **[Espanol](./integrations.es.md)**

Documentacion completa del modulo de integraciones del frontend (VTEX + extensible).

---

## Tabla de Contenidos

- [Proposito](#proposito)
- [Ruta y Paginas](#ruta-y-paginas)
- [Estructura del Modulo](#estructura-del-modulo)
- [Entidades de Dominio](#entidades-de-dominio)
- [DTOs](#dtos)
- [Mappers](#mappers)
- [Puerto e Implementacion](#puerto-e-implementacion)
- [Hooks (React Query)](#hooks-react-query)
- [Schemas (Zod)](#schemas-zod)
- [Componentes](#componentes)
- [Pantalla Principal (Tabs por Proveedor)](#pantalla-principal-tabs-por-proveedor)
- [Pantalla de Detalle](#pantalla-de-detalle)
- [Feature Gate](#feature-gate)
- [Permisos](#permisos)
- [Traducciones](#traducciones)
- [API Endpoints Consumidos](#api-endpoints-consumidos)
- [Agregar un Nuevo Proveedor (Guia)](#agregar-un-nuevo-proveedor-guia)
- [Solucion de Problemas](#solucion-de-problemas)

---

## Proposito

Gestiona las conexiones con plataformas e-commerce externas para sincronizar pedidos, productos y contactos de forma automatica.

- **VTEX** es el primer proveedor implementado, con soporte completo de sincronizacion inbound/outbound.
- **MercadoLibre** esta previsto como segundo proveedor (placeholder "Coming Soon" ya visible en la UI).
- El modulo soporta multiples conexiones simultaneas por proveedor, con mapeo de SKU y manejo de sincronizaciones fallidas.

---

## Ruta y Paginas

| Recurso            | Ubicacion                                                           |
| ------------------ | ------------------------------------------------------------------- |
| **Modulo**         | `src/modules/integrations/`                                         |
| **Pagina lista**   | `src/app/[locale]/(dashboard)/dashboard/integrations/page.tsx`      |
| **Pagina detalle** | `src/app/[locale]/(dashboard)/dashboard/integrations/[id]/page.tsx` |
| **URL lista**      | `/dashboard/integrations`                                           |
| **URL detalle**    | `/dashboard/integrations/[id]`                                      |
| **Sidebar**        | Icono `Plug`, despues de Imports, antes de Users                    |

---

## Estructura del Modulo

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
│       └── integration.repository.port.ts   # IntegrationRepositoryPort (14 metodos) + PaginatedResult<T>
├── domain/
│   └── entities/
│       ├── integration-connection.entity.ts # IntegrationConnection + types (Provider, Status, Strategy, Direction)
│       └── integration-sync-log.entity.ts   # IntegrationSyncLog + SyncAction type
├── infrastructure/
│   └── adapters/
│       └── integration-api.adapter.ts       # IntegrationApiAdapter -- implementa el port via apiClient
└── presentation/
    ├── components/
    │   ├── connection-card.tsx               # Card individual de conexion
    │   ├── connection-status-badge.tsx       # Badge con color segun estado
    │   ├── coming-soon-provider-tab.tsx      # Placeholder para proveedores futuros
    │   ├── failed-syncs-tab.tsx              # Tab de syncs fallidos con retry
    │   ├── integration-list.tsx              # Lista legacy de conexiones (deprecated)
    │   ├── integrations-enabled-banner.tsx   # Banner de estado habilitado/deshabilitado
    │   ├── integrations-page.tsx             # Pagina principal con tabs por proveedor
    │   ├── provider-tab-content.tsx          # Contenido de tab: header + cards + form + delete
    │   ├── sku-mapping-form.tsx              # Form para agregar mapeo SKU
    │   ├── sku-mapping-table.tsx             # Tabla de mapeos SKU
    │   ├── sync-log-table.tsx               # Tabla de logs de sincronizacion
    │   ├── unmatched-skus-alert.tsx          # Alerta de SKUs sin mapear
    │   ├── vtex-connection-detail.tsx        # Pagina detalle con tabs (logs, SKU, failed)
    │   ├── vtex-connection-form.tsx          # Form dialog crear/editar conexion VTEX
    │   ├── vtex-provider-header.tsx          # Header descriptivo con estadisticas
    │   └── index.ts                         # Barrel exports
    ├── hooks/
    │   └── use-integrations.ts              # 14 hooks React Query + query key factory
    └── schemas/
        └── integration-connection.schema.ts # Zod schemas + helpers toCreateConnectionDto/toUpdateConnectionDto
```

---

## Entidades de Dominio

### IntegrationConnection

Entidad que representa una conexion activa con una plataforma e-commerce. Extiende `Entity<string>` de `@/shared/domain`.

**Props** (`IntegrationConnectionProps`):

| Propiedad            | Tipo                  | Descripcion                                           |
| -------------------- | --------------------- | ----------------------------------------------------- |
| `id`                 | `string`              | UUID de la conexion                                   |
| `provider`           | `IntegrationProvider` | Proveedor: `"VTEX"` o `"MERCADOLIBRE"`                |
| `accountName`        | `string`              | Nombre de cuenta en la plataforma (ej: `"mi-tienda"`) |
| `storeName`          | `string`              | Nombre descriptivo de la tienda                       |
| `status`             | `ConnectionStatus`    | `"CONNECTED"`, `"DISCONNECTED"` o `"ERROR"`           |
| `syncStrategy`       | `SyncStrategy`        | `"WEBHOOK"`, `"POLLING"` o `"BOTH"`                   |
| `syncDirection`      | `SyncDirection`       | `"INBOUND"`, `"OUTBOUND"` o `"BIDIRECTIONAL"`         |
| `defaultWarehouseId` | `string`              | Bodega por defecto para ordenes sincronizadas         |
| `warehouseName`      | `string \| null`      | Nombre de la bodega (joined desde backend)            |
| `defaultContactId`   | `string \| null`      | Contacto por defecto para ordenes VTEX                |
| `defaultContactName` | `string \| null`      | Nombre del contacto (joined)                          |
| `companyId`          | `string \| null`      | Empresa asociada (multi-company)                      |
| `companyName`        | `string \| null`      | Nombre de la empresa (joined)                         |
| `connectedAt`        | `Date \| null`        | Fecha de conexion exitosa                             |
| `lastSyncAt`         | `Date \| null`        | Ultima sincronizacion                                 |
| `lastSyncError`      | `string \| null`      | Ultimo error de sincronizacion                        |
| `syncedOrdersCount`  | `number`              | Total de ordenes sincronizadas                        |
| `createdAt`          | `Date`                | Fecha de creacion                                     |
| `updatedAt`          | `Date`                | Fecha de actualizacion                                |

**Getters computados**:

| Getter        | Retorno   | Logica                   |
| ------------- | --------- | ------------------------ |
| `isConnected` | `boolean` | `status === "CONNECTED"` |
| `hasError`    | `boolean` | `status === "ERROR"`     |

### IntegrationSyncLog

Entidad que representa un registro individual de sincronizacion. Extiende `Entity<string>`.

**Props** (`IntegrationSyncLogProps`):

| Propiedad         | Tipo              | Descripcion                                    |
| ----------------- | ----------------- | ---------------------------------------------- |
| `id`              | `string`          | UUID del log                                   |
| `connectionId`    | `string`          | ID de la conexion asociada                     |
| `externalOrderId` | `string`          | ID del pedido en la plataforma externa         |
| `action`          | `SyncAction`      | Accion realizada                               |
| `saleId`          | `string \| null`  | ID de la venta creada en Nevada                |
| `contactId`       | `string \| null`  | ID del contacto creado/asociado                |
| `errorMessage`    | `string \| null`  | Mensaje de error (si fallo)                    |
| `rawPayload`      | `unknown \| null` | Payload original (no expuesto en API de lista) |
| `processedAt`     | `Date`            | Fecha de procesamiento                         |

**Getters computados**:

| Getter             | Retorno   | Logica                         |
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

| DTO                                      | Uso                                                                                                                                                 |
| ---------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| `IntegrationConnectionResponseDto`       | Un registro de conexion (raw de API, fechas como `string`)                                                                                          |
| `IntegrationConnectionListResponseDto`   | `{ success, message, data: ResponseDto[], timestamp }`                                                                                              |
| `IntegrationConnectionDetailResponseDto` | `{ success, message, data: ResponseDto, timestamp }`                                                                                                |
| `CreateIntegrationConnectionDto`         | Body para crear: provider, accountName, storeName, appKey, appToken, syncStrategy, syncDirection, defaultWarehouseId, defaultContactId?, companyId? |
| `UpdateIntegrationConnectionDto`         | Body para actualizar: todos opcionales excepto credenciales                                                                                         |
| `IntegrationConnectionFilters`           | Filtros de lista: `provider?`, `status?`                                                                                                            |
| `TestConnectionResponseDto`              | `{ success, message, timestamp }`                                                                                                                   |
| `TriggerSyncResponseDto`                 | `{ success, message, timestamp }`                                                                                                                   |

### SyncLog DTOs (`integration-sync-log.dto.ts`)

| DTO                                 | Uso                                                           |
| ----------------------------------- | ------------------------------------------------------------- |
| `IntegrationSyncLogResponseDto`     | Un registro de log (sin `rawPayload`)                         |
| `IntegrationSyncLogListResponseDto` | `{ success, message, data: LogDto[], pagination, timestamp }` |
| `SyncLogFilters`                    | `action?`, `page?`, `limit?`                                  |

### SKU Mapping DTOs (`integration-sku-mapping.dto.ts`)

| DTO                                    | Uso                                                                              |
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

Convierte strings de fecha a `Date`, normaliza campos nullable con `?? null`, y parsea `syncedOrdersCount` con fallback a `0`.

### IntegrationSyncLogMapper

```typescript
class IntegrationSyncLogMapper {
  static toDomain(dto: IntegrationSyncLogResponseDto): IntegrationSyncLog;
}
```

Convierte `processedAt` a `Date`. El campo `rawPayload` se setea a `null` (no incluido en la API de lista).

---

## Puerto e Implementacion

### IntegrationRepositoryPort

Define 14 metodos:

| Metodo             | Parametros                           | Retorno                               | Descripcion                              |
| ------------------ | ------------------------------------ | ------------------------------------- | ---------------------------------------- |
| `findAll`          | `filters?`                           | `IntegrationConnection[]`             | Listar conexiones con filtros opcionales |
| `findById`         | `id`                                 | `IntegrationConnection \| null`       | Obtener conexion por ID                  |
| `create`           | `CreateIntegrationConnectionDto`     | `IntegrationConnection`               | Crear nueva conexion                     |
| `update`           | `id, UpdateIntegrationConnectionDto` | `IntegrationConnection`               | Actualizar conexion                      |
| `delete`           | `id`                                 | `void`                                | Eliminar conexion                        |
| `testConnection`   | `id`                                 | `TestConnectionResponseDto`           | Probar conectividad con la plataforma    |
| `triggerSync`      | `id`                                 | `TriggerSyncResponseDto`              | Forzar sincronizacion manual             |
| `getSyncLogs`      | `id, filters?`                       | `PaginatedResult<IntegrationSyncLog>` | Logs de sincronizacion (paginados)       |
| `getSkuMappings`   | `connectionId`                       | `IntegrationSkuMappingResponseDto[]`  | Mapeos de SKU de la conexion             |
| `createSkuMapping` | `connectionId, CreateSkuMappingDto`  | `IntegrationSkuMappingResponseDto`    | Crear mapeo de SKU                       |
| `deleteSkuMapping` | `connectionId, mappingId`            | `void`                                | Eliminar mapeo de SKU                    |
| `getUnmatchedSkus` | `connectionId`                       | `UnmatchedSkuDto[]`                   | SKUs externos sin mapeo                  |
| `retrySyncLog`     | `connectionId, logId`                | `void`                                | Reintentar un log fallido                |
| `retryAllFailed`   | `connectionId`                       | `void`                                | Reintentar todos los fallidos            |

`PaginatedResult<T>` esta definido **localmente** en este port file (patron del proyecto: cada modulo define su propio `PaginatedResult`).

### IntegrationApiAdapter

Implementa `IntegrationRepositoryPort` usando `apiClient` de `@/shared/infrastructure/http`.

**Base path**: `/integrations`

| Metodo             | Endpoint                                      | HTTP Method |
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

Archivo: `use-integrations.ts`

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

| Hook                                | Tipo     | Descripcion                        | Invalidaciones                         |
| ----------------------------------- | -------- | ---------------------------------- | -------------------------------------- |
| `useIntegrations(filters?)`         | Query    | Lista de conexiones                | -                                      |
| `useIntegration(id)`                | Query    | Detalle de una conexion            | -                                      |
| `useCreateIntegration()`            | Mutation | Crear conexion                     | `lists()`                              |
| `useUpdateIntegration()`            | Mutation | Actualizar conexion                | `lists()`, `detail(id)`                |
| `useDeleteIntegration()`            | Mutation | Eliminar conexion                  | `lists()`                              |
| `useTestIntegration()`              | Mutation | Probar conectividad                | -                                      |
| `useTriggerSync()`                  | Mutation | Forzar sync manual                 | `detail(id)`, `logs(id)`               |
| `useSyncLogs(id, filters?)`         | Query    | Logs de sincronizacion (paginados) | -                                      |
| `useSkuMappings(connectionId)`      | Query    | Mapeos de SKU                      | -                                      |
| `useCreateSkuMapping(connectionId)` | Mutation | Crear mapeo SKU                    | `skuMappings(id)`, `unmatchedSkus(id)` |
| `useDeleteSkuMapping(connectionId)` | Mutation | Eliminar mapeo SKU                 | `skuMappings(id)`                      |
| `useUnmatchedSkus(connectionId)`    | Query    | SKUs sin mapear                    | -                                      |
| `useRetrySyncLog(connectionId)`     | Mutation | Reintentar un log fallido          | `logs(id)`, `detail(id)`               |
| `useRetryAllFailed(connectionId)`   | Mutation | Reintentar todos los fallidos      | `logs(id)`, `detail(id)`               |

**Stale time**: 5 minutos (`STALE_TIME = 5 * 60 * 1000`).

Todas las mutations muestran `toast.success` en exito y `toast.error` (via `getApiErrorMessage`) en error.

---

## Schemas (Zod)

Archivo: `integration-connection.schema.ts`

### vtexConnectionSchema

Schema para crear una conexion VTEX:

| Campo                | Validacion                                                                   |
| -------------------- | ---------------------------------------------------------------------------- |
| `accountName`        | `string`, min 1, max 100, regex `/^[a-zA-Z0-9-]+$/` (alfanumerico + guiones) |
| `storeName`          | `string`, min 1, max 200                                                     |
| `appKey`             | `string`, min 1                                                              |
| `appToken`           | `string`, min 1                                                              |
| `syncStrategy`       | enum `["WEBHOOK", "POLLING", "BOTH"]`                                        |
| `syncDirection`      | enum `["INBOUND", "OUTBOUND", "BIDIRECTIONAL"]`                              |
| `defaultWarehouseId` | `string`, min 1                                                              |
| `defaultContactId`   | `string`, optional                                                           |
| `companyId`          | `string`, optional                                                           |

### updateConnectionSchema

Igual que `vtexConnectionSchema` pero `appKey` y `appToken` son opcionales (se pueden dejar en blanco para no cambiar las credenciales).

### skuMappingSchema

| Campo         | Validacion      |
| ------------- | --------------- |
| `externalSku` | `string`, min 1 |
| `productId`   | `string`, min 1 |

### Helpers

```typescript
toCreateConnectionDto(data: VtexConnectionFormData): CreateIntegrationConnectionDto
// Agrega provider: "VTEX", limpia campos vacios a undefined

toUpdateConnectionDto(data): UpdateIntegrationConnectionDto
// Omite provider y accountName, limpia campos vacios a undefined
```

---

## Componentes

| Componente                  | Props                                                       | Descripcion                                                                                                                                                      |
| --------------------------- | ----------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `IntegrationsPage`          | -                                                           | Pagina principal con titulo, banner y tabs por proveedor (VTEX, MercadoLibre)                                                                                    |
| `IntegrationsEnabledBanner` | -                                                           | Banner informativo: verde si `integrationsEnabled`, ambar si deshabilitado. Link a Settings.                                                                     |
| `ProviderTabContent`        | `provider: IntegrationProvider`                             | Contenido del tab VTEX: header, grid de cards, boton agregar, form dialog, confirm delete                                                                        |
| `VtexProviderHeader`        | `connections: IntegrationConnection[]`                      | Header descriptivo del proveedor con estadisticas (total conexiones, conectadas, errores, ordenes sincronizadas)                                                 |
| `ConnectionCard`            | `connection, onTest, onSync, onDelete`                      | Card individual de conexion: nombre, cuenta, status badge, ultimo sync, ordenes, menu dropdown (test/sync/edit/delete)                                           |
| `ComingSoonProviderTab`     | `providerKey: string`                                       | Placeholder para proveedores futuros (MercadoLibre)                                                                                                              |
| `ConnectionStatusBadge`     | `status: ConnectionStatus`                                  | Badge con variante de color segun estado: success (CONNECTED), secondary (DISCONNECTED), destructive (ERROR)                                                     |
| `VtexConnectionForm`        | `open, onOpenChange, mode: "create" \| "edit", connection?` | Dialog para crear o editar conexion VTEX. Incluye selects de warehouse, contact, company (si multiCompanyEnabled). Campos de credenciales con `type="password"`. |
| `VtexConnectionDetail`      | `connectionId: string`                                      | Pagina detalle completa: header con acciones (test, sync, edit, delete), card de info, alerta de SKUs sin mapear, tabs (logs, SKU mappings, failed syncs)        |
| `SyncLogTable`              | `connectionId: string`                                      | Tabla paginada de logs de sincronizacion con filtro por action                                                                                                   |
| `SkuMappingTable`           | `connectionId: string`                                      | Tabla de mapeos SKU con boton eliminar por fila                                                                                                                  |
| `SkuMappingForm`            | `connectionId: string`                                      | Formulario inline para agregar un nuevo mapeo (externalSku + select de producto)                                                                                 |
| `UnmatchedSkusAlert`        | `connectionId: string`                                      | Alerta que aparece cuando existen SKUs externos sin mapeo; muestra lista con detalle                                                                             |
| `FailedSyncsTab`            | `connectionId: string`                                      | Tab que muestra syncs fallidos (FAILED + OUTBOUND_FAILED) con botones retry individual y retry all                                                               |
| `IntegrationList`           | -                                                           | Lista legacy de conexiones sin tabs (deprecated; usar IntegrationsPage en su lugar)                                                                              |

---

## Pantalla Principal (Tabs por Proveedor)

URL: `/dashboard/integrations`

### Layout

1. **Titulo y descripcion** del modulo
2. **IntegrationsEnabledBanner** -- muestra si las integraciones estan habilitadas o deshabilitadas en la organizacion
3. **Tabs** con un tab por proveedor:

#### Tab VTEX

- `VtexProviderHeader` con estadisticas de conexiones
- Grid responsivo (1-2-3 columnas) de `ConnectionCard`
- Boton "Agregar conexion" que abre `VtexConnectionForm` en modo create
- AlertDialog de confirmacion para eliminar

#### Tab MercadoLibre

- `ComingSoonProviderTab` -- placeholder con mensaje "proximamente"

### Flujo de Interaccion

1. El usuario ve las tarjetas de conexiones existentes
2. Puede testear conexion, forzar sync, o eliminar desde el dropdown de cada card
3. Click en el nombre de la tienda navega a la pagina de detalle
4. Boton "Agregar" abre el dialog de creacion

---

## Pantalla de Detalle

URL: `/dashboard/integrations/[id]`

### Layout

1. **Header**:
   - Boton "Volver" a lista
   - Nombre de tienda + proveedor + cuenta
   - Acciones: Test, Sync (deshabilitado si no CONNECTED), Edit, Delete

2. **Card de Informacion**:
   - Status badge
   - Sync strategy y direction badges
   - Bodega por defecto
   - Contacto por defecto (si existe)
   - Empresa (si existe)
   - Fecha de conexion, ultimo sync, ordenes sincronizadas
   - Ultimo error (si existe, en rojo, col-span completo)

3. **UnmatchedSkusAlert** -- solo visible si hay SKUs sin mapear

4. **Tabs**:
   - **Sync Logs**: `SyncLogTable` con paginacion y filtro por action
   - **SKU Mappings**: `SkuMappingForm` + `SkuMappingTable`
   - **Failed Syncs**: `FailedSyncsTab` con retry individual y retry-all

5. **Dialogs modales**:
   - `VtexConnectionForm` en modo edit (se abre desde boton Edit)
   - AlertDialog de confirmacion para eliminar (redirige a lista despues)

---

## Feature Gate

Las integraciones estan gated por el setting de organizacion `integrationsEnabled`:

```typescript
const { integrationsEnabled } = useOrgSettings();
```

### Comportamiento

| Estado            | Efecto                                                                                                                 |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------- |
| **Habilitado**    | Banner verde, sidebar visible, funcionalidad completa                                                                  |
| **Deshabilitado** | Banner ambar con advertencia, el usuario puede ver la pagina pero las operaciones de sync no se ejecutan en el backend |

### Activacion

Se activa desde la pagina de **Settings** (admin-only). El banner incluye un link directo a Settings para activar/desactivar.

---

## Permisos

| Permiso               | Uso                                                      |
| --------------------- | -------------------------------------------------------- |
| `INTEGRATIONS:CREATE` | Crear nuevas conexiones                                  |
| `INTEGRATIONS:READ`   | Ver lista y detalle de conexiones                        |
| `INTEGRATIONS:UPDATE` | Editar conexiones existentes                             |
| `INTEGRATIONS:DELETE` | Eliminar conexiones                                      |
| `INTEGRATIONS:SYNC`   | Ejecutar test de conexion y forzar sincronizacion manual |

### Proteccion de Ruta

Ambas paginas estan protegidas por `RequirePermission` con `PERMISSIONS.INTEGRATIONS_READ`:

```typescript
<RequirePermission permission={PERMISSIONS.INTEGRATIONS_READ}>
  <IntegrationsPage />
</RequirePermission>
```

---

## Traducciones

Todas las traducciones estan bajo el namespace `"integrations"` en `src/lib/messages/{en,es}.json`.

### Secciones principales

| Clave                                   | Contenido                                                                                                |
| --------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| `integrations.title`                    | Titulo de la pagina                                                                                      |
| `integrations.description`              | Descripcion de la pagina                                                                                 |
| `integrations.providers.vtex.*`         | Nombre, descripcion, addConnection del proveedor VTEX                                                    |
| `integrations.providers.mercadolibre.*` | Nombre, descripcion del proveedor MercadoLibre                                                           |
| `integrations.enabledBanner.*`          | Textos del banner (enabled, disabled, goToSettings)                                                      |
| `integrations.form.*`                   | Labels del formulario (accountName, storeName, appKey, appToken, etc.)                                   |
| `integrations.fields.*`                 | Labels de campos de lectura (status, connectedAt, lastSync, syncedOrders, lastError)                     |
| `integrations.status.*`                 | Labels de estados (connected, disconnected, error)                                                       |
| `integrations.actions.*`                | Botones de accion (test, sync, edit, delete, connect)                                                    |
| `integrations.syncDirection.*`          | Labels de direccion (inbound, outbound, bidirectional)                                                   |
| `integrations.messages.*`               | Mensajes de exito/error (created, updated, deleted, testSuccess, testFailed, syncStarted, confirmDelete) |
| `integrations.syncLogs.*`               | Tab de logs (title, columns)                                                                             |
| `integrations.skuMapping.*`             | Tab de mapeos SKU (title, added, deleted, form labels)                                                   |
| `integrations.failedSyncs.*`            | Tab de syncs fallidos (title, retrySuccess, retryAllSuccess)                                             |
| `integrations.detail.*`                 | Pagina de detalle (info, notFound, notFoundDescription)                                                  |
| `integrations.list.*`                   | Lista (empty, emptyDescription)                                                                          |
| `integrations.error.*`                  | Mensajes de error (loading)                                                                              |

---

## API Endpoints Consumidos

| Metodo | Endpoint                                    | Descripcion                                                 |
| ------ | ------------------------------------------- | ----------------------------------------------------------- |
| GET    | `/integrations`                             | Listar conexiones (filtros: `provider`, `status`)           |
| GET    | `/integrations/:id`                         | Detalle de conexion                                         |
| POST   | `/integrations`                             | Crear conexion (body incluye credenciales en plaintext)     |
| PATCH  | `/integrations/:id`                         | Actualizar conexion                                         |
| DELETE | `/integrations/:id`                         | Eliminar conexion                                           |
| POST   | `/integrations/:id/test`                    | Probar conectividad con la plataforma                       |
| POST   | `/integrations/:id/sync`                    | Disparar sincronizacion manual                              |
| GET    | `/integrations/:id/logs`                    | Logs de sync (paginados, filtro: `action`, `page`, `limit`) |
| GET    | `/integrations/:id/sku-mappings`            | Mapeos de SKU de la conexion                                |
| POST   | `/integrations/:id/sku-mappings`            | Crear mapeo SKU                                             |
| DELETE | `/integrations/:id/sku-mappings/:mappingId` | Eliminar mapeo SKU                                          |
| GET    | `/integrations/:id/unmatched-skus`          | SKUs externos sin mapeo                                     |
| POST   | `/integrations/:id/retry/:logId`            | Reintentar un log fallido                                   |
| POST   | `/integrations/:id/retry-all`               | Reintentar todos los fallidos                               |

**Patron de respuesta**: `{ success: boolean, message: string, data: T | T[], timestamp: string }` (listas de logs incluyen `pagination`).

**Credenciales**: Se envian en plaintext via HTTPS. El backend las encripta con AES-256-GCM. Las credenciales **nunca** se retornan al frontend.

---

## Agregar un Nuevo Proveedor (Guia)

Para integrar una nueva plataforma (ej: MercadoLibre), seguir estos pasos:

### 1. Agregar tipo al union type

En `integration-connection.entity.ts`:

```typescript
export type IntegrationProvider = "VTEX" | "MERCADOLIBRE" | "NUEVO_PROVEEDOR";
```

### 2. Crear componente header del proveedor

Crear `presentation/components/nuevo-provider-header.tsx` (similar a `vtex-provider-header.tsx`). Muestra estadisticas y descripcion especifica del proveedor.

### 3. Crear componente de formulario de conexion

Crear `presentation/components/nuevo-connection-form.tsx` con los campos especificos del proveedor (credenciales, configuracion). Agregar schema Zod correspondiente en `schemas/`.

### 4. Agregar tab en la pagina principal

En `integrations-page.tsx`, reemplazar el `ComingSoonProviderTab` del proveedor por un `ProviderTabContent` con su propio header y form:

```tsx
<TabsContent value="nuevo-proveedor">
  <NuevoProviderTabContent provider="NUEVO_PROVEEDOR" />
</TabsContent>
```

### 5. Agregar traducciones

En `src/lib/messages/{en,es}.json`, bajo `integrations.providers`:

```json
{
  "integrations": {
    "providers": {
      "nuevoproveedor": {
        "name": "Nuevo Proveedor",
        "description": "Descripcion del proveedor",
        "addConnection": "Agregar conexion"
      }
    }
  }
}
```

### 6. Crear modulo backend

En el backend (`improved-parakeet`), crear `src/integrations/nuevo-proveedor/` con:

- Cliente API del proveedor
- Webhook controller (si aplica)
- Polling job (si aplica)
- Mappers de ordenes externas a ventas Nevada

### 7. Exportar desde barrel

Agregar los nuevos componentes al `index.ts` del barrel de componentes.

---

## Solucion de Problemas

### El test de conexion falla con "Unauthorized"

- Verificar que el `appKey` y `appToken` de VTEX sean correctos y tengan los permisos necesarios en el panel de administracion de VTEX.
- Asegurarse de que el `accountName` coincida exactamente (sensible a mayusculas/minusculas, solo alfanumerico y guiones).

### La sincronizacion se ejecuta pero no aparecen ordenes

- Revisar la pestana **Sync Logs** buscando entradas con accion `SKIPPED` o `FAILED`.
- Verificar que el `syncDirection` este configurado como `INBOUND` o `BIDIRECTIONAL`.
- Asegurarse de que el estado de la conexion sea `CONNECTED` (no `DISCONNECTED` ni `ERROR`).

### Los SKUs sin mapear siguen apareciendo

- Navegar a la pestana **SKU Mappings** y mapear cada SKU externo a su producto Nevada correspondiente.
- La **alerta de SKUs sin mapear** en la pagina de detalle lista todos los SKUs que no pudieron emparejarse. Usar el formulario inline para crear los mapeos.

### El banner de feature gate muestra "deshabilitado"

- Un administrador debe habilitar las integraciones desde la pagina de **Settings**. El banner proporciona un enlace directo.
- Despues de habilitar, refrescar la pagina o navegar fuera y volver.

### Los sync logs muestran "OUTBOUND_FAILED"

- Esto indica que Nevada no pudo enviar un cambio de estado de vuelta a la plataforma externa.
- Revisar el `errorMessage` en la entrada del log para mas detalles.
- Usar la pestana **Failed Syncs** para reintentar entradas individuales o todas las fallidas a la vez.

### La sincronizacion bidireccional causa ordenes duplicadas

- El backend usa un **anti-loop guard** (flag `skipOutbound`) para prevenir esto. Si aparecen duplicados, verificar que el backend este ejecutando la version mas reciente con el mecanismo anti-loop.
- Verificar en los sync logs que las entradas inbound no esten disparando eventos outbound.

### El formulario no muestra el selector de empresa

- El campo `companyId` solo aparece cuando `multiCompanyEnabled` esta activo en la configuracion de la organizacion.

### Las credenciales no se devuelven despues de guardar

- Esto es por diseno. Las credenciales se encriptan en el servidor con AES-256-GCM y nunca se envian de vuelta al frontend. Al editar, dejar los campos de credenciales en blanco para mantener los valores existentes.

---

## Notas Tecnicas

- **Anti-loop guard**: El backend usa un flag `skipOutbound` en el sync inbound para evitar loops infinitos cuando la sincronizacion es bidireccional (una orden entrante no dispara un evento de salida).
- **Credenciales en modo edicion**: El formulario de edicion muestra placeholders en los campos de credenciales. Si el usuario los deja vacios, el backend no modifica las credenciales existentes.
- **Multi-company**: El campo `companyId` en el formulario solo aparece cuando `multiCompanyEnabled` esta activo en la organizacion.
- **Dependencia con Contacts**: El formulario usa `useContacts()` para el select de contacto por defecto. El formulario usa `useWarehouses()` para el select de bodega.
