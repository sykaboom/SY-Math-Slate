import { NextResponse } from "next/server";

import { evaluateAdPolicyText } from "@features/governance/community/policy/adPolicy";
import { evaluateUgcSafetyText } from "@features/governance/community/safety/ugcSafetyFilter";
import {
  validateCommunityApiRequest,
  validateCommunitySnapshot,
  validateCommunityTrustSafetySloSummary,
  validateCreateCommunityCommentInput,
  validateCreateCommunityPostInput,
  validateCreateCommunityReportInput,
  validateCreateCommunityRightsClaimInput,
  validateModerateCommunityReportInput,
  validateReviewCommunityRightsClaimInput,
  type CommunityApiAction,
  type CommunityComment,
  type CommunityPost,
  type CommunityReport,
  type CommunityReportStatus,
  type CommunityRightsClaim,
  type CommunityRightsClaimStatus,
  type CommunitySafetyAction,
  type CommunitySafetyCategory,
  type CommunitySafetyEvent,
  type CommunitySafetyVerdict,
  type CommunitySnapshot,
  type CommunityTakedownRecord,
  type CommunityTrafficAction,
  type CommunityTrafficSignal,
  type CommunityTrustSafetySloSummary,
} from "@core/foundation/schemas/community";
import { assessInvalidTraffic } from "@features/governance/community/traffic/invalidTraffic";

type CommunityApiErrorResponse = {
  ok: false;
  code: string;
  message: string;
  path?: string;
};

type CommunityApiSnapshotSuccessResponse = {
  ok: true;
  snapshot: CommunitySnapshot;
};

type CommunityApiSloSuccessResponse = {
  ok: true;
  summary: CommunityTrustSafetySloSummary;
};

const MODERATION_ROLE_HEADER = "x-sy-request-role";
const MODERATION_TOKEN_HEADER = "x-sy-role-token";

const MAX_TRAFFIC_SIGNALS = 120;
const MAX_SAFETY_EVENTS = 240;

let postSequence = 0;
let commentSequence = 0;
let reportSequence = 0;
let rightsClaimSequence = 0;
let takedownSequence = 0;
let trafficSignalSequence = 0;
let safetyEventSequence = 0;

const state: CommunitySnapshot = {
  posts: [],
  comments: [],
  reports: [],
  rightsClaims: [],
  takedownRecords: [],
  trafficSignals: [],
  safetyEvents: [],
  serverTime: 0,
};

const clonePost = (post: CommunityPost): CommunityPost => ({
  id: post.id,
  authorId: post.authorId,
  body: post.body,
  createdAt: post.createdAt,
  updatedAt: post.updatedAt,
});

const cloneComment = (comment: CommunityComment): CommunityComment => ({
  id: comment.id,
  postId: comment.postId,
  authorId: comment.authorId,
  body: comment.body,
  createdAt: comment.createdAt,
});

const cloneReport = (report: CommunityReport): CommunityReport => ({
  id: report.id,
  targetType: report.targetType,
  targetId: report.targetId,
  reason: report.reason,
  detail: report.detail,
  reporterId: report.reporterId,
  status: report.status,
  createdAt: report.createdAt,
  moderatedAt: report.moderatedAt,
  moderatorId: report.moderatorId,
  moderationNote: report.moderationNote,
});

const cloneRightsClaim = (claim: CommunityRightsClaim): CommunityRightsClaim => ({
  id: claim.id,
  targetType: claim.targetType,
  targetId: claim.targetId,
  claimType: claim.claimType,
  detail: claim.detail,
  evidenceUrl: claim.evidenceUrl,
  claimantId: claim.claimantId,
  status: claim.status,
  createdAt: claim.createdAt,
  reviewedAt: claim.reviewedAt,
  reviewerId: claim.reviewerId,
  reviewNote: claim.reviewNote,
});

const cloneTakedownRecord = (
  record: CommunityTakedownRecord
): CommunityTakedownRecord => ({
  id: record.id,
  claimId: record.claimId,
  targetType: record.targetType,
  targetId: record.targetId,
  reason: "rights-claim-approved",
  createdAt: record.createdAt,
  reviewerId: record.reviewerId,
});

