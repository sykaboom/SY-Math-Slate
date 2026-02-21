import type {
  StepBlockKind,
  StepSegment,
  StepSegmentType,
  TextSegmentStyle,
} from "@core/foundation/types/canvas";
import type { StepBlockDraft } from "@features/chrome/layout/dataInput/types";

export type StructuredContentValidationIssue = {
  code: string;
  path: string;
  message: string;
};

export type StructuredContentValidationSuccess = {
  ok: true;
  blocks: StepBlockDraft[];
  issues: StructuredContentValidationIssue[];
};

export type StructuredContentValidationFailure = {
  ok: false;
  blocks: null;
  issues: StructuredContentValidationIssue[];
};

export type StructuredContentValidationResult =
  | StructuredContentValidationSuccess
  | StructuredContentValidationFailure;

const VALID_BLOCK_KINDS = new Set<StepBlockKind>([
  "content",
  "line-break",
  "column-break",
  "page-break",
]);
const VALID_SEGMENT_TYPES = new Set<StepSegmentType>(["text", "image", "video"]);
const TEXT_STYLE_KEYS = ["fontFamily", "fontSize", "fontWeight", "color"] as const;
const TEXT_STYLE_KEY_SET = new Set<string>(TEXT_STYLE_KEYS);

type StyleKey = (typeof TEXT_STYLE_KEYS)[number];

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value);

const isPositiveFiniteNumber = (value: unknown): value is number =>
  isFiniteNumber(value) && value > 0;

const isNonNegativeInteger = (value: unknown): value is number =>
  isFiniteNumber(value) && Number.isInteger(value) && value >= 0;

const isStepSegmentType = (value: unknown): value is StepSegmentType =>
  typeof value === "string" &&
  VALID_SEGMENT_TYPES.has(value as StepSegmentType);

const isStepBlockKind = (value: unknown): value is StepBlockKind =>
  typeof value === "string" && VALID_BLOCK_KINDS.has(value as StepBlockKind);

const buildPath = (basePath: string, key: string | number) =>
  typeof key === "number" ? `${basePath}[${key}]` : `${basePath}.${key}`;

const createIssue = (
  code: string,
  path: string,
  message: string
): StructuredContentValidationIssue => ({
  code,
  path,
  message,
});

const isBreakBlockKind = (kind: StepBlockKind | undefined): boolean =>
  kind === "line-break" || kind === "column-break" || kind === "page-break";

const validateTextSegmentStyle = (
  value: unknown,
  path: string,
  issues: StructuredContentValidationIssue[]
): { valid: boolean; style?: TextSegmentStyle } => {
  if (value === undefined) {
    return { valid: true };
  }
  if (!isRecord(value)) {
    issues.push(
      createIssue(
        "invalid-segment-style",
        path,
        "text segment style must be an object when provided."
      )
    );
    return { valid: false };
  }

  let valid = true;
  const nextStyle: TextSegmentStyle = {};
  Object.entries(value).forEach(([key, styleValue]) => {
    const keyPath = buildPath(path, key);
    if (!TEXT_STYLE_KEY_SET.has(key)) {
      valid = false;
      issues.push(
        createIssue(
          "invalid-segment-style-key",
          keyPath,
          `unsupported text style key '${key}'.`
        )
      );
      return;
    }
    if (typeof styleValue !== "string") {
      valid = false;
      issues.push(
        createIssue(
          "invalid-segment-style-value",
          keyPath,
          "text style values must be strings."
        )
      );
      return;
    }
    nextStyle[key as StyleKey] = styleValue;
  });

  if (!valid) {
    return { valid: false };
  }
  if (Object.keys(nextStyle).length === 0) {
    return { valid: true };
  }
  return { valid: true, style: nextStyle };
};

