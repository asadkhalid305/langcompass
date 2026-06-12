# LangCompass Agent Guide

LangCompass is a static-first, curriculum-aware German learning explorer built with Next.js App Router, TypeScript, Tailwind CSS, shadcn/ui, Zod, Fuse.js, and JSON data.

## Always-On Invariants

- Keep the app static-first. Do not add auth, a database, backend services, runtime AI, embeddings, or vector search without explicit product direction.
- Treat `data/topic-catalog.json` as the navigation/search index and `data/topic-details/*.json` as optional rich lesson content.
- Keep `topicId` consistent across catalog entries, detail filenames, API routes, references, and UI selection state.
- Treat route state as authoritative for navigation. Local storage may preserve convenience defaults but must not override explicit URL state.
- Treat `All` as a UI-only aggregate level. Never persist it as a catalog or detail `level`.
- Preserve the section-first taxonomy: `themes`, `grammar`, and `communication`.
- Use the order in `ALLOWED_LEVELS`; do not infer or alphabetically sort CEFR levels.
- Missing detail files are valid and must continue to render through the metadata fallback UI.

## Skill Routing

- `langcompass-engineering`: TypeScript, React, Next.js, loaders, utilities, and refactors.
- `langcompass-topic-data`: catalog, detail JSON, schemas, taxonomy, and references.
- `langcompass-lesson-module`: complete Momente module content expansion.
- `langcompass-ui`: visual, responsive, interaction, navigation, and accessibility work.
- `langcompass-testing`: tests, verification, failures, and completion checks.
- `langcompass-git-delivery`: branches, rebases, commits, pushes, PRs, and worktree promotion.
- `langcompass-context-maintenance`: instructions, skills, docs, agents, and Codex configuration.

See `docs/architecture.md` when deeper product or architecture context is required.