const cloneTrafficSignal = (signal: CommunityTrafficSignal): CommunityTrafficSignal => ({
  id: signal.id,
  action: signal.action,
  actorId: signal.actorId,
  fingerprint: signal.fingerprint,
  riskLevel: signal.riskLevel,
  reason: signal.reason,
  observedAt: signal.observedAt,
  sampleCount: signal.sampleCount,
});

const cloneSafetyEvent = (event: CommunitySafetyEvent): CommunitySafetyEvent => ({
  id: event.id,
  action: event.action,
  actorId: event.actorId,
  verdict: event.verdict,
  category: event.category,
  matchedTerm: event.matchedTerm,
  targetId: event.targetId,
  observedAt: event.observedAt,
});

const reportStatusRank: Record<CommunityReportStatus, number> = {
  pending: 0,
  approved: 1,
  rejected: 2,
};

const rightsClaimStatusRank: Record<CommunityRightsClaimStatus, number> = {
  pending: 0,
  approved: 1,
  rejected: 2,
};

const createSnapshot = (): CommunitySnapshot => ({
  posts: [...state.posts].map(clonePost).sort((a, b) => {
    if (a.createdAt !== b.createdAt) return a.createdAt - b.createdAt;
    return a.id.localeCompare(b.id);
  }),
  comments: [...state.comments].map(cloneComment).sort((a, b) => {
    if (a.createdAt !== b.createdAt) return a.createdAt - b.createdAt;
    if (a.postId !== b.postId) return a.postId.localeCompare(b.postId);
    return a.id.localeCompare(b.id);
  }),
  reports: [...state.reports].map(cloneReport).sort((a, b) => {
    const statusDiff = reportStatusRank[a.status] - reportStatusRank[b.status];
    if (statusDiff !== 0) return statusDiff;
    if (a.createdAt !== b.createdAt) return a.createdAt - b.createdAt;
    return a.id.localeCompare(b.id);
  }),
  rightsClaims: [...state.rightsClaims].map(cloneRightsClaim).sort((a, b) => {
    const statusDiff = rightsClaimStatusRank[a.status] - rightsClaimStatusRank[b.status];
    if (statusDiff !== 0) return statusDiff;
    if (a.createdAt !== b.createdAt) return a.createdAt - b.createdAt;
    return a.id.localeCompare(b.id);
  }),
  takedownRecords: [...state.takedownRecords]
    .map(cloneTakedownRecord)
    .sort((a, b) => {
      if (a.createdAt !== b.createdAt) return a.createdAt - b.createdAt;
      return a.id.localeCompare(b.id);
    }),
  trafficSignals: [...state.trafficSignals]
    .map(cloneTrafficSignal)
    .sort((a, b) => {
      if (a.observedAt !== b.observedAt) return b.observedAt - a.observedAt;
      return b.id.localeCompare(a.id);
    }),
  safetyEvents: [...state.safetyEvents]
    .map(cloneSafetyEvent)
    .sort((a, b) => {
      if (a.observedAt !== b.observedAt) return b.observedAt - a.observedAt;
      return b.id.localeCompare(a.id);
    }),
  serverTime: state.serverTime,
});

const toErrorResponse = (
  status: number,
  code: string,
  message: string,
  path?: string,
  headers?: Record<string, string>
) => {
  const body: CommunityApiErrorResponse = {
    ok: false,
    code,
    message,
    ...(path ? { path } : {}),
  };
  return NextResponse.json(body, {
    status,
    ...(headers ? { headers } : {}),
  });
};

const createId = (prefix: string, sequence: number): string =>
  `${prefix}-${String(sequence).padStart(6, "0")}`;

const setServerTime = (timestamp: number): void => {
  state.serverTime = Math.max(state.serverTime, timestamp);
};

const resolveSnapshotResponse = () => {
  const snapshot = createSnapshot();
  const snapshotValidation = validateCommunitySnapshot(snapshot);
  if (!snapshotValidation.ok) {
    return toErrorResponse(
      500,
      "community-state-invalid",
      `${snapshotValidation.code}: ${snapshotValidation.message}`,
      snapshotValidation.path
    );
  }

  const body: CommunityApiSnapshotSuccessResponse = {
    ok: true,
    snapshot: snapshotValidation.value,
  };
  return NextResponse.json(body);
};

