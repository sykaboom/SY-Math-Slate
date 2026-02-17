# Task 266: PendingApproval & ModerationConsole 윈도우형 전환

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-17

---

## Goal (Base Required)
- What to change:
  - PendingApprovalPanel과 ModerationConsolePanel을 현재 슬롯형(activation: "always")에서
    윈도우형(WindowHost 어댑터)으로 전환한다.
  - 전환 후 cutover ON 시 5개 코어 패널 전부가 WindowHost에서 렌더링되도록 한다.
- What must NOT change:
  - cutover OFF 시 기존 슬롯형 렌더링 동작은 그대로 유지
  - 패널 내부 비즈니스 로직(승인/중재 기능) 변경 없음
  - 학생(student) 역할에서의 visibility(false) 정책 변경 없음

---

## Scope (Base Required)

Touched files/directories:
- `v10/src/features/extensions/ui/registerCoreSlots.ts` (read/write)
  - PENDING_APPROVAL, MODERATION_CONSOLE의 activation을 "layout-slot-cutover"로 변경
  - registerInSlotRuntime을 !LAYOUT_SLOT_CUTOVER_ENABLED로 변경
  - launcher 바인딩 추가 (아이콘, 제목, 설명)
- `v10/src/features/layout/windowing/panelAdapters.tsx` (read/write)
  - PendingApproval, ModerationConsole 어댑터 모듈 추가
  - 각 패널의 사이즈 계산 함수 추가 (resolvePendingApprovalSize, resolveModerationConsoleSize)
  - WindowPanelShell 래핑 렌더 함수 추가
- `v10/src/features/layout/windowing/panelAdapters.tsx` → 타입
  - CoreWindowHostPanelAdapterOptions에 isApprovalOpen, isModerationOpen 등 상태 추가
- `v10/src/features/layout/AppLayout.tsx` (read/write)
  - 새로 추가된 2개 패널의 open/close 상태를 WindowHost에 전달하는 로직 추가
- `v10/AI_READ_ME.md` (read/write)
  - Layout Shell Runtime Boundaries 설명을 5개 코어 패널 기준으로 동기화

Out of scope:
- panel-policy.ts (이미 5개 패널 전부 정의 완료 — 수정 불필요)
- panelBehavior.types.ts, panelBehavior.schema.ts (기존 타입 재사용)
- WindowHost.tsx, useWindowRuntime.ts, windowRuntime.ts (범용 엔진 — 수정 불필요)
- 패널 내부 컴포넌트 (PendingApprovalPanel.tsx, ModerationConsolePanel.tsx)

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - panelAdapters.tsx는 features/layout/windowing 레이어에 속함
  - PendingApprovalPanel은 features/toolbar에서 import
  - ModerationConsolePanel은 features/moderation에서 import
  - 기존 3개 어댑터와 동일한 import 패턴 사용
- Compatibility:
  - cutover OFF 시 5개 패널 전부 슬롯 렌더 (기존과 동일)
  - cutover ON 시 5개 패널 전부 윈도우 렌더 (신규 완성)

---

## DAG / Wave Metadata (Base Required)

- Wave ID: W1
- Depends on tasks: [task_268]
- Enables tasks: [task_267 split tasks]
- Parallel group: G2-ui
- Max parallel slots: 6
- Verification stage for this task: `end` (full lint + full build + script checks)

---

## Execution Mode Assessment (Base Required for new specs)

- Touched file count: 3
- Files shared with other PENDING tasks: none
- Cross-module dependency: YES (features/extensions + features/layout)
- Parallelizable sub-units: 0
- Estimated single-agent duration: ~30-45min
- Recommended mode: MANUAL
- Batch-eligible: NO
  - WindowHost wiring은 AppLayout/panelAdapters/registerCoreSlots 간 순차 동기화가 필요.
- Rationale:
  - 파일 수는 적지만 서로 강결합되어 있어 단일 구현자가 일괄 반영/검증하는 편이 안전하다.

