# Roadmap: 70 Specs for v10 (Local AI Mesh Included)

Date: 2026-02-15  
Range: `task_161` ~ `task_230` (70 specs)  
Execution model: DAG + parallel waves (max 6 concurrent slots)

## Purpose
This roadmap operationalizes the expanded plan (`option 2`) into a 70-spec sequence that keeps architecture quality as a hard constraint while expanding toward:
- hybrid authoring (`docx-grade desktop` + `tablet-first note/ink UX`),
- `Input Studio` for structured/LLM-assisted authoring,
- multimodal AI fabric (`LLM + image + video + audio`),
- local AI mesh readiness for future lightweight on-device/high-end local models.

## Non-Negotiable Invariants
1. Modularization first: no monolithic growth, no cross-layer shortcuts.
2. Command-only mutation path for state writes.
3. No spaghetti architecture: enforce explicit boundaries and DAG execution gates.
4. Optimized coding default: measure and gate perf/regression continuously.
5. Structural elegance standard: deterministic, composable, contract-driven modules.
6. No unsafe runtime patterns (`eval`, `new Function`, arbitrary script injection).

## DAG Backbone
1. `W0 -> W1 -> W2 -> W3 -> W4 -> W5`
2. `W2 + W3 -> W6`
3. `W5 + W6 -> W7`
4. `W7 -> W8 -> W9`
5. `W8 + W9 -> W10`

## Wave Summary
| Wave | Task Range | Count | Core Objective | Entry Gate | Exit Gate |
|---|---|---:|---|---|---|
| W0 | 161~166 | 6 | Governance + baseline gates | none | quality gates active |
| W1 | 167~174 | 8 | Theme/token full decoupling | W0 complete | hardcoded-style passes + visual gate |
| W2 | 175~182 | 8 | Editor core uplift (docx-grade) | W1 complete | commandized editing core stable |
| W3 | 183~190 | 8 | DataInput -> Input Studio | W2 complete | draft/diff/approve/publish flow stable |
| W4 | 191~198 | 8 | Multimodal AI fabric | W3 complete | adapter ABI + router + observability |
| W5 | 199~206 | 8 | Local AI mesh bridge | W4 complete | local/cloud fallback + sandbox gate |
| W6 | 207~212 | 6 | Tablet/mobile-first UX | W2+W3 complete | touch/stylus/perf/offline gate |
| W7 | 213~218 | 6 | Collaboration + platform core | W5+W6 complete | internet realtime + moderation base |
| W8 | 219~223 | 5 | Safety/ads/ops productionization | W7 complete | trust/safety + ad-policy gate |
| W9 | 224~227 | 4 | Release hardening + purge | W8 complete | RC signoff and recovery readiness |
| W10 | 228~230 | 3 | Growth SDK + ecosystem prep | W8+W9 complete | extension-market readiness |

## Task Catalog (70)
Canonical machine-readable metadata is defined in:
- `codex_tasks/workflow/roadmap_70spec_local_ai_mesh_task_matrix.csv`

### W0 — Governance and Baselines (`161~166`)
- `task_161`: Governance invariants and gate contract
- `task_162`: Hardcoding token detection gate
- `task_163`: Tablet/mobile viewport contract baseline
- `task_164`: Performance budget baseline (tablet/mobile)
- `task_165`: Command mutation trace baseline
- `task_166`: Feature flag rollout governance

### W1 — Theme/Token Decoupling (`167~174`)
- `task_167`: Theme token schema v2
- `task_168`: Global theme variable mapping completion
- `task_169`: Module-scoped theme boundaries
- `task_170`: Parchment + notebook theme preset pack
- `task_171`: Theme preset switcher and preview
- `task_172`: Hardcoded style elimination pass A
- `task_173`: Hardcoded style elimination pass B
- `task_174`: Visual regression theme gate

