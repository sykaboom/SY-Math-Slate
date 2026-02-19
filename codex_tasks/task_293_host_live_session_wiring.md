# Task 293: 라이브 호스트 UI 연결 (useHostSession / useHostPolicyEngine / SessionPolicyPanel)

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-19

---

## 사전 감사 기록

```
[ VERIFIED ]
- useHostSession.ts 존재 (235줄) — HostSessionState { connectionState, publishSnapshot, endSession } export
- useHostPolicyEngine.ts 존재 (319줄) — UseHostPolicyEngineState { pendingProposals, approveProposal, rejectProposal } export
- SessionPolicyPanel.tsx 존재 (149줄) — useSessionPolicyStore 연결, template/rule 편집 UI
- Grep 결과: useHostSession, useHostPolicyEngine, SessionPolicyPanel 모두 정의 파일에서만 존재
  → 다른 어떤 파일도 import 안 함 — 연결 완전 누락 확인
- features/store/에 ShareSessionMeta를 보유하는 스토어 없음 — 새로 만들어야 함
- ShareButton.tsx: createSnapshotShare 결과에 liveSession 포함 가능 (useSnapshotShare.ts 확인)
- useHostSession 활성화 조건: options.liveSession?.enabled && options.liveSession?.relayUrl 필요
```

---

## Goal (Base Required)

- What to change:
  - `useHostShareStore.ts` (신규) — 활성 host 세션 메타(shareId, liveSession, hostActorId) Zustand 스토어
  - `ShareButton.tsx` — share 성공 시 useHostShareStore.setActiveSession(meta) 호출
  - `HostLiveSessionPanel.tsx` (신규) — useHostSession + useHostPolicyEngine + TeacherApprovalPanel 통합 패널
  - `panel-policy.ts` — `core.host-live-session.panel` 정책 추가 (host: visible, student: hidden)
  - `registerCoreSlots.ts` — 신규 패널 launcher contract/slot binding 추가
  - `panelAdapters.tsx` — HostLiveSessionPanel window-host 모듈 추가
  - `AppLayout.tsx` — 신규 패널 open/close 상태 연결 (windowRuntimePanelOpenState 기반)
- What must NOT change:
  - useHostSession / useHostPolicyEngine 내부 로직 변경 없음
  - SessionPolicyPanel은 현재 상태 유지 (AppLayout 기존 패널에 통합 가능, 별도 노출 불필요)
  - useSnapshotShare.ts 핵심 공유 로직 변경 없음

---

## Scope (Base Required)

Touched files/directories (create):
- `v10/src/features/store/useHostShareStore.ts` — activeSession: { shareId, hostActorId, liveSession } | null
- `v10/src/features/sharing/HostLiveSessionPanel.tsx` — 호스트 세션 상태 + 보류 제안 승인/거부 UI

Touched files/directories (write):
- `v10/src/features/sharing/ShareButton.tsx` — 공유 성공 후 useHostShareStore.setActiveSession(meta) 호출
- `v10/src/core/config/panel-policy.ts` — HOST_LIVE_SESSION 패널 정책/ID 추가
- `v10/src/features/extensions/ui/registerCoreSlots.ts` — HOST_LIVE_SESSION launcher/slot contract 추가
- `v10/src/features/layout/windowing/panelAdapters.tsx` — HostLiveSessionPanel window module 추가
- `v10/src/features/layout/AppLayout.tsx` — 신규 패널 open/close 상태 연결

Out of scope:
- SessionPolicyPanel 단독 신규 패널화 (이번 task는 HostLiveSessionPanel 내부 사용 또는 기존 경로 유지)
- 라이브 세션 중 canvas 실시간 브로드캐스트 로직 변경
- TeacherApprovalPanel UI 디자인 변경

---

## 세부 설계

