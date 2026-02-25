#!/usr/bin/env bash
set -euo pipefail

repo_root="$(git rev-parse --show-toplevel)"
log_file="$repo_root/DEVELOPMENT_LOG.md"
commit_subject="$(git log -1 --pretty=%s)"
commit_time="$(git log -1 --date=iso-local --pretty=%ad)"
changed_files="$(git show --pretty='' --name-only HEAD | sed '/^$/d')"
summary_line="$(git show --shortstat --pretty='' HEAD | tail -n 1 | sed 's/^ *//')"
today="$(date +%Y-%m-%d)"

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
  echo "- Commit: ${commit_subject}"
  echo "  - Time: ${commit_time}"
  if [[ -n "$summary_line" ]]; then
    echo "  - Stats: ${summary_line}"
  fi
  echo "  - Files:"
  while IFS= read -r f; do
    [[ -n "$f" ]] && echo "    - ${f}"
  done <<< "$changed_files"
} >> "$log_file"
