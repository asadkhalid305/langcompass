---
name: langcompass-testing
description: Add, update, select, run, or debug LangCompass tests and verification. Use when behavior changes need coverage, a test or build fails, the user asks for validation, or work is being checked before completion or delivery.
---

# LangCompass Testing

Scale verification to the changed surface:

- Topic data, schemas, references, or detail files: `npm run validate:topics` and `npm test`.
- Explorer navigation, search, selectors, or URL state: run `npm test`, then lint.
- UI components or styles: run focused tests, lint, production build, and browser checks for affected desktop/mobile states.
- Shared contracts, cross-module behavior, lesson modules, or release-ready work: run the full suite.

Full suite:

```bash
npm run validate:topics
npm test
npm run lint
npm run build
```

Add tests beside the existing Node test files in `tests/`. Assert public behavior and data invariants rather than implementation details. Never claim a check passed unless it ran successfully; report skipped checks and the reason.
