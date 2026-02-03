# Task 061: Vercel Deployment for Tablet UX

**Status:** PENDING
**Priority:** P1 (Infrastructure / Testing)
**Assignee:** Codex CLI / User (Vercel Dashboard)
**Dependencies:** v10 Next.js App

## Context
We need to test Touch UX (Task 060) on real tablet devices. Localhost tunneling is unstable; a Vercel deployment allows instant, HTTPS-secured testing on mobile/tablet devices.

## Goals
1.  **Deploy v10 to Vercel:** Provide a public HTTPS URL for tablet testing.
2.  **Tablet Testing:** Validate pinch-to-zoom, panning, and touch drawing on iPad/Android tablets.
3.  **Minimal Change:** No codebase refactor or new backend setup just for this UX test.

## Non-Goals
- No database migration or server-side persistence setup.
- No production hardening or performance tuning (preview/UX testing only).

## Scope (Files)
- **Code changes:** None expected.
- **If absolutely required:** Must be called out in a separate follow-up task spec.
- **Target:** `v10/` directory as the Vercel project root.

## Detailed Steps

### 1. Prerequisites (User Action)
- Choose deployment method:
  - **A) GitHub Integration (recommended)**: Connect repo to Vercel for automatic previews.
  - **B) Vercel CLI (quick local deploy)**: Run Vercel CLI from `v10/`.
- If using **GitHub Integration**, push/commit the current state first.

### 2. Vercel Configuration (User Action)
- **Project Root:** `v10` (Do not deploy repo root).
- **Framework Preset:** Next.js (auto-detected).
- **Build Command:** `npm run build` (default).
- **Output Directory:** `.next` (default).

### 3. Environment Variables
- **None required** for basic UX testing (unless app code explicitly expects them).

## Acceptance Criteria
- [ ] **Deployment Success:** Vercel build passes and a public URL is live.
- [ ] **Rendering:** `v10` board loads on desktop without errors.
- [ ] **Tablet Access:** URL opens on iPad/Android.
- [ ] **UX Verification:** Pinch-to-zoom and pan work on the real device.
- [ ] **Touch Draw:** 1-finger draw produces ink strokes on tablet.

## Risks / Constraints
- **Persistence:** Data is stored in **browser localStorage only** (per-device). No server-side persistence.
- **Cold Starts:** First load might be slow on Vercel preview.

## Notes
- If server-side data/persistence becomes necessary, create a new task spec (do not extend this one).
