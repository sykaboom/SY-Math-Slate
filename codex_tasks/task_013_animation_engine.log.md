# Task 013 Log: Animation Engine

## Summary
- Added cursor-follow animation for text (per-character reveal) and mask reveal for math.
- Implemented chalk/marker actor layer with large bobbing motion.
- Added auto-play + manual play controls and SFX toggle with unlock flow.
- Wired animation to BoardSpec coordinates via `useBoardTransform`.

## Files Touched
- v10/src/store/useUIStore.ts
- v10/src/hooks/useSFX.ts
- v10/src/hooks/useSequence.ts
- v10/src/components/canvas/CanvasStage.tsx
- v10/src/components/canvas/ContentLayer.tsx
- v10/src/components/canvas/animation/AnimatedTextBlock.tsx
- v10/src/components/canvas/animation/MathRevealBlock.tsx
- v10/src/components/canvas/actors/ActorLayer.tsx
- v10/src/components/canvas/actors/ChalkActor.tsx
- v10/src/components/canvas/actors/HighlighterActor.tsx
- v10/src/components/toolbar/FloatingToolbar.tsx
- v10/src/app/globals.css
- v10/public/sfx/README.md
- codex_tasks/task_013_animation_engine.md

## Notes
- SFX files (`chalk.mp3`, `marker.mp3`) should be placed in `public/sfx/` when available.
- Auto-play triggers only on step increments; manual Play always available.
