# Hotfix 058: Template pack bootstrap toolbarModeMap/modIds contract mismatch

Date: 2026-02-22
Scope: `v10/src/core/runtime/modding/package/templatePackAdapter.ts`
Approval: user message "에러있는거같아."

## Symptom
- Runtime client crash on deploy with:
  - `[templatePackRegistry] failed to bootstrap default packs: manifest.activation.toolbarModeMap.draw toolbarModeMap values must exist in modIds.`

## Root Cause
- Adapter generated `activation.toolbarModeMap` from template toolbar `fallbackModId` values (`draw`, `lecture`, `canvas`) but produced `modIds` as runtime-only id (`template-pack.runtime.<packId>`).
- Guard requires every `toolbarModeMap` value to exist in `modIds`.

## Fix
- In adapter:
  - keep `defaultModId` as runtime mod id
  - keep `toolbarModeMap` from modeDefinitions
  - expand `modIds` to include runtime mod id + all fallback mod ids from toolbar definitions (deduplicated)

## Validation
- `cd v10 && npm run lint` PASS
- `cd v10 && npm run build` PASS

## Rollback
- Revert adapter file change; runtime crash may return until contract mismatch is addressed.
