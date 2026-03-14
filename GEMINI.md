# LangCompass Gemini Guide

## Project Context

- LangCompass is a curriculum-aware German learning explorer, not a generic LMS.
- Current product shape is intentionally focused:
- level-led discovery
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
- category color tokens in `globals.css`/Tailwind (`syntax`, `vocab`, `grammar`, `comm`)
- Preserve responsive behavior:
- desktop uses a persistent right detail pane
- mobile uses bottom sheet detail
- Do not replace shadcn primitives unless there is a clear defect.

## Design/Refactor Guardrails

- Keep the two-view shell model (`overview` + `explorer`) intact unless explicitly asked to change IA.
- Do not collapse curriculum semantics (introduced vs revisited) into generic lists.
- Keep search behavior aligned with current weighted Fuse strategy; tune weights/thresholds before replacing search architecture.
- Favor component extraction only when it reduces coupling/readability costs in `langcompass-shell.tsx`.

## Data + Architecture Truths

- Source of truth is JSON data in `data/`:
- `topic-catalog.json` for index/discovery
- `topic-details/*.json` for rich content
- Zod schemas in `src/lib/schemas/topic.ts` are runtime contract gates.
- Any schema-shape refactor must also update:
- TS types (`src/lib/types/topic.ts`)
- validator script (`scripts/validate-topics.js`)
- downstream UI/data usage

## Changes To Propose Before Implementing

- Navigation/interaction model shifts (view states, panel behavior, search UX semantics)
- Visual system shifts (token, typography, spacing, color strategy changes)
- Data contract updates (new required fields, enum changes, content model edits)
- Any move away from static-first architecture

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

## How To Update This File

- Update when visual language, interaction model, or refactor policy changes materially.
- Keep this doc short and decision-oriented: what to preserve, what can change, and when to propose first.
