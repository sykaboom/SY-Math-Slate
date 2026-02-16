# Task 256: Shared Transactional Apply, Preview, and Rollback

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-16

---

## Goal (Base Required)
- What to change:
  - Specify one shared transaction protocol for both light and heavy tracks:
    - dry-run preview
    - explicit approval
    - atomic apply
    - rollback
  - Define minimum audit payload for each transaction step.
- What must NOT change:
  - Do not allow direct non-transactional mutation paths.
  - Do not add dependencies.

---

## Scope (Base Required)

Touched files/directories:
- `codex_tasks/task_256_shared_transactional_apply_preview_rollback.md`

Out of scope:
- Actual transaction engine implementation
- UI rendering

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - Every write path must remain command-bus mediated.
  - Approval-required operations cannot bypass queue.
- Compatibility:
  - Consumes intent path (`task_251`) and heavy module import path (`task_253`).

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - M2-SHARED
- Depends on tasks:
  - [`task_251`, `task_253`]
- Enables tasks:
  - [`task_257`, `task_258`]
- Parallel group:
  - G-shared
- Max parallel slots:
  - 6 (default)
- Verification stage for this task:
  - `mid`

---

## Optional Block A — Layout / SVG Gate

- [ ] Applies: NO

---

## Optional Block B — Delegated Execution

- [ ] Applies: NO

If NO:
- Execution mode: MANUAL

---

## Optional Block C — Hotfix Exception

- [ ] Applies: NO

---

## Optional Block D — Speculative Defense Check

- [ ] Applies: NO

---

## Optional Block E — Documentation Update Check

- [ ] Applies: NO

---

## Acceptance Criteria (Base Required)

- [x] AC-1: Transaction lifecycle states and transitions are fully defined.
- [x] AC-2: Preview diff format is deterministic and role-aware.
- [x] AC-3: Rollback contract includes idempotency and failure recovery notes.

---

## Shared Transaction Protocol (Light + Heavy) — SSOT

### Protocol Invariants

- One protocol is used for both tracks, with `track` set to `light` or `heavy`.
- All write intents must use this state machine through the command bus; direct mutation paths are invalid.
- A transaction attempt is identified by `txId` + `attemptNo`.
- `previewHash` is immutable per attempt; any preview regeneration increments `attemptNo`.
- Apply and rollback operations must be idempotent and keyed.

### Lifecycle States and Deterministic Transitions

| State | Entry Condition | Allowed Next State(s) | Transition Trigger / Guard |
|---|---|---|---|
| `RECEIVED` | Intent accepted and normalized | `PREVIEWING` | `startPreview` with valid intent payload |
| `PREVIEWING` | Diff generation running in isolated snapshot | `PREVIEW_READY`, `FAILED_PRE_APPLY` | Success => deterministic preview built; failure => generation/validation error |
| `PREVIEW_READY` | Canonical preview created and hashed | `APPROVAL_PENDING` | System emits preview artifact and audit event |
| `APPROVAL_PENDING` | Waiting explicit approval decision | `APPROVED`, `REJECTED`, `FAILED_PRE_APPLY` | Approve/reject/expire; invalid approval payload => failure |
| `APPROVED` | Approval token issued and bound to preview | `APPLYING` | `applyRequested` with matching `approvalToken`, `previewHash`, `baseRevision` |
| `APPLYING` | Atomic apply attempt in progress | `APPLIED`, `FAILED_PRE_APPLY`, `RECOVERY_PENDING` | Commit success; pre-commit guard failure; commit acknowledgement uncertain |
| `APPLIED` | Apply commit durable | `ROLLBACK_PENDING` | Explicit rollback request only |
| `ROLLBACK_PENDING` | Atomic rollback attempt in progress | `ROLLED_BACK`, `RECOVERY_PENDING`, `FAILED_TERMINAL` | Rollback success; outcome uncertain; terminal rollback failure |
| `ROLLED_BACK` | Rollback durable and complete | Terminal | Idempotent terminal success |
| `REJECTED` | Approval denied/expired | Terminal | New change requires new transaction attempt |
| `FAILED_PRE_APPLY` | Failure before durable apply | `PREVIEWING`, `REJECTED` | Retry allowed after correction; or terminate |
| `RECOVERY_PENDING` | Durable outcome uncertain after apply/rollback | `APPLIED`, `ROLLED_BACK`, `APPROVED`, `FAILED_TERMINAL` | Reconciliation job resolves final durable state |
| `FAILED_TERMINAL` | Unrecoverable failure or reconciliation timeout | Terminal | Manual operator intervention required |

