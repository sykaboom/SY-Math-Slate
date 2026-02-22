# Task 501: Feature Flag Registry WARN Cleanup (runtime+test scope alignment)

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: root/
Date: 2026-02-22

---

## Goal (Base Required)
- What to change:
  - `check_v10_feature_flag_registry.sh`의 사용 플래그 수집 범위를 `v10/src` 한정에서 `v10/src + v10/tests + scripts/check_v10_phase5_flag_cutover.sh`로 확장해 실제 운영 사용 플래그를 반영한다.
  - 실제로 미사용인 레지스트리 엔트리(`NEXT_PUBLIC_CORE_MANIFEST_SHADOW`)를 정리한다.
- What must NOT change:
  - `check_v10_phase5_flag_cutover.sh`가 요구하는 Phase5 플래그 등록 계약은 유지한다.
  - 앱 런타임 동작/정책/레이아웃/모드 로직 변경 금지.

---

## Scope (Base Required)

Touched files/directories:
- `scripts/check_v10_feature_flag_registry.sh`
- `codex_tasks/workflow/feature_flag_registry.env`
- `v10/AI_READ_ME.md`
- `codex_tasks/task_501_feature_flag_registry_warn_cleanup.md`

Out of scope:
- `v10/src/**` 코드 변경
- phase5 cutover 플래그 계약 변경
- 신규 의존성 추가

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - 플래그 레지스트리 체크는 여전히 `NEXT_PUBLIC_` 공개 플래그만 대상으로 유지.
  - Phase5 플래그는 `check_v10_phase5_flag_cutover.sh` 요구사항과 충돌하지 않게 유지.
- Compatibility:
  - 기존 훅/검증 스크립트 체인(pre-commit/pre-push)의 PASS 동작을 유지해야 한다.

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - W-GUARDRAIL-WARN-03
- Depends on tasks:
  - `task_500`
- Enables tasks:
  - `[]`
- Parallel group:
  - G-GUARDRAIL-WARN
- Max parallel slots:
  - 6
- Verification stage for this task:
  - `end`

---

## Execution Mode Assessment (Base Required for new specs)

- Touched file count:
  - 4
- Files shared with other PENDING tasks:
  - none
- Cross-module dependency:
  - NO
- Parallelizable sub-units:
  - 0
- Estimated single-agent duration:
  - `~15min`
- Recommended mode:
  - MANUAL
- Batch-eligible:
  - NO
- Rationale:
  - 루트 운영 스크립트와 레지스트리 파일 정합성 단일 작업으로, 병렬 분할 이득이 없다.

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
- [ ] Structure changes (file/folder add/move/delete):
  - N/A
- [x] Semantic/rule changes:
  - Verify `v10/AI_READ_ME.md` update if needed

---

## Acceptance Criteria (Base Required)

- [x] AC-1: `scripts/check_v10_feature_flag_registry.sh`가 `v10/src` 외 `v10/tests` 및 phase5 cutover 스크립트 사용 플래그를 사용 목록으로 인식한다.
- [x] AC-2: `codex_tasks/workflow/feature_flag_registry.env`에서 `NEXT_PUBLIC_CORE_MANIFEST_SHADOW`가 제거된다.
- [x] AC-3: `bash scripts/check_v10_feature_flag_registry.sh` 실행 시 unused flag WARN이 사라진다.
- [x] AC-4: `bash scripts/check_v10_phase5_flag_cutover.sh` PASS 유지.
- [x] AC-5: `bash scripts/check_layer_rules.sh && bash scripts/check_mod_contract.sh && cd v10 && npm run lint && npm run build` PASS.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path:
     - `sed -n '1,260p' scripts/check_v10_feature_flag_registry.sh`
   - Expected result:
     - used_flags 수집 범위에 `v10/tests` 및 `scripts/check_v10_phase5_flag_cutover.sh`가 포함되어 있다.
   - Covers: AC-1

2) Step:
   - Command / click path:
     - `rg -n "NEXT_PUBLIC_CORE_MANIFEST_SHADOW" codex_tasks/workflow/feature_flag_registry.env`
   - Expected result:
     - 매치 없음.
   - Covers: AC-2

3) Step:
   - Command / click path:
     - `bash scripts/check_v10_feature_flag_registry.sh`
   - Expected result:
     - WARN 없이 PASS.
   - Covers: AC-3

4) Step:
   - Command / click path:
     - `bash scripts/check_v10_phase5_flag_cutover.sh`
   - Expected result:
     - PASS.
   - Covers: AC-4

5) Step:
   - Command / click path:
     - `bash scripts/check_layer_rules.sh && bash scripts/check_mod_contract.sh && cd v10 && npm run lint && npm run build`
   - Expected result:
     - 모두 PASS.
   - Covers: AC-5

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - 체크 범위 확장 시 레지스트리 등록 누락이 새로 드러날 수 있음.
- Roll-back:
  - `scripts/check_v10_feature_flag_registry.sh` 변경 revert + registry 엔트리 복구.

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (or delegated chain approval reference)
  - User quote: "1번 진행."

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `scripts/check_v10_feature_flag_registry.sh`
- `codex_tasks/workflow/feature_flag_registry.env`
- `v10/AI_READ_ME.md`
- `codex_tasks/task_501_feature_flag_registry_warn_cleanup.md`

Commands run (only if user asked or required by spec):
- `bash scripts/check_v10_feature_flag_registry.sh`
- `bash scripts/check_v10_phase5_flag_cutover.sh`
- `bash scripts/check_layer_rules.sh`
- `bash scripts/check_mod_contract.sh`
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
- AC-1: PASS
- AC-2: PASS
- AC-3: PASS
- AC-4: PASS
- AC-5: PASS

Notes:
- feature flag registry는 운영상 `src-only`가 아니라 `src + tests + phase5 gate script` 기준으로 검증되도록 정렬.
