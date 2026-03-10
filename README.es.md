> [English](./README.md) | **[Espanol](./README.es.md)**

<p align="center">
  <img src="https://nextjs.org/api/docs-og?title=Nevada%20Inventory%20System" width="400" alt="Nevada Inventory System" />
</p>

<h1 align="center">Nevada Inventory System - Frontend</h1>

<p align="center">
  Aplicacion web para gestion de inventarios multi-tenant construida con <strong>Next.js 16</strong>, <strong>React 19</strong>, <strong>TypeScript</strong>, siguiendo principios de <strong>Clean Architecture</strong> y <strong>Arquitectura Hexagonal</strong>.
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
- [Inicio Rapido](#inicio-rapido)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Arquitectura por Modulo](#arquitectura-por-modulo)
- [Modulos](#modulos)
- [Scripts Disponibles](#scripts-disponibles)
- [Variables de Entorno](#variables-de-entorno)
- [Documentacion Adicional](#documentacion-adicional)
- [Relacion con el Backend](#relacion-con-el-backend)
- [Seguridad](#seguridad)
- [Contribucion](#contribucion)
- [Licencia](#licencia)

---

## Descripcion

Frontend del **Nevada Inventory System**, un sistema de gestion de inventarios multi-tenant que permite controlar productos, bodegas, movimientos de stock, ventas, devoluciones, contactos, integraciones e-commerce, reportes y mas. Se conecta al backend NestJS ([improved-parakeet](https://github.com/your-username/improved-parakeet)) via API REST.

### Objetivos

| Objetivo              | Descripcion                                                         |
| --------------------- | ------------------------------------------------------------------- |
| **Interfaz moderna**  | UI responsiva con shadcn/ui + Tailwind CSS                          |
| **Tipo seguro**       | TypeScript estricto end-to-end con validacion Zod                   |
| **Multi-idioma**      | Soporte completo para ingles y espanol (next-intl)                  |
| **Control de acceso** | RBAC con 80+ permisos granulares                                    |
| **Reportes**          | 17 tipos de reportes con exportacion a Excel                        |
| **Integraciones**     | Conexion con plataformas e-commerce (VTEX, extensible)              |
| **Multi-empresa**     | Segmentacion de datos por empresa/linea de negocio                  |
| **Tiempo real**       | Dashboard con metricas y graficos actualizados                      |

---

## Caracteristicas

### Autenticacion y Seguridad

- Login con JWT (access + refresh tokens) almacenados en cookies HttpOnly
- Renovacion automatica de tokens en respuestas 401
- RBAC con 80+ permisos granulares y componentes `<PermissionGate>` y `<RequirePermission>`
- Rutas BFF (Backend For Frontend) para manejo seguro de cookies
- Timeout de sesion: 15 minutos de inactividad con ventana de advertencia de 2 minutos
- Content Security Policy con `strict-dynamic`
- Sidebar filtrado por permisos del usuario

### Gestion de Inventario

- **Productos**: CRUD con SKU, categorias, precios, metricas de rotacion
- **Bodegas**: Gestion de ubicaciones de almacenamiento
- **Stock**: Niveles de inventario en tiempo real por producto/bodega
- **Movimientos**: Entradas/salidas con workflow DRAFT -> POSTED -> VOID
- **Transferencias**: Entre bodegas con estados (DRAFT -> IN_TRANSIT -> RECEIVED)

### Ventas y Devoluciones

- **Ventas**: Workflow completo DRAFT -> CONFIRMED -> PICKING -> SHIPPED -> COMPLETED
- **Devoluciones**: De clientes y a proveedores con tracking de precios originales
- **Timeline**: Visualizacion del ciclo de vida de cada venta

### Contactos

- Gestion de clientes, proveedores o ambos (tipo CUSTOMER | SUPPLIER | BOTH)
- Campos: nombre, identificacion (unica por organizacion), email, telefono, direccion, notas
- Integracion con ventas: cada venta puede asociarse a un contacto
- Estados activo/inactivo con filtrado

### Integraciones

- **VTEX**: Conexion con plataforma e-commerce para sincronizacion de pedidos
- Multiples conexiones simultaneas por proveedor
- Test de conectividad y sincronizacion manual/automatica
- Mapeo de SKUs externos a productos de Nevada
- Logs de sincronizacion con reintentos (individual y masivo)
- Alerta de SKUs sin mapear
- Extensible a MercadoLibre y otros proveedores
- Feature gate: habilitado desde configuracion de la organizacion

### Reportes y Analisis

- 17 tipos de reportes (inventario, ventas, devoluciones)
- Analisis ABC (clasificacion Pareto de productos)
- Stock muerto (productos sin ventas en N dias con niveles de riesgo)
- Exportacion a Excel via ExcelJS
- Filtros dinamicos por tipo de reporte

### Dashboard

- 4 tarjetas de metricas principales
- Tendencia de ventas (7 dias) con AreaChart
- Top 5 productos por ingresos con BarChart
- Distribucion de stock por bodega con PieChart
- Feed de actividad reciente

### Multi-Empresa

- Gestion de empresas/lineas de negocio por organizacion
- Selector global en header (filtra productos, stock, ventas, devoluciones, movimientos, reportes, dashboard)
- Toggle de habilitacion en configuracion (solo administradores)
- Intercambio de productos entre empresas (ADJUST_IN/ADJUST_OUT)

### Importacion de Datos

- Importacion masiva desde archivos Excel (.xlsx) y CSV
- Plantillas descargables por tipo de entidad
- Validacion previa con reporte de errores
- Soporte para productos, categorias, bodegas, contactos y mas

### Administracion

- **Usuarios**: CRUD con estados (ACTIVE/INACTIVE/LOCKED)
- **Roles**: Sistema y personalizados, gestion de permisos (80+ permisos granulares)
- **Auditoria**: Historial de actividad con filtros avanzados y exportacion Excel
- **Configuracion**: Perfil de usuario, alertas de stock, habilitacion de funcionalidades

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
| **TanStack Query**  | Server state (cache, refetch, invalidacion) |
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
| **Framer Motion**  | Animaciones                                      |
| **Sonner**         | Notificaciones toast                             |

### Herramientas

| Tecnologia            | Proposito                    |
| --------------------- | ---------------------------- |
| **next-intl**         | Internacionalizacion (en/es) |
| **ExcelJS**           | Exportacion e importacion Excel |
| **Vitest**            | Unit testing                 |
| **Playwright**        | E2E testing                  |
| **ESLint + Prettier** | Linting y formateo           |

---

## Inicio Rapido

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
|-- app/                          # Next.js 16 App Router
|   |-- api/auth/                 # Rutas BFF (login, refresh, logout)
|   +-- [locale]/
|       |-- (auth)/login/         # Pagina de login
|       +-- (dashboard)/dashboard/
|           |-- inventory/        # Productos, Categorias, Bodegas, Stock, Movimientos, Transferencias, Empresas
|           |-- sales/            # Ventas CRUD + workflow
|           |-- returns/          # Devoluciones CRUD + workflow
|           |-- contacts/         # Clientes y proveedores
|           |-- integrations/     # Conexiones e-commerce (VTEX)
|           |-- reports/          # Catalogo + visor de reportes
|           |-- imports/          # Importacion de datos
|           |-- users/            # Gestion de usuarios
|           |-- roles/            # Gestion de roles y permisos
|           |-- audit/            # Log de auditoria
|           +-- settings/         # Configuracion
|
|-- modules/                      # Modulos de negocio (Arquitectura Hexagonal)
|   |-- authentication/           # Login, tokens, sesion
|   |-- inventory/                # Productos, bodegas, stock, movimientos, transferencias
|   |-- sales/                    # Ventas con workflow completo
|   |-- returns/                  # Devoluciones
|   |-- contacts/                 # Clientes y proveedores
|   |-- integrations/             # Integraciones e-commerce
|   |-- dashboard/                # Metricas y graficos
|   |-- reports/                  # 17 tipos de reportes
|   |-- imports/                  # Importacion de datos
|   |-- users/                    # Administracion de usuarios
|   |-- roles/                    # Roles y permisos
|   |-- audit/                    # Auditoria
|   |-- companies/                # Empresas (multi-company)
|   +-- settings/                 # Perfil y alertas
|
|-- shared/                       # Codigo compartido
|   |-- domain/                   # Entity, AggregateRoot, ValueObject, Permissions
|   |-- application/              # HttpClientPort, PaginatedResult
|   |-- infrastructure/           # AxiosHttpClient con interceptores, Logger
|   +-- presentation/             # PermissionGate, RequirePermission, AccessDenied
|
|-- ui/                           # Componentes UI reutilizables
|   |-- components/               # Button, Input, Dialog, Table, Badge, etc.
|   |-- layout/                   # Sidebar, Header, DashboardShell
|   +-- lib/                      # cn() utility
|
|-- config/                       # Validacion de entorno + contenedor DI
|-- i18n/                         # Configuracion next-intl
|-- lib/messages/                 # Traducciones en.json, es.json
+-- hooks/                        # useDebounce, useLocalStorage, useMediaQuery, useIdleTimeout
```

---

## Arquitectura por Modulo

Cada modulo en `src/modules/` sigue la misma estructura hexagonal:

```
modules/{nombre}/
|-- domain/
|   |-- entities/         # Clases de dominio (extienden Entity<string>)
|   +-- ports/            # Interfaces de repositorio (con PaginatedResult<T> local)
|-- application/
|   |-- dto/              # Data Transfer Objects
|   |-- mappers/          # Conversion API <-> Domain
|   +-- use-cases/        # Logica de negocio
|-- infrastructure/
|   |-- adapters/         # Implementacion API (Axios + apiClient)
|   +-- store/            # Zustand stores (filtros, estado local)
+-- presentation/
    |-- hooks/            # React Query hooks (query key factories)
    |-- schemas/          # Validacion Zod
    +-- components/       # Componentes React (con index.ts barrel)
```

### Principios

- **Domain**: Entidades puras sin dependencias externas. Cada puerto define su propio `PaginatedResult<T>`.
- **Application**: DTOs para transferencia de datos, mappers para conversion, use cases para logica.
- **Infrastructure**: Adaptadores que implementan los puertos usando `apiClient` de `@/shared/infrastructure/http`.
- **Presentation**: Hooks de React Query con query key factories, schemas Zod para validacion de formularios, componentes React.

---

## Modulos

| Modulo             | Descripcion                                                        | Ruta                             |
| ------------------ | ------------------------------------------------------------------ | -------------------------------- |
| **Authentication** | Login, tokens, sesion, permisos                                    | `/login`                         |
| **Dashboard**      | Metricas, graficos, actividad reciente                             | `/dashboard`                     |
| **Inventory**      | Productos, categorias, bodegas, stock, movimientos, transferencias | `/dashboard/inventory/*`         |
| **Sales**          | Ventas con workflow completo (5 estados)                           | `/dashboard/sales/*`             |
| **Returns**        | Devoluciones de clientes y a proveedores                           | `/dashboard/returns/*`           |
| **Contacts**       | Gestion de clientes y proveedores                                  | `/dashboard/contacts/*`          |
| **Integrations**   | Conexiones e-commerce (VTEX), SKU mappings, sync logs              | `/dashboard/integrations/*`      |
| **Reports**        | 17 tipos de reportes con filtros y exportacion                     | `/dashboard/reports/*`           |
| **Imports**        | Importacion masiva de datos desde Excel/CSV                        | `/dashboard/imports/*`           |
| **Users**          | CRUD de usuarios con gestion de estados                            | `/dashboard/users/*`             |
| **Roles**          | Roles del sistema y personalizados, permisos                       | `/dashboard/roles/*`             |
| **Audit**          | Log de auditoria con filtros y exportacion                         | `/dashboard/audit`               |
| **Companies**      | Empresas/lineas de negocio (multi-company)                         | `/dashboard/inventory/companies` |
| **Settings**       | Perfil de usuario, alertas de stock, configuracion                 | `/dashboard/settings`            |

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

# Testing (~227 suites, ~1,921 tests)
npm run test             # Vitest (unit tests)
npm run test:run         # Vitest ejecucion unica
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

| Documento                                        | Descripcion                                              |
| ------------------------------------------------ | -------------------------------------------------------- |
| [Arquitectura](docs/architecture.md)             | Clean/Hexagonal Architecture, estado, auth flow, DI      |
| [Modulos](docs/modules.md)                       | Guia detallada de los 14 modulos de negocio              |
| [Integraciones](docs/integrations.md)            | Documentacion completa del modulo de integraciones       |
| [Estructura de Tests](docs/testing-structure.md) | Convencion de testing y estructura de archivos de prueba |

---

## Relacion con el Backend

Este frontend consume la API REST del backend **improved-parakeet**:

```
+---------------------+         +---------------------+
|                     |  REST   |                     |
|  jubilant-octo-     | ------> |  improved-parakeet  |
|  invention          |  API    |                     |
|                     |         |                     |
|  Next.js 16         |         |  NestJS 11          |
|  React 19           |         |  Prisma + PostgreSQL|
|  TanStack Query     |         |  Redis              |
|  Zustand            |         |  JWT Auth           |
|                     |         |                     |
+---------------------+         +---------------------+
```

### Headers Requeridos

Todas las peticiones autenticadas incluyen:

| Header                | Descripcion                    |
| --------------------- | ------------------------------ |
| `Authorization`       | `Bearer {accessToken}`         |
| `X-Organization-Slug` | Slug de la organizacion activa |
| `X-Organization-ID`   | ID de la organizacion activa   |
| `X-User-ID`           | ID del usuario autenticado     |

### Patron de Respuestas de la API

La mayoria de los endpoints del backend siguen uno de estos formatos:

| Formato                                           | Usado por                                  |
| ------------------------------------------------- | ------------------------------------------ |
| `{ data: T }`                                     | Detalle de entidades de inventario         |
| `{ data: T[], pagination }`                       | Listas de inventario                       |
| `{ success, message, data, timestamp }`           | Auth, ventas, devoluciones, integraciones  |
| `{ success, message, data, pagination, timestamp }` | Listas de auth, ventas, devoluciones     |

---

## Seguridad

La aplicacion implementa multiples capas de seguridad:

### Cookies HttpOnly

Los tokens JWT (access y refresh) se almacenan exclusivamente en cookies HttpOnly/Secure/SameSite=Strict. Ningun token es accesible desde JavaScript del lado del cliente.

### Rutas BFF (Backend For Frontend)

Las operaciones de autenticacion pasan por rutas API internas de Next.js (`src/app/api/auth/`) que gestionan las cookies de forma segura en el servidor.

### Content Security Policy

Se aplica CSP con `strict-dynamic` para scripts y `unsafe-inline` para estilos (requerido por Tailwind CSS). Esto previene ataques XSS mediante inyeccion de scripts.

### Timeout de Sesion

- 15 minutos de inactividad activan un dialogo de advertencia
- 2 minutos adicionales para confirmar la sesion activa
- Logout automatico si no hay respuesta del usuario
- Implementado con el hook `useIdleTimeout` y el componente `SessionTimeoutDialog`

### Control de Acceso

- RBAC con 80+ permisos granulares
- Componentes `<PermissionGate>` y `<RequirePermission>` para renderizado condicional
- Sidebar filtrado dinamicamente segun los permisos del usuario autenticado
- Pagina de acceso denegado para rutas sin permiso

---

## Contribucion

1. Fork el repositorio
2. Crea una rama: `git checkout -b feature/nueva-funcionalidad`
3. Desarrolla siguiendo las convenciones del proyecto
4. Ejecuta quality checks: `npm run quality`
5. Ejecuta los tests: `npm run test:run`
6. Commit con conventional commits: `feat(inventory): add stock alerts`
7. Crea un Pull Request

### Convenciones

| Aspecto          | Convencion                                    |
| ---------------- | --------------------------------------------- |
| **Codigo**       | Ingles (variables, funciones, componentes)    |
| **Componentes**  | PascalCase (`ProductList.tsx`)                |
| **Hooks**        | Prefijo `use` (`useProducts.ts`)              |
| **Stores**       | Sufijo `.store.ts`                            |
| **Schemas**      | Sufijo `.schema.ts`                           |
| **DTOs**         | Sufijo `.dto.ts`                              |
| **Mappers**      | Sufijo `.mapper.ts`                           |
| **Traducciones** | Namespace con punto (`inventory.products.title`) |
| **Tests**        | Sufijo `.test.ts` o `.test.tsx`               |

### Estructura de un Commit

```
tipo(alcance): descripcion breve

Tipos: feat, fix, refactor, test, docs, chore, style, perf
Alcance: modulo o area afectada (inventory, sales, auth, shared, ui)
```

---

## Licencia

MIT License - Copyright (c) 2025 Cesar Javier Ortiz Montero

---

<p align="center">
  <sub>Construido con Next.js 16 + React 19 + TypeScript + Arquitectura Hexagonal</sub>
</p>
