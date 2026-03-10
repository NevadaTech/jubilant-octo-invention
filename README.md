> **[English](./README.md)** | [Espanol](./README.es.md)

<p align="center">
  <img src="https://nextjs.org/api/docs-og?title=Nevada%20Inventory%20System" width="400" alt="Nevada Inventory System" />
</p>

<h1 align="center">Nevada Inventory System - Frontend</h1>

<p align="center">
  Multi-tenant inventory management web application built with <strong>Next.js 16</strong>, <strong>React 19</strong>, and <strong>TypeScript</strong>, following <strong>Clean Architecture</strong> and <strong>Hexagonal Architecture</strong> principles.
</p>

<p align="center">
  <a href="#"><img src="https://img.shields.io/badge/Next.js-16-black.svg" alt="Next.js" /></a>
  <a href="#"><img src="https://img.shields.io/badge/React-19-blue.svg" alt="React" /></a>
  <a href="#"><img src="https://img.shields.io/badge/TypeScript-strict-blue.svg" alt="TypeScript" /></a>
  <a href="#"><img src="https://img.shields.io/badge/TailwindCSS-4-38bdf8.svg" alt="Tailwind" /></a>
  <a href="#"><img src="https://img.shields.io/badge/license-MIT-green.svg" alt="License" /></a>
</p>

---

## Table of Contents

