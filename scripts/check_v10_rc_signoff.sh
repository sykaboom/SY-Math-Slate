#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo_root"

checklist="codex_tasks/workflow/release_candidate_signoff_checklist.md"
if [[ ! -f "$checklist" ]]; then
  echo "[check_v10_rc_signoff] FAIL: missing checklist $checklist"
  exit 1
fi

required_sections=(
  "## Security"
  "## Reliability"
  "## UX and Accessibility"
  "## Operations and Monitoring"
  "## Rollback and Launch"
)

for section in "${required_sections[@]}"; do
  if ! rg -n --fixed-strings "$section" "$checklist" >/dev/null; then
    echo "[check_v10_rc_signoff] FAIL: missing section '$section'"
    exit 1
  fi
done

checkbox_count="$(rg -n "^- \\[ \\]" "$checklist" | wc -l | tr -d ' ')"
if [[ "$checkbox_count" -lt 12 ]]; then
  echo "[check_v10_rc_signoff] FAIL: checklist must include at least 12 checklist items (found $checkbox_count)"
  exit 1
fi

echo "[check_v10_rc_signoff] PASS"
