export type TTSScriptType = "TTSScript";
export type DraftTTSScriptVersion = "0.3.0-draft";

export type TTSSegment = {
  id: string;
  text: string;
  lang: string;
};

export type TTSScript = {
  type: TTSScriptType;
  version: DraftTTSScriptVersion;
  segments: TTSSegment[];
  voiceHints?: Record<string, unknown>;
  timingHints?: Record<string, unknown>;
};

export type TTSScriptValidationError = {
  ok: false;
  code: string;
  message: string;
  path: string;
};

export type TTSScriptValidationSuccess = {
  ok: true;
  value: TTSScript;
};

export type TTSScriptValidationResult =
  | TTSScriptValidationSuccess
  | TTSScriptValidationError;

const fail = (
  code: string,
  message: string,
  path: string
): TTSScriptValidationError => ({
  ok: false,
  code,
  message,
  path,
});

const ok = (value: TTSScript): TTSScriptValidationSuccess => ({
  ok: true,
  value,
});

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const validateSegment = (
  value: unknown,
  index: number
): TTSScriptValidationResult => {
  const path = `segments[${index}]`;
  if (!isRecord(value)) {
    return fail("invalid-segment", "segment must be an object.", path);
  }
  if (typeof value.id !== "string" || value.id.trim() === "") {
    return fail(
      "invalid-segment-id",
      "segment.id must be a non-empty string.",
      `${path}.id`
    );
  }
  if (typeof value.text !== "string") {
    return fail(
      "invalid-segment-text",
      "segment.text must be a string.",
      `${path}.text`
    );
  }
  if (typeof value.lang !== "string" || value.lang.trim() === "") {
    return fail(
      "invalid-segment-lang",
      "segment.lang must be a non-empty string.",
      `${path}.lang`
    );
  }
  return ok({
    type: "TTSScript",
    version: "0.3.0-draft",
    segments: [],
  });
};

export const validateTTSScript = (value: unknown): TTSScriptValidationResult => {
  if (!isRecord(value)) {
    return fail("invalid-root", "TTSScript must be an object.", "root");
  }
  if (value.type !== "TTSScript") {
    return fail("invalid-type", "type must be 'TTSScript'.", "type");
  }
  if (value.version !== "0.3.0-draft") {
    return fail(
      "invalid-version",
      "version must be '0.3.0-draft' for provisional slice-2.",
      "version"
    );
  }
  if (!Array.isArray(value.segments)) {
    return fail("invalid-segments", "segments must be an array.", "segments");
  }
  for (let index = 0; index < value.segments.length; index += 1) {
    const validated = validateSegment(value.segments[index], index);
    if (!validated.ok) return validated;
  }
  if (value.voiceHints !== undefined && !isRecord(value.voiceHints)) {
    return fail(
      "invalid-voice-hints",
      "voiceHints must be an object when provided.",
      "voiceHints"
    );
  }
  if (value.timingHints !== undefined && !isRecord(value.timingHints)) {
    return fail(
      "invalid-timing-hints",
      "timingHints must be an object when provided.",
      "timingHints"
    );
  }
  return ok(value as TTSScript);
};

export const isTTSScript = (value: unknown): value is TTSScript =>
  validateTTSScript(value).ok;
