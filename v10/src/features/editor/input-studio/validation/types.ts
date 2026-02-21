import type { StepBlockDraft } from "@features/chrome/layout/dataInput/types";

export type BatchTransformDiagnosticLevel = "error" | "warning" | "info";

export type BatchTransformDiagnosticPhase =
  | "pipeline"
  | "input-validation"
  | "transform-execution"
  | "output-validation"
  | "determinism";

export type BatchTransformDiagnostic = {
  level: BatchTransformDiagnosticLevel;
  phase: BatchTransformDiagnosticPhase;
  code: string;
  message: string;
  path: string;
  stepIndex?: number;
  stepId?: string;
};

export type BatchTransformStep = {
  id: string;
  description?: string;
  transform: (blocks: StepBlockDraft[]) => unknown;
  deterministicReplay?: boolean;
};

export type BatchTransformPipelineOptions = {
  initialBlocks: unknown;
  steps: BatchTransformStep[];
  stopOnError?: boolean;
  enforceDeterminism?: boolean;
};

export type BatchTransformStepResult = {
  stepIndex: number;
  stepId: string;
  ok: boolean;
  beforeBlockCount: number;
  afterBlockCount: number;
  blocks: StepBlockDraft[] | null;
  diagnostics: BatchTransformDiagnostic[];
};

export type BatchTransformPipelineResult = {
  ok: boolean;
  blocks: StepBlockDraft[];
  diagnostics: BatchTransformDiagnostic[];
  stepResults: BatchTransformStepResult[];
};