State machine constraints:
- No transition may skip `APPROVAL_PENDING` and `APPROVED` before `APPLYING`.
- `APPLIED` and `ROLLED_BACK` are mutually exclusive terminal outcomes for a given `attemptNo`.
- Retried apply/rollback with the same idempotency key must never create additional durable commits.

### Deterministic Diff Preview Format (Role-Aware)

Canonical preview envelope (required fields):

```json
{
  "schemaVersion": "tx-preview/v1",
  "txId": "string",
  "attemptNo": 1,
  "track": "light",
  "baseRevision": "string",
  "candidateRevision": "string",
  "generatedAt": "2026-02-16T00:00:00.000Z",
  "entries": [
    {
      "seq": 1,
      "scope": "shared",
      "entityType": "string",
      "entityId": "string",
      "path": "/json/pointer",
      "op": "add",
      "before": null,
      "after": {},
      "roleViews": {
        "author": {"before": null, "after": {}, "redacted": false},
        "reviewer": {"before": null, "after": {}, "redacted": false}
      }
    }
  ],
  "summary": {"add": 1, "remove": 0, "replace": 0, "move": 0},
  "previewHash": "sha256-canonical-json-without-previewHash"
}
```

Determinism requirements:
- `entries` sorted by `scope`, `entityType`, `entityId`, `path`, `op`, then `seq`.
- Object keys serialized in lexical order (canonical JSON).
- Nulls are explicit; omitted/empty variants are not allowed.
- `roleViews` keys sorted lexically (`admin`, `author`, `reviewer`, etc.).
- `previewHash` is computed from canonical payload excluding `previewHash`.

Role-aware requirements:
- Each entry contains a `roleViews` object for all supported consumer roles.
- Redacted role views must preserve structural shape and `seq` ordering.
- Approval must bind to the full canonical preview (`previewHash`), not only a role-specific rendering.

### Explicit Approval Contract

Approval input minimum:
- `txId`
- `attemptNo`
- `previewHash`
- `baseRevision`
- `approverId`
- `approverRole`
- `decision` (`approve` or `reject`)
- `decisionAt`
- `approvalTtlSeconds` (when approved)

Rules:
- Only valid in `APPROVAL_PENDING`.
- `approve` issues `approvalToken` scoped to `txId + attemptNo + previewHash + baseRevision`.
- Any preview regeneration invalidates prior approvals.
- Expired approval token transitions to `FAILED_PRE_APPLY` (retry path requires re-approval).

### Atomic Apply Contract

Apply input minimum:
- `txId`
- `attemptNo`
- `approvalToken`
- `previewHash`
- `baseRevision`
- `applyIdempotencyKey`
- `requestedBy`

Rules:
- Only valid in `APPROVED`.
- Pre-commit guards: token validity, hash match, base revision match, authorization check.
- Apply executes as all-or-nothing commit boundary; no partially visible writes.
- Duplicate `applyIdempotencyKey` handling:
  - If already committed: return prior `APPLIED` result and commit metadata.
  - If in-flight: return in-progress status for same transaction.
  - If failed pre-commit: safe to retry without side effects.

### Rollback and Idempotency Contract

Rollback input minimum:
- `txId`
- `attemptNo`
- `rollbackReason`
- `rollbackIdempotencyKey`
- `requestedBy`

Rules:
- Rollback allowed only from `APPLIED`.
- Inverse operations are generated from committed transaction journal for that attempt, not recomputed from mutable current state.
- Rollback is atomic all-or-nothing.
- Duplicate `rollbackIdempotencyKey` handling:
  - If rollback already committed: return prior `ROLLED_BACK` result.
  - If rollback in-flight: return in-progress status.
  - If rollback request for non-applied transaction: reject with deterministic validation error.

