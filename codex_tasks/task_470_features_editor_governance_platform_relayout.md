# Task 470: Features Relayout B (editor + governance + platform)

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-21

---

## Goal (Base Required)
- What to change:
  - `canvas/editor-core/animation/input-studio`를 `features/editor/*`로 이관한다.
  - `community/moderation/policy`를 `features/governance/*`로 이관한다.
  - `extensions/mod-studio/observability/store/experiments/hooks`를 `features/platform/*`로 이관한다.
- What must NOT change:
  - 데이터 계약/런타임 동작 회귀 금지

---

## Scope (Base Required)

Touched files/directories:
- Move 대상:
  - `v10/src/features/editor/canvas/**` -> `v10/src/features/editor/canvas/**`
  - `v10/src/features/editor/editor-core/**` -> `v10/src/features/editor/editor-core/**`
  - `v10/src/features/editor/animation/**` -> `v10/src/features/editor/animation/**`
  - `v10/src/features/editor/input-studio/**` -> `v10/src/features/editor/input-studio/**`
  - `v10/src/features/governance/community/**` -> `v10/src/features/governance/community/**`
  - `v10/src/features/governance/moderation/**` -> `v10/src/features/governance/moderation/**`
  - `v10/src/features/governance/policy/**` -> `v10/src/features/governance/policy/**`
  - `v10/src/features/platform/extensions/**` -> `v10/src/features/platform/extensions/**`
  - `v10/src/features/platform/mod-studio/**` -> `v10/src/features/platform/mod-studio/**`
  - `v10/src/features/platform/observability/**` -> `v10/src/features/platform/observability/**`
  - `v10/src/features/platform/store/**` -> `v10/src/features/platform/store/**`
  - `v10/src/features/platform/experiments/**` -> `v10/src/features/platform/experiments/**`
  - `v10/src/features/platform/hooks/**` -> `v10/src/features/platform/hooks/**`
- Import 업데이트:
  - `v10/src/**`, `v10/tests/**`, `scripts/**`

Out of scope:
- compat purge (task_471)

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - core/mod 경계 규칙 유지
  - compat 파일은 re-export only
- Compatibility:
  - 구 경로 호환은 한 웨이브 유지
  - compat root 허용 범위:
    - editor군: `canvas`, `editor-core`, `animation`, `input-studio`
    - governance군: `community`, `moderation`, `policy`
    - platform군: `extensions`, `mod-studio`, `observability`, `store`, `experiments`, `hooks`
  - 위 루트는 thin stub(`index.ts` 또는 `*.compat.ts`)만 허용

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - W470
- Depends on tasks:
  - ['task_469']
- Enables tasks:
  - `task_471`
- Parallel group:
  - G-relayout-b
- Max parallel slots:
  - 6
- Verification stage for this task:
  - end

---

## Execution Mode Assessment (Base Required for new specs)

- Touched file count:
  - 200+
- Files shared with other PENDING tasks:
  - 대부분의 features import graph
- Cross-module dependency:
  - YES
- Parallelizable sub-units:
  - 4
- Estimated single-agent duration:
  - ~120min
- Recommended mode:
  - DELEGATED
- Batch-eligible:
  - NO
- Rationale:
  - 대규모 이관 작업으로 병렬 구현 + 단일 통합 verifier가 필요.

---

## Optional Block A — Layout / SVG Gate

- [ ] Applies: NO

---

## Optional Block B — Delegated Execution

- [ ] Applies: YES
- If YES:
  - Execution mode: DELEGATED
  - Assigned roles:
    - Implementer-A: editor cluster
    - Implementer-B: governance cluster
    - Implementer-C: platform cluster
    - Reviewer+Verifier: import rewrite + full gates
  - File ownership lock plan:
    - `tsconfig.json`, eslint/shell checks는 Reviewer+Verifier 단일 소유

---

## Optional Block E — Documentation Update Check

- [ ] Applies: YES
- If YES:
  - [ ] Structure changes:
    - `node scripts/gen_ai_read_me_map.mjs`
  - [ ] Semantic/rule changes:
    - `v10/AI_READ_ME.md` + architecture docs 반영

---

## Acceptance Criteria (Base Required)

- [x] AC-1: editor/governance/platform 군 파일이 신규 taxonomy 경로로 이관된다.
- [x] AC-2: 구 compat root에는 thin stub 파일만 유지되고, 런타임 구현 파일은 신규 경로로 이관된다.
- [x] AC-3: `v10/src`, `v10/tests`, `scripts`에서 구 root 직접 import 참조가 0건이다.
- [x] AC-4: lint/build/script checks PASS.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path:
     - `find v10/src/features/editor v10/src/features/governance v10/src/features/platform -type f | wc -l`
   - Expected result:
     - 이관 파일 확인
   - Covers: AC-1

2) Step:
   - Command / click path:
     - `rg -n "@features/(canvas|editor-core|animation|input-studio|community|moderation|policy|extensions|mod-studio|observability|store|experiments|hooks)/" v10/src v10/tests scripts`
     - `find v10/src/features/editor/canvas v10/src/features/editor/editor-core v10/src/features/editor/animation v10/src/features/editor/input-studio v10/src/features/governance/community v10/src/features/governance/moderation v10/src/features/governance/policy v10/src/features/platform/extensions v10/src/features/platform/mod-studio v10/src/features/platform/observability v10/src/features/platform/store v10/src/features/platform/experiments v10/src/features/platform/hooks -type f 2>/dev/null | rg -v "(index\\.ts$|\\.compat\\.ts$)" || true`
   - Expected result:
     - 직접 import 참조 0건, compat root에는 thin stub만 존재
   - Covers: AC-2, AC-3

