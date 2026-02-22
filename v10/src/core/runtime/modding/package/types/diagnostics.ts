import type { ModResourceLayer } from "./loadOrder";

export type ModResourceMergeDiagnosticKind = "winner" | "loser" | "blocked";

export type ModResourceMergeDiagnosticResourceType =
  | "policy"
  | "ui-item"
  | "command"
  | "shortcut"
  | "input-behavior";

export type ModResourceMergeDiagnostic = {
  kind: ModResourceMergeDiagnosticKind;
  resourceType: ModResourceMergeDiagnosticResourceType;
  key: string;
  source: ModResourceLayer;
  againstSource?: ModResourceLayer;
  reason: string;
};
