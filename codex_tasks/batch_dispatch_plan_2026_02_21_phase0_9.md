# Batch Dispatch Plan — 2026-02-21 (HQ Chain 361~400)

Status: DRAFT
Owner: Codex
Scope: v10/

---

## Program Intent
실행 가능한 고품질 체인으로 Phase 0~9를 완주한다.
종료 조건: 일반 확장은 UI/feature/mod package 레이어에서 해결되고, layout/store 내부 직접변이는 금지된다.

---

## Numbering SSOT
- Phase 0: task_361 ~ task_364
- Phase 1: task_365 ~ task_368
- Phase 2: task_369 ~ task_372
- Phase 3: task_373 ~ task_376
- Phase 4: task_377 ~ task_380
- Phase 5: task_381 ~ task_384
- Phase 6: task_385 ~ task_388
- Phase 7: task_389 ~ task_392
- Phase 8: task_393 ~ task_396
- Phase 9: task_397 ~ task_400

---

## Wave Topology (Parallel-Optimized)
- Wave P0: 361 -> (362 || 363) -> 364
- Wave P1: 365 -> (366 || 367) -> 368
- Wave P2: 369 -> (370 || 371) -> 372
- Wave P3: 373 -> (374 || 375) -> 376
- Wave P4: 377 -> (378 || 379) -> 380
- Wave P5: 381 -> (382 || 383) -> 384
- Wave P6: 385 -> (386 || 387) -> 388
- Wave P7: 389 -> (390 || 391) -> 392
- Wave P8: 393 -> (394 || 395) -> 396
- Wave P9: 397 -> (398 || 399) -> 400

---

## Concurrency Rules
- Max slots: 6
- One-file-one-owner lock strict
- Shared hotspots serialized: AppLayout, FloatingToolbar, panelAdapters
- Closeout tasks are non-parallel finalize tasks

---

## Gate Policy
- Mid gate:
  - bash scripts/check_layer_rules.sh
  - bash scripts/check_mod_contract.sh
  - cd v10 && npm run lint
- End gate:
  - Mid gate plus cd v10 && npm run build

---

## Critical Risk Lanes
1. 도킹/스냅/인셋 회귀 (P1/P4)
2. 입력 라우팅 우회 (P2)
3. dual-axis retire 누락 (P3)
4. 공유 정책과 접근 정책 불일치 (P6)
5. AI 승인 큐 병목 및 deadlock (P7)

---

## Final Exit Criteria
- task_400 완료 시:
  - 모드 확장은 mod package 중심 경로로 가능
  - layout/store 직접변이 우회 경로 없음
  - 운영 runbook/rollback/drill/certification 문서 완료
