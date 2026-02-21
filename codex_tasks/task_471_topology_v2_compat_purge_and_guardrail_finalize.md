# Task 471: Topology v2 Compat Purge and Guardrail Finalize

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-21

---

## Goal (Base Required)
- What to change:
  - `core/mod` compat 경로와 구 `features/*` compat 경로를 정리(purge)하여 topology v2를 고정한다.
  - layer/lint/script guardrail을 최종 경로 기준으로 강화한다.
- What must NOT change:
  - 기능/UX 변경 금지

---

## Scope (Base Required)

Touched files/directories:
- 삭제 후보:
  - `v10/src/core/mod/**` (runtime/modding 완전 이관 후)
  - 구 compat root 전부:
    - `v10/src/features/layout/**`
    - `v10/src/features/toolbar/**`
    - `v10/src/features/ui-host/**`
    - `v10/src/features/shortcuts/**`
    - `v10/src/features/theme/**`
    - `v10/src/features/viewer/**`
    - `v10/src/features/sharing/**`
    - `v10/src/features/sync/**`
    - `v10/src/features/canvas/**`
    - `v10/src/features/editor-core/**`
    - `v10/src/features/animation/**`
    - `v10/src/features/input-studio/**`
    - `v10/src/features/community/**`
    - `v10/src/features/moderation/**`
    - `v10/src/features/policy/**`
    - `v10/src/features/extensions/**`
    - `v10/src/features/mod-studio/**`
    - `v10/src/features/observability/**`
    - `v10/src/features/store/**`
    - `v10/src/features/experiments/**`
    - `v10/src/features/hooks/**`
- 규칙/검증:
  - `v10/eslint.config.mjs`
  - `scripts/check_layer_rules.sh`
  - `scripts/check_mod_contract.sh`
  - `scripts/check_core_mod_boundary.sh`
  - 관련 `tests/*.mjs` 경로 assertion
- 문서:
  - `PROJECT_ROADMAP.md`
  - `v10/docs/architecture/ModEngine.md`
  - `v10/docs/architecture/ModularizationDependencyFlow.md`
  - `v10/AI_READ_ME.md`, `v10/AI_READ_ME_MAP.md`

Out of scope:
- 신규 기능 구현

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - purge 전 `rg` 참조 0 증명 필수
  - purge 전 old root 실존 여부 + import 참조 0을 모두 확인
  - 삭제는 단계별 커밋 (한 번에 대량 삭제 금지)
- Compatibility:
  - 최종 완료 시 old path import 0건

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - W471
- Depends on tasks:
  - ['task_470']
- Enables tasks:
  - []
- Parallel group:
  - G-closeout-topology-v2
- Max parallel slots:
  - 6
- Verification stage for this task:
  - end

---

## Execution Mode Assessment (Base Required for new specs)

- Touched file count:
  - 60+
- Files shared with other PENDING tasks:
  - docs + scripts + eslint
- Cross-module dependency:
  - YES
- Parallelizable sub-units:
  - 1
- Estimated single-agent duration:
  - ~60min
- Recommended mode:
  - MANUAL
- Batch-eligible:
  - NO
- Rationale:
  - purge/closeout 성격으로 순차 검증-삭제가 안전.

---

## Optional Block A — Layout / SVG Gate

- [ ] Applies: NO

---

## Optional Block B — Delegated Execution

- [ ] Applies: NO
If NO:
- Execution mode: MANUAL

---

## Optional Block E — Documentation Update Check

- [x] Applies: YES
- If YES:
  - [x] Structure changes:
    - `node scripts/gen_ai_read_me_map.mjs`
  - [x] Semantic/rule changes:
    - `v10/AI_READ_ME.md` / roadmap / architecture docs 동기화

---

## Acceptance Criteria (Base Required)

- [x] AC-1: `@core/mod` 및 구 features root 직접 import가 `v10/src`, `v10/tests`, `scripts` 기준 0건.
- [x] AC-2: compat 폴더 purge 완료 및 참조 0 증명 로그 보유.
- [x] AC-3: lint/build/verify end stage PASS.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path:
     - `rg -n "@core/mod|@features/(layout|toolbar|ui-host|shortcuts|theme|viewer|sharing|sync|canvas|editor-core|animation|input-studio|community|moderation|policy|extensions|mod-studio|observability|store|experiments|hooks)" v10/src v10/tests scripts`
   - Expected result:
     - 0건
   - Covers: AC-1

2) Step:
   - Command / click path:
     - purge 대상별 pre/post 실존 체크:
       - `find v10/src/features -maxdepth 1 -type d | rg "/(layout|toolbar|ui-host|shortcuts|theme|viewer|sharing|sync|canvas|editor-core|animation|input-studio|community|moderation|policy|extensions|mod-studio|observability|store|experiments|hooks)$" || true`
       - `test ! -d v10/src/core/mod`
     - purge 대상별 pre/post import 참조 0 체크:
       - Step 1의 `rg` 재실행
   - Expected result:
     - 모든 대상 참조 0 증명
   - Covers: AC-2