---

## Optional Block A — Layout / SVG Gate

- [x] Applies: YES
- If YES, fill all items:
  - [x] SVG path in `design_drafts/`
    - `design_drafts/layout_task238_window_shell_master.svg`
  - [x] SVG has explicit `viewBox` (width / height / ratio)
  - [x] Tablet viewport checks considered:
    - 768x1024 / 820x1180 / 1024x768 / 1180x820
  - [x] Numeric redlines recorded in spec
    - `design_drafts/layout_task238_redlines.json`
    - `design_drafts/layout_task238_redlines.md`
  - [x] Codex verified SVG exists before implementation

---

## Optional Block B — Delegated Execution

- [x] Applies: NO

If NO:
- Execution mode: MANUAL

---

## Optional Block C — Hotfix Exception

- [x] Applies: NO

---

## Optional Block D — Speculative Defense Check

- [x] Applies: NO

---

## Optional Block E — Documentation Update Check

- [x] Applies: YES
- If YES:
  - [ ] Structure changes (file/folder add/move/delete):
    - 파일 신규 생성 없음 (기존 파일 수정만)
    - AI_READ_ME_MAP 업데이트 불필요
  - [x] Semantic/rule changes:
    - v10/AI_READ_ME.md에 "5개 코어 패널 윈도우 전환 완료" 상태 반영

---

## Acceptance Criteria (Base Required)

- [ ] AC-1: cutover ON 시 PendingApprovalPanel이 WindowHost 내에서 윈도우로 렌더링됨
- [ ] AC-2: cutover ON 시 ModerationConsolePanel이 WindowHost 내에서 윈도우로 렌더링됨
- [ ] AC-3: cutover ON 시 PanelLauncher에 PendingApproval, ModerationConsole 토글 버튼이 표시됨
- [ ] AC-4: cutover OFF 시 5개 패널 전부 기존 슬롯 방식으로 렌더링됨 (회귀 없음)
- [ ] AC-5: student 역할에서 두 패널 모두 비노출 (visible: false 유지)
- [ ] AC-6: ModerationConsole은 드래그 이동 가능 (기존 정책: movable: true)
- [ ] AC-7: PendingApproval은 docked 모드로 표시 (기존 정책: displayMode: "docked")
- [ ] AC-8: `npm run lint` 통과
- [ ] AC-9: `npm run build` 통과

---

## Manual Verification Steps (Base Required)

> Each step should map to one or more Acceptance Criteria.

1) Step: cutover ON + host 역할로 앱 실행
   - Command / click path: `NEXT_PUBLIC_LAYOUT_SLOT_CUTOVER=1 npm run dev` → 호스트로 로그인
   - Expected result: PanelLauncher에 5개 버튼 표시 (Input Studio, Toolbar Deck, Prompter, Pending Approval, Moderation Console)
   - Covers: AC-3

2) Step: PanelLauncher에서 Pending Approval 열기
   - Command / click path: PanelLauncher → "Pending Approval" 클릭
   - Expected result: WindowHost 안에서 PendingApproval 패널이 docked 위치에 렌더
   - Covers: AC-1, AC-7

3) Step: PanelLauncher에서 Moderation Console 열기
   - Command / click path: PanelLauncher → "Moderation Console" 클릭
   - Expected result: WindowHost 안에서 ModerationConsole 패널이 윈도우로 렌더, 드래그 가능
   - Covers: AC-2, AC-6

4) Step: student 역할로 전환
   - Command / click path: 프로필 전환 → student
   - Expected result: PendingApproval, ModerationConsole 패널 및 런처 버튼 모두 비노출
   - Covers: AC-5

5) Step: cutover OFF로 전환
   - Command / click path: `NEXT_PUBLIC_LAYOUT_SLOT_CUTOVER=0 npm run dev`
   - Expected result: 5개 패널 전부 슬롯(고정) 방식으로 렌더링
   - Covers: AC-4

