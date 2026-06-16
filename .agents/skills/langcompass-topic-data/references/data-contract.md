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
- Every detail file with `ui.status: "ready"` must include `sourceStyle.origin`, `sourceStyle.confidence`, and `sourceStyle.notes`.
- Use `sourceStyle.confidence` conservatively: `high` for focused editorial review with no known concerns, `medium` for structurally sound lessons that still deserve deeper specialist review, and `low` only for unresolved draft-like content that should not be marked ready.
- Use original LangCompass wording in lesson JSON. External references may verify content, but do not copy source text into detail files.
- Catalog entries carry discovery metadata even when rich detail is absent.
- Detail files outside the active catalog are warnings only when intentional.
