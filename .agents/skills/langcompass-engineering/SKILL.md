---
name: langcompass-engineering
description: Implement or refactor LangCompass TypeScript, React, Next.js App Router, loaders, utilities, components, and application behavior. Use for ordinary code changes that are not primarily topic-data authoring, lesson expansion, UI design audits, testing-only work, Git delivery, or agent-context maintenance.
---

# LangCompass Engineering

1. Inspect the relevant implementation, types, tests, and callers before editing.
2. Prefer existing modules under `src/lib/explorer`, `src/lib/data`, and `src/components` over new cross-cutting abstractions.
3. Keep server components as the default. Add client boundaries only for hooks, browser APIs, or interaction.
4. Preserve URL-owned navigation state and metadata-only topic fallbacks.
5. Keep APIs narrow and typed. Add an abstraction only when it removes meaningful duplication or coupling.
6. Do not introduce global state libraries, new production dependencies, or server infrastructure unless the task clearly requires them.
7. Use `langcompass-topic-data` for data-contract changes and `langcompass-ui` for visual or interaction work.
8. Use `langcompass-testing` before declaring the work complete.
