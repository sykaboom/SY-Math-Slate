export type CommunityReportTargetType = "post" | "comment";
export type CommunityReportReason = "spam" | "abuse" | "copyright" | "other";
export type CommunityReportStatus = "pending" | "approved" | "rejected";
export type CommunityModerationDecision = "approve" | "reject";
export type CommunityRightsClaimType =
  | "copyright"
  | "trademark"
  | "impersonation"
  | "other";
export type CommunityRightsClaimStatus = "pending" | "approved" | "rejected";
export type CommunityRightsClaimDecision = "approve" | "reject";
export type CommunityTrafficRiskLevel = "elevated" | "blocked";
export type CommunityTrafficAction =
  | "create-post"
  | "create-comment"
  | "create-report"
  | "create-rights-claim";
export type CommunitySafetyAction = "create-post" | "create-comment";
export type CommunitySafetyVerdict = "allow" | "review" | "block";
export type CommunitySafetyCategory =
  | "abuse"
  | "sexual"
  | "self-harm"
  | "violence"
  | "spam";

export type CommunityPost = {
  id: string;
  authorId: string;
  body: string;
  createdAt: number;
  updatedAt: number;
};

export type CommunityComment = {
  id: string;
  postId: string;
  authorId: string;
  body: string;
  createdAt: number;
};

export type CommunityReport = {
  id: string;
  targetType: CommunityReportTargetType;
  targetId: string;
  reason: CommunityReportReason;
  detail?: string;
  reporterId: string;
  status: CommunityReportStatus;
  createdAt: number;
  moderatedAt: number | null;
  moderatorId: string | null;
  moderationNote: string | null;
};

export type CommunityRightsClaim = {
  id: string;
  targetType: CommunityReportTargetType;
  targetId: string;
  claimType: CommunityRightsClaimType;
  detail?: string;
  evidenceUrl?: string;
  claimantId: string;
  status: CommunityRightsClaimStatus;
  createdAt: number;
  reviewedAt: number | null;
  reviewerId: string | null;
  reviewNote: string | null;
};

export type CommunityTakedownRecord = {
  id: string;
  claimId: string;
  targetType: CommunityReportTargetType;
  targetId: string;
  reason: "rights-claim-approved";
  createdAt: number;
  reviewerId: string;
};

export type CommunityTrafficSignal = {
  id: string;
  action: CommunityTrafficAction;
  actorId: string | null;
  fingerprint: string;
  riskLevel: CommunityTrafficRiskLevel;
  reason: string;
  observedAt: number;
  sampleCount: number;
};

export type CommunitySafetyEvent = {
  id: string;
  action: CommunitySafetyAction;
  actorId: string;
  verdict: CommunitySafetyVerdict;
  category: CommunitySafetyCategory | null;
  matchedTerm: string | null;
  targetId: string | null;
  observedAt: number;
};

export type CommunitySnapshot = {
  posts: CommunityPost[];
  comments: CommunityComment[];
  reports: CommunityReport[];
  rightsClaims: CommunityRightsClaim[];
  takedownRecords: CommunityTakedownRecord[];
  trafficSignals: CommunityTrafficSignal[];
  safetyEvents: CommunitySafetyEvent[];
  serverTime: number;
};

export type CreateCommunityPostInput = {
  authorId: string;
  body: string;
};

export type CreateCommunityCommentInput = {
  postId: string;
  authorId: string;
  body: string;
};

export type CreateCommunityReportInput = {
  targetType: CommunityReportTargetType;
  targetId: string;
  reason: CommunityReportReason;
  detail?: string;
  reporterId: string;
};

export type ModerateCommunityReportInput = {
  reportId: string;
  decision: CommunityModerationDecision;
  moderatorId: string;
  note?: string;
};

export type CreateCommunityRightsClaimInput = {
  targetType: CommunityReportTargetType;
  targetId: string;
  claimType: CommunityRightsClaimType;
  detail?: string;
  evidenceUrl?: string;
  claimantId: string;
};

export type ReviewCommunityRightsClaimInput = {
  claimId: string;
  decision: CommunityRightsClaimDecision;
  reviewerId: string;
  note?: string;
};

export type CommunityTrustSafetySloSummary = {
  generatedAt: number;
  pendingReports: number;
  pendingRightsClaims: number;
  avgReportResolutionMs: number | null;
  avgRightsClaimResolutionMs: number | null;
  elevatedTrafficSignals24h: number;
  blockedTrafficSignals24h: number;
};

export type CommunityApiAction =
  | "list"
  | "create-post"
  | "create-comment"
  | "create-report"
  | "moderate-report"
  | "create-rights-claim"
  | "review-rights-claim"
  | "trust-safety-slo";

export type CommunityApiRequest = {
  action: CommunityApiAction;
  payload?: unknown;
};

export type CommunityValidationError = {
  ok: false;
  code: string;
  message: string;
  path: string;
};

export type CommunityValidationSuccess<T> = {
  ok: true;
  value: T;
};

export type CommunityValidationResult<T> =
  | CommunityValidationSuccess<T>
  | CommunityValidationError;

const VALID_REPORT_TARGET_TYPES = new Set<CommunityReportTargetType>([
  "post",
  "comment",
]);
const VALID_REPORT_REASONS = new Set<CommunityReportReason>([
  "spam",
  "abuse",
  "copyright",
  "other",
]);
const VALID_RIGHTS_CLAIM_TYPES = new Set<CommunityRightsClaimType>([
  "copyright",
  "trademark",
  "impersonation",
  "other",
]);
const VALID_REPORT_STATUSES = new Set<CommunityReportStatus>([
  "pending",
  "approved",
  "rejected",
]);
const VALID_RIGHTS_CLAIM_STATUSES = new Set<CommunityRightsClaimStatus>([
  "pending",
  "approved",
  "rejected",
]);
const VALID_MODERATION_DECISIONS = new Set<CommunityModerationDecision>([
  "approve",
  "reject",
]);
const VALID_RIGHTS_CLAIM_DECISIONS = new Set<CommunityRightsClaimDecision>([
  "approve",
  "reject",
]);
const VALID_TRAFFIC_RISK_LEVELS = new Set<CommunityTrafficRiskLevel>([
  "elevated",
  "blocked",
]);
const VALID_TRAFFIC_ACTIONS = new Set<CommunityTrafficAction>([
  "create-post",
  "create-comment",
  "create-report",
  "create-rights-claim",
]);
const VALID_SAFETY_ACTIONS = new Set<CommunitySafetyAction>([
  "create-post",
  "create-comment",
]);
const VALID_SAFETY_VERDICTS = new Set<CommunitySafetyVerdict>([
  "allow",
  "review",
  "block",
]);
const VALID_SAFETY_CATEGORIES = new Set<CommunitySafetyCategory>([
  "abuse",
  "sexual",
  "self-harm",
  "violence",
  "spam",
]);
const VALID_API_ACTIONS = new Set<CommunityApiAction>([
  "list",
  "create-post",
  "create-comment",
  "create-report",
  "moderate-report",
  "create-rights-claim",
  "review-rights-claim",
  "trust-safety-slo",
]);

