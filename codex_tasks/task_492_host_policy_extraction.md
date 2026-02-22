# Task 492: Host Toolbar Policy Extraction (Core selector 승격)

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-22

---

## Goal (Base Required)
- What to change:
  - host feature 계층(`toolbarModePolicy.ts`)에 남아 있는 툴바 정책 로직(compat fallback mode 정의, cutover env 판정)을 `core/runtime/modding/package/selectors.ts`로 승격한다.
  - `FloatingToolbar.tsx`가 cutover 판정을 feature 정책 함수가 아니라 core selector에서 직접 가져오도록 변경한다.
- What must NOT change:
  - 사용자 관점 툴바 모드 전환/표시 동작 변경 금지.
  - mod package activation/alias fallback의 결과 동작 변경 금지.
  - AppLayout/windowing 동작 변경 금지.

---

## Scope (Base Required)

Touched files/directories:
- `v10/src/core/runtime/modding/package/selectors.ts`
- `v10/src/features/chrome/toolbar/toolbarModePolicy.ts`
- `v10/AI_READ_ME.md`
- `codex_tasks/task_492_host_policy_extraction.md`

Out of scope:
- `v10/src/features/chrome/layout/**`
- `v10/src/mod/**` pack bootstrap 경로
- toolbar UI 컴포넌트 레이아웃/스타일 변경

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - core selector는 `features/*` import 금지
  - feature toolbar는 core selector 결과를 소비만 수행
- Compatibility:
  - compat alias fallback telemetry 경로는 유지
  - `NEXT_PUBLIC_CORE_TOOLBAR_CUTOVER` 기본 동작 유지

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - W-GAP-HIGH-03
- Depends on tasks:
  - `task_491`
- Enables tasks:
  - `task_493` pack-first contract lock
- Parallel group:
  - G-HOST-POLICY-EXTRACT
- Max parallel slots:
  - 6
- Verification stage for this task:
  - `end`

---

## Execution Mode Assessment (Base Required for new specs)

- Touched file count:
  - 5
- Files shared with other PENDING tasks:
  - none
- Cross-module dependency:
  - YES (core selector <-> feature toolbar)
- Parallelizable sub-units:
  - 0
- Estimated single-agent duration:
  - `~30min`
- Recommended mode:
  - MANUAL
- Batch-eligible:
  - NO
- Rationale:
  - selector/host 연결부 단일 경로 보정으로 직렬 검증이 안전하다.

---

## Optional Block A — Layout / SVG Gate

- [ ] Applies: NO

---

## Optional Block B — Delegated Execution

- [ ] Applies: NO

If NO:
- Execution mode: MANUAL

---

## Optional Block C — Hotfix Exception

- [ ] Applies: NO

---

## Optional Block D — Speculative Defense Check

- [ ] Applies: NO

---

## Optional Block E — Documentation Update Check

- [x] Applies: YES
- [x] Semantic/rule changes:
  - host policy extraction 경로를 `v10/AI_READ_ME.md`에 반영

---

## Acceptance Criteria (Base Required)

- [x] AC-1: `toolbarModePolicy.ts`에 host-local compat fallback mode 정의 상수가 남지 않는다.
- [x] AC-2: core selector의 cutover 판정 함수(`selectRuntimeToolbarCutoverEnabled`)를 `toolbarModePolicy.ts`가 위임 호출한다.
- [x] AC-3: `bash scripts/check_mod_contract.sh` + `bash scripts/check_toolbar_contract.sh`가 PASS한다.
- [x] AC-4: `cd v10 && npm run lint && npm run build`가 PASS한다.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path:
     - `rg -n "COMPAT_FALLBACK_TOOLBAR_MODE_DEFINITIONS|isCoreToolbarCutoverEnabled" v10/src/features/chrome/toolbar/toolbarModePolicy.ts || true`
   - Expected result:
     - host-local compat fallback 상수/legacy env resolver가 존재하지 않는다.
   - Covers: AC-1

2) Step:
   - Command / click path:
     - `rg -n "selectRuntimeToolbarCutoverEnabled" v10/src/core/runtime/modding/package/selectors.ts v10/src/features/chrome/toolbar/toolbarModePolicy.ts`
   - Expected result:
     - core selector 정의 + toolbar policy 위임 소비 경로가 존재한다.
   - Covers: AC-2

3) Step:
   - Command / click path:
     - `bash scripts/check_mod_contract.sh && bash scripts/check_toolbar_contract.sh`
   - Expected result:
     - PASS
   - Covers: AC-3

4) Step:
   - Command / click path:
     - `cd v10 && npm run lint && npm run build`
   - Expected result:
     - PASS
   - Covers: AC-4

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - fallback mode 계산 경로 이동 시 모드 전환 기본값 회귀 가능.
- Roll-back:
  - `selectors.ts`, `toolbarModePolicy.ts`, `FloatingToolbar.tsx` 변경만 revert하면 즉시 복원 가능.

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (or delegated chain approval reference)
  - User quote: "오케이 다음 단계 시작해."

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `v10/src/core/runtime/modding/package/selectors.ts`
- `v10/src/features/chrome/toolbar/toolbarModePolicy.ts`
- `v10/AI_READ_ME.md`
- `codex_tasks/task_492_host_policy_extraction.md`

Commands run (only if user asked or required by spec):
- `rg -n "COMPAT_FALLBACK_TOOLBAR_MODE_DEFINITIONS|resolveToolbarRenderPolicy|isCoreToolbarCutoverEnabled" v10/src/features/chrome/toolbar/toolbarModePolicy.ts || true`
- `rg -n "selectRuntimeToolbarCutoverEnabled" v10/src/core/runtime/modding/package/selectors.ts v10/src/features/chrome/toolbar/toolbarModePolicy.ts`
- `bash scripts/check_mod_contract.sh`
- `bash scripts/check_toolbar_contract.sh`
- `cd v10 && npm run lint && npm run build`

## Gate Results (Codex fills)

- Lint:
  - PASS
- Build:
  - PASS
- Script checks:
  - PASS

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
- AC-1 PASS: `toolbarModePolicy.ts`에서 host-local compat fallback 정의 상수 제거됨.
- AC-2 PASS: cutover env 판정은 core selector(`selectRuntimeToolbarCutoverEnabled`)를 toolbar 정책 레이어가 위임 호출.
- AC-3 PASS: `check_mod_contract.sh`, `check_toolbar_contract.sh` PASS.
- AC-4 PASS: `npm run lint`, `npm run build` PASS.

Notes:
- `FloatingToolbar`는 기존 계약(`resolveToolbarRenderPolicy`)을 유지하고, 내부 cutover source만 core selector로 승격했다.
