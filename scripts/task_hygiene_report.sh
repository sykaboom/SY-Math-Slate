#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo_root"

strict=0
if [[ "${1:-}" == "--strict" ]]; then
  strict=1
fi

pending_warn="${TASK_HYGIENE_PENDING_WARN:-20}"
superseded_warn="${TASK_HYGIENE_SUPERSEDED_WARN:-30}"
batch_keep="${TASK_HYGIENE_BATCH_KEEP:-2}"

if ! [[ "$pending_warn" =~ ^[0-9]+$ && "$superseded_warn" =~ ^[0-9]+$ && "$batch_keep" =~ ^[0-9]+$ ]]; then
  echo "[task_hygiene] FAIL: numeric env vars required (TASK_HYGIENE_PENDING_WARN, TASK_HYGIENE_SUPERSEDED_WARN, TASK_HYGIENE_BATCH_KEEP)." >&2
  exit 1
fi

shopt -s nullglob
files=(codex_tasks/task_*.md)
shopt -u nullglob

if (( ${#files[@]} == 0 )); then
  echo "[task_hygiene] FAIL: no task files found under codex_tasks/task_*.md" >&2
  exit 1
fi

pending=0
completed=0
superseded=0
draft=0
other=0

declare -a pending_files=()
declare -a superseded_files=()
declare -a draft_files=()

for file in "${files[@]}"; do
  status_line="$(rg -n -m1 '^Status:' "$file" | head -n1 || true)"
  status="${status_line#*:Status: }"
  status_upper="$(printf '%s' "$status" | tr '[:lower:]' '[:upper:]')"

  case "$status_upper" in
    PENDING*)
      pending=$((pending + 1))
      pending_files+=("$file")
      ;;
    COMPLETED*)
      completed=$((completed + 1))
      ;;
    SUPERSEDED*)
      superseded=$((superseded + 1))
      superseded_files+=("$file")
      ;;
    DRAFT*)
      draft=$((draft + 1))
      draft_files+=("$file")
      ;;
    *)
      other=$((other + 1))
      ;;
  esac
done

mapfile -t batch_plans < <(ls -1t codex_tasks/batch_dispatch_plan_*.md 2>/dev/null || true)

warnings=0

echo "[task_hygiene] Task inventory"
echo "[task_hygiene] total=${#files[@]} pending=${pending} completed=${completed} superseded=${superseded} draft=${draft} other=${other}"

echo "[task_hygiene] Batch plans found=${#batch_plans[@]} (keep newest ${batch_keep})"

if (( pending > pending_warn )); then
  echo "[task_hygiene] WARN: pending=${pending} > threshold=${pending_warn}" >&2
  warnings=$((warnings + 1))
fi

if (( superseded > superseded_warn )); then
  echo "[task_hygiene] WARN: superseded=${superseded} > threshold=${superseded_warn}" >&2
  warnings=$((warnings + 1))
fi

if (( pending > 0 )); then
  echo "[task_hygiene] Pending tasks (top 20):"
  printf '%s
' "${pending_files[@]}" | sort | head -n 20
fi

if (( superseded > 0 )); then
  echo "[task_hygiene] Superseded tasks (top 20):"
  printf '%s
' "${superseded_files[@]}" | sort | head -n 20
fi

if (( ${#batch_plans[@]} > batch_keep )); then
  echo "[task_hygiene] Archive candidates: batch plans older than newest ${batch_keep}"
  for ((i=batch_keep; i<${#batch_plans[@]}; i++)); do
    echo "${batch_plans[$i]}"
  done
fi

echo "[task_hygiene] Suggested actions"
echo "1) Light cleanup: add/update ARCHIVE/SUPERSEDED headers only (no file move/delete)."
echo "2) Archive wave: explicitly approved move/delete under a dedicated task/hotfix."
echo "3) Keep execution SSOT: PROJECT_ROADMAP.md + approved codex_tasks/task_*.md"

if (( warnings > 0 )); then
  if (( strict == 1 )); then
    echo "[task_hygiene] FAIL: warnings=${warnings} (strict mode)" >&2
    exit 1
  fi
  echo "[task_hygiene] PASS_WITH_WARNINGS warnings=${warnings}"
  exit 0
fi

echo "[task_hygiene] PASS"
