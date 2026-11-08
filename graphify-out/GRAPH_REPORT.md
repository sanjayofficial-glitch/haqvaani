# Graph Report - haqvaani  (2026-11-08)

## Corpus Check
- 167 files · ~137,046 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 14 file(s) not represented in the graph (top: (none) 6, .css 5, .zst 1)

## Summary
- 1103 nodes · 2775 edges · 44 communities (39 shown, 5 thin omitted)
- Extraction: 94% EXTRACTED · 6% INFERRED · 0% AMBIGUOUS · INFERRED: 172 edges (avg confidence: 0.88)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Engineer A · Voice/DSP & QA
- Reference UI (TS) · Acts & Shell
- Reference UI (TS) · Scenes & Art
- Core Docs: Thesis & Hard Rules
- Agent Prompts & Engineer Roles
- Ported Paper Landing · Acts (JSX)
- Legacy Frontend Screens
- Evon LLM Client (Parse/Negotiation)
- FastAPI Backend Routes
- Toolchain · reference package.json
- Toolchain · reference (dup)
- Web Dependencies & Perf Layer
- Orchestrator · 4-Mode Pipeline
- Safety & Redaction Gates
- Change Log & Compliance Timeline
- Statutory Engine (RBI Math)
- DSP & VAD Pipeline
- Capture Hook (useCapture)
- Demo Data, Stamps & OCR
- Legacy JS Runtime (HQ Router)
- AppShell & Safety Bar
- Live E2E Harness
- tsconfig · reference
- tsconfig · reference (dup)
- App Routing & Landing Logic
- Speech Protocol Internals
- STT Client (Prisma v2.5)
- TTS Client (Timbre SSE)
- Landing Data & ReducedMotion
- DisputeArt (reference SVG)
- Reference Vite Config
- SVG Line-Art Library
- Sliding-Window Redaction
- Eval Benchmark (STT WER)
- Client Availability Wrappers
- Legacy Scroll-Rail JS
- Synthetic IVR Scripts
- Assisted Call Screen
- State Provider & WorksExample
- FactReview Screen
- Package Root Node

## God Nodes (most connected - your core abstractions)
1. `compute_statutory_entitlement()` - 31 edges
2. `CitizenIntake` - 30 edges
3. `DisputeType` - 27 edges
4. `SafetyGuardBlock` - 25 edges
5. `useCaseFile()` - 24 edges
6. `useMode()` - 22 edges
7. `useCaseState()` - 22 edges
8. `HaqVaani Story landing` - 22 edges
9. `navigate()` - 21 edges
10. `Glass UI citizen app (single-page 4-mode prototype)` - 21 edges

## Surprising Connections (you probably didn't know these)
- `docs/system_diagrams.md (Mermaid)` --references--> `SafetyGuardBlock`  [EXTRACTED]
  docs/system_diagrams.md → haqvaani/safety.py
- `RULES.md (non-negotiable constraints)` --references--> `SafetyGuardBlock`  [EXTRACTED]
  RULES.md → haqvaani/safety.py
- `docs/system_diagrams.md (Mermaid)` --references--> `compute_statutory_entitlement()`  [EXTRACTED]
  docs/system_diagrams.md → haqvaani/statutory.py
- `RULES.md (non-negotiable constraints)` --references--> `compute_statutory_entitlement()`  [EXTRACTED]
  RULES.md → haqvaani/statutory.py
- `Sloplint UI Audit Gate` --semantically_similar_to--> `30-Clip Prisma vs Whisper Benchmark`  [INFERRED] [semantically similar]
  .hallmark/landing-render.txt → docs/evaluation.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Four-Mode Pipeline Definition Group** — architecture_four_mode_pipeline, docs_frd_functional_requirements, docs_prd_product_requirements, readme_project_overview [EXTRACTED 0.90]
