# Guia de Modulos

Documentacion detallada de los 11 modulos de negocio del frontend.

---

## Tabla de Contenidos

- [Authentication](#authentication)
- [Dashboard](#dashboard)
- [Inventory](#inventory)
- [Sales](#sales)
- [Returns](#returns)
- [Reports](#reports)
- [Users](#users)
- [Roles](#roles)
- [Audit](#audit)
- [Companies](#companies)
- [Settings](#settings)

---

## Authentication

**Ruta**: `src/modules/authentication/`
**Pagina**: `/login`

### Proposito

Gestiona el login, la sesion del usuario, tokens JWT y permisos.

### Estructura

```
authentication/
├── domain/
│   ├── entities/
│   │   └── user.entity.ts          # User con hasPermission(), hasRole()
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

### API Endpoints Consumidos

| Metodo | Endpoint        | Descripcion                |
| ------ | --------------- | -------------------------- |
| POST   | `/auth/login`   | Login con email + password |
| POST   | `/auth/refresh` | Renovar access token       |
| POST   | `/auth/logout`  | Cerrar sesion              |
| GET    | `/users/me`     | Obtener usuario actual     |

---

## Dashboard

**Ruta**: `src/modules/dashboard/`
**Pagina**: `/dashboard`

### Proposito

Muestra metricas agregadas y graficos del estado del negocio.

### Metricas

| Metrica            | Descripcion                          | Visualizacion       |
| ------------------ | ------------------------------------ | ------------------- |
| `inventorySummary` | Total productos, bodegas, categorias | Stat Cards          |
| `lowStockCount`    | Productos por debajo del minimo      | Stat Card           |
| `monthlySales`     | Ventas del mes (volumen + valor)     | Stat Card           |
| `salesTrend`       | Ingresos por dia (ultimos 7 dias)    | AreaChart           |
| `topProducts`      | Top 5 productos por ingresos         | BarChart horizontal |
| `stockByWarehouse` | Distribucion de stock por bodega     | PieChart (donut)    |
| `recentActivity`   | Ultimas actividades                  | Feed con iconos     |

### Componentes

| Componente               | Archivo                        | Descripcion                                 |
| ------------------------ | ------------------------------ | ------------------------------------------- |
| `DashboardContent`       | `dashboard-content.tsx`        | Orquestador: loading/error/empty + graficos |
| `SalesTrendChart`        | `sales-trend-chart.tsx`        | AreaChart de recharts                       |
| `TopProductsChart`       | `top-products-chart.tsx`       | BarChart horizontal                         |
| `StockDistributionChart` | `stock-distribution-chart.tsx` | PieChart donut                              |
| `RecentActivityFeed`     | `recent-activity-feed.tsx`     | Lista con iconos                            |

### API

| Metodo | Endpoint             | Descripcion                            |
| ------ | -------------------- | -------------------------------------- |
| GET    | `/dashboard/metrics` | Todas las metricas en una sola llamada |

**Respuesta**: `{ success, message, data: DashboardMetricsDto, timestamp }`

---

## Inventory

**Ruta**: `src/modules/inventory/`
**Paginas**: `/dashboard/inventory/*`

### Proposito

Gestion completa de inventario: productos, categorias, bodegas, stock, movimientos y transferencias.

### Sub-modulos

#### Products

| Componente    | Ruta                                   | Descripcion                    |
| ------------- | -------------------------------------- | ------------------------------ |
| ProductList   | `/inventory/products`                  | Lista con filtros + paginacion |
| ProductDetail | `/inventory/products/[id]`             | Detalle con stock por bodega   |
| ProductForm   | `/inventory/products/new`, `[id]/edit` | Crear/editar                   |

**Entity**: Incluye SKU, barcode, brand, precio, costMethod (AVG/FIFO), metricas de rotacion (daysOfStock, turnoverRate).

**Filtros**: status (ACTIVE/INACTIVE), category, warehouse, search.

**Notas**:

- El backend no acepta `isActive=true`, usar `status=ACTIVE`
- Tiene `statusChangedBy` y `statusChangedAt` para tracking de quien desactivo

#### Categories

| Componente   | Ruta                        | Descripcion         |
| ------------ | --------------------------- | ------------------- |
| CategoryList | `/inventory/categories`     | Lista de categorias |
| CategoryForm | `/inventory/categories/new` | Crear/editar        |

#### Warehouses

| Componente      | Ruta                         | Descripcion             |
| --------------- | ---------------------------- | ----------------------- |
| WarehouseList   | `/inventory/warehouses`      | Lista de bodegas        |
| WarehouseDetail | `/inventory/warehouses/[id]` | Detalle con ubicaciones |

#### Stock

| Componente | Ruta               | Descripcion                          |
| ---------- | ------------------ | ------------------------------------ |
| StockList  | `/inventory/stock` | Niveles de stock por producto/bodega |

**Notas**:

- No tiene campo `id` propio — se usa ID compuesto: `${productId}-${warehouseId}`
- API no retorna nombres de producto/bodega, solo IDs
- Incluye `averageCost`, `totalValue`, `currency`

#### Movements

| Componente     | Ruta                        | Descripcion          |
| -------------- | --------------------------- | -------------------- |
| MovementList   | `/inventory/movements`      | Lista de movimientos |
| MovementDetail | `/inventory/movements/[id]` | Detalle con lineas   |
| MovementForm   | `/inventory/movements/new`  | Crear movimiento     |

**Tipos**: IN (entrada), OUT (salida), ADJUSTMENT (ajuste).

**Workflow**: `DRAFT → POSTED → VOID`

#### Transfers

| Componente     | Ruta                        | Descripcion             |
| -------------- | --------------------------- | ----------------------- |
| TransferList   | `/inventory/transfers`      | Lista de transferencias |
| TransferDetail | `/inventory/transfers/[id]` | Detalle con lineas      |
| TransferForm   | `/inventory/transfers/new`  | Crear transferencia     |

**Workflow**: `DRAFT → IN_TRANSIT → RECEIVED` (o `REJECTED` / `CANCELLED`)

**Notas**: La lista no incluye `lines`, `fromWarehouseName`, `toWarehouseName` — se usa `TransferApiRawDto` + `fromApiRaw()`.

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
  // + setters para cada uno
}
```

---

## Sales

**Ruta**: `src/modules/sales/`
**Paginas**: `/dashboard/sales/*`

### Proposito

Gestion de ventas con workflow completo de 5 estados.

### Workflow

```
DRAFT ──→ CONFIRMED ──→ PICKING ──→ SHIPPED ──→ COMPLETED
  │           │
  └─→ CANCELLED  └─→ CANCELLED                RETURNED
```

Cada transicion tiene un use case y un boton de accion en el detalle.

### Entity

```typescript
class Sale extends AggregateRoot<string> {
  // Campos principales
  saleNumber: string; // SALE-YYYY-NNN
  status: SaleStatus;
  customerId: string;
  warehouseId: string;
  lines: SaleLine[];

  // Audit trail por estado
  confirmedAt?: Date;
  confirmedBy?: string;
  pickedAt?: Date;
  shippedAt?: Date;
  completedAt?: Date;
  cancelledAt?: Date;

  // Validaciones de workflow
  get canConfirm(): boolean;
  get canStartPicking(): boolean;
  get canShip(): boolean;
  get canComplete(): boolean;
  get canCancel(): boolean;
}
```

### Componentes Clave

| Componente        | Descripcion                                       |
| ----------------- | ------------------------------------------------- |
| `SaleList`        | Lista con filtros, status badge, paginacion       |
| `SaleDetail`      | Detalle con lineas + botones de accion por estado |
| `SaleForm`        | Formulario con lineas dinamicas                   |
| `SaleTimeline`    | Timeline visual del ciclo de vida                 |
| `SaleStatusBadge` | Badge con color por estado                        |
| `SaleFilters`     | Filtros: status, dateRange, customer, warehouse   |

### API Response Pattern

La API de ventas envuelve respuestas en formato Effect:

```typescript
// Respuesta raw de la API
{ _tag: "Ok", _value: { success: true, message: "...", data: [...], pagination: {...} } }

// Se desenvuelve con unwrapResponse()
const { data, pagination } = unwrapResponse(apiResponse);
```

---

## Returns

**Ruta**: `src/modules/returns/`
**Paginas**: `/dashboard/returns/*`

### Proposito

Gestion de devoluciones de clientes y a proveedores.

### Tipos

| Tipo                   | Codigo            | Descripcion               |
| ---------------------- | ----------------- | ------------------------- |
| Devolucion de cliente  | `RETURN_CUSTOMER` | Cliente devuelve producto |
| Devolucion a proveedor | `RETURN_SUPPLIER` | Devolucion a proveedor    |

### Workflow

```
DRAFT ──→ CONFIRMED
  │
  └─→ CANCELLED
```

### Entity

```typescript
class Return extends AggregateRoot<string> {
  returnNumber: string; // RETURN-YYYY-NNN
  returnType: ReturnType; // RETURN_CUSTOMER | RETURN_SUPPLIER
  status: ReturnStatus;
  saleId?: string; // Venta original (para devoluciones de cliente)
  lines: ReturnLine[];
  reason: string;
}

class ReturnLine {
  productId: string;
  quantity: number;
  originalSalePrice: number; // Precio original de la venta
  originalUnitCost: number; // Costo unitario original
}
```

### API Response Pattern

Misma envolvente Effect que Sales — usa `unwrapResponse()`.

---

## Reports

**Ruta**: `src/modules/reports/`
**Paginas**: `/dashboard/reports`, `/dashboard/reports/[type]`

### Proposito

17 tipos de reportes con filtros dinamicos y exportacion a Excel.

### Pagina Catalogo (`/dashboard/reports`)

Muestra tarjetas agrupadas por categoria:

| Categoria        | Reportes                                                                                         |
| ---------------- | ------------------------------------------------------------------------------------------------ |
| **Inventario**   | Available Inventory, Movement History, Valuation, Low Stock, Movements, ABC Analysis, Dead Stock |
| **Ventas**       | Sales, Sales by Product, Sales by Warehouse, Financial, Turnover                                 |
| **Devoluciones** | Returns, Returns by Type, Returns by Product, Returns Customer, Returns Supplier                 |

### Pagina Visor (`/dashboard/reports/[type]`)

- Filtros dinamicos segun el tipo de reporte
- Tabla con columnas dinamicas
- Boton de exportacion a Excel

### Reportes Especiales

**ABC Analysis**: Clasificacion Pareto de productos.

- A: Top 80% de ingresos
- B: Siguiente 15%
- C: Resto 5%
- Filtros: dateRange, warehouseId, category

**Dead Stock**: Productos con stock > 0 pero sin ventas en N dias.

- Niveles de riesgo: HIGH (>180 dias), MEDIUM (90-180), LOW (<90)
- Filtros: warehouseId, deadStockDays (default 90), includeInactive

### Utilidades

```typescript
// Conversion entre tipo de reporte y slug de URL
reportTypeToSlug("ABC_ANALYSIS"); // → 'abc-analysis'
slugToReportType("abc-analysis"); // → 'ABC_ANALYSIS'
```

### API Pattern

```
GET  /reports/{module}/{name}/view    → Datos del reporte (JSON)
POST /reports/{module}/{name}/export  → Exportar (Excel/CSV)
```

---

## Users

**Ruta**: `src/modules/users/`
**Paginas**: `/dashboard/users/*`

### Proposito

CRUD de usuarios con gestion de estados y asignacion de roles.

### Estados de Usuario

| Estado     | Descripcion                                  |
| ---------- | -------------------------------------------- |
| `ACTIVE`   | Usuario activo, puede usar el sistema        |
| `INACTIVE` | Desactivado, no puede iniciar sesion         |
| `LOCKED`   | Bloqueado (ej: demasiados intentos fallidos) |

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
// Respuesta: { success, message, data: UserDto[], pagination, timestamp }
```

---

## Roles

**Ruta**: `src/modules/roles/`
**Paginas**: `/dashboard/roles/*`

### Proposito

CRUD de roles (sistema y personalizados) con gestion de permisos.

### Tipos de Roles

| Tipo     | Descripcion                                  | Editable     |
| -------- | -------------------------------------------- | ------------ |
| `SYSTEM` | Roles predefinidos (ADMIN, SUPERVISOR, etc.) | Solo lectura |
| `CUSTOM` | Roles personalizados por organizacion        | Si           |

### Roles del Sistema

| Rol                  | Descripcion                      |
| -------------------- | -------------------------------- |
| `SYSTEM_ADMIN`       | Acceso total, bypass de permisos |
| `ADMIN`              | Administrador de organizacion    |
| `SUPERVISOR`         | Supervisor operativo             |
| `WAREHOUSE_OPERATOR` | Operador de bodega               |
| `CONSULTANT`         | Solo lectura (analista)          |
| `IMPORT_OPERATOR`    | Operador de importaciones        |
| `SALES_PERSON`       | Personal de ventas               |

### Gestion de Permisos

- Dialogo para ver/asignar permisos por rol
- Los roles sistema son solo lectura (no se pueden modificar permisos)
- Los roles custom permiten asignar cualquier combinacion de permisos

### API Endpoints

| Metodo | Endpoint                 | Descripcion                    |
| ------ | ------------------------ | ------------------------------ |
| GET    | `/roles`                 | Listar roles (sin paginacion)  |
| GET    | `/roles/permissions`     | Todos los permisos disponibles |
| GET    | `/roles/:id/permissions` | Permisos de un rol             |
| POST   | `/roles/:id/permissions` | Asignar permisos a un rol      |

---

## Audit

**Ruta**: `src/modules/audit/`
**Pagina**: `/dashboard/audit`

### Proposito

Visualizar el historial de actividad del sistema con filtros avanzados y exportacion.

### Filtros Disponibles

| Filtro                  | Tipo   | Descripcion                                 |
| ----------------------- | ------ | ------------------------------------------- |
| `entityType`            | Select | Tipo de entidad (Product, Sale, User, etc.) |
| `action`                | Select | Accion (CREATE, UPDATE, DELETE, etc.)       |
| `httpMethod`            | Select | Metodo HTTP (GET, POST, PUT, PATCH, DELETE) |
| `performedBy`           | Input  | ID del usuario que realizo la accion        |
| `entityId`              | Input  | ID de la entidad afectada                   |
| `startDate` / `endDate` | Date   | Rango de fechas                             |

### Componentes

| Componente             | Descripcion                    |
| ---------------------- | ------------------------------ |
| `AuditLogList`         | Tabla con paginacion           |
| `AuditLogFilters`      | Panel de filtros               |
| `AuditLogDetailDialog` | Dialogo con detalle del cambio |
| `AuditActionBadge`     | Badge por tipo de accion       |
| `AuditMethodBadge`     | Badge por metodo HTTP          |
| `AuditStatusIndicator` | Indicador de estado            |

### Exportacion

Excel export via SheetJS, trae hasta 10,000 registros del backend.

---

## Companies

**Ruta**: `src/modules/companies/`
**Pagina**: `/dashboard/inventory/companies`

### Proposito

Gestion de empresas/lineas de negocio dentro de una organizacion (multi-company). Permite segmentar productos, ventas, stock, movimientos, devoluciones, reportes y dashboard por empresa.

### Habilitacion

Feature gated por `Organization.settings.multiCompanyEnabled`. Se activa desde la pagina de Settings (admin-only) con un toggle que llama a `PATCH /organizations/:id/settings/multi-company`.

### Estructura

```
companies/
├── domain/
│   ├── entities/
│   │   └── company.entity.ts          # Company con id, name, code, description, isActive
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

En el DashboardHeader, aparece un selector (Building2 icon) cuando `multiCompanyEnabled` es true. Usa Zustand store para persistir `selectedCompanyId` en localStorage. Todos los modulos leen este valor para filtrar datos.

### Filtrado por companyId

| Modulo    | Donde se aplica                                                         |
| --------- | ----------------------------------------------------------------------- |
| Products  | ProductFilters, lista, formulario (CompanySelector en form)             |
| Stock     | StockFilters, tabla                                                     |
| Movements | StockMovementFilters, lista, formulario                                 |
| Sales     | SaleFilters, lista, formulario (filtra productos disponibles)           |
| Returns   | ReturnFilters, lista, formulario                                        |
| Transfers | Formulario (filtra productos disponibles)                               |
| Reports   | ReportParameters, todos los filtros de reportes, pre-selecciona empresa |
| Dashboard | useDashboardMetrics(companyId) — pasa al backend                        |

### API Endpoints

| Metodo | Endpoint                                    | Descripcion          |
| ------ | ------------------------------------------- | -------------------- |
| GET    | `/inventory/companies`                      | Listar empresas      |
| POST   | `/inventory/companies`                      | Crear empresa        |
| GET    | `/inventory/companies/:id`                  | Detalle de empresa   |
| PUT    | `/inventory/companies/:id`                  | Actualizar empresa   |
| DELETE | `/inventory/companies/:id`                  | Eliminar empresa     |
| PATCH  | `/organizations/:id/settings/multi-company` | Toggle multi-company |

### Notas

- Cuando hay una empresa seleccionada en el selector global, los productos sin `companyId` se ocultan de la lista. El usuario debe seleccionar "Todas las empresas" para ver/editar productos sin asignar.
- El formulario de producto muestra el CompanySelector solo cuando `multiCompanyEnabled` esta activo.
- Los permisos son: `COMPANIES:CREATE`, `COMPANIES:READ`, `COMPANIES:UPDATE`, `COMPANIES:DELETE`.

---

## Settings

**Ruta**: `src/modules/settings/`
**Pagina**: `/dashboard/settings`

### Proposito

Configuracion de perfil de usuario y alertas de stock.

### Secciones

#### Perfil (todos los usuarios)

| Campo        | Tipo   | Descripcion       |
| ------------ | ------ | ----------------- |
| `phone`      | Input  | Telefono          |
| `timezone`   | Select | Zona horaria      |
| `language`   | Select | Idioma preferido  |
| `jobTitle`   | Input  | Titulo del puesto |
| `department` | Input  | Departamento      |

#### Alertas de Stock (solo admin, gated por `SETTINGS:MANAGE`)

| Campo                 | Tipo    | Descripcion                                          |
| --------------------- | ------- | ---------------------------------------------------- |
| `cronFrequency`       | Select  | EVERY_HOUR, EVERY_6_HOURS, EVERY_12_HOURS, EVERY_DAY |
| `notifyLowStock`      | Switch  | Notificar stock bajo                                 |
| `notifyCriticalStock` | Switch  | Notificar stock critico                              |
| `notifyOutOfStock`    | Switch  | Notificar sin stock                                  |
| `recipientEmails`     | Input[] | Emails de destinatarios                              |
| `isEnabled`           | Switch  | Habilitar/deshabilitar alertas                       |

### API Endpoints

| Metodo | Endpoint           | Descripcion        |
| ------ | ------------------ | ------------------ |
| GET    | `/users/me`        | Obtener perfil     |
| PUT    | `/users/me`        | Actualizar perfil  |
| GET    | `/settings/alerts` | Config de alertas  |
| PUT    | `/settings/alerts` | Actualizar alertas |
