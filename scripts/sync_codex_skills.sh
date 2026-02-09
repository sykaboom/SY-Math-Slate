#!/usr/bin/env bash
set -euo pipefail

APPLY=0
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
SOURCE_DIR="${REPO_ROOT}/codex_skills"
TARGET_DIR="${HOME}/.codex/skills"

usage() {
  cat <<'USAGE'
Usage:
  scripts/sync_codex_skills.sh [--dry-run] [--apply] [--source DIR] [--target DIR]

Options:
  --dry-run        Print planned sync operations (default)
  --apply          Execute sync operations
  --source DIR     Source directory (default: codex_skills)
  --target DIR     Target directory (default: ~/.codex/skills)
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
  SOURCE_DIR="$(cd "${REPO_ROOT}" && cd "${SOURCE_DIR}" 2>/dev/null && pwd || true)"
fi
if [[ "${TARGET_DIR}" != /* ]]; then
  TARGET_DIR="${PWD}/${TARGET_DIR}"
fi

if [[ -z "${SOURCE_DIR}" || -z "${TARGET_DIR}" ]]; then
  echo "source/target cannot be empty." >&2
  exit 1
fi

if [[ "${TARGET_DIR}" == "/" ]]; then
  echo "Refusing to sync into /." >&2
  exit 1
fi

if [[ ! -d "${SOURCE_DIR}" ]]; then
  echo "Source directory not found: ${SOURCE_DIR}" >&2
  exit 1
fi

if [[ "${APPLY}" -eq 1 ]]; then
  mkdir -p "${TARGET_DIR}"
  echo "[APPLY] syncing ${SOURCE_DIR} -> ${TARGET_DIR}"
else
  echo "[DRY-RUN] syncing ${SOURCE_DIR} -> ${TARGET_DIR}"
fi

mapfile -t ENTRIES < <(find "${SOURCE_DIR}" -mindepth 1 -maxdepth 1 | sort)

if [[ "${#ENTRIES[@]}" -eq 0 ]]; then
  echo "No entries found under ${SOURCE_DIR}."
  exit 0
fi

for SRC_PATH in "${ENTRIES[@]}"; do
  NAME="$(basename "${SRC_PATH}")"
  DST_PATH="${TARGET_DIR}/${NAME}"

  if [[ "${APPLY}" -eq 0 ]]; then
    echo "[DRY-RUN] ${SRC_PATH} -> ${DST_PATH}"
    continue
  fi

  if [[ -d "${SRC_PATH}" ]]; then
    rm -rf "${DST_PATH}"
    cp -R "${SRC_PATH}" "${DST_PATH}"
  else
    cp "${SRC_PATH}" "${DST_PATH}"
  fi
  echo "[APPLY] synced ${NAME}"
done

echo "Done. Synced entries: ${#ENTRIES[@]}"
