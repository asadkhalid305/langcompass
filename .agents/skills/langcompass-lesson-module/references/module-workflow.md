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

## Editorial Quality Rubric

Use CEFR/Council of Europe descriptors for learner outcomes, Goethe-Institut DaF framing for practical A1-C2 expectations, and standard German grammar references such as IDS grammis or Duden when checking rule claims.

- `themes` lessons build useful vocabulary fields, pragmatic context, and safe cultural framing. They should not behave like grammar lessons with labels swapped.
- `grammar` lessons state rules narrowly, name common learner traps, include natural examples, and avoid absolute claims where German usage has register or context variation.
- `communication` lessons model interaction moves, register choices, repair strategies, and realistic spoken or written phrases.
- Examples use natural German, faithful English translations, and level-appropriate sentence length. Advanced forms may appear early only as fixed chunks with a clear note.
- `commonMistakes` entries include a learner-plausible wrong form, a corrected form or strategy, and a reason that teaches the underlying distinction.
- Comparisons connect module siblings and nearby progression topics, not unrelated grammar.