const MAX_ID_LENGTH = 120;
const MAX_AUTHOR_ID_LENGTH = 120;
const MAX_BODY_LENGTH = 4000;
const MAX_DETAIL_LENGTH = 800;
const MAX_NOTE_LENGTH = 800;
const MAX_URL_LENGTH = 512;

const fail = (
  code: string,
  message: string,
  path: string
): CommunityValidationError => ({
  ok: false,
  code,
  message,
  path,
});

const ok = <T>(value: T): CommunityValidationSuccess<T> => ({
  ok: true,
  value,
});

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const validateBoundedString = (
  value: unknown,
  path: string,
  options: {
    code: string;
    message: string;
    maxLength: number;
    allowEmpty?: boolean;
  }
): CommunityValidationResult<string> => {
  if (typeof value !== "string") {
    return fail(options.code, options.message, path);
  }
  const trimmed = value.trim();
  if (!options.allowEmpty && trimmed.length === 0) {
    return fail(options.code, options.message, path);
  }
  if (trimmed.length > options.maxLength) {
    return fail(`${options.code}-too-long`, `${path} exceeds max length.`, path);
  }
  return ok(trimmed);
};

const validateOptionalBoundedString = (
  value: unknown,
  path: string,
  options: {
    code: string;
    message: string;
    maxLength: number;
  }
): CommunityValidationResult<string | undefined> => {
  if (value === undefined) return ok(undefined);
  const validated = validateBoundedString(value, path, {
    ...options,
    allowEmpty: true,
  });
  if (!validated.ok) return validated;
  const trimmed = validated.value.trim();
  return ok(trimmed === "" ? undefined : trimmed);
};

const validateOptionalUrlString = (
  value: unknown,
  path: string
): CommunityValidationResult<string | undefined> => {
  const validated = validateOptionalBoundedString(value, path, {
    code: "invalid-url",
    message: "value must be a string when provided.",
    maxLength: MAX_URL_LENGTH,
  });
  if (!validated.ok) return validated;
  if (validated.value === undefined) return ok(undefined);

  try {
    const parsed = new URL(validated.value);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return fail(
        "invalid-url-protocol",
        `${path} must use http:// or https:// protocol.`,
        path
      );
    }
  } catch {
    return fail("invalid-url-format", `${path} must be a valid URL.`, path);
  }

  return ok(validated.value);
};

const validateTimestamp = (
  value: unknown,
  path: string,
  code: string,
  message: string
): CommunityValidationResult<number> => {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
    return fail(code, message, path);
  }
  return ok(Math.floor(value));
};

const validateNullableTimestamp = (
  value: unknown,
  path: string
): CommunityValidationResult<number | null> => {
  if (value === null) return ok(null);
  return validateTimestamp(
    value,
    path,
    "invalid-report-moderated-at",
    "report.moderatedAt must be a non-negative number or null."
  );
};

const validateNullableIdString = (
  value: unknown,
  path: string,
  code: string,
  message: string
): CommunityValidationResult<string | null> => {
  if (value === null) return ok(null);
  return validateBoundedString(value, path, {
    code,
    message,
    maxLength: MAX_ID_LENGTH,
  });
};

const validateNullableOptionalText = (
  value: unknown,
  path: string,
  code: string,
  message: string
): CommunityValidationResult<string | null> => {
  if (value === null) return ok(null);
  const validated = validateOptionalBoundedString(value, path, {
    code,
    message,
    maxLength: MAX_NOTE_LENGTH,
  });
  if (!validated.ok) return validated;
  return ok(validated.value ?? null);
};

export const validateCreateCommunityPostInput = (
  value: unknown
): CommunityValidationResult<CreateCommunityPostInput> => {
  if (!isRecord(value)) {
    return fail("invalid-create-post-root", "create-post payload must be an object.", "root");
  }

  const authorValidation = validateBoundedString(value.authorId, "authorId", {
    code: "invalid-create-post-author-id",
    message: "authorId must be a non-empty string.",
    maxLength: MAX_AUTHOR_ID_LENGTH,
  });
  if (!authorValidation.ok) return authorValidation;

  const bodyValidation = validateBoundedString(value.body, "body", {
    code: "invalid-create-post-body",
    message: "body must be a non-empty string.",
    maxLength: MAX_BODY_LENGTH,
  });
  if (!bodyValidation.ok) return bodyValidation;

  return ok({
    authorId: authorValidation.value,
    body: bodyValidation.value,
  });
};

export const validateCreateCommunityCommentInput = (
  value: unknown
): CommunityValidationResult<CreateCommunityCommentInput> => {
  if (!isRecord(value)) {
    return fail(
      "invalid-create-comment-root",
      "create-comment payload must be an object.",
      "root"
    );
  }

  const postValidation = validateBoundedString(value.postId, "postId", {
    code: "invalid-create-comment-post-id",
    message: "postId must be a non-empty string.",
    maxLength: MAX_ID_LENGTH,
  });
  if (!postValidation.ok) return postValidation;

  const authorValidation = validateBoundedString(value.authorId, "authorId", {
    code: "invalid-create-comment-author-id",
    message: "authorId must be a non-empty string.",
    maxLength: MAX_AUTHOR_ID_LENGTH,
  });
  if (!authorValidation.ok) return authorValidation;

  const bodyValidation = validateBoundedString(value.body, "body", {
    code: "invalid-create-comment-body",
    message: "body must be a non-empty string.",
    maxLength: MAX_BODY_LENGTH,
  });
  if (!bodyValidation.ok) return bodyValidation;

  return ok({
    postId: postValidation.value,
    authorId: authorValidation.value,
    body: bodyValidation.value,
  });
};