### W2 — Editor Core Uplift (`175~182`)
- `task_175`: Editor surface domain model v1
- `task_176`: Selection/caret engine foundation
- `task_177`: Inline rich-text edit commandization
- `task_178`: Block structure operations suite
- `task_179`: Clipboard paste normalization pipeline
- `task_180`: Undo/redo command unification
- `task_181`: Document outline/navigation map
- `task_182`: Desktop authoring shortcuts layer

### W3 — Input Studio Transition (`183~190`)
- `task_183`: DataInput panel modular decomposition
- `task_184`: DataInput headless logic hooks
- `task_185`: Structured schema editor for content
- `task_186`: LLM draft request workflow
- `task_187`: LLM diff preview/apply pipeline
- `task_188`: Approval queue integration for drafts
- `task_189`: Batch transform validation pipeline
- `task_190`: Input Studio publish/rollback

### W4 — Multimodal AI Fabric (`191~198`)
- `task_191`: Multimodal ToolResult contract v2
- `task_192`: Provider adapter ABI v1
- `task_193`: LLM provider reference adapter
- `task_194`: Image provider reference adapter
- `task_195`: Video provider reference adapter
- `task_196`: Audio provider reference adapter
- `task_197`: Capability/cost/latency router
- `task_198`: Multimodal registry observability

### W5 — Local AI Mesh (`199~206`)
- `task_199`: Local runtime handshake protocol
- `task_200`: Local Ollama adapter
- `task_201`: Local LM Studio adapter
- `task_202`: Local WebGPU/ONNX adapter
- `task_203`: Async job orchestrator v1
- `task_204`: AI output asset pipeline
- `task_205`: Local-cloud fallback chain
- `task_206`: Local AI sandbox permissions

### W6 — Tablet/Mobile First (`207~212`)
- `task_207`: Tablet layout shell rewrite
- `task_208`: Thumb-zone toolbar recomposition
- `task_209`: Pointer gesture conflict resolution
- `task_210`: Stylus palm-rejection heuristics
- `task_211`: Low-end tablet render optimization
- `task_212`: Offline-first session draft queue

### W7 — Collaboration + Platform Core (`213~218`)
- `task_213`: Internet realtime backplane
- `task_214`: Host/student role sync hardening
- `task_215`: Shared presence and laser stream
- `task_216`: Collaborative conflict-resolution policy
- `task_217`: Community core (post/comment/report)
- `task_218`: Moderation console + audit trail

### W8 — Safety/Ads/Ops (`219~223`)
- `task_219`: UGC safety filter pipeline
- `task_220`: Rights claim/takedown workflow
- `task_221`: Ad policy enforcement gates
- `task_222`: Invalid traffic detection telemetry
- `task_223`: Trust/safety SLO + oncall runbooks

### W9 — Hardening and Release (`224~227`)
- `task_224`: Chaos/recovery drills
- `task_225`: Legacy path final purge
- `task_226`: Beta release gate v2
- `task_227`: Release candidate signoff checklist

### W10 — Growth and Ecosystem (`228~230`)
- `task_228`: Modding SDK + CLI scaffold
- `task_229`: Experimentation A/B flag layer
- `task_230`: Extension marketplace readiness

## Parallelization Policy (for delegated execution)
1. Max active slots: 6
2. Default split: 5 implementers + 1 reviewer/verifier slot.
3. One-file ownership lock within each wave.
4. Blockers only interrupt active wave; otherwise finish current wave before cutover.

## Execution Guardrails
1. Any scope creep requires new task id; never mutate accepted AC silently.
2. For architecture-heavy tasks, run at least:
   - `scripts/check_layer_rules.sh`
   - `VERIFY_STAGE=mid bash scripts/run_repo_verifications.sh`
3. End-of-wave cutover tasks require:
   - `VERIFY_STAGE=end bash scripts/run_repo_verifications.sh`
4. No direct state mutation bypassing command policy layers.

## Notes
- This file is the roadmap contract.
- The CSV matrix is the orchestration source for sub-agent batching and dependency checks.
