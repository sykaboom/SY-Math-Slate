export const SESSION_SYNC_PROTOCOL = "sy-math-slate:session-sync.v2";

export type SessionSyncRole = "host" | "student";

export type SessionSyncPoint = {
  x: number;
  y: number;
};

export type SessionSyncViewport = {
  zoomLevel: number;
  panOffset: SessionSyncPoint;
};

export type SessionSyncStatePayload = {
  globalStep: number;
  sharedViewport: SessionSyncViewport;
  laserPosition: SessionSyncPoint | null;
};

export type SessionSyncStateRequestEnvelope = {
  protocol: typeof SESSION_SYNC_PROTOCOL;
  kind: "state-request";
  sourceId: string;
  fromRole: SessionSyncRole;
  sentAt: number;
};

export type SessionSyncStateUpdateEnvelope = {
  protocol: typeof SESSION_SYNC_PROTOCOL;
  kind: "state-update";
  sourceId: string;
  fromRole: SessionSyncRole;
  seq: number;
  sentAt: number;
  payload: SessionSyncStatePayload;
};

export type SessionSyncEnvelope =
  | SessionSyncStateRequestEnvelope
  | SessionSyncStateUpdateEnvelope;

export type SessionSyncEnvelopeValidationErrorCode =
  | "invalid-envelope-root"
  | "invalid-envelope-protocol"
  | "invalid-envelope-kind"
  | "invalid-envelope-source-id"
  | "invalid-envelope-role"
  | "invalid-envelope-sent-at"
  | "invalid-envelope-seq"
  | "invalid-envelope-payload"
  | "invalid-envelope-global-step"
  | "invalid-envelope-shared-viewport"
  | "invalid-envelope-zoom-level"
  | "invalid-envelope-pan-offset"
  | "invalid-envelope-pan-x"
  | "invalid-envelope-pan-y"
  | "invalid-envelope-laser-position"
  | "invalid-envelope-laser-x"
  | "invalid-envelope-laser-y";

export type SessionSyncEnvelopeValidationError = {
  ok: false;
  code: SessionSyncEnvelopeValidationErrorCode;
  message: string;
  path: string;
};

export type SessionSyncEnvelopeValidationSuccess = {
  ok: true;
  value: SessionSyncEnvelope;
};

export type SessionSyncEnvelopeValidationResult =
  | SessionSyncEnvelopeValidationSuccess
  | SessionSyncEnvelopeValidationError;

type CreateStateRequestEnvelopeInput = {
  sourceId: string;
  fromRole: SessionSyncRole;
  sentAt?: number;
};

type CreateStateUpdateEnvelopeInput = {
  sourceId: string;
  fromRole: SessionSyncRole;
  seq: number;
  sentAt?: number;
  payload: SessionSyncStatePayload;
};

type PayloadValidationResult =
  | {
      ok: true;
      value: SessionSyncStatePayload;
    }
  | SessionSyncEnvelopeValidationError;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value);

const normalizeNonEmptyString = (value: unknown): string =>
  typeof value === "string" ? value.trim() : "";

const normalizeTimestamp = (value: unknown, fallback = Date.now()): number => {
  if (!isFiniteNumber(value)) return Math.floor(fallback);
  return Math.floor(value);
};

const normalizeEnvelopeSeq = (value: unknown): number => {
  if (!isFiniteNumber(value)) return 1;
  return Math.max(1, Math.floor(value));
};

const normalizeGlobalStep = (value: unknown): number => {
  if (!isFiniteNumber(value)) return 0;
  return Math.max(0, Math.floor(value));
};

const normalizeCoordinate = (value: unknown, fallback: number): number =>
  isFiniteNumber(value) ? value : fallback;

const normalizeRole = (value: unknown): SessionSyncRole | null => {
  if (value === "host" || value === "student") {
    return value;
  }
  return null;
};

const fail = (
  code: SessionSyncEnvelopeValidationErrorCode,
  message: string,
  path: string
): SessionSyncEnvelopeValidationError => ({
  ok: false,
  code,
  message,
  path,
});

const ok = (
  value: SessionSyncEnvelope
): SessionSyncEnvelopeValidationSuccess => ({
  ok: true,
  value,
});

const clonePayload = (payload: SessionSyncStatePayload): SessionSyncStatePayload => ({
  globalStep: normalizeGlobalStep(payload.globalStep),
  sharedViewport: {
    zoomLevel: normalizeCoordinate(payload.sharedViewport.zoomLevel, 1),
    panOffset: {
      x: normalizeCoordinate(payload.sharedViewport.panOffset.x, 0),
      y: normalizeCoordinate(payload.sharedViewport.panOffset.y, 0),
    },
  },
  laserPosition: payload.laserPosition
    ? {
        x: normalizeCoordinate(payload.laserPosition.x, 0),
        y: normalizeCoordinate(payload.laserPosition.y, 0),
      }
    : null,
});