3) Step:
   - Command / click path:
     - `scripts/run_repo_verifications.sh --stage end`
   - Expected result:
     - PASS
   - Covers: AC-3

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - 과삭제 시 빌드/런타임 실패
- Roll-back:
  - purge 커밋 revert 후 compat 복원

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (or delegated chain approval reference)

> Implementation MUST NOT begin until both boxes are checked.

---

## Closeout — Core Modding Purge Side (2026-02-21)

- Changed files:
  - `v10/src/core/runtime/modding/api/index.ts`
  - `v10/src/core/runtime/modding/api/types.ts`
  - `v10/src/core/runtime/modding/host/index.ts`
  - `v10/src/core/runtime/modding/host/inputRoutingBridge.ts`
  - `v10/src/core/runtime/modding/host/manager.ts`
  - `v10/src/core/runtime/modding/host/registry.ts`
  - `v10/src/core/runtime/modding/package/index.ts`
  - `v10/src/core/runtime/modding/package/guards.ts`
  - `v10/src/core/runtime/modding/package/registry.ts`
  - `v10/src/core/runtime/modding/package/selectors.ts`
  - `v10/src/core/runtime/modding/package/templatePackAdapter.ts`
  - `v10/src/core/runtime/modding/package/templatePackAdapter.types.ts`
  - `v10/src/core/runtime/modding/package/types.ts`
  - `v10/src/core/runtime/modding/builtin/index.ts`
  - `v10/src/core/runtime/modding/builtin/canvas.mod.ts`
  - `v10/src/core/runtime/modding/builtin/draw.mod.ts`
  - `v10/src/core/runtime/modding/builtin/lecture.mod.ts`
  - `v10/src/core/runtime/modding/builtin/playback.mod.ts`
  - `v10/tsconfig.json`
  - `scripts/check_mod_contract.sh`
  - `scripts/check_core_mod_boundary.sh`
  - Removed directory: `v10/src/core/mod/**`

- Commands run:
  - `bash scripts/check_mod_contract.sh` -> PASS
  - `bash scripts/check_core_mod_boundary.sh` -> PASS
  - `cd v10 && npm run lint` -> PASS
  - `cd v10 && npm run build` -> PASS

- Manual verification notes:
  - `v10/src/core/mod` removed.
  - Runtime modding shims replaced with local implementation exports.
  - `@core/mod` alias removed from `v10/tsconfig.json`.
  - `check_mod_contract` and `check_core_mod_boundary` updated to final runtime topology (no `core/mod` compat export assumptions).

- Failure classification:
  - Newly introduced blocking failures: none.
  - Pre-existing non-blocking issues observed in this lane: none.

---

## Closeout — Feature Compat Purge + Final Verify (2026-02-21)

- Changed files/directories:
  - Removed legacy feature compat roots:
    - `v10/src/features/{layout,toolbar,ui-host,shortcuts,theme,viewer,sharing,sync,canvas,editor-core,animation,input-studio,community,moderation,policy,extensions,mod-studio,observability,store,experiments,hooks}`
  - Updated docs:
    - `v10/AI_READ_ME.md`
    - `v10/AI_READ_ME_MAP.md`
    - `v10/docs/architecture/ModEngine.md`
    - `v10/docs/architecture/ModularizationDependencyFlow.md`
  - Updated scripts:
    - `scripts/check_mod_contract.sh`
  - Updated freeze baseline touchpoint:
    - `v10/src/features/platform/store/index.ts` (removed unused `useCanvasStore` barrel export to keep baseline count unchanged)

- Commands run:
  - `rg -n "@core/mod|@features/(layout|toolbar|ui-host|shortcuts|theme|viewer|sharing|sync|canvas|editor-core|animation|input-studio|community|moderation|policy|extensions|mod-studio|observability|store|experiments|hooks)" v10/src v10/tests scripts`
  - `find v10/src/features -maxdepth 1 -type d | sort`
  - `bash scripts/check_layer_rules.sh`
  - `bash scripts/check_mod_contract.sh`
  - `bash scripts/check_core_mod_boundary.sh`
  - `cd v10 && npm run lint`
  - `cd v10 && npm run build`
  - `scripts/run_repo_verifications.sh --stage end`
  - `node scripts/gen_ai_read_me_map.mjs`
  - `node scripts/gen_ai_read_me_map.mjs --check`

- Manual verification notes:
  - New taxonomy roots only remain under `v10/src/features/{chrome,editor,collaboration,governance,platform}`.
  - `@core/mod` alias lane is retired and direct usage is 0.
  - End-stage verification suite passed.
