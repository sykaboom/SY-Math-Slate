# Task 502: Remove Vercel Next.js root mismatch warning (`turbopack.root`)

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-22

---

## Goal (Base Required)
- What to change:
  - `v10/next.config.ts`에서 `turbopack.root` 명시 설정을 제거해 Vercel의 `outputFileTracingRoot`와 충돌 경고를 없앤다.
- What must NOT change:
  - 앱 런타임 동작/라우트/빌드 결과물 동작 변경 금지.

---

## Scope (Base Required)

Touched files/directories:
- `v10/next.config.ts`
- `codex_tasks/task_502_remove_turbopack_root_warning.md`

Out of scope:
- 다른 Next.js 최적화 옵션 변경
- Vercel 프로젝트 설정 변경

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - 설정 최소 변경(단일 필드 제거)만 허용.
- Compatibility:
  - `npm run build` 성공 유지.

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - W-HOTFIX-NEXT-WARNING-01
- Depends on tasks:
  - `task_501`
- Enables tasks:
  - `[]`
- Parallel group:
  - G-HOTFIX
- Max parallel slots:
  - 6
- Verification stage for this task:
  - `end`

---

## Execution Mode Assessment (Base Required for new specs)

- Touched file count:
  - 2
- Files shared with other PENDING tasks:
  - none
- Cross-module dependency:
  - NO
- Parallelizable sub-units:
  - 0
- Estimated single-agent duration:
  - `~5min`
- Recommended mode:
  - MANUAL
- Batch-eligible:
  - NO
- Rationale:
  - 단일 설정 파일 조정이며 병렬 분할 이득 없음.

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

- [x] AC-1: `v10/next.config.ts`에서 `turbopack.root` 설정이 제거된다.
- [x] AC-2: `cd v10 && npm run build`가 PASS 한다.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path:
     - `sed -n '1,80p' v10/next.config.ts`
   - Expected result:
     - `turbopack.root` 항목이 없음.
   - Covers: AC-1

2) Step:
   - Command / click path:
     - `cd v10 && npm run build`
   - Expected result:
     - 빌드 성공.
   - Covers: AC-2

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - 없음(Next 기본값으로 복귀).
- Roll-back:
  - `v10/next.config.ts`의 기존 `turbopack.root` 재추가.

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (or delegated chain approval reference)
  - User quote: "경고 제거는 ok."

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `v10/next.config.ts`
- `codex_tasks/task_502_remove_turbopack_root_warning.md`

Commands run (only if user asked or required by spec):
- `cd v10 && npm run build`

## Gate Results (Codex fills)

- Lint:
  - N/A
- Build:
  - PASS
- Script checks:
  - N/A

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
- AC-1: PASS
- AC-2: PASS
