<!-- Architecture Decision Records -->
# Architecture Decision Records (ADRs)

Date: 2025-11-18
Status: Guidance

## Purpose

Architecture Decision Records (ADRs) capture important architectural decisions made for this project — why we made a decision, what alternatives we considered, and any consequences. ADRs serve as living documentation to help future contributors understand the project's intent and the trade-offs behind choices.

This file describes when to create an ADR, how to write one, and how to use ADRs within pull requests and developer workflows.

## When to create an ADR

- You should create an ADR when a decision affects architecture, UX, performance, developer experience, or data model structure.
- Typical examples: adopting a framework or library, changing core data flow, picking a state-management approach, RLS or DB schema changes that affect clients, or choosing a deployment/hosting model.
- If a decision is small, easily reversible, and doesn't affect other components, use a brief comment in the related PR rather than a full ADR.

## ADR format (recommended template)

Follow this consistent structure when authoring ADRs so they are easy to scan and compare:

1. Title: `ADR-###: Short descriptive title`
2. Date: The date of the decision
3. Status: e.g., `Accepted`, `Deprecated`, `Proposed`, `Superseded`
4. Context: What circumstances and constraints led to the decision
5. Decision: A clear statement of the choice or change
6. Consequences: Positive and negative consequences (short bullets)
7. Alternatives considered: What other solutions you evaluated and why they were not chosen

Example header for an ADR page:

```md
# ADR-001 Use TanStack Query for client caching

Date: 2025-11-18
Status: Accepted

## Context
... 
```

## How to write an ADR

- Keep it short and focused — the goal is to explain rationale and consequences, not to be a design doc.
- Use `Context` to describe the problem, constraints, and any non-obvious background.
- Be explicit about trade-offs in `Consequences` and mention any follow-up tasks (e.g., tests, migration steps, monitoring)
- Use `Alternatives considered` to show due diligence and why alternatives were discarded.

## Where ADRs live

All ADRs are stored in the `docs/decisions` folder. Keep filenames consistent using the `ADR-NNN-brief-title.md` pattern.


Examples in this repo:

-- `docs/decisions/ADR.md` — repository-level ADR guidance (this file)
-- `docs/decisions/ADR-001-role-based-routing.md` — role-based routing & `ProtectedRoutes` (this patch)
-- `docs/decisions/ADR-002-query-auth-integration.md` — TanStack Query + AuthProvider architecture (this patch)
-- Other ADRs should live side-by-side, one file per decision for clarity.

## How to use ADRs in workflow

- Create an ADR as part of the PR that implements or proposes the change. Reference the ADR in the PR description (link to file).
- For non-trivial decisions, include a link to the ADR in the issue that triggers the work.
- When an ADR is superseded, update its status and point to the newer ADR that supersedes it.

## Best practices

- Name ADR files sequentially (e.g., `ADR-001-choose-query-client.md`) so they are ordered by time.
- Keep ADRs concise and cite external references (RFCs, libraries, benchmark results) where appropriate.
- If the decision requires ongoing work (migration, deprecation schedule), include a follow-up checklist in `Consequences`.

## Example: TanStack Query (short sample)

```md
# ADR-002: Use TanStack Query for client caching

Date: 2025-11-18
Status: Accepted

## Context
We need cache, request de-duplication, optimistic updates, and mutation management without writing custom hooks.

## Decision
Adopt TanStack Query for data-fetching in the front-end; keep the Supabase client isolated in `src/backend/supabase.js` to avoid coupling.

## Consequences
Pros:
- Faster iteration, less boilerplate
- Built-in caching, background refetching, and retry logic

Cons:
- Adds a dependency; must ensure cache is cleared on logout or account change

## Alternatives considered
- SWR: preferred for simple get caching, but lacks advanced mutation features we need
```

## Maintenance & review

- When making a change that would affect earlier ADRs, either update the old ADR to `Superseded` and reference the update, or create an explicit `Superseded` ADR that explains the replacement.
- Use ADRs during architecture review and onboarding — they are searchable historical context for decisions.

---
⚠️ Note: ADRs are not a replacement for tests, code comments, or in-line documentation; they complement those artifacts by explaining the reasoning behind choices.
