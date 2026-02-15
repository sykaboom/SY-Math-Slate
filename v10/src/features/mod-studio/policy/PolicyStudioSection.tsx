"use client";

import { useMemo, useState } from "react";

import {
  evaluateRolePolicyDecisionWithDocument,
  getRolePolicyDocument,
  listKnownRolePolicyActions,
  listKnownRolePolicySurfaces,
  publishRolePolicyDocument,
} from "@core/config/rolePolicy";
import { useModStudioStore } from "@features/store/useModStudioStore";

type RolePolicyDecision = "allow" | "deny";

const ROLE_PRESETS = ["host", "student"] as const;

const clonePolicy = <T,>(value: T): T => JSON.parse(JSON.stringify(value));

export function PolicyStudioSection() {
  const policyDraft = useModStudioStore((state) => state.draft.policy);
  const updatePolicyDraft = useModStudioStore((state) => state.updatePolicyDraft);
  const setLastPublishResult = useModStudioStore(
    (state) => state.setLastPublishResult
  );
  const [error, setError] = useState<string | null>(null);

  const roles = useMemo(() => {
    const fromDraft = Object.keys(policyDraft.roles);
    const merged = new Set<string>([...ROLE_PRESETS, ...fromDraft]);
    return [...merged];
  }, [policyDraft.roles]);

  const updateDecision = (
    role: string,
    surface: string,
    action: string,
    decision: RolePolicyDecision
  ) => {
    const next = clonePolicy(policyDraft);
    if (!next.roles[role]) {
      next.roles[role] = { surfaces: {} };
    }
    if (!next.roles[role].surfaces[surface]) {
      next.roles[role].surfaces[surface] = {};
    }
    next.roles[role].surfaces[surface][action] = decision;
    updatePolicyDraft(next);
    setError(null);
  };

  const handleResetToRuntime = () => {
    updatePolicyDraft(getRolePolicyDocument());
    setError(null);
    setLastPublishResult(null);
  };

  const handlePublish = () => {
    const result = publishRolePolicyDocument(policyDraft);
    if (!result.ok) {
      setError(result.error);
      setLastPublishResult({ ok: false, message: result.error });
      return;
    }
    setError(null);
    updatePolicyDraft(result.value);
    setLastPublishResult({ ok: true, message: "policy published" });
  };

  return (
    <div className="grid gap-3 text-xs text-white/85">
      <div className="flex items-center justify-between gap-2">
        <div className="text-[11px] uppercase tracking-[0.18em] text-white/60">
          Policy Draft
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleResetToRuntime}
            className="rounded border border-white/20 px-2 py-1 text-[11px] text-white/80 hover:bg-white/10"
          >
            Reset
          </button>
          <button
            type="button"
            onClick={handlePublish}
            className="rounded border border-emerald-400/40 bg-emerald-500/15 px-2 py-1 text-[11px] text-emerald-100 hover:bg-emerald-500/25"
          >
            Publish Policy
          </button>
        </div>
      </div>

      {error ? (
        <div className="rounded border border-rose-400/35 bg-rose-500/10 px-2 py-1.5 text-rose-100">
          {error}
        </div>
      ) : null}

      <div className="grid gap-2">
        {listKnownRolePolicySurfaces().map((surface) => (
          <section
            key={surface}
            className="rounded border border-white/10 bg-white/5 p-2"
          >
            <div className="mb-2 text-[11px] font-semibold text-white/80">{surface}</div>
            <div className="grid gap-2">
              {listKnownRolePolicyActions(surface).map((action) => (
                <div key={`${surface}:${action}`} className="grid gap-1">
                  <div className="text-[11px] text-white/65">{action}</div>
                  <div className="grid grid-cols-2 gap-2">
                    {roles.map((role) => {
                      const current = evaluateRolePolicyDecisionWithDocument(
                        policyDraft,
                        role,
                        surface,
                        action
                      );
                      return (
                        <label
                          key={`${role}:${surface}:${action}`}
                          className="flex items-center justify-between rounded border border-white/10 px-2 py-1"
                        >
                          <span className="text-[11px] text-white/70">{role}</span>
                          <select
                            value={current}
                            onChange={(event) =>
                              updateDecision(
                                role,
                                surface,
                                action,
                                event.target.value as RolePolicyDecision
                              )
                            }
                            className="rounded border border-white/20 bg-black/40 px-1.5 py-0.5 text-[11px] text-white"
                          >
                            <option value="allow">allow</option>
                            <option value="deny">deny</option>
                          </select>
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
