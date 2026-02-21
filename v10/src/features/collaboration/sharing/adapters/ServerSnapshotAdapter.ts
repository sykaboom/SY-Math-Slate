import type {
  LoadSnapshotInput,
  LoadSnapshotResult,
  SaveSnapshotInput,
  SaveSnapshotResult,
  SnapshotAdapterInterface,
} from "./SnapshotAdapterInterface";
import { toCanvasSnapshot, toShareSessionMeta } from "./SnapshotAdapterInterface";

const normalizeEndpoint = (value: string): string => {
  const trimmed = value.trim();
  if (trimmed.length === 0) return "/api/share";
  return trimmed.endsWith("/") ? trimmed.slice(0, -1) : trimmed;
};

const readErrorMessage = (body: unknown): string | null => {
  if (typeof body !== "object" || body === null) return null;
  const value = (body as Record<string, unknown>).message;
  if (typeof value !== "string") return null;
  return value;
};

const parseJsonBody = async (response: Response): Promise<unknown> => {
  try {
    return (await response.json()) as unknown;
  } catch {
    return null;
  }
};

export type ServerSnapshotAdapterOptions = {
  endpoint?: string;
};

export class ServerSnapshotAdapter implements SnapshotAdapterInterface {
  private readonly endpoint: string;

  constructor(options: ServerSnapshotAdapterOptions = {}) {
    this.endpoint = normalizeEndpoint(options.endpoint ?? "/api/share");
  }

  async saveSnapshot(input: SaveSnapshotInput): Promise<SaveSnapshotResult> {
    try {
      const response = await fetch(this.endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          snapshot: input.snapshot,
          ttlSeconds: input.ttlSeconds,
        }),
      });

      const body = await parseJsonBody(response);
      if (!response.ok) {
        return {
          ok: false,
          error:
            readErrorMessage(body) ??
            `Failed to persist snapshot on server (status ${response.status}).`,
        };
      }

      const bodyRecord =
        typeof body === "object" && body !== null
          ? (body as Record<string, unknown>)
          : null;

      const serverSnapshot = toCanvasSnapshot(bodyRecord?.snapshot);
      const serverMeta = toShareSessionMeta(bodyRecord?.meta);

      return {
        ok: true,
        snapshot: serverSnapshot ?? input.snapshot,
        meta: serverMeta ?? input.meta,
        source: "server",
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      return {
        ok: false,
        error: `Failed to persist snapshot on server: ${message}`,
      };
    }
  }

  async loadSnapshot(input: LoadSnapshotInput): Promise<LoadSnapshotResult> {
    try {
      const response = await fetch(
        `${this.endpoint}/${encodeURIComponent(input.shareId)}`,
        {
          method: "GET",
          cache: "no-store",
        }
      );

      const body = await parseJsonBody(response);
      if (response.status === 404) {
        return {
          ok: false,
          error: readErrorMessage(body) ?? "Snapshot not found on server.",
          notFound: true,
        };
      }

      if (!response.ok) {
        return {
          ok: false,
          error:
            readErrorMessage(body) ??
            `Failed to load snapshot from server (status ${response.status}).`,
        };
      }

      const bodyRecord =
        typeof body === "object" && body !== null
          ? (body as Record<string, unknown>)
          : null;
      const snapshot = toCanvasSnapshot(bodyRecord?.snapshot);

      if (!snapshot || snapshot.shareId !== input.shareId) {
        return {
          ok: false,
          error: "Server returned an invalid snapshot payload.",
        };
      }

      return {
        ok: true,
        snapshot,
        source: "server",
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      return {
        ok: false,
        error: `Failed to load snapshot from server: ${message}`,
      };
    }
  }
}