export const validateCreateCommunityReportInput = (
  value: unknown
): CommunityValidationResult<CreateCommunityReportInput> => {
  if (!isRecord(value)) {
    return fail(
      "invalid-create-report-root",
      "create-report payload must be an object.",
      "root"
    );
  }

  if (
    typeof value.targetType !== "string" ||
    !VALID_REPORT_TARGET_TYPES.has(value.targetType as CommunityReportTargetType)
  ) {
    return fail(
      "invalid-create-report-target-type",
      "targetType must be one of post/comment.",
      "targetType"
    );
  }

  const targetIdValidation = validateBoundedString(value.targetId, "targetId", {
    code: "invalid-create-report-target-id",
    message: "targetId must be a non-empty string.",
    maxLength: MAX_ID_LENGTH,
  });
  if (!targetIdValidation.ok) return targetIdValidation;

  if (
    typeof value.reason !== "string" ||
    !VALID_REPORT_REASONS.has(value.reason as CommunityReportReason)
  ) {
    return fail(
      "invalid-create-report-reason",
      "reason must be one of spam/abuse/copyright/other.",
      "reason"
    );
  }

  const detailValidation = validateOptionalBoundedString(value.detail, "detail", {
    code: "invalid-create-report-detail",
    message: "detail must be a string when provided.",
    maxLength: MAX_DETAIL_LENGTH,
  });
  if (!detailValidation.ok) return detailValidation;

  const reporterValidation = validateBoundedString(value.reporterId, "reporterId", {
    code: "invalid-create-report-reporter-id",
    message: "reporterId must be a non-empty string.",
    maxLength: MAX_AUTHOR_ID_LENGTH,
  });
  if (!reporterValidation.ok) return reporterValidation;

  return ok({
    targetType: value.targetType as CommunityReportTargetType,
    targetId: targetIdValidation.value,
    reason: value.reason as CommunityReportReason,
    detail: detailValidation.value,
    reporterId: reporterValidation.value,
  });
};

export const validateModerateCommunityReportInput = (
  value: unknown
): CommunityValidationResult<ModerateCommunityReportInput> => {
  if (!isRecord(value)) {
    return fail(
      "invalid-moderate-report-root",
      "moderate-report payload must be an object.",
      "root"
    );
  }

  const reportIdValidation = validateBoundedString(value.reportId, "reportId", {
    code: "invalid-moderate-report-id",
    message: "reportId must be a non-empty string.",
    maxLength: MAX_ID_LENGTH,
  });
  if (!reportIdValidation.ok) return reportIdValidation;

  if (
    typeof value.decision !== "string" ||
    !VALID_MODERATION_DECISIONS.has(value.decision as CommunityModerationDecision)
  ) {
    return fail(
      "invalid-moderate-report-decision",
      "decision must be one of approve/reject.",
      "decision"
    );
  }

  const moderatorValidation = validateBoundedString(value.moderatorId, "moderatorId", {
    code: "invalid-moderate-report-moderator-id",
    message: "moderatorId must be a non-empty string.",
    maxLength: MAX_AUTHOR_ID_LENGTH,
  });
  if (!moderatorValidation.ok) return moderatorValidation;

  const noteValidation = validateOptionalBoundedString(value.note, "note", {
    code: "invalid-moderate-report-note",
    message: "note must be a string when provided.",
    maxLength: MAX_NOTE_LENGTH,
  });
  if (!noteValidation.ok) return noteValidation;

  return ok({
    reportId: reportIdValidation.value,
    decision: value.decision as CommunityModerationDecision,
    moderatorId: moderatorValidation.value,
    note: noteValidation.value,
  });
};

export const validateCreateCommunityRightsClaimInput = (
  value: unknown
): CommunityValidationResult<CreateCommunityRightsClaimInput> => {
  if (!isRecord(value)) {
    return fail(
      "invalid-create-rights-claim-root",
      "create-rights-claim payload must be an object.",
      "root"
    );
  }

  if (
    typeof value.targetType !== "string" ||
    !VALID_REPORT_TARGET_TYPES.has(value.targetType as CommunityReportTargetType)
  ) {
    return fail(
      "invalid-create-rights-claim-target-type",
      "targetType must be one of post/comment.",
      "targetType"
    );
  }

  const targetIdValidation = validateBoundedString(value.targetId, "targetId", {
    code: "invalid-create-rights-claim-target-id",
    message: "targetId must be a non-empty string.",
    maxLength: MAX_ID_LENGTH,
  });
  if (!targetIdValidation.ok) return targetIdValidation;

  if (
    typeof value.claimType !== "string" ||
    !VALID_RIGHTS_CLAIM_TYPES.has(value.claimType as CommunityRightsClaimType)
  ) {
    return fail(
      "invalid-create-rights-claim-type",
      "claimType must be one of copyright/trademark/impersonation/other.",
      "claimType"
    );
  }

  const detailValidation = validateOptionalBoundedString(value.detail, "detail", {
    code: "invalid-create-rights-claim-detail",
    message: "detail must be a string when provided.",
    maxLength: MAX_DETAIL_LENGTH,
  });
  if (!detailValidation.ok) return detailValidation;

  const evidenceValidation = validateOptionalUrlString(
    value.evidenceUrl,
    "evidenceUrl"
  );
  if (!evidenceValidation.ok) return evidenceValidation;

  const claimantValidation = validateBoundedString(value.claimantId, "claimantId", {
    code: "invalid-create-rights-claim-claimant-id",
    message: "claimantId must be a non-empty string.",
    maxLength: MAX_AUTHOR_ID_LENGTH,
  });
  if (!claimantValidation.ok) return claimantValidation;

  return ok({
    targetType: value.targetType as CommunityReportTargetType,
    targetId: targetIdValidation.value,
    claimType: value.claimType as CommunityRightsClaimType,
    detail: detailValidation.value,
    evidenceUrl: evidenceValidation.value,
    claimantId: claimantValidation.value,
  });
};

