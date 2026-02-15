# Hotfix 053: React #185 Viewport Snapshot Stability

Status: COMPLETED
Date: 2026-02-15

## Context
- Production deployment loaded as white screen with minified React error `#185` (`Maximum update depth exceeded`).
- Recent hotfix history already showed the same class of issue: unstable external-store snapshots.

## Scope
- `v10/src/features/layout/useTabletShellProfile.ts`

## Root Cause
- `useSyncExternalStore` `getSnapshot` returned a new object each call, even when viewport dimensions were unchanged.
- That broke snapshot referential stability and can trigger repeated render/update loops in production.

## Fix
- Added module-level snapshot cache in `useTabletShellProfile`.
- `readViewportSnapshot()` now returns the same object reference when width/height are unchanged.
- Subscription notifier now compares previous/next snapshot references and suppresses no-op store change notifications.

## Validation
- `cd v10 && npm run lint` PASS
- `cd v10 && npm run build` PASS

## Result
- Removed the identified unstable snapshot update path responsible for the React #185 recurrence class in viewport profile runtime.
