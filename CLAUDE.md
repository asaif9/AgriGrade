# CLAUDE.MD: Quick Reference & Developer Context Guide

This guide is an operational cheat sheet and architecture handbook tailored for Claude and AI assistant sessions working on the **AgriGrade** codebase.

---

## 1. Quick Commands

```bash
# Start development server (boots Express on :3000 with Vite middleware)
npm run dev

# Compile TypeScript and bundle backend server into dist/server.cjs
npm run build

# Run production build
npm run start

# Fast TypeScript type check without emitting files
npm run lint

# Clean build artifacts
npm run clean
```

---

## 2. Technology Stack Snapshot

| Layer | Technology | Key Notes |
| :--- | :--- | :--- |
| **Frontend Framework** | React 19 + TypeScript | Strict Mode enabled; clean hook lifecycle |
| **Styling** | Tailwind CSS v4 | Imported via `@import "tailwindcss";` in `src/index.css`, `@layer base` typography, no inline styles |
| **Typography** | Plus Jakarta Sans & JetBrains Mono | Tabular numerals for sensor telemetry and financial metrics |
| **Animations** | Motion (`motion/react`) | Used in `KineticDecayWidget.tsx` and studio transitions |
| **Icons** | Lucide React | All icons imported strictly from `lucide-react` |
| **Charts** | Recharts v3 | Historical rejection trend, radar benchmarks, price elasticity curves |
| **QR Code Scanner** | jsQR | Decodes video stream canvases in `CameraViewfinder.tsx` |
| **PDF Generation** | jsPDF v4 | Formats official certificates in `src/utils/pdfReportGenerator.ts` |
| **Thermal Barcodes** | Zebra TSPL + Code 128 | Generates TSPL direct printer commands and barcode graphics |
| **Server** | Express 4 + Node.js ESM/CJS | Binds strictly to `0.0.0.0:3000`, graceful `EADDRINUSE` retry |
| **AI Vision Model** | Gemini 3.8 Flash (`@google/genai`) | Model alias: `gemini-3.8-flash`, initialized lazily server-side |
| **Biophysics Engine** | Decoupled Arrhenius Q10 | Sub-5ms reactive recalculations via `/api/physics/recalculate` |
| **Persistence** | File-backed JSON store | Auto-saves rules, alerts, audit trails to `runtime_store.json` |
| **Build Tooling** | Vite 8 + esbuild + tsx | Dual pipeline for SPA client + bundled Node CJS server |

---

## 3. Architecture & Data Flow

```
User Input (Live Video / Image Upload / Preset Crate)
                        │
                        ▼
        [CameraViewfinder.tsx / App.tsx]
        - Canvas capture & rasterization
        - jsQR barcode/crate detection
                        │
                        ▼  POST /api/grade (Vision + Context)
              [server.ts (Port 3000)]
        - Multi-Agent prompt orchestration
        - Google Gemini 3.8 Flash vision call
        - Fallback deterministic biological engine
        - Q10 Respiration kinetic decay math
                        │
                        ▼  Returns AgriGradeReport (Cached in cachedVisionDataRef)
                  [App.tsx State]
                        │
                        ├──────────────────────────┐
                        ▼                          ▼
              [Reactive Slider Event]     [Enterprise Workspaces]
              POST /api/physics/recalculate  (WorkspaceTab)
              (<5ms Biophysics without      ├── 'INSPECTION'
               Base64 re-upload)            ├── 'COMMAND_CENTER'
                                            ├── 'RULES_ENGINE' (JSON Import/Export)
                                            ├── 'SUPPLY_CHAIN' (Routing/Pricing/What-If)
                                            ├── 'FEEDBACK_LEDGER' (Continual Learning)
                                            ├── 'COMMODITY_DB' (Taxonomy)
                                            └── 'CHAT_SWARM' (Zero-Hallucination)
                        │
                        ▼
           [Enterprise Operational Modals]
           ├── CrateLotSamplingModal.tsx (20-specimen statistical yield audit)
           ├── ThermalLabelModal.tsx (Zebra TSPL industrial crate label print)
           ├── WhatIfSimulatorModal.tsx (Reefer vs. ambient financial ROI simulation)
           ├── MobileFieldScoutModal.tsx (Offline field scouting)
           ├── WhatsAppAlertsModal.tsx (Automated vendor alerts)
           ├── AuditAndVersioningModal.tsx (Cryptographic specimen ledger)
           └── pdfReportGenerator.ts (Official PDF certificate download)
```

