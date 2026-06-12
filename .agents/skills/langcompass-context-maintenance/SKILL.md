---
name: langcompass-context-maintenance
description: Audit or change LangCompass AGENTS.md, project skills, architecture docs, Codex agents, Codex configuration, CI guidance, or instruction placement. Use when reducing context, removing duplication, updating agent behavior, or deciding where durable information belongs.
---

# LangCompass Context Maintenance

Place information in the smallest durable surface that matches its scope:

- `AGENTS.md`: invariants needed for nearly every task.
- `.agents/skills`: task-specific workflows loaded progressively.
- Skill `references/`: detailed domain facts needed only within that skill.
- `docs/architecture.md`: human-readable stable product and architecture reference.
- `.codex/agents`: explicitly invoked specialist subagents.
- `.codex/config.toml`: Codex runtime settings, never product documentation.
- Linear: actionable bugs, features, and planning work.
- CI/tests: mechanically enforceable correctness.

Keep one source of truth. Remove duplicated instructions rather than synchronizing copies. Avoid volatile counts and progress claims unless generated. Keep skill descriptions precise enough for positive triggering and narrow enough to avoid unrelated activation.

When changing context:

1. Search all instruction and documentation surfaces.
2. Move, merge, or delete each displaced rule deliberately.
3. Validate every skill with the skill validator.
4. Check for broken references and stale filenames.
5. Run repository verification when CI or executable guidance changes.
