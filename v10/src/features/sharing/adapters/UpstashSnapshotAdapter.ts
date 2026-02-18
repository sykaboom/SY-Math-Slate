import type {
  LoadSnapshotInput,
  LoadSnapshotResult,
  SaveSnapshotInput,
  SaveSnapshotResult,
  SnapshotAdapterInterface,
} from "./SnapshotAdapterInterface";
import { toCanvasSnapshot } from "./SnapshotAdapterInterface";

const DEFAULT_TTL_SECONDS = 60 * 60 * 24;
const DEFAULT_KEY_PREFIX = "share";

type UpstashCommandResult<T> =
  | {
      ok: true;
      result: T;
    }
  | {
      ok: false;
      error: string;
    };

const normalizeString = (value: string | null | undefined): string | null => {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

const normalizeBaseUrl = (value: string | null | undefined): string | null => {
  const normalized = normalizeString(value);
  if (!normalized) return null;
  return normalized.endsWith("/") ? normalized.slice(0, -1) : normalized;
};

const parsePositiveInt = (value: unknown): number | null => {
  if (typeof value === "number" && Number.isFinite(value) && value > 0) {
    return Math.floor(value);
  }
  if (typeof value === "string") {
    const parsed = Number.parseInt(value, 10);
    if (Number.isFinite(parsed) && parsed > 0) {
      return parsed;
    }
  }
  return null;
};

const toShareKey = (prefix: string, shareId: string): string => {
  return `${prefix}:${shareId}`;
};

const parseUpstashErrorMessage = (body: unknown): string | null => {
  if (typeof body !== "object" || body === null) return null;
  const message = (body as Record<string, unknown>).error;
  if (typeof message !== "string") return null;
  return message;
};

export type UpstashSnapshotAdapterOptions = {
  restUrl?: string;
  restToken?: string;
  defaultTtlSeconds?: number;
  keyPrefix?: string;
};

export class UpstashSnapshotAdapter implements SnapshotAdapterInterface {
  private readonly restUrl: string | null;
  private readonly restToken: string | null;
  private readonly defaultTtlSeconds: number;
  private readonly keyPrefix: string;

  constructor(options: UpstashSnapshotAdapterOptions = {}) {
    this.restUrl = normalizeBaseUrl(
      options.restUrl ?? process.env.UPSTASH_REDIS_REST_URL
    );
    this.restToken = normalizeString(
      options.restToken ?? process.env.UPSTASH_REDIS_REST_TOKEN
    );
    this.defaultTtlSeconds =
      parsePositiveInt(options.defaultTtlSeconds) ?? DEFAULT_TTL_SECONDS;
    this.keyPrefix = normalizeString(options.keyPrefix) ?? DEFAULT_KEY_PREFIX;
  }

  private hasConfig(): boolean {
    return Boolean(this.restUrl && this.restToken);
  }

  private async runCommand<T>(
    command: Array<string | number>
  ): Promise<UpstashCommandResult<T>> {
    if (!this.restUrl || !this.restToken) {
      return {
        ok: false,
        error:
          "Upstash Redis is not configured. Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN.",
      };
    }

    try {
      const response = await fetch(this.restUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.restToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(command),
        cache: "no-store",
      });

      let body: unknown = null;
      try {
        body = (await response.json()) as unknown;
      } catch {
        body = null;
      }

      if (!response.ok) {
        return {
          ok: false,
          error:
            parseUpstashErrorMessage(body) ??
            `Upstash request failed with status ${response.status}.`,
        };
      }

      const upstashError = parseUpstashErrorMessage(body);
      if (upstashError) {
        return {
          ok: false,
          error: upstashError,
        };
      }

      if (typeof body !== "object" || body === null) {
        return {
          ok: false,
          error: "Invalid Upstash response payload.",
        };
      }

      return {
        ok: true,
        result: (body as { result: T }).result,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      return {
        ok: false,
        error: `Upstash request failed: ${message}`,
      };
    }
  }

  async saveSnapshot(input: SaveSnapshotInput): Promise<SaveSnapshotResult> {
    if (!this.hasConfig()) {
      return {
        ok: false,
        error:
          "Upstash Redis is not configured. Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN.",
      };
    }

    const ttlSeconds =
      parsePositiveInt(input.ttlSeconds) ?? this.defaultTtlSeconds;
    const serializedSnapshot = JSON.stringify(input.snapshot);
    const key = toShareKey(this.keyPrefix, input.snapshot.shareId);

    const result = await this.runCommand<string>([
      "SET",
      key,
      serializedSnapshot,
      "EX",
      ttlSeconds,
    ]);

    if (!result.ok) {
      return {
        ok: false,
        error: result.error,
      };
    }

    return {
      ok: true,
      snapshot: input.snapshot,
      meta: input.meta,
      source: "server",
    };
  }

  async loadSnapshot(input: LoadSnapshotInput): Promise<LoadSnapshotResult> {
    if (!this.hasConfig()) {
      return {
        ok: false,
        error:
          "Upstash Redis is not configured. Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN.",
      };
    }

    const key = toShareKey(this.keyPrefix, input.shareId);
    const result = await this.runCommand<string | null>(["GET", key]);

    if (!result.ok) {
      return {
        ok: false,
        error: result.error,
      };
    }

    if (typeof result.result !== "string") {
      return {
        ok: false,
        error: "Snapshot not found.",
        notFound: true,
      };
    }

    let parsedSnapshot: unknown;
    try {
      parsedSnapshot = JSON.parse(result.result) as unknown;
    } catch {
      return {
        ok: false,
        error: "Stored snapshot payload is not valid JSON.",
      };
    }

    const snapshot = toCanvasSnapshot(parsedSnapshot);
    if (!snapshot || snapshot.shareId !== input.shareId) {
      return {
        ok: false,
        error: "Stored snapshot payload is invalid.",
      };
    }

    return {
      ok: true,
      snapshot,
      source: "server",
    };
  }
}
