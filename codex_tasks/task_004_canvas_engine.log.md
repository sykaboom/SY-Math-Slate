# Task 004 Log

- Status: COMPLETED
- Notes:
  - UI store expanded with pen/laser types and opacity, and controls refactored to use the store.
  - Canvas engine migrated into `useCanvas` hook with pointer handling, smoothing, stroke storage, and laser overlay.
  - CanvasLayer component added and mounted in AppLayout (z-index behind content).
- Tests: `cd v10 && npm run lint`
