# Release Candidate Signoff Checklist (W9)

## Security
- [ ] Host moderation token configured in runtime and rotated.
- [ ] Community mutation paths pass ad-policy, UGC safety, and invalid-traffic guards.
- [ ] MCP/postMessage origin allowlist verified (`NEXT_PUBLIC_ALLOWED_ORIGIN`).

## Reliability
- [ ] `VERIFY_STAGE=end bash scripts/run_repo_verifications.sh` PASS.
- [ ] `scripts/run_beta_quality_gate.sh` PASS.
- [ ] Chaos/recovery drill script PASS (`scripts/check_v10_chaos_recovery_drills.sh`).

## UX and Accessibility
- [ ] Core host/student paths render without client exceptions.
- [ ] Tablet viewport smoke checks pass (768x1024 / 820x1180 / 1024x768 / 1180x820).
- [ ] Critical aria labels validated by beta gate smoke tests.

## Operations and Monitoring
- [ ] Trust/Safety SLO endpoint reachable with host token.
- [ ] Oncall runbook reviewed: `codex_tasks/workflow/trust_safety_slo_oncall_runbook.md`.
- [ ] Invalid traffic signals and moderation queue are visible in host moderation console.

## Rollback and Launch
- [ ] Rollback plan verified for latest release commit.
- [ ] Release rollback runbook reviewed and latest-good commit SHA captured (`codex_tasks/workflow/release_rollback_runbook.md`).
- [ ] Feature flag registry reviewed for stale aliases/unknown keys.
- [ ] Phase5 cutover flags validated (default OFF unless explicitly approved).
- [ ] `node v10/tests/phase5_preflight_smoke.mjs` PASS.
- [ ] Deployment target smoke-tested after production build.