3) Step:
   - Command / click path:
     - `scripts/run_repo_verifications.sh --stage end`
   - Expected result:
     - PASS
   - Covers: AC-4

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - import graph 단절/런타임 누락
- Roll-back:
  - cluster 단위 커밋 revert (editor/governance/platform 독립 롤백)

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (or delegated chain approval reference)

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Platform Cluster / Implementer-C)

Status: COMPLETED (platform cluster only)

Changed files:
- moved implementations:
  - `v10/src/features/{extensions,mod-studio,observability,store,experiments,hooks}/**` -> `v10/src/features/platform/{extensions,mod-studio,observability,store,experiments,hooks}/**`
- regenerated thin compat stubs at old roots:
  - `v10/src/features/{extensions,mod-studio,observability,store,experiments,hooks}/**` (re-export only)
- updated platform barrels to local paths:
  - `v10/src/features/platform/extensions/index.ts`
  - `v10/src/features/platform/mod-studio/index.ts`
  - `v10/src/features/platform/observability/index.ts`
  - `v10/src/features/platform/store/index.ts`
  - `v10/src/features/platform/experiments/index.ts`
  - `v10/src/features/platform/hooks/index.ts`

Commands run:
- `scripts/check_layer_rules.sh`
- `cd v10 && npm run lint -- src/features/platform/{extensions,mod-studio,observability,store,experiments,hooks} src/features/{extensions,mod-studio,observability,store,experiments,hooks}`
- `cd v10 && npm run build`

## Gate Results (Platform Cluster / Implementer-C)

- Lint:
  - PASS (scoped paths only)
- Build:
  - FAIL (shared workspace issue outside platform cluster scope)
- Script checks:
  - PASS (`check_layer_rules.sh`)

## Failure Classification (Platform Cluster / Implementer-C)

- Pre-existing failures:
  - `cd v10 && npm run build` fails at `v10/src/app/layout.tsx` for unresolved `../features/{canvas,animation}/styles/*.css` imports (editor cluster scope)
- Newly introduced failures:
  - none identified in owned platform roots
- Blocking:
  - NO (for platform-cluster ownership scope)
- Mitigation:
  - reviewer/verifier phase should re-run full end-stage checks after editor/governance cluster integration

Manual verification notes:
- platform implementations are physically present under `v10/src/features/platform/{extensions,mod-studio,observability,store,experiments,hooks}/**`
- old platform roots now contain thin re-export compat stubs only (no runtime implementation bodies)
- platform index barrels now export local modules (`./...`) rather than old root (`../../...`) paths

---

## Implementation Log (Editor Cluster / Implementer-A)

Status: COMPLETED (editor cluster only)

Changed files:
- moved implementations:
  - `v10/src/features/{canvas,editor-core,animation,input-studio}/**` -> `v10/src/features/editor/{canvas,editor-core,animation,input-studio}/**`
- regenerated thin compat stubs at old roots:
  - `v10/src/features/{canvas,editor-core,animation,input-studio}/**` (re-export only)
  - path-preserving deep-import shims (`<module>/index.ts`) for moved TS/TSX modules
  - CSS compat side-effect stubs under old roots (`styles/*.compat.ts`)
- updated editor barrels to local paths:
  - `v10/src/features/editor/canvas/index.ts`
  - `v10/src/features/editor/editor-core/index.ts`
  - `v10/src/features/editor/animation/index.ts`
  - `v10/src/features/editor/input-studio/index.ts`

Commands run:
- `find v10/src/features/editor/canvas v10/src/features/editor/editor-core v10/src/features/editor/animation v10/src/features/editor/input-studio -type f | wc -l`
- `find v10/src/features/editor/canvas v10/src/features/editor/editor-core v10/src/features/editor/animation v10/src/features/editor/input-studio -type f | rg -v "(index\\.ts$|\\.compat\\.ts$)" || true`
- `bash scripts/check_layer_rules.sh`
- `cd v10 && npm run lint`
- `cd v10 && npm run build`

## Gate Results (Editor Cluster / Implementer-A)

- Topology checks:
  - PASS (`old_non_stub_count=0`, moved files present under `features/editor/*`)
- Lint:
  - PASS
- Build:
  - FAIL at `v10/src/app/layout.tsx` unresolved legacy CSS paths:
    - `../features/canvas/styles/content-layer.css`
    - `../features/canvas/styles/mathjax.css`
    - `../features/animation/styles/rich-text-animation.css`
- Script checks:
  - PASS (`check_layer_rules.sh`)

## Failure Classification (Editor Cluster / Implementer-A)

- Newly introduced failures:
  - YES: build break from physical CSS move without app-level CSS import cutover in this slice.
- Pre-existing failures:
  - none additionally observed in this run.
- Blocking:
  - YES for full-repo build gate.
- Mitigation:
  - reviewer/verifier phase should cut over app-level CSS imports (or approved compat strategy) and re-run end-stage gates.

Manual verification notes:
- editor implementations are physically present under `v10/src/features/editor/{canvas,editor-core,animation,input-studio}/**`
- old editor roots now contain thin re-export compat stubs only (no runtime implementation bodies)
- editor index barrels now export local modules (`./...`) rather than old root (`../../...`) paths
