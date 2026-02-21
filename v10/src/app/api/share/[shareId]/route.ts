import { NextResponse } from "next/server";

import { UpstashSnapshotAdapter } from "@features/collaboration/sharing/adapters/UpstashSnapshotAdapter";

export const dynamic = "force-dynamic";

const adapter = new UpstashSnapshotAdapter();

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

type ShareRouteContext = {
  params: Promise<{
    shareId: string;
  }>;
};

export async function GET(_request: Request, context: ShareRouteContext) {
  const params = await context.params;
  const shareId = typeof params.shareId === "string" ? params.shareId.trim() : "";

  if (!shareId) {
    return toApiError(400, "missing-share-id", "shareId route parameter is required.");
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
