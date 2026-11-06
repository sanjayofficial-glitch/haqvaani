# Graph Report - haqvaani  (2026-11-06)

## Corpus Check
- Corpus is ~25,344 words - fits in a single context window. You may not need a graph.

## Summary
- 135 nodes · 209 edges · 22 communities (6 shown, 16 thin omitted)
- Extraction: 0% EXTRACTED · 100% INFERRED · 0% AMBIGUOUS · INFERRED: 208 edges (avg confidence: 0.98)
- Token cost: 108,000 input · 14,500 output

## Community Hubs (Navigation)
- Statutory Engine & RBI Rules
- Schemas & Agent Extraction
- Safety Gates & Compliance
- Evaluation & Metrics
- Complaint Builder & Modes
- Demo Storyboard
- Project Documentation
- Latency Budget
- Document Node
- Document Node
- Document Node
- Document Node
- Document Node

## God Nodes (most connected - your core abstractions)
1. `Engineer B` - 11 edges
2. `Mode 4 Assisted Call` - 9 edges
3. `Engineer A` - 9 edges
4. `60-Second Demo Day Drop Storyboard` - 7 edges
5. `HaqVaani` - 6 edges
6. `Mode 1 Voice Intake` - 6 edges
7. `haqvaani/statutory.py — Pure Python Statutory Engine` - 6 edges
8. `UI/UX Design System — Bharat Glass` - 6 edges
9. `Evaluation Metrics` - 6 edges
10. `Mode 2 Rights Checker` - 5 edges

## Surprising Connections (you probably didn't know these)
- `Mode 4 Assisted Call` --uses--> `Gnani Timbre v2.5/v3.0 TTS`  [INFERRED]
  ARCHITECTURE.md → README.md
- `Duo Ownership Matrix` --ownership--> `Engineer A — Voice, DSP, Telephony & Latency`  [INFERRED]
  docs/system_diagrams.md → agent_prompts/SHARED_CONTEXT.md
- `Duo Ownership Matrix` --ownership--> `Engineer B — Statutory Engine, Evon v3.3 & Product UI`  [INFERRED]
  docs/system_diagrams.md → agent_prompts/SHARED_CONTEXT.md
- `haqvaani/schemas.py (Treaty Border)` --data_flow--> `haqvaani/statutory.py — Pure Python Statutory Engine`  [INFERRED]
  agent_prompts/SHARED_CONTEXT.md → docs/legal_matrix.md
- `Gnani Sovereign Stack (free only)` --stack--> `evon_client.py — Evon v3.3 Client`  [INFERRED]
  agent_prompts/SHARED_CONTEXT.md → docs/system_diagrams.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **4-mode pipeline** — concept/mode1, concept/mode2, concept/mode3, concept/mode4 [INFERRED 1.00]
- **Safety gates** — concept/consent, concept/forbidden_secret_re, concept/verbatim_substring, concept/no_autonomous_dialing [INFERRED 1.00]
- **Free stack** — concept/prisma, concept/evon, concept/timbre, concept/statutory [INFERRED 1.00]
- **Assisted-call state machine** — state/idle, state/listening, state/script_display, state/docket_capture, state/post_call [INFERRED 1.00]
- **Ownership treaty** — engineer/a, engineer/b, module/schemas.py [INFERRED 1.00]
- **RBI legal rules** — concept/rbi_2019_20_67, concept/rb_ios_2026, concept/dpdp, concept/trai_2026 [INFERRED 1.00]
- **HaqVaaniCaseRecord composition** — concept/citizen_intake, concept/statutory_entitlement, concept/complaint_draft, concept/call_transcript, concept/case_record, concept/consent_record [INFERRED 1.00]
- **Treaty Border co-ownership — schemas.py changes require both engineers' sign-off** — haqvaani:engineer_a, haqvaani:engineer_b, haqvaani:schemas.py [INFERRED 0.99]
- **Safety Gates — consent + disclosure + secret redaction + verbatim docket substring, mapped to DPDP/TRAI/RB-IOS** — haqvaani:safety.py, dpdp:act_2023, trai:2026_a2p, rbi:rb_ios_2026 [INFERRED 0.98]
- **7-Stage End-to-End Pipeline — citizen audio → RB-IOS dossier** — pipeline:stage_1_dsp, pipeline:stage_2_stt, pipeline:stage_3_statutory, pipeline:stage_4_ivr_orchestrator, pipeline:stage_5_verbatim_gate, pipeline:stage_6_callback, pipeline:stage_7_dossier [INFERRED 0.98]
- **Gnani Sovereign Stack execution path — Prisma STT → Evon LLM → Timbre TTS** — gnani:stack, haqvaani:stt_client.py, haqvaani:evon_client.py, haqvaani:tts_client.py [INFERRED 0.98]
- **Demo Day deliverables — 60s video + UI + HUD, all synthetic data, no autonomous dialing** — docs_demo_storyboard, frontend:glass_ui.html, frontend:hud.html [INFERRED 0.97]
- **Evaluation metrics framework — WER, Latency, Safety, Compliance, Demo Quality, Award Alignment** — eval:wer, eval:latency, eval:safety, eval:compliance, eval:demo_quality, eval:award_alignment [INFERRED 0.98]

