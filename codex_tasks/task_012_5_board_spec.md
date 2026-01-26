# Task 012.5: BoardSpec & Coordinate System

**Status:** COMPLETED
**Priority:** HIGH
**Assignee:** Codex CLI
**Dependencies:** Task 012 (Overview)

## Context
현재 캔버스는 화면 크기에 맞춰 바로 렌더링되며(뷰포트 기준), 기기/창 크기가 바뀌면 동일 데이터라도 보이는 크기와 간격이 달라집니다. 태블릿/PC 모두에서 **일관된 결과**를 얻으려면 **문서 기준 좌표계(BoardSpec)** 를 고정해야 합니다.

## Goals
1. **문서 기준 좌표계** 도입 (기기/창 크기와 무관한 고정 크기).
2. 모든 렌더링/저장은 **Board 좌표계** 기준으로 수행.
3. 화면에 보여줄 때만 **스케일링**으로 맞춤(fit).
4. 펜/레이저/드래그 입력은 **역변환**하여 Board 좌표로 기록.

## BoardSpec (기준 크기)
- **16:9:** 1920 × 1080
- **4:3:** 1440 × 1080 (높이를 동일하게 유지해 글자 체감 크기 일관성 확보)

## Requirements
### 1. BoardSpec 모듈
- `src/lib/boardSpec.ts` 추가
  - `getBoardSize(ratio)` → `{ width, height }`
  - `getBoardPadding()` → Board 내부 여백(예: 80px 상하/좌우 기준) *선택사항*

### 2. PageViewport 리팩터링
- 실제 렌더링되는 **Board Container**를 고정 크기로 생성 (`width/height = BoardSpec`).
- 화면에는 `scale = min(availableW / boardW, availableH / boardH)` 로 맞춤.
- Board Container는 `transform: scale(scale)` 로 보여줌.
- **중앙 정렬** 유지.
- 뷰포트 여백(상하)은 레이아웃 수준에서 유지.

### 3. 좌표 변환
- **포인터 입력 → Board 좌표 변환** 필요.
- `useBoardTransform()` 훅 추가:
  - 반환값: `{ scale, offsetX, offsetY }`
  - `toBoardPoint(clientX, clientY)` 제공
- `useCanvas()`는 반드시 Board 좌표로 기록
  - `getCanvasPoint()` 를 Board 기준으로 수정

### 4. Canvas Layer / Content Layer
- 실제 Canvas 픽셀 크기는 **BoardSpec × dpr**
- CSS 크기는 BoardSpec (scale은 wrapper에서만 적용)
- 텍스트/이미지 위치는 Board 좌표 기준 유지

### 5. Overview
- Overview는 **각 페이지가 BoardSpec 크기**로 렌더링
- 기존 layout(2행×N열 column-major) 유지
- Overview에서도 스케일 적용, 보드 크기 불변

### 6. 데이터 마이그레이션
- 기존 저장 데이터는 화면 픽셀 기준.
- **첫 로드 시 현재 scale 기준으로 Board 좌표로 변환**하여 이관.
  - 예: `boardX = screenX / scale`
- 변환 여부를 로컬에 플래그로 저장하여 **1회만 수행**

## Non-goals
- 무한 캔버스 / 자유 크기 페이지
- 디자인 리뉴얼

## Acceptance Criteria
- 동일 데이터가 태블릿/PC에서 동일한 레이아웃 비율로 보임.
- 창 리사이즈 시 시각적으로만 스케일이 바뀌고, 데이터는 유지됨.
- 펜/레이저 입력 위치가 정확히 매핑됨.
- 16:9 ↔ 4:3 전환 시 BoardSpec 크기만 바뀌고 좌표가 안정적으로 보존됨.