---

## 4. Key Data Models (`src/types.ts`)

### `AgriGradeReport`
Central report structure generated per inspection:
- `id`: Unique batch identifier (`CRATE-XXXX`).
- `produce_type`: Tomato, Apple, Banana, Bell Pepper, Grains.
- `variety_detected`: Exact cultivar (e.g. *Roma*, *Beefsteak*).
- `usda_color_stage`: Number $1$ to $6$.
- `color_breakdown`: `{ green_pct, yellow_pct, pink_orange_pct, deep_red_pct }`.
- `bruise_defect_index`: Float $0.0 - 100.0$.
- `defects`: Array of `DefectDetail` with bounding boxes `{ x, y, width, height }`.
- `ambient_shelf_life_days` & `cold_storage_shelf_life_days`.
- `harvest_guidance`: Populated in `FIELD_PRE_HARVEST` mode.
- `inbound_action`: Populated in `DARK_STORE_INBOUND` mode.
- `agent_traces`: Array of `AgentTraceStep` (name, role, latency, summary, findings).

### `WorkspaceTab` & `OperationalRole`
- `WorkspaceTab`: `'INSPECTION' | 'COMMAND_CENTER' | 'RULES_ENGINE' | 'SUPPLY_CHAIN' | 'FEEDBACK_LEDGER' | 'COMMODITY_DB' | 'CHAT_SWARM'`
- `OperationalRole`: `'FIELD_SCOUT' | 'DOCK_QC' | 'SUPPLY_CHAIN_LEAD'`
- `AgentFocusType`: `'swarm' | 'agent_1' | 'agent_2' | 'agent_3' | 'agent_4' | 'agent_5' | 'agent_6' | 'agent_7' | 'agent_8' | 'agent_9'`

### `CrateSampleLotResult` & `ThermalLabelData`
- `CrateSampleLotResult`: Multi-item lot grading (`gradeAYieldPct`, `gradeBYieldPct`, `cullRejectPct`, `overallLotVerdict`, `recommendedLotMarkdownPct`, `items`).
- `ThermalLabelData`: Industrial Zebra TSPL thermal printer scripts, Code 128 barcode numbers, and 2D QR payloads.

---

## 5. Critical Files & Their Roles

- `src/data/agentSkillsMatrix.ts`:
  - Canonical specification registry for all 9 specialized agents + Swarm Orchestrator.
  - Documents 28+ active and recommended skills with parameter schemas, return payloads, and edge heuristics.
  - Contains production system prompt templates, Chain-of-Thought (CoT) protocols, zero-hallucination grounding rules, inter-agent data contracts, and self-healing failure modes.
- `src/components/MultiAgentModal.tsx`:
  - 5-tab interactive Swarm Architecture & Skills Studio: Swarm Topology & DAG, Agent Skills Catalog, Production System Instructions & Prompts, Inter-Agent Contracts, and Self-Healing Resilience.
  - One-click copyable production prompts and tool JSON schemas.
- `server.ts`:
  - Handles `/api/health`, `/api/grade`, `/api/physics/recalculate`, `/api/grade/crate-sample`, `/api/barcode/generate-label`, `/api/commercial-rules/export`, `/api/commercial-rules/import`, and `/api/chat`.
  - Lazy loads `@google/genai` client only when `process.env.GEMINI_API_KEY` is present.
  - Implements the complete deterministic biological respiration engine for instant fallback without API keys.
  - Houses `loadRuntimeStore()` and `saveRuntimeStore()` to persist changes into `runtime_store.json`.
  - Hosts Vite middleware in dev with `DISABLE_HMR=true` support; serves `dist/index.html` in production.
  - Supports all 9 specialist personas in `/api/chat` with dynamic agent badges and grounded facts.
  - Self-healing server binding: Catches `EADDRINUSE`, delays 1s, and retries binding gracefully.
  - Bundled by `esbuild` to CommonJS (`dist/server.cjs`). Always uses `process.cwd()` for path resolution (never `import.meta.url` which causes runtime crashes in CJS).
