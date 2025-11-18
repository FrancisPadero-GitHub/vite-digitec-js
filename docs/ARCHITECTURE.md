# DigiTEC Architecture

> Living document describing how the system is structured, how data moves, and how to evolve it safely. Keep it concise and updated when major refactors land.

## 1. Purpose & Scope
DigiTEC is a cooperative fund and loan monitoring system supporting multiple roles (admin, treasurer, board, regular member, associate member). Core concerns:
- Accurate financial/loan calculations
- Role‑based access & filtered data views
- Auditable history (activity logs, loan account details)
- Performance that scales as records grow

## 2. High-Level Stack Overview
| Layer | Tech | Notes |
|-------|------|-------|
| UI / SPA | React 19 + Vite | Fast dev, SWC transform via `@vitejs/plugin-react-swc` |
| Styling | Tailwind CSS + DaisyUI | Utility-first + component primitives |
| UI Lib | MUI (icons/components selectively) | Split into manual chunks for performance |
| Data Fetch | Supabase JS SDK + TanStack Query | Query caching, invalidation, optimistic patterns (future) |
| Auth | Supabase Auth | Session + user loaded in `AuthProvider` |
| State (local/UI) | Redux Toolkit (limited slices) | For cross-cutting UI (modals) only—business state via Query |
| Formatting & Calc | `date-fns`, `dayjs`, custom numeric + loan schedule utilities | Financial/rate/time handling |
| Monitoring | `PerformanceMonitor.jsx` | Logs long tasks in dev |

## 3. Runtime Composition
`main.jsx` mounts `<AppRoutes />` wrapped with Redux `<Provider>` and React Query `<QueryClientProvider>` and `<AuthProvider>`.

- **AuthProvider**: Initializes Supabase session + user, exposes via context.
- **ProtectedRoutes**: Guards route branches per role; waits on auth + `useMemberRole()` before rendering layout/children.
- **Layout**: Common shell (topbar/sidebar/footer) plus role-specific navigation items.

### Data Flow (Conceptual)
1. User opens route → React Router selects branch.
2. Guarded branch calls `ProtectedRoutes` → checks session + role.
3. Components use hooks (future: `useQuery`) → Supabase queries (RLS applied server-side).
4. Results rendered; financial views run schedule/format utilities.
5. User actions (forms) → mutate Supabase → invalidate relevant queries (future standardization).

```
[Supabase Tables] <--SQL Views/Policies--> [Supabase SDK] <--hooks/query--> [React Components]
                                        |--> [Redux] (UI flags only)
```

## 4. Roles & Access Control
Roles: `admin`, `treasurer`, `board`, `regular-member`, `associate-member`.

Current enforcement:
- **Front-end**: Router segmentation with `roleAllowed` on `ProtectedRoutes`.
- **Back-end (expected)**: Row Level Security (RLS) in `rls.sql`; ensure parity with UI assumptions.

Recommended evolution:
- Introduce a single `permissions` map: `can(role, action)` to reduce scattered role conditionals.
- Normalize role constants (enum-like) and avoid hard-coded strings in deep components.

## 5. Folder Structure (Current vs Intent)
```
src/
  backend/        # Supabase client, auth context, role hook, SQL artifacts
  components/     # Reusable presentation + monitoring
  constants/      # Roles, colors, calc helpers, date/numeric utilities
  features/       # Redux slices (UI-focused)
  layout/         # Structural chrome components
  pages/          # Route-level feature containers segmented by role
  utils/          # Generic helpers (consider merging with constants or domain)
```

Areas to refine:
- Migrate loan/share-capital calculation logic into `src/domain/` (new) with pure functions + tests.
- Remove legacy folders (`_old/`, `_todelete/`) from `src/` to reduce noise—archive externally or delete after tagging release.

## 6. State Management Strategy
| Concern | Mechanism | Rationale |
|---------|-----------|-----------|
| Auth/session | `AuthProvider` context | Avoids unnecessary global redux coupling |
| Server data | TanStack Query (planned standard) | Caching, stale handling, pagination, retries |
| UI toggles (modals) | Redux Toolkit slices | Co-located simple, serializable state |
| Derived financial views | Pure calc utilities | Deterministic, testable |

Guidelines:
- Prefer React Query for any Supabase fetch/mutation logic.
- Keep Redux lean—avoid storing server lists or entities unless offline patterns emerge.

