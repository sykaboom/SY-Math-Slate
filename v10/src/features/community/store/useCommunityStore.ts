"use client";

import { create } from "zustand";

import type {
  CommunityComment,
  CommunityPost,
  CommunityReport,
  CommunityReportStatus,
  CommunitySnapshot,
} from "@core/contracts/community";

export type CommunityStoreError = {
  code: string;
  message: string;
  path?: string;
  at: number;
};

type CommunityStoreState = {
  posts: CommunityPost[];
  comments: CommunityComment[];
  reports: CommunityReport[];
  serverTime: number;
  lastSyncAt: number | null;
  isLoading: boolean;
  lastError: CommunityStoreError | null;
  reset: () => void;
  setLoading: (value: boolean) => void;
  setError: (error: Omit<CommunityStoreError, "at">) => void;
  clearError: () => void;
  setSnapshot: (snapshot: CommunitySnapshot) => void;
  upsertPost: (post: CommunityPost) => void;
  upsertComment: (comment: CommunityComment) => void;
  upsertReport: (report: CommunityReport) => void;
  applyModerationDecision: (input: {
    reportId: string;
    status: CommunityReportStatus;
    moderatedAt: number;
    moderatorId: string;
    moderationNote: string | null;
  }) => void;
};

const clonePost = (post: CommunityPost): CommunityPost => ({
  id: post.id,
  authorId: post.authorId,
  body: post.body,
  createdAt: post.createdAt,
  updatedAt: post.updatedAt,
});

const cloneComment = (comment: CommunityComment): CommunityComment => ({
  id: comment.id,
  postId: comment.postId,
  authorId: comment.authorId,
  body: comment.body,
  createdAt: comment.createdAt,
});

const cloneReport = (report: CommunityReport): CommunityReport => ({
  id: report.id,
  targetType: report.targetType,
  targetId: report.targetId,
  reason: report.reason,
  detail: report.detail,
  reporterId: report.reporterId,
  status: report.status,
  createdAt: report.createdAt,
  moderatedAt: report.moderatedAt,
  moderatorId: report.moderatorId,
  moderationNote: report.moderationNote,
});

const cloneSnapshot = (snapshot: CommunitySnapshot): CommunitySnapshot => ({
  posts: snapshot.posts.map(clonePost),
  comments: snapshot.comments.map(cloneComment),
  reports: snapshot.reports.map(cloneReport),
  serverTime: snapshot.serverTime,
});

const sortPosts = (posts: CommunityPost[]): CommunityPost[] =>
  [...posts].sort((a, b) => {
    if (a.createdAt !== b.createdAt) return a.createdAt - b.createdAt;
    return a.id.localeCompare(b.id);
  });

const sortComments = (comments: CommunityComment[]): CommunityComment[] =>
  [...comments].sort((a, b) => {
    if (a.createdAt !== b.createdAt) return a.createdAt - b.createdAt;
    if (a.postId !== b.postId) return a.postId.localeCompare(b.postId);
    return a.id.localeCompare(b.id);
  });

const reportStatusRank: Record<CommunityReportStatus, number> = {
  pending: 0,
  approved: 1,
  rejected: 2,
};

const sortReports = (reports: CommunityReport[]): CommunityReport[] =>
  [...reports].sort((a, b) => {
    const statusDiff = reportStatusRank[a.status] - reportStatusRank[b.status];
    if (statusDiff !== 0) return statusDiff;
    if (a.createdAt !== b.createdAt) return a.createdAt - b.createdAt;
    return a.id.localeCompare(b.id);
  });

const upsertById = <T extends { id: string }>(
  entries: T[],
  entry: T,
  sorter: (items: T[]) => T[]
): T[] => {
  const next = [...entries];
  const index = next.findIndex((candidate) => candidate.id === entry.id);
  if (index >= 0) {
    next[index] = entry;
    return sorter(next);
  }
  next.push(entry);
  return sorter(next);
};

const now = (): number => Date.now();

const INITIAL_STATE = {
  posts: [] as CommunityPost[],
  comments: [] as CommunityComment[],
  reports: [] as CommunityReport[],
  serverTime: 0,
  lastSyncAt: null as number | null,
  isLoading: false,
  lastError: null as CommunityStoreError | null,
};

export const useCommunityStore = create<CommunityStoreState>((set) => ({
  ...INITIAL_STATE,
  reset: () =>
    set(() => ({
      ...INITIAL_STATE,
    })),
  setLoading: (value) =>
    set(() => ({
      isLoading: Boolean(value),
    })),
  setError: (error) =>
    set(() => ({
      lastError: {
        code: error.code,
        message: error.message,
        path: error.path,
        at: now(),
      },
      isLoading: false,
    })),
  clearError: () =>
    set(() => ({
      lastError: null,
    })),
  setSnapshot: (snapshot) => {
    const safeSnapshot = cloneSnapshot(snapshot);
    set(() => ({
      posts: sortPosts(safeSnapshot.posts),
      comments: sortComments(safeSnapshot.comments),
      reports: sortReports(safeSnapshot.reports),
      serverTime: safeSnapshot.serverTime,
      lastSyncAt: now(),
      isLoading: false,
      lastError: null,
    }));
  },
  upsertPost: (post) => {
    const safePost = clonePost(post);
    set((state) => ({
      posts: upsertById(state.posts, safePost, sortPosts),
      serverTime: Math.max(state.serverTime, safePost.updatedAt),
    }));
  },
  upsertComment: (comment) => {
    const safeComment = cloneComment(comment);
    set((state) => ({
      comments: upsertById(state.comments, safeComment, sortComments),
      serverTime: Math.max(state.serverTime, safeComment.createdAt),
    }));
  },
  upsertReport: (report) => {
    const safeReport = cloneReport(report);
    set((state) => ({
      reports: upsertById(state.reports, safeReport, sortReports),
      serverTime: Math.max(state.serverTime, safeReport.createdAt),
    }));
  },
  applyModerationDecision: ({
    reportId,
    status,
    moderatedAt,
    moderatorId,
    moderationNote,
  }) => {
    set((state) => {
      const nextReports = state.reports.map((report) => {
        if (report.id !== reportId) return report;
        return {
          ...report,
          status,
          moderatedAt,
          moderatorId,
          moderationNote,
        };
      });
      return {
        reports: sortReports(nextReports),
        serverTime: Math.max(state.serverTime, moderatedAt),
      };
    });
  },
}));