const now = (): number => Date.now();

const hasValidModerationAccess = (
  request: Request
): { ok: true } | { ok: false; response: NextResponse<CommunityApiErrorResponse> } => {
  const expectedHostToken = (process.env.SY_MATH_SLATE_HOST_ROLE_TOKEN ?? "").trim();
  if (expectedHostToken === "") {
    return {
      ok: false,
      response: toErrorResponse(
        500,
        "community-host-token-not-configured",
        "host moderation token is not configured on server."
      ),
    };
  }

  const requestedRole = (request.headers.get(MODERATION_ROLE_HEADER) ?? "").trim();
  if (requestedRole !== "host") {
    return {
      ok: false,
      response: toErrorResponse(
        403,
        "community-moderation-role-required",
        "moderation action requires host role."
      ),
    };
  }

  const providedToken = (request.headers.get(MODERATION_TOKEN_HEADER) ?? "").trim();
  if (providedToken !== expectedHostToken) {
    return {
      ok: false,
      response: toErrorResponse(
        403,
        "community-host-token-invalid",
        "moderation host token is invalid."
      ),
    };
  }

  return { ok: true };
};

const hashFingerprint = (source: string): string => {
  let hash = 2166136261;
  for (let i = 0; i < source.length; i += 1) {
    hash ^= source.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return `fp_${(hash >>> 0).toString(36)}`;
};

const toTrafficFingerprint = (request: Request): string => {
  const forwardedFor = request.headers.get("x-forwarded-for") ?? "";
  const userAgent = request.headers.get("user-agent") ?? "";
  const firstIp = forwardedFor.split(",")[0]?.trim() ?? "";
  return hashFingerprint(`${firstIp}|${userAgent}`);
};

const pushTrafficSignal = (signal: CommunityTrafficSignal): void => {
  state.trafficSignals.push(signal);
  while (state.trafficSignals.length > MAX_TRAFFIC_SIGNALS) {
    state.trafficSignals.shift();
  }
};

const pushSafetyEvent = (event: CommunitySafetyEvent): void => {
  state.safetyEvents.push(event);
  while (state.safetyEvents.length > MAX_SAFETY_EVENTS) {
    state.safetyEvents.shift();
  }
};

const toReportReasonFromSafetyCategory = (
  category: CommunitySafetyCategory | null
): CommunityReport["reason"] => {
  if (category === "spam") return "spam";
  if (category === "abuse" || category === "violence" || category === "sexual") {
    return "abuse";
  }
  return "other";
};

const toSafetyActionFromTrafficAction = (
  action: CommunityTrafficAction
): CommunitySafetyAction => (action === "create-comment" ? "create-comment" : "create-post");

const appendSafetyEvent = (input: {
  action: CommunitySafetyAction;
  actorId: string;
  verdict: CommunitySafetyVerdict;
  category: CommunitySafetyCategory | null;
  matchedTerm: string | null;
  targetId: string | null;
  observedAt: number;
}) => {
  safetyEventSequence += 1;
  pushSafetyEvent({
    id: createId("safety", safetyEventSequence),
    action: input.action,
    actorId: input.actorId,
    verdict: input.verdict,
    category: input.category,
    matchedTerm: input.matchedTerm,
    targetId: input.targetId,
    observedAt: input.observedAt,
  });
};

const assessAndApplyTrafficPolicy = (input: {
  request: Request;
  action: CommunityTrafficAction;
  actorId: string | null;
  timestamp: number;
}): NextResponse<CommunityApiErrorResponse> | null => {
  const fingerprint = toTrafficFingerprint(input.request);
  const assessment = assessInvalidTraffic({
    action: input.action,
    fingerprint,
    actorId: input.actorId,
    now: input.timestamp,
  });

  if (assessment.level !== "normal") {
    trafficSignalSequence += 1;
    pushTrafficSignal({
      id: createId("traffic", trafficSignalSequence),
      action: input.action,
      actorId: input.actorId,
      fingerprint,
      riskLevel: assessment.level,
      reason: assessment.reason,
      observedAt: input.timestamp,
      sampleCount: assessment.sampleCount,
    });
    setServerTime(input.timestamp);
  }

  if (assessment.level !== "blocked") return null;

  return toErrorResponse(
    429,
    "community-invalid-traffic-blocked",
    "mutation request blocked by invalid traffic policy.",
    "traffic",
    {
      "x-sy-traffic-level": assessment.level,
      "x-sy-traffic-count": String(assessment.sampleCount),
    }
  );
};

const handleCreatePost = (payload: unknown, request: Request) => {
  const payloadValidation = validateCreateCommunityPostInput(payload);
  if (!payloadValidation.ok) {
    return toErrorResponse(
      400,
      payloadValidation.code,
      payloadValidation.message,
      payloadValidation.path
    );
  }

  const adPolicyDecision = evaluateAdPolicyText(payloadValidation.value.body);
  if (!adPolicyDecision.allow) {
    return toErrorResponse(
      422,
      adPolicyDecision.code,
      adPolicyDecision.message,
      "body"
    );
  }

  const timestamp = now();
  const safetyAction = toSafetyActionFromTrafficAction("create-post");
  const safetyDecision = evaluateUgcSafetyText(payloadValidation.value.body);
  if (safetyDecision.verdict === "block") {
    appendSafetyEvent({
      action: safetyAction,
      actorId: payloadValidation.value.authorId,
      verdict: "block",
      category: safetyDecision.category,
      matchedTerm: safetyDecision.matchedTerm,
      targetId: null,
      observedAt: timestamp,
    });
    setServerTime(timestamp);
    return toErrorResponse(
      422,
      safetyDecision.code,
      safetyDecision.message,
      "body"
    );
  }

  const blockedTraffic = assessAndApplyTrafficPolicy({
    request,
    action: "create-post",
    actorId: payloadValidation.value.authorId,
    timestamp,
  });
  if (blockedTraffic) return blockedTraffic;

  postSequence += 1;
  const created: CommunityPost = {
    id: createId("post", postSequence),
    authorId: payloadValidation.value.authorId,
    body: payloadValidation.value.body,
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  state.posts.push(created);

  if (safetyDecision.verdict === "review") {
    appendSafetyEvent({
      action: safetyAction,
      actorId: payloadValidation.value.authorId,
      verdict: "review",
      category: safetyDecision.category,
      matchedTerm: safetyDecision.matchedTerm,
      targetId: created.id,
      observedAt: timestamp,
    });

    reportSequence += 1;
    state.reports.push({
      id: createId("report", reportSequence),
      targetType: "post",
      targetId: created.id,
      reason: toReportReasonFromSafetyCategory(safetyDecision.category),
      detail: `[AUTO-SAFETY] ${safetyDecision.message}${
        safetyDecision.matchedTerm ? ` term=${safetyDecision.matchedTerm}` : ""
      }`,
      reporterId: "system:ugc-safety",
      status: "pending",
      createdAt: timestamp,
      moderatedAt: null,
      moderatorId: null,
      moderationNote: null,
    });
  }

  setServerTime(timestamp);
  return resolveSnapshotResponse();
};

const handleCreateComment = (payload: unknown, request: Request) => {
  const payloadValidation = validateCreateCommunityCommentInput(payload);
  if (!payloadValidation.ok) {
    return toErrorResponse(
      400,
      payloadValidation.code,
      payloadValidation.message,
      payloadValidation.path
    );
  }

  const adPolicyDecision = evaluateAdPolicyText(payloadValidation.value.body);
  if (!adPolicyDecision.allow) {
    return toErrorResponse(
      422,
      adPolicyDecision.code,
      adPolicyDecision.message,
      "body"
    );
  }

  const postExists = state.posts.some(
    (post) => post.id === payloadValidation.value.postId
  );
  if (!postExists) {
    return toErrorResponse(
      404,
      "community-post-not-found",
      "target post does not exist.",
      "postId"
    );
  }

  const timestamp = now();
  const safetyAction = toSafetyActionFromTrafficAction("create-comment");
  const safetyDecision = evaluateUgcSafetyText(payloadValidation.value.body);
  if (safetyDecision.verdict === "block") {
    appendSafetyEvent({
      action: safetyAction,
      actorId: payloadValidation.value.authorId,
      verdict: "block",
      category: safetyDecision.category,
      matchedTerm: safetyDecision.matchedTerm,
      targetId: null,
      observedAt: timestamp,
    });
    setServerTime(timestamp);
    return toErrorResponse(
      422,
      safetyDecision.code,
      safetyDecision.message,
      "body"
    );
  }

  const blockedTraffic = assessAndApplyTrafficPolicy({
    request,
    action: "create-comment",
    actorId: payloadValidation.value.authorId,
    timestamp,
  });
  if (blockedTraffic) return blockedTraffic;

  commentSequence += 1;
  const created: CommunityComment = {
    id: createId("comment", commentSequence),
    postId: payloadValidation.value.postId,
    authorId: payloadValidation.value.authorId,
    body: payloadValidation.value.body,
    createdAt: timestamp,
  };

  state.comments.push(created);

  if (safetyDecision.verdict === "review") {
    appendSafetyEvent({
      action: safetyAction,
      actorId: payloadValidation.value.authorId,
      verdict: "review",
      category: safetyDecision.category,
      matchedTerm: safetyDecision.matchedTerm,
      targetId: created.id,
      observedAt: timestamp,
    });

    reportSequence += 1;
    state.reports.push({
      id: createId("report", reportSequence),
      targetType: "comment",
      targetId: created.id,
      reason: toReportReasonFromSafetyCategory(safetyDecision.category),
      detail: `[AUTO-SAFETY] ${safetyDecision.message}${
        safetyDecision.matchedTerm ? ` term=${safetyDecision.matchedTerm}` : ""
      }`,
      reporterId: "system:ugc-safety",
      status: "pending",
      createdAt: timestamp,
      moderatedAt: null,
      moderatorId: null,
      moderationNote: null,
    });
  }

  setServerTime(timestamp);
  return resolveSnapshotResponse();
};

const handleCreateReport = (payload: unknown, request: Request) => {
  const payloadValidation = validateCreateCommunityReportInput(payload);
  if (!payloadValidation.ok) {
    return toErrorResponse(
      400,
      payloadValidation.code,
      payloadValidation.message,
      payloadValidation.path
    );
  }

  const targetExists =
    payloadValidation.value.targetType === "post"
      ? state.posts.some((post) => post.id === payloadValidation.value.targetId)
      : state.comments.some(
          (comment) => comment.id === payloadValidation.value.targetId
        );

  if (!targetExists) {
    return toErrorResponse(
      404,
      "community-report-target-not-found",
      "report target does not exist.",
      "targetId"
    );
  }

  const timestamp = now();
  const blockedTraffic = assessAndApplyTrafficPolicy({
    request,
    action: "create-report",
    actorId: payloadValidation.value.reporterId,
    timestamp,
  });
  if (blockedTraffic) return blockedTraffic;

  reportSequence += 1;
  const created: CommunityReport = {
    id: createId("report", reportSequence),
    targetType: payloadValidation.value.targetType,
    targetId: payloadValidation.value.targetId,
    reason: payloadValidation.value.reason,
    detail: payloadValidation.value.detail,
    reporterId: payloadValidation.value.reporterId,
    status: "pending",
    createdAt: timestamp,
    moderatedAt: null,
    moderatorId: null,
    moderationNote: null,
  };

  state.reports.push(created);
  setServerTime(timestamp);
  return resolveSnapshotResponse();
};

const handleModerateReport = (payload: unknown) => {
  const payloadValidation = validateModerateCommunityReportInput(payload);
  if (!payloadValidation.ok) {
    return toErrorResponse(
      400,
      payloadValidation.code,
      payloadValidation.message,
      payloadValidation.path
    );
  }

  const reportIndex = state.reports.findIndex(
    (report) => report.id === payloadValidation.value.reportId
  );
  if (reportIndex < 0) {
    return toErrorResponse(
      404,
      "community-report-not-found",
      "report does not exist.",
      "reportId"
    );
  }

  const current = state.reports[reportIndex];
  if (current.status !== "pending") {
    return toErrorResponse(
      409,
      "community-report-already-resolved",
      "report is already resolved.",
      "reportId"
    );
  }

  const timestamp = now();
  const nextStatus: CommunityReportStatus =
    payloadValidation.value.decision === "approve" ? "approved" : "rejected";

  state.reports[reportIndex] = {
    ...current,
    status: nextStatus,
    moderatedAt: timestamp,
    moderatorId: payloadValidation.value.moderatorId,
    moderationNote: payloadValidation.value.note ?? null,
  };
  setServerTime(timestamp);

  return resolveSnapshotResponse();
};

const handleCreateRightsClaim = (payload: unknown, request: Request) => {
  const payloadValidation = validateCreateCommunityRightsClaimInput(payload);
  if (!payloadValidation.ok) {
    return toErrorResponse(
      400,
      payloadValidation.code,
      payloadValidation.message,
      payloadValidation.path
    );
  }

  const targetExists =
    payloadValidation.value.targetType === "post"
      ? state.posts.some((post) => post.id === payloadValidation.value.targetId)
      : state.comments.some(
          (comment) => comment.id === payloadValidation.value.targetId
        );

  if (!targetExists) {
    return toErrorResponse(
      404,
      "community-rights-claim-target-not-found",
      "rights claim target does not exist.",
      "targetId"
    );
  }

  const timestamp = now();
  const blockedTraffic = assessAndApplyTrafficPolicy({
    request,
    action: "create-rights-claim",
    actorId: payloadValidation.value.claimantId,
    timestamp,
  });
  if (blockedTraffic) return blockedTraffic;

  rightsClaimSequence += 1;
  state.rightsClaims.push({
    id: createId("rights", rightsClaimSequence),
    targetType: payloadValidation.value.targetType,
    targetId: payloadValidation.value.targetId,
    claimType: payloadValidation.value.claimType,
    detail: payloadValidation.value.detail,
    evidenceUrl: payloadValidation.value.evidenceUrl,
    claimantId: payloadValidation.value.claimantId,
    status: "pending",
    createdAt: timestamp,
    reviewedAt: null,
    reviewerId: null,
    reviewNote: null,
  });
  setServerTime(timestamp);
  return resolveSnapshotResponse();
};

const handleReviewRightsClaim = (payload: unknown) => {
  const payloadValidation = validateReviewCommunityRightsClaimInput(payload);
  if (!payloadValidation.ok) {
    return toErrorResponse(
      400,
      payloadValidation.code,
      payloadValidation.message,
      payloadValidation.path
    );
  }

  const claimIndex = state.rightsClaims.findIndex(
    (claim) => claim.id === payloadValidation.value.claimId
  );
  if (claimIndex < 0) {
    return toErrorResponse(
      404,
      "community-rights-claim-not-found",
      "rights claim does not exist.",
      "claimId"
    );
  }

  const current = state.rightsClaims[claimIndex];
  if (current.status !== "pending") {
    return toErrorResponse(
      409,
      "community-rights-claim-already-resolved",
      "rights claim is already resolved.",
      "claimId"
    );
  }

  const timestamp = now();
  const nextStatus: CommunityRightsClaimStatus =
    payloadValidation.value.decision === "approve" ? "approved" : "rejected";

  state.rightsClaims[claimIndex] = {
    ...current,
    status: nextStatus,
    reviewedAt: timestamp,
    reviewerId: payloadValidation.value.reviewerId,
    reviewNote: payloadValidation.value.note ?? null,
  };

  if (nextStatus === "approved") {
    takedownSequence += 1;
    state.takedownRecords.push({
      id: createId("takedown", takedownSequence),
      claimId: current.id,
      targetType: current.targetType,
      targetId: current.targetId,
      reason: "rights-claim-approved",
      createdAt: timestamp,
      reviewerId: payloadValidation.value.reviewerId,
    });

    if (current.targetType === "post") {
      const targetIndex = state.posts.findIndex((post) => post.id === current.targetId);
      if (targetIndex >= 0) {
        state.posts[targetIndex] = {
          ...state.posts[targetIndex],
          body: "[TAKEDOWNED: RIGHTS CLAIM APPROVED]",
          updatedAt: timestamp,
        };
      }
    } else {
      const targetIndex = state.comments.findIndex(
        (comment) => comment.id === current.targetId
      );
      if (targetIndex >= 0) {
        state.comments[targetIndex] = {
          ...state.comments[targetIndex],
          body: "[TAKEDOWNED: RIGHTS CLAIM APPROVED]",
        };
      }
    }
  }

  setServerTime(timestamp);
  return resolveSnapshotResponse();
};

const averageResolutionMs = (
  values: Array<{ createdAt: number; resolvedAt: number | null }>
): number | null => {
  const resolved = values
    .filter((entry) => entry.resolvedAt !== null && entry.resolvedAt >= entry.createdAt)
    .map((entry) => (entry.resolvedAt as number) - entry.createdAt);
  if (resolved.length === 0) return null;
  const total = resolved.reduce((sum, duration) => sum + duration, 0);
  return Math.floor(total / resolved.length);
};

const buildTrustSafetySloSummary = (): CommunityTrustSafetySloSummary => {
  const generatedAt = now();
  const last24h = generatedAt - 24 * 60 * 60 * 1000;

  return {
    generatedAt,
    pendingReports: state.reports.filter((entry) => entry.status === "pending").length,
    pendingRightsClaims: state.rightsClaims.filter(
      (entry) => entry.status === "pending"
    ).length,
    avgReportResolutionMs: averageResolutionMs(
      state.reports.map((entry) => ({
        createdAt: entry.createdAt,
        resolvedAt: entry.moderatedAt,
      }))
    ),
    avgRightsClaimResolutionMs: averageResolutionMs(
      state.rightsClaims.map((entry) => ({
        createdAt: entry.createdAt,
        resolvedAt: entry.reviewedAt,
      }))
    ),
    elevatedTrafficSignals24h: state.trafficSignals.filter(
      (signal) => signal.observedAt >= last24h && signal.riskLevel === "elevated"
    ).length,
    blockedTrafficSignals24h: state.trafficSignals.filter(
      (signal) => signal.observedAt >= last24h && signal.riskLevel === "blocked"
    ).length,
  };
};

const handleTrustSafetySlo = () => {
  const summary = buildTrustSafetySloSummary();
  const validation = validateCommunityTrustSafetySloSummary(summary);
  if (!validation.ok) {
    return toErrorResponse(
      500,
      "community-trust-safety-slo-invalid",
      `${validation.code}: ${validation.message}`,
      validation.path
    );
  }

  const body: CommunityApiSloSuccessResponse = {
    ok: true,
    summary: validation.value,
  };
  return NextResponse.json(body);
};

export async function GET() {
  return resolveSnapshotResponse();
}

const requiresHostAccess = (action: CommunityApiAction): boolean =>
  action === "moderate-report" ||
  action === "review-rights-claim" ||
  action === "trust-safety-slo";

export async function POST(request: Request) {
  let requestBody: unknown;
  try {
    requestBody = await request.json();
  } catch {
    return toErrorResponse(
      400,
      "invalid-community-json",
      "request body must be valid JSON."
    );
  }

  const requestValidation = validateCommunityApiRequest(requestBody);
  if (!requestValidation.ok) {
    return toErrorResponse(
      400,
      requestValidation.code,
      requestValidation.message,
      requestValidation.path
    );
  }

  if (requiresHostAccess(requestValidation.value.action)) {
    const access = hasValidModerationAccess(request);
    if (!access.ok) {
      return access.response;
    }
  }

  switch (requestValidation.value.action) {
    case "list":
      return resolveSnapshotResponse();
    case "create-post":
      return handleCreatePost(requestValidation.value.payload, request);
    case "create-comment":
      return handleCreateComment(requestValidation.value.payload, request);
    case "create-report":
      return handleCreateReport(requestValidation.value.payload, request);
    case "moderate-report":
      return handleModerateReport(requestValidation.value.payload);
    case "create-rights-claim":
      return handleCreateRightsClaim(requestValidation.value.payload, request);
    case "review-rights-claim":
      return handleReviewRightsClaim(requestValidation.value.payload);
    case "trust-safety-slo":
      return handleTrustSafetySlo();
    default:
      return toErrorResponse(
        400,
        "unsupported-community-action",
        "action is not supported.",
        "action"
      );
  }
}
