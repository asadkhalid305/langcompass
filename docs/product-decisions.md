# Product Decisions

- Static-first app
- No auth in v1
- No DB in v1
- No runtime AI generation
- No vector search in v1
- Search is alias/keyword/fuzzy based
- Product model is level-first, not grammar-first
- Levels contain sectioned learning maps
- Current supported sections are `themes`, `grammar`, and `communication`
- Primary UI = level nav + section-aware explorer + detail drawer
- Topic detail content comes as separate files
- Grammar detail pages are richer for now, but the model allows other topic types later
