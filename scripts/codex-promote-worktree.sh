#!/usr/bin/env bash

set -euo pipefail

usage() {
  cat <<'EOF'
Usage:
  codex-promote-worktree.sh [options]

Default behavior:
  Uses the current directory as source worktree (equivalent to --worktree "$PWD").

Options:
  --target-branch <name>    Target branch in primary worktree (default: branch checked out in primary worktree).
  --commit-message <text>   Override auto-generated commit message.
  --no-delete               Keep source worktree after successful verification.
  -h, --help                Show this help.

What this does:
  1) Squash-merges source worktree branch into the target branch in the primary worktree
  2) Creates one commit in the primary worktree
  3) Verifies all changed file end-states from source are present in target
  4) Removes the source worktree after successful verification (unless --no-delete)
EOF
}

log() {
  printf '[worktree-promote] %s\n' "$1"
}

die() {
  printf '[worktree-promote] ERROR: %s\n' "$1" >&2
  exit 1
}

require_clean_worktree() {
  local wt="$1"
  local label="$2"
  if ! git -C "$wt" diff --quiet || ! git -C "$wt" diff --cached --quiet; then
    die "$label has uncommitted changes: $wt"
  fi
}

resolve_path() {
  local input="$1"
  if [[ ! -d "$input" ]]; then
    die "Directory does not exist: $input"
  fi
  (
    cd "$input"
    pwd -P
  )
}

