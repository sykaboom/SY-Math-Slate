import type { StepBlockDraft } from "@features/layout/dataInput/types";
import {
  validateStructuredContentSchema,
  type StructuredContentValidationIssue,
} from "@features/input-studio/schema/structuredContentSchema";
import type {
  BatchTransformDiagnostic,
  BatchTransformPipelineOptions,
  BatchTransformPipelineResult,
  BatchTransformStepResult,
} from "./types";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const hasBlockingDiagnostic = (
  diagnostics: BatchTransformDiagnostic[]
): boolean => diagnostics.some((diagnostic) => diagnostic.level === "error");

const cloneBlocks = (blocks: StepBlockDraft[]): StepBlockDraft[] => {
  if (typeof structuredClone === "function") {
    return structuredClone(blocks) as StepBlockDraft[];
  }
  return JSON.parse(JSON.stringify(blocks)) as StepBlockDraft[];
};

const toStableValue = (value: unknown): unknown => {
  if (Array.isArray(value)) {
    return value.map((item) => toStableValue(item));
  }
  if (isRecord(value)) {
    const next: Record<string, unknown> = {};
    Object.keys(value)
      .sort()
      .forEach((key) => {
        next[key] = toStableValue(value[key]);
      });
    return next;
  }
  return value;
};

const createDiagnostic = (
  input: Omit<BatchTransformDiagnostic, "stepId" | "stepIndex"> & {
    stepId?: string;
    stepIndex?: number;
  }
): BatchTransformDiagnostic => ({
  level: input.level,
  phase: input.phase,
  code: input.code,
  message: input.message,
  path: input.path,
  ...(input.stepId !== undefined ? { stepId: input.stepId } : {}),
  ...(input.stepIndex !== undefined ? { stepIndex: input.stepIndex } : {}),
});

const mapSchemaIssue = (
  issue: StructuredContentValidationIssue,
  phase: BatchTransformDiagnostic["phase"],
  stepId?: string,
  stepIndex?: number
): BatchTransformDiagnostic =>
  createDiagnostic({
    level: "error",
    phase,
    code: issue.code,
    message: issue.message,
    path: issue.path,
    ...(stepId !== undefined ? { stepId } : {}),
    ...(stepIndex !== undefined ? { stepIndex } : {}),
  });

const isPromiseLike = (value: unknown): value is PromiseLike<unknown> =>
  isRecord(value) && typeof value.then === "function";

const toStableSnapshot = (value: StepBlockDraft[]): string =>
  JSON.stringify(toStableValue(value));

