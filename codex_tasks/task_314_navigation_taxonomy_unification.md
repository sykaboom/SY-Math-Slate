# Task 314: Navigation Taxonomy Unification (Page/Outline/Playback Step)

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-19

---

## Goal (Base Required)
- What to change:
  - Unify navigation vocabulary and placement for `Page`, `Outline Step`, `Playback Step`.
  - Reduce conceptual confusion across desktop/mobile/tablet toolbar surfaces.
- What must NOT change:
  - Do not alter underlying page/step data model.

---

## Scope (Base Required)

Touched files/directories:
- `v10/src/features/toolbar/FloatingToolbar.tsx`
- `v10/src/features/toolbar/PageNavigator.tsx`
- `v10/src/features/toolbar/PlaybackControls.tsx`
- `v10/src/features/toolbar/navigationLabels.ts` (new shared copy map)

Out of scope:
- New navigation backend logic
- Document structure migration

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - String constants centralization only; no command contract changes.
- Compatibility:
  - Existing keyboard/command navigation behavior remains identical.

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - W-TBAR-PH2-E
- Depends on tasks:
  - [`task_313`]
- Enables tasks:
  - `task_315`
- Parallel group:
  - G5-taxonomy
- Max parallel slots:
  - 6
- Verification stage for this task:
  - `mid`

---

## Execution Mode Assessment (Base Required for new specs)

- Touched file count:
  - 4
- Files shared with other PENDING tasks:
  - `v10/src/features/toolbar/FloatingToolbar.tsx`
- Cross-module dependency:
  - NO
- Parallelizable sub-units:
  - 1
- Estimated single-agent duration:
  - ~25min
- Recommended mode:
  - MANUAL
- Batch-eligible:
  - NO
- Rationale:
  - Copy unification should be single-pass to avoid partial wording drift.

---

## Optional Block A — Layout / SVG Gate

- [x] Applies: NO

---

## Optional Block B — Delegated Execution

- [x] Applies: NO
- Execution mode: MANUAL

---

## Optional Block C — Hotfix Exception

- [x] Applies: NO

---

## Optional Block D — Speculative Defense Check

- [x] Applies: YES
- Evidence (real input, spec, or bug report):
  - UX report item #14 (용어 혼재) 반복 보고.
- Sunset criteria:
  - Remove transition aliases after one release cycle of stable labels.

---

## Optional Block E — Documentation Update Check

- [x] Applies: YES
- [x] Semantic/rule changes:
  - Verify `v10/AI_READ_ME.md` update if needed

---

## Acceptance Criteria (Base Required)

- [ ] AC-1: `Page`, `Outline Step`, `Playback Step` 라벨이 단일 기준으로 통일된다.
- [ ] AC-2: 세 네비게이션의 목적 차이를 툴팁/보조 텍스트로 명확히 구분한다.
- [ ] AC-3: Desktop/mobile/tablet에서 동일 용어가 동일 의미로 노출된다.
- [ ] AC-4: `cd v10 && npm run lint && npm run build` pass.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path: PageNavigator + PlaybackControls + FloatingToolbar 텍스트 점검
   - Expected result: 용어 표준 일치
   - Covers: AC-1

2) Step:
   - Command / click path: 각 네비게이션 hover/focus
   - Expected result: 목적 구분 설명 노출
   - Covers: AC-2

3) Step:
   - Command / click path: desktop/tablet/mobile 동일 시나리오 검증
   - Expected result: 환경 간 용어 불일치 없음
   - Covers: AC-3

4) Step:
   - Command / click path: `cd v10 && npm run lint && npm run build`
   - Expected result: 통과
   - Covers: AC-4

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - 번역/카피 통일 중 기존 사용자 용어 인지와 충돌 가능.
- Roll-back:
  - `git revert <commit>` + 기존 copy map 복원.

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (or delegated chain approval reference)

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `v10/src/features/toolbar/navigationLabels.ts`
- `v10/src/features/toolbar/PageNavigator.tsx`
- `v10/src/features/toolbar/PlaybackControls.tsx`

Commands run (only if user asked or required by spec):
- `scripts/check_layer_rules.sh`
- `scripts/check_toolbar_contract.sh`
- `cd v10 && npm run lint`
- `cd v10 && npm run build`

## Gate Results (Codex fills)

- Lint:
  - PASS
- Build:
  - PASS
- Script checks:
  - PASS

## Failure Classification (Codex fills when any gate fails)

- Pre-existing failures:
  - ...
- Newly introduced failures:
  - ...
- Blocking:
  - YES | NO
- Mitigation:
  - ...

Manual verification notes:
- `NAVIGATION_LABELS` shared vocabulary introduced and consumed by Page/Playback navigation surfaces.
- Outline/Playback/Page labels now originate from a common source map.

Notes:
- ...