### Minimum Audit Payload by Stage

Common envelope (required at every stage):
- `eventId`
- `timestamp`
- `txId`
- `attemptNo`
- `track`
- `stage`
- `prevState`
- `nextState`
- `actorId`
- `actorRole`
- `requestId`
- `idempotencyKey` (nullable where not applicable)

Stage-specific minimum:
- Preview generated (`PREVIEW_READY`):
  - `baseRevision`, `candidateRevision`, `previewHash`, `entryCount`, `summary`
- Approval decision (`APPROVAL_PENDING -> APPROVED|REJECTED`):
  - `decision`, `approverId`, `approverRole`, `approvedPreviewHash`, `approvalTokenId` (if approved), `expiresAt` (if approved)
- Apply start/finish (`APPLYING` transitions):
  - `approvalTokenId`, `writeSetHash`, `commitId` (if committed), `commitSequence`, `durationMs`
- Rollback start/finish (`ROLLBACK_PENDING` transitions):
  - `rollbackReason`, `inverseWriteSetHash`, `rollbackCommitId` (if committed), `durationMs`
- Failures (any failure transition):
  - `errorCode`, `errorClass` (`recoverable` or `terminal`), `message`, `safeToRetry`, `recoveryAction`

### Failure Recovery Path

1) Pre-apply failures (`FAILED_PRE_APPLY`):
- Causes: preview generation error, approval payload mismatch, expired approval, base revision drift before commit.
- Recovery: regenerate preview (`attemptNo + 1`) or terminate (`REJECTED`).
- Idempotency impact: existing idempotency keys remain tied to original attempt and cannot be reused across attempts.

2) Uncertain durable outcome (`RECOVERY_PENDING`):
- Causes: apply/rollback commit acknowledgement timeout or transport loss after commit submission.
- Recovery reconciliation order:
  - Check durable commit log by `txId + attemptNo + operation` (`apply`/`rollback`).
  - If commit exists for apply => transition `APPLIED`.
  - If commit exists for rollback => transition `ROLLED_BACK`.
  - If no commit exists and locks are clear => transition `APPROVED` (safe apply replay) or `APPLIED` (safe rollback replay path) with same idempotency key.
  - If unresolved beyond operational SLA => `FAILED_TERMINAL`.

3) Terminal failures (`FAILED_TERMINAL`):
- Causes: unreconcilable ledger mismatch, repeated rollback commit failure, policy/security violation.
- Recovery: manual operator intervention with explicit override audit record.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path: inspect lifecycle state table.
   - Expected result: no ambiguous state transitions.
   - Covers: AC-1

2) Step:
   - Command / click path: inspect preview diff schema.
   - Expected result: deterministic before/after data with scope tags.
   - Covers: AC-2

3) Step:
   - Command / click path: inspect rollback contract.
   - Expected result: rollback is explicit, idempotent, and auditable.
   - Covers: AC-3

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - If canonical serialization diverges between producers/consumers, approval hash mismatch can block valid applies.
  - `RECOVERY_PENDING` requires durable reconciliation logs; weak logging can create terminal ambiguity.
- Roll-back:
  - Disable apply/rollback command handlers and keep system in preview-only mode until protocol invariants are revalidated.

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (or delegated chain approval reference)

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `codex_tasks/task_256_shared_transactional_apply_preview_rollback.md`

Commands run (only if user asked or required by spec):
- `sed -n '1,260p' codex_tasks/task_256_shared_transactional_apply_preview_rollback.md`
- `apply_patch` (this file only)

## Gate Results (Codex fills)

- Lint:
  - N/A
- Build:
  - N/A
- Script checks:
  - N/A

## Failure Classification (Codex fills when any gate fails)

- Pre-existing failures:
  - N/A
- Newly introduced failures:
  - N/A
- Blocking:
  - NO
- Mitigation:
  - N/A

Manual verification notes:
- Verified lifecycle table defines deterministic transitions with no apply-path bypass.
- Verified canonical preview schema includes deterministic ordering and role-aware view contract.
- Verified rollback section specifies idempotency keys and failure recovery from uncertain outcomes.

Notes:
- Scope lock respected: only this task file updated; no runtime code edits.
