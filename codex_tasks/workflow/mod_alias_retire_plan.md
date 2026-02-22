# Mod Runtime Legacy Alias Retire Plan

Status: ACTIVE (freeze stage)
Owner: Codex
Source of truth gate: `scripts/check_mod_contract.sh` + `codex_tasks/workflow/mod_alias_retire_budget.env`
Last updated: 2026-02-22

---

## Purpose

`legacy-alias-fallback`는 현재 compat lane으로 유지 중이다.
이 문서는 alias 경로를 즉시 제거하지 않고,
1) 증가를 먼저 동결하고
2) 제거 가능한 조건을 명시적으로 잠그기 위한 운영 계획이다.

---

## Current freeze invariants

- Alias mapping constants are single-source in:
  - `v10/src/core/runtime/modding/package/legacyAlias.ts`
- Source tag `legacy-alias-fallback` must not increase above budget.
- Source strings:
  - `legacy.toolbar-mode-to-mod-id`
  - `legacy.mod-id-to-toolbar-mode`
  must not increase above budget.

Enforced by:
- `scripts/check_mod_contract.sh` (section: `alias-retire-budget`)
- `codex_tasks/workflow/mod_alias_retire_budget.env`

---

## Exit gate (retire readiness)

Alias runtime path can be removed only when all checks are true:

1. Runtime matrix rows for activation policy pass without alias fallback dependency.
2. Host path resolves toolbar mode/mod id through package activation policy only.
3. Alias fallback telemetry (`mod.alias_fallback_hit`) stays zero in regression runs for at least one wave.
4. No-mod boot certification remains PASS after alias fallback off path rehearsal.

---

## Retire sequence (next task target)

1. Introduce temporary flag-driven alias OFF rehearsal in controlled test path.
2. Run regression matrix + no-mod boot + lint/build.
3. Remove legacy alias selector branches and telemetry fallback sources.
4. Tighten budget file to zero and keep guardrail active for reintroduction prevention.

---

## Roll-back policy

If regressions are observed during retire rehearsal:

- Restore alias branch through single revert commit.
- Keep freeze budget unchanged.
- Re-open retire task with explicit failing viewport/check-id evidence.
