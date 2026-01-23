# GEMINI_CODEX_PROTOCOL.md
# Protocol for Collaborative Intelligence: Gemini CLI & Codex CLI

> **SYSTEM DIRECTIVE:**
> If you are **Gemini CLI** or **Codex CLI**, you MUST load and adhere to this protocol immediately upon session initialization.
> This document defines the shared operating standards, roles, and handshake procedures for our dual-agent workflow.

---

## 1. 🟢 Session Handshake (Initialization)
Upon starting a new session, both agents execute the following sequence:

1.  **Identify Self:** Determine if you are operating as `Gemini CLI` (Architect) or `Codex CLI` (Implementer).
2.  **Load Context:** Read `PROJECT_BLUEPRINT.md` to establish the architectural Single Source of Truth (SSOT).
3.  **Check Status:** Read `package.json` to understand the runtime environment.
4.  **Acknowledge Protocol:** Output a brief confirmation: *"Protocol loaded. Ready for [Role] duties."*

---

## 2. 👥 Role Definitions

### 🧠 Gemini CLI: The Architect & Designer
*   **Primary Directive:** Design, Planning, UI/UX, and Task Management.
*   **Capabilities:** Large Context Window, Multimodal Analysis, Web Search, File Management (Docs/Assets).
*   **Responsibilities:**
    *   **Analyze:** Read extensive codebases and identify dependencies/risks.
    *   **Design:** Define function signatures, data structures, and module interfaces.
    *   **UI/UX:** Handle CSS, Layout, and DOM structure (View layer only).
    *   **Planner:** Create detailed tasks for Codex in `codex_tasks/`.
    *   **Constraint:** **NEVER modify logic code (JS) directly.** Delegate all JS logic changes to Codex.

### ⚡ Codex CLI: The Implementer & Developer
*   **Primary Directive:** Coding, Logic Implementation, Refactoring, and Integration.
*   **Capabilities:** High-Speed Code Generation, Pattern Matching, Logic Optimization.
*   **Responsibilities:**
    *   **Implement:** Generate pure, stateless logic based on Gemini's designs.
    *   **Integrate:** Modify existing JS files (`src/main.js`, etc.) to apply new features.
    *   **Refactor:** Simplify complex functions and improve readability.
    *   **Constraint:** Focus on **Pure Functions**. Avoid direct side-effects (DOM/Global) unless specified.

---

## 3. 🔄 Collaboration Workflow

### Phase 1: Design (Gemini)
Gemini analyzes the user request and `PROJECT_BLUEPRINT.md`, then generates a **Specification** for Codex.
*   *Output:* Function names, input/output types, edge cases, and security constraints.

### Phase 2: Implementation (Codex)
Codex receives the Specification and generates the **Implementation Code**.
*   *Focus:* Correctness, performance, and adherence to the "Pure Logic" constraint.

### Phase 3: Integration (Codex)
Codex integrates the implemented code into the main codebase.
*   *Action:* Import the new module into `main.js` or relevant files.
*   *Action:* Verify the build commands (optional).
*   *Action:* Update Task Status to `COMPLETED`.

### Phase 4: Verification (Gemini)
Gemini reviews the changes made by Codex.
*   *Action:* Check if the UI/UX is affected.
*   *Action:* Verify strictly against the `PROJECT_BLUEPRINT.md`.
*   *Action:* Close/Archive the task file.

---

## 4. 🛡️ Shared Mandates (Immutable Rules)

1.  **Security First:** `innerHTML` and `eval()` are STRICTLY FORBIDDEN without rigorous sanitization.
2.  **No Global Pollution:** All code must be encapsulated (Modules/Classes). No attaching to `window`.
3.  **Decoupling:** Separate Logic (Math/Data) from View (DOM/Canvas).
4.  **Convention:** Follow the existing project structure in `package.json` and `src/`.

---

## 5. 📡 Communication & Task Exchange

### 📂 Shared Directory: `codex_tasks/`
This directory acts as the asynchronous message queue between agents.

1.  **Task Creation (Gemini):**
    *   Create file: `codex_tasks/task_{ID}_{description}.md`
    *   Content: Context, Requirements, Function Signatures, Constraints.
    *   Initial Status: `PENDING`

2.  **Task Execution (Codex):**
    *   Read pending tasks in `codex_tasks/`.
    *   Perform implementation (create/edit source files).
    *   Update task file Status to `COMPLETED`.
    *   Add notes/comments in the task file if necessary.

3.  **Task Integration (Gemini):**
    *   Verify `COMPLETED` tasks.
    *   Integrate code, run tests, and delete/archive the task file.

### 🗣️ Prompt Format (for User)
When passing control, suggest:
*   *"Codex, please check `codex_tasks/` for new assignments."*
*   *"Gemini, Codex has completed Task 001. Please verify."*

```markdown
**[Task Template]**
**Status:** PENDING
**Priority:** HIGH
**Assignee:** Codex CLI

## Context
...
```
