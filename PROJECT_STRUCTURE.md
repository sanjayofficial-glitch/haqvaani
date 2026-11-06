# PROJECT_STRUCTURE.md — HaqVaani File/Folder Tree

> Complete repository layout optimized for the free stack, the Gnani sovereign APIs, human-controlled
> advocate design, and AI coding agents. Every module maps to an owner and a mode of the 4-mode
> pipeline (see ARCHITECTURE.md).

```
haqvaani/                                  # Project root
├── AGENTS.md                              # Master AI-agent instructions (read first)
├── ARCHITECTURE.md                        # 4-mode pipeline, ownership, state machine
├── CHANGELOG.md                           # Change log (initial: 2026-10-25)
├── CONTRIBUTING.md                        # Human duo + AI agent guidelines
├── README.md                              # Project overview, stack, quick start, license
├── ROADMAP.md                             # 16-day ship plan (25 Oct -> 10 Nov 2026)
├── RULES.md                               # Non-negotiable legal/safety/challenge constraints (incl. TRAI/DPDP)
├── TODO.md                                # Prioritized atomic tasks
├── PROJECT_STRUCTURE.md                   # This file
├── IMPLEMENTATION_PLAN.md                 # Free method per component + rationale
├── RECOMMENDATIONS.md                     # Frontend / backend / DB / auth / deployment
├── .env.example                           # Gnani API key template (no secrets committed)
├── Makefile                               # Common dev targets
├── requirements.txt                       # Python dependencies (free/open source only)
├── pyproject.toml                         # Packaging metadata
│
├── haqvaani/                              # Python package (treaty border: schemas.py)
│   ├── __init__.py
│   ├── schemas.py                         # CitizenIntake, AgentNegotiationExtraction,
│   │                                        HaqVaaniCaseRecord, ConsentRecord  [Engineer A + B treaty border]
│   ├── statutory.py                       # compute_statutory_entitlement() — PURE PYTHON [Eng B]
│   ├── safety.py                          # Consent gate, FORBIDDEN_SECRET_RE, disclosure,
│   │                                        substring verification, SafetyGuardBlock [Both]
│   ├── dsp_audio.py                       # 8→16 kHz FIR resampler, Silero VAD, ring buffer [Eng A]
│   ├── stt_client.py                      # Gnani Prisma v2.5 WSS client [Eng A]
│   ├── tts_client.py                      # Gnani Timbre v2.5/v3.0 SSE client [Eng A]
│   ├── evon_client.py                     # Gnani Evon v3.3 LLM client [Eng B]
│   ├── complaint_builder.py               # Bank complaint, WhatsApp/email draft, RB-IOS 2026 CMS draft [Eng B]
│   ├── rb_ios.py                          # RB-IOS 2026 CMS PDF/JSON dossier generator [Eng B]
│   └── orchestrator.py                    # 4-mode pipeline switcher [Both]
│
├── docs/                                  # Detailed documentation
│   ├── legal_matrix.md                    # Exact statutory numbers, circulars, TRAI/DPDP compliance
│   ├── latency_budget.md                  # Target latencies & measurement (690 ms budget)
│   ├── demo_storyboard.md                 # Simulated 60s Demo Day Drop storyboard (16:9 + 9:16)
│   ├── interview_qa.md                    # Gnani interview Q&A + model answers (incl. legal compliance)
│   ├── evaluation.md                      # WER, latency, safety, compliance, demo quality metrics
│   ├── ui_ux_design_system.md             # Design system (glass + clay + accessibility)
│   └── system_diagrams.md                 # Mermaid flowcharts & state machines
│   └── diagrams_viewer.html               # Render all Mermaid diagrams in one browser page
│
├── demo/                                  # Demo assets (synthetic only)
│   ├── synthetic_clips/                   # 30 noisy UTR/Hinglish test clips (8 kHz)
│   ├── ivr_scripts/                       # Simulated bank IVR prompt scripts (synthetic)
│   └── hold_music.wav                     # Synthetic hold music (for testing)
│
├── eval/                                  # Evaluation harness
│   ├── benchmark.py                       # Whisper vs Prisma WER runner
│   └── results/                           # Measured WER/latency outputs (gitignored)
│
├── frontend/                              # Citizen UI + Telemetry HUD (completely free)
│   ├── glass_ui.html                      # Citizen-facing voice interface (assisted-call mode)
│   └── hud.html                           # Telemetry HUD (4 quadrants + compliance indicators)
│
├── tests/                                 # Tests (synthetic data only)
│   ├── test_statutory.py                  # Deterministic math assertions
│   ├── test_safety.py                     # Secret redaction + consent + substring gates
│   └── test_dsp.py                        # VAD / audio processing tests
│
└── agent_prompts/                         # Role-specific prompts for AI coding agents
    ├── SHARED_CONTEXT.md                  # Common context (read first)
    ├── ENGINEER_A_PROMPT.md               # Engineer A — Voice, DSP, Telephony & Latency
    └── ENGINEER_B_PROMPT.md               # Engineer B — Statutory Engine, Evon v3.3 & Product UI
```

### Key conventions
- **Synthetic data only:** All test clips, IVR scripts, phone numbers, UTRs, and docket IDs are
  synthetic (e.g. `UTR 629188340112`, `SR-DB-884120`, `+91-90000-00000`).
- **No secrets committed:** `.env.example` is committed; `.env` (real Gnani key) is gitignored.
- **No autonomous dialing:** No outbound telephony code in the repo. All bank interactions are
  simulated/synthetic for the demo.
- **Treaty border:** `schemas.py` is shared; changes require both engineers' sign-off.
- **Engineer A owns:** DSP/audio, STT/TTS clients, vLLM server, eval harness, assisted-call
  listening UI.
- **Engineer B owns:** Statutory engine, Evon client/prompts, complaint builder, RB-IOS dossier,
  safety/consent gates, Telemetry HUD + compliance, demo video.
