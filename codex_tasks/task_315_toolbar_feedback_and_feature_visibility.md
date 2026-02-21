# Task 315: Toolbar Feedback Reliability + Feature Visibility Policy

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-19

---

## Goal (Base Required)
- What to change:
  - Replace silent command failures with non-blocking but explicit toolbar feedback.
  - Make sound/export visibility policy deterministic by environment + role + capability.
- What must NOT change:
  - Do not reintroduce browser blocking modal UX.

---

## Scope (Base Required)

Touched files/directories:
- `v10/src/features/chrome/toolbar/FloatingToolbar.tsx`
- `v10/src/features/chrome/toolbar/PageNavigator.tsx`
- `v10/src/features/chrome/toolbar/PlaybackControls.tsx`
- `v10/src/features/chrome/toolbar/PenControls.tsx`
- `v10/src/features/chrome/toolbar/LaserControls.tsx`
- `v10/src/features/chrome/toolbar/EraserControls.tsx`
- `v10/src/features/chrome/toolbar/toolbarFeedback.ts` (new shared helper)

Out of scope:
- Server-side logging pipeline redesign
- New moderation workflow

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - Command dispatch errors must be surfaced through shared feedback channel.
  - Keep feedback non-blocking and keyboard/touch safe.
- Compatibility:
  - Existing command ids and payloads remain unchanged.

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - W-TBAR-PH2-F
- Depends on tasks:
  - [`task_314`]
- Enables tasks:
  - `task_316`
- Parallel group:
  - G6-feedback
- Max parallel slots:
  - 6
- Verification stage for this task:
  - `mid`

---

## Execution Mode Assessment (Base Required for new specs)

- Touched file count:
  - 7
- Files shared with other PENDING tasks:
  - `v10/src/features/chrome/toolbar/FloatingToolbar.tsx`
- Cross-module dependency:
  - NO
- Parallelizable sub-units:
  - 2
- Estimated single-agent duration:
  - ~35min
- Recommended mode:
  - MANUAL
- Batch-eligible:
  - NO
- Rationale:
  - Shared failure-surface contract must be introduced atomically.

---

## Optional Block A — Layout / SVG Gate

- [x] Applies: NO

---

## Optional Block B — Delegated Execution

- [x] Applies: NO
- Execution mode: MANUAL

---

## Optional Block C — Hotfix Exception

- [x] Applies: NO

---

## Optional Block D — Speculative Defense Check

- [x] Applies: YES
- Evidence (real input, spec, or bug report):
  - UX report item #15/#16 + `.catch(() => undefined)` 다수 경로.
- Sunset criteria:
  - Remove transitional feedback wrappers when command-layer standardized error envelope 도입 완료.

---

## Optional Block E — Documentation Update Check

- [x] Applies: YES
- [x] Semantic/rule changes:
  - Verify `v10/AI_READ_ME.md` update if needed

---

## Acceptance Criteria (Base Required)

- [ ] AC-1: Toolbar command 실패가 조용히 무시되지 않고 non-blocking notice로 표면화된다.
- [ ] AC-2: Sound toggle 접근 경로는 desktop/mobile/tablet 모두 1~2 depth 내 유지.
- [ ] AC-3: Not-ready feature는 정책 기반으로 숨김 또는 명시적 disabled 표준을 따른다(임의 노출 금지).
- [ ] AC-4: `cd v10 && npm run lint && npm run build` pass.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path: 실패 유도(권한/비활성 command) 후 toolbar 액션 실행
   - Expected result: notice 노출, silent drop 없음
   - Covers: AC-1

2) Step:
   - Command / click path: desktop/tablet/mobile에서 sound toggle 탐색
   - Expected result: 접근 깊이 기준 충족
   - Covers: AC-2

3) Step:
   - Command / click path: capability 조합 바꿔 export 등 비완성 기능 확인
   - Expected result: visibility policy 일관
   - Covers: AC-3

4) Step:
   - Command / click path: `cd v10 && npm run lint && npm run build`
   - Expected result: 통과
   - Covers: AC-4

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - notice 과다 노출로 시각 소음 증가.
- Roll-back:
  - `git revert <commit>` + 기존 notice/dispatch 래퍼 복구.

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (or delegated chain approval reference)

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `v10/src/features/chrome/toolbar/toolbarFeedback.ts`
- `v10/src/features/chrome/toolbar/FloatingToolbar.tsx`
- `v10/src/features/chrome/toolbar/PageNavigator.tsx`
- `v10/src/features/chrome/toolbar/PlaybackControls.tsx`
- `v10/src/features/chrome/toolbar/PenControls.tsx`
- `v10/src/features/chrome/toolbar/LaserControls.tsx`
- `v10/src/features/chrome/toolbar/EraserControls.tsx`

Commands run (only if user asked or required by spec):
- `scripts/check_layer_rules.sh`
- `scripts/check_toolbar_contract.sh`
- `cd v10 && npm run lint`
- `cd v10 && npm run build`

## Gate Results (Codex fills)

- Lint:
  - PASS
- Build:
  - PASS
- Script checks:
  - PASS

## Failure Classification (Codex fills when any gate fails)

- Pre-existing failures:
  - ...
- Newly introduced failures:
  - ...
- Blocking:
  - YES | NO
- Mitigation:
  - ...

Manual verification notes:
- Command dispatch wrappers now surface non-blocking toolbar feedback instead of silent catch drops.
- Toolbar components route failure UX through shared `toolbarFeedback.ts`.

Notes:
- ...
