# WorkshopFlow — Frontend

A manufacturing ERP frontend built with **React 19**, **TypeScript**, and **Tailwind CSS v4**. Provides a role-aware UI for managing production work orders, items, inventory, workstations, and users.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Project Structure](#project-structure)
- [Pages & Access Control](#pages--access-control)
- [Role-Based Dashboards](#role-based-dashboards)

---

## Features

- **JWT Authentication** — Login, auto-logout on token expiry (401 interceptor)
- **Role-Based Access Control** — Route-level protection (`CapabilityRoute`), sidebar filtering, and per-page button/modal guards
- **Role-Based Dashboards** — Distinct dashboard views for Admin/Engineer, Operator, and Warehouse roles
- **Gantt Chart** — Work Orders timeline with week/month toggle and click-to-open detail modal
- **Items** — Full CRUD with BOM management, Routing steps, weight calculation, sort/filter/pagination
- **Work Orders** — Create, release, cancel; sequential operations with assign/start/complete workflow
- **Inventory** — Transaction history per item, manual Purchase/Adjustment with business rule enforcement
- **Workstations** — Accordion expand/collapse with nested machine management
- **Users** — User management with role assignment (ADMIN only)
- **Dark Mode** — System/manual toggle via `next-themes`

---

## Tech Stack

| Component | Technology |
|---|---|
| Framework | React 19 + Vite |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| UI Components | shadcn/ui (Radix-based) |
| Forms | React Hook Form + Zod |
| Charts | Recharts |
| HTTP | Native `fetch` with global 401 interceptor |
| Auth | JWT via `js-cookie` |
| Toasts | Sonner |
| Icons | Lucide React |

---

## Prerequisites

- Node.js 18+
- The [WorkshopFlow backend](https://github.com/dimigeo6595/WorkshopFlowWebModelFirstRestDev) running on `http://localhost:8081`

---

## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/dimigeo6595/workshopflow-frontend.git
cd workshopflow-frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file:
```bash
cp .env.example .env.local
# Edit VITE_API_URL if your backend runs on a different port
```

4. Start the development server:
```bash
npm run dev
```

5. Open `http://localhost:5173` in your browser.

---

## Environment Variables

```env
VITE_API_URL=http://localhost:8081/api/v1
```

---

## Project Structure

```
src/
├── api/                  # API client functions (one file per resource)
│   ├── client.ts         # Base URL, authHeader, apiFetch (401 interceptor)
│   ├── auth.ts
│   ├── items.ts
│   ├── workorders.ts
│   ├── inventory.ts
│   ├── workstations.ts
│   ├── users.ts
│   └── roles.ts
│
├── components/           # Reusable UI components
│   ├── AppLayout.tsx     # Sidebar + Header layout wrapper
│   ├── CapabilityRoute.tsx   # Route-level RBAC guard
│   ├── ProtectedRoute.tsx    # Auth guard
│   ├── StatusBadge.tsx       # Work Order / Operation status badge
│   ├── ItemAutocomplete.tsx  # Debounced item search
│   ├── ItemFormModal.tsx     # Create/Edit item with BOM + Routing tabs
│   ├── WorkOrderFormModal.tsx
│   ├── WorkOrderDetailModal.tsx  # Operations + BOM + Routing tabs
│   ├── WorkstationFormModal.tsx
│   ├── MachineFormModal.tsx
│   └── UserFormModal.tsx
│
├── context/
│   └── AuthProvider.tsx  # JWT decode, capabilities, login/logout
│
├── pages/
│   ├── LoginPage.tsx
│   ├── DashboardPage.tsx    # Role-specific dashboards + Gantt chart
│   ├── ItemsPage.tsx
│   ├── WorkOrdersPage.tsx
│   ├── InventoryPage.tsx
│   ├── WorkstationsPage.tsx
│   └── UsersPage.tsx
│
├── schemas/              # Zod validation schemas (one per resource)
├── types/                # TypeScript interfaces (DTOs)
├── hooks/
│   └── useDebounce.ts
└── utils/
    └── cookies.ts
```

---

## Pages & Access Control

| Page | Route | Required Capability | ADMIN | PROD_ENG | OPERATOR | WAREHOUSE |
|---|---|---|:---:|:---:|:---:|:---:|
| Dashboard | `/dashboard` | — (all authenticated) | ✅ | ✅ | ✅ | ✅ |
| Items | `/items` | `VIEW_ITEMS` | ✅ | ✅ | ✅ | ✅ |
| Work Orders | `/workorders` | `VIEW_WORK_ORDERS` | ✅ | ✅ | ✅ | ❌ |
| Inventory | `/inventory` | `VIEW_INVENTORY` | ✅ | ✅ | ❌ | ✅ |
| Workstations | `/workstations` | `VIEW_MACHINES` | ✅ | ✅ | ❌ | ❌ |
| Users | `/users` | `VIEW_USERS` | ✅ | ✅ | ❌ | ❌ |

Unauthorized direct URL access (e.g. OPERATOR navigating to `/inventory`) is automatically redirected to `/dashboard`.

---

## Role-Based Dashboards

### ADMIN / Production Engineer
- KPI cards: Total Work Orders, In Progress, Completed, Total Items
- **Gantt Chart**: Work Orders timeline with Week/Month toggle — click any bar to open detail modal
- Recent Work Orders table (clickable rows)
- Bar chart: Work Orders by Status
- Pie chart: Items by Type

### Operator
- KPI cards: Active Work Orders, In Progress, Released (Pending)
- Table of active (Released + InProgress) work orders with operation progress

### Warehouse Manager
- KPI cards: Raw Materials count, Consumables count, Low Stock Items
- ⚠️ Low Stock Alert panel (items with stock < 10)
- Inventory Overview table (RawMaterial + Consumable, sorted by stock ascending)

---

## Backend

The companion ASP.NET Core backend is available at: [WorkshopFlowWebModelFirstRestDev](https://github.com/dimigeo6595/WorkshopFlowWebModelFirstRestDev)

---

## License

This project is developed for educational purposes.