export const validateReviewCommunityRightsClaimInput = (
  value: unknown
): CommunityValidationResult<ReviewCommunityRightsClaimInput> => {
  if (!isRecord(value)) {
    return fail(
      "invalid-review-rights-claim-root",
      "review-rights-claim payload must be an object.",
      "root"
    );
  }

  const claimIdValidation = validateBoundedString(value.claimId, "claimId", {
    code: "invalid-review-rights-claim-id",
    message: "claimId must be a non-empty string.",
    maxLength: MAX_ID_LENGTH,
  });
  if (!claimIdValidation.ok) return claimIdValidation;

  if (
    typeof value.decision !== "string" ||
    !VALID_RIGHTS_CLAIM_DECISIONS.has(value.decision as CommunityRightsClaimDecision)
  ) {
    return fail(
      "invalid-review-rights-claim-decision",
      "decision must be one of approve/reject.",
      "decision"
    );
  }

  const reviewerValidation = validateBoundedString(value.reviewerId, "reviewerId", {
    code: "invalid-review-rights-claim-reviewer-id",
    message: "reviewerId must be a non-empty string.",
    maxLength: MAX_AUTHOR_ID_LENGTH,
  });
  if (!reviewerValidation.ok) return reviewerValidation;

  const noteValidation = validateOptionalBoundedString(value.note, "note", {
    code: "invalid-review-rights-claim-note",
    message: "note must be a string when provided.",
    maxLength: MAX_NOTE_LENGTH,
  });
  if (!noteValidation.ok) return noteValidation;

  return ok({
    claimId: claimIdValidation.value,
    decision: value.decision as CommunityRightsClaimDecision,
    reviewerId: reviewerValidation.value,
    note: noteValidation.value,
  });
};

export const validateCommunityPost = (
  value: unknown,
  path = "root"
): CommunityValidationResult<CommunityPost> => {
  if (!isRecord(value)) {
    return fail("invalid-post", "post must be an object.", path);
  }

  const idValidation = validateBoundedString(value.id, `${path}.id`, {
    code: "invalid-post-id",
    message: "post.id must be a non-empty string.",
    maxLength: MAX_ID_LENGTH,
  });
  if (!idValidation.ok) return idValidation;

  const authorValidation = validateBoundedString(value.authorId, `${path}.authorId`, {
    code: "invalid-post-author-id",
    message: "post.authorId must be a non-empty string.",
    maxLength: MAX_AUTHOR_ID_LENGTH,
  });
  if (!authorValidation.ok) return authorValidation;

  const bodyValidation = validateBoundedString(value.body, `${path}.body`, {
    code: "invalid-post-body",
    message: "post.body must be a non-empty string.",
    maxLength: MAX_BODY_LENGTH,
  });
  if (!bodyValidation.ok) return bodyValidation;

  const createdAtValidation = validateTimestamp(
    value.createdAt,
    `${path}.createdAt`,
    "invalid-post-created-at",
    "post.createdAt must be a non-negative number."
  );
  if (!createdAtValidation.ok) return createdAtValidation;

  const updatedAtValidation = validateTimestamp(
    value.updatedAt,
    `${path}.updatedAt`,
    "invalid-post-updated-at",
    "post.updatedAt must be a non-negative number."
  );
  if (!updatedAtValidation.ok) return updatedAtValidation;

  return ok({
    id: idValidation.value,
    authorId: authorValidation.value,
    body: bodyValidation.value,
    createdAt: createdAtValidation.value,
    updatedAt: updatedAtValidation.value,
  });
};

export const validateCommunityComment = (
  value: unknown,
  path = "root"
): CommunityValidationResult<CommunityComment> => {
  if (!isRecord(value)) {
    return fail("invalid-comment", "comment must be an object.", path);
  }

  const idValidation = validateBoundedString(value.id, `${path}.id`, {
    code: "invalid-comment-id",
    message: "comment.id must be a non-empty string.",
    maxLength: MAX_ID_LENGTH,
  });
  if (!idValidation.ok) return idValidation;

  const postIdValidation = validateBoundedString(value.postId, `${path}.postId`, {
    code: "invalid-comment-post-id",
    message: "comment.postId must be a non-empty string.",
    maxLength: MAX_ID_LENGTH,
  });
  if (!postIdValidation.ok) return postIdValidation;

  const authorValidation = validateBoundedString(value.authorId, `${path}.authorId`, {
    code: "invalid-comment-author-id",
    message: "comment.authorId must be a non-empty string.",
    maxLength: MAX_AUTHOR_ID_LENGTH,
  });
  if (!authorValidation.ok) return authorValidation;

  const bodyValidation = validateBoundedString(value.body, `${path}.body`, {
    code: "invalid-comment-body",
    message: "comment.body must be a non-empty string.",
    maxLength: MAX_BODY_LENGTH,
  });
  if (!bodyValidation.ok) return bodyValidation;

  const createdAtValidation = validateTimestamp(
    value.createdAt,
    `${path}.createdAt`,
    "invalid-comment-created-at",
    "comment.createdAt must be a non-negative number."
  );
  if (!createdAtValidation.ok) return createdAtValidation;

  return ok({
    id: idValidation.value,
    postId: postIdValidation.value,
    authorId: authorValidation.value,
    body: bodyValidation.value,
    createdAt: createdAtValidation.value,
  });
};

