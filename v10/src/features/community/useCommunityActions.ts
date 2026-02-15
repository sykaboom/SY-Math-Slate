"use client";

import { useCallback } from "react";

import {
  validateCommunitySnapshot,
  validateCreateCommunityCommentInput,
  validateCreateCommunityPostInput,
  validateCreateCommunityReportInput,
  validateModerateCommunityReportInput,
  type CommunitySnapshot,
  type CreateCommunityCommentInput,
  type CreateCommunityPostInput,
  type CreateCommunityReportInput,
  type ModerateCommunityReportInput,
} from "@core/contracts/community";

import { useCommunityStore } from "./store/useCommunityStore";

export type CommunityActionFailure = {
  ok: false;
  code: string;
  message: string;
  path?: string;
};

export type CommunityActionSuccess<T> = {
  ok: true;
  value: T;
};

export type CommunityActionResult<T> =
  | CommunityActionSuccess<T>
  | CommunityActionFailure;

type CommunityApiErrorBody = {
  ok: false;
  code: string;
  message: string;
  path?: string;
};

type CommunityApiSuccessBody = {
  ok: true;
  snapshot: CommunitySnapshot;
};

type UseCommunityActionsResult = {
  refresh: () => Promise<CommunityActionResult<CommunitySnapshot>>;
  createPost: (
    input: CreateCommunityPostInput
  ) => Promise<CommunityActionResult<CommunitySnapshot>>;
  createComment: (
    input: CreateCommunityCommentInput
  ) => Promise<CommunityActionResult<CommunitySnapshot>>;
  createReport: (
    input: CreateCommunityReportInput
  ) => Promise<CommunityActionResult<CommunitySnapshot>>;
  moderateReport: (
    input: ModerateCommunityReportInput
  ) => Promise<CommunityActionResult<CommunitySnapshot>>;
};

const jsonHeaders = {
  "content-type": "application/json",
} as const;

const MODERATION_ROLE_HEADER = "x-sy-request-role";
const MODERATION_TOKEN_HEADER = "x-sy-role-token";

const fail = (
  code: string,
  message: string,
  path?: string
): CommunityActionFailure => ({
  ok: false,
  code,
  message,
  ...(path ? { path } : {}),
});

const ok = <T>(value: T): CommunityActionSuccess<T> => ({
  ok: true,
  value,
});

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const parseApiError = (value: unknown): CommunityApiErrorBody | null => {
  if (!isRecord(value)) return null;
  if (value.ok !== false) return null;
  if (typeof value.code !== "string" || typeof value.message !== "string") {
    return null;
  }
  if (value.path !== undefined && typeof value.path !== "string") {
    return null;
  }
  return {
    ok: false,
    code: value.code,
    message: value.message,
    ...(typeof value.path === "string" ? { path: value.path } : {}),
  };
};

const parseApiSuccess = (value: unknown): CommunityActionResult<CommunityApiSuccessBody> => {
  if (!isRecord(value) || value.ok !== true) {
    return fail(
      "community-invalid-response",
      "community response must contain ok=true with snapshot."
    );
  }

  const snapshotValidation = validateCommunitySnapshot(value.snapshot);
  if (!snapshotValidation.ok) {
    return fail(
      "community-invalid-response-snapshot",
      `${snapshotValidation.code}: ${snapshotValidation.message}`,
      snapshotValidation.path
    );
  }

  return ok({
    ok: true,
    snapshot: snapshotValidation.value,
  });
};

const parseUnknownError = (
  responseStatus: number,
  payload: unknown
): CommunityActionFailure => {
  const parsed = parseApiError(payload);
  if (parsed) {
    return fail(parsed.code, parsed.message, parsed.path);
  }
  return fail(
    "community-http-error",
    `community request failed with status ${responseStatus}.`
  );
};

const requestCommunitySnapshot = async (
  request:
    | { method: "GET" }
    | {
        method: "POST";
        action: string;
        payload: unknown;
        headers?: Record<string, string>;
      }
): Promise<CommunityActionResult<CommunitySnapshot>> => {
  const endpoint = "/api/community";
  try {
    const response = await fetch(endpoint, {
      method: request.method,
      headers:
        request.method === "POST" && request.headers
          ? { ...jsonHeaders, ...request.headers }
          : jsonHeaders,
      ...(request.method === "POST"
        ? {
            body: JSON.stringify({
              action: request.action,
              payload: request.payload,
            }),
          }
        : {}),
    });

    const responseBody: unknown = await response
      .json()
      .catch(() => ({
        ok: false,
        code: "community-invalid-json-response",
        message: "community response body must be valid JSON.",
      }));

    if (!response.ok) {
      return parseUnknownError(response.status, responseBody);
    }

    const parsedSuccess = parseApiSuccess(responseBody);
    if (!parsedSuccess.ok) return parsedSuccess;
    return ok(parsedSuccess.value.snapshot);
  } catch {
    return fail(
      "community-network-error",
      "community request failed due to network/runtime error."
    );
  }
};

