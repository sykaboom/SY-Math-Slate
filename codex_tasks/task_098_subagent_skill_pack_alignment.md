# Task 098: Sub-agent Skill Pack Alignment (Pre-097)

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: root/
Date: 2026-02-09

---

## Goal
- What to change:
  - `task_097` 위임 실행 모드를 실제로 굴릴 수 있도록, 선행 스킬팩을 정렬한다.
  - 신규 스킬 2개를 추가한다.
    - `sy-slate-subagent-orchestration` (6-slot wave orchestration)
    - `sy-slate-spec-batch-factory` (multi-spec batch draft/review workflow)
  - 기존 스킬 2개를 위임 실행 모드에 맞게 보강한다.
    - `sy-slate-tool-registry-mcp`
    - `sy-slate-protocol-compat`
  - 스킬 소스 기준을 저장소 내 `codex_skills/`로 고정하고, 활성 경로(`~/.codex/skills`) 반영용 동기화 스크립트를 추가한다.
- What must NOT change:
  - `v10/src/**` 프로덕션 코드 변경 금지.
  - `AGENTS.md` / `GEMINI_CODEX_PROTOCOL.md` 변경 금지 (`task_097`에서 처리).
  - 신규 npm/pip 의존성 추가 금지.
  - Gemini 역할 확장 금지(SVG 초안 보조 전용 유지).

---

## Scope (Codex must touch ONLY these)

Touched files/directories:
- `codex_tasks/task_098_subagent_skill_pack_alignment.md`
- `codex_skills/sy-slate-subagent-orchestration/SKILL.md` (new)
- `codex_skills/sy-slate-spec-batch-factory/SKILL.md` (new)
- `codex_skills/sy-slate-tool-registry-mcp/SKILL.md`
- `codex_skills/sy-slate-protocol-compat/SKILL.md`
- `scripts/sync_codex_skills.sh` (new)

Out of scope:
- `AGENTS.md`, `GEMINI_CODEX_PROTOCOL.md`, `codex_tasks/_TEMPLATE_task.md` (task_097 scope)
- `v10/src/**` 모든 코드
- `design_drafts/**`
- `~/.codex/skills/**` 직접 수정 (스크립트 실행은 옵션; 기본은 소스 준비까지만)

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
- Must align with:
  - `PROJECT_BLUEPRINT.md` section 6 (forward compatibility)
  - `PROJECT_CONTEXT.md` (AI 교육허브 확장 방향)
  - `codex_tasks/task_097_subagent_orchestration_governance.md` (위임 실행 모드 요구사항)
  - 연속 계약/어댑터 태스크 체인(도구 레지스트리 -> 어댑터 경계) 요구사항
- Boundary rules:
  - 스킬은 절차/가드레일/역할 분리만 정의하고, 실제 구현 코드는 건드리지 않는다.
  - 6-slot 상한(`max 6`)과 wave 전환(`close -> spawn`) 규칙을 명시한다.
  - 레이아웃 태스크의 Gemini 연동은 “사용자 브리지 + SVG 초안 1회” 규칙만 명시한다.
  - 스킬 문서는 `skill-creator` 원칙(간결, 불필요 문서 생성 금지)을 따른다.
- Compatibility:
  - 기존 스킬 이름은 유지(트리거 호환성 보존).
  - 기존 task 흐름과 충돌 시, `task_097`이 최종 운영 규칙을 선언하고 `task_098`은 실행 스킬 제공 역할로 제한한다.

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
  - 신규 스킬 디렉터리 2개 추가 확인
  - 신규 스크립트 `scripts/sync_codex_skills.sh` 추가 확인
- [x] Semantic / rule changes (layers, invariants, core flows):
  - 스킬 본문에 위임 실행/병렬 wave/에스컬레이션 규칙 반영

---

## Acceptance Criteria (must be testable)

- [x] AC-1: `codex_skills/sy-slate-subagent-orchestration/SKILL.md`가 생성되고 아래 내용을 포함한다.
  - 6-slot wave 운영
  - 파일 소유권 잠금
  - blocker-only 보고
  - Reviewer+Verifier 1회 루프
  - 에스컬레이션 조건
- [x] AC-2: `codex_skills/sy-slate-spec-batch-factory/SKILL.md`가 생성되고 다중 스펙(예: 10개)를 6+N wave로 처리하는 절차가 명시된다.
- [x] AC-3: `codex_skills/sy-slate-tool-registry-mcp/SKILL.md`가 도구 레지스트리 -> 어댑터 경계 체인의 DAG/병렬 기준을 포함하도록 보강된다.
- [x] AC-4: `codex_skills/sy-slate-protocol-compat/SKILL.md`가 위임 실행 모드의 에스컬레이션(브레이킹/마이그레이션/의존성)을 포함하도록 보강된다.
- [x] AC-5: `scripts/sync_codex_skills.sh`가 생성되어 `codex_skills/` -> `~/.codex/skills/` 동기화를 수행할 수 있다(기본 dry-run 지원).
- [x] AC-6: 스킬 문서에 Gemini SVG 규칙이 “초안 1회 + 사용자 브리지”로 명시된다(재생성 루프 없음).
- [x] AC-7: scope 외 파일 수정이 없다.

---

## Manual Verification Steps (since no automated tests)

> Each step should map to one or more Acceptance Criteria.

1) 신규/수정 스킬 확인:
   - Command / click path: `find codex_skills -maxdepth 2 -type f -name 'SKILL.md' | sort`
   - Expected result: 신규 2개 포함, 수정 대상 2개 존재
   - Covers: AC-1, AC-2, AC-3, AC-4

