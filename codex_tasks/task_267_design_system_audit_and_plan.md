# Task 267: UI/UX 디자인 시스템 점검 및 정비 기획안

Status: SUPERSEDED (replaced by task_269 / task_270 / task_271)
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-17

---

## Goal (Base Required)
- What to change:
  - globals.css의 색상 토큰 정리 (141개 → ~60개 목표)
  - 모듈별 스타일 격리 강화 (글로벌에 섞인 feature-specific CSS 분리)
  - 디자인 시스템 정책 문서화 (색상 팔레트, 간격, 타이포그래피 규칙)
- What must NOT change:
  - 현재 작동하는 UI의 시각적 결과물 (리팩토링이지 리디자인이 아님)
  - Tailwind + CVA 기반 아키텍처 (기존 패턴 유지)
  - 컴포넌트 API/props (외부 인터페이스 불변)

---

## Scope (Base Required)

Touched files/directories:
- `v10/src/app/globals.css` (read/write) — 토큰 정리 대상
- `v10/tailwind.config.ts` (read/write) — 커스텀 컬러 매핑 정리
- `v10/src/features/*/` (read) — 모듈별 스타일 사용 현황 조사
- `v10/src/ui/components/` (read) — 베이스 컴포넌트 패턴 확인

Out of scope:
- 새로운 디자인 시스템 라이브러리 도입
- 기존 Tailwind/CVA 아키텍처 변경
- 컴포넌트 기능 로직 수정

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - globals.css는 토큰 정의만 담당 (feature CSS 금지)
  - 각 feature 모듈은 자체 CSS 또는 Tailwind만 사용
- Compatibility:
  - 시각적 회귀 제로 (before/after 스크린샷 비교)

---

## DAG / Wave Metadata (Base Required)

- Wave ID: W2
- Depends on tasks: [task_266]
- Enables tasks: []
- Parallel group: G2-ui
- Max parallel slots: 6
- Verification stage for this task: `end`

---

# 현황 진단 보고서

---

## 1. 색상 토큰 현황 (globals.css 분석)

### 정의된 CSS 변수: 141개

| 카테고리 | 변수 수 | 상태 |
|---|---|---|
| 툴바 RGB 기본값 (dark/light) | 20 | 사용 중 |
| 테마 시맨틱 (surface/text/border/accent) | 12 | 사용 중 (핵심) |
| 시맨틱 상태 (success/warning/danger) | 6 | 사용 중 |
| 네온 시스템 (neon-*) | 8 | **swatch와 중복** |
| 스와치 시스템 (swatch-*) | 12 | **neon과 중복** |
| 초크 시스템 (chalk-*) | 10 | **사용되지 않음 (dead code)** |
| 레거시 폴백 (bg-color 등) | 12 | **재할당됨 (혼란 유발)** |
| shadcn/ui 기본 (background/foreground 등) | 32 | 사용 중 |
| 사이드바 (sidebar-*) | 8 | **사용되지 않음** |
| 차트 컬러 (chart-*) | 5 | **사용되지 않음** |
| 슬레이트/커서 | 3 | 사용 중 |
| 그림자 | 3 | 사용 중 |
| 기타 (z-index, radius, font) | 10 | 부분 사용 |

### 문제점 요약

**즉시 제거 가능 (dead code): ~28개**
- chalk-* 10개: 코드베이스에서 참조 없음
- sidebar-* 8개: 사이드바 UI 미사용
- chart-* 5개: 차트 기능 미사용
- 레거시 폴백 중 재할당된 5개

**통합 필요 (중복): ~8개**
- neon-yellow == swatch-yellow == #ffff00 (같은 색을 3번 정의)
- neon-cyan == swatch-cyan == #00ffff
- neon-pink == swatch-pink == #ff10f0
- neon-green == swatch-green == #39ff14

---

## 2. 프로가 하는 디자인 토큰 전략

### 업계 표준 3단계 토큰 구조

```
Layer 1: Primitive (원시값)
  gray-900: #1a1a2e
  blue-500: #3b82f6

Layer 2: Semantic (의미)
  surface-primary: var(--gray-900)
  text-muted: var(--gray-400)
  accent: var(--blue-500)

Layer 3: Component (컴포넌트별)
  button-bg: var(--accent)
  toolbar-text: var(--text-muted)
```

**현재 이 프로젝트의 상태:**
- Layer 2(시맨틱)는 `--theme-surface`, `--theme-text` 등으로 잘 구축됨
- Layer 1(원시값)은 없고, 하드코딩된 hex/rgb가 직접 Layer 2에 들어감
- Layer 3(컴포넌트별)은 `toolbar-*`에서만 존재, 나머지 모듈은 Layer 2를 직접 참조

