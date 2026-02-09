# Task 097: One-click Sub-agent Pipeline (Delegated Execution Mode)

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: root/
Date: 2026-02-09

---

## Goal
- What to change:
  - 사용자의 단일 지시(딸깍)로 `스펙 작성 -> 스펙 검토 -> 구현 병렬 실행 -> 코드리뷰/검증 -> 최종 경영보고`까지 이어지는 Codex 오케스트레이션 표준을 문서로 고정한다.
  - 사용자 역할을 C-level(목표/우선순위/중단권)로 두고, 태스크 단위 승인 반복 없이 Codex가 실행을 위임받아 진행하는 모드를 명시한다.
  - Sub-agent 6개 체계를 운영 기본값으로 정의한다.
    - Spec-Writer
    - Spec-Reviewer
    - Implementer-A
    - Implementer-B
    - Implementer-C
    - Reviewer+Verifier(통합)
  - 연속 태스크 체인에서 병렬 처리 가능한 기준(DAG, 파일 소유권 잠금, 공유 파일 충돌 규칙)을 명시한다.
  - 레이아웃 태스크에서 Gemini 연동은 사용자 브리지 기반으로 유지하되, Gemini는 `SVG 초안 1회`만 제공하고 재생성 루프를 강제하지 않도록 규칙화한다.
- What must NOT change:
  - Codex의 최종 권한(스펙 확정, 승인 요청, 병합 판단, 완료 판정) 약화 금지.
  - 사용자 에스컬레이션 트리거(브레이킹 변경/신규 의존성/보안/비용/데이터 마이그레이션)는 제거 금지.
  - Gemini 역할 확장 금지(SVG 레이아웃 보조 전용 유지).
  - `v10/src/**` 프로덕션 코드 변경 금지.
  - 신규 dependency 추가 금지.

---

## Scope (Codex must touch ONLY these)

Touched files/directories:
- `codex_tasks/task_097_subagent_orchestration_governance.md`
- `AGENTS.md`
- `GEMINI_CODEX_PROTOCOL.md`
- `codex_tasks/_TEMPLATE_task.md`
- `codex_tasks/_PLAYBOOK_subagent_oneclick.md` (new)

Out of scope:
- `v10/src/**` 및 앱 런타임 동작 변경
- `design_drafts/**` 산출물 생성/수정
- `GEMINI.md` 수정
- 개별 기능 태스크의 실제 구현
- 외부 경로(`~/.codex/skills/**`) 수정

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
  - `PROJECT_BLUEPRINT.md` section 6, 7
  - `PROJECT_CONTEXT.md` (Codex/Gemini 역할)
  - `GEMINI_CODEX_PROTOCOL.md` (Codex ownership + Gemini SVG-only)
- Boundary rules:
  - Sub-agent는 실행 보조자이며 최종 승인/판정 주체가 아니다.
  - 한 시점에 한 파일은 한 Implementer만 소유할 수 있다(소유권 잠금).
  - Reviewer+Verifier는 1회 루프만 수행한다(무한 재작업 금지).
  - 중간 보고는 blocker 발생 시에만, 그 외에는 최종 1회 보고한다.
  - 사용자 확인은 `에스컬레이션 조건` 충족 시에만 요구한다(일반 태스크는 Codex 위임 실행).
  - 레이아웃 태스크에서 Gemini는 SVG 초안 1회만 제공한다(재생성/재수정 루프 없음).
  - Gemini SVG 요청은 기획 단계에서 Codex가 사용자에게 요청 명세를 전달하고, 사용자가 브리지한다.
  - `/experimental`에서 sub-agent 비활성화 시 즉시 단일 Codex 모드로 폴백한다.
  - 세션 동시 sub-agent 최대치(현재 6)를 초과하지 않는다.
- Compatibility:
  - 기존 spec-gated workflow(Stage 1/2/3 + Closeout)는 유지한다.
  - 변경점은 "누가 병렬로 보조 수행하는가"에 한정한다.

---

## One-click Pipeline Definition (normative)

입력(사용자 -> Codex):
- 목표/우선순위/제약 + 위임 실행 지시(필수)

