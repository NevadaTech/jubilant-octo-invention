<p align="center">
  <img src="https://nextjs.org/api/docs-og?title=Nevada%20Inventory%20System" width="400" alt="Nevada Inventory System" />
</p>

<h1 align="center">Nevada Inventory System - Frontend</h1>

<p align="center">
  Aplicacion web para gestion de inventarios multi-tenant construida con <strong>Next.js 16</strong>, <strong>React 19</strong> y <strong>TypeScript</strong>, siguiendo principios de <strong>Clean Architecture</strong> y <strong>Arquitectura Hexagonal</strong>.
</p>

<p align="center">
  <a href="#"><img src="https://img.shields.io/badge/Next.js-16-black.svg" alt="Next.js" /></a>
  <a href="#"><img src="https://img.shields.io/badge/React-19-blue.svg" alt="React" /></a>
  <a href="#"><img src="https://img.shields.io/badge/TypeScript-strict-blue.svg" alt="TypeScript" /></a>
  <a href="#"><img src="https://img.shields.io/badge/TailwindCSS-4-38bdf8.svg" alt="Tailwind" /></a>
  <a href="#"><img src="https://img.shields.io/badge/license-MIT-green.svg" alt="License" /></a>
</p>

---

## Tabla de Contenidos

- [Descripcion](#descripcion)
- [Caracteristicas](#caracteristicas)
- [Tech Stack](#tech-stack)
- [Quick Start](#quick-start)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Modulos](#modulos)
- [Scripts Disponibles](#scripts-disponibles)
- [Variables de Entorno](#variables-de-entorno)
- [Documentacion Adicional](#documentacion-adicional)
- [Contribucion](#contribucion)
- [Licencia](#licencia)

---

## Descripcion

Frontend del **Nevada Inventory System**, un sistema de gestion de inventarios multi-tenant que permite controlar productos, bodegas, movimientos de stock, ventas, devoluciones, reportes y mas. Se conecta al backend NestJS ([improved-parakeet](https://github.com/your-username/improved-parakeet)) via API REST.

### Objetivos

| Objetivo              | Descripcion                                        |
| --------------------- | -------------------------------------------------- |
| **Interfaz moderna**  | UI responsiva con shadcn/ui + Tailwind CSS         |
| **Tipo seguro**       | TypeScript estricto end-to-end con Zod validation  |
| **Multi-idioma**      | Soporte completo para ingles y espanol (next-intl) |
| **Control de acceso** | RBAC con 80+ permisos granulares                   |
| **Reportes**          | 17 tipos de reportes con exportacion a Excel       |
| **Tiempo real**       | Dashboard con metricas y graficos actualizados     |

---

## Caracteristicas

### Autenticacion y Seguridad

- Login con JWT (access + refresh tokens)
- Renovacion automatica de tokens en 401
- Control de sesion con expiracion y logout forzado
- RBAC con `<PermissionGate>` y `<RequirePermission>` components
- Sidebar filtrado por permisos del usuario

### Gestion de Inventario

- **Productos**: CRUD con SKU, categorias, precios, metricas de rotacion
- **Bodegas**: Gestion de ubicaciones de almacenamiento
- **Stock**: Niveles de inventario en tiempo real por producto/bodega
- **Movimientos**: Entradas/salidas con workflow DRAFT → POSTED → VOID
- **Transferencias**: Entre bodegas con estados (DRAFT → IN_TRANSIT → RECEIVED)

### Ventas y Devoluciones

- **Ventas**: Workflow completo DRAFT → CONFIRMED → PICKING → SHIPPED → COMPLETED
- **Devoluciones**: De clientes y a proveedores con tracking de precios originales
- **Timeline**: Visualizacion del ciclo de vida de cada venta

### Reportes y Analisis

- 17 tipos de reportes (inventario, ventas, devoluciones)
- Analisis ABC (clasificacion Pareto)
- Stock muerto (productos sin ventas en N dias)
- Exportacion a Excel via SheetJS
- Filtros dinamicos por tipo de reporte

### Dashboard

- 4 tarjetas de metricas principales
- Tendencia de ventas (7 dias) con AreaChart
- Top 5 productos por ingresos con BarChart
- Distribucion de stock por bodega con PieChart
- Feed de actividad reciente

### Multi-Company

- Gestion de empresas/lineas de negocio por organizacion
- Selector global en header (filtra productos, stock, ventas, devoluciones, movimientos, reportes, dashboard)
- Toggle de habilitacion en configuracion (admin-only)
- Product swap entre empresas (ADJUST_IN/ADJUST_OUT)

### Administracion

- **Usuarios**: CRUD con estados (ACTIVE/INACTIVE/LOCKED)
- **Roles**: Sistema y personalizados, gestion de permisos (80+ permisos granulares)
- **Audit Log**: Historial de actividad con filtros avanzados y exportacion Excel
- **Configuracion**: Perfil de usuario y alertas de stock configurables

---

## Tech Stack

### Core

| Tecnologia       | Version | Proposito                |
| ---------------- | ------- | ------------------------ |
| **Next.js**      | 16.1    | Framework con App Router |
| **React**        | 19.2    | Biblioteca UI            |
| **TypeScript**   | 5.9+    | Tipado estatico estricto |
| **Tailwind CSS** | 4.2     | Estilos utility-first    |

### Estado y Datos

| Tecnologia          | Proposito                                   |
| ------------------- | ------------------------------------------- |
| **TanStack Query**  | Server state (cache, refetch, invalidation) |
| **Zustand**         | Client state (filtros, modals, auth)        |
| **Axios**           | HTTP client con interceptores               |
| **Zod**             | Validacion de schemas y formularios         |
| **React Hook Form** | Gestion de formularios                      |

### UI

| Tecnologia         | Proposito                                        |
| ------------------ | ------------------------------------------------ |
| **Radix UI**       | Primitivos accesibles (Dialog, Select, Dropdown) |
| **shadcn/ui**      | Componentes estilizados                          |
| **Recharts**       | Graficos (Area, Bar, Pie)                        |
| **Lucide React**   | Iconos                                           |
| **Boring Avatars** | Avatares deterministas                           |
| **Framer Motion**  | Animaciones                                      |
| **Sonner**         | Toast notifications                              |

### Herramientas

| Tecnologia            | Proposito                    |
| --------------------- | ---------------------------- |
| **next-intl**         | Internacionalizacion (en/es) |
| **SheetJS (xlsx)**    | Exportacion Excel            |
| **Vitest**            | Unit testing                 |
| **Playwright**        | E2E testing                  |
| **ESLint + Prettier** | Linting y formateo           |
| **Sentry**            | Error monitoring (opcional)  |

---

## Quick Start

```bash
# 1. Clonar el repositorio
git clone https://github.com/your-username/jubilant-octo-invention.git
cd jubilant-octo-invention

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local con la URL del backend

# 4. Iniciar en desarrollo
npm run dev

# Abrir http://localhost:3000
```

### Prerrequisitos

| Herramienta       | Version | Requerido                        |
| ----------------- | ------- | -------------------------------- |
| Node.js           | 18+     | Si                               |
| npm / yarn / pnpm | -       | Si                               |
| Backend API       | -       | Si (improved-parakeet corriendo) |

---

## Estructura del Proyecto

```
src/
├── app/                          # Next.js 16 App Router
│   └── [locale]/
│       ├── (auth)/login/         # Pagina de login
│       └── (dashboard)/dashboard/
│           ├── inventory/        # Productos, Categorias, Bodegas, Stock, Movimientos, Transferencias, Empresas
│           ├── sales/            # Ventas CRUD + workflow
│           ├── returns/          # Devoluciones CRUD + workflow
│           ├── reports/          # Catalogo + visor de reportes
│           ├── users/            # Gestion de usuarios
│           ├── roles/            # Gestion de roles y permisos
│           ├── audit/            # Log de auditoria
│           └── settings/         # Configuracion
│
├── modules/                      # Modulos de negocio (Hexagonal Architecture)
│   ├── authentication/           # Login, tokens, sesion
│   ├── inventory/                # Productos, bodegas, stock, movimientos, transferencias
│   ├── sales/                    # Ventas con workflow completo
│   ├── returns/                  # Devoluciones
│   ├── dashboard/                # Metricas y graficos
│   ├── reports/                  # 17 tipos de reportes
│   ├── users/                    # Administracion de usuarios
│   ├── roles/                    # Roles y permisos
│   ├── audit/                    # Auditoria
│   ├── companies/                # Empresas (multi-company)
│   └── settings/                 # Perfil y alertas
│
├── shared/                       # Codigo compartido
│   ├── domain/                   # Entity, AggregateRoot, ValueObject, Permissions
│   ├── application/              # HttpClientPort, PaginatedResult
│   ├── infrastructure/           # AxiosHttpClient con interceptores
│   └── presentation/             # PermissionGate, RequirePermission, AccessDenied
│
├── ui/                           # Componentes UI reutilizables
│   ├── components/               # Button, Input, Dialog, Table, Badge, etc.
│   ├── layout/                   # Sidebar, Header, DashboardShell
│   └── lib/                      # cn() utility
│
├── config/                       # Env validation + DI container
├── i18n/                         # Configuracion next-intl
├── lib/messages/                 # Traducciones en.json, es.json
└── hooks/                        # useDebounce, useLocalStorage, useMediaQuery
```

### Arquitectura por Modulo

Cada modulo en `src/modules/` sigue la misma estructura hexagonal:

```
modules/{nombre}/
├── domain/
│   ├── entities/         # Clases de dominio
│   └── ports/            # Interfaces de repositorio
├── application/
│   ├── dto/              # Data Transfer Objects
│   ├── mappers/          # API ↔ Domain conversion
│   └── use-cases/        # Logica de negocio
├── infrastructure/
│   ├── adapters/         # Implementacion API (Axios)
│   └── store/            # Zustand stores (filtros)
└── presentation/
    ├── hooks/            # React Query hooks
    ├── schemas/          # Validacion Zod
    └── components/       # Componentes React
```

---

## Modulos

| Modulo             | Descripcion                                                        | Ruta                             |
| ------------------ | ------------------------------------------------------------------ | -------------------------------- |
| **Authentication** | Login, tokens, sesion, permisos                                    | `/login`                         |
| **Dashboard**      | Metricas, graficos, actividad reciente                             | `/dashboard`                     |
| **Inventory**      | Productos, categorias, bodegas, stock, movimientos, transferencias | `/dashboard/inventory/*`         |
| **Sales**          | Ventas con workflow completo (5 estados)                           | `/dashboard/sales/*`             |
| **Returns**        | Devoluciones de clientes y a proveedores                           | `/dashboard/returns/*`           |
| **Reports**        | 17 tipos de reportes con filtros y exportacion                     | `/dashboard/reports/*`           |
| **Users**          | CRUD de usuarios con gestion de estados                            | `/dashboard/users/*`             |
| **Roles**          | Roles del sistema y personalizados, permisos                       | `/dashboard/roles/*`             |
| **Audit**          | Log de auditoria con filtros y exportacion                         | `/dashboard/audit`               |
| **Companies**      | Empresas/lineas de negocio (multi-company)                         | `/dashboard/inventory/companies` |
| **Settings**       | Perfil de usuario y configuracion de alertas                       | `/dashboard/settings`            |

> Para documentacion detallada de cada modulo, ver [docs/modules.md](docs/modules.md)

---

## Scripts Disponibles

```bash
# Desarrollo
npm run dev              # Servidor de desarrollo con Turbopack
npm run build            # Build de produccion
npm run start            # Servidor de produccion

# Calidad de Codigo
npm run lint             # ESLint
npm run lint:fix         # ESLint con auto-fix
npm run format           # Prettier format
npm run format:check     # Verificar formato
npm run type-check       # TypeScript check
npm run quality          # type-check + lint + format:check

# Testing
npm run test             # Vitest (unit tests) — 208 suites, 1,799 tests
npm run test:run         # Vitest single run
npm run test:coverage    # Vitest con cobertura
npm run test:e2e         # Playwright E2E
npm run test:e2e:ui      # Playwright con UI
npm run test:e2e:headed  # Playwright con navegador visible
```

---

## Variables de Entorno

Crear `.env.local` basado en `.env.example`:

```env
# URL de la aplicacion
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=Nevada Inventory System

# API Backend
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_API_TIMEOUT=30000

# Auth cookies
NEXT_PUBLIC_AUTH_COOKIE_NAME=nevada_auth_token
NEXT_PUBLIC_REFRESH_COOKIE_NAME=nevada_refresh_token

# Mock API (desarrollo)
NEXT_PUBLIC_ENABLE_MOCK_API=false

# Sentry (opcional)
SENTRY_DSN=
SENTRY_AUTH_TOKEN=
```

---

## Documentacion Adicional

| Documento                                        | Descripcion                                         |
| ------------------------------------------------ | --------------------------------------------------- |
| [Arquitectura](docs/architecture.md)             | Clean/Hexagonal Architecture, estado, auth flow, DI |
| [Modulos](docs/modules.md)                       | Guia detallada de los 11 modulos de negocio         |
| [Plan de Trabajo](docs/front-end_work-plan.md)   | Roadmap original del frontend                       |
| [Coleccion Postman](docs/postman/)               | Documentacion de API y colecciones                  |
| [Estructura de Tests](docs/testing-structure.md) | Convencion de testing                               |

---

## Relacion con el Backend

Este frontend consume la API REST del backend **improved-parakeet**:

```
┌─────────────────────┐         ┌─────────────────────┐
│                     │  REST   │                     │
│  jubilant-octo-     │ ──────> │  improved-parakeet  │
│  invention          │  API    │                     │
│                     │         │                     │
│  Next.js 16         │         │  NestJS 11          │
│  React 19           │         │  Prisma + PostgreSQL│
│  TanStack Query     │         │  Redis              │
│  Zustand            │         │  JWT Auth           │
│                     │         │                     │
└─────────────────────┘         └─────────────────────┘
```

### Headers Requeridos

Todas las peticiones autenticadas incluyen:

| Header                | Descripcion                    |
| --------------------- | ------------------------------ |
| `Authorization`       | `Bearer {accessToken}`         |
| `X-Organization-Slug` | Slug de la organizacion activa |
| `X-Organization-ID`   | ID de la organizacion activa   |
| `X-User-ID`           | ID del usuario autenticado     |

---

## Contribucion

1. Fork el repositorio
2. Crea una rama: `git checkout -b feature/nueva-funcionalidad`
3. Desarrolla siguiendo las convenciones del proyecto
4. Ejecuta quality checks: `npm run quality`
5. Commit con conventional commits: `feat(inventory): add stock alerts`
6. Crea un Pull Request

### Convenciones

| Aspecto          | Convencion                                    |
| ---------------- | --------------------------------------------- |
| **Codigo**       | Ingles (variables, funciones, componentes)    |
| **Componentes**  | PascalCase (`ProductList.tsx`)                |
| **Hooks**        | `use` prefix (`useProducts.ts`)               |
| **Stores**       | `.store.ts` suffix                            |
| **Schemas**      | `.schema.ts` suffix                           |
| **Traducciones** | Namespace dotted (`inventory.products.title`) |

---

## Licencia

MIT License - Copyright (c) 2025 Cesar Javier Ortiz Montero

---

<p align="center">
  <sub>Construido con Next.js 16 + React 19 + TypeScript</sub>
</p>
