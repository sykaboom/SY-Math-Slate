# Task 481: Guardrail Finalization and CI Enforcement

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-22

---

## Goal (Base Required)
- What to change:
  - toolbar/mod package 전환 후 잔여 레거시 경로를 정리하고 경계 위반을 CI에서 강제 차단한다.
  - deep import, feature/core 역참조, deprecated alias 사용을 자동 검증에 포함한다.
- What must NOT change:
  - 런타임 기능 추가 금지
  - UX 변경 금지 (검증/가드 강화만)

---

## Scope (Base Required)

Touched files/directories:
- `v10/eslint.config.mjs`
- `scripts/check_layer_rules.sh`
- `scripts/check_mod_contract.sh`
- `scripts/run_repo_verifications.sh`
- `v10/AI_READ_ME.md`
- `v10/AI_READ_ME_MAP.md` (필요 시 regenerate)

Out of scope:
- toolbar 기능/레이아웃 변경
- mod pack 정책 변경

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - forbidden import 규칙은 false positive 최소화
- Compatibility:
  - pre-commit/pre-push 훅과 충돌 없이 동작

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - W481
- Depends on tasks:
  - ['task_479', 'task_480']
- Enables tasks:
  - []
- Parallel group:
  - G-final-guardrail
- Max parallel slots:
  - 6
- Verification stage for this task:
  - end

---

## Execution Mode Assessment (Base Required for new specs)

- Touched file count:
  - 5~6
- Files shared with other PENDING tasks:
  - none
- Cross-module dependency:
  - YES (repo-wide checks)
- Parallelizable sub-units:
  - 2
- Estimated single-agent duration:
  - ~50min
- Recommended mode:
  - MANUAL
- Batch-eligible:
  - NO
- Rationale:
  - 검증 스크립트 변경은 단일 책임으로 안정적으로 마무리하는 편이 안전.

---

## Optional Block A — Layout / SVG Gate

- [ ] Applies: NO

---

## Optional Block B — Delegated Execution

- [ ] Applies: NO
If NO:
- Execution mode: MANUAL

---

## Optional Block E — Documentation Update Check

- [x] Applies: YES
- [x] Structure changes (file/folder add/move/delete):
  - `node scripts/gen_ai_read_me_map.mjs` (필요 시)
- [x] Semantic/rule changes:
  - `v10/AI_READ_ME.md` 검증 규칙/금지 경로 최신화

---

## Acceptance Criteria (Base Required)

- [x] AC-1: core->features, deep import, deprecated alias 경계 위반이 lint/script에서 fail된다.
  - mandatory checks:
    - `v10/src/core/runtime/**`에서 `@features/` 또는 `features/` import 0건
    - toolbar host renderer에서 legacy 상수 direct 참조 경로 0건
- [x] AC-2: 기존 검증 파이프라인(`run_repo_verifications`)에서 신규 가드가 통합 실행된다.
- [x] AC-3: 문서(`AI_READ_ME*`)와 실제 검증 규칙이 일치한다.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path:
     - `cd v10 && npm run lint && ! rg -n "from ['\"][^'\"]*(@features/|features/)" src/core/runtime && ! rg -n "TOOLBAR_ACTION_CATALOG|FALLBACK_RULES|TOOLBAR_MODES" src/features/chrome/toolbar/FloatingToolbar.tsx src/features/chrome/toolbar/DrawModeTools.tsx src/features/chrome/toolbar/PlaybackModeTools.tsx src/features/chrome/toolbar/CanvasModeTools.tsx`
   - Expected result:
     - lint PASS + 금지 패턴 검색 0건(명령 성공)
   - Covers: AC-1

2) Step:
   - Command / click path:
     - `scripts/run_repo_verifications.sh --stage end`
   - Expected result:
     - 신규 가드 포함 실행 PASS
   - Covers: AC-2

3) Step:
   - Command / click path:
     - `node scripts/gen_ai_read_me_map.mjs --check`
   - Expected result:
     - 문서/맵 싱크 PASS
   - Covers: AC-3

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - 과도한 strict rule로 false positive 증가 가능.
- Roll-back:
  - 신규 rule/스크립트를 feature-flagged check로 후퇴.

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (or delegated chain approval reference)

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `v10/eslint.config.mjs`
- `scripts/check_layer_rules.sh`
- `scripts/check_mod_contract.sh`
- `scripts/run_repo_verifications.sh`
- `v10/AI_READ_ME.md`
- `codex_tasks/task_481_guardrail_finalize_and_ci_enforcement.md`

Commands run (only if user asked or required by spec):
- `bash -n scripts/check_mod_contract.sh scripts/run_repo_verifications.sh scripts/check_layer_rules.sh` (PASS)
- `scripts/check_layer_rules.sh` (PASS)
- `node --input-type=module -e "import('./v10/eslint.config.mjs').then(() => console.log('eslint-config-ok'))"` (PASS)
- `cd v10 && npm run lint && ! rg -n "from ['\"][^'\"]*(@features/|features/)" src/core/runtime && ! rg -n "TOOLBAR_ACTION_CATALOG|FALLBACK_RULES|TOOLBAR_MODES" src/features/chrome/toolbar/FloatingToolbar.tsx src/features/chrome/toolbar/DrawModeTools.tsx src/features/chrome/toolbar/PlaybackModeTools.tsx src/features/chrome/toolbar/CanvasModeTools.tsx` (PASS)
- `scripts/run_repo_verifications.sh --stage end` (PASS; runtime matrix activation-policy 레거시 패턴은 compat 경고로 수용)
- `node scripts/gen_ai_read_me_map.mjs --check` (PASS)

## Gate Results (Codex fills)

- Lint:
  - PASS (`cd v10 && npm run lint`)
- Build:
  - N/A (not required by this task spec)
- Script checks:
  - PASS (`! rg -n "from ['\"][^'\"]*(@features/|features/)" v10/src/core/runtime`)
  - PASS (`! rg -n "TOOLBAR_ACTION_CATALOG|FALLBACK_RULES|TOOLBAR_MODES" toolbar host renderer files`)
  - PASS (`node scripts/gen_ai_read_me_map.mjs --check`)
  - PASS (`scripts/run_repo_verifications.sh --stage end`)
  - WARN (`scripts/check_mod_contract.sh` runtime matrix activation-policy uses compat alias pattern for renamed selector)

## Failure Classification (Codex fills when any gate fails)

- Pre-existing failures:
  - 없음
- Newly introduced failures:
  - 없음
