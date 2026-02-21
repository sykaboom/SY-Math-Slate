# Hotfix 2026-02-14: Vercel React #185 Slot Snapshot Loop

**Status:** COMPLETED
**Context:** Production deployment on `sy-math-slate.vercel.app` failed during client load with minified React error `#185` (Maximum update depth exceeded).

## Scope (User-approved Hotfix)
- `v10/src/core/extensions/registry.ts`
- `v10/src/features/platform/extensions/ui/ExtensionSlot.tsx`
- `codex_tasks/hotfix/hotfix_048_vercel_react185_slot_snapshot.md`

## Root Cause
- `ExtensionSlot` used `useSyncExternalStore` with a snapshot function returning a new array reference on each render (`listUISlotComponents` clone), which can trigger repeated nested updates.

## Changes
- Added UI slot registry subscription API and monotonic version snapshot in `registry.ts`:
  - `subscribeUISlotRegistry(listener)`
  - `getUISlotRegistryVersion()`
  - internal notify on `registerUISlotComponent` / `clearUISlotComponents`
- Updated `ExtensionSlot` to use stable scalar snapshot (`version`) via `useSyncExternalStore` and read slot component arrays outside snapshot comparison.

## Files
- `v10/src/core/extensions/registry.ts`
- `v10/src/features/platform/extensions/ui/ExtensionSlot.tsx`
- `codex_tasks/hotfix/hotfix_048_vercel_react185_slot_snapshot.md`

## Commands Run
- `cd v10 && npm run lint`
- `cd v10 && npm run build`

## Manual Verification Notes
- `lint`: passes with pre-existing warnings only.
- `build`: succeeds, static routes generated.
- React `#185` root trigger path (unstable array snapshot in external store) was removed.
