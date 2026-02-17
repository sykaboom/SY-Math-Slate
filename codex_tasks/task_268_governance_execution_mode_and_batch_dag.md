# Task 268: 거버넌스 개선 — 실행 모드 판단 필드 + 배치 DAG + Block B 동적 모드

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: root/
Date: 2026-02-17

---

## Goal (Base Required)
- What to change:
  1. 태스크 템플릿에 **Execution Mode Assessment** 필드 추가
     — 스펙 작성 시점에 MANUAL vs DELEGATED 판단 근거를 기술하도록 의무화
  2. 배치 디스패치 플랜 템플릿 신설
     — PENDING 태스크 풀을 DAG로 분석하고 최적 실행 순서를 산출하는 문서 포맷
  3. Block B의 Scheduler plan에 **DYNAMIC 모드** 옵션 추가
     — 고정 슬롯 구성 대신 완료 이벤트 기반 동적 재배정 지원
  4. 플레이북에 **Claude Code 배치 분석자 역할** 명문화
     — PENDING 태스크 재조합/재정렬 시 Claude Code를 사용하는 워크플로우 기술
- What must NOT change:
  - 기존 태스크 스펙의 Base Required 섹션 구조 (추가만, 기존 삭제 없음)
  - 기존 Block B의 FIXED 모드 (하위 호환 유지)
  - AGENTS.md의 권한 체계 및 안전 정책
  - 런타임 코드 (v10/src/) 일체 변경 없음

---

## Scope (Base Required)

Touched files/directories:
- `codex_tasks/_TEMPLATE_task.md` (write)
  — Execution Mode Assessment 필드 추가, Block B에 DYNAMIC 옵션 추가
- `codex_tasks/_PLAYBOOK_subagent_oneclick.md` (write)
  — 배치 디스패치 섹션 추가, Claude Code 역할 명문화
- `codex_tasks/_TEMPLATE_batch_dispatch_plan.md` (create — 신규)
  — 배치 DAG 분석 문서 템플릿
- `AGENTS.md` (write)
  — Claude Code 배치 분석자 역할 참조 추가

