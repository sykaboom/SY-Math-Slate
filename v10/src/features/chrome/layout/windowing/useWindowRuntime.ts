"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { useChromeStore } from "@features/platform/store/useChromeStore";
import {
  areWindowRuntimePersistedStatesEqual,
  createWindowRuntimeState,
  extractWindowRuntimePersistedState,
  focusWindowRuntimePanel,
  listWindowRuntimePanelsByOrder,
  listWindowRuntimePanelsByZ,
  moveWindowRuntimePanelBy,
  moveWindowRuntimePanelTo,
  reconcileWindowRuntimeState,
  resetWindowRuntimePanel,
  setWindowRuntimePanelDisplayMode,
  setWindowRuntimePanelOpen,
} from "./windowRuntime";
import type {
  WindowRuntimeDelta,
  WindowRuntimeDisplayMode,
  WindowRuntimePanelContract,
  WindowRuntimePanelState,
  WindowRuntimePersistedState,
  WindowRuntimePoint,
  WindowRuntimeRect,
  WindowRuntimeState,
} from "./windowRuntime.types";

export type UseWindowRuntimeOptions = {
  panels: readonly WindowRuntimePanelContract[];
  clampBounds: WindowRuntimeRect;
  persistedState?: WindowRuntimePersistedState;
  onPersistedStateChange?: (nextState: WindowRuntimePersistedState) => void;
};

export type UseWindowRuntimeResult = {
  state: WindowRuntimeState;
  orderedPanels: readonly WindowRuntimePanelState[];
  dockedPanels: readonly WindowRuntimePanelState[];
  windowedPanels: readonly WindowRuntimePanelState[];
  focusPanel: (panelId: string) => void;
  movePanelTo: (panelId: string, position: WindowRuntimePoint) => void;
  movePanelBy: (panelId: string, delta: WindowRuntimeDelta) => void;
  resetPanel: (panelId: string) => void;
  setPanelOpen: (panelId: string, isOpen: boolean) => void;
  setPanelDisplayMode: (panelId: string, displayMode: WindowRuntimeDisplayMode) => void;
};

export const useWindowRuntime = (
  options: UseWindowRuntimeOptions
): UseWindowRuntimeResult => {
  const chromePersistedState = useChromeStore((state) => state.windowRuntimePanels);
  const replaceChromePersistedState = useChromeStore(
    (state) => state.replaceWindowRuntimePanels
  );

  const resolvedPersistedState = options.persistedState ?? chromePersistedState;
  const persistSink =
    options.onPersistedStateChange ??
    (options.persistedState === undefined ? replaceChromePersistedState : undefined);

  const [state, setState] = useState<WindowRuntimeState>(() =>
    createWindowRuntimeState({
      panels: options.panels,
      clampBounds: options.clampBounds,
      persisted: resolvedPersistedState,
    })
  );

  const runtimeState = useMemo(
    () =>
      reconcileWindowRuntimeState({
        previous: state,
        panels: options.panels,
        clampBounds: options.clampBounds,
        persisted: resolvedPersistedState,
      }),
    [options.clampBounds, options.panels, resolvedPersistedState, state]
  );

  const persistedSnapshot = useMemo(
    () => extractWindowRuntimePersistedState(runtimeState),
    [runtimeState]
  );

  useEffect(() => {
    if (!persistSink) return;
    if (areWindowRuntimePersistedStatesEqual(persistedSnapshot, resolvedPersistedState)) {
      return;
    }
    persistSink(persistedSnapshot);
  }, [persistSink, persistedSnapshot, resolvedPersistedState]);

  const focusPanel = useCallback((panelId: string) => {
    setState((previous) =>
      focusWindowRuntimePanel(
        reconcileWindowRuntimeState({
          previous,
          panels: options.panels,
          clampBounds: options.clampBounds,
          persisted: resolvedPersistedState,
        }),
        panelId
      )
    );
  }, [options.clampBounds, options.panels, resolvedPersistedState]);

  const movePanelTo = useCallback((panelId: string, position: WindowRuntimePoint) => {
    setState((previous) =>
      moveWindowRuntimePanelTo(
        reconcileWindowRuntimeState({
          previous,
          panels: options.panels,
          clampBounds: options.clampBounds,
          persisted: resolvedPersistedState,
        }),
        {
          panelId,
          position,
        }
      )
    );
  }, [options.clampBounds, options.panels, resolvedPersistedState]);

  const movePanelBy = useCallback((panelId: string, delta: WindowRuntimeDelta) => {
    setState((previous) =>
      moveWindowRuntimePanelBy(
        reconcileWindowRuntimeState({
          previous,
          panels: options.panels,
          clampBounds: options.clampBounds,
          persisted: resolvedPersistedState,
        }),
        {
          panelId,
          delta,
        }
      )
    );
  }, [options.clampBounds, options.panels, resolvedPersistedState]);

  const resetPanel = useCallback((panelId: string) => {
    setState((previous) =>
      resetWindowRuntimePanel(
        reconcileWindowRuntimeState({
          previous,
          panels: options.panels,
          clampBounds: options.clampBounds,
          persisted: resolvedPersistedState,
        }),
        panelId
      )
    );
  }, [options.clampBounds, options.panels, resolvedPersistedState]);

  const setPanelOpen = useCallback((panelId: string, isOpen: boolean) => {
    setState((previous) =>
      setWindowRuntimePanelOpen(
        reconcileWindowRuntimeState({
          previous,
          panels: options.panels,
          clampBounds: options.clampBounds,
          persisted: resolvedPersistedState,
        }),
        panelId,
        isOpen
      )
    );
  }, [options.clampBounds, options.panels, resolvedPersistedState]);

  const setPanelDisplayMode = useCallback(
    (panelId: string, displayMode: WindowRuntimeDisplayMode) => {
      setState((previous) =>
        setWindowRuntimePanelDisplayMode(
          reconcileWindowRuntimeState({
            previous,
            panels: options.panels,
            clampBounds: options.clampBounds,
            persisted: resolvedPersistedState,
          }),
          panelId,
          displayMode
        )
      );
    },
    [options.clampBounds, options.panels, resolvedPersistedState]
  );

  const orderedPanels = useMemo(
    () => listWindowRuntimePanelsByOrder(runtimeState),
    [runtimeState]
  );
  const dockedPanels = useMemo(
    () => orderedPanels.filter((panel) => panel.displayMode === "docked"),
    [orderedPanels]
  );
  const windowedPanels = useMemo(
    () =>
      listWindowRuntimePanelsByZ(runtimeState).filter(
        (panel) => panel.displayMode === "windowed"
      ),
    [runtimeState]
  );

  return {
    state: runtimeState,
    orderedPanels,
    dockedPanels,
    windowedPanels,
    focusPanel,
    movePanelTo,
    movePanelBy,
    resetPanel,
    setPanelOpen,
    setPanelDisplayMode,
  };
};
