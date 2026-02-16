# Trust/Safety SLO + Oncall Runbook (W8)

## Scope
- Applies to `v10/src/app/api/community/route.ts` trust/safety operations.
- Host-only metrics endpoint action: `trust-safety-slo`.

## SLO Metrics
- `pendingReports`
  - Definition: count of moderation reports with `status=pending`.
  - Objective: `< 50` steady-state.
- `pendingRightsClaims`
  - Definition: count of rights claims with `status=pending`.
  - Objective: `< 20` steady-state.
- `avgReportResolutionMs`
  - Definition: average of `(moderatedAt - createdAt)` for resolved reports.
  - Objective: `< 24h`.
- `avgRightsClaimResolutionMs`
  - Definition: average of `(reviewedAt - createdAt)` for resolved rights claims.
  - Objective: `< 24h`.
- `elevatedTrafficSignals24h`
  - Definition: count of elevated invalid-traffic detections in last 24h.
  - Objective: monitor trend; no hard cap.
- `blockedTrafficSignals24h`
  - Definition: count of blocked invalid-traffic detections in last 24h.
  - Objective: alert when sharp spike (>3x baseline) is observed.

## Host Retrieval Procedure
1. Call `POST /api/community` with body `{ "action": "trust-safety-slo" }`.
2. Include headers:
   - `x-sy-request-role: host`
   - `x-sy-role-token: <SY_MATH_SLATE_HOST_ROLE_TOKEN>`
3. Parse response:
   - Success: `{ ok: true, summary: { ... } }`
   - Failure: `{ ok: false, code, message }`

## Incident Triage
1. High pending backlog
   - Trigger: `pendingReports >= 50` or `pendingRightsClaims >= 20` for > 30 min.
   - Action:
     - Prioritize moderation queue and rights claims in host console.
     - Verify moderation token path and console refresh loop.
2. Resolution latency breach
   - Trigger: average resolution metrics exceed 24h.
   - Action:
     - Increase moderation cadence.
     - Inspect unresolved queues and host-role trust checks.
3. Traffic anomaly
   - Trigger: `blockedTrafficSignals24h` sudden spike (>=3x recent baseline).
   - Action:
     - Inspect top repeated actions/fingerprints in traffic signals.
     - Tighten threshold policy only with explicit task/spec.

## Escalation Matrix
- Sev-1: moderation API unreachable or host token path broken
  - Escalate immediately; restore access path first.
- Sev-2: sustained backlog/latency breach without outage
  - Escalate to trust/safety owner within same day.
- Sev-3: transient elevated traffic without backlog impact
  - Monitor and re-check after 1h.

## Recovery Validation
- Re-run `trust-safety-slo` and confirm metrics returning to objective bands.
- Verify host console can process pending report and rights-claim actions.
- Capture incident note in task log if thresholds were crossed.
