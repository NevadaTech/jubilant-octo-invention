# Arquitectura del Frontend

## Tabla de Contenidos

- [Vision General](#vision-general)
- [Clean / Hexagonal Architecture](#clean--hexagonal-architecture)
- [Capas de la Arquitectura](#capas-de-la-arquitectura)
- [Estado y Datos](#estado-y-datos)
- [Flujo de Autenticacion](#flujo-de-autenticacion)
- [Inyeccion de Dependencias](#inyeccion-de-dependencias)
- [Internacionalizacion](#internacionalizacion)
- [Sistema de Permisos (RBAC)](#sistema-de-permisos-rbac)
- [Routing y Middleware](#routing-y-middleware)
- [Componentes UI](#componentes-ui)

---

## Vision General

El frontend sigue tres principios arquitectonicos fundamentales:

1. **Screaming Architecture**: La estructura de carpetas refleja el dominio del negocio, no el framework
2. **Clean Architecture**: Separacion de capas con dependencias hacia adentro
3. **Hexagonal Architecture (Ports & Adapters)**: El dominio en el centro, adaptadores para la infraestructura

```
┌─────────────────────────────────────────────────────────────────┐
│                      PRESENTATION LAYER                         │
│   Components, Hooks (React Query), Schemas (Zod)               │
├─────────────────────────────────────────────────────────────────┤
│                      INFRASTRUCTURE LAYER                       │
│   API Adapters (Axios), Zustand Stores, TokenService            │
├─────────────────────────────────────────────────────────────────┤
│                      APPLICATION LAYER                          │
│   DTOs, Mappers (API ↔ Domain), Use Cases, Ports               │
├─────────────────────────────────────────────────────────────────┤
│                        DOMAIN LAYER                             │
│   Entities, Value Objects, Workflow Services, Permissions       │
└─────────────────────────────────────────────────────────────────┘
```

Las dependencias **siempre apuntan hacia adentro**: Presentation → Infrastructure → Application → Domain.

---

## Clean / Hexagonal Architecture

### Estructura de un Modulo

Cada modulo de negocio en `src/modules/` sigue la misma estructura:

```
modules/{nombre}/
├── domain/
│   ├── entities/              # Entidades de dominio
│   │   └── {name}.entity.ts   # Extiende Entity<string> de @/shared/domain
│   ├── services/              # Servicios de dominio (ej: WorkflowService)
│   ├── value-objects/         # Objetos de valor inmutables
│   └── ports/                 # Interfaces que definen lo que el dominio necesita
│       └── {name}-repository.port.ts
│
├── application/
│   ├── dto/                   # Data Transfer Objects
│   │   ├── {name}.dto.ts      # DTOs de respuesta de la API
│   │   └── {name}-filters.dto.ts
│   ├── mappers/               # Conversion entre capas
│   │   └── {name}.mapper.ts   # toDomain(), toApi(), fromApiRaw()
│   ├── use-cases/             # Logica de negocio (opcional en frontend)
│   └── ports/                 # Puertos de repositorio con PaginatedResult<T>
│
├── infrastructure/
│   ├── adapters/              # Implementacion de los puertos
│   │   └── {name}-api.adapter.ts  # Usa apiClient (Axios)
│   ├── store/                 # Estado local del modulo (Zustand)
│   │   └── {name}.store.ts
│   └── services/              # Servicios tecnicos (ej: TokenService)
│
└── presentation/
    ├── hooks/                 # React Query hooks
    │   └── use-{names}.ts     # useProducts(), useCreateProduct(), etc.
    ├── schemas/               # Validacion de formularios
    │   └── {name}.schema.ts   # Zod schemas
    └── components/            # Componentes React
        ├── {name}-list.tsx
        ├── {name}-detail.tsx
        ├── {name}-form.tsx
        ├── {name}-filters.tsx
        └── index.ts           # Barrel export
```

### Flujo de Datos

```
Usuario interactua con Component
    ↓
Component usa Hook (useProducts)
    ↓
Hook llama al Adapter via React Query
    ↓
Adapter hace HTTP request con apiClient
    ↓
Adapter recibe respuesta API
    ↓
Mapper convierte DTO → Entity de dominio
    ↓
Hook retorna Entity al Component
    ↓
Component renderiza la Entity
```

### Ejemplo Concreto: Listar Productos

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

## Capas de la Arquitectura

### Domain Layer (`shared/domain/`)

Contiene las abstracciones base del sistema:

| Clase                      | Archivo                         | Proposito                               |
| -------------------------- | ------------------------------- | --------------------------------------- |
| `Entity<T>`                | `entities/entity.ts`            | Clase base con `id`, `equals()`         |
| `AggregateRoot<T>`         | `entities/aggregate-root.ts`    | Extiende Entity, para agregados         |
| `ValueObject<T>`           | `value-objects/value-object.ts` | Objetos inmutables, igualdad por valor  |
| `WorkflowService<TStatus>` | `services/workflow.service.ts`  | Maquina de estados para transiciones    |
| `PERMISSIONS`              | `permissions.ts`                | Constantes de permisos + mapeo de rutas |

### Application Layer

Cada modulo define sus propios DTOs, mappers y puertos:

- **DTOs**: Representan la estructura de datos de la API
- **Mappers**: Convierten entre DTO de API y Entity de dominio
- **Ports**: Interfaces que definen las operaciones disponibles
- **PaginatedResult<T>**: Definido localmente en cada puerto (no compartido)

```typescript
// Cada port define su propio PaginatedResult
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

**API Adapters**: Implementan los puertos usando `apiClient` (Axios singleton):

```typescript
// apiClient agrega automaticamente:
// - Authorization: Bearer {token}
// - X-Organization-Slug
// - X-Organization-ID
// - X-User-ID
const apiClient = new AxiosHttpClient(baseURL);
```

**Zustand Stores**: Estado local de cada modulo (filtros, modals):

```typescript
const useInventoryStore = create<InventoryStore>((set) => ({
  productFilters: { page: 1, limit: 10 },
  setProductFilters: (filters) => set({ productFilters: filters }),
  isFormOpen: false,
  openForm: () => set({ isFormOpen: true }),
}));
```

### Presentation Layer

**React Query Hooks**: Patron de query key factory:

```typescript
const productKeys = {
  all: ["products"] as const,
  lists: () => [...productKeys.all, "list"] as const,
  list: (filters: ProductFilters) => [...productKeys.lists(), filters] as const,
  details: () => [...productKeys.all, "detail"] as const,
  detail: (id: string) => [...productKeys.details(), id] as const,
};
```

**Zod Schemas**: Validacion de formularios:

```typescript
const productSchema = z.object({
  name: z.string().min(1, t("validation.required")),
  sku: z.string().min(1),
  price: z.number().positive(),
});
```

---

## Estado y Datos

### Arquitectura de Estado

El sistema usa una **separacion clara** entre server state y client state:

```
┌─────────────────────────────────────────────┐
│                SERVER STATE                  │
│          (TanStack React Query)              │
│                                              │
│  - Datos de la API (productos, ventas, etc.) │
│  - Cache automatico (staleTime: 60s)         │
│  - Invalidacion selectiva por query keys     │
│  - Refetch en background                     │
│  - Optimistic updates                        │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│                CLIENT STATE                  │
│               (Zustand)                      │
│                                              │
│  - Filtros de busqueda                       │
│  - Estado de modals/forms                    │
│  - Preferencias de UI                        │
│  - Auth store (usuario, tokens)              │
└─────────────────────────────────────────────┘
```

### Configuracion de Query Client

```typescript
// src/app/[locale]/providers.tsx
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minuto
      refetchOnWindowFocus: false, // No refetch al volver a la ventana
    },
  },
});
```

### Patron de Invalidacion

```typescript
// Despues de crear un producto, invalida la lista
const createProduct = useMutation({
  mutationFn: (data) => adapter.create(data),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: productKeys.lists() });
  },
});
```

---

## Flujo de Autenticacion

### Login

```
1. Usuario ingresa org slug + email + password
2. useLogin() → authRepository.login()
3. API retorna: { accessToken, refreshToken, expiresAt, user }
4. TokenService.setTokens() → localStorage + cookie
5. useAuthStore.login() → actualiza user + isAuthenticated
6. Router redirige a /dashboard (o callbackUrl)
```

### Hidratacion de Sesion (al cargar la app)

```
1. AuthHydration component → useAuthStore.hydrate()
2. Verificar si existe token y es valido
3. Si el token expira pronto (<60s), hacer refresh
4. GET /users/me para obtener usuario actual
5. isHydrated = true (desbloquea las rutas)
```

### Renovacion Automatica de Token (en 401)

```
1. Request recibe 401
2. Interceptor de AxiosHttpClient detecta el 401
3. POST /auth/refresh con refreshToken
4. Actualiza tokens en localStorage + cookie
5. Reintenta la request original
6. Si multiples 401s simultaneos, comparten un solo refresh
```

### Logout / Expiracion

```
1. Token expira o refresh falla
2. Interceptor emite evento 'auth:session-expired'
3. AuthHydration escucha el evento
4. forceLogout() → limpia tokens + redirige a /login
5. Toast: "Tu sesion ha expirado"
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

Los tokens se almacenan en:

- **localStorage**: para el cliente JavaScript
- **Cookie**: para el middleware de Next.js (`proxy.ts`)

---

## Inyeccion de Dependencias

El proyecto usa un **IoC Container manual** (sin framework de DI):

```typescript
// src/config/di/container.ts
interface Container {
  authRepository: AuthRepositoryPort;
  productRepository: ProductRepositoryPort;
  saleRepository: SaleRepositoryPort;
  // ... todos los repositorios
}

function createContainer(): Container {
  return {
    authRepository: new AuthApiAdapter(),
    productRepository: new ProductApiAdapter(),
    saleRepository: new SaleApiAdapter(),
  };
}

// Singleton global
let container: Container | null = null;
export function getContainer(): Container { ... }
```

### Uso en Componentes

```typescript
// Via React Context
const { productRepository } = useContainer();

// O directamente en hooks
const adapter = getContainer().productRepository;
```

### Testing

```typescript
// Mock-friendly: sobrescribir el container
setContainer({
  productRepository: mockProductRepository,
});
```

---

## Internacionalizacion

### Configuracion (next-intl)

```
src/i18n/
├── config.ts       # Locales: ['en', 'es'], default: 'en'
├── routing.ts      # Routing con prefix /en/, /es/
├── request.ts      # Server-side i18n
└── navigation.ts   # Link, useRouter con locale

src/lib/messages/
├── en.json         # ~2000+ keys en ingles
└── es.json         # ~2000+ keys en espanol
```

### Patron de Rutas

```
/en/dashboard/inventory/products  → Ingles
/es/dashboard/inventory/products  → Espanol
```

### Uso en Componentes

```typescript
// Client Component
const t = useTranslations('inventory.products');
return <h1>{t('title')}</h1>;

// Server Component (page.tsx)
const t = await getTranslations('inventory.products');
```

### Namespaces de Traduccion

| Namespace                | Contenido                            |
| ------------------------ | ------------------------------------ |
| `auth.*`                 | Login, sesion, errores de auth       |
| `common.*`               | Botones, acciones, estados genericos |
| `dashboard.*`            | Metricas, graficos                   |
| `inventory.products.*`   | UI de productos                      |
| `inventory.categories.*` | UI de categorias                     |
| `inventory.warehouses.*` | UI de bodegas                        |
| `inventory.stock.*`      | UI de stock                          |
| `inventory.movements.*`  | UI de movimientos                    |
| `inventory.transfers.*`  | UI de transferencias                 |
| `sales.*`                | UI de ventas                         |
| `returns.*`              | UI de devoluciones                   |
| `reports.*`              | UI de reportes                       |
| `users.*`                | UI de usuarios                       |
| `roles.*`                | UI de roles                          |
| `audit.*`                | UI de auditoria                      |
| `settings.*`             | UI de configuracion                  |

---

## Sistema de Permisos (RBAC)

### Formato de Permisos

```
MODULO:ACCION
```

Ejemplos: `PRODUCTS:CREATE`, `SALES:CONFIRM`, `REPORTS:VIEW`, `SETTINGS:MANAGE`

### Constantes

```typescript
// src/shared/domain/permissions.ts
export const PERMISSIONS = {
  PRODUCTS_CREATE: "PRODUCTS:CREATE",
  PRODUCTS_READ: "PRODUCTS:READ",
  PRODUCTS_UPDATE: "PRODUCTS:UPDATE",
  PRODUCTS_DELETE: "PRODUCTS:DELETE",
  SALES_CREATE: "SALES:CREATE",
  SALES_CONFIRM: "SALES:CONFIRM",
  // ... 80+ permisos
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
  // Mostrar boton de crear
}
```

### Componentes de Control de Acceso

```typescript
// Ocultar/mostrar elementos de UI
<PermissionGate permission={PERMISSIONS.PRODUCTS_CREATE}>
  <Button>Crear Producto</Button>
</PermissionGate>

// Guardia a nivel de pagina (muestra AccessDenied si no tiene permiso)
<RequirePermission permission={PERMISSIONS.PRODUCTS_READ}>
  <ProductListPage />
</RequirePermission>
```

### Filtrado del Sidebar

Los items del sidebar tienen `requiredPermissions`:

```typescript
const navItems = [
  {
    label: "Productos",
    href: "/dashboard/inventory/products",
    requiredPermissions: [PERMISSIONS.PRODUCTS_READ],
  },
];
// Items sin permiso se ocultan automaticamente
```

---

## Routing y Middleware

### Next.js 16: proxy.ts (no middleware.ts)

Next.js 16 renombro `middleware.ts` a `proxy.ts`:

```typescript
// src/proxy.ts
export function proxy(request: NextRequest) {
  // 1. Manejo de i18n (next-intl)
  // 2. Verificacion de token en cookies para rutas protegidas
  // 3. Redireccion a /login si no autenticado
  // 4. Redireccion a /dashboard si ya autenticado y va a /login
}
```

### Estructura de Rutas

```
src/app/[locale]/
├── (auth)/              # Layout sin sidebar
│   └── login/page.tsx
└── (dashboard)/         # Layout con sidebar + header
    ├── layout.tsx       # DashboardShell (Sidebar + Header + Content)
    └── dashboard/
        ├── page.tsx     # Home con metricas
        └── {modulo}/
            ├── page.tsx         # Lista
            ├── new/page.tsx     # Crear
            └── [id]/
                ├── page.tsx     # Detalle
                └── edit/page.tsx # Editar
```

---

## Componentes UI

### Libreria de Componentes (`src/ui/`)

24 componentes reutilizables basados en Radix UI + Tailwind:

| Categoria      | Componentes                                                                                             |
| -------------- | ------------------------------------------------------------------------------------------------------- |
| **Formulario** | Button, Input, Textarea, Label, FormField, CurrencyInput, Select, SearchableSelect, MultiSelect, Switch |
| **Datos**      | Table, TablePagination, Badge, SortableHeader                                                           |
| **Modals**     | Dialog, AlertDialog, ConfirmDeleteDialog                                                                |
| **Navegacion** | DropdownMenu, Tabs                                                                                      |
| **Feedback**   | Spinner, Skeleton                                                                                       |
| **Layout**     | Card, UserAvatar, PagePlaceholder                                                                       |

### Variantes de Badge

```typescript
// Disponibles: default, secondary, destructive, outline, success, warning, info, error
<Badge variant="success">Activo</Badge>
<Badge variant="destructive">Eliminado</Badge>
<Badge variant="warning">Pendiente</Badge>
```

### Patron cn() para clases condicionales

```typescript
import { cn } from '@/ui/lib/utils';

<div className={cn(
  'base-classes',
  isActive && 'active-classes',
  variant === 'primary' && 'primary-classes',
)} />
```
