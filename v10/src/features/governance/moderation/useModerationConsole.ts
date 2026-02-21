"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import type {
  CommunityReport,
  CommunityRightsClaim,
  CommunitySafetyEvent,
  CommunityTrafficSignal,
  CommunityTrustSafetySloSummary,
} from "@core/foundation/schemas/community";
import { useCommunityActions } from "@features/governance/community/useCommunityActions";
import {
  useCommunityStore,
  type CommunityStoreError,
} from "@features/governance/community/store/useCommunityStore";
import {
  emitModerationDecisionAuditEvent,
  listAuditEvents,
  subscribeAuditEvents,
  type AuditEvent,
} from "@features/platform/observability/auditLogger";
import { useLocalStore } from "@features/platform/store/useLocalStore";

export type ModerationReportRow = {
  report: CommunityReport;
  targetSummary: string;
};

export type RightsClaimRow = {
  claim: CommunityRightsClaim;
  targetSummary: string;
};

export type UseModerationConsoleResult = {
  isHost: boolean;
  isLoading: boolean;
  lastError: CommunityStoreError | null;
  pendingRows: ModerationReportRow[];
  resolvedRows: ModerationReportRow[];
  pendingRightsClaims: RightsClaimRow[];
  resolvedRightsClaims: RightsClaimRow[];
  trafficSignals: CommunityTrafficSignal[];
  safetyEvents: CommunitySafetyEvent[];
  sloSummary: CommunityTrustSafetySloSummary | null;
  auditEvents: AuditEvent[];
  refresh: () => Promise<void>;
  approveReport: (reportId: string) => Promise<void>;
  rejectReport: (reportId: string) => Promise<void>;
  approveRightsClaim: (claimId: string) => Promise<void>;
  rejectRightsClaim: (claimId: string) => Promise<void>;
};

const MAX_AUDIT_ITEMS = 30;

const isModerationFeedEvent = (event: AuditEvent): boolean =>
  event.channel === "moderation" || event.channel === "approval";

