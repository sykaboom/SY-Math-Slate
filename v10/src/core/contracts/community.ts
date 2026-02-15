export type CommunityReportTargetType = "post" | "comment";
export type CommunityReportReason = "spam" | "abuse" | "copyright" | "other";
export type CommunityReportStatus = "pending" | "approved" | "rejected";
export type CommunityModerationDecision = "approve" | "reject";

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

export type CommunitySnapshot = {
  posts: CommunityPost[];
  comments: CommunityComment[];
  reports: CommunityReport[];
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

export type CommunityApiAction =
  | "list"
  | "create-post"
  | "create-comment"
  | "create-report"
  | "moderate-report";

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
const VALID_REPORT_STATUSES = new Set<CommunityReportStatus>([
  "pending",
  "approved",
  "rejected",
]);
const VALID_MODERATION_DECISIONS = new Set<CommunityModerationDecision>([
  "approve",
  "reject",
]);
const VALID_API_ACTIONS = new Set<CommunityApiAction>([
  "list",
  "create-post",
  "create-comment",
  "create-report",
  "moderate-report",
]);

const MAX_ID_LENGTH = 120;
const MAX_AUTHOR_ID_LENGTH = 120;
const MAX_BODY_LENGTH = 4000;
const MAX_DETAIL_LENGTH = 800;
const MAX_NOTE_LENGTH = 800;

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
      "action must be one of list/create-post/create-comment/create-report/moderate-report.",
      "action"
    );
  }

  if (value.action === "list") {
    return ok({
      action: "list",
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

export const isCommunitySnapshot = (value: unknown): value is CommunitySnapshot =>
  validateCommunitySnapshot(value).ok;
