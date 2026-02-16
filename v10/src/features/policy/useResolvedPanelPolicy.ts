"use client";

import { useEffect, useMemo } from "react";

import {
  CORE_EDIT_ONLY_PANEL_POLICY_IDS,
  CORE_PANEL_POLICY_SOURCE,
} from "@core/config/panel-policy";
import { resolveExecutionRole } from "@core/config/rolePolicy";
import {
  createWindowRuntimePanelPolicyState,
  resolvePanelPolicyRuntimeDocument,
  type PanelPolicyRuntimeResolvedDocument,
} from "@features/layout/windowing/panelPolicy.runtime";
import type { WindowRuntimePersistedState } from "@features/layout/windowing/windowRuntime.types";
import { useLocalStore } from "@features/store/useLocalStore";
import { useChromeStore } from "@features/store/useChromeStore";

export type UseResolvedPanelPolicyOptions = {
  policyDocument?: unknown;
  persistedPanels?: WindowRuntimePersistedState;
  editOnlyPanelIds?: readonly string[] | ReadonlySet<string>;
  syncStorePolicyState?: boolean;
};

export const useResolvedPanelPolicy = (
  options: UseResolvedPanelPolicyOptions = {}
): PanelPolicyRuntimeResolvedDocument => {
  const role = useLocalStore((state) => state.role);
  const trustedRoleClaim = useLocalStore((state) => state.trustedRoleClaim);
  const chromePersistedPanels = useChromeStore((state) => state.windowRuntimePanels);
  const replaceWindowRuntimePanelPolicy = useChromeStore(
    (state) => state.replaceWindowRuntimePanelPolicy
  );

  const executionRole = resolveExecutionRole(trustedRoleClaim ?? role);
  const persistedPanels = options.persistedPanels ?? chromePersistedPanels;
  const policyDocument = options.policyDocument ?? CORE_PANEL_POLICY_SOURCE;
  const editOnlyPanelIds = options.editOnlyPanelIds ?? CORE_EDIT_ONLY_PANEL_POLICY_IDS;
  const syncStorePolicyState = options.syncStorePolicyState ?? true;

  const resolvedPolicy = useMemo(
    () =>
      resolvePanelPolicyRuntimeDocument({
        policyDocument,
        role: executionRole,
        persistedPanels,
        editOnlyPanelIds,
      }),
    [editOnlyPanelIds, executionRole, persistedPanels, policyDocument]
  );

  const policyState = useMemo(
    () => createWindowRuntimePanelPolicyState(resolvedPolicy.panels),
    [resolvedPolicy.panels]
  );

  useEffect(() => {
    if (!syncStorePolicyState) return;
    replaceWindowRuntimePanelPolicy(policyState);
  }, [policyState, replaceWindowRuntimePanelPolicy, syncStorePolicyState]);

  return resolvedPolicy;
};
