# Task 498: Toolbar Surface Uniqueness Guardrail Rewire (no-skip)

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: root/
Date: 2026-02-22

---

## Goal (Base Required)
- What to change:
  - `check_toolbar_surface_uniqueness.mjs`를 구 catalog 경로 의존에서 pack-first 경로 기준 검증으로 전환한다.
  - 기본 실행 시 SKIP이 아니라 PASS/FAIL을 반환하도록 가드레일을 복구한다.
- What must NOT change:
  - toolbar 런타임 동작/레이아웃/UI 변경 금지.
  - 기존 self-test duplicate 플래그 계약(`--self-test-duplicate`) 유지.

---

## Scope (Base Required)

Touched files/directories:
- `scripts/check_toolbar_surface_uniqueness.mjs`
- `codex_tasks/task_498_toolbar_uniqueness_guardrail_rewire.md`

Out of scope:
- toolbar source 파일 변경
- scan guardrails 실행 흐름 변경

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - 검증 스크립트는 read-only 검사만 수행.
  - 실행 결과는 PASS/FAIL/explicit-skip 중 PASS/FAIL 중심으로 수렴.
- Compatibility:
  - `node scripts/check_toolbar_surface_uniqueness.mjs --self-test-duplicate`는 의도적 FAIL을 유지.

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - W-GAP-MEDIUM-08
- Depends on tasks:
  - `task_497`
- Enables tasks:
  - `task_499` toolbar guardrail closeout (planned)
- Parallel group:
  - G-TOOLBAR-GUARDRAIL-REWIRE
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
  - NO (script only)
- Parallelizable sub-units:
  - 0
- Estimated single-agent duration:
  - `~15min`
- Recommended mode:
  - MANUAL
- Batch-eligible:
  - NO
- Rationale:
  - 단일 guardrail 스크립트 수정/검증이므로 직렬이 가장 안전.

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

- [ ] Applies: NO

---

## Acceptance Criteria (Base Required)

- [x] AC-1: 기본 실행(`node scripts/check_toolbar_surface_uniqueness.mjs`)이 SKIP 없이 PASS 또는 FAIL을 반환한다.
- [x] AC-2: `--self-test-duplicate` 실행 시 의도된 FAIL이 유지된다.
- [x] AC-3: `bash scripts/check_toolbar_contract.sh` + `bash scripts/check_mod_contract.sh` + `cd v10 && npm run lint && npm run build` PASS.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path:
     - `node scripts/check_toolbar_surface_uniqueness.mjs`
   - Expected result:
     - `SKIP`이 아닌 `PASS` 출력.
   - Covers: AC-1

2) Step:
   - Command / click path:
     - `node scripts/check_toolbar_surface_uniqueness.mjs --self-test-duplicate`
   - Expected result:
     - 의도적 FAIL 및 non-zero exit.
   - Covers: AC-2

3) Step:
   - Command / click path:
     - `bash scripts/check_toolbar_contract.sh && bash scripts/check_mod_contract.sh && cd v10 && npm run lint && npm run build`
   - Expected result:
     - PASS.
   - Covers: AC-3

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - 스크립트가 최신 구조를 과하게 가정하면 false FAIL 가능.
- Roll-back:
  - 스크립트 단일 파일 revert.

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
- `scripts/check_toolbar_surface_uniqueness.mjs`
- `codex_tasks/task_498_toolbar_uniqueness_guardrail_rewire.md`

Commands run (only if user asked or required by spec):
- `node scripts/check_toolbar_surface_uniqueness.mjs`
- `node scripts/check_toolbar_surface_uniqueness.mjs --self-test-duplicate; echo exit:$?`
- `bash scripts/check_toolbar_contract.sh && bash scripts/check_mod_contract.sh && cd v10 && npm run lint && npm run build`

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
- AC-1 PASS: 기본 실행 시 `PASS (75 mode/viewport/action assignments...)` 출력, SKIP 제거 확인.
- AC-2 PASS: `--self-test-duplicate` 실행 시 의도적 FAIL + exit code 1 확인.
- AC-3 PASS: toolbar contract + mod contract + lint + build 모두 PASS.

Notes:
- 스크립트는 구 `toolbarSurfacePolicy.ts`/`toolbarActionSelectors.ts` 의존을 제거하고 `mod/packs/base-education/toolbarBaseDefinition.ts` 기반 검증으로 전환됨.
