#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo_root"

registry_file="codex_tasks/workflow/feature_flag_registry.env"
checklist="codex_tasks/workflow/release_candidate_signoff_checklist.md"

if [[ ! -f "$registry_file" ]]; then
  echo "[check_v10_phase5_flag_cutover] FAIL: missing registry file: $registry_file"
  exit 1
fi

required_flags=(
  "NEXT_PUBLIC_PHASE5_SNAPSHOT_ENABLED"
  "NEXT_PUBLIC_PHASE5_LIVE_ONEWAY_ENABLED"
  "NEXT_PUBLIC_PHASE5_LIVE_TWOWAY_ENABLED"
  "NEXT_PUBLIC_PHASE5_PARTIAL_SHARING_ENABLED"
  "NEXT_PUBLIC_PHASE5_AI_APPROVAL_ENABLED"
)

for flag in "${required_flags[@]}"; do
  if ! rg -n "^${flag}=" "$registry_file" >/dev/null; then
    echo "[check_v10_phase5_flag_cutover] FAIL: missing flag '$flag' in registry"
    exit 1
  fi
done

normalize_bool() {
  local raw="$1"
  local lowered
  lowered="$(printf '%s' "$raw" | tr '[:upper:]' '[:lower:]')"
  case "$lowered" in
    "" ) echo "unset" ;;
    "1"|"true"|"yes"|"on") echo "true" ;;
    "0"|"false"|"no"|"off") echo "false" ;;
    *) echo "invalid" ;;
  esac
}

snapshot_state="$(normalize_bool "${NEXT_PUBLIC_PHASE5_SNAPSHOT_ENABLED:-}")"
live_oneway_state="$(normalize_bool "${NEXT_PUBLIC_PHASE5_LIVE_ONEWAY_ENABLED:-}")"
live_twoway_state="$(normalize_bool "${NEXT_PUBLIC_PHASE5_LIVE_TWOWAY_ENABLED:-}")"
partial_state="$(normalize_bool "${NEXT_PUBLIC_PHASE5_PARTIAL_SHARING_ENABLED:-}")"
ai_state="$(normalize_bool "${NEXT_PUBLIC_PHASE5_AI_APPROVAL_ENABLED:-}")"

states=(
  "$snapshot_state"
  "$live_oneway_state"
  "$live_twoway_state"
  "$partial_state"
  "$ai_state"
)

for state in "${states[@]}"; do
  if [[ "$state" == "invalid" ]]; then
    echo "[check_v10_phase5_flag_cutover] FAIL: phase5 flag env values must be boolean-like (true/false/1/0/on/off/yes/no)"
    exit 1
  fi
done

if [[ "$live_twoway_state" == "true" && "$live_oneway_state" != "true" ]]; then
  echo "[check_v10_phase5_flag_cutover] FAIL: two-way live requires one-way live enabled"
  exit 1
fi

if [[ ! -f "$checklist" ]]; then
  echo "[check_v10_phase5_flag_cutover] FAIL: missing $checklist"
  exit 1
fi

if ! rg -n --fixed-strings 'Phase5 cutover flags validated' "$checklist" >/dev/null; then
  echo "[check_v10_phase5_flag_cutover] FAIL: RC checklist must include phase5 cutover flag validation item"
  exit 1
fi

echo "[check_v10_phase5_flag_cutover] PASS"
