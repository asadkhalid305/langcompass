# Git Conventions

Use `<type>(<scope>): <imperative summary>`.

Allowed types: `feat`, `fix`, `refactor`, `perf`, `docs`, `test`, `build`, `ci`, `chore`, `revert`.

Use a scope matching the changed area, such as `app`, `explorer`, `api`, `data`, `types`, `schemas`, `ui`, `styles`, `docs`, `scripts`, or `agent-context`.

Keep the summary lowercase, imperative, without a trailing period, and near 72 characters. Use `!` for breaking changes.

Examples:

- `feat(explorer): add grouped search result headers`
- `docs(agent-context): add task-specific project skills`
- `feat(api)!: rename topic detail response shape`

Keep each completed Momente module in its own tested commit. Do not mix unrelated modules or cleanup into that commit.
