---
name: langcompass-ui
description: Build or change LangCompass visual design, explorer interactions, navigation UX, responsive layouts, topic previews, lesson presentation, styling, or accessibility. Use for components and CSS where interface behavior or visual consistency is a primary concern.
---

# LangCompass UI

1. Read `references/interface-model.md` before changing information architecture, responsive behavior, or visual tokens.
2. Preserve the overview/explorer shell unless the user explicitly requests an information-architecture change.
3. Keep navigation and preview state URL-driven.
4. Maintain coherent desktop panel, mobile sheet, and full lesson experiences.
5. Reuse existing tokens and shadcn/ui primitives.
6. Verify keyboard behavior, focus visibility, labels, contrast, touch targets, overflow, and reduced-motion implications.
7. Check representative desktop and mobile states, including metadata-only topics and sparse `recommendedSections`.
8. Use `web-design-guidelines` for an explicit standards audit and `langcompass-testing` for completion checks.