export const runBatchTransformPipeline = (
  options: BatchTransformPipelineOptions
): BatchTransformPipelineResult => {
  const diagnostics: BatchTransformDiagnostic[] = [];
  const stepResults: BatchTransformStepResult[] = [];
  const stopOnError = options.stopOnError ?? true;
  const enforceDeterminism = options.enforceDeterminism ?? true;

  const initialValidation = validateStructuredContentSchema(
    options.initialBlocks,
    "pipeline.initialBlocks"
  );
  if (!initialValidation.ok) {
    diagnostics.push(
      ...initialValidation.issues.map((issue) =>
        mapSchemaIssue(issue, "pipeline")
      )
    );
    return {
      ok: false,
      blocks: [],
      diagnostics,
      stepResults,
    };
  }

  let currentBlocks = cloneBlocks(initialValidation.blocks);
  const stepIdSet = new Set<string>();

  options.steps.forEach((step, stepIndex) => {
    if (stopOnError && hasBlockingDiagnostic(diagnostics)) {
      return;
    }

    const stepDiagnostics: BatchTransformDiagnostic[] = [];
    const rawStepId = typeof step.id === "string" ? step.id.trim() : "";
    const stepId = rawStepId || `step-${stepIndex}`;
    const stepPath = `pipeline.steps[${stepIndex}]`;
    const beforeBlockCount = currentBlocks.length;

    if (rawStepId.length === 0) {
      stepDiagnostics.push(
        createDiagnostic({
          level: "error",
          phase: "pipeline",
          code: "invalid-step-id",
          message: "step id must be a non-empty string.",
          path: `${stepPath}.id`,
          stepId,
          stepIndex,
        })
      );
    }

    if (stepIdSet.has(stepId)) {
      stepDiagnostics.push(
        createDiagnostic({
          level: "error",
          phase: "pipeline",
          code: "duplicate-step-id",
          message: `duplicate step id '${stepId}' is not allowed.`,
          path: `${stepPath}.id`,
          stepId,
          stepIndex,
        })
      );
    } else {
      stepIdSet.add(stepId);
    }

    if (typeof step.transform !== "function") {
      stepDiagnostics.push(
        createDiagnostic({
          level: "error",
          phase: "pipeline",
          code: "invalid-step-transform",
          message: "step transform must be a function.",
          path: `${stepPath}.transform`,
          stepId,
          stepIndex,
        })
      );
    }

    const inputValidation = validateStructuredContentSchema(
      currentBlocks,
      `${stepPath}.input`
    );
    if (!inputValidation.ok) {
      stepDiagnostics.push(
        ...inputValidation.issues.map((issue) =>
          mapSchemaIssue(issue, "input-validation", stepId, stepIndex)
        )
      );
    }

    const stepInputSnapshot = cloneBlocks(currentBlocks);
    let transformOutput: unknown = null;
    if (!hasBlockingDiagnostic(stepDiagnostics)) {
      try {
        transformOutput = step.transform(cloneBlocks(stepInputSnapshot));
      } catch (error) {
        const message =
          error instanceof Error && error.message.trim().length > 0
            ? error.message
            : "step transform threw an unknown error.";
        stepDiagnostics.push(
          createDiagnostic({
            level: "error",
            phase: "transform-execution",
            code: "transform-threw",
            message,
            path: stepPath,
            stepId,
            stepIndex,
          })
        );
      }
    }

    if (!hasBlockingDiagnostic(stepDiagnostics) && isPromiseLike(transformOutput)) {
      stepDiagnostics.push(
        createDiagnostic({
          level: "error",
          phase: "transform-execution",
          code: "async-transform-not-supported",
          message: "batch transform steps must be synchronous for deterministic replay.",
          path: stepPath,
          stepId,
          stepIndex,
        })
      );
    }

    let nextBlocks: StepBlockDraft[] | null = null;
    if (!hasBlockingDiagnostic(stepDiagnostics)) {
      const outputValidation = validateStructuredContentSchema(
        transformOutput,
        `${stepPath}.output`
      );
      if (!outputValidation.ok) {
        stepDiagnostics.push(
          ...outputValidation.issues.map((issue) =>
            mapSchemaIssue(issue, "output-validation", stepId, stepIndex)
          )
        );
      } else {
        nextBlocks = cloneBlocks(outputValidation.blocks);
      }
    }

    const shouldCheckDeterminism =
      !hasBlockingDiagnostic(stepDiagnostics) &&
      enforceDeterminism &&
      (step.deterministicReplay ?? true) &&
      nextBlocks !== null;

    if (shouldCheckDeterminism) {
      let replayOutput: unknown = null;
      try {
        replayOutput = step.transform(cloneBlocks(stepInputSnapshot));
      } catch (error) {
        const message =
          error instanceof Error && error.message.trim().length > 0
            ? error.message
            : "step transform threw during deterministic replay.";
        stepDiagnostics.push(
          createDiagnostic({
            level: "error",
            phase: "determinism",
            code: "determinism-replay-threw",
            message,
            path: stepPath,
            stepId,
            stepIndex,
          })
        );
      }

      if (!hasBlockingDiagnostic(stepDiagnostics) && isPromiseLike(replayOutput)) {
        stepDiagnostics.push(
          createDiagnostic({
            level: "error",
            phase: "determinism",
            code: "determinism-replay-async",
            message: "determinism replay returned a Promise; steps must be synchronous.",
            path: stepPath,
            stepId,
            stepIndex,
          })
        );
      }

      if (!hasBlockingDiagnostic(stepDiagnostics)) {
        const replayValidation = validateStructuredContentSchema(
          replayOutput,
          `${stepPath}.replayOutput`
        );
        if (!replayValidation.ok) {
          stepDiagnostics.push(
            ...replayValidation.issues.map((issue) =>
              mapSchemaIssue(issue, "determinism", stepId, stepIndex)
            )
          );
        } else if (nextBlocks) {
          const firstSnapshot = toStableSnapshot(nextBlocks);
          const replaySnapshot = toStableSnapshot(replayValidation.blocks);
          if (firstSnapshot !== replaySnapshot) {
            stepDiagnostics.push(
              createDiagnostic({
                level: "error",
                phase: "determinism",
                code: "non-deterministic-transform",
                message:
                  "transform output differs between initial run and deterministic replay.",
                path: `${stepPath}.transform`,
                stepId,
                stepIndex,
              })
            );
          }
        }
      }
    }

    const stepOk = !hasBlockingDiagnostic(stepDiagnostics) && nextBlocks !== null;
    if (stepOk && nextBlocks) {
      currentBlocks = cloneBlocks(nextBlocks);
    }

    const stepResult: BatchTransformStepResult = {
      stepIndex,
      stepId,
      ok: stepOk,
      beforeBlockCount,
      afterBlockCount: stepOk && nextBlocks ? nextBlocks.length : beforeBlockCount,
      blocks: stepOk ? cloneBlocks(currentBlocks) : null,
      diagnostics: stepDiagnostics,
    };
    stepResults.push(stepResult);
    diagnostics.push(...stepDiagnostics);
  });

  return {
    ok: !hasBlockingDiagnostic(diagnostics),
    blocks: currentBlocks,
    diagnostics,
    stepResults,
  };
};
