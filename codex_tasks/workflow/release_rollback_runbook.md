# Release Rollback Runbook

## Scope
- Applies to production regressions discovered after merge/deploy.
- Goal: restore last-known-good behavior quickly with deterministic steps.

## Trigger Conditions
- Client crash/white screen in production.
- Critical auth/approval policy bypass.
- Blocking live/share path failure after cutover flag enable.

## Pre-Rollback Snapshot
1. Capture current head and recent history:
   - `git rev-parse --short HEAD`
   - `git log --oneline -n 10`
2. Identify last-known-good commit SHA.
3. Record incident notes (symptom, first bad SHA, target rollback SHA).

## Rollback Procedure
1. Roll back by revert (preferred, history-safe):
   - single commit: `git revert --no-edit <bad_sha>`
   - multiple commits: `git revert --no-edit <oldest_bad_sha>^..<newest_bad_sha>`
2. Push rollback commit:
   - `git push origin main`
3. Re-deploy target environment and confirm rollback SHA is active.
4. Keep phase cutover flags OFF until root cause fix is verified.

## Post-Rollback Verification
1. Repository gates:
   - `VERIFY_STAGE=end bash scripts/run_repo_verifications.sh`
   - `bash scripts/run_beta_quality_gate.sh`
2. App checks:
   - `/` route loads without client exception.
   - Host/student critical path renders.
   - Approval queue path remains deny-by-default.
3. Close incident only after smoke checks pass.

## Notes
- Do not use destructive history rewrite on shared branches.
- Prefer small revert commits and follow-up hotfix.