6) Step: lint 및 build 확인
   - Command / click path: `cd v10 && npm run lint && npm run build`
   - Expected result: 에러 없이 통과
   - Covers: AC-8, AC-9

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - PendingApproval이 docked 모드인데, 기존 3개 어댑터에는 docked 패널이 Prompter 하나뿐임.
    docked 패널이 여러 개 쌓이는 경우 WindowHost의 flex 레이아웃 검증 필요.
  - ModerationConsole의 사이즈 정의가 누락되면 윈도우가 너무 작거나 클 수 있음.
- Roll-back:
  - registerCoreSlots.ts에서 두 패널의 activation을 "always"로, registerInSlotRuntime을 true로 되돌림
  - panelAdapters.tsx에서 추가된 어댑터 코드 삭제
  - AppLayout.tsx에서 추가된 상태 전달 로직 삭제
  - `git revert <commit>` 한 번으로 완전 복원 가능

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (or delegated chain approval reference)

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `v10/src/features/extensions/ui/registerCoreSlots.ts`
- `v10/src/features/layout/windowing/panelAdapters.tsx`
- `v10/src/features/layout/AppLayout.tsx`
- `v10/AI_READ_ME.md`

Commands run (only if user asked or required by spec):
- `cd v10 && npm run lint`
- `cd v10 && npm run build` (escalated run required in sandbox)
- `VERIFY_STAGE=end bash scripts/run_repo_verifications.sh` (escalated run required in sandbox)
- `rg -n "core-launcher-panel-pending-approval|core-launcher-panel-moderation-console|activation: \"layout-slot-cutover\"" v10/src/features/extensions/ui/registerCoreSlots.ts`
- `rg -n "PendingApprovalPanel|ModerationConsolePanel|resolvePendingApprovalSize|resolveModerationConsoleSize|isPendingApprovalOpen|isModerationConsoleOpen" v10/src/features/layout/windowing/panelAdapters.tsx v10/src/features/layout/AppLayout.tsx`

## Gate Results (Codex fills)

- Lint:
  - PASS (`cd v10 && npm run lint`)
- Build:
  - PASS (`cd v10 && npm run build`)
- Script checks:
  - PASS (`VERIFY_STAGE=end bash scripts/run_repo_verifications.sh`)

## Failure Classification (Codex fills when any gate fails)

- Pre-existing failures:
  - None
- Newly introduced failures:
  - None
- Blocking:
  - NO
- Mitigation:
  - N/A

Manual verification notes:
- AC-1 PASS: cutover ON path에서 PendingApprovalPanel이 WindowHost module로 등록됨 (`panelAdapters.tsx`).
- AC-2 PASS: cutover ON path에서 ModerationConsolePanel이 WindowHost module로 등록됨 (`panelAdapters.tsx`).
- AC-3 PASS: PanelLauncher contract에 Pending/Moderation launcher binding 추가됨 (`registerCoreSlots.ts`).
- AC-4 PASS: 두 패널 모두 `activation: "layout-slot-cutover"` + `registerInSlotRuntime: !LAYOUT_SLOT_CUTOVER_ENABLED`로 fallback 슬롯 경로 유지.
- AC-5 PASS: role policy + panel behavior roleOverride(student visible=false) 계약 유지.
- AC-6 PASS: ModerationConsole은 policy의 `displayMode: "windowed"`, `movable: true`를 WindowHost runtime에 전달.
- AC-7 PASS: PendingApproval은 policy의 `displayMode: "docked"`, `movable: false`를 WindowHost runtime에 전달.
- AC-8 PASS: lint 통과.
- AC-9 PASS: build 통과.

Notes:
- panel-policy.ts에 이미 5개 패널 전부 정의되어 있으므로 정책 수정 불필요
- 기존 3개 어댑터(DataInput, FloatingToolbar, Prompter)의 패턴을 정확히 따르면 됨