- [Description](#description)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [Module Architecture](#module-architecture)
- [Modules](#modules)
- [Available Scripts](#available-scripts)
- [Environment Variables](#environment-variables)
- [Additional Documentation](#additional-documentation)
- [Backend Relationship](#backend-relationship)
- [Security](#security)
- [Contributing](#contributing)
- [License](#license)

---

## Description

Frontend for the **Nevada Inventory System**, a multi-tenant inventory management system that allows you to manage products, warehouses, stock movements, sales, returns, reports, and more. It connects to the NestJS backend ([improved-parakeet](https://github.com/your-username/improved-parakeet)) via REST API.

### Goals

| Goal                 | Description                                      |
| -------------------- | ------------------------------------------------ |
| **Modern interface** | Responsive UI with shadcn/ui + Tailwind CSS      |
| **Type safe**        | Strict TypeScript end-to-end with Zod validation |
| **Multi-language**   | Full support for English and Spanish (next-intl) |
| **Access control**   | RBAC with 80+ granular permissions               |
| **Reports**          | 17 report types with Excel export                |
| **Real-time data**   | Dashboard with live metrics and updated charts   |

---

## Features

### Authentication and Security

- JWT-based login (access + refresh tokens)
- Automatic token renewal on 401 responses
- RBAC with 80+ granular permissions
- HttpOnly / Secure / SameSite=Strict cookies via BFF API routes
- Session timeout with idle detection (15 min idle, 2 min warning dialog)
- `<PermissionGate>` and `<RequirePermission>` components for UI-level access control
- Sidebar navigation filtered by user permissions

### Inventory Management

- **Products**: CRUD with SKU, categories, pricing, rotation metrics
- **Warehouses**: Storage location management
- **Stock**: Real-time inventory levels per product/warehouse
- **Movements**: Inbound/outbound with workflow DRAFT -> POSTED -> VOID
- **Transfers**: Between warehouses with states (DRAFT -> IN_TRANSIT -> RECEIVED)

### Sales and Returns

- **Sales**: Full workflow DRAFT -> CONFIRMED -> PICKING -> SHIPPED -> COMPLETED
- **Returns**: Customer returns and supplier returns with original price tracking
- **Timeline**: Lifecycle visualization for each sale

### Contacts

- **Customers and Suppliers**: Unified contact management with type (CUSTOMER | SUPPLIER | BOTH)
- **Fields**: Name, identification (unique per org), email, phone, address, notes
- **Sales integration**: Optional contact linking on sales records

### Integrations

- **VTEX e-commerce**: Connect your VTEX store to sync orders and products
- **Extensible architecture**: Provider-based design ready for additional platforms (e.g., MercadoLibre)
- **Sync options**: Webhook, polling, or both; inbound, outbound, or bidirectional
- **Management**: SKU mapping, sync logs, failed sync retry

### Reports and Analysis

- 17 report types (inventory, sales, returns)
- ABC Analysis (Pareto classification)
- Dead Stock detection (products without sales in N days)
- Excel export via ExcelJS
- Dynamic filters per report type

### Dashboard

- 4 main metric cards
- Sales trend (7 days) with AreaChart
- Top 5 products by revenue with BarChart
- Stock distribution by warehouse with PieChart
- Recent activity feed

### Multi-Company

- Business unit / company management per organization
- Global selector in header (filters products, stock, sales, returns, movements, reports, dashboard)
- Enable/disable toggle in settings (admin-only)
- Product swap between companies (ADJUST_IN / ADJUST_OUT)

### Data Import

- Excel and CSV file import for bulk data loading
- Template download for correct formatting
- Validation and error reporting during import

### Administration

- **Users**: CRUD with status management (ACTIVE / INACTIVE / LOCKED)
- **Roles**: System and custom roles, permission management (80+ granular permissions)
- **Audit Log**: Activity history with advanced filters and Excel export
- **Settings**: User profile and configurable stock alerts

---

## Tech Stack

### Core

| Technology       | Version | Purpose                   |
| ---------------- | ------- | ------------------------- |
| **Next.js**      | 16.1    | Framework with App Router |
| **React**        | 19.2    | UI library                |
| **TypeScript**   | 5.9+    | Strict static typing      |
| **Tailwind CSS** | 4.2     | Utility-first styling     |

### State and Data

| Technology          | Purpose                                     |
| ------------------- | ------------------------------------------- |
| **TanStack Query**  | Server state (cache, refetch, invalidation) |
| **Zustand**         | Client state (filters, modals, auth)        |
| **Axios**           | HTTP client with interceptors               |
| **Zod**             | Schema validation and forms                 |
| **React Hook Form** | Form management                             |

### UI

| Technology        | Purpose                                          |
| ----------------- | ------------------------------------------------ |
| **Radix UI**      | Accessible primitives (Dialog, Select, Dropdown) |
| **shadcn/ui**     | Styled component library                         |
| **Recharts**      | Charts (Area, Bar, Pie)                          |
| **Lucide React**  | Icons                                            |
| **Framer Motion** | Animations                                       |
| **Sonner**        | Toast notifications                              |

### Tools

| Technology            | Purpose                      |
| --------------------- | ---------------------------- |
| **next-intl**         | Internationalization (en/es) |
| **ExcelJS**           | Excel export                 |
| **Vitest**            | Unit testing                 |
| **Playwright**        | E2E testing                  |
| **ESLint + Prettier** | Linting and formatting       |

---

## Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/your-username/jubilant-octo-invention.git
cd jubilant-octo-invention

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env.local
# Edit .env.local with the backend URL

# 4. Start development server
npm run dev

# Open http://localhost:3000
```

### Prerequisites

| Tool              | Version | Required                                |
| ----------------- | ------- | --------------------------------------- |
| Node.js           | 18+     | Yes                                     |
| npm / yarn / pnpm | -       | Yes                                     |
| Backend API       | -       | Yes (improved-parakeet must be running) |

---

## Project Structure

```
src/
├── app/                          # Next.js 16 App Router
│   ├── [locale]/
│   │   ├── (auth)/login/         # Login page
│   │   └── (dashboard)/dashboard/
│   │       ├── inventory/        # Products, Categories, Warehouses, Stock, Movements, Transfers, Companies
│   │       ├── sales/            # Sales CRUD + workflow
│   │       ├── returns/          # Returns CRUD + workflow
│   │       ├── contacts/         # Customers and suppliers
│   │       ├── integrations/     # VTEX and provider connections
│   │       ├── reports/          # Report catalog + viewer
│   │       ├── imports/          # Data import (Excel/CSV)
│   │       ├── users/            # User management
│   │       ├── roles/            # Role and permission management
│   │       ├── audit/            # Audit log
│   │       └── settings/         # Settings
│   └── api/                      # BFF API routes (auth cookies)
│
├── modules/                      # Business modules (Hexagonal Architecture)
│   ├── authentication/           # Login, tokens, session
│   ├── dashboard/                # Metrics and charts
│   ├── inventory/                # Products, warehouses, stock, movements, transfers
│   ├── sales/                    # Sales with full workflow
│   ├── returns/                  # Returns
│   ├── contacts/                 # Customers and suppliers
│   ├── integrations/             # VTEX e-commerce integration
│   ├── reports/                  # 17 report types
│   ├── imports/                  # Data import
│   ├── users/                    # User administration
│   ├── roles/                    # Roles and permissions
│   ├── audit/                    # Audit log
│   ├── companies/                # Companies (multi-company)
│   └── settings/                 # Profile and alerts
│
├── shared/                       # Shared code
│   ├── domain/                   # Entity, AggregateRoot, ValueObject, Permissions
│   ├── application/              # HttpClientPort, PaginatedResult
│   ├── infrastructure/           # AxiosHttpClient with interceptors
│   └── presentation/             # PermissionGate, RequirePermission, AccessDenied
│
├── ui/                           # Reusable UI components
│   ├── components/               # Button, Input, Dialog, Table, Badge, etc.
│   ├── layout/                   # Sidebar, Header, DashboardShell
│   └── lib/                      # cn() utility
│
├── config/                       # Env validation + DI container
├── i18n/                         # next-intl configuration
├── lib/messages/                 # Translations en.json, es.json
└── hooks/                        # useDebounce, useLocalStorage, useMediaQuery
```

---

## Module Architecture

Each module in `src/modules/` follows the same hexagonal structure:

```
modules/{name}/
├── domain/
│   ├── entities/         # Domain classes
│   └── ports/            # Repository interfaces
├── application/
│   ├── dto/              # Data Transfer Objects
│   ├── mappers/          # API <-> Domain conversion
│   └── use-cases/        # Business logic
├── infrastructure/
│   ├── adapters/         # API implementation (Axios)
│   └── store/            # Zustand stores (filters)
└── presentation/
    ├── hooks/            # React Query hooks
    ├── schemas/          # Zod validation
    └── components/       # React components
```

This architecture ensures a clear separation of concerns: the domain layer has no external dependencies, the application layer orchestrates use cases, the infrastructure layer handles API communication, and the presentation layer manages UI components and state.

---

## Modules

| Module             | Description                                                   | Route                            |
| ------------------ | ------------------------------------------------------------- | -------------------------------- |
| **Authentication** | Login, tokens, session, permissions                           | `/login`                         |
| **Dashboard**      | Metrics, charts, recent activity                              | `/dashboard`                     |
| **Inventory**      | Products, categories, warehouses, stock, movements, transfers | `/dashboard/inventory/*`         |
| **Sales**          | Sales with full workflow (5 states)                           | `/dashboard/sales/*`             |
| **Returns**        | Customer returns and supplier returns                         | `/dashboard/returns/*`           |
| **Contacts**       | Customer and supplier management                              | `/dashboard/contacts/*`          |
| **Integrations**   | VTEX e-commerce connection, sync logs, SKU mapping            | `/dashboard/integrations/*`      |
| **Reports**        | 17 report types with filters and export                       | `/dashboard/reports/*`           |
| **Imports**        | Bulk data import from Excel/CSV                               | `/dashboard/imports/*`           |
| **Users**          | User CRUD with status management                              | `/dashboard/users/*`             |
| **Roles**          | System and custom roles, permissions                          | `/dashboard/roles/*`             |
| **Audit**          | Audit log with filters and export                             | `/dashboard/audit`               |
| **Companies**      | Business units / lines of business (multi-company)            | `/dashboard/inventory/companies` |
| **Settings**       | User profile and alert configuration                          | `/dashboard/settings`            |

> For detailed documentation on each module, see [docs/modules.md](docs/modules.md).

---

## Available Scripts

```bash
# Development
npm run dev              # Development server with Turbopack
npm run build            # Production build
npm run start            # Production server

# Code Quality
npm run lint             # ESLint
npm run lint:fix         # ESLint with auto-fix
npm run format           # Prettier format
npm run format:check     # Check formatting
npm run type-check       # TypeScript check
npm run quality          # type-check + lint + format:check

# Testing (~227 suites, ~1,921 tests)
npm run test             # Vitest (unit tests) with coverage
npm run test:run         # Vitest single run
npm run test:watch       # Vitest in watch mode
npm run test:e2e         # Playwright E2E
npm run test:e2e:ui      # Playwright with UI
npm run test:e2e:headed  # Playwright with visible browser
```

---

## Environment Variables

Create `.env.local` based on `.env.example`:

```env
# Application URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=Nevada Inventory System

# Backend API
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_API_TIMEOUT=30000

# Auth cookies
NEXT_PUBLIC_AUTH_COOKIE_NAME=nevada_auth_token
NEXT_PUBLIC_REFRESH_COOKIE_NAME=nevada_refresh_token

# Mock API (development)
NEXT_PUBLIC_ENABLE_MOCK_API=false

# Sentry (optional)
NEXT_PUBLIC_SENTRY_DSN=
SENTRY_AUTH_TOKEN=
```

---

## Additional Documentation

| Document              | Description                                | Links                                                             |
| --------------------- | ------------------------------------------ | ----------------------------------------------------------------- |
| **Architecture**      | Clean/Hexagonal Architecture, state, auth  | [EN](docs/architecture.md) / [ES](docs/architecture.md)           |
| **Modules**           | Detailed guide for all 14 business modules | [EN](docs/modules.md) / [ES](docs/modules.md)                     |
| **Testing Structure** | Testing conventions and organization       | [EN](docs/testing-structure.md) / [ES](docs/testing-structure.md) |
| **Integrations**      | VTEX integration and extensibility guide   | [EN](docs/integrations.md) / [ES](docs/integrations.md)           |

---

## Backend Relationship

This frontend consumes the REST API from the **improved-parakeet** backend:

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

### Required Headers

All authenticated requests include the following headers:

| Header                | Description                     |
| --------------------- | ------------------------------- |
| `Authorization`       | `Bearer {accessToken}`          |
| `X-Organization-Slug` | Slug of the active organization |
| `X-Organization-ID`   | ID of the active organization   |
| `X-User-ID`           | ID of the authenticated user    |

---

## Security

The application implements multiple layers of security:

| Layer                       | Implementation                                                                 |
| --------------------------- | ------------------------------------------------------------------------------ |
| **Token storage**           | HttpOnly / Secure / SameSite=Strict cookies -- no tokens in JavaScript         |
| **BFF routes**              | `src/app/api/auth/{login,refresh,logout}/route.ts` proxy authentication calls  |
| **Content Security Policy** | `strict-dynamic` for scripts, `unsafe-inline` for styles (Tailwind)            |
| **Session timeout**         | 15-minute idle detection with 2-minute warning dialog before forced logout     |
| **Permission gates**        | `<PermissionGate>` and `<RequirePermission>` components enforce RBAC in the UI |
| **Error suppression**       | Production logger suppresses error details to prevent information leakage      |

---

## Contributing

1. Fork the repository
2. Create a branch: `git checkout -b feature/new-feature`
3. Develop following the project conventions
4. Run quality checks: `npm run quality`
5. Commit with conventional commits: `feat(inventory): add stock alerts`
6. Create a Pull Request

### Conventions

| Aspect           | Convention                                    |
| ---------------- | --------------------------------------------- |
| **Code**         | English (variables, functions, components)    |
| **Components**   | PascalCase (`ProductList.tsx`)                |
| **Hooks**        | `use` prefix (`useProducts.ts`)               |
| **Stores**       | `.store.ts` suffix                            |
| **Schemas**      | `.schema.ts` suffix                           |
| **Translations** | Namespace dotted (`inventory.products.title`) |

---

## License

MIT License - Copyright (c) 2025 Cesar Javier Ortiz Montero

---

<p align="center">
  <sub>Built with Next.js 16 + React 19 + TypeScript</sub>
</p>
