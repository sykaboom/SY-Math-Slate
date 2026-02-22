import type { ModId } from "@core/runtime/modding/api";

import type { ModPackageJsonObject } from "./json";

export type ModPackageCommandOperation = "upsert" | "remove";

export type ModPackageCommandRule = {
  commandId: string;
  operation?: ModPackageCommandOperation;
  overrideAllowed?: boolean;
};

export type ModPackageShortcutOperation = "upsert" | "remove";

export type ModPackageShortcutRule = {
  shortcut: string;
  commandId: string;
  when?: string;
  operation?: ModPackageShortcutOperation;
};

export type ModPackageInputBehaviorStrategy = "exclusive" | "handled-pass-chain";

export type ModPackageInputBehaviorRule = {
  strategy: ModPackageInputBehaviorStrategy;
  modId?: ModId;
  chain?: readonly ModId[];
};

export type ModPackageResourcePolicy = {
  policyPatch?: ModPackageJsonObject;
  commands?: readonly ModPackageCommandRule[];
  shortcuts?: readonly ModPackageShortcutRule[];
  inputBehavior?: ModPackageInputBehaviorRule;
};