const toShortText = (value: string, max = 88): string => {
  const trimmed = value.trim();
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, max)}...`;
};

const toInitialAuditFeed = (): AuditEvent[] =>
  listAuditEvents().filter(isModerationFeedEvent).slice(-MAX_AUDIT_ITEMS).reverse();

const pickModeratorId = (
  trustedRoleClaim: "host" | "student" | null,
  role: "host" | "student"
): string => {
  if (trustedRoleClaim === "host") return "host:trusted";
  if (role === "host") return "host:local";
  return "host:unknown";
};

export const useModerationConsole = (): UseModerationConsoleResult => {
  const role = useLocalStore((state) => state.role);
  const trustedRoleClaim = useLocalStore((state) => state.trustedRoleClaim);
  const posts = useCommunityStore((state) => state.posts);
  const comments = useCommunityStore((state) => state.comments);
  const reports = useCommunityStore((state) => state.reports);
  const rightsClaims = useCommunityStore((state) => state.rightsClaims);
  const trafficSignals = useCommunityStore((state) => state.trafficSignals);
  const safetyEvents = useCommunityStore((state) => state.safetyEvents);
  const isLoading = useCommunityStore((state) => state.isLoading);
  const lastError = useCommunityStore((state) => state.lastError);
  const {
    moderateReport,
    reviewRightsClaim,
    fetchTrustSafetySlo,
    refresh: refreshCommunity,
  } = useCommunityActions();

  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>(toInitialAuditFeed);
  const [sloSummary, setSloSummary] = useState<CommunityTrustSafetySloSummary | null>(
    null
  );

  const isHost =
    trustedRoleClaim === "host" ||
    (trustedRoleClaim === null && role === "host");

  useEffect(() => {
    const unsubscribe = subscribeAuditEvents((event) => {
      if (!isModerationFeedEvent(event)) return;
      setAuditEvents((current) => {
        const next = [event, ...current];
        return next.slice(0, MAX_AUDIT_ITEMS);
      });
    });
    return unsubscribe;
  }, []);

  const reportRows = useMemo<ModerationReportRow[]>(() => {
    return reports.map((report) => {
      if (report.targetType === "post") {
        const post = posts.find((entry) => entry.id === report.targetId);
        const targetSummary = post
          ? `post:${post.id} ${post.authorId} - ${toShortText(post.body)}`
          : `post:${report.targetId} (missing)`;
        return { report, targetSummary };
      }

      const comment = comments.find((entry) => entry.id === report.targetId);
      const targetSummary = comment
        ? `comment:${comment.id} ${comment.authorId} - ${toShortText(comment.body)}`
        : `comment:${report.targetId} (missing)`;
      return { report, targetSummary };
    });
  }, [comments, posts, reports]);

  const pendingRows = useMemo(
    () => reportRows.filter((entry) => entry.report.status === "pending"),
    [reportRows]
  );

  const resolvedRows = useMemo(
    () => reportRows.filter((entry) => entry.report.status !== "pending"),
    [reportRows]
  );

  const rightsClaimRows = useMemo<RightsClaimRow[]>(() => {
    return rightsClaims.map((claim) => {
      if (claim.targetType === "post") {
        const post = posts.find((entry) => entry.id === claim.targetId);
        const targetSummary = post
          ? `post:${post.id} ${post.authorId} - ${toShortText(post.body)}`
          : `post:${claim.targetId} (missing)`;
        return { claim, targetSummary };
      }
      const comment = comments.find((entry) => entry.id === claim.targetId);
      const targetSummary = comment
        ? `comment:${comment.id} ${comment.authorId} - ${toShortText(comment.body)}`
        : `comment:${claim.targetId} (missing)`;
      return { claim, targetSummary };
    });
  }, [comments, posts, rightsClaims]);

  const pendingRightsClaims = useMemo(
    () => rightsClaimRows.filter((entry) => entry.claim.status === "pending"),
    [rightsClaimRows]
  );

  const resolvedRightsClaims = useMemo(
    () => rightsClaimRows.filter((entry) => entry.claim.status !== "pending"),
    [rightsClaimRows]
  );

  const refresh = useCallback(async () => {
    if (!isHost) return;
    await refreshCommunity();
    const slo = await fetchTrustSafetySlo();
    if (slo.ok) {
      setSloSummary(slo.value);
    }
  }, [fetchTrustSafetySlo, isHost, refreshCommunity]);

  const moderate = useCallback(
    async (reportId: string, decision: "approve" | "reject") => {
      if (!isHost) return;
      const row = reportRows.find((entry) => entry.report.id === reportId);
      if (!row || row.report.status !== "pending") return;

      const moderatorId = pickModeratorId(trustedRoleClaim, role);
      const result = await moderateReport({
        reportId,
        decision,
        moderatorId,
      });
      if (!result.ok) return;

      emitModerationDecisionAuditEvent({
        reportId,
        targetType: row.report.targetType,
        targetId: row.report.targetId,
        reason: row.report.reason,
        reporterId: row.report.reporterId,
        decision,
        status: decision === "approve" ? "approved" : "rejected",
        moderatorId,
        moderationNote: null,
      });
    },
    [isHost, reportRows, role, trustedRoleClaim, moderateReport]
  );

  const approveReport = useCallback(
    async (reportId: string) => {
      await moderate(reportId, "approve");
    },
    [moderate]
  );

  const rejectReport = useCallback(
    async (reportId: string) => {
      await moderate(reportId, "reject");
    },
    [moderate]
  );

  const moderateRightsClaim = useCallback(
    async (claimId: string, decision: "approve" | "reject") => {
      if (!isHost) return;
      const row = rightsClaimRows.find((entry) => entry.claim.id === claimId);
      if (!row || row.claim.status !== "pending") return;

      const reviewerId = pickModeratorId(trustedRoleClaim, role);
      const result = await reviewRightsClaim({
        claimId,
        decision,
        reviewerId,
      });
      if (!result.ok) return;
    },
    [isHost, reviewRightsClaim, rightsClaimRows, role, trustedRoleClaim]
  );

  const approveRightsClaim = useCallback(
    async (claimId: string) => {
      await moderateRightsClaim(claimId, "approve");
    },
    [moderateRightsClaim]
  );

  const rejectRightsClaim = useCallback(
    async (claimId: string) => {
      await moderateRightsClaim(claimId, "reject");
    },
    [moderateRightsClaim]
  );

  return {
    isHost,
    isLoading,
    lastError,
    pendingRows,
    resolvedRows,
    pendingRightsClaims,
    resolvedRightsClaims,
    trafficSignals,
    safetyEvents,
    sloSummary,
    auditEvents,
    refresh,
    approveReport,
    rejectReport,
    approveRightsClaim,
    rejectRightsClaim,
  };
};
