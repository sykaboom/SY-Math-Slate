#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo_root"

check_id="[check_v10_layout_hardcoding_freeze]"
verify_stage="${VERIFY_STAGE:-mid}"
if [[ "$verify_stage" != "mid" ]]; then
  echo "$check_id SKIP: VERIFY_STAGE=$verify_stage (mid-only freeze guard)."
  exit 0
fi

if ! command -v rg >/dev/null 2>&1; then
  echo "$check_id FAIL: 'rg' (ripgrep) is required but not installed."
  exit 1
fi

shell_paths=(
  "v10/src/features/layout/AppLayout.tsx"
  "v10/src/features/layout/windowing/WindowHost.tsx"
  "v10/src/features/layout/windowing/PanelLauncher.tsx"
  "v10/src/features/extensions/ui/registerCoreSlots.ts"
)

for path in "${shell_paths[@]}"; do
  if [[ ! -f "$path" ]]; then
    echo "$check_id FAIL: required shell path missing: $path"
    exit 1
  fi
done

blocked_patterns=(
  "@features/layout/DataInputPanel"
  "@features/layout/Prompter"
  "@features/toolbar/FloatingToolbar"
  "<DataInputPanel"
  "<Prompter"
  "<FloatingToolbar"
)

blocked_labels=(
  "DataInputPanel import"
  "Prompter import"
  "FloatingToolbar import"
  "DataInputPanel JSX mount"
  "Prompter JSX mount"
  "FloatingToolbar JSX mount"
)

echo "$check_id scanning shell paths for hardcoded functional mounts"

failure_count=0
for index in "${!blocked_patterns[@]}"; do
  pattern="${blocked_patterns[$index]}"
  label="${blocked_labels[$index]}"
  matches="$(rg -n --no-heading -F "$pattern" "${shell_paths[@]}" || true)"

  if [[ -n "$matches" ]]; then
    echo "$check_id FAIL: blocked $label detected."
    echo "$matches"
    failure_count=$((failure_count + 1))
  else
    echo "$check_id PASS: no blocked $label"
  fi
done

if (( failure_count > 0 )); then
  echo "$check_id FAIL: $failure_count blocked pattern check(s) failed."
  exit 1
fi

echo "$check_id PASS: shell paths are free of hardcoded functional mounts."