const validateStepSegment = (
  value: unknown,
  path: string,
  issues: StructuredContentValidationIssue[],
  seenSegmentIds: Set<string>
): StepSegment | null => {
  if (!isRecord(value)) {
    issues.push(
      createIssue("invalid-segment", path, "segment must be an object.")
    );
    return null;
  }

  let hasError = false;
  let segmentId = "";
  if (!isNonEmptyString(value.id)) {
    hasError = true;
    issues.push(
      createIssue(
        "invalid-segment-id",
        buildPath(path, "id"),
        "segment id must be a non-empty string."
      )
    );
  } else {
    segmentId = value.id.trim();
    if (seenSegmentIds.has(segmentId)) {
      hasError = true;
      issues.push(
        createIssue(
          "duplicate-segment-id",
          buildPath(path, "id"),
          `duplicate segment id '${segmentId}' is not allowed.`
        )
      );
    } else {
      seenSegmentIds.add(segmentId);
    }
  }

  let segmentType: StepSegmentType | null = null;
  if (!isStepSegmentType(value.type)) {
    hasError = true;
    issues.push(
      createIssue(
        "invalid-segment-type",
        buildPath(path, "type"),
        "segment type must be one of text/image/video."
      )
    );
  } else {
    segmentType = value.type;
  }

  let orderIndex = 0;
  if (!isNonNegativeInteger(value.orderIndex)) {
    hasError = true;
    issues.push(
      createIssue(
        "invalid-segment-order-index",
        buildPath(path, "orderIndex"),
        "segment orderIndex must be a non-negative integer."
      )
    );
  } else {
    orderIndex = value.orderIndex;
  }

  if (segmentType === "text") {
    let html = "";
    if (typeof value.html !== "string") {
      hasError = true;
      issues.push(
        createIssue(
          "invalid-text-html",
          buildPath(path, "html"),
          "text segment html must be a string."
        )
      );
    } else {
      html = value.html;
    }

    const styleValidation = validateTextSegmentStyle(
      value.style,
      buildPath(path, "style"),
      issues
    );
    if (!styleValidation.valid) {
      hasError = true;
    }

    if (hasError) {
      return null;
    }
    return {
      id: segmentId,
      type: "text",
      html,
      ...(styleValidation.style ? { style: styleValidation.style } : {}),
      orderIndex,
    };
  }

  if (segmentType !== "image" && segmentType !== "video") {
    return null;
  }

  if (!isNonEmptyString(value.src)) {
    hasError = true;
    issues.push(
      createIssue(
        "invalid-media-src",
        buildPath(path, "src"),
        "media segment src must be a non-empty string."
      )
    );
  }

  const src = isNonEmptyString(value.src) ? value.src.trim() : "";

  if (segmentType === "image") {
    let width = 0;
    let height = 0;
    if (!isPositiveFiniteNumber(value.width)) {
      hasError = true;
      issues.push(
        createIssue(
          "invalid-image-width",
          buildPath(path, "width"),
          "image width must be a positive finite number."
        )
      );
    } else {
      width = value.width;
    }
    if (!isPositiveFiniteNumber(value.height)) {
      hasError = true;
      issues.push(
        createIssue(
          "invalid-image-height",
          buildPath(path, "height"),
          "image height must be a positive finite number."
        )
      );
    } else {
      height = value.height;
    }

    if (hasError) {
      return null;
    }
    return {
      id: segmentId,
      type: "image",
      src,
      width,
      height,
      orderIndex,
    };
  }

  if (segmentType === "video") {
    let width: number | undefined;
    let height: number | undefined;

    if (value.width !== undefined) {
      if (!isPositiveFiniteNumber(value.width)) {
        hasError = true;
        issues.push(
          createIssue(
            "invalid-video-width",
            buildPath(path, "width"),
            "video width must be a positive finite number when provided."
          )
        );
      } else {
        width = value.width;
      }
    }

    if (value.height !== undefined) {
      if (!isPositiveFiniteNumber(value.height)) {
        hasError = true;
        issues.push(
          createIssue(
            "invalid-video-height",
            buildPath(path, "height"),
            "video height must be a positive finite number when provided."
          )
        );
      } else {
        height = value.height;
      }
    }

    if (hasError) {
      return null;
    }
    return {
      id: segmentId,
      type: "video",
      src,
      ...(width !== undefined ? { width } : {}),
      ...(height !== undefined ? { height } : {}),
      orderIndex,
    };
  }

  issues.push(
    createIssue(
      "invalid-segment-type",
      buildPath(path, "type"),
      "segment type must be one of text/image/video."
    )
  );
  return null;
};

