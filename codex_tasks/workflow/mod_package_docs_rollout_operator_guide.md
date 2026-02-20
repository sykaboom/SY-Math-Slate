# Mod Package Docs Rollout Operator Guide (Task 348)

Status: ACTIVE
Date: 2026-02-20
Scope: Documentation-only cutover for canonical `ModEngine` path and Mod/ModPackage terminology.

## Canonical Targets
- Architecture doc: `v10/docs/architecture/ModEngine.md`
- AI operator doc: `v10/AI_READ_ME.md`
- Generated map: `v10/AI_READ_ME_MAP.md`
- Roadmap phase map: `PROJECT_ROADMAP.md` (`task_336~349`)

## Cutover Checkpoints
1. Path cutover:
   - `v10/docs/architecture/ModeEngine.md` is no longer the active path.
   - Canonical references point to `v10/docs/architecture/ModEngine.md`.
2. Terminology cutover:
   - Active docs define `Mod` vs `ModPackage` ownership clearly.
   - Any `mode` wording is compatibility alias only.
3. Roadmap sync:
   - `PROJECT_ROADMAP.md` includes purpose + phase mapping for `task_336~349`.
4. Gate sync:
   - `node scripts/gen_ai_read_me_map.mjs`
   - `bash scripts/check_layer_rules.sh`
   - `bash scripts/check_mod_contract.sh`
   - `cd v10 && npm run lint && npm run build`

## Rollback Checkpoints
1. Revert only docs/workflow files from Task 348 if inconsistency is found.
2. Re-run all Task 348 validation commands after rollback commit.
3. Keep legacy path mentions archive-only; do not restore `ModeEngine.md` as canonical docs path.

## Operator Notes
- This wave must not change runtime behavior.
- Legacy `ModeEngine.md` mentions are allowed only in archived/superseded history records.
- Retirement of remaining dual-axis runtime fallbacks is handled by `task_349` after this docs wave is closed.
