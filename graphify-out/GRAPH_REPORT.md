# Graph Report - haqvaani  (2026-11-08)

## Corpus Check
- 117 files · ~112,835 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 11 file(s) not represented in the graph (top: (none) 6, .css 2, .zst 1)

## Summary
- 736 nodes · 1963 edges · 30 communities (22 shown, 8 thin omitted)
- Extraction: 91% EXTRACTED · 9% INFERRED · 0% AMBIGUOUS · INFERRED: 176 edges (avg confidence: 0.87)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- React App Shell & Routing
- Engineer A · Voice/DSP & QA
- FastAPI Backend Routes
- Core Docs: Thesis & Hard Rules
- Legacy Frontend Screens
- Frontend Toolchain & Dependencies
- Orchestrator & 4-Mode Pipeline
- Statutory Engine (RBI Math)
- SVG Line-Art Library
- Legacy JS Runtime (HQ Router)
- STT Client (Prisma v2.5)
- Speech Protocol Internals
- TTS Client (Timbre SSE)
- DSP & VAD Pipeline
- Complaint Builder (Mode 3)
- Evon LLM Client (Negotiation)
- Free-Constraint Audit Script
- Eval Benchmark (STT WER)
- Ring Buffer & Audio Streaming
- RB-IOS 2026 Dossier Module
- Shared Schemas (Treaty Border)
- Intake Parsing (Evon + Regex)
- CLI Entry & Roundtrip Verify
- Legacy Scroll-Rail JS
- API Tests
- VoiceAPI Adapters
- Synthetic IVR Scripts
- Package Root Node

## God Nodes (most connected - your core abstractions)
1. `compute_statutory_entitlement()` - 31 edges
2. `CitizenIntake` - 30 edges
3. `DisputeType` - 27 edges
4. `SafetyGuardBlock` - 25 edges
5. `useCaseFile()` - 24 edges
6. `react` - 23 edges
7. `useMode()` - 22 edges
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

## Communities (30 total, 8 thin omitted)

### Community 0 - "React App Shell & Routing"
Cohesion: 0.05
Nodes (83): react, App(), SCREEN_MAP, AppShell(), SafetyBar(), safetyRows(), STEP_LABELS, StepBar() (+75 more)

### Community 1 - "Engineer A · Voice/DSP & QA"
Cohesion: 0.06
Nodes (58): Landing Render QA Log, Acoustic State Machine (RINGING/IVR/HOLD/HUMAN), Dual WSS Streams (intake + assisted call), Engineer A Role (Voice/DSP/Telephony/Latency), Timbre Role-Switch Cache, Engineer B Role (Statutory/Evon/Product UI), HaqVaani Project Thesis, Assisted Call Mode (+50 more)

### Community 2 - "FastAPI Backend Routes"
Cohesion: 0.06
Nodes (32): assisted_route(), complaint(), ComplaintRequest, consent(), ConsentRequest, dossier(), _guard(), health() (+24 more)

### Community 3 - "Core Docs: Thesis & Hard Rules"
Cohesion: 0.06
Nodes (54): Duo Engineer Ownership Treaty, HaqVaani Hard Rules (non-negotiable), Assisted-Call State Machine (Mode 4), Data Flow (Key Objects), Evon v3.3 LLM (30B-A3B MoE), FORBIDDEN_SECRET_RE Redaction Gate, Four-Mode Pipeline, Module Ownership Matrix (+46 more)

### Community 4 - "Legacy Frontend Screens"
Cohesion: 0.21
Nodes (29): Landing experience concept (archived), Glass UI citizen app (single-page 4-mode prototype), Glass UI mobile variant (clay buttons), Telemetry HUD (4-quadrant demo panel), HaqVaani Story landing, Assisted call screen (listen + docket), Call prep screen (script + never-share), Complaint builder screen (drafts + approve) (+21 more)

### Community 5 - "Frontend Toolchain & Dependencies"
Cohesion: 0.09
Nodes (26): framer-motion, gsap, lenis, react-dom, vite, @vitejs/plugin-react, allowScripts, esbuild@0.21.5 (+18 more)

### Community 6 - "Orchestrator & 4-Mode Pipeline"
Cohesion: 0.15
Nodes (11): run_assisted(), run_complaint(), run_full_case(), run_rights(), _self_test(), HaqVaaniCaseRecord, test_assisted_verifies_verbatim(), test_full_case_offline_e2e() (+3 more)

### Community 7 - "Statutory Engine (RBI Math)"
Cohesion: 0.15
Nodes (15): DisputeType, compute_statutory_entitlement(), _failed_txn_entitlement(), _next_working_day(), _self_test(), _zero_liability_entitlement(), test_atm_t_plus_5(), test_future_txn_rejected() (+7 more)

### Community 8 - "SVG Line-Art Library"
Cohesion: 0.20
Nodes (21): DeadLineRule(), DraftArt(), LedgerArt(), STROKE, TxnBreak(), VoiceTiles(), WhisperArt(), useReducedMotion() (+13 more)

### Community 9 - "Legacy JS Runtime (HQ Router)"
Cohesion: 0.14
Nodes (7): applyLang(), chipEl(), init(), HQ, safetyEl(), wireLang(), write()

