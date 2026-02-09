# Task 099: Codex Environment Portability Bootstrap

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: root/
Date: 2026-02-09

---

## Goal
- What to change:
  - 새 환경에서도 `git pull` 이후 동일한 Codex 워크플로를 즉시 재현할 수 있도록 부트스트랩 경로를 고정한다.
  - `codex_skills/`를 레포 SSOT로 유지하고, `~/.codex/skills` 반영 과정을 단일 스크립트로 표준화한다.
  - sub-agent 사용 가능/불가 상황에서의 실행 모드(병렬 vs 단일 폴백)를 문서로 명확히 안내한다.
- What must NOT change:
  - `v10/src/**` 프로덕션 코드 변경 금지.
  - `AGENTS.md` / `GEMINI_CODEX_PROTOCOL.md` 운영 헌법 변경 금지 (`task_097` scope).
  - 신규 npm/pip dependency 추가 금지.
  - Gemini 역할 확장 금지(SVG 초안 보조 전용 유지).

---

## Scope (Codex must touch ONLY these)

Touched files/directories:
- `codex_tasks/task_099_codex_env_portability_bootstrap.md`
- `scripts/bootstrap_codex_env.sh` (new)
- `scripts/sync_codex_skills.sh`
- `README.md`
- `TOOLS.md`

Out of scope:
- `v10/src/**` 모든 코드
- `AGENTS.md`, `GEMINI_CODEX_PROTOCOL.md`, `codex_tasks/_TEMPLATE_task.md`
- `design_drafts/**`
- `~/.codex/skills/**` 직접 수정(스크립트 실행 결과는 사용자 환경 선택 사항)

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
  - `codex_tasks/task_098_subagent_skill_pack_alignment.md`
  - `PROJECT_CONTEXT.md` (AI 교육허브 확장 / 협업 운영)
  - `PROJECT_BLUEPRINT.md` section 6 (forward compatibility)
- Boundary rules:
  - 스크립트는 환경 점검/동기화 자동화만 수행하고, 코드베이스 런타임 기능을 변경하지 않는다.
  - sub-agent 토글(`/experimental`)은 런타임 UI 제어 영역이므로 자동 강제 대신 점검/가이드만 제공한다.
  - 실패 시 메시지는 행동 지침 중심으로 출력한다.
- Compatibility:
  - 스크립트는 idempotent 동작이어야 한다(반복 실행 시 안전).
  - `sync_codex_skills.sh` 기존 옵션(`--dry-run`, `--apply`) 호환 유지.

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
  - 신규 스크립트 `scripts/bootstrap_codex_env.sh` 추가 확인
- [x] Semantic / rule changes (layers, invariants, core flows):
  - `README.md`, `TOOLS.md`에 환경 부트스트랩 및 폴백 운영 가이드 반영

---

## Acceptance Criteria (must be testable)

- [x] AC-1: `scripts/bootstrap_codex_env.sh`가 생성되어 아래 절차를 수행한다.
  - 환경 정보 출력(현재 경로, 스킬 소스 경로, 타깃 경로)
  - `sync_codex_skills.sh` dry-run 또는 apply 실행
  - sub-agent 사용 여부 점검 가이드 출력(`/experimental` 확인 안내)
- [x] AC-2: `scripts/sync_codex_skills.sh`가 부트스트랩에서 재사용 가능한 형태로 유지/보강된다.
- [x] AC-3: `README.md`에 새 환경 온보딩 절차(`pull -> bootstrap -> 확인`)가 추가된다.
- [x] AC-4: `TOOLS.md`에 로컬 환경 의존 요소(예: `/experimental` 토글) 점검 위치가 명시된다.
- [x] AC-5: `bash -n scripts/bootstrap_codex_env.sh` 및 `bash -n scripts/sync_codex_skills.sh` 통과.
- [x] AC-6: scope 외 파일 수정이 없다.

---

## Manual Verification Steps (since no automated tests)

