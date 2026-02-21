# Batch Dispatch Plan — 2026-02-21 (Relayout 466~471)

Status: COMPLETED
Analyst: Codex CLI
Executor: Codex CLI

---

## 0. SSOT Alignment (Precondition)

- `PROJECT_ROADMAP.md`에 Phase 10 (`task_466~471`)이 ACTIVE로 반영되어 있어야 실행 시작 가능.
- 본 배치 플랜은 로드맵 SSOT를 확장하는 실행 계획이며, 충돌 시 로드맵 우선.

---

## 1. Input: PENDING Task Pool

| Task ID | Title | Mode | Batch-eligible | Touched Files | Est. Duration |
|---------|-------|------|----------------|---------------|---------------|
| task_466 | runtime modding namespace scaffold | DELEGATED | YES | core/runtime/modding + core/mod + tsconfig | ~35min |
| task_467 | runtime modding import cutover | DELEGATED | YES | src + scripts + eslint + tests | ~45min |
| task_468 | features taxonomy scaffold v2 | DELEGATED | YES | features/{chrome,editor,collaboration,governance,platform} + tsconfig | ~30min |
| task_469 | relayout A (chrome+collaboration) | DELEGATED | NO | features chrome/collaboration clusters + imports | ~90min |
| task_470 | relayout B (editor+governance+platform) | DELEGATED | NO | features editor/governance/platform clusters + imports | ~120min |
| task_471 | topology v2 purge + guardrail finalize | MANUAL | NO | purge + scripts + docs + verify | ~60min |

---

## 2. File Conflict Matrix

```
              | 466 | 467 | 468 | 469 | 470 | 471 |
tsconfig.json |  W  |  W  |  W  |     |     |     |
AI_READ_ME.md |  W  |  W  |  W  |  W  |  W  |  W  |
features/*    |     |  W  |  W  |  W  |  W  |  W  |
core/mod/*    |  W  |  R  |     |     |     |  W  |
scripts/*     |     |  W  |     |     |  W  |  W  |
```

해석:
- 466→467→468은 순차 고정.
- 469/470은 대규모 import graph 충돌 가능성이 높아 순차 권장.
- 471은 closeout/purge이므로 마지막 단독 실행.

---

## 3. Dependency DAG

```
task_466 --> task_467 --> task_468 --> task_469 --> task_470 --> task_471
```

---

## 4. Wave Plan

### Wave 1
- Tasks: [task_466]
- Slots: 2 implementer + 1 verifier

### Wave 2
- Tasks: [task_467]
- Slots: 3 implementer + 1 verifier

### Wave 3
- Tasks: [task_468]
- Slots: 2 implementer + 1 verifier

### Wave 4
- Tasks: [task_469]
- Slots: 3 implementer + 1 verifier

### Wave 5
- Tasks: [task_470]
- Slots: 4 implementer + 1 verifier

### Wave 6
- Tasks: [task_471]
- Slots: 1 implementer + 1 verifier (manual closeout)

---

## 5. Execution Mode Summary

- Total tasks: 6
- MANUAL tasks: 1
- DELEGATED tasks: 5
- Batch waves: 6
- Slot allocation mode: DYNAMIC

---

## 6. Risk Notes

- 핵심 리스크: 대규모 물리 이동(469~470)에서 import 누락 발생 가능.
- 완화:
  - wave 단위로 lint/build 강제
  - compat 경로 유지 후 최종 purge (471)
  - path rewrite 자동화 + reviewer 수동 spot check 병행

---

## 7. Approval

- [x] User approved batch plan
- [x] Codex acknowledged execution order