WORKTREE_PATH="$PWD"
TARGET_BRANCH=""
COMMIT_MESSAGE=""
DELETE_WORKTREE="yes"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --worktree)
      [[ $# -ge 2 ]] || die "Missing value for --worktree"
      WORKTREE_PATH="$2"
      shift 2
      ;;
    --target-branch)
      [[ $# -ge 2 ]] || die "Missing value for --target-branch"
      TARGET_BRANCH="$2"
      shift 2
      ;;
    --commit-message)
      [[ $# -ge 2 ]] || die "Missing value for --commit-message"
      COMMIT_MESSAGE="$2"
      shift 2
      ;;
    --no-delete)
      DELETE_WORKTREE="no"
      shift
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      die "Unknown option: $1"
      ;;
  esac
done

SOURCE_WORKTREE="$(resolve_path "$WORKTREE_PATH")"

git -C "$SOURCE_WORKTREE" rev-parse --is-inside-work-tree >/dev/null 2>&1 || die "Not a git worktree: $SOURCE_WORKTREE"

PRIMARY_WORKTREE="$(
  git -C "$SOURCE_WORKTREE" worktree list --porcelain | awk '
    /^worktree / {
      print substr($0, 10)
      exit
    }
  '
)"

[[ -n "$PRIMARY_WORKTREE" ]] || die "Could not resolve primary worktree"
PRIMARY_WORKTREE="$(resolve_path "$PRIMARY_WORKTREE")"

if [[ "$SOURCE_WORKTREE" == "$PRIMARY_WORKTREE" ]]; then
  die "Source worktree is the primary worktree. Choose a linked worktree instead."
fi

SOURCE_BRANCH="$(git -C "$SOURCE_WORKTREE" symbolic-ref --quiet --short HEAD || true)"
[[ -n "$SOURCE_BRANCH" ]] || die "Source worktree is in detached HEAD. Checkout a branch first."

if [[ -z "$TARGET_BRANCH" ]]; then
  TARGET_BRANCH="$(git -C "$PRIMARY_WORKTREE" symbolic-ref --quiet --short HEAD || true)"
  [[ -n "$TARGET_BRANCH" ]] || die "Primary worktree is in detached HEAD. Pass --target-branch."
fi

git -C "$PRIMARY_WORKTREE" rev-parse --verify "$SOURCE_BRANCH" >/dev/null 2>&1 || die "Source branch not found in repo: $SOURCE_BRANCH"
git -C "$PRIMARY_WORKTREE" rev-parse --verify "$TARGET_BRANCH" >/dev/null 2>&1 || die "Target branch not found in repo: $TARGET_BRANCH"

require_clean_worktree "$SOURCE_WORKTREE" "Source worktree"
require_clean_worktree "$PRIMARY_WORKTREE" "Primary worktree"

TARGET_BEFORE="$(git -C "$PRIMARY_WORKTREE" rev-parse "$TARGET_BRANCH")"
SOURCE_HEAD="$(git -C "$PRIMARY_WORKTREE" rev-parse "$SOURCE_BRANCH")"
COMMITS_AHEAD="$(git -C "$PRIMARY_WORKTREE" rev-list --count "${TARGET_BRANCH}..${SOURCE_BRANCH}")"

log "primary worktree: $PRIMARY_WORKTREE"
log "source worktree:  $SOURCE_WORKTREE"
log "target branch:    $TARGET_BRANCH"
log "source branch:    $SOURCE_BRANCH"

if [[ "$SOURCE_HEAD" == "$TARGET_BEFORE" || "$COMMITS_AHEAD" == "0" ]]; then
  log "No source commits ahead of target branch. Skipping merge/commit."
else
  if [[ -z "$COMMIT_MESSAGE" ]]; then
    mapfile -t SUBJECTS < <(git -C "$PRIMARY_WORKTREE" log --format=%s "${TARGET_BRANCH}..${SOURCE_BRANCH}")
    if [[ "${#SUBJECTS[@]}" -eq 1 ]]; then
      COMMIT_MESSAGE="${SUBJECTS[0]}"
    else
      COMMIT_MESSAGE="chore(worktree): merge ${SOURCE_BRANCH} into ${TARGET_BRANCH}"
      for subject in "${SUBJECTS[@]}"; do
        COMMIT_MESSAGE+=$'\n'"- ${subject}"
      done
    fi
  fi

  log "Checking out $TARGET_BRANCH in primary worktree"
  git -C "$PRIMARY_WORKTREE" checkout "$TARGET_BRANCH" >/dev/null

  log "Squash-merging $SOURCE_BRANCH into $TARGET_BRANCH"
  if ! git -C "$PRIMARY_WORKTREE" merge --squash --no-commit "$SOURCE_BRANCH"; then
    git -C "$PRIMARY_WORKTREE" reset --merge >/dev/null 2>&1 || true
    die "Squash merge failed due to conflicts. Resolve manually and rerun."
  fi

  if git -C "$PRIMARY_WORKTREE" diff --cached --quiet; then
    die "Squash merge produced no staged changes."
  fi

  log "Creating commit in primary worktree"
  git -C "$PRIMARY_WORKTREE" commit -m "$COMMIT_MESSAGE" >/dev/null
fi

log "Verifying promoted file end-states"
MISMATCHES=0
while IFS= read -r -d '' path; do
  src_blob="$(git -C "$PRIMARY_WORKTREE" rev-parse --verify "${SOURCE_BRANCH}:${path}" 2>/dev/null || true)"
  tgt_blob="$(git -C "$PRIMARY_WORKTREE" rev-parse --verify "HEAD:${path}" 2>/dev/null || true)"
  if [[ "$src_blob" != "$tgt_blob" ]]; then
    printf '[worktree-promote] mismatch: %s\n' "$path" >&2
    MISMATCHES=$((MISMATCHES + 1))
  fi
done < <(git -C "$PRIMARY_WORKTREE" diff --name-only -z "$TARGET_BEFORE" "$SOURCE_BRANCH")

if [[ "$MISMATCHES" -ne 0 ]]; then
  die "Verification failed with $MISMATCHES mismatched path(s). Source worktree kept."
fi

log "Verification passed."

if [[ "$DELETE_WORKTREE" == "yes" ]]; then
  log "Removing source worktree: $SOURCE_WORKTREE"
  git -C "$PRIMARY_WORKTREE" worktree remove "$SOURCE_WORKTREE"
  log "Source worktree removed."
else
  log "Source worktree kept (--no-delete)."
fi

NEW_HEAD="$(git -C "$PRIMARY_WORKTREE" rev-parse --short HEAD)"
log "Done. target branch $TARGET_BRANCH now at commit $NEW_HEAD"
