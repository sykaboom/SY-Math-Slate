# Task 108: Workflow Docs Slimming and Alignment

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: root/
Date: 2026-02-14

---

## Goal
- What to change:
  - Always-on governance docs를 슬림화하여 상시 프롬프트 부담을 줄인다.
  - `AGENTS.md`, `GEMINI_CODEX_PROTOCOL.md`, `v10/AI_READ_ME.md` 간 SSOT/read-order 서술 충돌을 제거한다.
  - 서브에이전트 병렬 실행 정의를 `max 6` 기준으로 명확화하고, 동일 역할 중복 호출 허용 규칙(파일 소유권 잠금)을 문서화한다.
  - `codex_tasks/_TEMPLATE_task.md`를 base + optional block 방식으로 모듈화한다.
  - `README.md`/`TOOLS.md`의 운영 안내 중복을 정리한다.
  - `v10/AI_READ_ME_MAP.md` freshness를 생성 스크립트 기준으로 최신화한다.
- What must NOT change:
  - 프로덕션 코드(`v10/src/**`) 변경 금지.
  - 신규 dependency 추가 금지.
  - 기존 훅 실행(`pre-commit`/`pre-push`) 동작 계약 변경 금지.

---

## Scope (Codex must touch ONLY these)

Touched files/directories:
- `codex_tasks/task_108_workflow_docs_slimming_and_alignment.md`
- `AGENTS.md`
- `GEMINI_CODEX_PROTOCOL.md`
- `v10/AI_READ_ME.md`
- `v10/AI_READ_ME_MAP.md`
- `codex_tasks/_PLAYBOOK_subagent_oneclick.md`
- `codex_tasks/_TEMPLATE_task.md`
- `README.md`
- `TOOLS.md`

Out of scope:
- `v10/src/**`
- `.githooks/**`
- `scripts/**`
- `design_drafts/**`
- `codex_tasks/hotfix/**`

---

## Design Artifacts (required for layout/structure changes)

- [x] Layout / structure changes included: NO
- [x] SVG path in `design_drafts/`: N/A
- [x] SVG includes explicit `viewBox` (width / height / ratio label): N/A
- [x] Tablet viewports considered (if applicable): N/A
- [x] Codex must verify SVG file exists before implementation: N/A

---

## Dependencies / Constraints

- New dependencies allowed: NO
  - If YES, list and justify explicitly.
- Boundary rules:
  - 문서/운영 정책 정렬만 수행한다.
  - 새 정책은 기존 `PROJECT_BLUEPRINT.md`/`PROJECT_CONTEXT.md` 상위 불변식과 충돌하지 않아야 한다.
- Compatibility:
  - 기존 태스크 문서 포맷은 계속 읽을 수 있어야 한다(템플릿 개편은 forward-compatible).
  - delegated chain 개념은 유지하되, 정의 위치와 표현만 정리한다.

---

## Agent Assignment (execution planning)

- Execution mode: DELEGATED
- If delegated, chain scope:
  - `task_108` workflow docs refactor only
- Assigned agents / roles:
  - Spec-Writer: Codex
  - Spec-Reviewer: Codex
  - Implementer-A: Codex
  - Implementer-B: Codex (reserved, inactive for single-owner doc edit)
  - Implementer-C: Codex (reserved, inactive for single-owner doc edit)
  - Reviewer+Verifier: Codex
- File ownership lock plan:
  - 위 scope 파일은 Codex 단일 소유로 순차 수정한다.

---

## Speculative Defense Check (guardrail)

- [x] Any defensive branches added: NO
- If YES:
  - Evidence (real input, spec, or bug report):
    - N/A
  - Sunset criteria (when and how to remove):
    - N/A

---

## Documentation Update Check

- [x] Structure changes (file/folder add/move/delete):
  - 없음 (기존 문서 재구성 중심)
- [x] Semantic / rule changes (layers, invariants, core flows):
  - workflow governance 문구 정렬 수행

---

## Acceptance Criteria (must be testable)