export const useCommunityActions = (): UseCommunityActionsResult => {
  const setLoading = useCommunityStore((state) => state.setLoading);
  const setError = useCommunityStore((state) => state.setError);
  const clearError = useCommunityStore((state) => state.clearError);
  const setSnapshot = useCommunityStore((state) => state.setSnapshot);

  const commitSnapshot = useCallback(
    (result: CommunityActionResult<CommunitySnapshot>) => {
      if (!result.ok) {
        setError({
          code: result.code,
          message: result.message,
          path: result.path,
        });
        return result;
      }

      clearError();
      setSnapshot(result.value);
      return result;
    },
    [clearError, setError, setSnapshot]
  );

  const refresh = useCallback(async (): Promise<CommunityActionResult<CommunitySnapshot>> => {
    setLoading(true);
    const result = await requestCommunitySnapshot({ method: "GET" });
    return commitSnapshot(result);
  }, [commitSnapshot, setLoading]);

  const createPost = useCallback(
    async (
      input: CreateCommunityPostInput
    ): Promise<CommunityActionResult<CommunitySnapshot>> => {
      const validation = validateCreateCommunityPostInput(input);
      if (!validation.ok) {
        const result = fail(validation.code, validation.message, validation.path);
        setError(result);
        return result;
      }

      setLoading(true);
      const result = await requestCommunitySnapshot({
        method: "POST",
        action: "create-post",
        payload: validation.value,
      });
      return commitSnapshot(result);
    },
    [commitSnapshot, setError, setLoading]
  );

  const createComment = useCallback(
    async (
      input: CreateCommunityCommentInput
    ): Promise<CommunityActionResult<CommunitySnapshot>> => {
      const validation = validateCreateCommunityCommentInput(input);
      if (!validation.ok) {
        const result = fail(validation.code, validation.message, validation.path);
        setError(result);
        return result;
      }

      setLoading(true);
      const result = await requestCommunitySnapshot({
        method: "POST",
        action: "create-comment",
        payload: validation.value,
      });
      return commitSnapshot(result);
    },
    [commitSnapshot, setError, setLoading]
  );

  const createReport = useCallback(
    async (
      input: CreateCommunityReportInput
    ): Promise<CommunityActionResult<CommunitySnapshot>> => {
      const validation = validateCreateCommunityReportInput(input);
      if (!validation.ok) {
        const result = fail(validation.code, validation.message, validation.path);
        setError(result);
        return result;
      }

      setLoading(true);
      const result = await requestCommunitySnapshot({
        method: "POST",
        action: "create-report",
        payload: validation.value,
      });
      return commitSnapshot(result);
    },
    [commitSnapshot, setError, setLoading]
  );

  const moderateReport = useCallback(
    async (
      input: ModerateCommunityReportInput
    ): Promise<CommunityActionResult<CommunitySnapshot>> => {
      const validation = validateModerateCommunityReportInput(input);
      if (!validation.ok) {
        const result = fail(validation.code, validation.message, validation.path);
        setError(result);
        return result;
      }

      const hostToken = (process.env.NEXT_PUBLIC_ROLE_TRUST_TOKEN ?? "").trim();
      if (hostToken === "") {
        const result = fail(
          "community-host-token-missing",
          "moderation host token is not configured in client runtime."
        );
        setError(result);
        return result;
      }

      setLoading(true);
      const result = await requestCommunitySnapshot({
        method: "POST",
        action: "moderate-report",
        payload: validation.value,
        headers: {
          [MODERATION_ROLE_HEADER]: "host",
          [MODERATION_TOKEN_HEADER]: hostToken,
        },
      });
      return commitSnapshot(result);
    },
    [commitSnapshot, setError, setLoading]
  );

  return {
    refresh,
    createPost,
    createComment,
    createReport,
    moderateReport,
  };
};