## Communities (22 total, 16 thin omitted)

### Community 0 - "Statutory Engine & RBI Rules"
Cohesion: 0.08
Nodes (30): DBR.No.Leg.BC.78/09.07.005/2017-18, DPDP Act 2023, Duo Ownership Matrix, Acoustic State Machine (Stage 4), Gnani Sovereign Stack (free only), dsp_ivr.py — DSP + IVR, Engineer A — Voice, DSP, Telephony & Latency, Engineer B — Statutory Engine, Evon v3.3 & Product UI (+22 more)

### Community 1 - "Schemas & Agent Extraction"
Cohesion: 0.15
Nodes (16): BrushOffType, CallTranscript, HaqVaaniCaseRecord, CitizenIntake, ConsentRecord, Gnani Evon v3.3 LLM, IVRAction, Mode 1 Voice Intake (+8 more)

### Community 2 - "Safety Gates & Compliance"
Cohesion: 0.25
Nodes (12): Consent Gate, DPDP Act 2023, FORBIDDEN_SECRET_RE, Mode 2 Rights Checker, No Autonomous Dialing, RB-IOS 2026, RBI/2019-20/67, Safety Gates (+4 more)

### Community 3 - "Evaluation & Metrics"
Cohesion: 0.16
Nodes (15): Award Alignment, Compliance Metrics (TRAI / DPDP / RBI), Demo Quality Metrics, Latency Metrics, Evaluation Metrics, Safety Metrics, WER (Word Error Rate), frontend/glass_ui.html — Production UI (+7 more)

### Community 4 - "Complaint Builder & Modes"
Cohesion: 0.33
Nodes (4): ComplaintDraft, Mode 3 Complaint Builder, Gnani Prisma v2.5 STT, Engineer B

### Community 5 - "Demo Storyboard"
Cohesion: 0.29
Nodes (11): Segment 0–4 s — Cold Open, Segment 12–23 s — Complaint Builder, Segment 23–36 s — Assisted Call (Simulated), Segment 36–47 s — Docket Verified, Segment 47–55 s — Role Switch en-IN → hi-IN, Segment 4–12 s — Prisma vs Whisper, Segment 55–60 s — RB-IOS Dossier + CTA, 60-Second Demo Day Drop Storyboard (+3 more)

## Knowledge Gaps
- **33 isolated node(s):** `IVRAction`, `Great Indian AI Internship Challenge`, `IDLE state`, `LISTENING state`, `SCRIPT_DISPLAY state` (+28 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 47 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **16 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `HaqVaani` connect `Project Documentation` to `Schemas & Agent Extraction`, `Safety Gates & Compliance`?**
  _High betweenness centrality (0.016) - this node is a cross-community bridge._
- **Are the 11 inferred relationships involving `Engineer B` (e.g. with `Engineer A` and `frontend/glass_ui.html`) actually correct?**
  _`Engineer B` has 11 INFERRED edges - model-reasoned connections that need verification._
- **What connects `IVRAction`, `Great Indian AI Internship Challenge`, `IDLE state` to the rest of the system?**
  _33 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Statutory Engine & RBI Rules` be split into smaller, more focused modules?**
  _Cohesion score 0.07862903225806452 - nodes in this community are weakly interconnected._
- **Why does `Mode 4 Assisted Call` connect `Schemas & Agent Extraction` to `Safety Gates & Compliance`, `Complaint Builder & Modes`?**
  _High betweenness centrality (0.014) - this node is a cross-community bridge._
- **Are the 9 inferred relationships involving `Mode 4 Assisted Call` (e.g. with `CallTranscript` and `HaqVaaniCaseRecord`) actually correct?**
  _`Mode 4 Assisted Call` has 9 INFERRED edges - model-reasoned connections that need verification._
- **Are the 9 inferred relationships involving `Engineer A` (e.g. with `Engineer B` and `eval/benchmark.py`) actually correct?**
  _`Engineer A` has 9 INFERRED edges - model-reasoned connections that need verification._