const validateStatePayload = (value: unknown): PayloadValidationResult => {
  if (!isRecord(value)) {
    return fail(
      "invalid-envelope-payload",
      "payload must be an object.",
      "payload"
    );
  }

  if (!isFiniteNumber(value.globalStep)) {
    return fail(
      "invalid-envelope-global-step",
      "payload.globalStep must be a finite number.",
      "payload.globalStep"
    );
  }

  if (!isRecord(value.sharedViewport)) {
    return fail(
      "invalid-envelope-shared-viewport",
      "payload.sharedViewport must be an object.",
      "payload.sharedViewport"
    );
  }
  const sharedViewport = value.sharedViewport;

  if (!isFiniteNumber(sharedViewport.zoomLevel)) {
    return fail(
      "invalid-envelope-zoom-level",
      "payload.sharedViewport.zoomLevel must be a finite number.",
      "payload.sharedViewport.zoomLevel"
    );
  }

  if (!isRecord(sharedViewport.panOffset)) {
    return fail(
      "invalid-envelope-pan-offset",
      "payload.sharedViewport.panOffset must be an object.",
      "payload.sharedViewport.panOffset"
    );
  }
  const panOffset = sharedViewport.panOffset;

  if (!isFiniteNumber(panOffset.x)) {
    return fail(
      "invalid-envelope-pan-x",
      "payload.sharedViewport.panOffset.x must be a finite number.",
      "payload.sharedViewport.panOffset.x"
    );
  }

  if (!isFiniteNumber(panOffset.y)) {
    return fail(
      "invalid-envelope-pan-y",
      "payload.sharedViewport.panOffset.y must be a finite number.",
      "payload.sharedViewport.panOffset.y"
    );
  }

  const rawLaserPosition = value.laserPosition;
  if (rawLaserPosition !== null && rawLaserPosition !== undefined) {
    if (!isRecord(rawLaserPosition)) {
      return fail(
        "invalid-envelope-laser-position",
        "payload.laserPosition must be null or an object.",
        "payload.laserPosition"
      );
    }
    if (!isFiniteNumber(rawLaserPosition.x)) {
      return fail(
        "invalid-envelope-laser-x",
        "payload.laserPosition.x must be a finite number.",
        "payload.laserPosition.x"
      );
    }
    if (!isFiniteNumber(rawLaserPosition.y)) {
      return fail(
        "invalid-envelope-laser-y",
        "payload.laserPosition.y must be a finite number.",
        "payload.laserPosition.y"
      );
    }
  }

  return {
    ok: true,
    value: {
      globalStep: normalizeGlobalStep(value.globalStep),
      sharedViewport: {
        zoomLevel: normalizeCoordinate(sharedViewport.zoomLevel, 1),
        panOffset: {
          x: normalizeCoordinate(panOffset.x, 0),
          y: normalizeCoordinate(panOffset.y, 0),
        },
      },
      laserPosition:
        rawLaserPosition && isRecord(rawLaserPosition)
          ? {
              x: normalizeCoordinate(rawLaserPosition.x, 0),
              y: normalizeCoordinate(rawLaserPosition.y, 0),
            }
          : null,
    },
  };
};

export const createStateRequestEnvelope = (
  input: CreateStateRequestEnvelopeInput
): SessionSyncStateRequestEnvelope => ({
  protocol: SESSION_SYNC_PROTOCOL,
  kind: "state-request",
  sourceId: normalizeNonEmptyString(input.sourceId),
  fromRole: input.fromRole,
  sentAt: normalizeTimestamp(input.sentAt),
});

export const createStateUpdateEnvelope = (
  input: CreateStateUpdateEnvelopeInput
): SessionSyncStateUpdateEnvelope => ({
  protocol: SESSION_SYNC_PROTOCOL,
  kind: "state-update",
  sourceId: normalizeNonEmptyString(input.sourceId),
  fromRole: input.fromRole,
  seq: normalizeEnvelopeSeq(input.seq),
  sentAt: normalizeTimestamp(input.sentAt),
  payload: clonePayload(input.payload),
});

export const validateSessionSyncEnvelope = (
  value: unknown
): SessionSyncEnvelopeValidationResult => {
  if (!isRecord(value)) {
    return fail(
      "invalid-envelope-root",
      "session sync envelope must be an object.",
      "root"
    );
  }
  if (value.protocol !== SESSION_SYNC_PROTOCOL) {
    return fail(
      "invalid-envelope-protocol",
      `protocol must equal '${SESSION_SYNC_PROTOCOL}'.`,
      "protocol"
    );
  }

  if (value.kind !== "state-request" && value.kind !== "state-update") {
    return fail(
      "invalid-envelope-kind",
      "kind must be 'state-request' or 'state-update'.",
      "kind"
    );
  }

  const sourceId = normalizeNonEmptyString(value.sourceId);
  if (sourceId === "") {
    return fail(
      "invalid-envelope-source-id",
      "sourceId must be a non-empty string.",
      "sourceId"
    );
  }

  const fromRole = normalizeRole(value.fromRole);
  if (!fromRole) {
    return fail(
      "invalid-envelope-role",
      "fromRole must be 'host' or 'student'.",
      "fromRole"
    );
  }

  if (!isFiniteNumber(value.sentAt)) {
    return fail(
      "invalid-envelope-sent-at",
      "sentAt must be a finite number.",
      "sentAt"
    );
  }
  const sentAt = normalizeTimestamp(value.sentAt, 0);

  if (value.kind === "state-request") {
    return ok({
      protocol: SESSION_SYNC_PROTOCOL,
      kind: "state-request",
      sourceId,
      fromRole,
      sentAt,
    });
  }

  if (!isFiniteNumber(value.seq) || value.seq < 1 || !Number.isInteger(value.seq)) {
    return fail(
      "invalid-envelope-seq",
      "seq must be a positive integer.",
      "seq"
    );
  }

  const payloadValidation = validateStatePayload(value.payload);
  if (!payloadValidation.ok) {
    return payloadValidation;
  }

  return ok({
    protocol: SESSION_SYNC_PROTOCOL,
    kind: "state-update",
    sourceId,
    fromRole,
    seq: normalizeEnvelopeSeq(value.seq),
    sentAt,
    payload: payloadValidation.value,
  });
};
