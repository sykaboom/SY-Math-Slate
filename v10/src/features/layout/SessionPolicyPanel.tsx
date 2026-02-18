"use client";

import { useMemo } from "react";

import type { ApprovalMode, ProposalType } from "@core/types/sessionPolicy";
import { PROPOSAL_TYPES } from "@core/types/sessionPolicy";
import { useSessionPolicyStore } from "@features/store/useSessionPolicyStore";

type SessionPolicyPanelProps = {
  className?: string;
};

const PROPOSAL_LABELS: Record<ProposalType, string> = {
  canvas_mutation: "Canvas Mutation",
  step_navigation: "Step Navigation",
  viewport_sync: "Viewport Sync",
  ai_question: "AI Question",
};

const APPROVAL_MODE_OPTIONS: Array<{ value: ApprovalMode; label: string }> = [
  { value: "auto", label: "Auto" },
  { value: "host_required", label: "Host Required" },
  { value: "denied", label: "Denied" },
];

const normalizeParticipantsInput = (value: string): number => {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed)) return 1;
  return Math.max(1, parsed);
};

export function SessionPolicyPanel({ className }: SessionPolicyPanelProps) {
  const templates = useSessionPolicyStore((state) => state.templates);
  const activePolicy = useSessionPolicyStore((state) => state.activePolicy);
  const setTemplate = useSessionPolicyStore((state) => state.setTemplate);
  const setLabel = useSessionPolicyStore((state) => state.setLabel);
  const setProposalRule = useSessionPolicyStore((state) => state.setProposalRule);
  const setMaxParticipants = useSessionPolicyStore((state) => state.setMaxParticipants);
  const setAllowAnonymous = useSessionPolicyStore((state) => state.setAllowAnonymous);
  const resetPolicy = useSessionPolicyStore((state) => state.resetPolicy);

  const templateLabel = useMemo(() => {
    const matched = templates.find(
      (template) => template.templateId === activePolicy.templateId
    );
    return matched?.label ?? "Custom";
  }, [activePolicy.templateId, templates]);

  return (
    <section
      className={[
        "rounded-2xl border border-theme-border/20 bg-theme-surface/60 p-4 text-theme-text",
        className ?? "",
      ]
        .join(" ")
        .trim()}
      aria-label="Session policy controls"
    >
      <header className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold">Session Policy</p>
          <p className="text-xs text-theme-text/60">{templateLabel}</p>
        </div>
        <button
          type="button"
          className="rounded-full border border-theme-border/20 px-3 py-1 text-xs text-theme-text/80 hover:bg-theme-surface-soft"
          onClick={resetPolicy}
        >
          Reset
        </button>
      </header>

      <div className="space-y-3">
        <label className="flex flex-col gap-1 text-xs text-theme-text/70">
          Template
          <select
            className="rounded-md border border-theme-border/20 bg-theme-surface-soft px-2 py-1 text-sm text-theme-text"
            value={activePolicy.templateId}
            onChange={(event) => setTemplate(event.target.value)}
          >
            {templates.map((template) => (
              <option key={template.templateId} value={template.templateId}>
                {template.label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-xs text-theme-text/70">
          Label
          <input
            className="rounded-md border border-theme-border/20 bg-theme-surface-soft px-2 py-1 text-sm text-theme-text"
            value={activePolicy.label}
            onChange={(event) => setLabel(event.target.value)}
          />
        </label>

        <label className="flex flex-col gap-1 text-xs text-theme-text/70">
          Max participants
          <input
            type="number"
            min={1}
            step={1}
            className="rounded-md border border-theme-border/20 bg-theme-surface-soft px-2 py-1 text-sm text-theme-text"
            value={activePolicy.maxParticipants}
            onChange={(event) =>
              setMaxParticipants(normalizeParticipantsInput(event.target.value))
            }
          />
        </label>

        <label className="flex items-center gap-2 text-xs text-theme-text/70">
          <input
            type="checkbox"
            checked={activePolicy.allowAnonymous}
            onChange={(event) => setAllowAnonymous(event.target.checked)}
          />
          Allow anonymous participants
        </label>
      </div>

      <div className="mt-4 space-y-2">
        {PROPOSAL_TYPES.map((proposalType) => (
          <div
            key={proposalType}
            className="flex items-center justify-between gap-2 rounded-md border border-theme-border/10 bg-theme-surface/30 px-2 py-2"
          >
            <span className="text-xs text-theme-text/75">
              {PROPOSAL_LABELS[proposalType]}
            </span>
            <select
              className="rounded-md border border-theme-border/20 bg-theme-surface-soft px-2 py-1 text-xs text-theme-text"
              value={activePolicy.proposalRules[proposalType]}
              onChange={(event) =>
                setProposalRule(proposalType, event.target.value as ApprovalMode)
              }
            >
              {APPROVAL_MODE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>
    </section>
  );
}
