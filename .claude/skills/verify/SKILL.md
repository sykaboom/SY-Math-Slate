---
name: verify
description: 스펙 작성 전 코드 사실 검증 체크리스트를 실행한다. "검증해줘", "사실 확인해", "/verify <대상>" 으로 호출.
argument-hint: <파일 경로 또는 주장 목록>
---

# verify 스킬 — 코드 사실 검증

## 역할
스펙에 기재할 사실 주장(변수명, 줄 수, 파일 위치, import 관계 등)을
직접 Read/Grep으로 확인하고 PASS/FAIL 체크리스트를 반환한다.

서브에이전트 요약 신뢰 금지. 모든 사실은 1차 소스에서 직접 확인.

---

## 실행 순서

### 1. 검증 대상 목록 수집
호출 인자 또는 직전 스펙 초안에서 "사실 주장"을 추출:
- 파일 경로 존재 여부
- 변수/함수/타입 이름 및 위치
- 파일 줄 수 (line count)
- import 관계 (A가 B를 import 하는가)
- 중복 선언 여부 (같은 변수명이 두 파일에 있는가)
- 의존성 방향 (layer 규칙 위반 여부)

### 2. 각 주장별 검증 도구 선택

| 주장 유형 | 사용 도구 |
|---|---|
| 파일 존재 여부 | Glob |
| 변수/함수 선언 위치 | Grep (pattern: `const <name>`, `function <name>`, `export`) |
| 파일 줄 수 | Read (전체 읽어서 마지막 줄 번호 확인) |
| import 관계 | Grep (pattern: `import.*from.*<path>`) |
| 중복 선언 | Grep (output_mode: count, pattern: `<name>`) |
| 타입/인터페이스 | Grep (pattern: `type <name>`, `interface <name>`) |

**서브에이전트 금지. 모든 Grep/Read는 직접 호출.**

### 3. 체크리스트 출력

각 주장에 대해 아래 포맷으로 결과 출력:

```
[ PASS ] useSyncStore.ts 존재함 → Glob 확인: v10/src/stores/useSyncStore.ts
[ PASS ] globalStep 선언은 useSyncStore.ts:57 에만 존재 → Grep count: useSyncStore=1, useLocalStore=0
[ FAIL ] useSyncStore.ts 줄 수 10,527 → 실제: 375줄 (Read 확인)
[ FAIL ] sharedViewport가 useSyncStore+useLocalStore 중복 → 실제: useAsymmetricSessionSync.ts의 세션 채널 (merge 불가)
```

### 4. FAIL 항목 처리
- FAIL 항목은 스펙에 반영 금지
- 올바른 사실로 교체하거나, 사실 불명확 시 "TBD — 직접 확인 필요" 로 표기
- FAIL이 핵심 전제인 경우 스펙 작성 중단 후 사용자 보고

### 5. 완료 선언
```
검증 완료: PASS N / FAIL M
스펙 반영 가능: PASS 항목만
```

---

## 이 스킬을 트리거해야 하는 상황

spec 스킬 실행 전 자동으로 verify가 필요한 경우:
- 파일 줄 수를 언급할 때
- "A와 B에 중복이 있다"고 주장할 때
- "X는 Y를 import 한다"고 주장할 때
- "이 변수는 Z 파일에 있다"고 주장할 때
- 서브에이전트(Explore)가 코드 사실을 요약해서 돌려줬을 때

## 금지 사항
- Explore/general-purpose 서브에이전트에 코드 사실 위임 금지
- 서브에이전트 요약 결과를 PASS 처리 금지
- 메모리/이전 대화 내용을 사실로 간주 금지 (항상 재확인)
