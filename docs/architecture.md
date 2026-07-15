# LangCompass Architecture

## Product Model

LangCompass is a curriculum-aware German learning explorer, not a generic LMS. Users browse an aggregate `All` view or a CEFR sub-level, explore topics grouped by section, open a quick preview, and optionally continue to a full lesson page.

The supported sections are `themes`, `grammar`, and `communication`. Momente module identifiers are provenance metadata stored in `lessonRefs`; they are not a navigation layer. Search remains catalog-based and uses aliases, keywords, summaries, taxonomy fields, levels, and compatibility metadata through Fuse.js.

## Curriculum and Editorial Provenance

The current catalog contains 40 modules and 120 topics across `A1.1`-`B2.2`, with one theme, grammar, and communication topic per module.

- `A1.1`-`B1.2` uses 90 catalog topics aligned to the module structure of *Momente*.
- `B2.1`-`B2.2` contains 30 LangCompass extension topics.
- Detail files are original LangCompass editorial lessons aligned to the catalog. They do not contain copied external lesson text.
- `sourceStyle.origin`, `sourceStyle.confidence`, and `sourceStyle.notes` record editorial provenance and review depth.

Curriculum alignment is descriptive provenance, not a claim that LangCompass is an official or certified *Momente*, Hueber, Goethe-Institut, or CEFR product.

## Routes and State

- `/`: canonical overview; optional `level`, with omission meaning `All`.
- `/overview`: legacy alias that redirects to `/`.
- `/explorer`: canonical explorer with `level`, `q`, and `topic`.
- `/topic/[topicId]`: full lesson page with optional return `level`.

Route state owns the active view, level, query, and selected preview topic. Local storage stores convenience defaults only. Legacy `group` values may trigger canonicalization but are not retained in generated URLs.

## Data Flow

1. `data/topic-catalog.json` provides lightweight discovery metadata.
2. `data/topic-details/<topicId>.json` provides optional rich lesson content.
3. `src/lib/schemas/topic.ts` validates runtime inputs with Zod.
4. `src/lib/data/*` loads and normalizes validated data.
5. `src/lib/explorer/*` and `src/lib/utils/topic-utils.ts` provide navigation, search, grouping, and lookup behavior.
6. `scripts/validate-topics.js` checks schemas, IDs, references, filenames, and catalog/detail consistency.

Catalog and detail files overlap intentionally; detail extends the catalog shape. Catalog-backed detail metadata must match its catalog entry. Relationships, prerequisites, and comparisons must resolve to catalog topic IDs. Legacy `category` and `group` fields are compatibility inputs, not the current information architecture.

## Interface Model

The shared shell has overview and explorer views. Desktop uses a sticky right-side detail panel; mobile uses a bottom sheet. Full lessons render data-driven sections through `ui.recommendedSections` with stable fallback ordering and aliases.

The visual system uses square corners, strong borders and shadows, Space Grotesk for display text, Inter for body text, and existing section color tokens. Preserve shadcn/ui primitives unless a concrete defect requires replacement.

## Technology Decisions

- Next.js 16 App Router and React 19
- TypeScript
- Tailwind CSS and shadcn/ui
- Zod runtime validation
- Fuse.js fuzzy search
- Lucide React icons
- Static JSON data
- Node.js 24, pinned by `.nvmrc` and `package.json`

Development uses webpack because the tested Next.js 16 Turbopack HMR path has crashed on dynamic topic routes. Production uses the standard Next.js build.

The current stage intentionally excludes authentication, server-side persistence, vector search, cloud AI services, and server-heavy architecture.

Learning tools are an optional client-side progressive enhancement. They use browser-managed on-device models when the required Chrome API, language combination, model, and hardware are available. They do not change the static hosting model, and lesson exploration remains complete when every AI capability is unavailable. The dated capability matrix and API-selection rationale live in [the on-device learning tools decision record](decisions/2026-07-13-on-device-learning-tools.md).

## Contributor Invariants

- Keep the app static-first unless product direction explicitly changes.
- Treat the catalog as the discovery index and detail files as optional lesson depth.
- Keep `topicId` stable across data, relationships, filenames, and routes.
- Preserve URL-owned navigation state; local storage may only provide convenience defaults.
- Never persist `All` as a content level.
- Preserve the section-first taxonomy and CEFR order defined by `ALLOWED_LEVELS`.
- Keep metadata-only fallback pages working when a detail file is absent.

These contracts are enforced through the schemas, topic validator, tests, and CI rather than private contributor tooling.
