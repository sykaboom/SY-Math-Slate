# Task 288: Phase 5.4 — 레이어 단위 부분 공유 + 오브젝트 레벨 기반 준비

Status: PENDING
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-18

---

## 사전 감사 기록

```
[ PREREQUISITE ]
- task_287 COMPLETED: SessionPolicy, ProposalEnvelope, ViewerShell 존재
- task_285의 CanvasSnapshot.scope 필드: 이미 SnapshotScope 타입 정의됨
  ("full_canvas" | "selected_layer" | "viewport_only")
- CanvasSnapshot.layerId 필드: Phase 5.4 사용을 위해 미리 추가됨

[ DECISION ]
- MVP 공유 단위: 레이어(페이지) 수준
  - full_canvas: 전체 캔버스 공유 (Phase 5.1/5.2/5.3 기본)
  - selected_layer: 특정 pageId(들) 공유
  - viewport_only: 현재 viewport에 보이는 영역 공유
- 오브젝트 레벨 (objectId 기반): Phase 5.4+ 확장점 준비만 (구현 없음)
- 데이터 모델에 layerId, objectId, scope 필드를 Phase 5.4에서 완성

[ SCOPE FILTER LOGIC ]
- host 측 snapshotSerializer.ts: scope 필터 적용
  selected_layer: pages 중 layerId에 해당하는 페이지만 직렬화
  viewport_only: viewport bounds를 기반으로 items 필터링
```

---

## Goal (Base Required)

- What to change:
  - `snapshotSerializer.ts`: scope 필터 적용 직렬화 로직 추가
  - `ShareScopeSelector.tsx`: 공유 범위 UI (full / selected_layer / viewport_only)
  - `LayerPickerModal.tsx`: selected_layer 선택 시 pageId 선택 UI
  - `useSnapshotShare.ts`: scope + layerIds 매개변수 전달
  - `CanvasSnapshot` 타입의 `layerId` → `layerIds: string[]` (복수 레이어 지원)으로 정확화
  - `ViewerShell.tsx`: scope에 따른 필터된 캔버스 렌더링
  - 오브젝트 레벨 확장점: `objectIds?: string[]` 필드 추가 (미사용, 예약)
- What must NOT change:
  - 기존 full_canvas 공유 동작 (기본 scope)
  - Phase 5.3의 proposal 흐름 (scope 필터는 직렬화에만 적용)
  - PersistedCanvasV2 타입 구조 변경 없음

---

## Scope (Base Required)

Touched files/directories (create):
- `v10/src/features/sharing/ShareScopeSelector.tsx` — 공유 범위 선택 UI
- `v10/src/features/sharing/LayerPickerModal.tsx` — 레이어(페이지) 선택 모달

Touched files/directories (write):
- `v10/src/core/types/snapshot.ts` — layerIds: string[], objectIds?: string[] 필드 정확화
- `v10/src/features/sharing/snapshotSerializer.ts` — scope 필터 직렬화
- `v10/src/features/sharing/useSnapshotShare.ts` — scope + layerIds 매개변수
- `v10/src/features/sharing/ShareButton.tsx` — ShareScopeSelector 통합
- `v10/src/features/viewer/ViewerShell.tsx` — 필터된 scope 렌더링

Out of scope:
- objectId 기반 필터링 구현 (확장점 예약만)
- 공유 범위 별 권한 제어 (Phase 5.3 정책으로 커버)
- 부분 공유 뷰어에서 proposal (레이어 외 영역 proposal 금지는 Phase 5.5)

---

## SnapshotScope 확장 (core/types/snapshot.ts)

```typescript
// 기존 SnapshotScope 유지, CanvasSnapshot 필드 정확화:
export type CanvasSnapshot = {
  // ... 기존 필드 ...
  scope: SnapshotScope;
  layerIds?: string[];      // scope = "selected_layer" 시 사용
  objectIds?: string[];     // 예약 (Phase 5.4+ 오브젝트 레벨)
};
```

---

## 직렬화 필터 로직

```
scope = "full_canvas"    → 모든 pages 포함 (기존)
scope = "selected_layer" → pages[layerId] 만 포함
scope = "viewport_only"  → 현재 viewport bounds 교차 아이템만 포함
```

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - `ShareScopeSelector.tsx`, `LayerPickerModal.tsx` → features/sharing 레이어
  - scope 필터는 직렬화 시점에만 적용. 원본 useCanvasStore 불변.
