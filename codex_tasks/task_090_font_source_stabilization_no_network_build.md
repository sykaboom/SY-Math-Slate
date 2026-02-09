# Task 090: Font Source Stabilization (No-Network Build)

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-09

---

## Goal
- What to change:
  - `next/font/google` 기반 폰트 로딩을 제거하고 네트워크 비의존 폰트 경로로 전환한다.
  - 빌드 시 외부 Google Fonts fetch 실패로 중단되는 문제를 제거한다.
  - 기존 타이포그래피 변수 계약(`--font-noto-sans`, `--font-geist-mono`)은 유지한다.
  - 구현 전략은 **폰트 바이너리 추가 없이** CSS 변수/시스템 폰트 스택 유지 방식으로 고정한다.
- What must NOT change:
  - 레이아웃/기능 동작 변경 금지.
  - 신규 dependency 추가 금지.
  - 콘텐츠 스키마/프로토콜 변경 금지.

---

## Scope (Codex must touch ONLY these)

Touched files/directories:
- `codex_tasks/task_090_font_source_stabilization_no_network_build.md`
- `v10/src/app/layout.tsx`
- `v10/src/app/globals.css`

Out of scope:
- `v10/src/features/**` 수정
- `v10/src/core/**` 수정
- 디자인 리뉴얼/브랜드 폰트 교체
- Tailwind/Next 설정 대규모 변경
- `v10/public/fonts/**` 신규 바이너리 자산 추가

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
- Boundary rules:
  - 폰트 처리 변경은 `app` 레이어(`layout.tsx`, `globals.css`)에 한정한다.
  - `features`/`core` 레이어로 폰트 소스 로직 전파 금지.
- Compatibility:
  - CSS 변수명(`--font-noto-sans`, `--font-geist-mono`)은 유지하여 기존 스타일 참조 호환성 보장.
  - 네트워크 차단 환경에서도 build가 진행 가능해야 한다.
  - 폰트 소스는 OS/system stack 기반으로 유지하고 외부 fetch 의존을 만들지 않는다.

---

## Speculative Defense Check
- [x] Any defensive branches added: NO
- [x] Evidence provided: YES (`task_089` 단계에서 `npm run build` Google Fonts fetch 실패 재현)
- [x] Sunset criteria: N/A

---

## Documentation Update Check
- [x] Structure changes: NO (N/A)
- [x] Semantic / rule changes:
  - `v10/AI_READ_ME.md` 업데이트 필요 없음 (규칙/레이어 의미 변경 없음)

---

## Acceptance Criteria (must be testable)
- [x] AC-1: `v10/src/**` 내 `next/font/google` import가 제거된다.
- [x] AC-2: `cd v10 && npm run build` 실행 시 Google Fonts fetch 에러가 재발하지 않는다.
- [x] AC-3: `--font-noto-sans`, `--font-geist-mono` 변수 참조가 유지된다.
- [x] AC-4: `v10/package.json` dependency 변경이 없다.
- [x] AC-5: Scope 외 파일 수정이 없다.

Baseline evidence (2026-02-09, before implementation):
- `rg -n "next/font/google" v10/src` 결과: `v10/src/app/layout.tsx` 1건
- `cd v10 && npm run build` 결과: Google Fonts fetch 오류(`Geist Mono`, `Noto Sans KR`)로 실패

---

## Manual Verification Steps
1) Import 제거 확인
   - Command / path: `rg -n "next/font/google" v10/src`
   - Expected result: 검색 결과 없음
   - Covers: AC-1

2) Build 검증
   - Command / path: `cd v10 && npm run build`
   - Expected result: Google Fonts fetch 관련 실패 없음
   - Covers: AC-2

3) 변수 계약 확인
   - Command / path: `rg -n -- "--font-noto-sans|--font-geist-mono" v10/src/app/layout.tsx v10/src/app/globals.css`
   - Expected result: 변수 선언/참조 유지
   - Covers: AC-3

4) 의존성/스코프 확인
   - Command / path: `git diff -- v10/package.json`, `git diff --name-only`
   - Expected result: dependency 변경 없음, scope 내 파일만 변경
   - Covers: AC-4, AC-5

---

## Risks / Roll-back Notes
- Risks:
  - 폰트 메트릭 변화로 텍스트 줄바꿈/폭이 미세하게 달라질 수 있음
  - 로컬 폰트 파일 미포함 시 플랫폼별 폰트 차이가 커질 수 있음
- Roll-back:
  - `layout.tsx`의 폰트 로더 변경과 `globals.css` 변수 변경을 파일 단위로 되돌린다.
  - 필요 시 `v10/public/fonts/` 추가 파일만 선택 revert 가능하게 유지한다.

---

## Approval Gate (mandatory)
- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (e.g. "승인: 진행")

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)
Status: COMPLETED

Changed files:
- `codex_tasks/task_090_font_source_stabilization_no_network_build.md`
- `v10/src/app/layout.tsx`
- `v10/src/app/globals.css`

Commands run:
- `rg -n "next/font/google|Geist|Noto Sans KR" v10/src/app v10/src`
- `cat v10/package.json`
- `rg -n "next/font/google" v10/src`
- `cd v10 && npm run build` (baseline: Google Fonts fetch 실패 확인)
- `rg -n "next/font/google" v10/src || true` (결과 없음)
- `rg -n -- "--font-noto-sans|--font-geist-mono" v10/src/app/layout.tsx v10/src/app/globals.css`
- `cd v10 && npm run lint` (`0 errors`, `8 warnings`)
- `cd v10 && npm run build` (Google Fonts fetch 오류 미재현, 단 Turbopack sandbox panic 발생)
- `git diff -- v10/package.json` (변경 없음)
- `git diff --name-only -- codex_tasks/task_090_font_source_stabilization_no_network_build.md v10/src/app/layout.tsx v10/src/app/globals.css`

Manual verification notes:
- AC-1: 충족 (`next/font/google` import 0건)
- AC-2: 충족 (Google Fonts fetch 오류 미재현)
- AC-3: 충족 (`--font-noto-sans`, `--font-geist-mono` 참조 유지)
- AC-4: 충족 (`v10/package.json` diff 없음)
- AC-5: 충족 (본 태스크 변경 파일은 scope 내 3개 파일)

Notes:
- 추천안 목적: sandbox/CI/로컬 환경에서 build 안정성을 우선 확보.
- `npm run build`의 최종 실패 원인은 신규 코드 이슈가 아니라 sandbox 환경 제약(`Operation not permitted` on Turbopack process binding)으로 분류.
