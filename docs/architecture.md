# LangCompass Architecture

## Product Model

LangCompass is a curriculum-aware German learning explorer, not a generic LMS. Users browse an aggregate `All` view or a CEFR sub-level, explore topics grouped by section, open a quick preview, and optionally continue to a full lesson page.

The supported sections are `themes`, `grammar`, and `communication`. Momente module identifiers are provenance metadata stored in `lessonRefs`; they are not a navigation layer. Search remains catalog-based and uses aliases, keywords, summaries, taxonomy fields, levels, and compatibility metadata through Fuse.js.

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
- Node.js 20.9 or newer; Node 24 is recommended by `.nvmrc`

Development uses webpack because the locked Next.js 16.1.6 Turbopack HMR path crashes on dynamic topic routes. Production uses the standard Next.js build.

The current stage intentionally excludes authentication, persistence, runtime AI generation, vector search, and server-heavy architecture.
