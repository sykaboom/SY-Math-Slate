# Feature Alignment Matrix (Draft)

Status: ARCHIVE-DRAFT (reference only, not execution SSOT)

Execution priority and implementation order are governed by:
- `PROJECT_ROADMAP.md`
- approved `codex_tasks/task_*.md`

## 이것은 무엇인가?
레거시(single-file), v10, math‑pdf‑builder의 기능/UX를 한눈에 비교하는 표입니다.  
목표는 “지금 있는 것 / 없는 것 / 부분적으로 있는 것”을 명확히 해 통합 파이프라인을 설계할 때 **우선순위와 갭**을 빠르게 파악하는 것입니다.

## 범위
- Legacy: `legacy_archive/phase1_2026-02-15/수학_판서도구_v9.9.html` 단일 참조 파일
- v10: `v10/` Next.js 앱
- math‑pdf‑builder: 로컬 저장소 `/home/sykab/workspace/math-pdf-builder-public-codex`

## 표기(legend)
- ✅ = 명확히 구현됨(문서/코드 근거 존재)
- 🟡 = 부분 구현/스캐폴드/문서 근거 부족
- ❌ = 미구현 또는 문서 근거 없음

---

## 1) 입력 & 편집
| 기능 | 레거시 (single-file) | v10 | math‑pdf‑builder | 갭/메모 |
|---|---|---|---|---|
| 단계별 텍스트 진행(스텝) | ✅ | ✅ | ❌ | v10은 스텝 기반 플레이백 + 글자 단위 애니메이션(AnimatedTextBlock) |
| 리치 텍스트 스타일(강조/스텝 표시) | ✅ | 🟡 | 🟡 | v10 Data Input에서 하이라이트/수식 래핑 지원(범용 리치 편집은 제한적) |
| 블록 목록 편집 + 대량 선택 | ✅ | 🟡 | ❌ | v10은 Data Input 패널이 있으나 블록 리스트 UX는 불명 |
| AI 데이터 입력 패널 | ❌ | ✅ | ✅ | v10 Data Input 패널, pdf‑builder는 Alt+I |
| 붙여넣기 보조(이미지/텍스트) | ✅ | 🟡 | ❌ | v10은 이미지 붙여넣기 지원, 텍스트 보조 UX는 불명 |

## 2) 레이아웃 & 페이지네이션
| 기능 | 레거시 (single-file) | v10 | math‑pdf‑builder | 갭/메모 |
|---|---|---|---|---|
| 자동 페이지 넘김(오버플로우) | ✅ | ✅ | 🟡 | pdf‑builder의 자동 페이지 처리 문서화 부족 |
| 컬럼 수 제어 | ✅ | ✅ | ✅ | v10은 `pageColumnCounts`로 관리 |
| 수동 브레이크(라인/컬럼/페이지) | ✅ | ✅ | 🟡 | pdf‑builder는 2단 전환 삽입 제공 |
| 머릿말/꼬릿말 템플릿 | ❌ | ❌ | ✅ | v10의 페이지 템플릿 없음 |
| 오버뷰/페이지 맵 | ❌ | ✅ | ❌ | v10 Overview 모드 |

## 3) 렌더링 & 수식
| 기능 | 레거시 (single-file) | v10 | math‑pdf‑builder | 갭/메모 |
|---|---|---|---|---|
| MathJax 렌더링 | ✅ | ✅ | ✅ | pdf‑builder는 서비스 레이어에 MathJax |
| `$...$`, `$$...$$` 지원 + 규칙 | 🟡 | ✅ | ✅ | v10은 displaystyle/frac 보정 규칙 명시 |
| 렌더 모드 토글 | ❌ | ❌ | ✅ | pdf‑builder는 렌더링 적용/해제 |
| HTML sanitize 파이프라인 | ✅ | ✅ | 🟡 | v10은 DOMPurify로 sanitize 수행 |

## 4) 미디어
| 기능 | 레거시 (single-file) | v10 | math‑pdf‑builder | 갭/메모 |
|---|---|---|---|---|
| 이미지 삽입/붙여넣기 | ✅ | ✅ | ✅ | |
| 이미지 리사이즈/변형 | ✅ | 🟡 | 🟡 | v10/ pdf‑builder에서 상세 UX 불명 |
| 단계별 오디오 | ❌ | ✅ | ❌ | v10은 `audioByStep` |
| 레이저 포인터 | ✅ | ✅ | ❌ | v10에 레이저 도구 구현 |

## 5) 플레이백 & 프레젠테이션
| 기능 | 레거시 (single-file) | v10 | math‑pdf‑builder | 갭/메모 |
|---|---|---|---|---|
| 스텝 기반 플레이백 | ✅ | ✅ | ❌ | |
| 자동 재생/딜레이 | 🟡 | ✅ | ❌ | 레거시는 타이핑 속도는 있으나 자동 진행은 불명 |
| 애니메이션 엔진 | 🟡 | ✅ | ❌ | 레거시는 타이핑 애니메이션 중심 |
| 프레젠테이션/오버뷰 | ❌ | ✅ | ❌ | |