export const validateCommunityReport = (
  value: unknown,
  path = "root"
): CommunityValidationResult<CommunityReport> => {
  if (!isRecord(value)) {
    return fail("invalid-report", "report must be an object.", path);
  }

  const idValidation = validateBoundedString(value.id, `${path}.id`, {
    code: "invalid-report-id",
    message: "report.id must be a non-empty string.",
    maxLength: MAX_ID_LENGTH,
  });
  if (!idValidation.ok) return idValidation;

  if (
    typeof value.targetType !== "string" ||
    !VALID_REPORT_TARGET_TYPES.has(value.targetType as CommunityReportTargetType)
  ) {
    return fail(
      "invalid-report-target-type",
      "report.targetType must be one of post/comment.",
      `${path}.targetType`
    );
  }

  const targetIdValidation = validateBoundedString(value.targetId, `${path}.targetId`, {
    code: "invalid-report-target-id",
    message: "report.targetId must be a non-empty string.",
    maxLength: MAX_ID_LENGTH,
  });
  if (!targetIdValidation.ok) return targetIdValidation;

  if (
    typeof value.reason !== "string" ||
    !VALID_REPORT_REASONS.has(value.reason as CommunityReportReason)
  ) {
    return fail(
      "invalid-report-reason",
      "report.reason must be one of spam/abuse/copyright/other.",
      `${path}.reason`
    );
  }

  const detailValidation = validateOptionalBoundedString(value.detail, `${path}.detail`, {
    code: "invalid-report-detail",
    message: "report.detail must be a string when provided.",
    maxLength: MAX_DETAIL_LENGTH,
  });
  if (!detailValidation.ok) return detailValidation;

  const reporterValidation = validateBoundedString(value.reporterId, `${path}.reporterId`, {
    code: "invalid-report-reporter-id",
    message: "report.reporterId must be a non-empty string.",
    maxLength: MAX_AUTHOR_ID_LENGTH,
  });
  if (!reporterValidation.ok) return reporterValidation;

  if (
    typeof value.status !== "string" ||
    !VALID_REPORT_STATUSES.has(value.status as CommunityReportStatus)
  ) {
    return fail(
      "invalid-report-status",
      "report.status must be one of pending/approved/rejected.",
      `${path}.status`
    );
  }

  const createdAtValidation = validateTimestamp(
    value.createdAt,
    `${path}.createdAt`,
    "invalid-report-created-at",
    "report.createdAt must be a non-negative number."
  );
  if (!createdAtValidation.ok) return createdAtValidation;

  const moderatedAtValidation = validateNullableTimestamp(
    value.moderatedAt,
    `${path}.moderatedAt`
  );
  if (!moderatedAtValidation.ok) return moderatedAtValidation;

  const moderatorIdValidation = validateNullableIdString(
    value.moderatorId,
    `${path}.moderatorId`,
    "invalid-report-moderator-id",
    "report.moderatorId must be a non-empty string or null."
  );
  if (!moderatorIdValidation.ok) return moderatorIdValidation;

  const moderationNoteValidation = validateNullableOptionalText(
    value.moderationNote,
    `${path}.moderationNote`,
    "invalid-report-moderation-note",
    "report.moderationNote must be a string or null."
  );
  if (!moderationNoteValidation.ok) return moderationNoteValidation;

  if (
    value.status === "pending" &&
    (moderatedAtValidation.value !== null ||
      moderatorIdValidation.value !== null ||
      moderationNoteValidation.value !== null)
  ) {
    return fail(
      "invalid-report-pending-moderation-fields",
      "pending report must not contain moderation fields.",
      path
    );
  }

  if (
    value.status !== "pending" &&
    (moderatedAtValidation.value === null || moderatorIdValidation.value === null)
  ) {
    return fail(
      "invalid-report-resolved-moderation-fields",
      "resolved report must contain moderatedAt and moderatorId.",
      path
    );
  }

  return ok({
    id: idValidation.value,
    targetType: value.targetType as CommunityReportTargetType,
    targetId: targetIdValidation.value,
    reason: value.reason as CommunityReportReason,
    detail: detailValidation.value,
    reporterId: reporterValidation.value,
    status: value.status as CommunityReportStatus,
    createdAt: createdAtValidation.value,
    moderatedAt: moderatedAtValidation.value,
    moderatorId: moderatorIdValidation.value,
    moderationNote: moderationNoteValidation.value,
  });
};

export const validateCommunityRightsClaim = (
  value: unknown,
  path = "root"
): CommunityValidationResult<CommunityRightsClaim> => {
  if (!isRecord(value)) {
    return fail("invalid-rights-claim", "rights claim must be an object.", path);
  }

  const idValidation = validateBoundedString(value.id, `${path}.id`, {
    code: "invalid-rights-claim-id",
    message: "rightsClaim.id must be a non-empty string.",
    maxLength: MAX_ID_LENGTH,
  });
  if (!idValidation.ok) return idValidation;

  if (
    typeof value.targetType !== "string" ||
    !VALID_REPORT_TARGET_TYPES.has(value.targetType as CommunityReportTargetType)
  ) {
    return fail(
      "invalid-rights-claim-target-type",
      "rightsClaim.targetType must be one of post/comment.",
      `${path}.targetType`
    );
  }

  const targetIdValidation = validateBoundedString(value.targetId, `${path}.targetId`, {
    code: "invalid-rights-claim-target-id",
    message: "rightsClaim.targetId must be a non-empty string.",
    maxLength: MAX_ID_LENGTH,
  });
  if (!targetIdValidation.ok) return targetIdValidation;

  if (
    typeof value.claimType !== "string" ||
    !VALID_RIGHTS_CLAIM_TYPES.has(value.claimType as CommunityRightsClaimType)
  ) {
    return fail(
      "invalid-rights-claim-type",
      "rightsClaim.claimType must be one of copyright/trademark/impersonation/other.",
      `${path}.claimType`
    );
  }

  const detailValidation = validateOptionalBoundedString(value.detail, `${path}.detail`, {
    code: "invalid-rights-claim-detail",
    message: "rightsClaim.detail must be a string when provided.",
    maxLength: MAX_DETAIL_LENGTH,
  });
  if (!detailValidation.ok) return detailValidation;

  const evidenceValidation = validateOptionalUrlString(
    value.evidenceUrl,
    `${path}.evidenceUrl`
  );
  if (!evidenceValidation.ok) return evidenceValidation;

  const claimantValidation = validateBoundedString(value.claimantId, `${path}.claimantId`, {
    code: "invalid-rights-claim-claimant-id",
    message: "rightsClaim.claimantId must be a non-empty string.",
    maxLength: MAX_AUTHOR_ID_LENGTH,
  });
  if (!claimantValidation.ok) return claimantValidation;

  if (
    typeof value.status !== "string" ||
    !VALID_RIGHTS_CLAIM_STATUSES.has(value.status as CommunityRightsClaimStatus)
  ) {
    return fail(
      "invalid-rights-claim-status",
      "rightsClaim.status must be one of pending/approved/rejected.",
      `${path}.status`
    );
  }

  const createdAtValidation = validateTimestamp(
    value.createdAt,
    `${path}.createdAt`,
    "invalid-rights-claim-created-at",
    "rightsClaim.createdAt must be a non-negative number."
  );
  if (!createdAtValidation.ok) return createdAtValidation;

  const reviewedAtValidation = validateNullableTimestamp(
    value.reviewedAt,
    `${path}.reviewedAt`
  );
  if (!reviewedAtValidation.ok) return reviewedAtValidation;

  const reviewerValidation = validateNullableIdString(
    value.reviewerId,
    `${path}.reviewerId`,
    "invalid-rights-claim-reviewer-id",
    "rightsClaim.reviewerId must be a non-empty string or null."
  );
  if (!reviewerValidation.ok) return reviewerValidation;

  const reviewNoteValidation = validateNullableOptionalText(
    value.reviewNote,
    `${path}.reviewNote`,
    "invalid-rights-claim-review-note",
    "rightsClaim.reviewNote must be a string or null."
  );
  if (!reviewNoteValidation.ok) return reviewNoteValidation;

  if (
    value.status === "pending" &&
    (reviewedAtValidation.value !== null ||
      reviewerValidation.value !== null ||
      reviewNoteValidation.value !== null)
  ) {
    return fail(
      "invalid-rights-claim-pending-review-fields",
      "pending rights claim must not contain review fields.",
      path
    );
  }

  if (
    value.status !== "pending" &&
    (reviewedAtValidation.value === null || reviewerValidation.value === null)
  ) {
    return fail(
      "invalid-rights-claim-resolved-review-fields",
      "resolved rights claim must contain reviewedAt and reviewerId.",
      path
    );
  }

  return ok({
    id: idValidation.value,
    targetType: value.targetType as CommunityReportTargetType,
    targetId: targetIdValidation.value,
    claimType: value.claimType as CommunityRightsClaimType,
    detail: detailValidation.value,
    evidenceUrl: evidenceValidation.value,
    claimantId: claimantValidation.value,
    status: value.status as CommunityRightsClaimStatus,
    createdAt: createdAtValidation.value,
    reviewedAt: reviewedAtValidation.value,
    reviewerId: reviewerValidation.value,
    reviewNote: reviewNoteValidation.value,
  });
};

