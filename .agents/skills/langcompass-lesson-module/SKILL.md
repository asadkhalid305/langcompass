---
name: langcompass-lesson-module
description: Create, expand, or review rich LangCompass lesson content for a Momente curriculum module. Use when adding topic-detail JSON for a module, completing its theme, grammar, and communication lessons, or checking whether a module is editorially complete.
---

# LangCompass Lesson Module

1. Read `references/module-workflow.md`.
2. Identify the next incomplete module in curriculum order from catalog `lessonRefs` and existing ready detail files.
3. Complete the theme, grammar, and communication topics as one module-sized unit.
4. Match lesson structure and presentation language to each `topicType`; do not force grammar headings onto theme or communication lessons.
5. Keep catalog-backed metadata exact and all cross-topic references valid.
6. Mark content ready only after editorial and structural checks pass.
7. Run topic validation, tests, lint, production build, and browser smoke checks for all three lesson pages.
8. Deliver one completed module per commit through `langcompass-git-delivery`.
