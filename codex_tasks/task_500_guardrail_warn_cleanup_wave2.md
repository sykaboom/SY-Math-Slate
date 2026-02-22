# Task 500: Guardrail WARN Cleanup Wave 2 (allowlist-only exposure severity alignment)

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: root/
Date: 2026-02-22

---

## Goal (Base Required)
- What to change:
  - `scripts/scan_guardrails.sh` step [4]에서 allowlist에 포함된 공개 토큰만 발견된 경우를 `WARN`이 아닌 `PASS`(informational)로 정렬한다.
  - 실제 비허용 `NEXT_PUBLIC_` 노출 탐지는 기존처럼 `WARN`으로 유지한다.
- What must NOT change:
  - 비허용 공개 토큰 탐지 완화 금지.
  - 보안 정책/런타임 동작 변경 금지.

---

## Scope (Base Required)

Touched files/directories:
- `scripts/scan_guardrails.sh`
- `v10/AI_READ_ME.md`
- `codex_tasks/task_500_guardrail_warn_cleanup_wave2.md`

Out of scope:
- 앱 코드(`v10/src/**`) 동작 변경
- `check_v10_feature_flag_registry.sh` 경고 정책 변경
- 신규 환경변수/의존성 추가

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - scan script step [4]의 severity 표기만 조정하고, 검출 패턴(`NEXT_PUBLIC_.*(TOKEN|SECRET|KEY)`)과 allowlist 기준은 유지한다.
- Compatibility:
  - 스크립트 exit code 정책 유지(운영 참고 WARN/INFO, 강제 FAIL 아님).

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - W-GUARDRAIL-WARN-02
- Depends on tasks:
  - `task_499`
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
  - 3
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
  - 단일 스크립트 severity 정렬 작업이며 연쇄 파일 충돌 가능성이 없다.

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

- [x] AC-1: `scan_guardrails.sh` step [4]에서 allowlist-only 발견 시 `WARN` 대신 `PASS`로 출력된다.
- [x] AC-2: step [4]에서 비허용 공개 토큰 발견 시에는 기존과 동일하게 `FAIL` 출력이 유지된다.
- [x] AC-3: `bash scripts/scan_guardrails.sh` 실행 시 현재 레포 상태에서 WARN-free 결과(allowlist-only는 PASS)가 나온다.
- [x] AC-4: `bash scripts/check_layer_rules.sh && bash scripts/check_mod_contract.sh && cd v10 && npm run lint && npm run build` 통과.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path:
     - `sed -n '1,260p' scripts/scan_guardrails.sh`
   - Expected result:
     - step [4] 로직이 allowlist-only 경로를 `PASS`로 표기하고 비허용 경로는 `WARN`으로 유지.
   - Covers: AC-1, AC-2

2) Step:
   - Command / click path:
     - `bash scripts/scan_guardrails.sh`
   - Expected result:
     - 현재 레포에서 [4] 항목이 allowlist-only `PASS`로 표시.
   - Covers: AC-3

3) Step:
   - Command / click path:
     - `bash scripts/check_layer_rules.sh && bash scripts/check_mod_contract.sh && cd v10 && npm run lint && npm run build`
   - Expected result:
     - 모두 PASS.
   - Covers: AC-4

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - allowlist-only도 운영자가 경고로 보길 원할 수 있음(가시성 인식 차이).
- Roll-back:
  - `scripts/scan_guardrails.sh`의 step [4] 출력 severity만 revert.

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (or delegated chain approval reference)
  - User quote: "응 진행해."

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `scripts/scan_guardrails.sh`
- `v10/AI_READ_ME.md`
- `codex_tasks/task_500_guardrail_warn_cleanup_wave2.md`

Commands run (only if user asked or required by spec):
- `bash scripts/scan_guardrails.sh`
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

Notes:
- `check_v10_feature_flag_registry.sh`의 unused flag WARN은 본 태스크 범위 밖으로 유지.
- Step [4] severity는 allowlist-only일 때 `PASS`로 정렬되며, 비허용 공개 토큰(`NEXT_PUBLIC_*{KEY|SECRET|TOKEN}` allowlist 외)은 기존처럼 `FAIL` 처리된다.
