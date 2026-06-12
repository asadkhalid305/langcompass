# Module Workflow

A module is complete only when its theme, grammar, and communication topics all have reviewed detail files.

Use the established topic-type presentation profiles in `src/components/topic-detail/topic-detail-page-helpers.ts`. Preserve the data-driven `ui.recommendedSections` model and fallback aliases.

Scale in curriculum order within a level after a pilot module is stable, then continue level by level. Do not hard-code completed-module lists in agent instructions; determine completion from current catalog references, detail files, `ui.status`, and tests.

For each topic, verify:

- catalog and detail metadata match
- instructional blocks fit the topic type
- examples are practical and level-appropriate
- prerequisites, relationships, and comparisons resolve
- the metadata-only fallback remains unaffected for other topics
