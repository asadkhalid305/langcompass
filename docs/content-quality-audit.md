# LangCompass Content Quality Audit

Audit date: 2026-06-16

## Summary

The A1.1-B2.2 curriculum is structurally complete: 120 catalog topics, 120 matching detail files, 40 modules, and exactly one theme, grammar, and communication lesson per module. Topic validation passes after this audit, and every ready detail file now includes provenance metadata.

This dated report records the result of the June 16, 2026 audit. Ongoing editorial rules now live in the project skills:

- `.agents/skills/langcompass-lesson-module/references/module-workflow.md`
- `.agents/skills/langcompass-topic-data/references/data-contract.md`

## Findings

- High priority, resolved: 67 ready detail files lacked `sourceStyle`. This made editorial readiness impossible to distinguish from structural completeness. All ready files now carry provenance metadata, and validation fails if future ready lessons omit it.
- Medium priority, open: newly normalized lessons use `confidence: "medium"` because they have had a repository audit and spot-check, but not an external native-speaker teacher certification pass. These should be upgraded to `high` only after a focused specialist review.
- Medium priority, open: B2.1 and B2.2 are intentionally marked as `LangCompass` extension modules rather than Momente-derived modules. This is acceptable, but should remain documented so users and maintainers do not mistake extension topics for direct Momente provenance.
- Low priority, monitored: the lesson renderer already supports `levelProgression`, comparisons, source metadata, and topic-type-specific headings. No UI contract change is required now; the most useful later enhancement would be a more prominent cross-level progression strip on full lesson pages.

## Editorial Assessment

Grammar sequencing is broadly plausible for German as a foreign language: A1 introduces present tense, articles, negation, modal basics, accusative objects, pronouns, imperatives, and comparison; A2 expands connectors, Konjunktiv II chunks, two-way prepositions, reflexives, verb-preposition patterns, relative clauses, and present passive; B1 develops infinitive clauses, genitive/prepositions, temporal linking, passive extension, Plusquamperfekt, and wider relative/connective patterns; B2 moves into nominal style, participial attributes, reported speech, subjective modals, dense attributes, and counterfactual conditionals.

## Follow-Up Plan

- Review all `confidence: "medium"` files level by level, grammar first, then theme and communication.
- Promote a lesson to `high` only after checking its rule language, examples, English translations, and common mistakes against CEFR/Goethe expectations and standard German grammar references.
- Keep B2 extension provenance as `LangCompass` unless explicit product direction maps those modules to a different curriculum source.
- Consider a small UI enhancement later: make `levelProgression` visually easier to scan on full lesson pages while preserving the existing data-driven section order.
