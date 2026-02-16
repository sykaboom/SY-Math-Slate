"use client";

import { useCallback, useState } from "react";

import {
  validateExtensionMarketplaceCatalog,
  type ExtensionMarketplaceCatalog,
} from "@core/contracts/extensionMarketplace";

export type MarketplaceCatalogError = {
  code: string;
  message: string;
  path?: string;
};

export type MarketplaceCatalogState = {
  isLoading: boolean;
  catalog: ExtensionMarketplaceCatalog | null;
  error: MarketplaceCatalogError | null;
};

type MarketplaceApiSuccess = {
  ok: true;
  catalog: ExtensionMarketplaceCatalog;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const parseError = (value: unknown): MarketplaceCatalogError | null => {
  if (!isRecord(value)) return null;
  if (value.ok !== false) return null;
  if (typeof value.code !== "string" || typeof value.message !== "string") {
    return null;
  }
  if (value.path !== undefined && typeof value.path !== "string") return null;
  return {
    code: value.code,
    message: value.message,
    ...(typeof value.path === "string" ? { path: value.path } : {}),
  };
};

export const useMarketplaceCatalog = () => {
  const [state, setState] = useState<MarketplaceCatalogState>({
    isLoading: false,
    catalog: null,
    error: null,
  });

  const refresh = useCallback(async () => {
    setState((current) => ({
      ...current,
      isLoading: true,
      error: null,
    }));

    try {
      const response = await fetch("/api/extensions/marketplace", {
        method: "GET",
        headers: {
          "content-type": "application/json",
        },
      });

      const body: unknown = await response
        .json()
        .catch(() => ({
          ok: false,
          code: "marketplace-invalid-json",
          message: "marketplace response must be valid JSON.",
        }));

      if (!response.ok) {
        const parsed = parseError(body);
        setState((current) => ({
          ...current,
          isLoading: false,
          error: parsed ?? {
            code: "marketplace-http-error",
            message: `marketplace request failed (${response.status}).`,
          },
        }));
        return;
      }

      if (!isRecord(body) || body.ok !== true || !("catalog" in body)) {
        setState((current) => ({
          ...current,
          isLoading: false,
          error: {
            code: "marketplace-invalid-response",
            message: "marketplace response shape is invalid.",
          },
        }));
        return;
      }

      const parsed = validateExtensionMarketplaceCatalog(
        (body as MarketplaceApiSuccess).catalog
      );
      if (!parsed.ok) {
        setState((current) => ({
          ...current,
          isLoading: false,
          error: {
            code: "marketplace-invalid-catalog",
            message: `${parsed.code}: ${parsed.message}`,
            path: parsed.path,
          },
        }));
        return;
      }

      setState({
        isLoading: false,
        catalog: parsed.value,
        error: null,
      });
    } catch {
      setState((current) => ({
        ...current,
        isLoading: false,
        error: {
          code: "marketplace-network-error",
          message: "network/runtime error while loading marketplace catalog.",
        },
      }));
    }
  }, []);

  return {
    ...state,
    refresh,
  };
};
