# Task 301: 테마 하드코딩 색상 제거 (PublicToggle / ShareButton)

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-19

---

## 사전 감사 기록

```
[ VERIFIED ]
- PublicToggle.tsx:25:
    isPublic ? "bg-emerald-500/15 text-emerald-200 hover:bg-emerald-500/25"
  → 하드코딩 Tailwind 색상 — 테마 변경 시 이 버튼만 항상 초록색

- ShareButton.tsx:144-148:
    status === "copied"
      ? "bg-emerald-500/15 text-emerald-200 hover:bg-emerald-500/25"  // Copied 상태
      : status === "error"
        ? "bg-rose-500/15 text-rose-200 hover:bg-rose-500/25"  // Error 상태
  → 성공(emerald)/실패(rose) 모두 하드코딩

- useToolStore.ts:32: penColor: "#FFFF00"
  → 펜 기본 색상. 콘텐츠 레벨(잉크 색상), UI 크롬이 아님 — 변경 범위에서 제외

- PenControls.tsx:13-17: 스와치 색상 값 (#FFFF00 등)
  → 사용자가 선택하는 잉크 색상 — 테마 토큰화 대상 아님 (콘텐츠 색상)
  → bg-swatch-yellow 등 CSS 클래스는 테마 변수 연결 가능하지만 MVP 범위 외

[ 범위 결정 ]
- 수정 대상: PublicToggle.tsx, ShareButton.tsx (UI 크롬 상태 색상)
- 제외: useToolStore 기본 펜 색상, PenControls 스와치 값 (콘텐츠 색상)
```

---

## Goal (Base Required)

- What to change:
  - `PublicToggle.tsx` — `bg-emerald-500/15 text-emerald-200` → 테마 토큰 클래스 교체
  - `ShareButton.tsx` — "copied" 상태 emerald, "error" 상태 rose → 테마 토큰 교체
- What must NOT change:
  - 상태별 시각적 피드백 (성공/실패 구분) 유지
  - 버튼 기능 변경 없음
  - useToolStore / PenControls 변경 없음

---

## Scope (Base Required)

Touched files/directories (write):
- `v10/src/features/collaboration/sharing/PublicToggle.tsx` — isPublic 상태 색상 테마 토큰화
- `v10/src/features/collaboration/sharing/ShareButton.tsx` — copied/error 상태 색상 테마 토큰화

Out of scope:
- useToolStore.ts 펜 기본 색상 변경
- PenControls.tsx 스와치 색상 변경
- globals.css 테마 변수 추가 (기존 theme-success/theme-danger 활용)

---

## 변경 설계

```
테마 토큰 활용(고정안):
  - success 상태: `--theme-success`, `--theme-success-soft`
  - error 상태: `--theme-danger`, `--theme-danger-soft`

[ PublicToggle.tsx ]
Before:
  isPublic ? "bg-emerald-500/15 text-emerald-200 hover:bg-emerald-500/25"
After (단일안):
  isPublic
    ? "bg-[var(--theme-success-soft)] text-[var(--theme-success)] hover:bg-[var(--theme-success-soft)]"
    : 기존 클래스 유지

[ ShareButton.tsx ]
copied 상태:
  "bg-[var(--theme-success-soft)] text-[var(--theme-success)] hover:bg-[var(--theme-success-soft)]"
error 상태:
  "bg-[var(--theme-danger-soft)] text-[var(--theme-danger)] hover:bg-[var(--theme-danger-soft)]"
```

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules: features/sharing 레이어 변경 없음
- Compatibility:
  - `var(--theme-success)` / `var(--theme-danger)` 가 globals.css에 정의되어 있어야 함
    → 기존 테마 시스템에서 정의된 토큰 사용 (chalk/parchment/notebook 모두 정의됨 확인 필요)
  - Tailwind arbitrary value는 `/opacity` 결합 없이 단일 변수 참조 형식만 사용

---

## DAG / Wave Metadata (Base Required)