- [x] AC-1: `AGENTS.md`는 상시 규칙 중심으로 축약되고 delegated/SVG/hotfix 상세는 참조 링크 중심으로 정리된다.
- [x] AC-2: `GEMINI_CODEX_PROTOCOL.md`와 `v10/AI_READ_ME.md`의 read-order/authority 서술이 `AGENTS.md`와 충돌하지 않는다.
- [x] AC-3: `codex_tasks/_PLAYBOOK_subagent_oneclick.md`에 max-6 슬롯 운영, 동일 역할 중복 호출 허용, 파일 소유권 잠금 규칙이 명확히 반영된다.
- [x] AC-4: `codex_tasks/_TEMPLATE_task.md`가 Base 필수 섹션 + Optional 블록 구조로 정리된다.
- [x] AC-5: `README.md`는 온보딩 요약 중심, `TOOLS.md`는 로컬 운영 체크리스트 중심으로 역할이 분리된다.
- [x] AC-6: scope 외 파일 수정이 없다.
- [x] AC-7: `node scripts/gen_ai_read_me_map.mjs` 실행 후 `node scripts/gen_ai_read_me_map.mjs --check`가 통과한다.

---

## Manual Verification Steps (since no automated tests)

1) Step:
   - Command / click path:
     - `rg -n "Authority Order|Task Bootstrap|One-click Delegated|SVG|Hotfix|Quality & Safety|Non-task|git pull|git push" AGENTS.md`
   - Expected result:
     - AGENTS 핵심 규칙 + non-task 운영 분류가 확인되고 상세는 참조 링크로 정리됨
   - Covers: AC-1

2) Step:
   - Command / click path:
     - `rg -n "Authority order|Read Order|AGENTS|PROJECT_BLUEPRINT|PROJECT_CONTEXT|codex_tasks/\\* spec" GEMINI_CODEX_PROTOCOL.md v10/AI_READ_ME.md`
   - Expected result:
     - 문서 간 read-order 충돌 문구가 제거됨
   - Covers: AC-2

3) Step:
   - Command / click path:
     - `rg -n "max 6|duplicate|slot|ownership lock|wave|fallback|model profile" codex_tasks/_PLAYBOOK_subagent_oneclick.md`
     - `rg -n "Base|Optional|Layout|Delegated|Hotfix|Docs Update" codex_tasks/_TEMPLATE_task.md`
   - Expected result:
     - delegated 운영/템플릿 모듈화 요구 반영 확인
   - Covers: AC-3, AC-4

4) Step:
   - Command / click path:
     - `rg -n "bootstrap_codex_env|TOOLS.md|_PLAYBOOK_subagent_oneclick|local notes|/experimental" README.md TOOLS.md`
   - Expected result:
     - README/TOOLS 역할 분리 확인
   - Covers: AC-5

5) Step:
   - Command / click path:
     - `git status --short -- AGENTS.md GEMINI_CODEX_PROTOCOL.md v10/AI_READ_ME.md v10/AI_READ_ME_MAP.md codex_tasks/_PLAYBOOK_subagent_oneclick.md codex_tasks/_TEMPLATE_task.md README.md TOOLS.md codex_tasks/task_108_workflow_docs_slimming_and_alignment.md`
   - Expected result:
     - scope 파일만 변경
   - Covers: AC-6

6) Step:
   - Command / click path:
     - `node scripts/gen_ai_read_me_map.mjs`
     - `node scripts/gen_ai_read_me_map.mjs --check`
   - Expected result:
     - `v10/AI_READ_ME_MAP.md`가 최신화되고 check가 통과한다
   - Covers: AC-7

---

## Risks / Roll-back Notes

- Risks:
  - 문서 축약 과정에서 실제 운영자가 필요한 상세 절차를 찾기 어려워질 수 있다.
  - read-order 문구 조정 시 기존 습관과 일시적 혼선이 생길 수 있다.
- Roll-back:
  - 본 태스크의 문서 파일만 revert하면 즉시 원복 가능.

---

## Approval Gate (mandatory)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received - user message: "워크플로우 수정안 수정된 결과까지 모든 권한을 가지고 진행하라."

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `codex_tasks/task_108_workflow_docs_slimming_and_alignment.md`
- `AGENTS.md`
- `GEMINI_CODEX_PROTOCOL.md`
- `v10/AI_READ_ME.md`
- `v10/AI_READ_ME_MAP.md`
- `codex_tasks/_PLAYBOOK_subagent_oneclick.md`
- `codex_tasks/_TEMPLATE_task.md`
- `README.md`
- `TOOLS.md`

