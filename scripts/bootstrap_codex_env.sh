#!/usr/bin/env bash
set -euo pipefail

APPLY=0
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
SYNC_SCRIPT="${SCRIPT_DIR}/sync_codex_skills.sh"
SOURCE_DIR="${REPO_ROOT}/codex_skills"
TARGET_DIR="${HOME}/.codex/skills"

usage() {
  cat <<'USAGE'
Usage:
  scripts/bootstrap_codex_env.sh [--dry-run] [--apply] [--source DIR] [--target DIR]

Options:
  --dry-run        Check and print plan (default)
  --apply          Apply skill sync to target path
  --source DIR     Skill source directory (default: <repo>/codex_skills)
  --target DIR     Skill target directory (default: ~/.codex/skills)
  -h, --help       Show this help
USAGE
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --dry-run)
      APPLY=0
      shift
      ;;
    --apply)
      APPLY=1
      shift
      ;;
    --source)
      SOURCE_DIR="${2:-}"
      shift 2
      ;;
    --target)
      TARGET_DIR="${2:-}"
      shift 2
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "Unknown argument: $1" >&2
      usage
      exit 1
      ;;
  esac
done

if [[ "${SOURCE_DIR}" != /* ]]; then
  SOURCE_DIR="${PWD}/${SOURCE_DIR}"
fi
if [[ "${TARGET_DIR}" != /* ]]; then
  TARGET_DIR="${PWD}/${TARGET_DIR}"
fi

if [[ ! -x "${SYNC_SCRIPT}" ]]; then
  echo "Missing executable sync script: ${SYNC_SCRIPT}" >&2
  echo "Run: chmod +x scripts/sync_codex_skills.sh" >&2
  exit 1
fi

echo "[BOOTSTRAP] repo root:   ${REPO_ROOT}"
echo "[BOOTSTRAP] source:      ${SOURCE_DIR}"
echo "[BOOTSTRAP] target:      ${TARGET_DIR}"
if [[ "${APPLY}" -eq 1 ]]; then
  echo "[BOOTSTRAP] mode:        APPLY"
  "${SYNC_SCRIPT}" --apply --source "${SOURCE_DIR}" --target "${TARGET_DIR}"
else
  echo "[BOOTSTRAP] mode:        DRY-RUN"
  "${SYNC_SCRIPT}" --dry-run --source "${SOURCE_DIR}" --target "${TARGET_DIR}"
fi

if [[ -f "${HOME}/.codex/config.toml" ]]; then
  echo "[BOOTSTRAP] codex config: ${HOME}/.codex/config.toml"
else
  echo "[BOOTSTRAP] codex config not found at ~/.codex/config.toml"
fi

cat <<'NEXT'
[NEXT] Runtime check
- Open Codex CLI and run `/experimental`.
- If `sub-agents` is enabled (`[x]`), parallel wave mode is available.
- If `sub-agents` is disabled (`[ ]`), use single-Codex fallback mode.
NEXT