### 권장 색상 팔레트 규모

| 앱 규모 | 원시 컬러 | 시맨틱 토큰 | 총계 |
|---|---|---|---|
| 소규모 (landing page) | 5~10 | 10~15 | 15~25 |
| 중규모 (SaaS 도구) | 10~15 | 20~30 | 30~50 |
| **이 프로젝트 적정** | **12~16** | **25~35** | **~50~60** |
| 대규모 (디자인 시스템) | 20~30 | 40~60 | 60~100 |

**현재 141개 → 약 60개로 줄이면 적정 수준.**

---

## 3. 모듈별 리팩토링 상태 점검

### 잘 된 부분

| 항목 | 점수 | 설명 |
|---|---|---|
| Tailwind 일관성 | 8/10 | 72개 컴포넌트가 `cn()` 유틸리티 사용, CSS-in-JS 없음 |
| CVA 변형 관리 | 8/10 | Button, Toggle 등 기본 컴포넌트에 type-safe variant |
| 툴바 모듈 격리 | 9/10 | `toolbar-*` 접두사로 완벽 스코핑 |
| 하드코딩 색상 없음 | 9/10 | 컴포넌트에 직접 hex 없음, 모두 토큰 경유 |

### 개선 필요한 부분

| 항목 | 점수 | 설명 |
|---|---|---|
| globals.css 범위 오염 | 5/10 | 캔버스/레이아웃 전용 CSS ~150줄이 글로벌에 섞여있음 |
| 색상 중복 | 4/10 | neon/swatch/chalk 3중 정의 |
| 임의 크기 | 6/10 | `text-[11px]` 같은 Tailwind 이탈 약 5건 |
| 애니메이션 토큰 없음 | 5/10 | duration-200 등 하드코딩 |
| z-index 관리 | 5/10 | 토큰 정의는 있으나 실제 사용은 Tailwind 기본값 |

### globals.css에 섞인 feature-specific CSS (분리 대상)

```
줄 267~420 (약 150줄):
├── mjx-container 오버라이드 → 캔버스 전용
├── .step-badge → 캔버스 전용
├── .hl-yellow, .hl-cyan → 캔버스 하이라이트 전용
├── .tw-char, .tw-visible → 캔버스 타자기 효과 전용
├── .force-break, .line-break-spacer → 레이아웃 전용
├── .editing-breaks → 에디터 전용
└── .prompter-glass → 프롬프터 전용
```

---

## 4. 인터페이스 통일성 정책 점검

### 현재 존재하는 정책

| 정책 | 어디서 | 강제력 |
|---|---|---|
| CVA 변형 제한 | ui/components/button.tsx 등 | 컴파일 타임 (타입) |
| `cn()` 클래스 머지 | @core/utils | 런타임 (충돌 해결) |
| 툴바 토큰 스코프 | globals.css toolbar-* | 관례 (강제 아님) |
| 역할별 visibility | panel-policy.ts | 런타임 (정책 엔진) |
| 간격 체계 | Tailwind 기본 스케일 | 관례 (강제 아님) |

### 없는 정책 (추가 권장)

| 필요한 정책 | 왜 필요한가 |
|---|---|
| **컬러 팔레트 가이드** | 모듈 개발자가 새 색상을 임의로 추가하는 것 방지 |
| **간격 스케일 문서** | gap-1~4, p-2~6 외 임의값 사용 방지 |
| **폰트 크기 스케일** | text-[11px] 같은 이탈 방지, 허용 크기 명시 |
| **애니메이션 토큰** | duration/easing 일관성 |
| **모듈별 CSS 스코프 규칙** | "globals.css에 feature CSS 금지" 명문화 |
| **신규 토큰 추가 프로세스** | PR 리뷰 시 정당성 검증 |

---

## 5. 단계별 실행 기획안

### Phase 1: Dead Code 제거 (위험 최소)
- chalk-* 10개 변수 삭제
- sidebar-* 8개 변수 삭제
- chart-* 5개 변수 삭제
- 레거시 폴백 중 재할당된 변수 정리

**예상 결과:** 141 → ~118개 (23개 감소)

### Phase 2: 중복 통합 (neon/swatch 합치기)
- neon-*과 swatch-* 중 하나를 정식으로 선택 (swatch 권장 — 더 일반적)
- 나머지를 alias로 전환 후 점진적 제거
- 코드베이스 내 참조 일괄 치환

**예상 결과:** ~118 → ~106개 (12개 감소)

