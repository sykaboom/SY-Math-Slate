# Task 027: Extension Registry & External API Hooks (Scaffold Only)

**Status:** COMPLETED  
**Priority:** MEDIUM  
**Assignee:** Codex CLI  
**Dependencies:** Task 023 (capability profiles), Task 024 (layered structure)

## Context
We want the app to stay easy for most users while enabling power users to extend it (custom exporters, widgets, LLM hooks). This task lays down **interfaces and registry scaffolding only**, without executing third‑party code.

## Goals
1) Define a **core extension manifest type** with permissions, triggers, and UI placement metadata.  
2) Create a **registry API** to register/resolve extensions.  
3) Add a **connector interface** for external APIs (LLM/TTS/localhost), without implementation.  
4) Keep everything **inactive by default** (no UI exposure yet).

## Non-goals
- No network calls.
- No plugin execution.
- No new dependencies.
- No UI changes.

## Scope (touched files)
- `v10/src/core/extensions/manifest.ts` (new)
- `v10/src/core/extensions/registry.ts` (new)
- `v10/src/core/extensions/connectors.ts` (new)

## Requirements
### 1) Manifest
Provide a `Manifest` type with:
- `id`, `name`, `version`
- `type`: `"exporter" | "widget" | "connector"`
- `permissions`: list of allowed capability scopes (string, e.g., `canvas:read`)
- `triggers?`: list of trigger names (e.g., `onStepStart`, `onExport`)
- `ui?`: list of UI surfaces (e.g., `panel`, `toolbar`, `menu`)
- `entry?`: string (future use)
- `description?`: string

### 2) Registry
Provide a small registry with:
- `registerExtension(manifest)`
- `listExtensions()`
- `getExtensionsByType(type)`
- **No dynamic loading**

### 3) Connector Interface
Define an interface for external API connectors:
- `name`
- `supports`: `{ tts?: boolean; llm?: boolean; export?: boolean }`
- `invoke(request): Promise<response>`

## Acceptance Criteria
1) Extension types and registry compile without usage.  
2) No runtime side effects.  
3) No UI changes introduced.

## Manual Verification
1) Build/run still works.  
2) Registry module can be imported without errors.

## Closeout Notes
- Manifest now includes permissions, triggers, and UI placements.
- Registry and connectors are scaffold-only with no side effects.
