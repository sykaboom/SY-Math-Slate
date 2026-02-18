---
name: batch
description: PENDING 태스크들을 분석해서 최적 실행 순서와 병렬 웨이브 플랜을 만든다. "배치 분석해줘", "펜딩 태스크 정리해", "/batch" 로 호출.
---

# batch 스킬 — 배치 디스패치 분석

## 역할
PENDING 태스크를 수집하고, 파일 충돌 매트릭스 + 의존성 DAG를 계산해서
Batch Dispatch Plan을 생성한다. 실행은 Codex가 한다.

## 실행 순서

### 1. PENDING 태스크 수집
```
grep -l "Status: PENDING" codex_tasks/task_*.md | sort -t_ -k2 -n
```

### 2. 각 태스크에서 추출할 정보
각 파일을 직접 Read해서 아래를 추출:
- Touched files (W = write, R = read)
- Depends on tasks
- Execution Mode Assessment (Batch-eligible, Recommended mode)
- Estimated duration

**서브에이전트에 읽기 위임 금지. 직접 Read.**

### 3. 파일 충돌 매트릭스 작성
동일 파일을 W로 터치하는 태스크는 순차 강제.
W + R은 충돌 없음 (허용).

### 4. DAG 계산
- 선언된 의존성 (Depends on tasks)
- 파일 충돌로 인한 암묵적 의존성
두 가지 모두 반영.

### 5. 웨이브 플랜 산출
- 충돌 없는 태스크 → 같은 웨이브에서 병렬
- MANUAL 태스크 → 단일 에이전트 1슬롯
- DELEGATED 태스크 → Block B 슬롯 계획 반영
- 슬롯 배정 모드: DYNAMIC (완료 이벤트마다 재계산)

### 6. 파일 저장
`codex_tasks/batch_dispatch_plan_<YYYY_MM_DD>.md`
템플릿: `codex_tasks/_TEMPLATE_batch_dispatch_plan.md`

### 7. 효율 계산 포함
- 순차 실행 예상 시간
- 배치 실행 예상 시간
- 절감률 (%)

## 출력 기준
- 사용자에게 웨이브 플랜 요약 제시
- 승인 요청 후 Codex에 전달 권장 문구 포함