파이프라인(Codex 오케스트레이션):
1) Spec-Writer: 스펙 초안 생성
2) Spec-Reviewer: 스펙 결함/모호성 수정안 제시
3) Codex: 스펙 통합 + 내부 승인(에스컬레이션 조건 없으면 사용자 승인 생략)
4) (레이아웃 태스크일 때만) Codex -> 사용자: Gemini용 SVG 요청서 전달 -> 사용자 브리지로 Gemini 초안 1회 수신
5) Implementer-A/B/C 병렬 실행(파일 소유권 분리)
6) Reviewer+Verifier: 코드리뷰 + lint/build/scripts 결과 분류(1회)
7) Codex: 최종 병합 판단 + 경영 보고 패킷 전달

에스컬레이션 조건(Codex -> 사용자 확인 필요):
- breaking change
- 신규 dependency 추가
- 보안/비용 정책 영향
- 데이터 마이그레이션 필요
- Gemini SVG 초안 요청 필요

출력(Codex -> 사용자):
- 변경 파일 요약
- 리스크/회귀 여부
- 게이트 결과(`pre-existing` vs `new`)
- 경영 의사결정 필요 항목(있는 경우에만)

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
  - `codex_tasks/_PLAYBOOK_subagent_oneclick.md` 신규 파일 추가 반영
- [x] Semantic / rule changes (layers, invariants, core flows):
  - `AGENTS.md` one-click sub-agent 운영 규칙 반영
  - `GEMINI_CODEX_PROTOCOL.md` 병렬 보조 실행 규칙 반영
  - `codex_tasks/_TEMPLATE_task.md`에 Agent Assignment/Gate Results 반영

---

## Acceptance Criteria (must be testable)

- [x] AC-1: `AGENTS.md`에 one-click sub-agent 운영 섹션이 추가되고 아래가 모두 명시된다.
  - 6개 역할 세트
  - 위임 실행 모드(태스크별 수동 승인 반복 없음)
  - 파일 소유권 잠금
  - blocker-only 보고
  - 1회 리뷰/검증 루프
  - Codex 최종 판정 + 에스컬레이션 기반 사용자 확인
- [x] AC-2: `GEMINI_CODEX_PROTOCOL.md`에 sub-agent 병행 보조 실행 규칙이 추가되며, Gemini SVG-only + SVG 초안 1회 규칙이 함께 명시된다.
- [x] AC-3: `codex_tasks/_TEMPLATE_task.md`에 `Agent Assignment`, `Gate Results`, `Failure Classification` 항목이 추가된다.
- [x] AC-4: `codex_tasks/_PLAYBOOK_subagent_oneclick.md`가 생성되고, 단일 지시 입력/출력 계약이 명시된다.
- [x] AC-5: 문서에 연속 태스크 병렬 실행 기준(의존성 + 공유파일 충돌 시 순차 전환 + 6개 웨이브 운영)이 명시된다.
- [x] AC-6: scope 외 파일 수정이 없다.

---

## Manual Verification Steps (since no automated tests)

> Each step should map to one or more Acceptance Criteria.

1) 운영 규칙 확인:
   - Command / click path: `rg -n "One-click|Sub-agent|Spec-Writer|Implementer-A|Reviewer\\+Verifier|delegated|escalation|blocker" AGENTS.md GEMINI_CODEX_PROTOCOL.md`
   - Expected result: 두 문서에 역할/루프/보고/위임실행/에스컬레이션 규칙이 동시에 존재한다.
   - Covers: AC-1, AC-2

2) 템플릿 항목 확인:
   - Command / click path: `rg -n "Agent Assignment|Gate Results|Failure Classification" codex_tasks/_TEMPLATE_task.md`
   - Expected result: 신규 태스크에 재사용 가능한 항목이 확인된다.
   - Covers: AC-3

3) 플레이북 확인:
   - Command / click path: `sed -n '1,260p' codex_tasks/_PLAYBOOK_subagent_oneclick.md`
   - Expected result: 입력/파이프라인/출력/폴백 + Gemini SVG 초안 1회 + 6개 웨이브 규칙이 확인된다.
   - Covers: AC-4, AC-5

