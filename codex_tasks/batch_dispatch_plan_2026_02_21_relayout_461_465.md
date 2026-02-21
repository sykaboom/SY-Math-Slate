# Batch Dispatch Plan — 2026-02-21 (Core/Mod Relayout 461~465)

Status: COMPLETED
Owner: Codex
Scope: v10/

---

## Program Intent
`core` 네임스페이스 재배치 + `src/mod` 카탈로그 축 정리 + 강제 규칙 전환 + import 컷오버 + legacy 제거를 순차 완료한다.

---

## Numbering SSOT
- R1: `task_461` (scaffold + compat shims)
- R2: `task_462` (mod packs/bridge/schema cutover)
- R3: `task_463` (enforcement/scripts cutover)
- R4: `task_464` (features import cutover)
- R5: `task_465` (legacy purge + final closeout)

---

## DAG
- `461 -> 462 -> 463 -> 464 -> 465`
- 태스크 간 병렬 실행 없음(각 단계 산출물을 다음 단계가 전제로 사용)
- R3는 compat allowlist mode로 선적용, strict always-on은 R5 closeout에서 활성화
- R4는 내부적으로 `R4A(순차) -> R4B(그룹 병렬) -> R4C(순차)`로 진행

---

## Gate Policy
- 각 태스크 종료 시:
  - `bash scripts/check_layer_rules.sh`
  - `bash scripts/check_mod_contract.sh`
  - `(cd v10 && npm run lint && npm run build)`
- R5 종료 시: `scripts/run_repo_verifications.sh` 포함

---

## Critical Risk Lanes
1. shim 누락으로 인한 import break
2. mod bridge miswire로 package activation 실패
3. 규칙 강화 후 정상 코드 false positive
4. 대량 import 수정 시 hotspot 충돌
5. legacy 과삭제

---

## Exit Criteria
- 기존 경로 의존이 compat 또는 완전 제거 상태로 정리됨
- docs/roadmap/AI_READ_ME가 신규 구조를 SSOT로 명시
- 전체 verify 체인 PASS

---

## Execution Result
- `R1 -> R2 -> R3 -> R4 -> R5` 순차 완료.
- 신규 네임스페이스(`foundation/runtime/domain/pipelines/ui/theming/security`) 활성화 완료.
- `src/mod`는 `packs/bridge/schema` 축으로 전환 완료.
- legacy core/mod 경로 purge 완료.
- 최종 게이트:
  - `check_layer_rules` PASS
  - `check_mod_contract` PASS
  - `v10 lint/build` PASS
  - `run_repo_verifications --stage end` PASS
