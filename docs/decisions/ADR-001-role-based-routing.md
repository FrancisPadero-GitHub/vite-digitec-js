<!-- Architecture Decision Record -->
# ADR-001: Role-based routing & `ProtectedRoutes` design

Date: 2025-11-18
Status: Accepted

## Context

The application needs to enforce authorization for different areas of the site depending on the authenticated user's role.
Routes and pages are grouped by user role (admin, board, treasurer, regular-member, associate-member). The top-level router is defined in `src/routes.jsx` and role-protection logic is centralized in `src/ProtectedRoutes.jsx`.

Key requirements:

- Redirect unauthenticated users to login
- Allow only users with the appropriate role to access role-scoped routes
- Handle loading & recovery states cleanly while awaiting auth/role information
- Provide sensible fallbacks and keep the UI responsive while data is fetched

## Decision

Centralize role-based authorization using the `ProtectedRoutes` wrapper component.

Behavior implemented:

- `ProtectedRoutes` first uses the `useAuth` hook to check for an active `session`, `authLoading`, and `recoveryMode`.
- It then uses `useMemberRole` to fetch the `memberRole` for the currently authenticated session and also tracks `roleLoading`.
- While either `authLoading` or `roleLoading` is true the component renders a `LoadingContainer` with a progress indicator.
- If `recoveryMode` is true, redirect to `/reset-password`.
- If there is no `session`, redirect to `/` (Landing / Login).
- If `memberRole` is missing or not authorized for this route, redirect to `/not-found` or to the user's base route `/{memberRole}`.

`routes.jsx` arranges pages for each role and wraps role-scoped top-level routes with `ProtectedRoutes roleAllowed="<role>"`.

## Consequences

Pros:

- Centralized access control is easy to find and reason about — all role checks flow through one component.
- All pages for a role are grouped under a classic path like `/admin`, `/treasurer`, etc., improving route discoverability and permission boundaries.
- Progressive loading UI avoids flashing or accidental navigation while user or role info is being fetched.

Cons & trade-offs:

- `ProtectedRoutes` assumes the `useMemberRole` hook is responsible for role lookup; changes to role retrieval or caching may require `ProtectedRoutes` edits.
- Redirecting unauthorized users to `/{memberRole}` is opinionated — some teams prefer a unified `403` page.
- Mixing route definitions and role guards within the same router file can create a heavier `routes.jsx` as the project grows; consider dynamic imports for large role sections.

Implementation notes:

- Keep `ProtectedRoutes` pure and side-effect free (no network requests in it beyond relying on hooks). All network or state retrieval should be handled by separate hooks such as `useAuth` and `useMemberRole`.
- Normalize `roleAllowed` to an array internally to allow multiple roles on a single route if needed.
- When role lookups are asynchronous, prefetch the role or store it in client state (context or TanStack Query) to minimize repeated lookups.
- Use consistent route naming for role-based root routes: `/admin`, `/board`, `/treasurer`, `/regular-member`, `/associate-member`.

Alternatives considered:

- Add per-page role checks inside each page component — rejected because this scatters rules across multiple files and increases risk of inconsistent checks.
- Use route-level metadata with a custom router to enforce roles — would provide more flexibility but increases complexity.

References:

- `#file:ProtectedRoutes.jsx` — central guard component
- `#file:routes.jsx` — role-based route structure
