# LangCompass

LangCompass is a static-first German learning explorer built around a curriculum, not a chat prompt or a generic LMS.

It helps learners and curriculum editors answer a few practical questions quickly:

- What gets introduced at each CEFR sub-level?
- Which grammar, theme, and communication topics belong together?
- Is there already a fuller lesson page for this topic?
- What should I open next if I want context, examples, or related topics?

## What It Feels Like

LangCompass has three main surfaces:

- An overview page for scanning the full curriculum or a single level.
- An explorer for browsing topics and opening fast previews.
- A full lesson page for topics that already have rich detail content.

### Overview

![LangCompass overview](docs/readme-assets/overview.png)

### Explorer + topic preview

![LangCompass explorer with topic preview](docs/readme-assets/explorer-preview.png)

### Full lesson page

![LangCompass full lesson page](docs/readme-assets/topic-detail.png)

## First-Time User Guide

If you are opening LangCompass for the first time, this is the shortest useful path:

1. Start on the overview page and pick `All` or a CEFR level like `A2.1`.
2. Open the explorer to browse topics grouped into `themes`, `grammar`, and `communication`.
3. Use search when you already know the concept you want.
4. Click any topic to open its preview.
5. If the topic has richer editorial content, open the full lesson page.

Good examples to try:

- `Accusative Case`
- `Ordering in a Restaurant`
- `Travel and Holidays`
- `Asking For and Giving Advice`

## Who This Repo Is For

This repository is useful for both non-technical and technical contributors.

### If you are working on content

You mostly care about two places:

- `data/topic-catalog.json`
  This is the searchable curriculum index.
- `data/topic-details/*.json`
  These are optional rich lesson pages for individual topics.

Not every topic needs a detail file. A topic can still render correctly from catalog metadata alone.

### If you are working on the app

The app is a Next.js static-first frontend with:

- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui primitives
- Zod validation
- Fuse.js search

Core implementation areas:

- `src/app`
- `src/components`
- `src/lib/data`
- `src/lib/explorer`
- `src/lib/schemas`

## Local Development

### Requirements

- Node.js `24`
- npm

The repo uses `.nvmrc`, so use that version instead of your system default.

```bash
export PATH=/bin:/usr/bin:/usr/local/bin:$PATH
source ~/.nvm/nvm.sh
nvm use
npm install
npm run dev
```

Then open [http://127.0.0.1:3000](http://127.0.0.1:3000).

## Common Commands

```bash
npm run dev
npm run build
npm run lint
npm test
npm run validate:topics
```

## How The Content Model Works

LangCompass keeps the product model deliberately simple:

- `topicId` is the stable key across routes, JSON files, and UI state.
- `All` is a UI-only aggregate level and is not stored in the content files.
- Topics are organized by `themes`, `grammar`, and `communication`.
- The catalog drives discovery.
- Detail JSON extends a topic when a fuller lesson exists.

This means you can add or improve curriculum content without introducing a backend, CMS, or runtime AI system.

## How To Add A New Topic

1. Add the topic metadata to `data/topic-catalog.json`.
2. If you want a richer lesson page, add `data/topic-details/<topicId>.json`.
3. Run `npm run validate:topics`.
4. Run `npm test`.

## Project Boundaries

LangCompass is intentionally:

- static-first
- file-backed
- curriculum-aware
- navigated by route state

It intentionally does not include:

- auth
- a database
- embeddings
- vector search
- runtime AI lesson generation

## Need More Context?

- Product and architecture notes: [`docs/architecture.md`](docs/architecture.md)
- Agent and repo working rules: [`AGENTS.md`](AGENTS.md)
