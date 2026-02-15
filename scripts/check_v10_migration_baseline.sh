#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo_root"

if [[ ! -d "v10/src" ]]; then
  echo "[check_v10_migration_baseline] FAIL: v10/src not found." >&2
  exit 1
fi

required_files=(
  "v10/src/core/engine/commandBus.ts"
  "v10/src/core/extensions/pluginLoader.ts"
  "v10/src/core/extensions/mcpGateway.ts"
  "v10/src/features/extensions/commands/registerCoreCommands.ts"
  "v10/src/features/extensions/ui/ExtensionSlot.tsx"
)

for path in "${required_files[@]}"; do
  if [[ ! -f "$path" ]]; then
    echo "[check_v10_migration_baseline] FAIL: required file missing: $path" >&2
    exit 1
  fi
done

required_command_ids=(
  "insertBlock"
  "updateBlock"
  "deleteBlock"
  "insertBreak"
  "importStepBlocks"
  "setInsertionIndex"
  "setViewMode"
  "setAnimating"
  "addPage"
  "deletePage"
  "setColumnCount"
)
for command_id in "${required_command_ids[@]}"; do
  if ! rg -q "id:\\s*\"$command_id\"" "v10/src/features/extensions/commands/registerCoreCommands.ts"; then
    echo "[check_v10_migration_baseline] FAIL: command '$command_id' not found in registerCoreCommands.ts" >&2
    exit 1
  fi
done

use_ui_refs="$(rg -n "useUIStore" v10/src | wc -l | tr -d ' ')"
use_canvas_refs="$(rg -n "useCanvasStore" v10/src | wc -l | tr -d ' ')"
dispatch_refs="$(rg -n "dispatchCommand\\(" v10/src | wc -l | tr -d ' ')"

echo "[check_v10_migration_baseline] PASS"
echo "[check_v10_migration_baseline] useUIStore refs: ${use_ui_refs}"
echo "[check_v10_migration_baseline] useCanvasStore refs: ${use_canvas_refs}"
echo "[check_v10_migration_baseline] dispatchCommand refs: ${dispatch_refs}"
echo "[check_v10_migration_baseline] Note: counts are informational for task_119~138 migration waves."
