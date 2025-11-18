<!-- Architecture Decision Record -->
# ADR-002: TanStack Query + AuthProvider — client data & session architecture

Date: 2025-11-18
Status: Accepted

## Context

The project requires robust client-side data fetching and caching and a stable authentication system that other subsystems (role lookup, profile data, per-user queries) can rely on. `src/routes.jsx` wires up `QueryClientProvider` (TanStack Query) and `AuthProvider` at the root, so both query caching and auth state are available to route components and hooks.

Important usage discovered in `src/routes.jsx`:

- The `QueryClientProvider` is the parent for client-side caching needs
- `AuthProvider` wraps the router so route components can access session information
- The app exposes the query client for devtools (via `window.__TANSTACK_QUERY_CLIENT__`)

## Decision

Adopt TanStack Query for client-side data fetching and caching and maintain an isolated `Supabase` client in `src/backend/supabase.js`.

Design principles:

- Put `QueryClientProvider` at the application root so queries and mutations are available to any subcomponent and follow a consistent cache policy.
- Wrap the application in `AuthProvider` so authentication state is available globally and can be read by hooks like `useAuth` and `useMemberRole` for role-based route checks.
- Ensure queries that depend on session or user ID use `enabled: !!session?.user?.id` to avoid refetches before auth is present.
- Clear TanStack Query cache on sign out to avoid leaking previous user state to a new sign-in.

## Consequences

Pros:

- TanStack Query provides caching, deduplication, background refetching, and mutation helpers which reduce boilerplate
- Centralized `QueryClient` simplifies global caching policies and devtools usage
- `AuthProvider` ensures session state is available to queries and hooks

Cons:

- Adds a dependency (TanStack Query), but the benefits outweigh its cost; we must manage TTLs and cache invalidation carefully, particularly around logout and role changes.
- Relying on `window.__TANSTACK_QUERY_CLIENT__` should be limited to dev mode and removed or guarded in production builds

Implementation notes:

- Keep the Supabase client isolated in `src/backend/supabase.js` to prevent accidental cross-cutting side effects and to make testing easier.
- Use query keys consistently across the project. Example: `['member', memberId]` for member data, `['settings']` for app/system settings.
- Use `queryClient.prefetchQuery` in `routes.jsx` when you want to pre-populate data for an upcoming route.
- Provide utilities to invalidate queries on key actions (logout, role change, update operations) e.g., `queryClient.invalidateQueries(['member'])`.

Alternatives considered:

- Using SWR — simpler for get-only caching but lacks the breadth of mutation helpers and query invalidation workflows we want
- Rolling our own cache layer — increased maintenance cost, not recommended

References:

- `#file:routes.jsx` — root providers and router wiring
- `#file:ProtectedRoutes.jsx` — depends on `useAuth` and `useMemberRole` which rely on the `AuthProvider` and may use TanStack Query for role-data caching
