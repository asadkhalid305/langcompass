# LangCompass Gemini Guide

## Project Context

- LangCompass is a curriculum-aware German learning explorer, not a generic LMS.
- Current product shape is intentionally focused:
- level-led discovery
- default unfiltered `All`-level discovery plus CEFR level filtering
- grouped topic exploration
- optional deep detail per topic
- This is a static-data app with strong schema validation and lightweight client interactions.

## How Gemini Should Work In This Repo

- Start design/refactor tasks by preserving the existing product model, then improving clarity, flow, and maintainability.
- Prefer proposal-first for medium/large changes:
- summarize current behavior
- list risks/tradeoffs
- suggest minimal viable refactor before implementation
- Keep implementation incremental; avoid all-at-once rewrites.

## Visual Consistency Rules

- Respect current visual language:
- brutalist-leaning cards, square corners (`--radius: 0`), strong borders/shadows
- Space Grotesk display + Inter text pairing
- section color semantics in UI (`themes`, `grammar`, `communication`) mapped to existing design tokens
- Preserve responsive behavior:
- desktop uses a persistent right detail pane
- mobile uses bottom sheet detail
- Keep both detail surfaces coherent:
- in-explorer preview (panel/sheet) for quick scan
- `/topic/[topicId]` as the full lesson page for deep reading
- Do not replace shadcn primitives unless there is a clear defect.

## Design/Refactor Guardrails

- Keep the two-view shell model (`overview` + `explorer`) intact unless explicitly asked to change IA.
- Treat `All` as an aggregate navigation mode, not as a real CEFR value in data contracts.
- Do not collapse curriculum semantics (introduced vs revisited) into generic lists.
- Preserve section-aware information architecture in explorer/overview (section -> group -> topics) and section-grouped global search results.
- Keep search behavior aligned with current weighted Fuse strategy; tune weights/thresholds before replacing search architecture.
- Favor component extraction only when it reduces coupling/readability costs in `langcompass-shell.tsx`.
- Preserve the data-driven lesson section model on `/topic/[topicId]` (recommended sections + stable fallback order/aliases) instead of hardcoding per-topic layouts.

## Data + Architecture Truths

- Source of truth is JSON data in `data/`:
- `topic-catalog.json` for index/discovery
- `topic-details/*.json` for rich content
- Zod schemas in `src/lib/schemas/topic.ts` are runtime contract gates.
- Catalog/topic taxonomy is section-first (`TopicSection`: `themes|grammar|communication`) with constrained `TopicType`; legacy `category` is accepted only as compatibility input and normalized.
- Catalog items now include core discovery metadata (`summary`, `relatedTopicIds`, optional `lessonRefs`) used by search, preview, and navigation even without rich detail files.
- Topic detail supports extended optional instructional blocks (for example `mentalModel`, `coverageChecklist`, usage cues, level progression, comparisons, special cases).
- `TopicDifficultyStage` includes `core`, and progression levels may be aggregate (`A1`-`B2`) or CEFR sub-levels.
- Routing is URL-first:
  - `/` overview (`level` optional, defaults to `All`)
  - `/explorer` explorer (`level`, `group`, `q`, `topic`)
  - `/topic/[topicId]` full lesson page (`level`/`group` return context optional)
- Explorer preview drawer state is route-driven via `/explorer?topic=<topicId>`.
- Local storage is convenience-only and must never supersede explicit route params.
- Any schema-shape refactor must also update:
- TS types (`src/lib/types/topic.ts`)
- validator script (`scripts/validate-topics.js`)
- downstream UI/data usage
- Cross-topic references in detail payloads (for example `comparisons[].topicId`) must resolve to valid catalog ids.

## Changes To Propose Before Implementing

- Navigation/interaction model shifts (view states, panel behavior, search UX semantics)
- Visual system shifts (token, typography, spacing, color strategy changes)
- Data contract updates (new required fields, enum changes, content model edits)
- Any move away from static-first architecture

## Commit Message Standard

- Use Conventional Commits consistently; do not mix ad-hoc styles.
- Required format: `<type>(<scope>): <imperative summary>`
- Example: `refactor(ui): extract topic detail section component`
- Allowed `type`: `feat`, `fix`, `refactor`, `perf`, `docs`, `test`, `build`, `ci`, `chore`, `revert`
- Scope should map to the area being changed (`app`, `explorer`, `api`, `data`, `types`, `schemas`, `ui`, `styles`, `docs`, `scripts`).
- Summary should be imperative, lowercase, no trailing period, and concise (~72 chars).
- Mark breaking changes with `!`: `refactor(data)!: replace topic group identifier format`

## What Not To Do

- Don’t rewrite the app into a new framework/state stack for cosmetic cleanup.
- Don’t add speculative systems (DB/auth/personalization/AI pipelines) without explicit product direction.
- Don’t bloat docs with architecture theory; keep guidance tied to active code paths.

## Quick Validation Loop

- After touching data contracts or content files, run `npm run validate:topics`.
- For UI refactors, verify:
- level navigation still works
- overview/explorer switching remains intact
- detail panel works on desktop and mobile variants
- `/topic/[topicId]` still renders cleanly when `ui.recommendedSections` is sparse/missing and when detail files are metadata-only.

## How To Update This File

- Update when visual language, interaction model, or refactor policy changes materially.
- Keep this doc short and decision-oriented: what to preserve, what can change, and when to propose first.