- `src/App.tsx`:
  - Central state container holding active `report`, `activeWorkspace`, `userRole`, `mode`, telemetry, and modal toggles.
  - Implements `recalculatePhysics` for sub-5ms reactive slider updates using cached optical inference data.
  - Hosts the modern responsive **Workspace Context Toolbar** with breadcrumb metadata, inspection controls, PDF certificate download trigger, and operational modal shortcuts.
- `src/components/Header.tsx`:
  - Unified responsive header with role switcher, workspace tabs, quick action modals, and system status indicators.
- `src/components/CrateLotSamplingModal.tsx`:
  - Statistical Codex/USDA 20-specimen crate lot sampling & yield audit modal.
- `src/components/ThermalLabelModal.tsx`:
  - Zebra TSPL thermal crate sticker & shelf tag generator with native print and clipboard copy.
- `src/components/WhatIfSimulatorModal.tsx`:
  - Arrhenius temperature breakdown & reefer vs. ambient financial ROI simulator.
- `src/components/DynamicGradeEngineStudio.tsx`:
  - Custom commercial grading rules engine with live multi-customer benchmarking and JSON export/import.
- `src/components/AgentChatMode.tsx`:
  - Grounded interactive conversational interface supporting all 9 specialist personas (`agent_1` through `agent_9`) and the Swarm consensus supervisor (`swarm`).
- `src/utils/pdfReportGenerator.ts`:
  - Generates multi-page formatted PDF certificates with vector badges, defect tables, and official compliance stamps.

---

## 6. Responsive Design & UI Guidelines

1. **Fluid Multi-Device Layout**:
   - **Desktop (>= 1024px)**: 12-column split (5-column live camera dock / 7-column inspection & telemetry panels).
   - **Tablet (768px - 1023px)**: Stacked single-column layout with expanded touch targets and quick-access drawer.
   - **Mobile (< 768px)**: Compact vertical flow with fixed bottom navigation clearances, slide-over navigation drawer, and touch-optimized buttons (minimum 44px tap targets).
2. **Anti-AI Slop Aesthetic**:
   - Professional dark-slate theme (`slate-950` / `stone-900`) with subtle green and amber accents (`emerald-500`, `amber-500`).
   - Restrained glassmorphism (`backdrop-blur-xl`), hairline borders (`border-white/10`), and structured tabular data.
   - No generic centered pill containers or decorative placeholder banners.

---

## 7. Development Rules & Common Pitfalls

1. **Avoid TypeScript Missing Property Errors**:
   - In `report.inbound_action`, use `action.disposition_notes` and `action.erp_routing_tag`.
   - In `report.harvest_guidance`, use `guidance.target_channel` and `guidance.harvest_risk_assessment`.
2. **Icons**:
   - Always import from `lucide-react`. Never create raw inline SVGs.
3. **Animations**:
   - Always import from `motion/react` (e.g. `import { motion } from 'motion/react'`).
4. **Port 3000 & Cloud Run Compatibility**:
   - Do NOT change the port or attempt to bind to `3001` or `5173`. Port 3000 is required by the container reverse proxy.
5. **No Alert or Window.Open in iFrame**:
   - Avoid `window.alert()` or `window.open()`; use in-app modals (`MultiAgentModal.tsx`, `WhatsAppAlertsModal.tsx`) or direct downloads (`doc.save(...)`).
6. **No API Keys in Client Code**:
   - All AI interactions must route through Express `/api/*` endpoints. Never expose Gemini tokens in Vite client env vars.
