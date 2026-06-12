# Interface Model

## Visual Language

- Square corners through `--radius: 0`
- Strong borders and shadows
- Space Grotesk display typography
- Inter body typography
- Existing section color semantics for themes, grammar, and communication

## Interaction Invariants

- `/` is the overview and defaults to aggregate `All`.
- `/explorer` owns `level`, `q`, and preview `topic`.
- Desktop preview is a persistent right-side panel.
- Mobile preview is a bottom sheet.
- `/topic/[topicId]` is the deep-reading lesson page.
- Missing detail content must degrade to the built-in metadata fallback.
- Search remains section-aware and Fuse-based; tune current behavior before replacing it.
- Lesson sections remain data-driven through recommendations and stable fallbacks.