export const validateCommunityTakedownRecord = (
  value: unknown,
  path = "root"
): CommunityValidationResult<CommunityTakedownRecord> => {
  if (!isRecord(value)) {
    return fail("invalid-takedown-record", "takedown record must be an object.", path);
  }

  const idValidation = validateBoundedString(value.id, `${path}.id`, {
    code: "invalid-takedown-record-id",
    message: "takedownRecord.id must be a non-empty string.",
    maxLength: MAX_ID_LENGTH,
  });
  if (!idValidation.ok) return idValidation;

  const claimIdValidation = validateBoundedString(value.claimId, `${path}.claimId`, {
    code: "invalid-takedown-record-claim-id",
    message: "takedownRecord.claimId must be a non-empty string.",
    maxLength: MAX_ID_LENGTH,
  });
  if (!claimIdValidation.ok) return claimIdValidation;

  if (
    typeof value.targetType !== "string" ||
    !VALID_REPORT_TARGET_TYPES.has(value.targetType as CommunityReportTargetType)
  ) {
    return fail(
      "invalid-takedown-record-target-type",
      "takedownRecord.targetType must be one of post/comment.",
      `${path}.targetType`
    );
  }

  const targetIdValidation = validateBoundedString(value.targetId, `${path}.targetId`, {
    code: "invalid-takedown-record-target-id",
    message: "takedownRecord.targetId must be a non-empty string.",
    maxLength: MAX_ID_LENGTH,
  });
  if (!targetIdValidation.ok) return targetIdValidation;

  if (value.reason !== "rights-claim-approved") {
    return fail(
      "invalid-takedown-record-reason",
      "takedownRecord.reason must be rights-claim-approved.",
      `${path}.reason`
    );
  }

  const createdAtValidation = validateTimestamp(
    value.createdAt,
    `${path}.createdAt`,
    "invalid-takedown-record-created-at",
    "takedownRecord.createdAt must be a non-negative number."
  );
  if (!createdAtValidation.ok) return createdAtValidation;

  const reviewerValidation = validateBoundedString(value.reviewerId, `${path}.reviewerId`, {
    code: "invalid-takedown-record-reviewer-id",
    message: "takedownRecord.reviewerId must be a non-empty string.",
    maxLength: MAX_AUTHOR_ID_LENGTH,
  });
  if (!reviewerValidation.ok) return reviewerValidation;

  return ok({
    id: idValidation.value,
    claimId: claimIdValidation.value,
    targetType: value.targetType as CommunityReportTargetType,
    targetId: targetIdValidation.value,
    reason: "rights-claim-approved",
    createdAt: createdAtValidation.value,
    reviewerId: reviewerValidation.value,
  });
};