```
[ useHostShareStore ]
type ActiveHostSession = {
  shareId: string;
  hostActorId: string;
  liveSession: LiveSessionMeta | null;
};
store: { activeSession: ActiveHostSession | null; setActiveSession / clearActiveSession }

[ ShareButton 변경 ]
공유 성공(result.ok) → result.meta.liveSession 있으면 useHostShareStore.setActiveSession({
  shareId: result.meta.shareId,
  hostActorId: snapshot.hostActorId,  ← useSnapshotShare result에서 추출
  liveSession: result.meta.liveSession
})

[ HostLiveSessionPanel ]
- useHostShareStore에서 activeSession 구독
- activeSession 없으면: "No active session" 표시
- activeSession 있으면:
  - useHostSession({ shareId, hostActorId, liveSession, enabled: true }) → connectionState 표시
  - useHostPolicyEngine({ shareId, hostActorId, policy: activePolicy, liveSession, enabled: true })
    → pendingProposals 목록 → 각 항목에 Approve / Reject 버튼
  - TeacherApprovalPanel import (task_289 기존 파일 재사용 가능)
  - useSessionPolicyStore.activePolicy로 현재 정책 표시

[ 정책/슬롯/패널 연결 ]
- panel-policy.ts:
  - `CORE_PANEL_POLICY_IDS.HOST_LIVE_SESSION` 추가
  - behavior.displayMode=`windowed`, roleOverride.host.visible=true, student.visible=false
  - `CORE_EDIT_ONLY_PANEL_POLICY_IDS`에 HOST_LIVE_SESSION 포함
- registerCoreSlots.ts:
  - CORE_SLOT_BINDINGS에 HOST_LIVE_SESSION launcher 계약 추가
- panelAdapters.tsx:
  - HostLiveSessionPanel 전용 window module 추가
  - 사이즈 redline: width 420, height 520 (clamp min 360x320, max 560x820)
  - close 동작은 `context.setOpen(false)` 대신 AppLayout close 핸들러로 일관 연결
- AppLayout.tsx:
  - `isHostLiveSessionOpen` 계산 + `closeHostLiveSession` 전달
  - `buildCoreWindowHostPanelAdapters` 옵션에 host-live-session 항목 추가
```

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - `useHostShareStore` → features/store 레이어 (core import 허용, app import 금지)
  - `HostLiveSessionPanel` → features/sharing 레이어
  - `HostLiveSessionPanel`에서 `TeacherApprovalPanel` import: 동일 features/sharing/ai/ 레이어 (허용)
- Compatibility:
  - activeSession은 인메모리만. 페이지 새로고침 시 초기화 (localStorage 저장 없음)
  - NEXT_PUBLIC_SHARE_LIVE_WS_URL 미설정 시 liveSession = undefined → HostLiveSessionPanel 비활성 상태 안내

---

## DAG / Wave Metadata (Base Required)

- Wave ID: W-hotfix-P0
- Depends on tasks: [task_286 (LiveBroadcastTransport), task_287 (useHostPolicyEngine), task_289 (TeacherApprovalPanel), task_290 (session policy panel contracts)]
- Enables tasks: [없음 — 독립 버그픽스]
- Parallel group: G-hotfix-A (C-1 단독)
- Max parallel slots: 1
- Verification stage: `end`

---

## Execution Mode Assessment (Base Required for new specs)

- Touched file count: 7 (2 create + 5 write)
- Files shared with other PENDING tasks: `AppLayout.tsx` (task_296, task_300과 공유) — 주의
- Cross-module dependency: YES (store → sharing → layout → core/config)
- Parallelizable sub-units: 0
- Estimated single-agent duration: ~40min
- Recommended mode: DELEGATED (single-agent lane)
- Batch-eligible: NO (AppLayout.tsx task_296, task_300과 충돌 — 단독 먼저 실행)
- Rationale: AppLayout 수정 포함. 다른 AppLayout 수정 태스크(296, 300)와 병렬 실행 금지. 가장 먼저 실행.

---

## Optional Block A — Layout / SVG Gate

- [x] Applies: YES
- [ ] SVG path in `design_drafts/`
  - Required: `design_drafts/layout_host_live_session_panel_420x520.svg`
- [ ] SVG has explicit `viewBox` (width / height / ratio)
- [ ] Tablet viewport checks considered:
  - 768x1024 / 820x1180 / 1024x768 / 1180x820
- [x] Numeric redlines recorded in spec
- [ ] Codex verified SVG exists before implementation
- Numeric redlines:
  - Window default size: 420x520
  - Window min size: 360x320
  - Window max size: 560x820
  - Header action touch target: >= 36px

---

## Optional Block B — Delegated Execution

