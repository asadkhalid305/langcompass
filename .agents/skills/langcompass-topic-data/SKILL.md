---
name: langcompass-topic-data
description: Change LangCompass topic catalog entries, detail JSON, topic TypeScript types, Zod schemas, validators, taxonomy, lesson references, relationships, loaders, or detail-section identifiers. Use whenever files in data/ or the topic data contract are created, edited, migrated, or reviewed.
---

# LangCompass Topic Data

1. Read `references/data-contract.md` before changing contract shape, taxonomy, references, or overlapping catalog/detail metadata.
2. Treat `topicId` as the join key and keep detail filenames equal to `<topicId>.json`.
3. For model changes, update TypeScript types, Zod schemas, `scripts/validate-topics.js`, loaders/selectors, and affected UI together.
4. If detail section IDs, aliases, or fallback order change, update `src/components/topic-detail/topic-detail-page-helpers.ts`.
5. Preserve valid metadata-only topics; do not require every catalog entry to have a detail file.
6. Run `npm run validate:topics` and focused catalog/detail tests. Use `langcompass-testing` to select broader checks.
