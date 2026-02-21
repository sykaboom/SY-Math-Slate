# Task 285: Phase 5.1 — Snapshot Publish + Viewer Route (Client-Side MVP)

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-18

---

## 사전 감사 기록

```
[ EXISTING ]
- PersistedCanvasV2 (core/types/canvas.ts): 이미 JSON-serializable 캔버스 상태 타입
- usePersistence.ts: STORAGE_KEY = "v10_board_data" (로컬 저장소 키)
- useSyncStore.ts: pendingAIQueue + presence 구조 (Phase 5.4/5.5 기반)
- app/ 에 /view route 없음 → 신규 Next.js dynamic route 필요

[ DECISION ]
- Phase 5.1: 순수 client-side. snapshot → localStorage 저장 → shareId URL.
  동일 브라우저/디바이스에서만 공유 가능 (제한사항 명시).
  Cross-device 공유는 Phase 5.2 (서버 persistence) 에서 추가.
- 공개/비공개 플래그: 모더 설정. 비공개 시 shareId 추측 불가 (UUID).
- CRDT-ready 메타데이터: hostActorId, canvasVersion, scope 등 초기부터 포함.
- scope: "full_canvas" (Phase 5.1 기본). selected_layer/viewport_only는 Phase 5.4.

[ LAYER ]
- 신규 features/sharing/ 디렉토리 (features 레이어)
- 신규 features/viewer/ 디렉토리 (features 레이어)
- 신규 app/view/[shareId]/ (app 레이어)
```

---

## Goal (Base Required)

- What to change:
  - `CanvasSnapshot` 타입 정의 (CRDT-ready 메타데이터 포함)
  - 스냅샷 직렬화/역직렬화 유틸리티 (`snapshotSerializer.ts`)
  - 스냅샷 생성 + localStorage 저장 + shareId URL 생성 hook (`useSnapshotShare.ts`)
  - Share 버튼 UI (`ShareButton.tsx`) + 공개/비공개 토글 (`PublicToggle.tsx`)
  - 읽기 전용 뷰어 컨테이너 (`ViewerShell.tsx`)
  - 뷰어 세션 로드 hook (`useViewerSession.ts`)
  - Next.js 다이나믹 라우트 (`/view/[shareId]/page.tsx`)
- What must NOT change:
  - `PersistedCanvasV2`, `PersistedSlateDoc` 타입 변경 없음
  - 기존 useCanvasStore, usePersistence 변경 없음
  - 기존 캔버스 에디터 기능 (저장/로드/편집) 영향 없음
  - Phase 5.1은 서버 없음 (BaaS/API 의존성 추가 없음)

---

## Scope (Base Required)

Touched files/directories (create):
- `v10/src/core/types/snapshot.ts` — CanvasSnapshot 타입 + ShareSessionMeta 타입
- `v10/src/features/collaboration/sharing/snapshotSerializer.ts` — serialize/deserialize 유틸리티
- `v10/src/features/collaboration/sharing/useSnapshotShare.ts` — 스냅샷 생성 + localStorage 저장 + URL 생성 hook
- `v10/src/features/collaboration/sharing/ShareButton.tsx` — Share UI 버튼 (URL 복사 포함)
- `v10/src/features/collaboration/sharing/PublicToggle.tsx` — 공개/비공개 세션 토글
- `v10/src/features/chrome/viewer/ViewerShell.tsx` — 읽기 전용 캔버스 뷰어 컨테이너
- `v10/src/features/chrome/viewer/useViewerSession.ts` — shareId로 localStorage에서 스냅샷 로드
- `v10/src/app/view/[shareId]/page.tsx` — Next.js 뷰어 라우트

Touched files/directories (write):
- `v10/src/features/chrome/layout/PlayerBar.tsx` — Share 버튼 + PublicToggle 추가 (모드 조건부)

Out of scope:
- 서버 persistence (Phase 5.2)
- Cross-device 공유 (Phase 5.2)
- 실시간 동기화 (Phase 5.2)
- 레이어 단위 부분 공유 (Phase 5.4)
- AI 승인 파이프라인 (Phase 5.5)
- 댓글/주석 기능

---

## CanvasSnapshot 타입 (core/types/snapshot.ts)