> Each step should map to one or more Acceptance Criteria.

1) 스크립트 생성/구문 확인:
   - Command / click path: `bash -n scripts/bootstrap_codex_env.sh && bash -n scripts/sync_codex_skills.sh`
   - Expected result: 두 스크립트 모두 syntax error 없음
   - Covers: AC-1, AC-2, AC-5

2) dry-run 동작 확인:
   - Command / click path: `scripts/bootstrap_codex_env.sh --dry-run`
   - Expected result: 스킬 경로/동기화 계획/sub-agent 점검 안내가 출력됨
   - Covers: AC-1, AC-2

3) 문서 반영 확인:
   - Command / click path: `rg -n "bootstrap|sync_codex_skills|experimental|sub-agent|fallback" README.md TOOLS.md`
   - Expected result: 온보딩/폴백 관련 안내 문구 탐지
   - Covers: AC-3, AC-4

4) scope 오염 확인:
   - Command / click path: `git status --short -- codex_tasks/task_099_codex_env_portability_bootstrap.md scripts/bootstrap_codex_env.sh scripts/sync_codex_skills.sh README.md TOOLS.md`
   - Expected result: scope 파일만 변경으로 표시
   - Covers: AC-6

---

## Risks / Roll-back Notes

- Risks:
  - 환경별 쉘/권한 차이로 부트스트랩 스크립트 실행 결과가 다를 수 있음.
  - 사용자 환경에서 `/experimental` 토글 상태가 다르면 병렬 실행 기대치가 달라질 수 있음.
- Roll-back:
  - 신규 스크립트 제거 + 문서 변경 revert로 즉시 원복 가능.
  - `sync_codex_skills.sh`는 이전 버전으로 파일 revert 가능.

---

## Approval Gate (mandatory)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (e.g. "승인: 진행")

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `codex_tasks/task_099_codex_env_portability_bootstrap.md`
- `scripts/bootstrap_codex_env.sh` (new)
- `scripts/sync_codex_skills.sh`
- `README.md`
- `TOOLS.md`

Commands run (only if user asked or required by spec):
- `ls codex_tasks | sort -V | tail -n 20`
- `ls -la scripts`
- `sed -n '1,220p' README.md`
- `sed -n '1,220p' TOOLS.md`
- `sed -n '1,260p' AGENTS.md`
- `sed -n '1,260p' GEMINI_CODEX_PROTOCOL.md`
- `sed -n '1,260p' codex_tasks/task_097_subagent_orchestration_governance.md`
- `sed -n '1,260p' codex_tasks/task_098_subagent_skill_pack_alignment.md`
- `sed -n '1,240p' scripts/sync_codex_skills.sh`
- `chmod +x scripts/bootstrap_codex_env.sh scripts/sync_codex_skills.sh`
- `bash -n scripts/bootstrap_codex_env.sh && bash -n scripts/sync_codex_skills.sh`
- `scripts/bootstrap_codex_env.sh --dry-run`
- `rg -n "bootstrap|sync_codex_skills|experimental|sub-agent|fallback" README.md TOOLS.md`
- `git status --short -- codex_tasks/task_099_codex_env_portability_bootstrap.md scripts/bootstrap_codex_env.sh scripts/sync_codex_skills.sh README.md TOOLS.md`

Manual verification notes:
- `scripts/bootstrap_codex_env.sh --dry-run`에서 source/target 경로와 동기화 계획 출력, `/experimental` 점검 가이드 출력 확인
- `bash -n`으로 bootstrap/sync 스크립트 구문 검사 통과
- `README.md`, `TOOLS.md`에서 bootstrap/sub-agent fallback 안내 문구 검색 확인
- 대상 파일 한정 `git status --short -- ...` 결과로 scope 파일만 변경됨 확인

Notes:
- 본 태스크는 환경 이식성 고정 단계이며, 운영 헌법 변경(`task_097`) 전에 실행 기반을 먼저 안정화한다.