- Compatibility:
  - layerIds 필드는 optional. 기존 스냅샷 schemaVersion "1" 역호환 유지.
  - objectIds 필드 예약: 미사용이지만 타입에 포함 (Phase 5.5+ 확장용).

---

## DAG / Wave Metadata (Base Required)

- Wave ID: W5-phase5
- Depends on tasks: [task_287]
- Enables tasks: [task_289 Phase 5.5]
- Parallel group: G5-sharing (단독)
- Max parallel slots: 1
- Verification stage: `end`

---

## Execution Mode Assessment (Base Required for new specs)

- Touched file count: 9 (2 create + 7 write)
- Files shared with other PENDING tasks: 없음
- Cross-module dependency: NO (features/sharing 내부 주)
- Parallelizable sub-units: 0
- Estimated single-agent duration: ~40min
- Recommended mode: DELEGATED (single-agent lane)
- Batch-eligible: NO (task_287 선행 필수)
- Rationale: 타입 확장 + 직렬화 필터 + UI. 단일 에이전트 효율적.

---

## Optional Block A — Layout / SVG Gate

- [x] Applies: NO

---

## Optional Block B — Delegated Execution

- [x] Applies: YES
- Execution mode: DELEGATED
- Delegation chain scope: task_288 only
- File ownership lock plan: 9개 파일 Implementer-A 단독
- Parallel slot plan: 내부 병렬 없음
- Scheduler plan:
  - Slot allocation mode: DYNAMIC
  - Requested orchestration mode: max orchestration mode on
  - Ready-queue refill trigger: task_287 완료 시
- Delegated closeout metrics: Peak 1 / Average 1 / Refill 1 / Reassignment 0

---

## Optional Block C — Hotfix Exception

- [x] Applies: NO

---

## Optional Block D — Speculative Defense Check

- [x] Applies: NO

---

## Optional Block E — Documentation Update Check

- [x] Applies: YES
- [x] Semantic/rule changes:
  - `v10/AI_READ_ME.md`: Phase 5.4 부분 공유 범위 기록, objectIds 예약 필드 명시

---

## Acceptance Criteria (Base Required)

- [ ] AC-1: ShareScopeSelector에서 full_canvas / selected_layer / viewport_only 선택 가능
- [ ] AC-2: selected_layer 선택 → LayerPickerModal에서 특정 페이지 선택 → 해당 페이지만 스냅샷에 포함
- [ ] AC-3: viewport_only 선택 → 현재 화면에 보이는 아이템만 스냅샷에 포함
- [ ] AC-4: ViewerShell에서 scope = selected_layer 스냅샷 로드 시 선택된 레이어만 표시
- [ ] AC-5: 기존 full_canvas 공유 동작 회귀 없음
- [ ] AC-6: `npm run lint` 통과
- [ ] AC-7: `npm run build` 통과

---

## Manual Verification Steps (Base Required)

1) Step: 레이어 선택 공유
   - ShareButton → selected_layer → LayerPickerModal에서 1페이지 선택 → 스냅샷 생성
   - 뷰어에서 1페이지 내용만 표시 확인 (다른 페이지 없음)
   - Covers: AC-2, AC-4

2) Step: viewport_only 공유
   - 캔버스에서 특정 영역 zoom → viewport_only 선택 → 스냅샷 생성
   - 뷰어에서 viewport 내 아이템만 표시 확인
   - Covers: AC-3

3) Step: full_canvas 회귀 없음
   - 기존 full_canvas 공유 정상 동작 확인
   - Covers: AC-5

4) Step: 빌드 확인
   - Command: `cd v10 && npm run lint && npm run build`
   - Covers: AC-6, AC-7

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - viewport_only 필터: panOffset + zoomLevel 기반 계산 필요 → useViewportStore 참조
  - layerIds 변경으로 기존 schemaVersion "1" 스냅샷 역호환 깨질 수 있음
    → layerIds는 optional, 미존재 시 "full_canvas" 처리
- Roll-back: `git revert <commit>` 한 줄

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received

> Prerequisite: task_287 COMPLETED.

---

## Implementation Log (Codex fills)

Status: PENDING

Changed files:
- (TBD)

## Gate Results (Codex fills)

- Lint: (TBD)
- Build: (TBD)

Manual verification notes:
- (TBD)
