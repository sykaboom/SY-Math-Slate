# Task 310: Toolbar Cutover Convergence (Desktop/Mobile/Tablet)

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-19

---

## Goal (Base Required)
- What to change:
  - Remove scattered `NEXT_PUBLIC_CORE_TOOLBAR_CUTOVER` branching and converge toolbar render policy into one deterministic resolver.
  - Guarantee the same mode model (`draw/playback/canvas`) across desktop/mobile/tablet with explicit fallback behavior.
- What must NOT change:
  - Do not change command ids or command payload contracts.
  - Do not remove ExtensionSlot-based injection points.

---

## Scope (Base Required)

Touched files/directories:
- `v10/src/features/toolbar/FloatingToolbar.tsx`
- `v10/src/features/toolbar/toolbarModePolicy.ts` (new)
- `v10/src/features/extensions/ui/registerCoreSlots.ts` (only if needed for policy binding consistency)

Out of scope:
- New toolbar features (no new controls)
- Layout geometry redesign

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - Keep command dispatch path through `dispatchCommand` only.
  - No direct mutation into document/session stores from toolbar view logic.
- Compatibility:
  - Existing env flag behavior must remain backward-compatible at rollout boundary.

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - W-TBAR-PH2-A
- Depends on tasks:
  - [`task_309`]
- Enables tasks:
  - `task_312`
- Parallel group:
  - G1-core-policy
- Max parallel slots:
  - 6
- Verification stage for this task:
  - `mid`

---

## Execution Mode Assessment (Base Required for new specs)

- Touched file count:
  - 2~3
- Files shared with other PENDING tasks:
  - `v10/src/features/toolbar/FloatingToolbar.tsx`
- Cross-module dependency:
  - YES
- Parallelizable sub-units:
  - 1
- Estimated single-agent duration:
  - ~30min
- Recommended mode:
  - MANUAL
- Batch-eligible:
  - NO
  - If YES, mention ordering/file-lock constraints.
- Rationale:
  - Shared hot file(`FloatingToolbar.tsx`) and policy convergence work should run single-owner to avoid merge churn.

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
  - `task_305~309` review + user-reported toolbar inconsistency under cutover paths.
- Sunset criteria:
  - Remove transitional policy branches after `task_316` contract gate passes for 2 consecutive waves.

---

## Optional Block E — Documentation Update Check

- [x] Applies: YES
- [ ] Structure changes (file/folder add/move/delete):
  - Run `node scripts/gen_ai_read_me_map.mjs`
  - Verify `v10/AI_READ_ME_MAP.md` update if needed
- [x] Semantic/rule changes:
  - Verify `v10/AI_READ_ME.md` update if needed

---

## Acceptance Criteria (Base Required)

- [ ] AC-1: Cutover/env-flag read is centralized in one resolver module.
- [ ] AC-2: `FloatingToolbar.tsx` no longer contains repeated ad-hoc `showLegacy*` booleans scattered across render blocks.
- [ ] AC-3: Desktop/mobile/tablet all use the same mode semantics (`draw/playback/canvas`) with deterministic fallback table.
- [ ] AC-4: `cd v10 && npm run lint && npm run build` pass.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path: `cd v10 && npm run lint && npm run build`
   - Expected result: no build/lint regression
   - Covers: AC-4

2) Step:
   - Command / click path: width 1440(desktop), 1024(tablet), 390(mobile)에서 toolbar mode 전환
   - Expected result: 세 환경 모두 동일한 모드 의미/노출 규칙
   - Covers: AC-3

3) Step:
   - Command / click path: `rg -n "NEXT_PUBLIC_CORE_TOOLBAR_CUTOVER|showLegacy" v10/src/features/toolbar/FloatingToolbar.tsx`
   - Expected result: 정책 분기 중복 제거(핵심 분기 단일화)
   - Covers: AC-1, AC-2

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - 잘못된 정책 테이블로 툴바 일부 컨트롤 누락 가능.
- Roll-back:
  - `git revert <commit>` 후 기존 `FloatingToolbar.tsx` 경로 복구.

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (or delegated chain approval reference)

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `v10/src/features/toolbar/FloatingToolbar.tsx`
- `v10/src/features/toolbar/toolbarModePolicy.ts`

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
- Toolbar cutover/env branch is now resolved through `toolbarModePolicy.ts`.
- FloatingToolbar no longer directly evaluates env flag in scattered render branches.

Notes:
- ...
