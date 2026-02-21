# Task 463: Enforcement and Guardrail Path Cutover

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-21

---

## Goal (Base Required)
- What to change:
  - 새 폴더 체계를 기준으로 eslint import 제한과 검증 스크립트 경로 규칙을 업데이트한다.
- What must NOT change:
  - 런타임 비즈니스 로직 변경 금지.

---

## Scope (Base Required)

Touched files/directories:
- `v10/eslint.config.mjs`
- `scripts/check_layer_rules.sh`
- `scripts/check_mod_contract.sh`
- `scripts/check_toolbar_contract.sh` (경로 참조 시)
- `scripts/scan_guardrails.sh` (경로 참조 시)
- `v10/AI_READ_ME.md`
- `v10/docs/architecture/ModEngine.md`

Out of scope:
- 기능 코드(components/store/commands) 변경
- legacy 경로 물리 삭제
- strict 모드 always-on 전환 (task_465 closeout에서 수행)

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO (default)
- Boundary rules:
  - 경로 규칙은 “public API import only” 원칙 강화.
  - `features -> core internal deep path` 금지 규칙을 명시.
- Compatibility:
  - 기존 CI/훅 실행 체인은 유지되어야 한다.

Transition policy (mandatory):
- R3A (this task): `compat allowlist mode`를 기본값으로 도입한다.
  - 신규 규칙을 적용하되 승인된 호환 경로만 allowlist로 한시 허용한다.
- R3B (deferred): strict mode는 옵션 플래그로만 제공하고 기본 OFF 유지한다.
  - strict always-on 활성화는 `task_465` closeout에서 수행한다.

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - R3
- Depends on tasks:
  - ['task_462']
- Enables tasks:
  - ['task_464']
- Parallel group:
  - G-GUARDRAIL
- Max parallel slots:
  - 6 (default)
- Verification stage for this task:
  - end

---

## Execution Mode Assessment (Base Required for new specs)

- Touched file count:
  - 6 to 10
- Files shared with other PENDING tasks:
  - scripts + eslint + docs
- Cross-module dependency:
  - YES
- Parallelizable sub-units:
  - 2
- Estimated single-agent duration:
  - ~40min
- Recommended mode:
  - DELEGATED
- Batch-eligible:
  - NO (R3 단독 선행)
- Rationale:
  - 규칙 파일은 파급이 크므로 리뷰-우선 병렬 후 단일 병합이 필요.

---

## Optional Block A — Layout / SVG Gate

- [ ] Applies: NO

---

## Optional Block B — Delegated Execution

- [ ] Applies: YES
- Execution mode: DELEGATED
- Delegation chain scope:
  - `task_463` only
- Assigned roles:
  - Spec-Writer: Codex
  - Spec-Reviewer: Codex
  - Implementer-A: subagent
  - Implementer-B: subagent
  - Implementer-C: subagent
  - Reviewer+Verifier: subagent
- File ownership lock plan:
  - one file, one implementer
- Parallel slot plan:
  - up to 6 active slots

---

## Optional Block C — Hotfix Exception

- [ ] Applies: NO

---

## Optional Block D — Speculative Defense Check

- [ ] Applies: NO

---

## Optional Block E — Documentation Update Check

- [ ] Applies: YES
- If YES:
  - [ ] Structure changes:
    - Run `node scripts/gen_ai_read_me_map.mjs`
    - Verify `v10/AI_READ_ME_MAP.md`
  - [ ] Semantic/rule changes:
    - Verify `v10/AI_READ_ME.md`

---

## Acceptance Criteria (Base Required)

- [ ] AC-1: compat allowlist mode에서 eslint + shell guard가 신규 경로를 기준으로 PASS/FAIL을 정확히 판단한다.
- [ ] AC-2: allowlist는 명시적/협소 범위로 관리되고 문서(`ModEngine.md` + `AI_READ_ME.md`)와 일치한다.
- [ ] AC-3: strict mode 점검 경로(옵션 플래그)가 존재하며, 위반을 명확히 보고한다.
- [ ] AC-4: repo verify 체인이 실패 없이 완료된다.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path:
     - `bash scripts/check_layer_rules.sh && bash scripts/check_mod_contract.sh`
   - Expected result:
     - compat mode 기준 규칙 체크 PASS.
   - Covers: AC-1

2) Step:
   - Command / click path:
     - `bash scripts/scan_guardrails.sh --strict`
   - Expected result:
     - strict 점검 결과가 명확히 출력되고(WARN 포함 위반 시 실패), compat 대비 차이가 확인된다.
   - Covers: AC-3

3) Step:
   - Command / click path:
     - `cd v10 && npm run lint`
   - Expected result:
     - no-restricted-imports 등 규칙 정상 동작.
   - Covers: AC-2

4) Step:
   - Command / click path:
     - `scripts/run_repo_verifications.sh`
   - Expected result:
     - 전체 verify PASS.
   - Covers: AC-4

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - 규칙 과잉 강화로 정상 경로까지 차단될 수 있음.
- Roll-back:
  - R3 커밋 revert 후 규칙 범위 재조정 태스크 분리.

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (or delegated chain approval reference)

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `v10/eslint.config.mjs`
- `scripts/check_layer_rules.sh`
- `scripts/check_mod_contract.sh` (verified; no structural edit required)
- `scripts/scan_guardrails.sh` (strict path adopted in verification)
- path-cutover verification scripts:
  - `scripts/check_v10_migration_baseline.sh`
  - `scripts/check_core_mod_boundary.sh`
  - `scripts/check_v10_module_theme_scope.sh`
  - `scripts/check_v10_experiment_registry.sh`
  - `scripts/check_v10_marketplace_readiness.sh`
  - `scripts/check_v10_modding_sdk_scaffold.sh`
  - `scripts/check_template_pack_contract.mjs`
  - `scripts/check_v10_viewport_contract.sh`
- `v10/AI_READ_ME.md`
- `v10/docs/architecture/ModEngine.md`

Commands run (only if user asked or required by spec):
- `bash scripts/check_layer_rules.sh`
- `bash scripts/check_mod_contract.sh`
- `bash scripts/scan_guardrails.sh --strict`
- `cd v10 && npm run lint`
- `scripts/run_repo_verifications.sh --stage end`

## Gate Results (Codex fills)

- Lint:
  - PASS
- Build:
  - PASS
- Script checks:
  - PASS

## Failure Classification (Codex fills when any gate fails)

- Pre-existing failures:
  - `scripts/run_repo_verifications.sh --stage end` initially failed due tests/scripts hardcoding deleted legacy paths.
- Newly introduced failures:
  - None after in-wave path cutover.
- Blocking:
  - NO
- Mitigation:
  - Updated all affected verification scripts/tests to new namespace paths (`foundation/runtime/pipelines/ui/theming/security`, `mod/packs|bridge|schema`) and re-ran full verify to PASS.