## 6) 저장 & 파일 I/O
| 기능 | 레거시 (single-file) | v10 | math‑pdf‑builder | 갭/메모 |
|---|---|---|---|---|
| Doc‑only 저장(세션 분리) | ❌ | ✅ | 🟡 | pdf‑builder는 패키지 저장(세션 분리 여부 불명) |
| 자동 저장 | ❌ | ✅ | ❌ | |
| 패키지 내보내기(+assets) | ❌ | ✅ | ✅ | `.slate` vs `.msk` |
| 패키지 가져오기 | ❌ | ✅ | ✅ | |
| 버전/마이그레이션 | ❌ | ✅ | ❌ | v10은 `migrateToV2` |

## 7) 출력 & 인쇄
| 기능 | 레거시 (single-file) | v10 | math‑pdf‑builder | 갭/메모 |
|---|---|---|---|---|
| 인쇄 | ❌ | ❌ | ✅ | |
| 출력 전 점검(프리플라이트) | ❌ | ❌ | ✅ | |
| PDF 내보내기 | ❌ | ❌ | 🟡 | 문서 기준: 인쇄는 있으나 PDF 파이프라인은 불명 |

## 8) UX 도구
| 기능 | 레거시 (single-file) | v10 | math‑pdf‑builder | 갭/메모 |
|---|---|---|---|---|
| 펜/지우개 드로잉 | ✅ | ✅ | ❌ | v10은 Canvas/Stroke 모델 보유 |
| 줌/팬 | ✅ | 🟡 | ❌ | v10은 overview/viewport 관련 상태 존재 |
| 테마 전환 | ✅ | ❌ | 🟡 | pdf‑builder는 헤더 테마 색상만 명시 |
| 라쏘 선택/대량 삭제 | ✅ | ❌ | ❌ | v10은 단일 선택 중심 (라쏘/대량 삭제 미확인) |

## 9) 데이터 모델 & 통합
| 기능 | 레거시 (single-file) | v10 | math‑pdf‑builder | 갭/메모 |
|---|---|---|---|---|
| 구조화 스키마(JSON‑safe) | ❌ | ✅ | ✅ | v10 `PersistedSlateDoc`, pdf‑builder `.msk` |
| 글로벌 스텝 모델 | 🟡 | ✅ | ❌ | 레거시는 line 기반 스텝(전역 규칙 불명) |
| DSL/태그 문법 | ❌ | 🟡 | ✅ | v10은 DSL 방향성만 문서화 |
| 확장/플러그인 스캐폴드 | ❌ | 🟡 | ❌ | v10은 extension scaffold만 존재 |

---

## Priorities (P0/P1/P2)
정의:
- P0 = v10이 SSOT로 기능하기 위해 반드시 필요한 갭
- P1 = 통합/출력 파이프라인 안정화를 위해 중요한 갭
- P2 = UX 향상/장기 확장성 위주의 갭

우선순위 목록 (갭 10+개):
1) P0 — 리치 텍스트 스타일(강조/스텝 표시): 수입 데이터의 강조/수식 표현 보존에 필요
2) P0 — 블록 목록 편집 + 대량 선택: 대량 편집/정렬 워크플로우의 기본
3) P0 — 이미지 리사이즈/변형: 자산 가져오기 시 정확한 레이아웃 유지
4) P0 — 줌/팬: 보드 작업 기본 UX, 현재는 Overview 중심
5) P1 — 렌더 모드 토글: 토큰 편집/렌더 보기 전환이 필요한 콘텐츠에 대비
6) P1 — 라쏘 선택/대량 삭제: 편집 효율과 리팩토링 속도 개선
7) P1 — 머릿말/꼬릿말 템플릿: 시험지형 콘텐츠 파이프라인 합류 필요 시 필수
8) P1 — 출력/프리플라이트/PDF: 최종 산출 파이프라인에 필요
9) P1 — DSL/태그 문법 확정: 교환 규칙과 입력 표준에 필요
10) P2 — 테마 전환: UI 선호/브랜딩 대응

## Next actions (상위 갭 제안)
1) P0 갭(리치 편집, 블록 편집, 이미지 변형, 줌/팬, 레이저)을 v10 마일스톤으로 고정
2) P1 갭(렌더 토글, 라쏘, 헤더/푸터, 출력, DSL)을 통합 파이프라인 요구사항과 연결
3) 매핑 대상(레거시/ pdf‑builder)별 “보존해야 할 데이터”를 계약서에 반영
4) 우선순위 합의 후, 패킷 단위로 멀티 Codex 작업 분해

---

## Sources
- `v10/AI_READ_ME.md`
- `PROJECT_CONTEXT.md`
- `/home/sykab/workspace/math-pdf-builder-public-codex/README.md`
- `v10/src/features/layout/DataInputPanel.tsx`
- `v10/src/features/canvas/animation/AnimatedTextBlock.tsx`
- `v10/src/features/canvas/CanvasStage.tsx`
- `v10/src/features/hooks/useCanvas.ts`