export const validateCommunityTrafficSignal = (
  value: unknown,
  path = "root"
): CommunityValidationResult<CommunityTrafficSignal> => {
  if (!isRecord(value)) {
    return fail("invalid-traffic-signal", "traffic signal must be an object.", path);
  }

  const idValidation = validateBoundedString(value.id, `${path}.id`, {
    code: "invalid-traffic-signal-id",
    message: "trafficSignal.id must be a non-empty string.",
    maxLength: MAX_ID_LENGTH,
  });
  if (!idValidation.ok) return idValidation;

  if (
    typeof value.action !== "string" ||
    !VALID_TRAFFIC_ACTIONS.has(value.action as CommunityTrafficAction)
  ) {
    return fail(
      "invalid-traffic-signal-action",
      "trafficSignal.action is invalid.",
      `${path}.action`
    );
  }

  const actorValidation = validateNullableIdString(
    value.actorId,
    `${path}.actorId`,
    "invalid-traffic-signal-actor-id",
    "trafficSignal.actorId must be a non-empty string or null."
  );
  if (!actorValidation.ok) return actorValidation;

  const fingerprintValidation = validateBoundedString(
    value.fingerprint,
    `${path}.fingerprint`,
    {
      code: "invalid-traffic-signal-fingerprint",
      message: "trafficSignal.fingerprint must be a non-empty string.",
      maxLength: MAX_ID_LENGTH,
    }
  );
  if (!fingerprintValidation.ok) return fingerprintValidation;

  if (
    typeof value.riskLevel !== "string" ||
    !VALID_TRAFFIC_RISK_LEVELS.has(value.riskLevel as CommunityTrafficRiskLevel)
  ) {
    return fail(
      "invalid-traffic-signal-risk-level",
      "trafficSignal.riskLevel must be elevated/blocked.",
      `${path}.riskLevel`
    );
  }

  const reasonValidation = validateBoundedString(value.reason, `${path}.reason`, {
    code: "invalid-traffic-signal-reason",
    message: "trafficSignal.reason must be a non-empty string.",
    maxLength: MAX_DETAIL_LENGTH,
  });
  if (!reasonValidation.ok) return reasonValidation;

  const observedAtValidation = validateTimestamp(
    value.observedAt,
    `${path}.observedAt`,
    "invalid-traffic-signal-observed-at",
    "trafficSignal.observedAt must be a non-negative number."
  );
  if (!observedAtValidation.ok) return observedAtValidation;

  const sampleCountValidation = validateTimestamp(
    value.sampleCount,
    `${path}.sampleCount`,
    "invalid-traffic-signal-sample-count",
    "trafficSignal.sampleCount must be a non-negative number."
  );
  if (!sampleCountValidation.ok) return sampleCountValidation;

  return ok({
    id: idValidation.value,
    action: value.action as CommunityTrafficAction,
    actorId: actorValidation.value,
    fingerprint: fingerprintValidation.value,
    riskLevel: value.riskLevel as CommunityTrafficRiskLevel,
    reason: reasonValidation.value,
    observedAt: observedAtValidation.value,
    sampleCount: sampleCountValidation.value,
  });
};

export const validateCommunitySafetyEvent = (
  value: unknown,
  path = "root"
): CommunityValidationResult<CommunitySafetyEvent> => {
  if (!isRecord(value)) {
    return fail("invalid-safety-event", "safety event must be an object.", path);
  }

  const idValidation = validateBoundedString(value.id, `${path}.id`, {
    code: "invalid-safety-event-id",
    message: "safetyEvent.id must be a non-empty string.",
    maxLength: MAX_ID_LENGTH,
  });
  if (!idValidation.ok) return idValidation;

  if (
    typeof value.action !== "string" ||
    !VALID_SAFETY_ACTIONS.has(value.action as CommunitySafetyAction)
  ) {
    return fail(
      "invalid-safety-event-action",
      "safetyEvent.action must be create-post/create-comment.",
      `${path}.action`
    );
  }

  const actorValidation = validateBoundedString(value.actorId, `${path}.actorId`, {
    code: "invalid-safety-event-actor-id",
    message: "safetyEvent.actorId must be a non-empty string.",
    maxLength: MAX_AUTHOR_ID_LENGTH,
  });
  if (!actorValidation.ok) return actorValidation;

  if (
    typeof value.verdict !== "string" ||
    !VALID_SAFETY_VERDICTS.has(value.verdict as CommunitySafetyVerdict)
  ) {
    return fail(
      "invalid-safety-event-verdict",
      "safetyEvent.verdict must be allow/review/block.",
      `${path}.verdict`
    );
  }

  if (value.category !== null && value.category !== undefined) {
    if (
      typeof value.category !== "string" ||
      !VALID_SAFETY_CATEGORIES.has(value.category as CommunitySafetyCategory)
    ) {
      return fail(
        "invalid-safety-event-category",
        "safetyEvent.category must be null or known category.",
        `${path}.category`
      );
    }
  }

  const matchedTermValidation = validateNullableOptionalText(
    value.matchedTerm ?? null,
    `${path}.matchedTerm`,
    "invalid-safety-event-matched-term",
    "safetyEvent.matchedTerm must be string or null."
  );
  if (!matchedTermValidation.ok) return matchedTermValidation;

  const targetIdValidation = validateNullableIdString(
    value.targetId,
    `${path}.targetId`,
    "invalid-safety-event-target-id",
    "safetyEvent.targetId must be string or null."
  );
  if (!targetIdValidation.ok) return targetIdValidation;

  const observedAtValidation = validateTimestamp(
    value.observedAt,
    `${path}.observedAt`,
    "invalid-safety-event-observed-at",
    "safetyEvent.observedAt must be non-negative number."
  );
  if (!observedAtValidation.ok) return observedAtValidation;

  return ok({
    id: idValidation.value,
    action: value.action as CommunitySafetyAction,
    actorId: actorValidation.value,
    verdict: value.verdict as CommunitySafetyVerdict,
    category:
      value.category === null || value.category === undefined
        ? null
        : (value.category as CommunitySafetyCategory),
    matchedTerm: matchedTermValidation.value,
    targetId: targetIdValidation.value,
    observedAt: observedAtValidation.value,
  });
};

const validateArray = <T>(
  value: unknown,
  path: string,
  code: string,
  itemValidator: (entry: unknown, itemPath: string) => CommunityValidationResult<T>
): CommunityValidationResult<T[]> => {
  if (!Array.isArray(value)) {
    return fail(code, `${path} must be an array.`, path);
  }

  const next: T[] = [];
  for (let index = 0; index < value.length; index += 1) {
    const validated = itemValidator(value[index], `${path}[${index}]`);
    if (!validated.ok) return validated;
    next.push(validated.value);
  }

  return ok(next);
};