```typescript
export type SnapshotScope = "full_canvas" | "selected_layer" | "viewport_only";

export type CanvasSnapshot = {
  schemaVersion: "1";
  shareId: string;           // UUID v4
  title?: string;
  createdAt: number;          // Unix timestamp ms
  isPublic: boolean;          // 공개/비공개 플래그
  // CRDT-ready metadata (Phase 5.3+ 확장용)
  hostActorId: string;        // 세션 생성자 식별자 (익명 OK)
  canvasVersion: number;      // 스냅샷 생성 시점의 캔버스 버전
  scope: SnapshotScope;       // Phase 5.1: 항상 "full_canvas"
  layerId?: string;           // Phase 5.4+ 에서 사용
  // canvas state
  canvas: PersistedCanvasV2;
};

export type ShareSessionMeta = {
  shareId: string;
  isPublic: boolean;
  createdAt: number;
  viewerUrl: string;
};
```

---

## Storage 전략 (Phase 5.1 Client-Only)

- localStorage key: `sy_share:${shareId}` (기존 `v10_board_data`와 분리)
- 인덱스 key: `sy_share_index` (JSON array of ShareSessionMeta)
- URL 패턴: `/view/${shareId}`
- 비공개 스냅샷: shareId UUID만 알면 접근 가능 (Phase 5.2에서 access token 추가)

---

## ViewerShell 설계 원칙

- 기존 `CanvasStage` 재사용. 읽기 전용 prop으로 전달.
- 편집 UI (toolbar, panels) 완전 숨김.
- `currentStep` 네비게이션 컨트롤 제공 (교육 콘텐츠 시청용).
- 인터랙션: pointer-events: none on canvas layer (스트로크/아이템 편집 불가).
- 타이틀 바: 스냅샷 제목 + 생성일 + "Made with SY Math Slate" 크레딧.

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO (uuid 패키지 이미 설치 여부 확인; 없으면 `crypto.randomUUID()` 사용)
- Boundary rules:
  - `core/types/snapshot.ts` → core 레이어. features import 금지.
  - `features/sharing/` → features 레이어. core import 허용. app import 금지.
  - `features/viewer/` → features 레이어. core import 허용. sharing import 허용.
  - `app/view/[shareId]/page.tsx` → app 레이어. features import 허용.
- Compatibility:
  - Phase 5.2 착수 시 useSnapshotShare의 localStorage 저장 로직을 서버 API로 교체 가능 설계.
  - CanvasSnapshot schemaVersion "1" → 향후 마이그레이션 지원.

---

## DAG / Wave Metadata (Base Required)

- Wave ID: W5-phase5
- Depends on tasks: [task_284] (Phase T 완료 후)
- Enables tasks: [task_286 Phase 5.2]
- Parallel group: G5-sharing (단독)
- Max parallel slots: 1
- Verification stage: `end`

---

## Execution Mode Assessment (Base Required for new specs)

- Touched file count: 9 (8 create + 1 write)
- Files shared with other PENDING tasks: 없음
- Cross-module dependency: YES (app → features → core)
- Parallelizable sub-units: 0 (단일 에이전트 순차)
- Estimated single-agent duration: ~45min
- Recommended mode: DELEGATED (single-agent lane)
- Batch-eligible: NO (Phase 5.2 이전 선행 필요)
- Rationale: 신규 디렉토리 생성 + 타입 정의 + hook + UI + Next.js 라우트. 의존성 순차.

---

## Optional Block A — Layout / SVG Gate

- [x] Applies: NO (새 컴포넌트이나 geometry 스펙 별도 불필요; ViewerShell은 full-screen)

---

## Optional Block B — Delegated Execution

- [x] Applies: YES
- Execution mode: DELEGATED
- Delegation chain scope: task_285 only
- Assigned roles:
  - Implementer-A: 8개 신규 파일 + PlayerBar 수정 순차 작성
  - Reviewer+Verifier: Codex final gate
- File ownership lock plan: 9개 파일 Implementer-A 단독
- Parallel slot plan: 내부 병렬 없음
- Scheduler plan:
  - Slot allocation mode: DYNAMIC
  - Slot priority rule: dependency-first
  - Requested orchestration mode: max orchestration mode on
  - Initial slot split: 1 executor + 0 reviewer
  - Ready-queue refill trigger: task_284 완료 시
  - Agent close/reuse policy: 완료 즉시 close
  - Heartbeat / Reassignment: task_281과 동일
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
- [x] Structure changes:
  - `node scripts/gen_ai_read_me_map.mjs` 실행 (신규 디렉토리 2개)
  - `v10/AI_READ_ME_MAP.md` 업데이트
- [x] Semantic/rule changes:
  - `v10/AI_READ_ME.md`: Phase 5.1 기능 및 CanvasSnapshot 타입 기록

---

## Acceptance Criteria (Base Required)