### Community 10 - "STT Client (Prisma v2.5)"
Cohesion: 0.13
Nodes (8): _as_pcm_bytes(), available(), _frame_seconds(), STTResult, transcribe_wss(), _run(), test_stt_result_dataclass(), test_transcribe_wss_pipeline_fails_cleanly_offline()

### Community 11 - "Speech Protocol Internals"
Cohesion: 0.15
Nodes (12): build_headers(), _pcm_frames(), build_audio_config(), default_voice(), test_audio_config_defaults_raw_pcm(), test_default_voice_en_is_kaveri(), test_default_voice_hi_is_nalini(), test_default_voice_hinglish_is_poorvi() (+4 more)

### Community 12 - "TTS Client (Timbre SSE)"
Cohesion: 0.16
Nodes (6): assemble_wav(), synthesize_sse(), TTSAPIError, TTSResult, test_assemble_wav_has_valid_header(), test_tts_result_roundtrip_b64()

### Community 13 - "DSP & VAD Pipeline"
Cohesion: 0.14
Nodes (5): _fir_lowpass(), _load_silero_vad(), preprocess_intake(), resample_8k_to_16k(), vad_segments()

### Community 14 - "Complaint Builder (Mode 3)"
Cohesion: 0.21
Nodes (9): build_complaint_draft(), build_hindi_drafts(), _inr(), _fixture(), test_draft_contains_facts_and_citations(), test_drafts_never_contain_forbidden_secrets(), test_evidence_checklist_nonempty(), test_no_rbi_draft_when_not_eligible() (+1 more)

### Community 15 - "Evon LLM Client (Negotiation)"
Cohesion: 0.18
Nodes (6): available(), _deterministic_negotiation(), EvonNegotiationResult, extract_negotiation(), _llm_chat(), BrushOffType

### Community 16 - "Free-Constraint Audit Script"
Cohesion: 0.23
Nodes (7): _license_of(), main(), check_screen(), fail(), need(), read(), web_read()

### Community 17 - "Eval Benchmark (STT WER)"
Cohesion: 0.23
Nodes (4): run_benchmark(), _synth_clip(), _wer(), _write_wav()

### Community 19 - "RB-IOS 2026 Dossier Module"
Cohesion: 0.21
Nodes (5): _rbi_cms_draft(), build_rbi_cms_draft(), dossier_summary(), render_case_json(), StatutoryEntitlement

### Community 20 - "Shared Schemas (Treaty Border)"
Cohesion: 0.20
Nodes (4): AgentNegotiationExtraction, ComplaintDraft, Engineer A Ownership (Voice/DSP/Telephony), Engineer B Ownership (Statutory/Evon/UI)

### Community 21 - "Intake Parsing (Evon + Regex)"
Cohesion: 0.22
Nodes (4): _deterministic_intake(), EvonIntakeResult, parse_intake(), CitizenIntake

### Community 23 - "Legacy Scroll-Rail JS"
Cohesion: 0.36
Nodes (8): buildRail(), init(), initLoopPause(), initScrollRail(), onScroll(), update(), initStepBar(), reducedMotion()

## Knowledge Gaps
- **32 isolated node(s):** `haqvaani`, `Sloplint Landing Render Audit Record (before)`, `frontend/landing.html`, `frontend/css/app.css`, `frontend/css/tokens.css` (+27 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 237 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **8 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `CitizenIntake` connect `Intake Parsing (Evon + Regex)` to `FastAPI Backend Routes`, `Orchestrator & 4-Mode Pipeline`, `DSP & VAD Pipeline`, `Complaint Builder (Mode 3)`, `Evon LLM Client (Negotiation)`, `RB-IOS 2026 Dossier Module`, `Shared Schemas (Treaty Border)`, `VoiceAPI Adapters`?**
  _High betweenness centrality (0.022) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `compute_statutory_entitlement()` (e.g. with `DisputeType` and `StatutoryEntitlement`) actually correct?**
  _`compute_statutory_entitlement()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `haqvaani`, `Sloplint Landing Render Audit Record (before)`, `frontend/landing.html` to the rest of the system?**
  _32 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `React App Shell & Routing` be split into smaller, more focused modules?**
  _Cohesion score 0.054838709677419356 - nodes in this community are weakly interconnected._
- **Why does `compute_statutory_entitlement()` connect `Statutory Engine (RBI Math)` to `Engineer A · Voice/DSP & QA`, `FastAPI Backend Routes`, `Legacy Frontend Screens`, `Orchestrator & 4-Mode Pipeline`, `Complaint Builder (Mode 3)`, `RB-IOS 2026 Dossier Module`, `API Tests`?**
  _High betweenness centrality (0.017) - this node is a cross-community bridge._
- **Are the 15 inferred relationships involving `CitizenIntake` (e.g. with `assisted_route()` and `ComplaintRequest`) actually correct?**
  _`CitizenIntake` has 15 INFERRED edges - model-reasoned connections that need verification._
- **Should `Engineer A · Voice/DSP & QA` be split into smaller, more focused modules?**
  _Cohesion score 0.060350877192982454 - nodes in this community are weakly interconnected._