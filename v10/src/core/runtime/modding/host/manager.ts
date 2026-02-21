import type {
  ModContext,
  ModDefinition,
  ModId,
  ModInputHandleResult,
  ModPanelContribution,
  ModToolbarItem,
  NormalizedKeyEvent,
  NormalizedPointerEvent,
  NormalizedWheelGestureEvent,
} from "@core/runtime/modding/api";
import { ModRegistry, type ModRegistryRegisterResult } from "./registry";

export type ModManagerRegistryAdapter = Pick<ModRegistry, "resolve">;

export type ModManagerStateAdapter = {
  getActiveModId: () => ModId | null;
  setActiveModId: (modId: ModId | null) => void;
};

export type ModManagerContextResolver = (modId: ModId) => ModContext;

export type ModActivationRoute = {
  modId: ModId;
};

export type ModActivationSuccess = {
  ok: true;
  activeModId: ModId;
  previousModId: ModId | null;
  changed: boolean;
};

export type ModActivationFailure = {
  ok: false;
  code: "mod-not-found";
  message: string;
  modId: ModId;
};

export type ModActivationResult = ModActivationSuccess | ModActivationFailure;

export type ModManagerOptions = {
  registry: ModManagerRegistryAdapter;
  resolveContext: ModManagerContextResolver;
  stateAdapter: ModManagerStateAdapter;
};

export type RuntimeModManagerAdapters = Pick<
  ModManagerOptions,
  "resolveContext" | "stateAdapter"
>;

export type RuntimeModRegistrationEntry = {
  modId: ModId;
  result: ModRegistryRegisterResult;
};

type OrderedContribution = {
  id: string;
  order?: number;
};

type ContributionEntry<TContribution extends OrderedContribution> = {
  modId: ModId;
  modPriority: number;
  contribution: TContribution;
};

const FALLBACK_ORDER = Number.MAX_SAFE_INTEGER;

const normalizeOrder = (order: number | undefined): number =>
  typeof order === "number" && Number.isFinite(order) ? order : FALLBACK_ORDER;

const compareStringIds = (left: string, right: string): number => {
  if (left < right) return -1;
  if (left > right) return 1;
  return 0;
};

const compareContributionEntries = <TContribution extends OrderedContribution>(
  left: ContributionEntry<TContribution>,
  right: ContributionEntry<TContribution>
): number => {
  const orderDelta =
    normalizeOrder(left.contribution.order) -
    normalizeOrder(right.contribution.order);
  if (orderDelta !== 0) return orderDelta;

  const priorityDelta = right.modPriority - left.modPriority;
  if (priorityDelta !== 0) return priorityDelta;

  const modIdDelta = compareStringIds(left.modId, right.modId);
  if (modIdDelta !== 0) return modIdDelta;

  return compareStringIds(left.contribution.id, right.contribution.id);
};

export class ModManager {
  private readonly registry: ModManagerRegistryAdapter;
  private readonly resolveContext: ModManagerContextResolver;
  private readonly stateAdapter: ModManagerStateAdapter;

  constructor(options: ModManagerOptions) {
    this.registry = options.registry;
    this.resolveContext = options.resolveContext;
    this.stateAdapter = options.stateAdapter;
  }

  getActiveModId(): ModId | null {
    return this.stateAdapter.getActiveModId();
  }

  getActiveMod(): ModDefinition | null {
    const activeModId = this.getActiveModId();
    if (!activeModId) return null;
    return this.registry.resolve(activeModId);
  }

  async activate(route: ModActivationRoute): Promise<ModActivationResult> {
    const nextMod = this.registry.resolve(route.modId);
    if (!nextMod) {
      return {
        ok: false,
        code: "mod-not-found",
        message: `mod '${route.modId}' is not registered.`,
        modId: route.modId,
      };
    }

    const previousModId = this.getActiveModId();
    const previousMod = previousModId ? this.registry.resolve(previousModId) : null;

    if (previousMod && previousMod.meta.id === nextMod.meta.id) {
      return {
        ok: true,
        activeModId: nextMod.meta.id,
        previousModId,
        changed: false,
      };
    }

    if (previousMod?.onExit) {
      await previousMod.onExit(this.resolveContext(previousMod.meta.id));
    }

    if (nextMod.onEnter) {
      await nextMod.onEnter(this.resolveContext(nextMod.meta.id));
    }

    this.stateAdapter.setActiveModId(nextMod.meta.id);

    return {
      ok: true,
      activeModId: nextMod.meta.id,
      previousModId,
      changed: previousModId !== nextMod.meta.id,
    };
  }

  routePointer(event: NormalizedPointerEvent): ModInputHandleResult {
    const activeMod = this.getActiveMod();
    if (!activeMod?.onPointer) return "pass";
    return activeMod.onPointer(event, this.resolveContext(activeMod.meta.id));
  }