- **Safety Gate Quartet (Consent, Disclosure, Redaction, Docket)** — architecture_forbidden_secret_re, docs_experience_concept_consentgate, docs_experience_concept_docketverification, docs_diagrams_viewer_safety_gates [EXTRACTED 0.85]
- **Mandatory Safety Gate Set** — haqvaani_safety_forbidden_secret_re, haqvaani_safety_citizen_consent_verified, haqvaani_safety_ai_disclosure_played, haqvaani_safety_verbatim_substring_gate, haqvaani_safety_safetyguardblock [EXTRACTED 1.00]
- **Gnani Sovereign Stack Composition** — gnani_sovereign_stack, gnani_prisma_v2_5, gnani_evon_v3_3, gnani_timbre_v2_5_v3_0 [EXTRACTED 1.00]
- **Design System Lineage (Revolut Foundation → Concept → DESIGN)** — docs_design_revolut_revolut_fintech_analysis, docs_experience_concept_experience_concept, docs_design_haqvaani_story_design_system, docs_ui_ux_design_system_superseded_design_system [INFERRED 0.75]
- **Post-VAD 690 ms Voice Intake Pipeline** — latency_budget_690ms, silero_vad, gnani_prisma_v2_5, gnani_evon_v3_3, gnani_timbre_v2_5_v3_0 [EXTRACTED 1.00]
- **4-Mode human-controlled pipeline** — frontend_glass_ui, frontend_screens_voice_intake, frontend_screens_rights_check, frontend_screens_complaint_builder, frontend_screens_assisted_call [EXTRACTED 1.00]
- **Compliance/safety guardrails** — haqvaani_dpdp_consent, haqvaani_ai_disclosure, haqvaani_secret_redaction, haqvaani_no_autonomous_dialing, haqvaani_synthetic_demo [INFERRED 0.95]
- **Gnani sovereign stack** — haqvaani_prisma, haqvaani_evon, haqvaani_timbre [INFERRED 0.95]
- **Prisma + Evon + Timbre form the Gnani sovereign stack** — changelog_prisma_stt, changelog_evon_llm, changelog_timbre_tts [EXTRACTED 1.00]
- **Consent, secret redaction and no-autonomous-dialing guardrails** — changelog_dpdp_consent_gate, changelog_forbidden_secret_re, changelog_no_autonomous_dialing [EXTRACTED 1.00]
- **Design system, React rebuild and paper-poster reference form the frontend lineage** — changelog_haqvaani_story_design_system, changelog_heron_haqvaani_rebuild, changelog_paper_poster_ui [INFERRED 0.85]

## Communities (44 total, 5 thin omitted)

### Community 0 - "Engineer A · Voice/DSP & QA"
Cohesion: 0.06
Nodes (54): Landing Render QA Log, Acoustic State Machine (RINGING/IVR/HOLD/HUMAN), Dual WSS Streams (intake + assisted call), Engineer A Role (Voice/DSP/Telephony/Latency), Timbre Role-Switch Cache, HaqVaani Project Thesis, Assisted Call Mode, Complete System Overview (all nodes) (+46 more)

### Community 1 - "Reference UI (TS) · Acts & Shell"
Cohesion: 0.11
Nodes (43): Act01(), Barrier(), Act02(), tornSheet(), Act03(), Coin(), Act04(), bez() (+35 more)

### Community 2 - "Reference UI (TS) · Scenes & Art"
Cohesion: 0.11
Nodes (43): Act01(), Barrier(), Act02(), tornSheet(), Act03(), Coin(), Act04(), bez() (+35 more)

### Community 3 - "Core Docs: Thesis & Hard Rules"
Cohesion: 0.06
Nodes (52): Duo Engineer Ownership Treaty, HaqVaani Hard Rules (non-negotiable), Assisted-Call State Machine (Mode 4), Data Flow (Key Objects), Evon v3.3 LLM (30B-A3B MoE), FORBIDDEN_SECRET_RE Redaction Gate, Four-Mode Pipeline, Module Ownership Matrix (+44 more)

### Community 4 - "Agent Prompts & Engineer Roles"
Cohesion: 0.09
Nodes (21): Engineer B Role (Statutory/Evon/Product UI), BrushOffType Taxonomy, frontend/glass_ui.html (Citizen UI), frontend/hud.html (Telemetry HUD), build_complaint_draft(), build_hindi_drafts(), _inr(), _rbi_cms_draft() (+13 more)

### Community 5 - "Ported Paper Landing · Acts (JSX)"
Cohesion: 0.15
Nodes (33): Act01(), Barrier(), Act02(), tornSheet(), Act03(), Coin(), Act04(), bez() (+25 more)

### Community 6 - "Legacy Frontend Screens"
Cohesion: 0.18
Nodes (30): Landing experience concept (archived), Glass UI citizen app (single-page 4-mode prototype), Glass UI mobile variant (clay buttons), Telemetry HUD (4-quadrant demo panel), HaqVaani Story landing, Assisted call screen (listen + docket), Call prep screen (script + never-share), Complaint builder screen (drafts + approve) (+22 more)

### Community 7 - "Evon LLM Client (Parse/Negotiation)"
Cohesion: 0.09
Nodes (11): available(), _deterministic_intake(), _deterministic_negotiation(), EvonIntakeResult, EvonNegotiationResult, extract_negotiation(), _llm_chat(), parse_intake() (+3 more)

### Community 8 - "FastAPI Backend Routes"
Cohesion: 0.09
Nodes (16): assisted_route(), complaint(), ComplaintRequest, consent(), ConsentRequest, dossier(), _guard(), health() (+8 more)

### Community 9 - "Toolchain · reference package.json"
Cohesion: 0.07
Nodes (38): dependencies, clsx@2.1.1, gsap@^3.15.1, react@19.2.6, react-dom@19.2.6, tailwind-merge@3.4.0, devDependencies, tailwindcss@4.1.17 (+30 more)