export const validateCommunitySnapshot = (
  value: unknown
): CommunityValidationResult<CommunitySnapshot> => {
  if (!isRecord(value)) {
    return fail("invalid-community-snapshot-root", "snapshot must be an object.", "root");
  }

  const postsValidation = validateArray(
    value.posts,
    "posts",
    "invalid-community-snapshot-posts",
    validateCommunityPost
  );
  if (!postsValidation.ok) return postsValidation;

  const commentsValidation = validateArray(
    value.comments,
    "comments",
    "invalid-community-snapshot-comments",
    validateCommunityComment
  );
  if (!commentsValidation.ok) return commentsValidation;

  const reportsValidation = validateArray(
    value.reports,
    "reports",
    "invalid-community-snapshot-reports",
    validateCommunityReport
  );
  if (!reportsValidation.ok) return reportsValidation;

  const rightsClaimsValidation = validateArray(
    value.rightsClaims,
    "rightsClaims",
    "invalid-community-snapshot-rights-claims",
    validateCommunityRightsClaim
  );
  if (!rightsClaimsValidation.ok) return rightsClaimsValidation;

  const takedownRecordsValidation = validateArray(
    value.takedownRecords,
    "takedownRecords",
    "invalid-community-snapshot-takedown-records",
    validateCommunityTakedownRecord
  );
  if (!takedownRecordsValidation.ok) return takedownRecordsValidation;

  const trafficSignalsValidation = validateArray(
    value.trafficSignals,
    "trafficSignals",
    "invalid-community-snapshot-traffic-signals",
    validateCommunityTrafficSignal
  );
  if (!trafficSignalsValidation.ok) return trafficSignalsValidation;

  const safetyEventsValidation = validateArray(
    value.safetyEvents,
    "safetyEvents",
    "invalid-community-snapshot-safety-events",
    validateCommunitySafetyEvent
  );
  if (!safetyEventsValidation.ok) return safetyEventsValidation;

  const serverTimeValidation = validateTimestamp(
    value.serverTime,
    "serverTime",
    "invalid-community-snapshot-server-time",
    "serverTime must be a non-negative number."
  );
  if (!serverTimeValidation.ok) return serverTimeValidation;

  return ok({
    posts: postsValidation.value,
    comments: commentsValidation.value,
    reports: reportsValidation.value,
    rightsClaims: rightsClaimsValidation.value,
    takedownRecords: takedownRecordsValidation.value,
    trafficSignals: trafficSignalsValidation.value,
    safetyEvents: safetyEventsValidation.value,
    serverTime: serverTimeValidation.value,
  });
};

export const validateCommunityApiRequest = (
  value: unknown
): CommunityValidationResult<CommunityApiRequest> => {
  if (!isRecord(value)) {
    return fail("invalid-community-request-root", "request must be an object.", "root");
  }

  if (
    typeof value.action !== "string" ||
    !VALID_API_ACTIONS.has(value.action as CommunityApiAction)
  ) {
    return fail(
      "invalid-community-request-action",
      "action must be one of list/create-post/create-comment/create-report/moderate-report/create-rights-claim/review-rights-claim/trust-safety-slo.",
      "action"
    );
  }

  if (value.action === "list" || value.action === "trust-safety-slo") {
    return ok({
      action: value.action,
      payload: undefined,
    });
  }

  if (value.payload === undefined) {
    return fail(
      "missing-community-request-payload",
      "payload is required for this action.",
      "payload"
    );
  }

  return ok({
    action: value.action as CommunityApiAction,
    payload: value.payload,
  });
};

export const validateCommunityTrustSafetySloSummary = (
  value: unknown
): CommunityValidationResult<CommunityTrustSafetySloSummary> => {
  if (!isRecord(value)) {
    return fail("invalid-trust-safety-slo-root", "summary must be an object.", "root");
  }

  const generatedAtValidation = validateTimestamp(
    value.generatedAt,
    "generatedAt",
    "invalid-trust-safety-slo-generated-at",
    "generatedAt must be a non-negative number."
  );
  if (!generatedAtValidation.ok) return generatedAtValidation;

  const pendingReportsValidation = validateTimestamp(
    value.pendingReports,
    "pendingReports",
    "invalid-trust-safety-slo-pending-reports",
    "pendingReports must be a non-negative number."
  );
  if (!pendingReportsValidation.ok) return pendingReportsValidation;

  const pendingClaimsValidation = validateTimestamp(
    value.pendingRightsClaims,
    "pendingRightsClaims",
    "invalid-trust-safety-slo-pending-rights-claims",
    "pendingRightsClaims must be a non-negative number."
  );
  if (!pendingClaimsValidation.ok) return pendingClaimsValidation;

  const elevatedValidation = validateTimestamp(
    value.elevatedTrafficSignals24h,
    "elevatedTrafficSignals24h",
    "invalid-trust-safety-slo-elevated-signals",
    "elevatedTrafficSignals24h must be a non-negative number."
  );
  if (!elevatedValidation.ok) return elevatedValidation;

  const blockedValidation = validateTimestamp(
    value.blockedTrafficSignals24h,
    "blockedTrafficSignals24h",
    "invalid-trust-safety-slo-blocked-signals",
    "blockedTrafficSignals24h must be a non-negative number."
  );
  if (!blockedValidation.ok) return blockedValidation;

  const validateNullableFinite = (
    candidate: unknown,
    path: string
  ): CommunityValidationResult<number | null> => {
    if (candidate === null) return ok(null);
    if (
      typeof candidate !== "number" ||
      !Number.isFinite(candidate) ||
      candidate < 0
    ) {
      return fail(
        `invalid-trust-safety-slo-${path}`,
        `${path} must be a non-negative number or null.`,
        path
      );
    }
    return ok(Math.floor(candidate));
  };

  const reportResolutionValidation = validateNullableFinite(
    value.avgReportResolutionMs,
    "avgReportResolutionMs"
  );
  if (!reportResolutionValidation.ok) return reportResolutionValidation;

  const rightsResolutionValidation = validateNullableFinite(
    value.avgRightsClaimResolutionMs,
    "avgRightsClaimResolutionMs"
  );
  if (!rightsResolutionValidation.ok) return rightsResolutionValidation;

  return ok({
    generatedAt: generatedAtValidation.value,
    pendingReports: pendingReportsValidation.value,
    pendingRightsClaims: pendingClaimsValidation.value,
    avgReportResolutionMs: reportResolutionValidation.value,
    avgRightsClaimResolutionMs: rightsResolutionValidation.value,
    elevatedTrafficSignals24h: elevatedValidation.value,
    blockedTrafficSignals24h: blockedValidation.value,
  });
};

export const isCommunitySnapshot = (value: unknown): value is CommunitySnapshot =>
  validateCommunitySnapshot(value).ok;
