# DigiTEC Project Architecture Analysis

## Architecture Pattern: Role-Based Multi-Tenant SPA with Backend-as-a-Service

### Core Architecture Style
**Feature-Sliced Design with Role Segmentation** — a modular React SPA where features are organized by user role (admin, treasurer, board, member) with shared utilities and domain logic.

---

## Key Architectural Components

### 1. Presentation Layer
- **Framework**: React 19 + Vite (SWC)
- **Styling**: Tailwind CSS + DaisyUI (utility-first with component primitives)
- **UI Components**: Material UI (selectively chunked for performance)
- **Pattern**: Component-driven with role-specific page containers

### 2. Routing & Access Control
- **Router**: React Router v7 with role-based route guards
- **Protection Model**: 
  - `ProtectedRoutes` wrapper checks auth session + member role
  - Frontend route segmentation (`/admin`, `/treasurer`, `/board`, `/regular-member`, `/associate-member`)
  - Backend enforcement via Supabase RLS (Row-Level Security)
- **Auth Flow**: Supabase Auth with session management in `AuthProvider` context

### 3. State Management (Hybrid)
| Concern | Solution | Rationale |
|---------|----------|-----------|
| Auth/Session | React Context (`AuthProvider`) | Avoids Redux overhead for auth |
| Server Data | TanStack Query (in-progress migration) | Caching, invalidation, optimistic updates |
| UI State (modals) | Redux Toolkit (minimal slices) | Cross-cutting UI toggles |
| Derived/Calculated | Pure functions in `constants/` | Financial calculations (loan schedules) |

### 4. Backend Architecture
- **BaaS**: Supabase (Postgres + Auth + Storage + Edge Functions)
- **Data Access**: 
  - Direct queries via `@supabase/supabase-js`
  - RLS policies enforce role-based data filtering server-side
  - SQL views for complex aggregations (`view_tables.sql`)
- **Custom Logic**: Deno Edge Functions (e.g., `create-user`) with CORS handling

### 5. Domain Logic (Financial Calculations)
- Located in `src/constants/` (to be refactored to `src/domain/`)
- **Modules**:
  - `calcLoanSchedFlat.js` — flat-rate loan schedules
  - `calcLoanSchedDiminishing.js` — diminishing balance schedules
  - `Calculation.js` — general financial utilities
  - `DateCalculation.js` — date/time helpers
  - `numericFormat.js` — currency/number formatting
- **Pattern**: Pure, testable functions (candidates for domain module extraction)

---

## Folder Structure Analysis

```
src/
├── backend/           # Supabase client, auth context, hooks
│   ├── context/       # AuthProvider, useMemberRole
│   ├── database/      # SQL schemas, views
│   └── hooks/         # Role-specific data hooks (admin, treasurer, board, member)
├── components/        # Reusable UI (shared forms, tables, modals)
├── constants/         # Business logic (calculations, roles, colors)
├── features/          # Redux slices (UI state only)
├── layout/            # Layout chrome (Topbar, Sidebar, Footer)
├── pages/             # Route-level containers segmented by role
│   ├── admin/
│   ├── treasurer/
│   ├── board/
│   ├── members/
│   └── shared/        # Cross-role pages (reports, dashboards)
└── routes.jsx         # Centralized route definitions
```

**Strengths**:
- Clear role segmentation in `pages/`
- Separation of concerns (backend, components, pages)

**Evolution Needed** (per your docs):
- Create `src/domain/` for pure business logic
- Remove legacy folders (`_old/`, `_todelete/`)
- Consolidate overlapping utilities

---

## Data Flow

```
User Request
    ↓
React Router (role-based guard)
    ↓
ProtectedRoutes (checks session + role via AuthProvider + useMemberRole)
    ↓
Layout (role-specific sidebar/navigation)
    ↓
Page Component
    ↓
TanStack Query Hook → Supabase SDK
    ↓
Supabase API (RLS filters applied)
    ↓
PostgreSQL (base tables + views)
    ↓
Response → React Component → Domain Calculations → UI Render
```

---

## Security Model
- **Frontend**: Route guards + role checks in components
- **Backend**: 
  - RLS policies enforce data access per `auth.uid()` and role
  - Edge Functions validate `Authorization` header
  - CORS configured per allowed origins
- **Least Privilege**: Users only see data their role permits

---

## Performance Optimizations
- Code splitting via Vite (manual chunks for MUI)
- `PerformanceMonitor.jsx` tracks long tasks in dev
- TanStack Query for request deduplication/caching
- Virtualized tables planned for large datasets

---

## Summary Classification

Your architecture is a **Role-Based Multi-Tenant SPA** with:
- **Pattern**: Feature-sliced design with role segmentation
- **Backend**: Backend-as-a-Service (Supabase)
- **State**: Hybrid (Context + TanStack Query + Redux for UI)
- **Security**: Frontend route guards + backend RLS
- **Domain**: Financial calculation utilities (to be extracted to domain modules)

This is a solid, modern architecture for a cooperative financial management system with clear separation of concerns and role-based access control.
