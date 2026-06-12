# Topic Data Contract

## Canonical Sources

- Index: `data/topic-catalog.json`
- Details: `data/topic-details/*.json`
- Types: `src/lib/types/topic.ts`
- Runtime schemas: `src/lib/schemas/topic.ts`
- Constants and ordering: `src/lib/constants/topic.ts`
- Validator: `scripts/validate-topics.js`

## Invariants

- Persist only CEFR sub-levels from `ALLOWED_LEVELS`; `All` is navigation-only.
- Keep section/topicType pairs aligned: `themes/theme`, `grammar/grammar`, `communication/communication`.
- Treat legacy `category` as normalization input and `group` as optional compatibility metadata.
- Store Momente provenance as `{ curriculum, module, lesson? }` in `lessonRefs`.
- Resolve `relatedTopicIds`, `prerequisiteTopicIds`, and comparison `topicId` values against the catalog.
- Keep overlapping catalog/detail metadata consistent.
- Catalog entries carry discovery metadata even when rich detail is absent.
- Detail files outside the active catalog are warnings only when intentional.
