#!/usr/bin/env bash
set -euo pipefail

repo_root="$(git rev-parse --show-toplevel)"
log_file="$repo_root/DEVELOPMENT_LOG.md"
today="$(date +%Y-%m-%d)"
now="$(date '+%Y-%m-%d %H:%M:%S %z')"
status_short="$(git status --short)"

if git rev-parse --verify HEAD >/dev/null 2>&1; then
  current_branch="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo 'detached')"
  last_commit="$(git log -1 --pretty='%h %s')"
else
  current_branch="unborn"
  last_commit="no commits yet"
fi

if [[ ! -f "$log_file" ]]; then
  cat > "$log_file" <<'LOGHDR'
# Development Log

Auto-updated by git hooks. Each commit appends an entry under the corresponding date.
LOGHDR
fi

if ! grep -q "^## $today$" "$log_file"; then
  {
    echo
    echo "## $today"
  } >> "$log_file"
fi

{
  echo
  echo "- [manual-sync] Working snapshot"
  echo "  - Time: $now"
  echo "  - Branch: $current_branch"
  echo "  - Last commit: $last_commit"
  if [[ -n "$status_short" ]]; then
    echo "  - Pending changes:"
    while IFS= read -r line; do
      [[ -n "$line" ]] && echo "    - $line"
    done <<< "$status_short"
  else
    echo "  - Pending changes: clean"
  fi
} >> "$log_file"

echo "Development log updated: $log_file"