2) 핵심 규칙 키워드 확인:
   - Command / click path: `rg -n "wave|6-slot|ownership|blocker|escalation|Gemini|SVG|draft" codex_skills/sy-slate-subagent-orchestration/SKILL.md codex_skills/sy-slate-spec-batch-factory/SKILL.md codex_skills/sy-slate-tool-registry-mcp/SKILL.md codex_skills/sy-slate-protocol-compat/SKILL.md`
   - Expected result: 위임 실행 핵심 규칙이 모두 탐지됨
   - Covers: AC-1, AC-2, AC-3, AC-4, AC-6

3) 동기화 스크립트 확인:
   - Command / click path: `bash -n scripts/sync_codex_skills.sh` and `sed -n '1,220p' scripts/sync_codex_skills.sh`
   - Expected result: 구문 오류 없음 + dry-run/실행 모드 확인 가능
   - Covers: AC-5

4) scope 오염 확인:
   - Command / click path: `git diff --name-only`
   - Expected result: 변경 파일이 scope 목록과 일치
   - Covers: AC-7

---

## Risks / Roll-back Notes

- Risks:
  - 활성 스킬 경로(`~/.codex/skills`)와 저장소 소스(`codex_skills`)가 어긋나면 실제 트리거 동작이 기대와 다를 수 있음.
  - 과도한 절차를 스킬에 넣으면 컨텍스트 과부하로 오히려 느려질 수 있음.
- Roll-back:
  - 신규 스킬 2개/스크립트 1개는 파일 단위 제거로 즉시 롤백 가능.
  - 기존 스킬 2개는 이전 버전으로 파일 revert 가능.

---

## Approval Gate (mandatory)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (e.g. "승인: 진행")

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `codex_tasks/task_098_subagent_skill_pack_alignment.md`
- `codex_skills/sy-slate-subagent-orchestration/SKILL.md` (new)
- `codex_skills/sy-slate-spec-batch-factory/SKILL.md` (new)
- `codex_skills/sy-slate-tool-registry-mcp/SKILL.md`
- `codex_skills/sy-slate-protocol-compat/SKILL.md`
- `scripts/sync_codex_skills.sh` (new)

Commands run (only if user asked or required by spec):
- `sed -n '1,260p' AGENTS.md`
- `sed -n '1,260p' GEMINI_CODEX_PROTOCOL.md`
- `sed -n '1,260p' PROJECT_BLUEPRINT.md`
- `sed -n '1,240p' PROJECT_CONTEXT.md`
- `sed -n '1,280p' codex_tasks/_TEMPLATE_task.md`
- `sed -n '1,360p' codex_tasks/task_097_subagent_orchestration_governance.md`
- `sed -n '1,320p' /home/sykab/.codex/skills/.system/skill-creator/SKILL.md`
- `ls codex_tasks | rg '^task_098_' || true`
- `ls -la codex_skills && find codex_skills -maxdepth 2 -type f | sed -n '1,120p'`
- `sed -n '1,260p' codex_skills/sy-slate-tool-registry-mcp/SKILL.md`
- `sed -n '1,260p' codex_skills/sy-slate-protocol-compat/SKILL.md`
- `chmod +x scripts/sync_codex_skills.sh && bash -n scripts/sync_codex_skills.sh`
- `find codex_skills -maxdepth 2 -type f -name 'SKILL.md' | sort`
- `rg -n "wave|6-slot|ownership|blocker|escalation|Gemini|SVG|draft" codex_skills/sy-slate-subagent-orchestration/SKILL.md codex_skills/sy-slate-spec-batch-factory/SKILL.md codex_skills/sy-slate-tool-registry-mcp/SKILL.md codex_skills/sy-slate-protocol-compat/SKILL.md`
- `git diff --name-only`
- `git status --short`
- `git diff --name-only -- codex_tasks/task_098_subagent_skill_pack_alignment.md codex_skills/sy-slate-subagent-orchestration/SKILL.md codex_skills/sy-slate-spec-batch-factory/SKILL.md codex_skills/sy-slate-tool-registry-mcp/SKILL.md codex_skills/sy-slate-protocol-compat/SKILL.md scripts/sync_codex_skills.sh`
- `git status --short -- codex_tasks/task_098_subagent_skill_pack_alignment.md codex_skills/sy-slate-subagent-orchestration/SKILL.md codex_skills/sy-slate-spec-batch-factory/SKILL.md codex_skills/sy-slate-tool-registry-mcp/SKILL.md codex_skills/sy-slate-protocol-compat/SKILL.md scripts/sync_codex_skills.sh`

Manual verification notes:
- 신규 스킬 2개 생성 확인:
  - `codex_skills/sy-slate-subagent-orchestration/SKILL.md`
  - `codex_skills/sy-slate-spec-batch-factory/SKILL.md`
- 기존 스킬 2개 보강 확인:
  - `codex_skills/sy-slate-tool-registry-mcp/SKILL.md`에 DAG/병렬 기준 및 에스컬레이션 규칙 반영
  - `codex_skills/sy-slate-protocol-compat/SKILL.md`에 위임 실행 에스컬레이션/분류 규칙 반영
- `scripts/sync_codex_skills.sh` 생성 및 `bash -n` 통과
- `rg` 키워드 검증에서 wave/ownership/blocker/escalation/Gemini/SVG/draft 규칙 탐지
- 대상 파일 한정 `git status --short -- ...`에서 scope 파일만 변경됨을 확인
- 작업 시작 시 이미 레포가 dirty 상태였으며, 본 태스크 구현 변경은 scope 파일로 제한

Notes:
- 본 태스크는 `task_097`의 운영 규칙 선언 전에, 실제 실행에 필요한 스킬팩을 먼저 준비하는 선행 단계다.
