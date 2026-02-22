# Task 499: Guardrail WARN Cleanup Wave 1 (hardcoded color + overlay false-positive trim)

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-22

---

## Goal (Base Required)
- What to change:
  - `scan_guardrails.sh` WARN 대상 중 하드코딩 red/rose Tailwind 색상 사용 6건을 theme token 기반 클래스로 치환한다.
  - overlay 경고 탐지에서 명백한 false-positive(동적 pointerClass, cursor color-input overlay 등) 노이즈를 줄인다.
- What must NOT change:
  - UI 동작/상태 로직/권한 정책 변경 금지.
  - guardrail의 FAIL 조건 완화 금지(LLM direct-call, secret leak, mod boundary 등).

---

## Scope (Base Required)

Touched files/directories:
- `v10/src/features/collaboration/sharing/ai/TeacherApprovalPanel.tsx`
- `v10/src/features/collaboration/sharing/ai/StudentAIPromptBar.tsx`
- `v10/src/features/platform/mod-studio/theme/AIThemeGenerationPanel.tsx`
- `v10/src/features/governance/moderation/ModerationConsolePanel.tsx`
- `v10/src/features/editor/input-studio/schema/StructuredSchemaEditor.tsx`
- `scripts/scan_guardrails.sh`
- `codex_tasks/task_499_guardrail_warn_cleanup_wave1.md`

Out of scope:
- toolbar/layout 기능 동작 변경
- scan strict 모드 정책 변경
- design token 체계 확장

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - 기능 로직 변경 없이 스타일 클래스/가드레일 탐지 조건만 조정.
  - pointer-events 경고 탐지는 false-positive 축소 목적이며, 경고 자체 제거를 위한 무조건 allowlist 금지.
- Compatibility:
  - 기존 컴포넌트의 에러 메시지 표시/검증 표시 흐름 유지.

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - W-GUARDRAIL-WARN-01
- Depends on tasks:
  - `task_498`
- Enables tasks:
  - `task_500` guardrail warn cleanup wave2 (planned)
- Parallel group:
  - G-GUARDRAIL-WARN
- Max parallel slots:
  - 6
- Verification stage for this task:
  - `end`

---

## Execution Mode Assessment (Base Required for new specs)

- Touched file count:
  - 7
- Files shared with other PENDING tasks:
  - none
- Cross-module dependency:
  - YES (features + root script)
- Parallelizable sub-units:
  - 0
- Estimated single-agent duration:
  - `~25min`
- Recommended mode:
  - MANUAL
- Batch-eligible:
  - NO
- Rationale:
  - script 탐지와 대상 UI 클래스 변경은 같이 검증해야 결과가 확정된다.

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

- [ ] Applies: NO

---

## Acceptance Criteria (Base Required)

- [x] AC-1: 기존 WARN 6건(red/rose hardcoded class)이 theme token 기반 클래스로 치환된다.
- [x] AC-2: `scan_guardrails.sh` overlay step이 동적 pointerClass/cursor-overlay false-positive를 제외하도록 보정된다.
- [x] AC-3: `bash scripts/scan_guardrails.sh` 실행 결과에서 hardcoded color WARN이 사라진다.
- [x] AC-4: `bash scripts/check_mod_contract.sh` + `cd v10 && npm run lint && npm run build` PASS.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path:
     - `rg -n "text-rose-200|text-red-300|text-red-200|text-red-100|bg-red-500|border-red-" v10/src/features/collaboration/sharing/ai/TeacherApprovalPanel.tsx v10/src/features/collaboration/sharing/ai/StudentAIPromptBar.tsx v10/src/features/platform/mod-studio/theme/AIThemeGenerationPanel.tsx v10/src/features/governance/moderation/ModerationConsolePanel.tsx v10/src/features/editor/input-studio/schema/StructuredSchemaEditor.tsx`
   - Expected result:
     - 매치 없음.
   - Covers: AC-1

2) Step:
   - Command / click path:
     - `sed -n '1,220p' scripts/scan_guardrails.sh`
   - Expected result:
     - overlay 검사에서 dynamic pointerClass/cursor overlay false-positive 제외 로직이 존재.
   - Covers: AC-2

3) Step:
   - Command / click path:
     - `bash scripts/scan_guardrails.sh`
   - Expected result:
     - hardcoded color WARN 미발생.
   - Covers: AC-3

4) Step:
   - Command / click path:
     - `bash scripts/check_mod_contract.sh && cd v10 && npm run lint && npm run build`
   - Expected result:
     - PASS.
   - Covers: AC-4

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - 경고 탐지 조건 변경 시 진짜 이슈까지 누락할 위험.
- Roll-back:
  - `scripts/scan_guardrails.sh` 단일 revert + 스타일 클래스 변경 revert.

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (or delegated chain approval reference)
  - User quote: "1. 번 부터 ."

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `v10/src/features/collaboration/sharing/ai/TeacherApprovalPanel.tsx`
- `v10/src/features/collaboration/sharing/ai/StudentAIPromptBar.tsx`
- `v10/src/features/platform/mod-studio/theme/AIThemeGenerationPanel.tsx`
- `v10/src/features/governance/moderation/ModerationConsolePanel.tsx`
- `v10/src/features/editor/input-studio/schema/StructuredSchemaEditor.tsx`
- `scripts/scan_guardrails.sh`
- `codex_tasks/task_499_guardrail_warn_cleanup_wave1.md`

Commands run (only if user asked or required by spec):
- `rg -n "text-rose-200|text-red-300|text-red-200|text-red-100|bg-red-500|border-red-" v10/src/features/collaboration/sharing/ai/TeacherApprovalPanel.tsx v10/src/features/collaboration/sharing/ai/StudentAIPromptBar.tsx v10/src/features/platform/mod-studio/theme/AIThemeGenerationPanel.tsx v10/src/features/governance/moderation/ModerationConsolePanel.tsx v10/src/features/editor/input-studio/schema/StructuredSchemaEditor.tsx || true`
- `bash scripts/scan_guardrails.sh`
- `bash scripts/check_mod_contract.sh && cd v10 && npm run lint && npm run build`

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
- AC-1 PASS: 대상 5개 파일에서 red/rose 하드코딩 클래스 매치 0건.
- AC-2 PASS: overlay step이 dynamic pointerClass/cursor-overlay/context pointer-events를 고려하도록 보정됨.
- AC-3 PASS: `scan_guardrails.sh` 실행 시 [1] 하드코딩 색상, [3] overlay 경고가 PASS로 전환.
- AC-4 PASS: `check_mod_contract.sh`, lint, build 통과.

Notes:
- `scan_guardrails.sh`의 NEXT_PUBLIC allowlist WARN은 의도된 운영 경고로 유지.