Out of scope:
- v10/src/** (코드 변경 없음)
- 기존 COMPLETED 태스크 스펙 소급 수정 없음
- 빌드/린트 게이트 변경 없음

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - 거버넌스 문서 변경만 — 코드 터치 금지
  - 기존 템플릿 구조 하위 호환 유지 (필드 추가만)
- Compatibility:
  - 기존 PENDING/APPROVED 태스크가 새 필드 없이도 유효 (optional로 추가)

---

## DAG / Wave Metadata (Base Required)

- Wave ID: W-GOV
- Depends on tasks: [task_263, task_264] (기존 오케스트레이션 정책 위에 쌓음)
- Enables tasks: [task_266, task_267 및 향후 모든 배치 실행]
- Parallel group: G-governance
- Max parallel slots: 6
- Verification stage for this task: `mid`

---

## 상세 설계

### 변경 1: Execution Mode Assessment (템플릿 추가 필드)

DAG / Wave Metadata 섹션 바로 아래, Block A 위에 삽입:

```markdown
## Execution Mode Assessment (Base Required)

- Touched file count: (숫자)
- Files shared with other PENDING tasks: (파일명 목록 또는 "none")
- Cross-module dependency: YES / NO
- Parallelizable sub-units: (숫자, 0이면 병렬 불가)
- Estimated single-agent duration: (rough estimate)
- Recommended mode: MANUAL | DELEGATED
- Batch-eligible: YES / NO
  - (YES면 다른 태스크와 묶어서 배치 실행 가능)
- Rationale:
  - (1~2문장 판단 근거)
```

**작성 가이드라인 (플레이북에 추가):**

| 조건 | 추천 모드 |
|---|---|
| 터치 파일 ≤ 4, 순차 의존 | MANUAL |
| 터치 파일 ≥ 5, 독립 서브유닛 2+ | DELEGATED |
| 단일 파일 수정 | MANUAL |
| 다른 PENDING 태스크와 파일 충돌 없음 | Batch-eligible: YES |
| 다른 PENDING 태스크와 파일 충돌 있음 | Batch-eligible: YES (순차 제약 명시) |

---

### 변경 2: Block B — DYNAMIC 슬롯 모드

기존 Scheduler plan에 `Slot allocation mode` 필드 추가:

```markdown
- Scheduler plan (required in delegated mode):
    - Slot allocation mode: FIXED | DYNAMIC    ← 신규
      - FIXED: 사전 배정 구성을 웨이브 내내 유지
      - DYNAMIC: 완료 이벤트마다 DAG 재평가 → 최적 태스크 즉시 투입
    - Slot priority rule (DYNAMIC only):       ← 신규
      - (e.g., "critical-path-first", "shortest-job-first", "file-conflict-avoidance")
    - Requested orchestration mode:
      - (기존 유지)
    - Initial slot split:
      - (FIXED: 확정값 / DYNAMIC: 시작 추천값)
    - (... 이하 기존 필드 유지 ...)
```

---

### 변경 3: Batch Dispatch Plan 템플릿 (신규 파일)

`codex_tasks/_TEMPLATE_batch_dispatch_plan.md`:

```markdown
# Batch Dispatch Plan — <date>

Status: DRAFT | APPROVED | EXECUTING | COMPLETED
Analyst: Claude Code
Executor: Codex CLI

---

## 1. Input: PENDING Task Pool

| Task ID | Title | Mode | Batch-eligible | Touched Files | Est. Duration |
|---------|-------|------|----------------|---------------|---------------|
| task_XXX | ... | MANUAL/DELEGATED | YES/NO | file list | ~Xmin |

---

## 2. File Conflict Matrix

          | t_XXX | t_YYY | t_ZZZ |
file_a.ts |   W   |       |   R   |  ← 충돌 없음 (W + R 허용)
file_b.ts |   W   |   W   |       |  ← 충돌! → 순차 강제

Legend: W = write, R = read-only, (빈칸) = 미터치

---

## 3. Dependency DAG

(텍스트 DAG 또는 mermaid 다이어그램)

task_XXX ──→ task_ZZZ (파일 의존)
task_YYY ──→ (독립)

---

## 4. Wave Plan

### Wave 1 (병렬)
- Slots: N executor + M reviewer
- Tasks: [task_XXX, task_YYY]
- File locks: file_a → task_XXX, file_c → task_YYY

### Wave 2 (Wave 1 완료 후)
- Slots: ...
- Tasks: [task_ZZZ]
- Unblocked by: task_XXX (file_a 해방)

---

## 5. Execution Mode Summary

- Total tasks: N
- MANUAL tasks: X (단일 실행)
- DELEGATED tasks: Y (위임 실행)
- Batch waves: Z
- Estimated total slot-hours: ...
- Slot allocation mode: DYNAMIC

---

## 6. Risk Notes

- (파일 충돌, 순서 제약, 예상 병목)

---

## 7. Approval

- [ ] User approved batch plan
- [ ] Codex acknowledged execution order
```

---

### 변경 4: 플레이북 — Claude Code 배치 분석자 역할

`_PLAYBOOK_subagent_oneclick.md` 에 새 섹션 추가:

```markdown
## 11) Batch Analysis Workflow (Claude Code Role)

When multiple PENDING tasks accumulate, the user may invoke Claude Code
as batch dispatch analyst before triggering Codex execution.

Claude Code responsibilities:
1. Read all PENDING task specs
2. Extract Execution Mode Assessment from each
3. Build file conflict matrix across tasks
4. Compute dependency DAG (spec dependencies + file conflicts)
5. Generate Batch Dispatch Plan using _TEMPLATE_batch_dispatch_plan.md
6. Recommend: which tasks run MANUAL, which run DELEGATED, wave order
7. Present plan to user for approval

Trigger phrases:
- "배치 분석해줘"
- "펜딩 태스크 정리해"
- "batch dispatch plan"
- "pending task optimization"

After user approval, Codex CLI receives the approved Batch Dispatch Plan
and executes according to the wave/slot plan.

Note: Claude Code does NOT execute code. It produces the plan only.
Codex CLI is the sole executor.
```

---

### 변경 5: AGENTS.md — 참조 추가

Reference Docs 섹션에 한 줄 추가:

```markdown
- Batch dispatch plan template: `codex_tasks/_TEMPLATE_batch_dispatch_plan.md`
```

---

## Optional Block A — Layout / SVG Gate

- [x] Applies: NO

---

## Optional Block B — Delegated Execution

- [x] Applies: NO

If NO:
- Execution mode: MANUAL

---

## Optional Block C — Hotfix Exception

- [x] Applies: NO

---

## Optional Block D — Speculative Defense Check

- [x] Applies: NO

---

## Optional Block E — Documentation Update Check

- [x] Applies: YES
- If YES:
  - [x] Structure changes:
    - 신규 파일: `codex_tasks/_TEMPLATE_batch_dispatch_plan.md`
    - AI_READ_ME_MAP 업데이트 불필요 (codex_tasks는 맵 범위 밖)
  - [x] Semantic/rule changes:
    - AGENTS.md 참조 문서 목록 확장
    - 플레이북에 Claude Code 역할 신규 섹션

---

## Execution Mode Assessment (이 태스크 자체의 판단)

- Touched file count: 4 (수정 3 + 신규 1)
- Files shared with other PENDING tasks: none
- Cross-module dependency: NO
- Parallelizable sub-units: 0 (모든 변경이 상호 참조)
- Estimated single-agent duration: ~15min
- Recommended mode: MANUAL
- Batch-eligible: NO (거버넌스 변경이라 다른 코드 태스크와 무관)
- Rationale: 거버넌스 문서 4개 수정은 단일 에이전트가 순차 처리하는 게 효율

---

## Acceptance Criteria (Base Required)

- [ ] AC-1: `_TEMPLATE_task.md`에 Execution Mode Assessment 섹션이 존재
- [ ] AC-2: Block B에 `Slot allocation mode: FIXED | DYNAMIC` 필드가 존재
- [ ] AC-3: `_TEMPLATE_batch_dispatch_plan.md` 파일이 생성됨
- [ ] AC-4: `_PLAYBOOK_subagent_oneclick.md`에 Section 11 (Batch Analysis Workflow) 존재
- [ ] AC-5: `AGENTS.md` Reference Docs에 배치 템플릿 참조 존재
- [ ] AC-6: 기존 Base Required 섹션 구조가 보존됨 (하위 호환)
- [ ] AC-7: `VERIFY_STAGE=mid bash scripts/run_repo_verifications.sh` 통과

---

## Manual Verification Steps (Base Required)

1) Step: 템플릿 Execution Mode Assessment 확인
   - Command / click path: `_TEMPLATE_task.md` 에서 "Execution Mode Assessment" 검색
   - Expected result: 필드 8개 (Touched file count ~ Rationale) 존재
   - Covers: AC-1

2) Step: Block B DYNAMIC 모드 확인
   - Command / click path: `_TEMPLATE_task.md` Block B에서 "Slot allocation mode" 검색
   - Expected result: FIXED | DYNAMIC 선택지 및 Slot priority rule 필드 존재
   - Covers: AC-2

3) Step: 배치 템플릿 존재 확인
   - Command / click path: `ls codex_tasks/_TEMPLATE_batch_dispatch_plan.md`
   - Expected result: 파일 존재, 7개 섹션 (Input ~ Approval) 포함
   - Covers: AC-3

4) Step: 플레이북 배치 분석 섹션 확인
   - Command / click path: `_PLAYBOOK_subagent_oneclick.md`에서 "Batch Analysis" 검색
   - Expected result: Section 11 존재, Claude Code 역할 + 트리거 문구 명시
   - Covers: AC-4

5) Step: AGENTS.md 참조 확인
   - Command / click path: `AGENTS.md`에서 "batch_dispatch" 검색
   - Expected result: Reference Docs에 템플릿 경로 존재
   - Covers: AC-5

6) Step: 하위 호환 확인
   - Command / click path: `_TEMPLATE_task.md` 전체 확인
   - Expected result: Goal, Scope, Dependencies, DAG, AC, Verification, Risks 등 기존 섹션 온전
   - Covers: AC-6

7) Step: 검증 스크립트
   - Command / click path: `VERIFY_STAGE=mid bash scripts/run_repo_verifications.sh`
   - Expected result: PASS
   - Covers: AC-7

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - Execution Mode Assessment가 optional이 아닌 Base Required로 추가되면,
    기존 PENDING 태스크들이 필드 누락 상태가 됨 → 소급 적용 비용
  - 해결: 신규 필드는 "Base Required for new specs" 단서를 달아서,
    기존 스펙에는 소급 의무 없음을 명시
- Roll-back:
  - `git revert <commit>` 한 번으로 4개 파일 전부 복원
  - 신규 생성된 `_TEMPLATE_batch_dispatch_plan.md`도 revert에 포함

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `codex_tasks/_TEMPLATE_task.md`
- `codex_tasks/_PLAYBOOK_subagent_oneclick.md`
- `codex_tasks/_TEMPLATE_batch_dispatch_plan.md` (new)
- `AGENTS.md`

Commands run:
- `VERIFY_STAGE=mid bash scripts/run_repo_verifications.sh`

## Gate Results (Codex fills)

- Lint: N/A
- Build: N/A
- Script checks: PASS (`VERIFY_STAGE=mid bash scripts/run_repo_verifications.sh`)

## Failure Classification (Codex fills when any gate fails)

- N/A

Manual verification notes:
- AC-1 PASS: `_TEMPLATE_task.md`에 Execution Mode Assessment 섹션 추가됨.
- AC-2 PASS: Block B에 `Slot allocation mode` + `Slot priority rule` 필드 추가됨.
- AC-3 PASS: `_TEMPLATE_batch_dispatch_plan.md` 신규 생성됨.
- AC-4 PASS: 플레이북에 Batch Analysis Workflow (Claude role) 섹션 추가됨.
- AC-5 PASS: `AGENTS.md` Reference Docs에 배치 템플릿 경로 추가됨.
- AC-6 PASS: 기존 Base Required 섹션 유지(추가만 수행).
- AC-7 PASS: `VERIFY_STAGE=mid bash scripts/run_repo_verifications.sh` 통과.

Notes:
- 이 태스크 자체가 Execution Mode Assessment 필드의 첫 적용 사례
