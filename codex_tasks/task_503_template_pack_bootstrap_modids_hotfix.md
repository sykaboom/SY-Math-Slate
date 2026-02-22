# Task 503: Template Pack Bootstrap modIds contract hotfix

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-22

---

## Goal (Base Required)
- What to change:
  - `adaptTemplatePackManifestToModPackageDefinition`에서 `activation.toolbarModeMap`에 사용되는 fallback modId들이 `modIds`에 포함되도록 보정한다.
  - 런타임 기본 팩 부트스트랩 시 `toolbarModeMap values must exist in modIds` 예외를 해소한다.
- What must NOT change:
  - base-education toolbar mode 정의(draw/playback/canvas) 자체 변경 금지.
  - 모드 라우팅/레이아웃/UI 정책 변경 금지.

---

## Scope (Base Required)

Touched files/directories:
- `v10/src/core/runtime/modding/package/templatePackAdapter.ts`
- `codex_tasks/task_503_template_pack_bootstrap_modids_hotfix.md`

Out of scope:
- template pack manifest 구조 변경
- guards 검증 규칙 변경
- toolbar UI 컴포넌트 변경

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - core runtime package 어댑터 내부에서만 보정.
- Compatibility:
  - `defaultModId`는 기존처럼 runtime template-pack mod id 유지.
  - `toolbarModeMap` 값은 기존 modeDefinitions 기반 유지.

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - W-HOTFIX-RUNTIME-BOOTSTRAP-01
- Depends on tasks:
  - `task_496`
- Enables tasks:
  - `[]`
- Parallel group:
  - G-HOTFIX
- Max parallel slots:
  - 6
- Verification stage for this task:
  - `end`

---

## Execution Mode Assessment (Base Required for new specs)

- Touched file count:
  - 2
- Files shared with other PENDING tasks:
  - none
- Cross-module dependency:
  - NO
- Parallelizable sub-units:
  - 0
- Estimated single-agent duration:
  - `~10min`
- Recommended mode:
  - MANUAL
- Batch-eligible:
  - NO
- Rationale:
  - 단일 어댑터 함수의 계약 불일치 핫픽스.

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

- [x] Applies: YES
- If YES:
  - Explicit user hotfix approval quote:
    - "에러있는거같아."
  - Exact hotfix scope/files:
    - `v10/src/core/runtime/modding/package/templatePackAdapter.ts`
  - Hotfix log path:
    - `codex_tasks/hotfix/hotfix_058_template_pack_bootstrap_modids.md`

---

## Optional Block D — Speculative Defense Check

- [ ] Applies: NO

---

## Optional Block E — Documentation Update Check

- [ ] Applies: NO

---

## Acceptance Criteria (Base Required)

- [x] AC-1: adapter 결과 `modIds`가 runtime mod id + toolbar fallback mod id 집합을 포함한다.
- [x] AC-2: `activation.toolbarModeMap` 값들이 `modIds`에 포함되는 상태를 보장한다.
- [x] AC-3: `cd v10 && npm run lint && npm run build` PASS.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path:
     - `sed -n '120,240p' v10/src/core/runtime/modding/package/templatePackAdapter.ts`
   - Expected result:
     - `modIds` 계산에 fallback mod id가 포함된다.
   - Covers: AC-1, AC-2

2) Step:
   - Command / click path:
     - `cd v10 && npm run lint && npm run build`
   - Expected result:
     - PASS.
   - Covers: AC-3

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - modIds 확장으로 package selector가 참조 가능한 modIds가 늘어남.
- Roll-back:
  - adapter 함수 변경 revert.

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (or delegated chain approval reference)
  - User quote: "에러있는거같아."

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `v10/src/core/runtime/modding/package/templatePackAdapter.ts`
- `codex_tasks/task_503_template_pack_bootstrap_modids_hotfix.md`
- `codex_tasks/hotfix/hotfix_058_template_pack_bootstrap_modids.md`

Commands run (only if user asked or required by spec):
- `cd v10 && npm run lint && npm run build`

## Gate Results (Codex fills)

- Lint:
  - PASS
- Build:
  - PASS
- Script checks:
  - N/A

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
- AC-1: PASS
- AC-2: PASS
- AC-3: PASS
