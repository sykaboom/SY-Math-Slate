---
name: spec
description: 이 레포의 태스크 스펙을 작성한다. "스펙 작성해", "spec 써줘", "/spec <설명>" 으로 호출. codex_tasks/_TEMPLATE_task.md 구조를 따르고 Execution Mode Assessment를 반드시 포함한다.
argument-hint: <태스크 설명>
---

# spec 스킬 — 태스크 스펙 작성

## 역할
SY-Math-Slate 레포의 codex_tasks/ 태스크 스펙을 작성한다.
구현은 Codex CLI가 한다. 이 스킬은 기획/문서 작성 전담이다.

## 실행 순서

### 1. 다음 태스크 번호 확인
```
ls codex_tasks/task_*.md | sort -t_ -k2 -n | tail -1
```
마지막 번호 + 1을 새 태스크 번호로 사용.

### 2. 관련 파일 직접 확인 (서브에이전트 금지)
스펙에 사실로 기재할 내용은 반드시 직접 Read한다:
- 파일 줄 수 → Read로 직접 확인
- 변수/함수 존재 여부 → Grep으로 직접 확인
- import 관계 → Read로 직접 확인

**서브에이전트 요약을 사실로 기재하지 않는다.**

### 3. Execution Mode Assessment 판단 기준

| 조건 | 추천 모드 |
|---|---|
| 터치 파일 ≤ 4개 + 순차 의존 | MANUAL |
| 터치 파일 ≥ 5개 + 독립 서브유닛 2개 이상 | DELEGATED |
| 다른 PENDING 태스크와 파일 충돌 없음 | Batch-eligible: YES |
| 다른 PENDING 태스크와 파일 충돌 있음 | Batch-eligible: YES (순차 제약 명시) |

### 4. 파일 저장 위치
`codex_tasks/task_<번호>_<slug>.md`

slug는 영문 소문자 + 언더스코어, 최대 5단어.

### 5. 스펙 작성 후 반드시 확인
- Scope의 모든 파일 경로가 실제로 존재하는가?
- AC가 observable한가? (실행해서 pass/fail 판단 가능한가?)
- Roll-back이 `git revert <commit>` 한 줄로 가능한가?

## 금지 사항
- 구현 시작 금지 (스펙 작성 후 중단)
- 서브에이전트에 코드 사실 확인 위임 금지
- 500줄 이상 단일 스펙 금지 → 2~3개로 분할
