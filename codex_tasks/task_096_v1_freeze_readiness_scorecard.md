# Task 096: V1 Freeze Readiness Scorecard + Go/No-Go Protocol

Status: PARKED
Owner: Codex (spec / review / implementation)
Target: v10/ + contract governance docs
Date: 2026-02-09
Parking note: 2026-02-09 기준 비블로커로 분류. `task_090~093` 완료 후 재검토.

---

## Goal
- What to change:
  - draft 계약 단계(`0.x-draft`)에서 `v1 freeze` 진입 가능 여부를 판정하는 scorecard 체계를 정의한다.
  - `task_091~095` 산출물을 입력으로 사용하는 go/no-go 프로토콜을 문서화한다.
  - freeze 승인 시 필요한 최소 증거 패키지(검증 로그, 리스크, migration 계획)를 표준 템플릿으로 고정한다.
- What must NOT change:
  - 실제 `1.0.0` freeze 실행 금지.
  - 계약 본문 타입/필드 변경 금지.
  - 신규 dependency 추가 금지.
  - UI/layout 변경 금지.

---

## Scope (Codex must touch ONLY these)

Touched files/directories:
- `codex_tasks/task_096_v1_freeze_readiness_scorecard.md`
- `codex_tasks/reports/task_096_v1_freeze_scorecard_template.md` (new)
- `codex_tasks/reports/task_096_v1_freeze_decision_log_template.md` (new)
- `v10/AI_READ_ME.md` (freeze 운영 흐름 반영이 필요한 경우만)

Out of scope:
- `v10/src/**` 생산 코드 변경
- `math-pdf-builder-codex` 저장소 수정
- MCP/adapter 실행 코드 추가
- 실제 릴리스 태깅/배포 작업

---

## Design Artifacts (required for layout/structure changes)
- [x] Layout / structure changes included: NO
- [x] SVG path in `design_drafts/`: N/A
- [x] SVG includes explicit `viewBox`: N/A
- [x] Tablet viewports considered (if applicable): N/A
- [x] Codex must verify SVG file exists before implementation: N/A

---

## Dependencies / Constraints
- New dependencies allowed: NO
- Preconditions:
  - `task_091` (contract slice2) 결과 확보
  - `task_094` (fixtures + migration guard) 결과 확보
  - `task_095` (cross-app dryrun report) 결과 확보
- Must align with:
  - `codex_tasks/task_085_crossapp_contract_provisional_freeze_policy.md`
  - `PROJECT_BLUEPRINT.md` section 6 (forward compatibility)
  - `PROJECT_CONTEXT.md` (v10 lead, pdf-builder adapter follow)
- Boundary rules:
  - freeze 판단은 evidence-driven으로만 수행
  - 주관적 “체감 안정성” 단독 승인 금지
  - `breaking` 판정은 version bump + migration 계획 없으면 자동 `NO-GO`

---

## Scorecard Protocol (draft)
Gate dimensions:
- G1: Contract Validity (`NormalizedContent/RenderPlan/TTSScript/ToolResult`)
- G2: Round-trip Integrity (v10 ↔ adapter simulation)
- G3: Migration Readiness (breaking path + one-shot migration outline)
- G4: Boundary Hygiene (core/provider 분리, adapter 경계 유지)
- G5: Operational Stability (lint/build/report reproducibility)

Decision rule:
- `GO`: 모든 Gate `PASS`
- `CONDITIONAL`: blocker 없는 minor gap 1개 이하 + 기한/담당자 지정
- `NO-GO`: blocker 1개 이상 또는 migration 없는 breaking 발견

Evidence package:
- lint/build 로그 요약
- fixture/guard 판정 결과
- dryrun 손실 매트릭스
- migration 권고 및 책임자/기한

---

## Speculative Defense Check
- [x] Any defensive branches added: NO
- [x] Evidence provided: YES (`task_085` freeze gate 요건 + `task_095` dryrun 방향)
- [x] Sunset criteria: YES (v1 freeze 완료 후 scorecard를 release regression 체크로 축소)

---

## Documentation Update Check
- [ ] Structure changes:
  - `codex_tasks/reports/` 템플릿 파일 추가 반영 확인
  - `node scripts/gen_ai_read_me_map.mjs` (v10 구조 변경 시만)
- [ ] Semantic / rule changes:
  - `v10/AI_READ_ME.md` 업데이트 필요성 확인 (운영 플로우 반영 시)

---

## Acceptance Criteria (must be testable)
- [ ] AC-1: freeze scorecard 템플릿 파일이 생성된다.
- [ ] AC-2: go/no-go decision log 템플릿 파일이 생성된다.
- [ ] AC-3: 각 Gate(G1~G5)별 PASS/FAIL 근거 항목이 템플릿에 정의된다.
- [ ] AC-4: `NO-GO` 자동 조건(예: breaking + migration 미정)이 명시된다.
- [ ] AC-5: Scope 외 파일 수정이 없다.

---

## Manual Verification Steps
1) 템플릿 파일 존재 확인
   - Command / path: `ls -1 codex_tasks/reports | rg 'task_096_v1_freeze_(scorecard|decision_log)_template\\.md'`
   - Expected result: 2개 템플릿 파일 존재
   - Covers: AC-1, AC-2

2) Gate 항목 확인
   - Command / path: `rg -n "G1|G2|G3|G4|G5|PASS|FAIL|NO-GO|migration" codex_tasks/reports/task_096_v1_freeze_scorecard_template.md`
   - Expected result: Gate 기준/판정 규칙 존재
   - Covers: AC-3, AC-4

3) Scope 확인
   - Command / path: `git diff --name-only`
   - Expected result: scope 내 파일만 변경
   - Covers: AC-5

---

## Risks / Roll-back Notes
- Risks:
  - 기준이 과도하면 freeze가 과도 지연될 수 있음
  - 기준이 느슨하면 불완전 계약이 v1로 고정될 수 있음
- Roll-back:
  - scorecard/decision 템플릿은 문서 단위로 독립 revert 가능
  - 운영 규칙 변경은 별도 태스크에서 버전 태깅과 함께 조정

---

## Approval Gate (mandatory)
- [x] Spec self-reviewed by Codex
- [ ] Explicit user approval received (e.g. "승인: 진행")

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)
Status: PARKED

Changed files:
- `codex_tasks/task_096_v1_freeze_readiness_scorecard.md`

Commands run:
- `sed -n '1,260p' codex_tasks/task_095_crossapp_exchange_dryrun_v10_pdfbuilder.md`
- `sed -n '1,260p' codex_tasks/task_085_crossapp_contract_provisional_freeze_policy.md`
- `sed -n '1,220p' /home/sykab/.codex/skills/sy-slate-crossapp-exchange/SKILL.md`

Manual verification notes:
- Spec stage only. Implementation not started.

Notes:
- 본 태스크는 계약 freeze를 “감”이 아니라 “증거”로 결정하기 위한 운영 표준화다.
