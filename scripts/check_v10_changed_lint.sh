#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo_root"

if [[ ! -d "v10" ]]; then
  echo "[check_v10_changed_lint] FAIL: v10 directory not found."
  exit 1
fi

if ! command -v git >/dev/null 2>&1; then
  echo "[check_v10_changed_lint] FAIL: git is required."
  exit 1
fi

lint_scope="${VERIFY_LINT_SCOPE:-changed}"
run_full_build="${VERIFY_FULL_BUILD:-0}"

run_full_lint() {
  echo "[check_v10_changed_lint] Running full lint (VERIFY_LINT_SCOPE=full)."
  (cd v10 && npm run lint)
}

run_changed_lint() {
  mapfile -t changed_paths < <(
    {
      git diff --name-only --diff-filter=ACMRTUXB HEAD -- v10
      git ls-files --others --exclude-standard -- v10
    } | sort -u
  )

  lint_targets=()
  for path in "${changed_paths[@]}"; do
    [[ -f "$path" ]] || continue
    if [[ "$path" =~ ^v10/.*\.(ts|tsx|js|jsx|mjs|cjs|mts|cts)$ ]]; then
      lint_targets+=("${path#v10/}")
    fi
  done

  if ((${#lint_targets[@]} == 0)); then
    echo "[check_v10_changed_lint] SKIP: no changed JS/TS files under v10."
    return
  fi

  echo "[check_v10_changed_lint] Running lint on ${#lint_targets[@]} changed file(s)."
  (cd v10 && npm run lint -- "${lint_targets[@]}")
}

case "$lint_scope" in
  full)
    run_full_lint
    ;;
  changed)
    run_changed_lint
    ;;
  *)
    echo "[check_v10_changed_lint] FAIL: VERIFY_LINT_SCOPE must be 'changed' or 'full'."
    exit 1
    ;;
esac

if [[ "$run_full_build" == "1" ]]; then
  echo "[check_v10_changed_lint] Running full build (VERIFY_FULL_BUILD=1)."
  (cd v10 && npm run build)
fi

echo "[check_v10_changed_lint] PASS"
