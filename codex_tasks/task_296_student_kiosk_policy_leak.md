# Task 296: 학생 키오스크 정책 누수 수정 (ThemePicker / Launcher 노출)

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-19

---

## 사전 감사 기록

```
[ VERIFIED ]
- panel-policy.ts:86-98: THEME_PICKER 정책
    roleOverride: {
      host: { visible: true, defaultOpen: false },
      student: { visible: true, defaultOpen: false },  ← 학생에게 visible: true
    }
  CORE_EDIT_ONLY_PANEL_POLICY_IDS (13-19줄)에 THEME_PICKER 없음 → edit-only 차단 미적용

- AppLayout.tsx:182:
    const showThemePicker = !isPresentation;
  → role 체크 없음. student 역할에서도 isPresentation=false면 showThemePicker=true

- AppLayout.tsx:280-298: panelLauncherEntries 생성 시
    windowHostPanels를 기반으로 launcher 항목 구성
    → THEME_PICKER가 windowHostPanels에 포함되면 launcher에도 표시됨
    → student가 launcher를 통해 ThemePicker 열기 가능
```

---

## Goal (Base Required)

- What to change:
  - `panel-policy.ts` — THEME_PICKER roleOverride: student visible: `false`로 수정
  - `AppLayout.tsx` — `showThemePicker`에 role 체크 추가 (host 또는 edit role에서만 true)
- What must NOT change:
  - host 역할에서 ThemePicker 동작 변경 없음
  - ThemePicker 컴포넌트 자체 변경 없음
  - Mod Studio에서의 ThemePicker 접근 변경 없음

---

## Scope (Base Required)

Touched files/directories (write):
- `v10/src/core/config/panel-policy.ts` — THEME_PICKER student: { visible: false }
- `v10/src/features/chrome/layout/AppLayout.tsx` — showThemePicker에 role 필터 추가

Out of scope:
- ThemePicker 컴포넌트 디자인 변경
- 다른 panel roleOverride 정책 일괄 수정
- role 시스템 리팩터링

---

## 변경 설계

```
[ panel-policy.ts ]
THEME_PICKER roleOverride 변경:
  student: { visible: false, defaultOpen: false }  // true → false

[ AppLayout.tsx ]
현재: const showThemePicker = !isPresentation;
변경(고정안): const showThemePicker = !isPresentation && runtimeRole === "host";
  - runtimeRole은 AppLayout에서 이미 `resolveExecutionRole(role)`로 계산됨
  - roleVisibilityPolicy에는 showThemePicker 필드가 없으므로 해당 가정 사용 금지
  - 최종 방어선은 panel-policy roleOverride(student.visible=false)
```

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - `panel-policy.ts` → core/config 레이어 (변경 없음)
  - `AppLayout.tsx` → features/layout 레이어 (변경 없음)
- Compatibility:
  - student 역할에서 ThemePicker 미노출은 기존 정책 의도와 일치
  - 기존 ThemePicker 기능(host) 회귀 없음

---

## DAG / Wave Metadata (Base Required)

- Wave ID: W-hotfix-P0
- Depends on tasks: [task_287 (SessionPolicy, role 시스템), task_293 (AppLayout host live wiring)]
- Enables tasks: [없음]
- Parallel group: G-hotfix-A (AppLayout.tsx 수정 — task_293, task_300과 파일 충돌)
- Max parallel slots: 1
- Verification stage: `end`

---

## Execution Mode Assessment (Base Required for new specs)

- Touched file count: 2
- Files shared with other PENDING tasks: `AppLayout.tsx` (task_293, task_300과 공유)
- Cross-module dependency: YES (core/config → features/layout)
- Parallelizable sub-units: 0
- Estimated single-agent duration: ~15min
- Recommended mode: DELEGATED
- Batch-eligible: NO (AppLayout.tsx 충돌 — task_293 완료 후 실행)
- Rationale: AppLayout 수정. task_293 이후, task_300 이전에 실행.

---

## Optional Block A — Layout / SVG Gate

- [x] Applies: NO

---

## Optional Block B — Delegated Execution

- [x] Applies: YES
- Execution mode: DELEGATED
- Delegation chain scope: task_296 only
- File ownership lock plan: 2개 파일 Implementer-A 단독
- Parallel slot plan: 내부 병렬 없음
- Scheduler plan:
  - Slot allocation mode: DYNAMIC
  - Requested orchestration mode: max orchestration mode on
  - Ready-queue refill trigger: task_293 완료 후
- Delegated closeout metrics: Peak 1 / Average 1 / Refill 1 / Reassignment 0

---

## Optional Block C — Hotfix Exception

- [x] Applies: NO

---

## Optional Block D — Speculative Defense Check

- [x] Applies: NO

---

## Optional Block E — Documentation Update Check

- [x] Applies: YES
- [x] Semantic/rule changes:
  - `v10/AI_READ_ME.md`: 학생 역할 패널 정책 규칙 명시 (THEME_PICKER = host-only)

---

## Acceptance Criteria (Base Required)

- [ ] AC-1: student 역할에서 ThemePicker 패널 미표시
- [ ] AC-2: student 역할에서 PanelLauncher에 ThemePicker 항목 미표시
- [ ] AC-3: host 역할에서 ThemePicker 정상 표시 (회귀 없음)
- [ ] AC-4: `npm run lint` 통과
- [ ] AC-5: `npm run build` 통과

---

## Manual Verification Steps (Base Required)

1) Step: 학생 역할 ThemePicker 미노출
   - role=student 설정 → ThemePicker 버튼/패널 미표시 확인
   - Covers: AC-1, AC-2

2) Step: 호스트 역할 회귀 없음
   - role=host → ThemePicker 정상 동작 확인
   - Covers: AC-3

3) Step: 빌드 확인
   - Command: `cd v10 && npm run lint && npm run build`
   - Covers: AC-4, AC-5

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - `showThemePicker`가 정책과 코드 이중 게이트가 되며 중복처럼 보일 수 있음
    → panel-policy를 SSOT로 유지하고, AppLayout runtimeRole 가드는 누수 방지용 보조 게이트로 명시
  - panel-policy.ts 변경이 다른 정책 계산에 cascade 영향 가능
    → THEME_PICKER만 변경, 다른 패널 정책 unchanged
- Roll-back: `git revert <commit>` 한 줄

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received

> task_293 완료 후 실행 (AppLayout.tsx 파일 충돌).

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `v10/src/core/config/panel-policy.ts`
- `v10/src/features/chrome/layout/AppLayout.tsx`

## Gate Results (Codex fills)

- Lint: PASS
- Build: PASS
- Script checks: PASS (`scripts/check_layer_rules.sh`)

Manual verification notes:
- `THEME_PICKER`의 student visibility를 `false`로 고정.
- AppLayout `showThemePicker`가 `runtimeRole === "host"` 조건을 따르도록 반영.
