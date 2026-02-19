#!/usr/bin/env bash
set -euo pipefail

SCRIPT_NAME="check_design_ssot_contract"
BASELINE_MAX=28

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

pass() {
  echo "[$SCRIPT_NAME] PASS: $1"
}

fail() {
  echo "[$SCRIPT_NAME] FAIL: $1"
  echo "[$SCRIPT_NAME] RESULT: FAIL"
  exit 1
}

REQUIRED_DOCS=(
  "v10/docs/design/DESIGN_SYSTEM_BLUEPRINT.md"
  "v10/docs/design/UI_GOLDEN_SCREEN.md"
  "v10/docs/design/LLM_DESIGN_PROMPT_TEMPLATE.md"
)

for doc_path in "${REQUIRED_DOCS[@]}"; do
  if [[ ! -s "$doc_path" ]]; then
    fail "required doc missing or empty: $doc_path"
  fi
  pass "required doc exists and is non-empty: $doc_path"
done

AI_READ_ME_PATH="v10/AI_READ_ME.md"
if [[ ! -s "$AI_READ_ME_PATH" ]]; then
  fail "required file missing or empty: $AI_READ_ME_PATH"
fi
pass "required file exists and is non-empty: $AI_READ_ME_PATH"

for doc_path in "${REQUIRED_DOCS[@]}"; do
  if ! rg -F -- "$doc_path" "$AI_READ_ME_PATH" >/dev/null; then
    fail "AI readme missing design doc reference: $doc_path"
  fi
  pass "AI readme references design doc path: $doc_path"
done

if ! rg -F -- "scripts/check_design_ssot_contract.sh" "$AI_READ_ME_PATH" >/dev/null; then
  fail "AI readme missing check script reference: scripts/check_design_ssot_contract.sh"
fi
pass "AI readme references check script path: scripts/check_design_ssot_contract.sh"

BUDGET_PATH="codex_tasks/workflow/style_budget.env"
if [[ ! -s "$BUDGET_PATH" ]]; then
  fail "required file missing or empty: $BUDGET_PATH"
fi
pass "required file exists and is non-empty: $BUDGET_PATH"

hardcoding_max="$(awk -F= '/^HARDCODING_STYLE_MAX=/{print $2; exit}' "$BUDGET_PATH")"
if [[ -z "${hardcoding_max:-}" ]]; then
  fail "HARDCODING_STYLE_MAX is missing in $BUDGET_PATH"
fi

if [[ ! "$hardcoding_max" =~ ^[0-9]+$ ]]; then
  fail "HARDCODING_STYLE_MAX must be an integer (found: $hardcoding_max)"
fi
pass "HARDCODING_STYLE_MAX is integer: $hardcoding_max"

if (( hardcoding_max > BASELINE_MAX )); then
  fail "HARDCODING_STYLE_MAX exceeds baseline $BASELINE_MAX (found: $hardcoding_max)"
fi
pass "HARDCODING_STYLE_MAX is within baseline <= $BASELINE_MAX (found: $hardcoding_max)"

echo "[$SCRIPT_NAME] RESULT: PASS"
