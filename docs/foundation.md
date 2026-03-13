# LangCompass Foundation Layer

## Data flow

1. `data/topic-catalog.json` holds topic index metadata.
2. `data/topic-details/<topic_id>.json` holds the rich per-topic content.
3. `src/lib/schemas/topic.ts` validates both catalog and detail payloads with Zod.
4. `src/lib/data/*` loads files and validates data before returning typed models.
5. `src/lib/utils/topic-utils.ts` exposes reusable query helpers for levels, grouping, lookup, search normalization, and detail availability.
6. `scripts/validate-topics.js` validates integrity, duplicate IDs, and cross-references as a pre-commit/CI guard.
