import { NextResponse } from "next/server";

import {
  validateCommunityApiRequest,
  validateCommunitySnapshot,
  validateCreateCommunityCommentInput,
  validateCreateCommunityPostInput,
  validateCreateCommunityReportInput,
  validateModerateCommunityReportInput,
  type CommunityComment,
  type CommunityPost,
  type CommunityReport,
  type CommunityReportStatus,
  type CommunitySnapshot,
} from "@core/contracts/community";

type CommunityApiErrorResponse = {
  ok: false;
  code: string;
  message: string;
  path?: string;
};

type CommunityApiSuccessResponse = {
  ok: true;
  snapshot: CommunitySnapshot;
};

const MODERATION_ROLE_HEADER = "x-sy-request-role";
const MODERATION_TOKEN_HEADER = "x-sy-role-token";

let postSequence = 0;
let commentSequence = 0;
let reportSequence = 0;

const state: CommunitySnapshot = {
  posts: [],
  comments: [],
  reports: [],
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

const reportStatusRank: Record<CommunityReportStatus, number> = {
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
  serverTime: state.serverTime,
});

const toErrorResponse = (
  status: number,
  code: string,
  message: string,
  path?: string
) => {
  const body: CommunityApiErrorResponse = {
    ok: false,
    code,
    message,
    ...(path ? { path } : {}),
  };
  return NextResponse.json(body, { status });
};

const createId = (prefix: "post" | "comment" | "report", sequence: number): string =>
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

  const body: CommunityApiSuccessResponse = {
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

const handleCreatePost = (payload: unknown) => {
  const payloadValidation = validateCreateCommunityPostInput(payload);
  if (!payloadValidation.ok) {
    return toErrorResponse(
      400,
      payloadValidation.code,
      payloadValidation.message,
      payloadValidation.path
    );
  }

  postSequence += 1;
  const timestamp = now();
  const created: CommunityPost = {
    id: createId("post", postSequence),
    authorId: payloadValidation.value.authorId,
    body: payloadValidation.value.body,
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  state.posts.push(created);
  setServerTime(timestamp);
  return resolveSnapshotResponse();
};

const handleCreateComment = (payload: unknown) => {
  const payloadValidation = validateCreateCommunityCommentInput(payload);
  if (!payloadValidation.ok) {
    return toErrorResponse(
      400,
      payloadValidation.code,
      payloadValidation.message,
      payloadValidation.path
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

  commentSequence += 1;
  const timestamp = now();
  const created: CommunityComment = {
    id: createId("comment", commentSequence),
    postId: payloadValidation.value.postId,
    authorId: payloadValidation.value.authorId,
    body: payloadValidation.value.body,
    createdAt: timestamp,
  };

  state.comments.push(created);
  setServerTime(timestamp);
  return resolveSnapshotResponse();
};

const handleCreateReport = (payload: unknown) => {
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

  reportSequence += 1;
  const timestamp = now();
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

export async function GET() {
  return resolveSnapshotResponse();
}

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

  if (requestValidation.value.action === "moderate-report") {
    const access = hasValidModerationAccess(request);
    if (!access.ok) {
      return access.response;
    }
  }

  switch (requestValidation.value.action) {
    case "list":
      return resolveSnapshotResponse();
    case "create-post":
      return handleCreatePost(requestValidation.value.payload);
    case "create-comment":
      return handleCreateComment(requestValidation.value.payload);
    case "create-report":
      return handleCreateReport(requestValidation.value.payload);
    case "moderate-report":
      return handleModerateReport(requestValidation.value.payload);
    default:
      return toErrorResponse(
        400,
        "unsupported-community-action",
        "action is not supported.",
        "action"
      );
  }
}
