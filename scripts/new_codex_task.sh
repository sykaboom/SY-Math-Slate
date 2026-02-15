#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'USAGE'
Usage:
  scripts/new_codex_task.sh [--dry-run] <slug> <title> [target]

Examples:
  scripts/new_codex_task.sh policy_wave3 "Policy Wave 3"
  scripts/new_codex_task.sh --dry-run sync_hardening "Sync Hardening" root/

Notes:
  - target defaults to v10/
  - slug must match [a-z0-9_]+
USAGE
}

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo_root"

dry_run=0
if [[ "${1:-}" == "--dry-run" ]]; then
  dry_run=1
  shift
fi

if [[ $# -lt 2 || $# -gt 3 ]]; then
  usage
  exit 1
fi

slug="$1"
title="$2"
target="${3:-v10/}"

if [[ ! "$slug" =~ ^[a-z0-9_]+$ ]]; then
  echo "[new-codex-task] FAIL: slug must match ^[a-z0-9_]+$"
  exit 1
fi

template_path="codex_tasks/_TEMPLATE_task.md"
if [[ ! -f "$template_path" ]]; then
  echo "[new-codex-task] FAIL: template not found: $template_path"
  exit 1
fi

max_id="$(
  find codex_tasks -maxdepth 1 -type f -name 'task_[0-9][0-9][0-9]_*.md' \
    | sed -E 's#.*/task_([0-9]+)_.*#\1#' \
    | sort -n \
    | tail -n 1
)"
if [[ -z "$max_id" ]]; then
  max_id=0
fi

next_id=$((10#$max_id + 1))
next_id_padded="$(printf "%03d" "$next_id")"
dest_path="codex_tasks/task_${next_id_padded}_${slug}.md"
today="$(date +%Y-%m-%d)"

if [[ "$dry_run" == "1" ]]; then
  echo "[new-codex-task] DRY-RUN"
  echo "[new-codex-task] next_id=${next_id_padded}"
  echo "[new-codex-task] path=${dest_path}"
  echo "[new-codex-task] title=${title}"
  echo "[new-codex-task] target=${target}"
  exit 0
fi

if [[ -f "$dest_path" ]]; then
  echo "[new-codex-task] FAIL: destination already exists: $dest_path"
  exit 1
fi

cp "$template_path" "$dest_path"
sed -i \
  -e "1s|^# Task <id>: <short title>|# Task ${next_id_padded}: ${title}|" \
  -e "s|^Date: YYYY-MM-DD|Date: ${today}|" \
  -e "s|^Target: v10/   # or root/ (must choose one)|Target: ${target}|" \
  "$dest_path"

echo "[new-codex-task] Created: ${dest_path}"
