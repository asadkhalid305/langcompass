# LangCompass Agent Guide

## Purpose

- LangCompass is a curriculum-aware German learning explorer.
- It helps users browse topics by CEFR sub-level (`A1.1` -> `B2.2`) or an aggregate `All` view, then open topic details when available.

## Current Stack

- Next.js App Router (`src/app`)
- TypeScript
- Tailwind CSS + shadcn/ui primitives
- Zod for runtime data validation
- Fuse.js for search ranking
- Static JSON data in `data/` (no DB, no auth, no LLM features)

## Product Scope (Current)

- Main flow: level navigation -> overview/explorer -> topic detail panel -> optional full lesson page.
- Default browsing starts in `All` level mode (unfiltered across CEFR sub-levels).
- Search is catalog-based (title, aliases, keywords, group/category/level).
- Topic details are progressively loaded from `/api/topic-details/[topicId]`.
- Current content status: catalog is broad; detail files are partial (many topics still metadata-only).

## Routing Model (Current)

- Canonical overview route: `/` (optional `?level=<TopicLevelOrAll>`; omitted level implies `All`).
- `/overview` is a legacy alias that redirects to `/`.
- Canonical explorer route: `/explorer` (query-backed state: `level`, `group`, `q`, `topic`; omitted level implies `All`).
- Topic detail route: `/topic/[topicId]` (optional return context `level` and `group`).
- Legacy root explorer query links are redirected to `/explorer`.
- Route state is primary for view/navigation; local storage only persists convenience defaults.

## Source Of Truth

- Canonical topic index: `data/topic-catalog.json`
- Canonical topic details: `data/topic-details/*.json`
- Runtime schema contract: `src/lib/schemas/topic.ts`
- Runtime loaders: `src/lib/data/topic-catalog.ts` and `src/lib/data/topic-detail.ts`
- Integrity guardrail: `npm run validate:topics` (`scripts/validate-topics.js`)

## Important Files

- App entry: `src/app/page.tsx`
- Main UI shell: `src/components/explorer/langcompass-shell.tsx`
- Explorer shell modules: `src/components/explorer/shell/*`
- Topic detail API: `src/app/api/topic-details/[topicId]/route.ts`
- Explorer logic: `src/lib/explorer/*`
- Types/constants: `src/lib/types/topic.ts`, `src/lib/constants/topic.ts`
- Base visual tokens/fonts: `src/app/globals.css`, `src/app/layout.tsx`

## UI Model (High-Level)

- Two views in one shell:
- `overview`: level summary + grouped cards
- `explorer`: grouped topic nodes + global search results
- Detail UX:
- Desktop: right-side sticky panel
- Mobile: bottom sheet
- Topic detail is optional per topic; UI must gracefully handle missing detail files.

## Architecture Constraints

- Keep app static-first; do not add DB/auth/backend services for routine changes.
- Catalog and detail files share overlapping fields; detail extends catalog shape.
- `topicId` is the join key across catalog, detail filename, API route, and UI selection state.
- CEFR level ordering is fixed by `ALLOWED_LEVELS`; do not infer/sort levels ad hoc.
- `All` is a UI/navigation pseudo-level (`ALLOWED_LEVEL_OPTIONS`), not a persisted catalog/detail `level` value.

## Safe Change Rules

- For any data model change:
- update `src/lib/types/topic.ts`
- update `src/lib/schemas/topic.ts`
- update `scripts/validate-topics.js` (kept in lockstep with schema expectations)
- adjust loaders/selectors/UI usage as needed
- Run `npm run validate:topics` after data or schema edits.
- Prefer small, local edits over framework-wide abstraction changes.

## Commit Message Standard

- Use Conventional Commits for every commit.
- Required format: `<type>(<scope>): <imperative summary>`
- Example: `feat(explorer): add grouped search result headers`
- Allowed `type`: `feat`, `fix`, `refactor`, `perf`, `docs`, `test`, `build`, `ci`, `chore`, `revert`
- Use a scope that matches changed area (examples: `app`, `explorer`, `api`, `data`, `types`, `schemas`, `ui`, `styles`, `docs`, `scripts`).
- Summary rules:
- imperative verb (`add`, `update`, `remove`, `refactor`)
- lowercase, no trailing period
- keep to ~72 chars
- Use `!` for breaking changes: `feat(api)!: rename topic detail response shape`

## Catalog Vs Detail File Guidance

- `topic-catalog.json`: lightweight index used for navigation, filtering, and search.
- `topic-details/<topicId>.json`: rich instructional content for one topic.
- Keep overlapping metadata consistent (`id`, level/category/group, aliases/keywords, etc.).
- Filename must equal topic `id` (`<id>.json`), and every detail `id` must exist in catalog.
- Missing detail files are valid; UI already supports metadata-only topics.

## Out Of Scope (For This Repo Stage)

- Auth, user progress tracking, persistence layer
- AI-generated lessons/search, embeddings/vector DB
- Multi-tenant or server-heavy architecture
- Rewriting UI into a new design system

## Avoid Overengineering

- Add functionality in existing modules first (`lib/explorer`, `lib/data`, `components/explorer`).
- Do not introduce global state libraries unless current local state becomes a clear blocker.
- Keep APIs narrow and explicit; prefer typed utility functions over generalized plugin systems.

## How To Update This File

- Refresh this guide when any of these change:
- core user flow (overview/explorer/detail behavior)
- data contract (`topic` types/schemas/validator)
- stack-level decisions (e.g., database/auth introduction)
- Keep sections short; document only decisions that affect day-to-day coding safety.
