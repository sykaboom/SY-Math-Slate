export type RenderPlanType = "RenderPlan";
export type DraftRenderPlanVersion = "0.3.0-draft";

export type RenderPlanStep = {
  stepIndex: number;
  blockIds: string[];
};

export type RenderPlanPage = {
  pageId: string;
  steps: RenderPlanStep[];
  columns?: number;
};

export type RenderPlan = {
  type: RenderPlanType;
  version: DraftRenderPlanVersion;
  pages: RenderPlanPage[];
  timeline?: unknown[] | Record<string, unknown>;
  hints?: Record<string, unknown>;
};

export type RenderPlanValidationError = {
  ok: false;
  code: string;
  message: string;
  path: string;
};

export type RenderPlanValidationSuccess = {
  ok: true;
  value: RenderPlan;
};

export type RenderPlanValidationResult =
  | RenderPlanValidationSuccess
  | RenderPlanValidationError;

const fail = (
  code: string,
  message: string,
  path: string
): RenderPlanValidationError => ({
  ok: false,
  code,
  message,
  path,
});

const ok = (value: RenderPlan): RenderPlanValidationSuccess => ({
  ok: true,
  value,
});

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((item) => typeof item === "string");

const isNonNegativeInteger = (value: unknown): value is number =>
  typeof value === "number" &&
  Number.isFinite(value) &&
  Number.isInteger(value) &&
  value >= 0;

const validateStep = (
  value: unknown,
  pageIndex: number,
  stepIndex: number
): RenderPlanValidationResult => {
  const path = `pages[${pageIndex}].steps[${stepIndex}]`;
  if (!isRecord(value)) {
    return fail("invalid-step", "step must be an object.", path);
  }
  if (!isNonNegativeInteger(value.stepIndex)) {
    return fail(
      "invalid-step-index",
      "stepIndex must be a non-negative integer.",
      `${path}.stepIndex`
    );
  }
  if (!isStringArray(value.blockIds)) {
    return fail(
      "invalid-step-block-ids",
      "blockIds must be an array of strings.",
      `${path}.blockIds`
    );
  }
  return ok({
    type: "RenderPlan",
    version: "0.3.0-draft",
    pages: [],
  });
};

const validatePage = (
  value: unknown,
  pageIndex: number
): RenderPlanValidationResult => {
  const path = `pages[${pageIndex}]`;
  if (!isRecord(value)) {
    return fail("invalid-page", "page must be an object.", path);
  }
  if (typeof value.pageId !== "string" || value.pageId.trim() === "") {
    return fail(
      "invalid-page-id",
      "pageId must be a non-empty string.",
      `${path}.pageId`
    );
  }
  if (!Array.isArray(value.steps)) {
    return fail("invalid-page-steps", "steps must be an array.", `${path}.steps`);
  }
  for (let stepIndex = 0; stepIndex < value.steps.length; stepIndex += 1) {
    const validated = validateStep(value.steps[stepIndex], pageIndex, stepIndex);
    if (!validated.ok) return validated;
  }
  if (
    value.columns !== undefined &&
    (!isNonNegativeInteger(value.columns) || value.columns < 1)
  ) {
    return fail(
      "invalid-page-columns",
      "columns must be a positive integer when provided.",
      `${path}.columns`
    );
  }
  return ok({
    type: "RenderPlan",
    version: "0.3.0-draft",
    pages: [],
  });
};

export const validateRenderPlan = (value: unknown): RenderPlanValidationResult => {
  if (!isRecord(value)) {
    return fail("invalid-root", "RenderPlan must be an object.", "root");
  }
  if (value.type !== "RenderPlan") {
    return fail("invalid-type", "type must be 'RenderPlan'.", "type");
  }
  if (value.version !== "0.3.0-draft") {
    return fail(
      "invalid-version",
      "version must be '0.3.0-draft' for provisional slice-2.",
      "version"
    );
  }
  if (!Array.isArray(value.pages)) {
    return fail("invalid-pages", "pages must be an array.", "pages");
  }
  for (let index = 0; index < value.pages.length; index += 1) {
    const validated = validatePage(value.pages[index], index);
    if (!validated.ok) return validated;
  }
  if (
    value.timeline !== undefined &&
    !Array.isArray(value.timeline) &&
    !isRecord(value.timeline)
  ) {
    return fail(
      "invalid-timeline",
      "timeline must be an array or object when provided.",
      "timeline"
    );
  }
  if (value.hints !== undefined && !isRecord(value.hints)) {
    return fail("invalid-hints", "hints must be an object when provided.", "hints");
  }
  return ok(value as RenderPlan);
};

export const isRenderPlan = (value: unknown): value is RenderPlan =>
  validateRenderPlan(value).ok;