## 7. Domain Modules (Proposed Consolidation)
Create `src/domain/`:
```
loan/
  scheduleFlat.js
  scheduleDiminishing.js
  scheduleFactory.js
  types.d.ts (if TS gradual) / JSDoc typedefs
shareCapital/
funds/
formatting/
```
Each domain module exports a stable contract:
```ts
// scheduleFactory (conceptual)
interface LoanInput { principal: number; termMonths: number; rateAnnual: number; method: 'flat'|'diminishing'; startDate: Date; } 
interface PaymentPeriod { period: number; date: Date; interest: number; principal: number; balance: number; }
function buildSchedule(input: LoanInput): PaymentPeriod[]
```

## 8. Performance & Bundling
- Manual chunks in `vite.config.js` isolate large libraries (React, MUI, date libs, forms). Helps caching & faster cold loads.
- Icon imports optimized via pre-bundling (`optimizeDeps.include`).
- `PerformanceMonitor.jsx` flags long tasks >50ms—extend to measure React Query cache misses, large table re-renders.

Planned optimizations:
- Virtualized tables (when row counts exceed threshold).
- Memoization on heavy calculation outputs (`useMemo`/pure modules).
- Query key hygiene to prevent redundant fetches.

## 9. Error Handling & Edge Cases
Edge scenarios to explicitly design for:
- Supabase network failures → display retry/toast with backoff.
- Auth token invalidation mid-session → force re-login gracefully.
- Loan calc: zero principal, zero term, high interest (cap to safe maximum), rounding drift.
- Timezone sensitivity in schedules (favor UTC storage, local display).
- Partial role provisioning (role present but missing expected table rows).

Introduce a small error boundary component for critical sections (dashboard aggregated stats, loan details).

## 10. Testing Strategy (Roadmap)
Start minimal & expand:
1. Unit tests: Loan schedule factory (flat vs diminishing accuracy; rounding).
2. Unit tests: Numeric/date formatting (month rollovers, leap year).
3. Integration: Protected route redirect logic (mock roles/session).
4. Smoke: Render role dashboards verifying critical sections mount.

Tooling: Add Vitest + React Testing Library for front-end; keep tests close to domain (`src/domain/__tests__/`).

## 11. Deployment & Environments
- Dev: Vite dev server with HMR, manual chunk pre-bundling.
- Prod: `vite build` → static assets deployed (e.g., Vercel per `vercel.json`).
- Env vars: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`. Document required keys in `.env.example` (missing—add). Avoid leaking service roles to client.

## 12. Conventions
- Use kebab-case for URL paths; role paths mirror `roleInfo` mapping.
- Components: PascalCase; hooks: `useX`; constants: `ALL_CAPS` or descriptive lowerCamel; domain calculators: nouns + verb (e.g., `buildLoanSchedule`).
- Avoid deep relative import chains; consider path aliases via `tsconfig` if migrating to TS.

## 13. Migration Path to TypeScript (Incremental)
1. Convert domain modules first (highest risk of subtle calc bugs).
2. Add `tsconfig.json` with `strict: true` but allow JS with `allowJs: true`.
3. Gradually convert contexts/hooks (Auth, role). Keep pages last.
4. Use JSDoc typedefs as transitional step if full TS is deferred.

## 14. Observability & Logging
Short-term: Console warnings for performance + error toasts.
Mid-term: Introduce lightweight structured logger (tags: `auth`, `calc`, `query`).
Long-term: External monitoring (e.g., Logflare via Supabase functions) for audit trails.

## 15. Security Considerations
- Ensure RLS policies mirror front-end assumptions (no trust of client role alone).
- Avoid exposing privileged service keys; only anon key in client bundle.
- Validate user input on forms client-side + server-side (via Supabase RPC or Postgres constraints).
- Plan encryption at rest for sensitive columns (depending on Supabase project settings).

## 16. Recommended Immediate Refactors
1. Centralize loan calculation into domain folder.
2. Introduce permission map instead of scattered role checks.
3. Trim `_old/` & `_todelete/` from active tree.
4. Add `.env.example` and section in README.
5. Create `tests/` beachhead with loan schedule + ProtectedRoutes tests.
6. Document query key conventions for TanStack Query.

## 17. Future Roadmap (Beyond MVP)
- Pagination & infinite scrolling for large tables.
- Export/print modules (PDF schedule statements).
- Notification system (loan due reminders).
- Background job integration (e.g., edge functions for accrual updates).
- Accessibility audit (ARIA roles, focus management in modals).

## 18. Maintenance Guidelines
When adding a feature:
- Decide: server state (Query) vs UI state (Redux) vs derived (memo/pure fn).
- Add/update architecture section if introducing a new domain area or cross-cutting concern.
- Keep PRs small: one domain addition or one refactor target.

---
**Last updated:** (fill in when modified)

> Modify this file whenever architectural decisions change; stale architecture causes confusion faster than no documentation.