Commands run (only if user asked or required by spec):
- `ls codex_tasks | rg '^task_10[0-9]_' | sort`
- `sed -n '1,320p' AGENTS.md`
- `sed -n '1,320p' GEMINI_CODEX_PROTOCOL.md`
- `sed -n '1,220p' v10/AI_READ_ME.md`
- `sed -n '1,260p' codex_tasks/_PLAYBOOK_subagent_oneclick.md`
- `sed -n '1,260p' codex_tasks/_TEMPLATE_task.md`
- `sed -n '1,220p' README.md`
- `sed -n '1,220p' TOOLS.md`
- `rg -n "Authority Order|Task Bootstrap|One-click Delegated|SVG|Hotfix|Quality & Safety|No task spec required|git pull|git push" AGENTS.md`
- `rg -n "Authority order|Governance Note|Read Flow|AGENTS|PROJECT_BLUEPRINT|PROJECT_CONTEXT|codex_tasks/\\*" GEMINI_CODEX_PROTOCOL.md v10/AI_READ_ME.md`
- `rg -n "max 6|hard max|duplicate|slot|ownership lock|wave|fallback|gpt-5.3 extremelyhigh" codex_tasks/_PLAYBOOK_subagent_oneclick.md`
- `rg -n "Optional Block|Layout|Delegated|Hotfix|Documentation Update|Base Required" codex_tasks/_TEMPLATE_task.md`
- `rg -n "bootstrap_codex_env|TOOLS.md|_PLAYBOOK_subagent_oneclick|local runtime|/experimental" README.md TOOLS.md`
- `git status --short -- AGENTS.md GEMINI_CODEX_PROTOCOL.md v10/AI_READ_ME.md codex_tasks/_PLAYBOOK_subagent_oneclick.md codex_tasks/_TEMPLATE_task.md README.md TOOLS.md codex_tasks/task_108_workflow_docs_slimming_and_alignment.md`
- `git status --short --branch`
- `node scripts/gen_ai_read_me_map.mjs`
- `node scripts/gen_ai_read_me_map.mjs --check`
- `git status --short -- AGENTS.md GEMINI_CODEX_PROTOCOL.md v10/AI_READ_ME.md v10/AI_READ_ME_MAP.md codex_tasks/_PLAYBOOK_subagent_oneclick.md codex_tasks/_TEMPLATE_task.md README.md TOOLS.md codex_tasks/task_108_workflow_docs_slimming_and_alignment.md`

## Gate Results (Codex fills)

- Lint:
  - N/A
- Build:
  - N/A
- Script checks:
  - PASS (`node scripts/gen_ai_read_me_map.mjs --check`)

## Failure Classification (Codex fills when any gate fails)

- Pre-existing failures:
  - 없음
- Newly introduced failures:
  - 없음
- Blocking:
  - NO
- Mitigation:
  - N/A

Manual verification notes:
- AC-1: Passed. `AGENTS.md`를 코어 규칙 중심으로 축약하고 상세는 reference docs로 분리.
- AC-2: Passed. `GEMINI_CODEX_PROTOCOL.md` authority mirror와 `v10/AI_READ_ME.md` governance note로 충돌 제거.
- AC-3: Passed. playbook에 hard max 6 slots, duplicate-role policy, dispatch blueprint 반영.
- AC-4: Passed. task template을 Base + Optional blocks 구조로 모듈화.
- AC-5: Passed. README는 온보딩 링크 중심, TOOLS는 로컬 런타임 메모 중심으로 경계 정리.
- AC-6: Passed. scope 파일 외 변경 없음 확인.
- AC-7: Passed. `node scripts/gen_ai_read_me_map.mjs` 실행 후 `--check` 통과 확인.

Notes:
- 사용자 추가 지시("실행하라")에 따라 `AI_READ_ME_MAP` freshness 갱신을 같은 태스크 범위에서 반영.