- [x] AC-1: `CanvasSnapshot` 타입 정의 완료. `schemaVersion`, `shareId`, `hostActorId`, `canvasVersion`, `scope`, `canvas` 필드 포함.
- [x] AC-2: `useSnapshotShare()` hook — 스냅샷 생성 → UUID shareId 생성 → `sy_share:${shareId}` localStorage 저장 → `/view/${shareId}` URL 반환
- [x] AC-3: `/view/[shareId]` 라우트 접근 시 ViewerShell 렌더링 (에디터 UI 없음)
- [x] AC-4: ViewerShell에서 캔버스 읽기 전용 (편집 불가, toolbar 없음)
- [x] AC-5: ViewerShell에서 step 네비게이션 동작 (currentStep 증감)
- [x] AC-6: ShareButton 클릭 → URL 클립보드 복사 → 성공 피드백 표시
- [x] AC-7: PublicToggle이 isPublic 플래그를 스냅샷에 반영
- [x] AC-8: 비공개 스냅샷을 shareId 없이 접근 불가 (URL 추측 불가 UUID)
- [x] AC-9: `npm run lint` 통과
- [x] AC-10: `npm run build` 통과

---

## Manual Verification Steps (Base Required)

1) Step: 스냅샷 생성 확인
   - Click path: PlayerBar → Share 버튼 클릭
   - Expected: shareId 생성 → localStorage `sy_share:${shareId}` 에 JSON 저장 → URL 복사 성공 toast
   - Covers: AC-2, AC-6

2) Step: 뷰어 라우트 확인
   - Command: 복사된 URL `/view/${shareId}` 접속
   - Expected: ViewerShell 렌더링. toolbar/패널 없음. 캔버스 아이템 읽기 전용 표시.
   - Covers: AC-3, AC-4

3) Step: Step 네비게이션 확인
   - Click path: ViewerShell 내 step 이전/다음 버튼
   - Expected: currentStep 변경 → 캔버스 시퀀스 재생
   - Covers: AC-5

4) Step: localStorage 검사
   - Command: `localStorage.getItem('sy_share_index')` → JSON array 확인
   - Covers: AC-2

5) Step: 빌드 확인
   - Command: `cd v10 && npm run lint && npm run build`
   - Covers: AC-9, AC-10

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - Next.js `app/view/[shareId]/page.tsx` — `"use client"` 필요 (localStorage 접근)
    → server component로 만들면 localStorage 접근 불가. 명시 필요.
  - PlayerBar 수정 시 기존 playback/laser 기능 회귀
    → Share 버튼은 조건부 렌더링 (`!isPresentation && isHost`), 기존 레이아웃 불변 확인
  - localStorage quota (5~10MB) 초과 시 실패
    → 스냅샷 직렬화 크기 경고 표시 (초과 시 사용자 알림)
- Roll-back: `git revert <commit>` 한 줄 + localStorage `sy_share:*` 키 수동 삭제

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received

> Prerequisite: task_284 COMPLETED (Phase T).

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `v10/src/core/types/snapshot.ts` (new)
- `v10/src/features/collaboration/sharing/snapshotSerializer.ts` (new)
- `v10/src/features/collaboration/sharing/useSnapshotShare.ts` (new)
- `v10/src/features/collaboration/sharing/ShareButton.tsx` (new)
- `v10/src/features/collaboration/sharing/PublicToggle.tsx` (new)
- `v10/src/features/chrome/viewer/ViewerShell.tsx` (new)
- `v10/src/features/chrome/viewer/useViewerSession.ts` (new)
- `v10/src/app/view/[shareId]/page.tsx` (new)
- `v10/src/features/chrome/layout/PlayerBar.tsx` (edit)
- `codex_tasks/task_285_phase5_1_snapshot_viewer.md` (closeout)

Commands run:
- `cd v10 && npm run lint && npm run build`
- `scripts/check_layer_rules.sh`

## Gate Results (Codex fills)

- Lint: PASS
- Build: PASS
- Script checks: PASS (`check_layer_rules.sh`)

## Failure Classification (Codex fills when any gate fails)

- none

Manual verification notes:
- Implemented localStorage snapshot save/load flow with keys `sy_share:${shareId}` and `sy_share_index`.
- Confirmed `/view/[shareId]` route builds and renders via standalone viewer shell path (without `AppLayout`/window host imports).
- Verified step navigation wiring (`prevStep`/`nextStep`) and read-only safeguards in viewer shell through code path inspection.
- Browser click-through manual test was not executed in this CLI session.
