import { NextResponse } from "next/server";
import {
  isRecordValue,
  toCanvasSnapshot,
} from "@features/sharing/adapters/SnapshotAdapterInterface";
import { UpstashSnapshotAdapter } from "@features/sharing/adapters/UpstashSnapshotAdapter";

export const dynamic = "force-dynamic";

const adapter = new UpstashSnapshotAdapter();

const parsePositiveInteger = (value: unknown): number | undefined => {
  if (typeof value === "number" && Number.isFinite(value) && value > 0) {
    return Math.floor(value);
  }
  if (typeof value === "string") {
    const parsed = Number.parseInt(value, 10);
    if (Number.isFinite(parsed) && parsed > 0) {
      return parsed;
    }
  }
  return undefined;
};

const toViewerUrl = (shareId: string): string => `/view/${shareId}`;

const toMetaFromSnapshot = (
  snapshot: NonNullable<ReturnType<typeof toCanvasSnapshot>>
) => {
  return {
    shareId: snapshot.shareId,
    isPublic: snapshot.isPublic,
    createdAt: snapshot.createdAt,
    viewerUrl: toViewerUrl(snapshot.shareId),
    ...(snapshot.liveSession ? { liveSession: snapshot.liveSession } : {}),
  };
};

const toApiError = (status: number, code: string, message: string) => {
  return NextResponse.json(
    {
      ok: false,
      code,
      message,
    },
    { status }
  );
};

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = (await request.json()) as unknown;
  } catch {
    return toApiError(400, "invalid-json", "Request body must be valid JSON.");
  }

  if (!isRecordValue(payload)) {
    return toApiError(400, "invalid-body", "Request body must be an object.");
  }

  const snapshot = toCanvasSnapshot(payload.snapshot);
  if (!snapshot) {
    return toApiError(400, "invalid-snapshot", "Snapshot payload is invalid.");
  }

  const ttlSeconds = parsePositiveInteger(payload.ttlSeconds);
  const meta = toMetaFromSnapshot(snapshot);

  const result = await adapter.saveSnapshot({
    snapshot,
    meta,
    ttlSeconds,
  });

  if (!result.ok) {
    return toApiError(500, "upstash-save-failed", result.error);
  }

  return NextResponse.json({
    ok: true,
    shareId: result.snapshot.shareId,
    snapshot: result.snapshot,
    meta: result.meta,
    source: result.source,
  });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const shareId = searchParams.get("shareId")?.trim() ?? "";

  if (!shareId) {
    return toApiError(400, "missing-share-id", "shareId query parameter is required.");
  }

  const result = await adapter.loadSnapshot({ shareId });

  if (!result.ok) {
    if (result.notFound) {
      return toApiError(404, "snapshot-not-found", result.error);
    }
    return toApiError(500, "upstash-load-failed", result.error);
  }

  return NextResponse.json({
    ok: true,
    shareId,
    snapshot: result.snapshot,
    source: result.source,
  });
}