  routeKey(event: NormalizedKeyEvent): ModInputHandleResult {
    const activeMod = this.getActiveMod();
    if (!activeMod?.onKey) return "pass";
    return activeMod.onKey(event, this.resolveContext(activeMod.meta.id));
  }

  routeWheel(event: NormalizedWheelGestureEvent): ModInputHandleResult {
    const activeMod = this.getActiveMod();
    if (!activeMod?.onWheelGesture) return "pass";
    return activeMod.onWheelGesture(event, this.resolveContext(activeMod.meta.id));
  }

  listToolbarContributions(): ModToolbarItem[] {
    return this.listActiveContributions((activeMod, context) =>
      activeMod.getToolbarItems?.(context)
    );
  }

  listPanelContributions(): ModPanelContribution[] {
    return this.listActiveContributions((activeMod, context) =>
      activeMod.getPanels?.(context)
    );
  }

  private listActiveContributions<TContribution extends OrderedContribution>(
    selector: (
      activeMod: ModDefinition,
      context: ModContext
    ) => TContribution[] | undefined
  ): TContribution[] {
    const activeMod = this.getActiveMod();
    if (!activeMod) return [];

    const context = this.resolveContext(activeMod.meta.id);
    const contributions = selector(activeMod, context) ?? [];

    return contributions
      .map((contribution) => ({
        modId: activeMod.meta.id,
        modPriority: activeMod.meta.priority,
        contribution,
      }))
      .sort(compareContributionEntries)
      .map((entry) => entry.contribution);
  }
}

export type ModManagerInputRouter = Pick<
  ModManager,
  "routePointer" | "routeKey" | "routeWheel"
>;

export const createModManager = (options: ModManagerOptions): ModManager =>
  new ModManager(options);

const createMemoryStateAdapter = (): ModManagerStateAdapter => {
  let activeModId: ModId | null = null;
  return {
    getActiveModId: () => activeModId,
    setActiveModId: (modId) => {
      activeModId = modId;
    },
  };
};

const createNoopContext = (modId: ModId): ModContext => ({
  modId,
  dispatchCommand: async () => undefined,
  query: {
    activeTool: () => "pen",
    playbackStep: () => ({ current: 0, total: 0 }),
    role: () => "host",
  },
  publishNotice: () => undefined,
});

const createDefaultRuntimeAdapters = (): RuntimeModManagerAdapters => ({
  resolveContext: createNoopContext,
  stateAdapter: createMemoryStateAdapter(),
});

const compareDefinitionIds = (
  left: ModDefinition,
  right: ModDefinition
): number => compareStringIds(left.meta.id, right.meta.id);

let runtimeRegistrySingleton: ModRegistry | null = null;
let runtimeManagerSingleton: ModManager | null = null;
let runtimeManagerAdapters: RuntimeModManagerAdapters =
  createDefaultRuntimeAdapters();

const ensureRuntimeRegistry = (): ModRegistry => {
  if (!runtimeRegistrySingleton) {
    runtimeRegistrySingleton = new ModRegistry();
  }
  return runtimeRegistrySingleton;
};

const ensureRuntimeManager = (): ModManager => {
  if (!runtimeManagerSingleton) {
    runtimeManagerSingleton = createModManager({
      registry: ensureRuntimeRegistry(),
      resolveContext: runtimeManagerAdapters.resolveContext,
      stateAdapter: runtimeManagerAdapters.stateAdapter,
    });
  }
  return runtimeManagerSingleton;
};

export const getRuntimeModRegistry = (): ModRegistry => ensureRuntimeRegistry();

export const getRuntimeModManager = (): ModManager => ensureRuntimeManager();

export const configureRuntimeModManager = (
  adapters: RuntimeModManagerAdapters
): ModManager => {
  runtimeManagerAdapters = adapters;
  runtimeManagerSingleton = createModManager({
    registry: ensureRuntimeRegistry(),
    resolveContext: adapters.resolveContext,
    stateAdapter: adapters.stateAdapter,
  });
  return runtimeManagerSingleton;
};

export const registerRuntimeMod = (
  definition: ModDefinition
): ModRegistryRegisterResult => ensureRuntimeRegistry().register(definition);

export const registerRuntimeMods = (
  definitions: readonly ModDefinition[]
): RuntimeModRegistrationEntry[] => {
  const registry = ensureRuntimeRegistry();
  const orderedDefinitions = [...definitions].sort(compareDefinitionIds);
  return orderedDefinitions.map((definition) => ({
    modId: definition.meta.id,
    result: registry.register(definition),
  }));
};

export const activateRuntimeMod = async (
  route: ModActivationRoute
): Promise<ModActivationResult> => ensureRuntimeManager().activate(route);

export const resetRuntimeModHost = (): void => {
  runtimeRegistrySingleton = null;
  runtimeManagerSingleton = null;
  runtimeManagerAdapters = createDefaultRuntimeAdapters();
};
