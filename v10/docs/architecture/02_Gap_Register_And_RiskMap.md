# 02. GAP Register & Risk Map

Status: ACTIVE GAP REGISTER (Task 488)
Date: 2026-02-22
Scope: 목표(TO-BE)와 현재(AS-IS)의 어긋남을 우선순위와 리스크로 고정

---

## 1) Gap Summary

현재 평가는 “완전 실패”가 아니라 **하이브리드 과도기**다.

- 기반 축(core/runtime/modding + pack bridge + resolved plan)은 존재.
- 그러나 목표 핵심(툴바/레이아웃 완전 mod/pack화 + 단일 SSOT)은 아직 부분 달성.

---

## 2) Gap Register (Evidence-based)

| ID | Gap | Severity | Evidence (paths) | Impact | Target condition |
|---|---|---|---|---|---|
| G-01 | Host 영역에 정책/행동 비중 잔존 | High | `features/chrome/layout/AppLayout.tsx`, `features/chrome/toolbar/FloatingToolbar.tsx` | mod 교체 시 host 회귀 위험 증가 | host는 resolved plan 렌더만 담당 |
| G-02 | Toolbar 정책 SSOT 분산 | High | `features/chrome/toolbar/toolbarModePolicy.ts`, `features/chrome/toolbar/catalog/toolbarActionCatalog.ts`, `features/chrome/toolbar/catalog/toolbarSurfacePolicy.ts`, `core/runtime/modding/package/selectors.ts` | drift/불일치 발생 가능 | resolver 중심 단일 정책 체인 |
| G-03 | Pack 정의와 런타임 반영 간 dead config 가능성 | High | `mod/packs/base-education/*` + selector/runtime 매핑 경로 | 선언과 동작 불일치 위험 | pack 정의=런타임 반영 계약 보장 |
| G-04 | Legacy alias fallback 런타임 경로 | Resolved | `core/runtime/modding/package/selectors.ts`, `features/chrome/toolbar/toolbarModePolicy.ts` | 제거 완료(재유입 방지 필요) | zero-budget freeze guardrail 유지 |
| G-05 | 대형 파일 집중으로 변경 충돌 위험 | Medium | `features/chrome/layout/AppLayout.tsx`, `features/chrome/toolbar/FloatingToolbar.tsx` 외 900+ 파일군 | 작은 변경도 회귀/충돌 증가 | 책임 분해 및 경계 강화 |
| G-06 | mod 0개 부팅 보장 테스트 미고정 | Medium | 테스트/런북 레벨 근거 부재 | core always-on 보장 불명확 | no-mod boot test를 게이트화 |

---

## 3) Risk Map

### High risks
1. 정책 분산으로 인한 동작 불일치(툴바 표시/행동 drift)
2. host 코드에 정책이 남아 mod 교체 비용이 계속 상승
3. 선언적 pack 설정이 실제 런타임에 반영되지 않는 silent failure

### Medium risks
1. legacy alias 재유입(guardrail 미준수)
2. 대형 파일 중심 변경 시 회귀 확률 상승
3. no-mod 부팅 보장 부재로 엔진 독립성 검증 불가

### Low risks
1. 문서/용어 drift(`mode` vs `mod`) 재발

---

## 4) Mitigation Priorities (strict order)

1. SSOT 수렴:
   - toolbar 정책/카탈로그/surface 정의를 resolver 체인으로 단일화
2. Host 축소:
   - host는 resolved plan 렌더러로 제한
3. 계약 고정:
   - pack 정의 -> runtime 반영 검증 체크 추가
4. legacy 축소:
   - alias runtime 제거 유지 + zero-budget guardrail 고정
5. 검증 고정:
   - no-mod boot + import boundary + resolver consistency 테스트

---

## 5) Exit Criteria for this Gap Register

다음 항목이 충족되면 본 갭 레지스터는 Phase-1 종료 기준으로 갱신한다.

1. `G-02`가 해소되어 toolbar 정책 결정 경로가 1개로 수렴.
2. `G-01`이 해소되어 host에 정책 분기가 남지 않음.
3. `G-03`에 대해 pack->runtime 일치 검증 자동화가 존재.
4. `G-06` no-mod boot 검증이 CI/수동 게이트에 고정됨.
