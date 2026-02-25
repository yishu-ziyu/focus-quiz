#!/usr/bin/env bash
set -euo pipefail

repo_root="$(git rev-parse --show-toplevel)"
log_file="$repo_root/DEVELOPMENT_LOG.md"
today="${1:-$(date +%Y-%m-%d)}"

if [[ ! -f "$log_file" ]]; then
  echo "No development log found: $log_file"
  exit 1
fi

awk -v d="$today" '
  $0 == "## " d {in_section=1; print; next}
  /^## / && in_section {exit}
  in_section {print}
' "$log_file"