4) Scope 오염 확인:
   - Command / click path: `git diff --name-only` + `git status --short -- AGENTS.md GEMINI_CODEX_PROTOCOL.md codex_tasks/_TEMPLATE_task.md codex_tasks/_PLAYBOOK_subagent_oneclick.md codex_tasks/task_097_subagent_orchestration_governance.md`
   - Expected result: 전역 diff에는 기존 누적 변경이 존재할 수 있으나, 본 태스크 scope 파일 기준으로는 수정 목록이 일치한다.
   - Covers: AC-6

---

## Risks / Roll-back Notes

- Risks:
  - 문서 규칙과 실제 오케스트레이션이 어긋나면 오히려 혼선이 증가할 수 있음.
  - 병렬 범위를 과도하게 잡으면 파일 충돌로 생산성이 저하될 수 있음.
- Roll-back:
  - 본 태스크는 문서 변경만 포함하므로 파일 단위 revert로 즉시 원복 가능.
  - sub-agent 비활성화 시 기존 단일 Codex 모드로 즉시 복귀 가능.

---

## Approval Gate (mandatory)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (e.g. "승인: 진행")

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `AGENTS.md`
- `GEMINI_CODEX_PROTOCOL.md`
- `codex_tasks/_TEMPLATE_task.md`
- `codex_tasks/_PLAYBOOK_subagent_oneclick.md`
- `codex_tasks/task_097_subagent_orchestration_governance.md`

Commands run (only if user asked or required by spec):
- `sed -n '1,260p' AGENTS.md`
- `sed -n '1,260p' GEMINI_CODEX_PROTOCOL.md`
- `sed -n '1,220p' PROJECT_BLUEPRINT.md`
- `sed -n '1,220p' PROJECT_CONTEXT.md`
- `sed -n '1,320p' codex_tasks/task_097_subagent_orchestration_governance.md`
- `sed -n '1,260p' codex_tasks/_TEMPLATE_task.md`
- `nl -ba AGENTS.md | sed -n '1,320p'`
- `nl -ba GEMINI_CODEX_PROTOCOL.md | sed -n '1,320p'`
- `nl -ba codex_tasks/_TEMPLATE_task.md | sed -n '1,320p'`
- `rg -n "One-click|Sub-agent|Spec-Writer|Implementer-A|Reviewer\\+Verifier|delegated|escalation|blocker" AGENTS.md GEMINI_CODEX_PROTOCOL.md`
- `rg -n "Agent Assignment|Gate Results|Failure Classification" codex_tasks/_TEMPLATE_task.md`
- `sed -n '1,320p' codex_tasks/_PLAYBOOK_subagent_oneclick.md`
- `git diff --name-only`
- `git diff --name-only -- AGENTS.md GEMINI_CODEX_PROTOCOL.md codex_tasks/_TEMPLATE_task.md codex_tasks/_PLAYBOOK_subagent_oneclick.md codex_tasks/task_097_subagent_orchestration_governance.md`
- `git status --short -- AGENTS.md GEMINI_CODEX_PROTOCOL.md codex_tasks/_TEMPLATE_task.md codex_tasks/_PLAYBOOK_subagent_oneclick.md codex_tasks/task_097_subagent_orchestration_governance.md`

Manual verification notes:
- AC-1/AC-2: `AGENTS.md`, `GEMINI_CODEX_PROTOCOL.md`에서 one-click delegated/sub-agent/escalation/blocker 규칙 확인.
- AC-3: `_TEMPLATE_task.md`에 `Agent Assignment`, `Gate Results`, `Failure Classification` 섹션 확인.
- AC-4/AC-5: `_PLAYBOOK_subagent_oneclick.md`에 입력/파이프라인/출력 계약 + DAG/wave + 공유파일 충돌시 순차 전환 + 6 baseline 규칙 확인.
- AC-6: 전역 diff에는 기존 누적 변경 존재. scope 파일 기준 상태(`git status --short -- <scope>`)는 본 태스크 수정 목록과 일치.

Notes:
- 본 태스크는 문서/템플릿/플레이북 고정 작업이며, 프로덕션 코드(`v10/src/**`)는 변경하지 않았다.
