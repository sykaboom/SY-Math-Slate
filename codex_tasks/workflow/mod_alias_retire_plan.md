# Mod Runtime Legacy Alias Retire Plan

Status: RETIRED (runtime alias removed, zero-budget freeze active)
Owner: Codex
Source of truth gate: `scripts/check_mod_contract.sh` + `codex_tasks/workflow/mod_alias_retire_budget.env`
Last updated: 2026-02-22

---

## Purpose

`legacy-alias-fallback` 런타임 경로는 task_496에서 제거되었다.
이 문서는 제거 이후 재유입을 막기 위한 0-budget 운영 계획이다.

---

## Current freeze invariants

- Alias mapping constants는 runtime 경로에 존재하면 안 된다(0-budget).
- Source tag `legacy-alias-fallback`는 0이어야 한다.
- Source strings:
  - `legacy.toolbar-mode-to-mod-id`
  - `legacy.mod-id-to-toolbar-mode`
  는 0이어야 한다.

Enforced by:
- `scripts/check_mod_contract.sh` (section: `alias-retire-budget`)
- `codex_tasks/workflow/mod_alias_retire_budget.env`

---

## Exit gate (post-retire keep rules)

다음 조건이 항상 유지되어야 한다:

1. Runtime matrix activation policy rows가 package-map 경로만으로 PASS한다.
2. Host path resolves toolbar mode/mod id through package activation policy only.
3. `legacy-alias-fallback` / legacy source strings / alias mapping const count가 모두 0이다.
4. No-mod boot certification이 계속 PASS한다.

---

## Recovery sequence (if regression appears)

1. 증상 재현 증거(viewport + check_id + command)를 고정한다.
2. package activation map 경로를 우선 보정한다(legacy alias 부활 금지).
3. regression matrix + no-mod boot + lint/build를 재실행한다.
4. 여전히 실패 시에만 hotfix 웨이브를 별도 생성한다.

---

## Roll-back policy

If regressions are observed after retire:

- alias branch 복구 대신 package-map/adapter 경로를 수정한다.
- zero budget는 유지한다.
- 필요 시 신규 task로 원인/보정 범위를 분리한다.