- Wave ID: W-hotfix-P1
- Depends on tasks: [task_294 (ShareButton.tsx 파일 선행 수정 완료 후)]
- Enables tasks: [없음]
- Parallel group: G-hotfix-P1 (task_298, task_299, task_300과 병렬 가능)
- Max parallel slots: 1
- Verification stage: `end`

---

## Execution Mode Assessment (Base Required for new specs)

- Touched file count: 2
- Files shared with other PENDING tasks: `ShareButton.tsx` (task_294와 공유 — task_294 먼저)
- Cross-module dependency: NO
- Parallelizable sub-units: 0
- Estimated single-agent duration: ~20min
- Recommended mode: DELEGATED
- Batch-eligible: NO (ShareButton.tsx 파일 충돌 — task_294 완료 후 실행)
- Rationale: task_294 완료 후 ShareButton.tsx에 접근. 그 외 P1 그룹과 병렬 가능.

---

## Optional Block A — Layout / SVG Gate

- [x] Applies: NO

---

## Optional Block B — Delegated Execution

- [x] Applies: YES
- Execution mode: DELEGATED
- Delegation chain scope: task_301 only
- File ownership lock plan: 2개 파일 Implementer-A 단독
- Parallel slot plan: 내부 병렬 없음
- Scheduler plan:
  - Slot allocation mode: DYNAMIC
  - Requested orchestration mode: max orchestration mode on
  - Ready-queue refill trigger: task_294 완료 후
- Delegated closeout metrics: Peak 1 / Average 1 / Refill 1 / Reassignment 0

---

## Optional Block C — Hotfix Exception

- [x] Applies: NO

---

## Optional Block D — Speculative Defense Check

- [x] Applies: NO

---

## Optional Block E — Documentation Update Check

- [x] Applies: NO (색상 토큰 사용 원칙은 기존 AI_READ_ME에 명시됨)

---

## Acceptance Criteria (Base Required)

- [ ] AC-1: parchment 테마에서 PublicToggle "Public" 상태가 테마 success 색상으로 표시됨
- [ ] AC-2: chalk 테마에서 ShareButton "Copied" 상태가 하드코딩 녹색(emerald)이 아닌 테마 색상으로 표시
- [ ] AC-3: ShareButton "error" 상태가 테마 danger 색상으로 표시
- [ ] AC-4: `npm run lint` 통과
- [ ] AC-5: `npm run build` 통과

---

## Manual Verification Steps (Base Required)

1) Step: 테마 전환 시 색상 변화 확인
   - Theme Picker에서 parchment → chalk 전환 → PublicToggle/ShareButton 색상이 테마 따라 변화 확인
   - Covers: AC-1, AC-2

2) Step: 에러 상태 색상 확인
   - 공유 실패 유도(서버 미설정) → ShareButton 에러 색상이 테마 danger 확인
   - Covers: AC-3

3) Step: 빌드 확인
   - Command: `cd v10 && npm run lint && npm run build`
   - Covers: AC-4, AC-5

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - `var(--theme-success)` 가 일부 테마에서 미정의일 수 있음 → fallback 색상 또는 다른 토큰 사용
  - Tailwind arbitrary value `/10` opacity 문법이 CSS 변수와 호환 안 될 수 있음
    → `bg-theme-surface-overlay` + `text-[var(--theme-success)]` 분리 접근으로 fallback
- Roll-back: `git revert <commit>` 한 줄

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received

> task_294(ShareButton async 변환) 완료 후 실행.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `v10/src/features/collaboration/sharing/PublicToggle.tsx`
- `v10/src/features/collaboration/sharing/ShareButton.tsx`

## Gate Results (Codex fills)

- Lint: PASS
- Build: PASS
- Script checks: PASS (`scripts/check_layer_rules.sh`)

Manual verification notes:
- 공유 상태 색상(`copied`/`error`)을 테마 토큰 기반 클래스로 치환.
- 기능 로직/상태 분기는 유지.
