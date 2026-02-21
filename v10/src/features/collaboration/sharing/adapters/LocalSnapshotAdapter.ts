import {
  SHARE_INDEX_KEY,
  deserializeShareIndex,
  deserializeSnapshot,
  serializeShareIndex,
  serializeSnapshot,
  toShareStorageKey,
  upsertShareIndex,
} from "@features/collaboration/sharing/snapshotSerializer";

import type {
  LoadSnapshotInput,
  LoadSnapshotResult,
  SaveSnapshotInput,
  SaveSnapshotResult,
  SnapshotAdapterInterface,
} from "./SnapshotAdapterInterface";

export class LocalSnapshotAdapter implements SnapshotAdapterInterface {
  saveSnapshot(input: SaveSnapshotInput): SaveSnapshotResult {
    if (typeof window === "undefined") {
      return {
        ok: false,
        error: "Local snapshot adapter is only available in the browser.",
      };
    }

    try {
      localStorage.setItem(
        toShareStorageKey(input.snapshot.shareId),
        serializeSnapshot(input.snapshot)
      );

      const currentIndex = deserializeShareIndex(localStorage.getItem(SHARE_INDEX_KEY));
      const nextIndex = upsertShareIndex(currentIndex, input.meta);
      localStorage.setItem(SHARE_INDEX_KEY, serializeShareIndex(nextIndex));

      return {
        ok: true,
        snapshot: input.snapshot,
        meta: input.meta,
        source: "local",
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      return {
        ok: false,
        error: `Failed to save snapshot in local storage: ${message}`,
      };
    }
  }

  loadSnapshot(input: LoadSnapshotInput): LoadSnapshotResult {
    if (typeof window === "undefined") {
      return {
        ok: false,
        error: "Local snapshot adapter is only available in the browser.",
      };
    }

    try {
      const raw = localStorage.getItem(toShareStorageKey(input.shareId));
      if (!raw) {
        return {
          ok: false,
          error: "Snapshot not found in local storage.",
          notFound: true,
        };
      }

      const snapshot = deserializeSnapshot(raw);
      if (!snapshot || snapshot.shareId !== input.shareId) {
        return {
          ok: false,
          error: "Stored snapshot is invalid.",
          notFound: true,
        };
      }

      return {
        ok: true,
        snapshot,
        source: "local",
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      return {
        ok: false,
        error: `Failed to load snapshot from local storage: ${message}`,
      };
    }
  }
}