### Community 10 - "Toolchain · reference (dup)"
Cohesion: 0.07
Nodes (38): dependencies, clsx@2.1.1, gsap@^3.15.1, react@19.2.6, react-dom@19.2.6, tailwind-merge@3.4.0, devDependencies, tailwindcss@4.1.17 (+30 more)

### Community 11 - "Web Dependencies & Perf Layer"
Cohesion: 0.07
Nodes (35): framer-motion, lenis, tesseract.js, allowScripts, esbuild@0.21.5, tesseract.js@7.0.0, dependencies, framer-motion@^11.15.0 (+27 more)

### Community 12 - "Orchestrator · 4-Mode Pipeline"
Cohesion: 0.12
Nodes (12): run_assisted(), run_complaint(), run_full_case(), run_rights(), _self_test(), HaqVaaniCaseRecord, VoiceAPI, test_assisted_verifies_verbatim() (+4 more)

### Community 13 - "Safety & Redaction Gates"
Cohesion: 0.13
Nodes (16): assert_no_forbidden_secret(), contains_forbidden_secret(), disclosure_line(), grant_consent(), require_consent(), SafetyGuardBlock, verify_verbatim_substring(), ConsentRecord (+8 more)

### Community 14 - "Change Log & Compliance Timeline"
Cohesion: 0.08
Nodes (31): Assisted Call Mode — 4-mode pipeline, Simulated 60s Demo Day Drop video, CHANGELOG.md — HaqVaani change log, DPDP Act 2023 consent gate (timestamped + AI disclosure), Gnani Evon v3.3 LLM (30B-A3B MoE), FORBIDDEN_SECRET_RE — outbound secret redaction, Gnani sovereign stack (Prisma + Evon + Timbre), Great Indian AI Internship Challenge by Gnani AI (deadline 10 Nov 2026) (+23 more)

### Community 15 - "Statutory Engine (RBI Math)"
Cohesion: 0.12
Nodes (14): DisputeType, compute_statutory_entitlement(), _failed_txn_entitlement(), _self_test(), test_full_demo_case_including_dossier(), test_atm_t_plus_5(), test_future_txn_rejected(), test_no_delay_no_penalty() (+6 more)

### Community 16 - "DSP & VAD Pipeline"
Cohesion: 0.11
Nodes (7): _fir_lowpass(), _load_silero_vad(), preprocess_intake(), resample_8k_to_16k(), RingBuffer, segment_audio(), vad_segments()

### Community 17 - "Capture Hook (useCapture)"
Cohesion: 0.14
Nodes (10): useCapture(), ModeCtx, ModeProvider(), ToastCtx, ToastProvider(), api, detectMode(), headersJson() (+2 more)

### Community 18 - "Demo Data, Stamps & OCR"
Cohesion: 0.19
Nodes (16): Stamp(), AI_DISCLOSURE, BRUSH_LABELS, DEMO, EN_MONTHS, fmtDate(), fmtInr(), fmtTs() (+8 more)

### Community 19 - "Legacy JS Runtime (HQ Router)"
Cohesion: 0.14
Nodes (7): applyLang(), chipEl(), init(), HQ, safetyEl(), wireLang(), write()

### Community 20 - "AppShell & Safety Bar"
Cohesion: 0.16
Nodes (17): AppShell(), SafetyBar(), safetyRows(), STEP_LABELS, StepBar(), useMode(), LangCtx, LangToggle() (+9 more)

### Community 21 - "Live E2E Harness"
Cohesion: 0.14
Nodes (9): call(), main(), _license_of(), main(), check_screen(), fail(), need(), read() (+1 more)

### Community 22 - "tsconfig · reference"
Cohesion: 0.10
Nodes (20): compilerOptions, allowImportingTsExtensions, baseUrl, isolatedModules, jsx, lib, module, moduleResolution (+12 more)

### Community 23 - "tsconfig · reference (dup)"
Cohesion: 0.10
Nodes (20): compilerOptions, allowImportingTsExtensions, baseUrl, isolatedModules, jsx, lib, module, moduleResolution (+12 more)

### Community 24 - "App Routing & Landing Logic"
Cohesion: 0.21
Nodes (15): App(), SCREEN_MAP, Landing(), listeners, navigate(), parseHash(), SCREENS, useRoute() (+7 more)

### Community 25 - "Speech Protocol Internals"
Cohesion: 0.15
Nodes (12): build_headers(), _pcm_frames(), build_audio_config(), default_voice(), test_audio_config_defaults_raw_pcm(), test_default_voice_en_is_kaveri(), test_default_voice_hi_is_nalini(), test_default_voice_hinglish_is_poorvi() (+4 more)