const validateStepBlock = (
  value: unknown,
  path: string,
  issues: StructuredContentValidationIssue[],
  seenBlockIds: Set<string>,
  seenSegmentIds: Set<string>
): StepBlockDraft | null => {
  if (!isRecord(value)) {
    issues.push(createIssue("invalid-block", path, "block must be an object."));
    return null;
  }

  let hasError = false;
  let blockId = "";
  if (!isNonEmptyString(value.id)) {
    hasError = true;
    issues.push(
      createIssue(
        "invalid-block-id",
        buildPath(path, "id"),
        "block id must be a non-empty string."
      )
    );
  } else {
    blockId = value.id.trim();
    if (seenBlockIds.has(blockId)) {
      hasError = true;
      issues.push(
        createIssue(
          "duplicate-block-id",
          buildPath(path, "id"),
          `duplicate block id '${blockId}' is not allowed.`
        )
      );
    } else {
      seenBlockIds.add(blockId);
    }
  }

  let blockKind: StepBlockKind | undefined;
  if (value.kind !== undefined) {
    if (!isStepBlockKind(value.kind)) {
      hasError = true;
      issues.push(
        createIssue(
          "invalid-block-kind",
          buildPath(path, "kind"),
          "block kind must be one of content/line-break/column-break/page-break."
        )
      );
    } else {
      blockKind = value.kind;
    }
  }

  if (!Array.isArray(value.segments)) {
    hasError = true;
    issues.push(
      createIssue(
        "invalid-block-segments",
        buildPath(path, "segments"),
        "block segments must be an array."
      )
    );
    return null;
  }

  const segments: StepSegment[] = [];
  value.segments.forEach((segmentValue, segmentIndex) => {
    const validatedSegment = validateStepSegment(
      segmentValue,
      buildPath(buildPath(path, "segments"), segmentIndex),
      issues,
      seenSegmentIds
    );
    if (!validatedSegment) {
      hasError = true;
      return;
    }
    segments.push(validatedSegment);
  });

  if (isBreakBlockKind(blockKind) && value.segments.length > 0) {
    hasError = true;
    issues.push(
      createIssue(
        "invalid-break-block-segments",
        buildPath(path, "segments"),
        "break blocks must provide an empty segments array."
      )
    );
  }

  if (hasError) {
    return null;
  }

  if (isBreakBlockKind(blockKind)) {
    return {
      id: blockId,
      kind: blockKind,
      segments: [],
    };
  }

  if (blockKind !== undefined) {
    return {
      id: blockId,
      kind: blockKind,
      segments,
    };
  }

  return {
    id: blockId,
    segments,
  };
};

const failValidation = (
  issues: StructuredContentValidationIssue[]
): StructuredContentValidationFailure => ({
  ok: false,
  blocks: null,
  issues,
});

const okValidation = (
  blocks: StepBlockDraft[]
): StructuredContentValidationSuccess => ({
  ok: true,
  blocks,
  issues: [],
});

export const validateStructuredContentSchema = (
  value: unknown,
  rootPath = "blocks"
): StructuredContentValidationResult => {
  const issues: StructuredContentValidationIssue[] = [];
  if (!Array.isArray(value)) {
    issues.push(
      createIssue(
        "invalid-root",
        rootPath,
        "structured content root must be an array of blocks."
      )
    );
    return failValidation(issues);
  }

  const seenBlockIds = new Set<string>();
  const seenSegmentIds = new Set<string>();
  const blocks: StepBlockDraft[] = [];

  value.forEach((blockValue, blockIndex) => {
    const validatedBlock = validateStepBlock(
      blockValue,
      buildPath(rootPath, blockIndex),
      issues,
      seenBlockIds,
      seenSegmentIds
    );
    if (validatedBlock) {
      blocks.push(validatedBlock);
    }
  });

  if (issues.length > 0) {
    return failValidation(issues);
  }
  return okValidation(blocks);
};

export const parseStructuredContentSchemaJson = (
  jsonText: string,
  rootPath = "blocks"
): StructuredContentValidationResult => {
  try {
    const parsed = JSON.parse(jsonText) as unknown;
    return validateStructuredContentSchema(parsed, rootPath);
  } catch (error) {
    const message =
      error instanceof Error && error.message.trim().length > 0
        ? error.message
        : "invalid JSON input.";
    return failValidation([
      createIssue("invalid-json", "json", message),
    ]);
  }
};

export const isStepBlockDraftArray = (
  value: unknown
): value is StepBlockDraft[] => validateStructuredContentSchema(value).ok;
