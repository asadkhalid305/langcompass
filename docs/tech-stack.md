# Tech Stack

- Next.js 16 (App Router)
- Development uses webpack because the locked Next.js 16.1.6 Turbopack HMR crashes on dynamic topic routes; production builds still use the Next.js default.
- Node.js 20.9 or newer (Node 24 recommended via `.nvmrc`)
- TypeScript
- Tailwind CSS
- shadcn/ui
- Zod for schema validation
- Fuse.js for fuzzy search
- Lucide React for icons
- Static JSON data in /data
- No database
- No auth
- No AI features (no LLM calls, no embeddings, no vector DB)
