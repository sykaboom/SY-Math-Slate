"use client";

import { useState, type ChangeEvent } from "react";
import type { StepBlockDraft } from "@features/chrome/layout/dataInput/types";
import {
  parseStructuredContentSchemaJson,
  type StructuredContentValidationResult,
} from "./structuredContentSchema";

export type StructuredSchemaEditorProps = {
  className?: string;
  disabled?: boolean;
  jsonText?: string;
  initialJsonText?: string;
  validateOnChange?: boolean;
  onJsonTextChange?: (value: string) => void;
  onValidationResult?: (result: StructuredContentValidationResult) => void;
  onValidBlocks: (blocks: StepBlockDraft[]) => void;
};

const DEFAULT_JSON_TEXT = "[]";

const renderStatusText = (
  result: StructuredContentValidationResult | null
): string => {
  if (!result) {
    return "Enter StepBlockDraft[] JSON and validate.";
  }
  if (result.ok) {
    return `Valid schema (${result.blocks.length} blocks).`;
  }
  return `Validation failed (${result.issues.length} issues).`;
};

const isErrorState = (result: StructuredContentValidationResult | null): boolean =>
  Boolean(result && !result.ok);

export function StructuredSchemaEditor({
  className,
  disabled = false,
  jsonText,
  initialJsonText = DEFAULT_JSON_TEXT,
  validateOnChange = false,
  onJsonTextChange,
  onValidationResult,
  onValidBlocks,
}: StructuredSchemaEditorProps) {
  const isControlled = jsonText !== undefined;
  const [localText, setLocalText] = useState(initialJsonText);
  const [validation, setValidation] =
    useState<StructuredContentValidationResult | null>(null);
  const resolvedText = isControlled ? jsonText : localText;

  const runValidation = (nextText: string, emitBlocks: boolean) => {
    const result = parseStructuredContentSchemaJson(nextText);
    setValidation(result);
    onValidationResult?.(result);
    if (emitBlocks && result.ok) {
      onValidBlocks(result.blocks);
    }
  };

  const writeJsonText = (nextText: string) => {
    if (!isControlled) {
      setLocalText(nextText);
    }
    onJsonTextChange?.(nextText);
    if (validateOnChange) {
      runValidation(nextText, false);
    }
  };

  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    writeJsonText(event.target.value);
  };

  const handleValidate = () => {
    runValidation(resolvedText, false);
  };

  const handleApply = () => {
    runValidation(resolvedText, true);
  };

  return (
    <section className={className}>
      <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.08em] text-[var(--theme-text-subtle)]">
        Structured Content Schema (StepBlockDraft[])
      </label>
      <textarea
        className="h-56 w-full resize-y rounded-md border border-[var(--theme-border)] bg-[var(--theme-surface-soft)] p-3 font-mono text-xs leading-5 text-[var(--theme-text)] focus:border-[var(--theme-accent)] focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
        spellCheck={false}
        value={resolvedText}
        onChange={handleChange}
        disabled={disabled}
        aria-label="Structured content JSON schema editor"
      />

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          className="rounded-md border border-[var(--theme-border)] px-3 py-1 text-xs text-[var(--theme-text)] transition-colors hover:border-[var(--theme-accent)] disabled:cursor-not-allowed disabled:opacity-60"
          disabled={disabled}
          onClick={handleValidate}
        >
          Validate
        </button>
        <button
          type="button"
          className="rounded-md border border-[var(--theme-accent)] bg-[var(--theme-accent)]/10 px-3 py-1 text-xs text-[var(--theme-text)] transition-colors hover:bg-[var(--theme-accent)]/20 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={disabled}
          onClick={handleApply}
        >
          Apply Valid Blocks
        </button>
      </div>

      <p
        className={`mt-3 text-xs ${
          isErrorState(validation)
            ? "text-[var(--theme-danger)]"
            : "text-[var(--theme-text-subtle)]"
        }`}
      >
        {renderStatusText(validation)}
      </p>

      {validation && !validation.ok ? (
        <ul className="mt-2 max-h-44 space-y-1 overflow-auto rounded-md border border-[var(--theme-danger)]/35 bg-[var(--theme-danger-soft)] p-2 text-xs text-[var(--theme-text)]">
          {validation.issues.map((issue, index) => (
            <li key={`${issue.code}:${issue.path}:${index}`}>
              <code>{issue.path}</code>: {issue.message} ({issue.code})
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
