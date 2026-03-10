> **[English](./architecture.md)** | [Español](./architecture.es.md)

# Frontend Architecture

## Table of Contents

- [Overview](#overview)
- [Clean / Hexagonal Architecture](#clean--hexagonal-architecture)
- [Architecture Layers](#architecture-layers)
- [State and Data](#state-and-data)
- [Authentication Flow](#authentication-flow)
- [Dependency Injection](#dependency-injection)
- [Internationalization](#internationalization)
- [Permissions System (RBAC)](#permissions-system-rbac)
- [Routing and Middleware](#routing-and-middleware)
- [UI Components](#ui-components)
- [Architecture Decision Records](#architecture-decision-records)

---

## Overview

The frontend follows three fundamental architectural principles:

1. **Screaming Architecture**: The folder structure reflects the business domain, not the framework
2. **Clean Architecture**: Layer separation with dependencies pointing inward
3. **Hexagonal Architecture (Ports & Adapters)**: The domain at the center, adapters for infrastructure

```
+---------------------------------------------------------------+
|                      PRESENTATION LAYER                         |
|   Components, Hooks (React Query), Schemas (Zod)               |
+-----------------------------------------------------------------+
|                      INFRASTRUCTURE LAYER                       |
|   API Adapters (Axios), Zustand Stores, TokenService            |
+-----------------------------------------------------------------+
|                      APPLICATION LAYER                          |
|   DTOs, Mappers (API <-> Domain), Use Cases, Ports              |
+-----------------------------------------------------------------+
|                        DOMAIN LAYER                             |
|   Entities, Value Objects, Workflow Services, Permissions       |
+-----------------------------------------------------------------+
```

Dependencies **always point inward**: Presentation -> Infrastructure -> Application -> Domain.

---

## Clean / Hexagonal Architecture

### Module Structure

Each business module in `src/modules/` follows the same structure:

```
modules/{name}/
├── domain/
│   ├── entities/              # Domain entities
│   │   └── {name}.entity.ts   # Extends Entity<string> from @/shared/domain
│   ├── services/              # Domain services (e.g., WorkflowService)
│   ├── value-objects/         # Immutable value objects
│   └── ports/                 # Interfaces defining what the domain needs
│       └── {name}-repository.port.ts
│
├── application/
│   ├── dto/                   # Data Transfer Objects
│   │   ├── {name}.dto.ts      # API response DTOs
│   │   └── {name}-filters.dto.ts
│   ├── mappers/               # Conversion between layers
│   │   └── {name}.mapper.ts   # toDomain(), toApi(), fromApiRaw()
│   ├── use-cases/             # Business logic (optional in frontend)
│   └── ports/                 # Repository ports with PaginatedResult<T>
│
├── infrastructure/
│   ├── adapters/              # Port implementations
│   │   └── {name}-api.adapter.ts  # Uses apiClient (Axios)
│   ├── store/                 # Module local state (Zustand)
│   │   └── {name}.store.ts
│   └── services/              # Technical services (e.g., TokenService)
│
└── presentation/
    ├── hooks/                 # React Query hooks
    │   └── use-{names}.ts     # useProducts(), useCreateProduct(), etc.
    ├── schemas/               # Form validation
    │   └── {name}.schema.ts   # Zod schemas
    └── components/            # React components
        ├── {name}-list.tsx
        ├── {name}-detail.tsx
        ├── {name}-form.tsx
        ├── {name}-filters.tsx
        └── index.ts           # Barrel export
```

### Data Flow

```
User interacts with Component
    |
Component uses Hook (useProducts)
    |
Hook calls Adapter via React Query
    |
Adapter makes HTTP request with apiClient
    |
Adapter receives API response
    |
Mapper converts DTO -> Domain Entity
    |
Hook returns Entity to Component
    |
Component renders the Entity
```

### Concrete Example: Listing Products

```typescript
// 1. Domain Entity
class Product extends Entity<string> {
  constructor(props) { ... }
  get canDeactivate(): boolean { ... }
}

// 2. Port (Interface)
interface ProductRepositoryPort {
  getAll(filters): Promise<PaginatedResult<Product>>;
  getById(id: string): Promise<Product>;
}

// 3. Adapter (Implementation)
class ProductApiAdapter implements ProductRepositoryPort {
  async getAll(filters) {
    const response = await apiClient.get<ApiResponse>('/products', { params: filters });
    return {
      data: response.data.data.map(ProductMapper.toDomain),
      pagination: response.data.pagination,
    };
  }
}

// 4. Hook (Presentation)
function useProducts(filters) {
  return useQuery({
    queryKey: productKeys.list(filters),
    queryFn: () => productAdapter.getAll(filters),
  });
}

// 5. Component
function ProductList() {
  const { data, isLoading } = useProducts(filters);
  return <Table data={data?.data} />;
}
```

---

## Architecture Layers

### Domain Layer (`shared/domain/`)

Contains the base abstractions of the system:

| Class                      | File                            | Purpose                              |
| -------------------------- | ------------------------------- | ------------------------------------ |
| `Entity<T>`                | `entities/entity.ts`            | Base class with `id`, `equals()`     |
| `AggregateRoot<T>`         | `entities/aggregate-root.ts`    | Extends Entity, for aggregates       |
| `ValueObject<T>`           | `value-objects/value-object.ts` | Immutable objects, equality by value |
| `WorkflowService<TStatus>` | `services/workflow.service.ts`  | State machine for transitions        |
| `PERMISSIONS`              | `permissions.ts`                | Permission constants + route mapping |

### Application Layer

Each module defines its own DTOs, mappers, and ports:

- **DTOs**: Represent the API data structure
- **Mappers**: Convert between API DTOs and domain Entities
- **Ports**: Interfaces defining available operations
- **PaginatedResult<T>**: Defined locally in each port (not shared)

```typescript
// Each port defines its own PaginatedResult
interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
```

### Infrastructure Layer

**API Adapters**: Implement ports using `apiClient` (Axios singleton):

```typescript
// apiClient automatically adds:
// - Authorization: Bearer {token}
// - X-Organization-Slug
// - X-Organization-ID
// - X-User-ID
const apiClient = new AxiosHttpClient(baseURL);
```

**Zustand Stores**: Module-local state (filters, modals):

```typescript
const useInventoryStore = create<InventoryStore>((set) => ({
  productFilters: { page: 1, limit: 10 },
  setProductFilters: (filters) => set({ productFilters: filters }),
  isFormOpen: false,
  openForm: () => set({ isFormOpen: true }),
}));
```

### Presentation Layer

**React Query Hooks**: Query key factory pattern:

```typescript
const productKeys = {
  all: ["products"] as const,
  lists: () => [...productKeys.all, "list"] as const,
  list: (filters: ProductFilters) => [...productKeys.lists(), filters] as const,
  details: () => [...productKeys.all, "detail"] as const,
  detail: (id: string) => [...productKeys.details(), id] as const,
};
```

**Zod Schemas**: Form validation:

```typescript
const productSchema = z.object({
  name: z.string().min(1, t("validation.required")),
  sku: z.string().min(1),
  price: z.number().positive(),
});
```

---

## State and Data

### State Architecture

The system uses a **clear separation** between server state and client state:

```
+---------------------------------------------+
|                SERVER STATE                  |
|          (TanStack React Query)              |
|                                              |
|  - API data (products, sales, etc.)          |
|  - Automatic caching (staleTime: 60s)        |
|  - Selective invalidation by query keys      |
|  - Background refetch                        |
|  - Optimistic updates                        |
+---------------------------------------------+

+---------------------------------------------+
|                CLIENT STATE                  |
|               (Zustand)                      |
|                                              |
|  - Search filters                            |
|  - Modal/form state                          |
|  - UI preferences                            |
|  - Auth store (user, tokens)                 |
+---------------------------------------------+
```

### Query Client Configuration

```typescript
// src/app/[locale]/providers.tsx
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      refetchOnWindowFocus: false, // No refetch on window focus
    },
  },
});
```

### Invalidation Pattern

```typescript
// After creating a product, invalidate the list
const createProduct = useMutation({
  mutationFn: (data) => adapter.create(data),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: productKeys.lists() });
  },
});
```

---

## Authentication Flow

### Login

```
1. User enters org slug + email + password
2. useLogin() -> authRepository.login()
3. API returns: { accessToken, refreshToken, expiresAt, user }
4. TokenService.setTokens() -> localStorage + cookie
5. useAuthStore.login() -> updates user + isAuthenticated
6. Router redirects to /dashboard (or callbackUrl)
```

### Session Hydration (on app load)

```
1. AuthHydration component -> useAuthStore.hydrate()
2. Check if token exists and is valid
3. If token expires soon (<60s), perform refresh
4. GET /users/me to fetch current user
5. isHydrated = true (unblocks routes)
```

### Automatic Token Renewal (on 401)

```
1. Request receives 401
2. AxiosHttpClient interceptor detects the 401
3. POST /auth/refresh with refreshToken
4. Updates tokens in localStorage + cookie
5. Retries the original request
6. If multiple simultaneous 401s, they share a single refresh
```

### Logout / Expiration

```
1. Token expires or refresh fails
2. Interceptor emits 'auth:session-expired' event
3. AuthHydration listens for the event
4. forceLogout() -> clears tokens + redirects to /login
5. Toast: "Your session has expired"
```

### TokenService

```typescript
// src/modules/authentication/infrastructure/services/token.service.ts
class TokenService {
  static setTokens(access, refresh, expiresAt): void;
  static getAccessToken(): string | null;
  static getRefreshToken(): string | null;
  static clearTokens(): void;
  static setUser(user: StoredUser): void;
  static getUser(): StoredUser | null;
  static setOrganization(org): void;
  static getOrganization(): StoredOrg | null;
}
```

Tokens are stored in:

- **localStorage**: for the JavaScript client
- **Cookie**: for the Next.js middleware (`proxy.ts`)

---

## Dependency Injection

The project uses a **manual IoC Container** (no DI framework):

```typescript
// src/config/di/container.ts
interface Container {
  authRepository: AuthRepositoryPort;
  productRepository: ProductRepositoryPort;
  saleRepository: SaleRepositoryPort;
  // ... all repositories
}

function createContainer(): Container {
  return {
    authRepository: new AuthApiAdapter(),
    productRepository: new ProductApiAdapter(),
    saleRepository: new SaleApiAdapter(),
  };
}

// Global singleton
let container: Container | null = null;
export function getContainer(): Container { ... }
```

### Usage in Components

```typescript
// Via React Context
const { productRepository } = useContainer();

// Or directly in hooks
const adapter = getContainer().productRepository;
```

### Testing

```typescript
// Mock-friendly: override the container
setContainer({
  productRepository: mockProductRepository,
});
```

---

## Internationalization

### Configuration (next-intl)

```
src/i18n/
├── config.ts       # Locales: ['en', 'es'], default: 'en'
├── routing.ts      # Routing with prefix /en/, /es/
├── request.ts      # Server-side i18n
└── navigation.ts   # Link, useRouter with locale

src/lib/messages/
├── en.json         # ~2000+ keys in English
└── es.json         # ~2000+ keys in Spanish
```

### Route Pattern

```
/en/dashboard/inventory/products  -> English
/es/dashboard/inventory/products  -> Spanish
```

### Usage in Components

```typescript
// Client Component
const t = useTranslations('inventory.products');
return <h1>{t('title')}</h1>;

// Server Component (page.tsx)
const t = await getTranslations('inventory.products');
```

### Translation Namespaces

| Namespace                | Content                          |
| ------------------------ | -------------------------------- |
| `auth.*`                 | Login, session, auth errors      |
| `common.*`               | Buttons, actions, generic states |
| `dashboard.*`            | Metrics, charts                  |
| `inventory.products.*`   | Products UI                      |
| `inventory.categories.*` | Categories UI                    |
| `inventory.warehouses.*` | Warehouses UI                    |
| `inventory.stock.*`      | Stock UI                         |
| `inventory.movements.*`  | Movements UI                     |
| `inventory.transfers.*`  | Transfers UI                     |
| `sales.*`                | Sales UI                         |
| `returns.*`              | Returns UI                       |
| `reports.*`              | Reports UI                       |
| `users.*`                | Users UI                         |
| `roles.*`                | Roles UI                         |
| `audit.*`                | Audit UI                         |
| `settings.*`             | Settings UI                      |

---

## Permissions System (RBAC)

### Permission Format

```
MODULE:ACTION
```

Examples: `PRODUCTS:CREATE`, `SALES:CONFIRM`, `REPORTS:VIEW`, `SETTINGS:MANAGE`

### Constants

```typescript
// src/shared/domain/permissions.ts
export const PERMISSIONS = {
  PRODUCTS_CREATE: "PRODUCTS:CREATE",
  PRODUCTS_READ: "PRODUCTS:READ",
  PRODUCTS_UPDATE: "PRODUCTS:UPDATE",
  PRODUCTS_DELETE: "PRODUCTS:DELETE",
  SALES_CREATE: "SALES:CREATE",
  SALES_CONFIRM: "SALES:CONFIRM",
  // ... 80+ permissions
};

export const ROUTE_PERMISSIONS = {
  "/dashboard/inventory/products": PERMISSIONS.PRODUCTS_READ,
  "/dashboard/sales": PERMISSIONS.SALES_READ,
  // ...
};
```

### Hook

```typescript
const { hasPermission, hasAnyPermission } = usePermissions();

if (hasPermission(PERMISSIONS.PRODUCTS_CREATE)) {
  // Show create button
}
```

### Access Control Components

```typescript
// Hide/show UI elements
<PermissionGate permission={PERMISSIONS.PRODUCTS_CREATE}>
  <Button>Create Product</Button>
</PermissionGate>

// Page-level guard (shows AccessDenied if no permission)
<RequirePermission permission={PERMISSIONS.PRODUCTS_READ}>
  <ProductListPage />
</RequirePermission>
```

### Sidebar Filtering

Sidebar items have `requiredPermissions`:

```typescript
const navItems = [
  {
    label: "Products",
    href: "/dashboard/inventory/products",
    requiredPermissions: [PERMISSIONS.PRODUCTS_READ],
  },
];
// Items without permission are automatically hidden
```

---

## Routing and Middleware

### Next.js 16: proxy.ts (not middleware.ts)

Next.js 16 renamed `middleware.ts` to `proxy.ts`:

```typescript
// src/proxy.ts
export function proxy(request: NextRequest) {
  // 1. i18n handling (next-intl)
  // 2. Token verification in cookies for protected routes
  // 3. Redirect to /login if not authenticated
  // 4. Redirect to /dashboard if already authenticated and going to /login
}
```

### Route Structure

```
src/app/[locale]/
├── (auth)/              # Layout without sidebar
│   └── login/page.tsx
└── (dashboard)/         # Layout with sidebar + header
    ├── layout.tsx       # DashboardShell (Sidebar + Header + Content)
    └── dashboard/
        ├── page.tsx     # Home with metrics
        └── {module}/
            ├── page.tsx         # List
            ├── new/page.tsx     # Create
            └── [id]/
                ├── page.tsx     # Detail
                └── edit/page.tsx # Edit
```

---

## UI Components

### Component Library (`src/ui/`)

24 reusable components based on Radix UI + Tailwind:

| Category       | Components                                                                                              |
| -------------- | ------------------------------------------------------------------------------------------------------- |
| **Form**       | Button, Input, Textarea, Label, FormField, CurrencyInput, Select, SearchableSelect, MultiSelect, Switch |
| **Data**       | Table, TablePagination, Badge, SortableHeader                                                           |
| **Modals**     | Dialog, AlertDialog, ConfirmDeleteDialog                                                                |
| **Navigation** | DropdownMenu, Tabs                                                                                      |
| **Feedback**   | Spinner, Skeleton                                                                                       |
| **Layout**     | Card, UserAvatar, PagePlaceholder                                                                       |

### Badge Variants

```typescript
// Available: default, secondary, destructive, outline, success, warning, info, error
<Badge variant="success">Active</Badge>
<Badge variant="destructive">Deleted</Badge>
<Badge variant="warning">Pending</Badge>
```

### cn() Pattern for Conditional Classes

```typescript
import { cn } from '@/ui/lib/utils';

<div className={cn(
  'base-classes',
  isActive && 'active-classes',
  variant === 'primary' && 'primary-classes',
)} />
```

---

## Architecture Decision Records

### ADR-1: Local PaginatedResult per Port

**Context**: Multiple modules need paginated responses from the API, and pagination shapes may vary between endpoints.

**Decision**: Each port file defines its own `PaginatedResult<T>` interface locally rather than importing a shared one from `@/shared/domain`.

**Rationale**: Different backend endpoints may return slightly different pagination metadata (e.g., some include `totalPages`, others do not; some wrap data in `{ success, message, data }`, others in `{ data, pagination }`). By keeping `PaginatedResult<T>` local to each port, each module can adapt to its specific API contract without forcing a one-size-fits-all type. This also avoids coupling modules to a shared type that would require coordinated changes when a single API endpoint evolves.

### ADR-2: Manual Dependency Injection Container

**Context**: The application needs to decouple presentation hooks from infrastructure adapters for testability and flexibility.

**Decision**: Use a hand-written IoC container (`src/config/di/container.ts`) instead of a DI framework like InversifyJS or tsyringe.

**Rationale**: Frontend DI frameworks add runtime overhead (reflect-metadata, decorators) and increase bundle size. The number of injectable services in this project (roughly one repository adapter per module) is small enough that a plain TypeScript object with explicit wiring is sufficient. The manual container is fully type-safe without decorators, trivially mockable in tests via `setContainer()`, and has zero additional dependencies.

### ADR-3: proxy.ts Instead of middleware.ts (Next.js 16)

**Context**: Next.js 16 introduced a breaking change that renames the edge middleware entry point from `middleware.ts` / `middleware()` to `proxy.ts` / `proxy()`.

**Decision**: The project uses `src/proxy.ts` exporting `export function proxy(request: NextRequest)` and must not be renamed back to `middleware.ts`.

**Rationale**: This is a mandatory framework requirement in Next.js 16. The file handles i18n routing (via next-intl), token-based authentication checks on protected routes, and login/dashboard redirects. Renaming it to `middleware.ts` would cause the edge function to be silently ignored at runtime, breaking authentication guards and locale detection.

### ADR-4: HttpOnly Cookies for Token Storage

**Context**: The application needs to store JWT access and refresh tokens securely in the browser.

**Decision**: Tokens are stored in HttpOnly, Secure, SameSite=Strict cookies via BFF (Backend-for-Frontend) API routes (`src/app/api/auth/{login,refresh,logout}/route.ts`). The `TokenService` in localStorage only stores non-sensitive data (user profile, organization info, token expiry timestamp) -- never the tokens themselves in production.

**Rationale**: HttpOnly cookies are inaccessible to JavaScript, which eliminates the most common XSS token-theft vector. The `Secure` flag ensures cookies are only sent over HTTPS. `SameSite=Strict` mitigates CSRF attacks. The BFF pattern keeps the token exchange server-side so that raw tokens never appear in client-side code. This approach is recommended by OWASP for SPAs that communicate with their own backend.
