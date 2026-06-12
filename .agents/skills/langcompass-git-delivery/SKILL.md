---
name: langcompass-git-delivery
description: Prepare LangCompass changes for Git delivery. Use when staging, rebasing, committing, creating or switching branches, pushing, opening a pull request, or promoting a Codex worktree. Includes repository commit format and worktree safety.
---

# LangCompass Git Delivery

1. Read `references/conventions.md`.
2. Inspect the worktree and stage only the intended files.
3. Preserve unrelated user changes and never use destructive Git commands without explicit approval.
4. Run the verification required for the changed surface.
5. Rebase the feature branch onto its base branch immediately before every commit when a base branch is known.
6. Resolve rebase conflicts by preserving current base behavior and intended changes; rerun affected checks.
7. Commit one logical change with the required Conventional Commit format.
8. Push or open a PR only when requested.
9. Use `scripts/codex-promote-worktree.sh` only from a clean, branched linked worktree and only when promotion is explicitly requested.
