# Task 496: Legacy Alias Runtime Removal (Pack-map only)

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-22

---

## Goal (Base Required)
- What to change:
  - mod package activation/toolbar mode resolution에서 `legacy-alias-fallback` 런타임 경로를 제거한다.
  - template pack adapter가 toolbar mode definition(`fallbackModId`)을 activation map으로 승격해 package-map only 해석을 보장한다.
  - alias retire freeze budget을 zero baseline으로 전환한다.
- What must NOT change:
  - 기본 template pack(base-education)의 툴바 모드 전환(draw/playback/canvas) 동작 회귀 금지.
  - no-mod boot 경로 및 build/lint 게이트 회귀 금지.

---

## Scope (Base Required)

Touched files/directories:
- `v10/src/core/runtime/modding/package/types.ts`
- `v10/src/core/runtime/modding/package/selectors.ts`
- `v10/src/core/runtime/modding/package/index.ts`
- `v10/src/core/runtime/modding/package/templatePackAdapter.ts`
- `v10/src/core/runtime/modding/package/legacyAlias.ts` (delete)
- `v10/src/features/chrome/toolbar/toolbarModePolicy.ts`
- `scripts/check_mod_contract.sh`
- `codex_tasks/workflow/mod_alias_retire_budget.env`
- `codex_tasks/workflow/mod_alias_retire_plan.md`
- `v10/AI_READ_ME.md`
- `codex_tasks/task_496_alias_runtime_removal.md`

Out of scope:
- toolbar UI layout/styling 변경
- pack manifest schema 필드 추가/삭제
- mod manager/store 구조 변경

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - core/runtime/modding은 features import 금지.
  - feature toolbar는 core selector 결과 소비만 수행.
- Compatibility:
  - base-education pack 기준 toolbar mode -> modId, modId -> toolbar mode 해석은 package-map으로 유지되어야 한다.
  - telemetry event `mod.alias_fallback_hit`는 호출 경로 제거 후 발생하지 않아야 한다.

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - W-GAP-HIGH-06
- Depends on tasks:
  - `task_495`
- Enables tasks:
  - `task_497` alias telemetry code cleanup (planned)
- Parallel group:
  - G-ALIAS-RUNTIME-REMOVE
- Max parallel slots:
  - 6
- Verification stage for this task:
  - `end`

---

## Execution Mode Assessment (Base Required for new specs)

- Touched file count:
  - 11
- Files shared with other PENDING tasks:
  - none
- Cross-module dependency:
  - YES (core selector + adapter + feature toolbar)
- Parallelizable sub-units:
  - 0
- Estimated single-agent duration:
  - `~35min`
- Recommended mode:
  - MANUAL
- Batch-eligible:
  - NO
- Rationale:
  - selector/adapter/toolbar policy를 함께 바꿔야 런타임 해석 일관성이 유지된다.

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

- [x] Applies: YES
- Evidence (real input, spec, or bug report):
  - `task_495`가 retire plan lock을 완료했고 다음 단계로 runtime removal을 정의함.
  - 현재 alias fallback source tag가 budget freeze로 고정되어 있으며, 제거 없이는 zero-state로 수렴 불가.
- Sunset criteria:
  - runtime alias path 제거 + zero budget PASS 시 본 항목 종료.

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

- [x] AC-1: `legacyAlias.ts`가 제거되고 selectors/types에서 `legacy-alias-fallback` 경로가 제거된다.
- [x] AC-2: template pack adapter가 toolbar mode definitions 기반 activation.toolbarModeMap을 항상 생성한다.
- [x] AC-3: `toolbarModePolicy.ts`에서 alias fallback telemetry 분기가 제거된다.
- [x] AC-4: `mod_alias_retire_budget.env`가 zero baseline으로 갱신되고 `check_mod_contract.sh` PASS.
- [x] AC-5: `cd v10 && npm run lint && npm run build` PASS.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path:
     - `rg -n "legacy-alias-fallback|legacy\.toolbar-mode-to-mod-id|legacy\.mod-id-to-toolbar-mode" v10/src`
   - Expected result:
     - 매치 없음.
   - Covers: AC-1

2) Step:
   - Command / click path:
     - `sed -n '1,260p' v10/src/core/runtime/modding/package/templatePackAdapter.ts`
   - Expected result:
     - modeDefinitions에서 toolbarModeMap을 생성하는 로직이 존재.
   - Covers: AC-2

3) Step:
   - Command / click path:
     - `rg -n "emitModAliasFallbackHitAuditEvent|legacy-alias-fallback" v10/src/features/chrome/toolbar/toolbarModePolicy.ts`
   - Expected result:
     - 매치 없음.
   - Covers: AC-3

4) Step:
   - Command / click path:
     - `bash scripts/check_mod_contract.sh && cd v10 && npm run lint && npm run build`
   - Expected result:
     - PASS.
   - Covers: AC-4, AC-5

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - activation map 생성 누락 시 `activeModId -> toolbarMode` 역해석이 draw default로 붕괴할 수 있음.
- Roll-back:
  - selector/adapter 변경 커밋 단위 revert 후 freeze budget non-zero로 복원.

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (or delegated chain approval reference)
  - User quote: "커밋/푸시 이후 이어서 진행."

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `v10/src/core/runtime/modding/package/types.ts`
- `v10/src/core/runtime/modding/package/selectors.ts`
- `v10/src/core/runtime/modding/package/index.ts`
- `v10/src/core/runtime/modding/package/templatePackAdapter.ts`
- `v10/src/core/runtime/modding/package/legacyAlias.ts` (deleted)
- `v10/src/features/chrome/toolbar/toolbarModePolicy.ts`
- `scripts/check_mod_contract.sh`
- `codex_tasks/workflow/mod_alias_retire_budget.env`
- `codex_tasks/workflow/mod_alias_retire_plan.md`
- `v10/AI_READ_ME.md`
- `v10/AI_READ_ME_MAP.md`
- `codex_tasks/task_496_alias_runtime_removal.md`

Commands run (only if user asked or required by spec):
- `rg -n "legacyAlias|legacy-alias-fallback|legacy\\.toolbar-mode-to-mod-id|legacy\\.mod-id-to-toolbar-mode" v10/src -S`
- `bash scripts/check_mod_contract.sh`
- `cd v10 && npm run lint`
- `cd v10 && npm run build`
- `node scripts/gen_ai_read_me_map.mjs`
- `rg -n "toolbarModeMap|legacy-alias-fallback|emitModAliasFallbackHitAuditEvent" v10/src/core/runtime/modding/package/templatePackAdapter.ts v10/src/features/chrome/toolbar/toolbarModePolicy.ts v10/src/core/runtime/modding/package/types.ts v10/src/core/runtime/modding/package/selectors.ts`

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
- AC-1 PASS: `legacyAlias.ts` 삭제 및 `legacy-alias-fallback`/legacy source 문자열 0건 확인.
- AC-2 PASS: adapter가 `toolbar.modeDefinitions`에서 `activation.toolbarModeMap`을 생성하도록 보강.
- AC-3 PASS: `toolbarModePolicy.ts`에서 alias fallback telemetry import/분기 제거.
- AC-4 PASS: alias retire budget을 0으로 전환했고 `check_mod_contract.sh` PASS.
- AC-5 PASS: lint/build PASS.

Notes:
- `check_mod_contract.sh` alias count 파이프를 `rg || true`로 보강하여 0-match 상황에서도 안정 동작하도록 수정.