- [x] Applies: YES
- Execution mode: DELEGATED
- Delegation chain scope: task_293 only
- File ownership lock plan: 7개 파일 Implementer-A 단독
- Parallel slot plan: 내부 병렬 없음
- Scheduler plan:
  - Slot allocation mode: DYNAMIC
  - Requested orchestration mode: max orchestration mode on
  - Ready-queue refill trigger: 즉시 실행 가능
  - Agent close/reuse policy: 완료 즉시 close
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
- [x] Structure changes: `node scripts/gen_ai_read_me_map.mjs` 실행
- [x] Semantic/rule changes:
  - `v10/AI_READ_ME.md`: 라이브 호스트 패널 연결 완성, useHostShareStore 레이어 규칙 명시

---

## Acceptance Criteria (Base Required)

- [ ] AC-1: ShareButton으로 공유 생성 후 HostLiveSessionPanel에 connectionState 표시
- [ ] AC-2: Tutor Moderated AI 세션에서 참가자 proposal → HostLiveSessionPanel 목록에 표시
- [ ] AC-3: Approve / Reject 버튼 클릭 → 결과 전송 → 목록에서 제거
- [ ] AC-4: NEXT_PUBLIC_SHARE_LIVE_WS_URL 미설정 시 "No active session" 또는 비활성 안내 표시
- [ ] AC-5: student 역할에서 HostLiveSessionPanel/launcher 모두 미표시
- [ ] AC-6: 신규 panel ID가 panel-policy, slot registry, panelAdapters 경로에서 모두 resolve됨
- [ ] AC-7: `npm run lint` 통과
- [ ] AC-8: `npm run build` 통과

---

## Manual Verification Steps (Base Required)

1) Step: 호스트 라이브 세션 전체 흐름
   - PlayerBar Share → 공유 생성 → HostLiveSessionPanel에 connectionState: "open" 표시 확인
   - Covers: AC-1

2) Step: 제안 승인 흐름
   - Tutor Moderated AI 세션 → 참가자 뷰어에서 step 요청 → HostLiveSessionPanel 목록 표시 → Approve 클릭
   - Covers: AC-2, AC-3

3) Step: 학생 역할 누수 없음
   - role=student로 렌더링 → HostLiveSessionPanel/launcher 미표시 확인
   - Covers: AC-5

4) Step: 정책/슬롯/패널 계약 확인
   - panel-policy + registerCoreSlots + panelAdapters + AppLayout에서 동일 panelId resolve 확인
   - Covers: AC-6

5) Step: 빌드 확인
   - Command: `cd v10 && npm run lint && npm run build`
   - Covers: AC-7, AC-8

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - AppLayout 수정 시 기존 windowed panel 목록 순서 변경으로 레이아웃 회귀 가능
    → buildCoreWindowHostPanelAdapters에 항목 추가만, 기존 항목 순서 유지
  - useHostSession + useHostPolicyEngine 동시 실행 시 WebSocket 채널 2개 연결 가능성
    → HostLiveSessionPanel에서 둘 다 같은 shareId + relayUrl 사용 — 채널 공유 구조 확인 필요
- Roll-back: `git revert <commit>` 한 줄

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received

> AppLayout.tsx를 수정하므로 task_296(학생 정책 누수), task_300(safe-area)보다 먼저 실행.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `v10/src/features/store/useHostShareStore.ts`
- `v10/src/features/sharing/HostLiveSessionPanel.tsx`
- `v10/src/features/sharing/ShareButton.tsx`
- `v10/src/core/config/panel-policy.ts`
- `v10/src/features/extensions/ui/registerCoreSlots.ts`
- `v10/src/features/layout/windowing/panelAdapters.tsx`
- `v10/src/features/layout/AppLayout.tsx`
- `design_drafts/layout_host_live_session_panel_420x520.svg`

Commands run:
- `scripts/check_layer_rules.sh`
- `cd v10 && npm run lint`
- `cd v10 && npm run build`

## Gate Results (Codex fills)

- Lint: PASS
- Build: PASS
- Script checks: PASS (`scripts/check_layer_rules.sh`)

## Failure Classification (Codex fills when any gate fails)

- none

Manual verification notes:
- Host live session 패널이 WindowHost에 연결되고 Host 전용으로 동작하도록 확인.
- panel close 경로가 `setWindowRuntimePanelOpenState(...)` SSOT를 사용함을 확인.
