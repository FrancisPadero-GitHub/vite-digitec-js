# DigiTEC

Fund & loan monitoring system for cooperative (ECTEC) contributions, loans, and role-based financial views.

## Purpose

Tracks share capital, club funds, loan accounts, and member activities with role-differentiated access (admin, treasurer, board, regular member, associate member). Focus: accuracy, auditability, performance, least‑privilege access.

## Tech Stack

- React 19 + Vite (SWC)
- Tailwind CSS + DaisyUI
- Material UI (select icons / components)
- React Router
- TanStack Query (server state – rollout in progress)
- Supabase (Auth, Postgres, Storage, RLS)
- Redux Toolkit (UI-only slices)
- date-fns / dayjs (date + calc utilities)
- Recharts (visualizations)

## Features (Current)

- Layout + protected route scaffold
- Role dashboards (admin / treasurer / board / members)
- Share capital / funds tables (mock → real data pending)
- Loan & financial calculation utilities (to be migrated to domain modules)
- Performance monitor (dev)

## Roadmap (Near Term)

- Implement RLS-aligned data fetching via TanStack Query
- Centralize permissions map (replace scattered role checks)
- Domain folder for loan + fund calculations with tests
- Auth flow polishing (graceful token refresh / logout)
- Remove legacy folders (_old, _todelete)
- Add pagination + virtualized tables for large datasets
- Introduce Vitest tests (loan schedule, protected routes)

## Installation

```bash
git clone
cd vite-digitec-js
npm install
# If things doesn't work, try:
npm audit fix --force
npm run dev
```

## Scripts

```bash
npm run dev        # Start Vite dev server
npm run build      # Production build
npm run preview    # Preview built assets
npm run test       # (After Vitest added)
```

## Environment Variables

Create `.env.local` (never commit). Example:

```ini
VITE_SUPABASE_URL=YOUR_URL
VITE_SUPABASE_ANON_KEY=PUBLIC_ANON_KEY
# This is for the supabase edge functions for the admin create login credentials
VITE_SUPABASE_SERVICE_KEY=YOUR_SERVICE_KEY_IF_NEEDED
```

Add `.env.example` with placeholder keys for onboarding.

## Folder Structure

src/
  backend/        # Supabase client init, auth provider, role hooks
  components/     # Reusable UI + monitoring
  constants/      # Roles, colors, numeric/date helpers
  features/       # Redux slices (UI state only)
  layout/         # App shell (topbar, sidebar, footer)
  domain/         # (Planned) Loan/fund pure calculation modules + tests
  utils/          # Generic helpers (to rationalize with domain)
  pages/          # Route-level components
  styles/         # (Optional future) Tailwind composition
docs/
  decisions/     # ADRs
  ARCHITECTURE.md

## State Strategy

- Auth + user: context provider
- Server data: TanStack Query (cache, invalidation)
- UI toggles / ephemeral: Redux Toolkit
- Financial derivations: pure domain functions (testable)

## Security Notes

- Supabase anon key is public; enforce Row Level Security on all tables.
- Never expose service_role in client; use Edge Functions for privileged ops.
- Add Content Security Policy + security headers at deploy target.
- Sanitize any HTML injection (avoid `dangerouslySetInnerHTML`).
- Clear TanStack Query cache + local UI state on logout.

## Query Conventions (Planned)

- Query keys: `['loan', id]`, `['member', uid]`; avoid PII in keys.
- Mutations invalidate minimal, related keys only.

## Testing (Planned)

- Vitest + React Testing Library
- Unit: loan schedule accuracy (flat/diminishing), numeric rounding
- Integration: protected route redirects
- Smoke: role dashboards mount without errors

## Contribution Guidelines

- Small PRs: one domain feature or refactor
- Document architectural changes in `ARCHITECTURE.md`
- Provide rationale in commit messages (why + consequence)

## Performance Plans

- Manual chunks in Vite for large libs
- Virtualized tables when row count threshold passed
- Memoize heavy calculations; keep them pure
- Monitor long tasks (extend PerformanceMonitor)

## Maintenance Checklist

- New data feature → ensure RLS policy exists
- Add/update domain tests for business logic
- Keep README + ARCHITECTURE synced (avoid drift)
- Review dependencies quarterly (audit & update)

## License

Proprietary (update if license decision changes).