### Community 26 - "STT Client (Prisma v2.5)"
Cohesion: 0.16
Nodes (7): _as_pcm_bytes(), _frame_seconds(), STTResult, transcribe_wss(), _run(), test_stt_result_dataclass(), test_transcribe_wss_pipeline_fails_cleanly_offline()

### Community 27 - "TTS Client (Timbre SSE)"
Cohesion: 0.16
Nodes (6): assemble_wav(), synthesize_sse(), TTSAPIError, TTSResult, test_assemble_wav_has_valid_header(), test_tts_result_roundtrip_b64()

### Community 28 - "Landing Data & ReducedMotion"
Cohesion: 0.29
Nodes (10): useReducedMotion(), demoScenario(), estimateScenario(), makeScenario(), PER_DAY, scenarioFromEntitlement(), TAT_DAYS, utrDisplay() (+2 more)

### Community 29 - "DisputeArt (reference SVG)"
Cohesion: 0.30
Nodes (12): AtmArt(), base, Cross(), FraudArt(), INK, Note(), ORG, Person() (+4 more)

### Community 30 - "Reference Vite Config"
Cohesion: 0.23
Nodes (4): __dirname, __filename, __dirname, __filename

### Community 31 - "SVG Line-Art Library"
Cohesion: 0.22
Nodes (5): STROKE, WhisperArt(), useSpeak(), useToast(), CallPrep()

### Community 32 - "Sliding-Window Redaction"
Cohesion: 0.23
Nodes (9): SECRET_RE, RollingRedactor, VoiceIntake(), demoPlayback(), finish(), handleBlob(), onFile(), onMic() (+1 more)

### Community 33 - "Eval Benchmark (STT WER)"
Cohesion: 0.24
Nodes (4): run_benchmark(), _synth_clip(), _wer(), _write_wav()

### Community 34 - "Client Availability Wrappers"
Cohesion: 0.25
Nodes (3): available(), available(), main()

### Community 35 - "Legacy Scroll-Rail JS"
Cohesion: 0.36
Nodes (8): buildRail(), init(), initLoopPause(), initScrollRail(), onScroll(), update(), initStepBar(), reducedMotion()

### Community 37 - "Assisted Call Screen"
Cohesion: 0.39
Nodes (6): substringVerify(), AssistedCall(), demoAssisted(), processBlob(), saveCall(), useText()

### Community 38 - "State Provider & WorksExample"
Cohesion: 0.39
Nodes (6): useWorksExample(), CaseStateProvider(), read(), StateCtx, useCaseState(), write()

### Community 40 - "FactReview Screen"
Cohesion: 0.40
Nodes (4): isoToday(), FactReview(), editedBeyondDemo(), goRights()

## Ambiguous Edges - Review These
- `Root index.html (Vite entry, paper-poster fonts)` → `web/ — Heron × HaqVaani Vite + React 18 rebuild`  [AMBIGUOUS]
  index.html · relation: conceptually_related_to

## Knowledge Gaps
- **43 isolated node(s):** `haqvaani`, `Sloplint Landing Render Audit Record (before)`, `frontend/landing.html`, `frontend/css/app.css`, `frontend/css/tokens.css` (+38 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 353 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **5 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `CitizenIntake` connect `Agent Prompts & Engineer Roles` to `FastAPI Backend Routes`, `Orchestrator · 4-Mode Pipeline`, `Evon LLM Client (Parse/Negotiation)`?**
  _High betweenness centrality (0.013) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `compute_statutory_entitlement()` (e.g. with `DisputeType` and `StatutoryEntitlement`) actually correct?**
  _`compute_statutory_entitlement()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `haqvaani`, `Sloplint Landing Render Audit Record (before)`, `frontend/landing.html` to the rest of the system?**
  _43 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Engineer A · Voice/DSP & QA` be split into smaller, more focused modules?**
  _Cohesion score 0.06116700201207243 - nodes in this community are weakly interconnected._
- **Why does `DisputeType` connect `Statutory Engine (RBI Math)` to `Agent Prompts & Engineer Roles`, `Orchestrator · 4-Mode Pipeline`, `Legacy Frontend Screens`, `Evon LLM Client (Parse/Negotiation)`?**
  _High betweenness centrality (0.012) - this node is a cross-community bridge._
- **Are the 15 inferred relationships involving `CitizenIntake` (e.g. with `assisted_route()` and `ComplaintRequest`) actually correct?**
  _`CitizenIntake` has 15 INFERRED edges - model-reasoned connections that need verification._

### Low-confidence Hints
_AMBIGUOUS edges — the extractor was unsure. Verify before acting on these._

- **What is the exact relationship between `Root index.html (Vite entry, paper-poster fonts)` and `web/ — Heron × HaqVaani Vite + React 18 rebuild`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._