### Phase 3: Feature CSS 분리
- globals.css에서 캔버스/레이아웃 전용 CSS 추출
- 각 feature 디렉토리에 전용 CSS 모듈 또는 Tailwind @layer 사용
- globals.css는 순수 토큰 정의 + 리셋만 유지

**예상 결과:** globals.css 431줄 → ~280줄

### Phase 4: 디자인 토큰 3단계 정립
- Layer 1 (Primitive): 원시 컬러 팔레트 12~16색 정의
- Layer 2 (Semantic): 기존 theme-* 유지, primitive 참조로 전환
- Layer 3 (Component): toolbar-* 패턴을 다른 모듈에도 적용

### Phase 5: 정책 문서화
- 디자인 시스템 가이드 작성 (허용 컬러/간격/폰트 크기)
- globals.css 변경 시 리뷰 체크리스트 추가
- AI_READ_ME.md에 디자인 토큰 규칙 반영

---

## Optional Block A — Layout / SVG Gate

- [x] Applies: NO

---

## Optional Block B — Delegated Execution

- [x] Applies: NO

If NO:
- Execution mode: MANUAL

---

## Optional Block C — Hotfix Exception

- [x] Applies: NO

---

## Optional Block D — Speculative Defense Check

- [x] Applies: NO

---

## Optional Block E — Documentation Update Check

- [x] Applies: YES
- If YES:
  - [ ] Structure changes:
    - feature CSS 분리 시 새 파일 생성 가능 → AI_READ_ME_MAP 업데이트
  - [ ] Semantic/rule changes:
    - 디자인 토큰 규칙 → AI_READ_ME.md 반영

---

## Acceptance Criteria (Base Required)

- [ ] AC-1: globals.css의 CSS 변수 수가 70개 이하로 감소
- [ ] AC-2: chalk-*, sidebar-*, chart-* 변수가 완전 삭제됨
- [ ] AC-3: neon/swatch 중복이 하나로 통합됨
- [ ] AC-4: globals.css에 feature-specific CSS(mjx, .hl-*, .tw-char 등)가 없음
- [ ] AC-5: 분리된 feature CSS가 각 모듈 디렉토리에 존재
- [ ] AC-6: 시각적 회귀 없음 (before/after 스크린샷 동일)
- [ ] AC-7: `npm run lint` 통과
- [ ] AC-8: `npm run build` 통과

---

## Manual Verification Steps (Base Required)

1) Step: dead code 변수 삭제 확인
   - Command / click path: globals.css에서 chalk, sidebar, chart 검색
   - Expected result: 해당 변수 0건
   - Covers: AC-2

2) Step: neon/swatch 통합 확인
   - Command / click path: globals.css에서 neon 검색
   - Expected result: swatch로 통합되어 neon 정의 없음 (또는 alias만)
   - Covers: AC-3

3) Step: feature CSS 분리 확인
   - Command / click path: globals.css에서 mjx-container, .hl-, .tw-char 검색
   - Expected result: 0건 (feature 디렉토리로 이동됨)
   - Covers: AC-4, AC-5

4) Step: 시각적 회귀 확인
   - Command / click path: `npm run dev` → 호스트 모드 → 캔버스/툴바/패널 확인
   - Expected result: 기존과 동일한 렌더링
   - Covers: AC-6

5) Step: build 확인
   - Command / click path: `cd v10 && npm run lint && npm run build`
   - Expected result: 에러 없이 통과
   - Covers: AC-7, AC-8

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - feature CSS 분리 시 import 순서에 따라 스타일 우선순위가 바뀔 수 있음
  - neon→swatch 통합 시 참조 누락으로 일부 색상이 깨질 수 있음
- Roll-back:
  - Phase별 개별 커밋으로 관리하여 단계별 revert 가능
  - `git revert` 또는 `git checkout -- v10/src/app/globals.css` 로 즉시 복원

---

## Approval Gate (Base Required)

- [ ] Spec self-reviewed by Codex
- [ ] Explicit user approval received

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: PENDING

Changed files:
- ...

Commands run:
- ...

## Gate Results (Codex fills)

- Lint: N/A
- Build: N/A
- Script checks: N/A

## Failure Classification (Codex fills when any gate fails)

- N/A

Manual verification notes:
- N/A

Notes:
- Phase 1~2는 낮은 위험도로 즉시 실행 가능
- Phase 3~5는 시각적 영향이 있으므로 before/after 스크린샷 필수
- This monolithic spec is superseded and must not be executed directly.
- Execute replacement specs in order: `task_269 -> task_270 -> task_271`.
