# V10 Exchange Contract (Living Draft)

Status: DRAFT (living document)
Owner: Codex
SSOT: v10

## 1) Purpose
This document defines the minimum data exchange rules so that:
- Content created in math-pdf-builder can be imported into v10.
- Content created in v10 can be exported for math-pdf-builder or other tools.

This is a living contract. It will evolve as v10 stabilizes.

## 2) Scope
In scope:
- Container/package structure for exchange.
- Minimum persisted document schema (doc-only).
- Invariants that must never be broken.
- Loss policy (what can be dropped vs must be preserved).

Out of scope:
- UI/UX parity requirements.
- Rendering performance details.
- Feature-level specifications outside of data exchange.

## 3) SSOT Rule
v10 is the source of truth. Any external app must map to the v10 contract on export/import.

## 4) Terminology
- Document: Persisted doc-only payload (no session state).
- Session: Runtime-only state (current page/step, UI panels, etc.).
- Step: Global step index (not page-local).
- StepBlock: Ordered blocks that drive layout.
- AnchorMap: Mapping of step indices to positions on each page.
- Asset: External media such as images or audio.

## 5) Exchange Container (Package)
Current v10 export uses a `.slate` zip container with the layout below:
```
/
  board.json        (doc-only payload; PersistedSlateDoc)
  manifest.json     (package metadata)
  assets/
    images/
      image_1.png
      image_2.jpg
      ...
```

`manifest.json` schema (current implementation):
```json
{
  "version": "1.0",
  "createdAt": "2026-01-31T00:00:00.000Z",
  "title": "Untitled Board"
}
```

Notes:
- The package MUST include `board.json`.
- `manifest.json` is required by current v10 export flow.
- Assets are referenced by relative paths inside `board.json`.
- Image assets are embedded under `assets/images/` as `image_<n>.<ext>`.
- Audio assets are NOT packaged yet (see Loss Policy).

## 6) PersistedSlateDoc (Implemented Shape)
Type snapshot (current v10 code):
```ts
type PersistedSlateDoc = {
  version: 2 | 2.1;
  pages: Record<string, CanvasItem[]>;
  pageOrder: string[];
  pageColumnCounts?: Record<string, number>;
  stepBlocks?: StepBlock[];
  anchorMap?: AnchorMap;
  audioByStep?: Record<number, StepAudio>;
};
```

Required invariants:
- `version` MUST be present.
- `pageOrder` MUST align with keys in `pages`.
- Session fields (e.g., currentPageId/currentStep/UI state) MUST NOT be stored.
- `stepBlocks` is 1:1 with global steps (block index == step index).
- `anchorMap` is keyed by pageId and stepIndex.

Version behavior (implemented):
- Import normalizes `version` to 2 or 2.1.
- v2.1 indicates break-anchor compatibility; v2.0 with legacy breaks triggers re-layout.

## 7) CanvasItem Snapshot (Implemented)
All items share:
```
{ id, type, x, y, zIndex, rotation?, scale?, opacity? }
```

Item types (high-level):
- stroke: `{ tool, path[], color, width, penType, alpha?, pointerType? }`
- text: `{ content, stepIndex, layoutMode?, style? }`
- image: `{ src, w, h, isInverted?, layoutMode?, stepIndex?, segmentId?, mediaType? }`
- math: `{ latex }`
- unknown: `{ raw? }` (preserve unknown payloads where possible)

## 8) StepBlocks & Anchors (Implemented)
StepBlock:
```
{ id, kind?: "content" | "line-break" | "column-break" | "page-break", segments: StepSegment[] }
```

StepSegment:
```
{ id, type: "text" | "image" | "video", orderIndex, ... }
```
`text` segment adds `{ html }`, `image` adds `{ src, width, height }`,
`video` adds `{ src, width?, height? }`.

AnchorMap:
```
Record<pageId, Record<stepIndex, AnchorPosition[]>>
```
AnchorPosition includes:
`{ segmentId, orderIndex, stepIndex, pageId, column, x, y, width, height }`

StepAudio:
```
{ id, stepIndex, src, duration, type, blockId? }
```
`type` is one of `recording | tts | upload`.

## 9) Import / Export Rules (Implemented)
Export:
1) Normalize to PersistedSlateDoc.
2) Collect image assets and rewrite `image.src` to `assets/images/...`.
3) Write `board.json` + `manifest.json` + asset files.

Import:
1) Load `board.json`.
2) Migrate to current version if needed.
3) Map `assets/**` to runtime blob URLs.

Constraints (current implementation):
- Max file size: 50 MB
- Max archive entries: 1000
- `board.json` is required

## 10) Loss Policy (Implemented/TBD)
Must preserve:
- Step order and global step indices.
- Page order and column counts.
- Content items and their step linkage.

Known lossy areas (current implementation):
- `.slate` bundles image assets only; audio files are NOT packaged (only `audioByStep` metadata is stored).
- Video segments exist, but video files are NOT packaged. If `src` is a blob/object URL, it will not survive export/import.
- Image asset bundling is best-effort; failed fetches are skipped during export.
- Local autosave (not exchange) excludes image items; users must export `.slate` to preserve images.

Allowed to drop (TBD):
- App-specific UI state.
- Rendering-only hints.
- Non-standard formatting not representable in v10.

## 11) Mapping Notes (TBD)
Legacy (root):
- TBD: map line-based typing steps to global stepBlocks.

math-pdf-builder:
- TBD: map `.msk` package fields to PersistedSlateDoc.

## 12) Versioning
- `version` is required in `board.json`.
- Migrations MUST convert older versions to current doc-only format.

## 13) Open Questions
- Should unknown fields be preserved under an `extensions` key?
- Which pdf-builder header/footer features must be preserved?

---

## Sources
- `v10/AI_READ_ME.md`
- `PROJECT_CONTEXT.md`
- `v10/src/core/types/canvas.ts`
- `v10/src/features/hooks/useFileIO.ts`
- `v10/src/core/migrations/migrateToV2.ts`
- `v10/src/features/store/useCanvasStore.ts`
- `v10/src/features/hooks/usePersistence.ts`
- `v10/src/features/layout/DataInputPanel.tsx`
