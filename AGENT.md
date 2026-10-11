# AGENT.MD: System Architecture & Development Guidelines for AI Coding Agents

This document serves as the permanent technical specification, architecture handbook, and operational contract for AI coding agents (Antigravity, Gemini, Claude, Copilot) maintaining and extending the **AgriGrade** platform.

---

## 1. System Identity & Mission

**AgriGrade** is an autonomous multi-agent computer vision and agricultural kinetic decay platform that operates in two primary inspection environments:
1. **Field Pre-Harvest Mode (`FIELD_PRE_HARVEST`)**: Determines whether crops should be harvested immediately or held in the field, optimizing for transit distance, ambient temperature, and downstream channel viability.
2. **Dark Store Inbound Quality Gate (`DARK_STORE_INBOUND`)**: Automates crate acceptance, grading (Grade A, Grade B with fast-track dynamic discounting, or Dock Rejection), supplier defect compliance, and ERP warehouse sync.

Additionally, the platform integrates **Enterprise Intelligence Studios** for real-time logistics command, biological digital twin simulation, algorithmic dynamic markdowns, micro-fulfillment demand routing, IoT cold-chain datalogging, and agronomist closed-loop feedback.

---

## 2. Core Operational Constraints & Environment Rules

1. **Port & Reverse Proxy Rules**:
   - The application runs inside a sandboxed Cloud Run container behind an Nginx reverse proxy.
   - **Port 3000 is the ONLY accessible port.**
   - All server listeners (`server.ts`) **MUST** bind to `0.0.0.0` and port `3000`. Never change the port.
   - **Self-Healing Server Binding**: `server.ts` incorporates an `EADDRINUSE` error handler that catches transient port collision during rapid restarts, delays 1s, and retries listening gracefully.
2. **Full-Stack Architecture (Server + Client)**:
   - Client is a Single-Page Application (React 19 + Vite 8).
   - Server is an Express 4 backend running in Node.js ESM.
   - **All Gemini API calls MUST be executed server-side in `server.ts`** using `process.env.GEMINI_API_KEY`.
   - Secret API keys must never be prefixed with `VITE_` or sent to the browser.
   - In dev mode, Vite runs in middleware mode inside Express. It supports `DISABLE_HMR=true` to eliminate duplicate WebSocket connections in iframe sandboxes.
3. **Build & Bundling Architecture**:
   - Dev Command: `tsx server.ts` (boots Express and mounts Vite middleware in development).
   - Build Command: `vite build && esbuild server.ts --bundle --platform=node --format=cjs --packages=external --sourcemap --outfile=dist/server.cjs`
   - Start Command: `node dist/server.cjs`
   - `esbuild` bundles the server into CommonJS to eliminate ESM relative import resolution issues.
   - **Crucial CJS Compatibility**: Do NOT use `import.meta.url` or `fileURLToPath(import.meta.url)` in `server.ts`. In Node.js CJS mode, `import.meta` is empty and causes a fatal `TypeError` on Cloud Run startup. Always use `process.cwd()` for file/dist path resolution.
4. **Validation Pipeline**:
   - Fast lint check: `npm run lint` (`tsc --noEmit`).
   - Production build check: `npm run build`.

---

## 3. Codebase File Hierarchy & Responsibilities

```
/
├── server.ts                       # Express server, Vite middleware, Gemini 3.8 client, Kinetic decay math, /api/grade, /api/chat
├── package.json                    # Dependency manifest and build scripts
├── metadata.json                   # Applet metadata, frame permissions, major capabilities
├── index.html                      # HTML entry point, typography imports (Plus Jakarta Sans, JetBrains Mono)
├── vite.config.ts                  # Vite config with Tailwind CSS v4 and React plugins
├── tsconfig.json                   # TypeScript configuration
├── public/                         # Static assets and demo produce images
└── src/
    ├── main.tsx                    # React client mount point
    ├── index.css                   # Tailwind CSS v4 root stylesheet (@import "tailwindcss";), @layer base typography & scrollbars
    ├── App.tsx                     # Top-level state container, camera controller, scan coordinator, PDF triggers, studio toggles
    ├── types.ts                    # Canonical TypeScript interfaces (AgriGradeReport, HarvestAction, InboundAction, Telemetry, etc.)
    ├── data/
    │   ├── agentSkillsMatrix.ts        # Comprehensive 9-Agent Skills, System Instructions & DAG Registry
    │   ├── presets.ts                  # Preset produce specimens (Roma tomato, Cavendish banana, Gala apple, Bell pepper)
    │   ├── feedbackLoopData.ts         # Historical batches and closed-loop calibration metrics
    │   └── agriGradeDataPlatform.ts    # Supply chain nodes, connections & fleet KPIs
    ├── components/
    │   ├── Header.tsx                  # Modern responsive header: paradigm switcher, intelligence studios menu, mobile slide-over drawer
    │   ├── CameraViewfinder.tsx        # Live camera stream, Canvas rasterizer, QR decoder (jsQR), bounding-box HUD
    │   ├── KineticDecayWidget.tsx      # Dynamic shelf-life calculator, thermal slider, reefer toggle, motion decay bar
    │   ├── FieldHarvestDecision.tsx    # USDA 6-stage maturity selector, transit viability, lorry pass export, ask agents trigger
    │   ├── DarkStoreQualityGate.tsx    # Dock disposition, dynamic markdown discount slider, ERP webhook trigger, ask agents trigger
    │   ├── AgriGradeCommandCenter.tsx  # Enterprise warehouse & logistics command center with cross-facility analytics
    │   ├── DigitalTwinStudio.tsx       # High-fidelity biological digital twin simulation (tissue senescence, ethylene emission)
    │   ├── DemandForecastingAndRoutingStudio.tsx # Predictive micro-fulfillment routing & dark store inventory distribution
    │   ├── DynamicGradeEngineStudio.tsx# Custom commercial grading rules engine per buyer category with JSON export/import
    │   ├── CrateLotSamplingModal.tsx   # Statistical Codex/USDA 20-specimen crate lot sampling & yield audit
    │   ├── ThermalLabelModal.tsx       # Zebra TSPL thermal crate sticker & shelf tag generator (native print & code copy)
    │   ├── WhatIfSimulatorModal.tsx    # Arrhenius temperature breakdown & reefer vs. ambient financial ROI simulator
    │   ├── ColdChainTelemetryStudio.tsx# Real-time IoT temperature/humidity datalogger simulator & thermal spike tracker
    │   ├── SupplierScorecardStudio.tsx # Supplier compliance scorecard, SLA penalty calculation & historical QA ratings
    │   ├── SupplierRadarComparison.tsx # 5-axis benchmark radar chart comparing supplier consistency
    │   ├── SupplierRejectionAnalytics.tsx # Recharts 30-day historical supplier rejection trend chart
    │   ├── ClosedLoopFeedbackStudio.tsx# Agronomist ground-truth calibration & continuous model refinement
    │   ├── CommodityDatabaseStudio.tsx # USDA standards & brix/defect tolerance specification repository
    │   ├── AgentChatMode.tsx           # Grounded Q&A interface supporting all 9 specialist agent personas + Swarm consensus
    │   ├── MobileFieldScoutModal.tsx   # Offline-first field scouting interface for rugged farm tablet/phone use
    │   ├── WhatsAppAlertsModal.tsx     # Automated WhatsApp & SMS stakeholder notification dispatch for critical dock rejections
    │   ├── AuditAndVersioningModal.tsx # Specimen audit trail, revision history, and immutable batch certification
    │   ├── MultiFactorContextPanel.tsx # Contextual telemetry dock combining cold-chain, transit distance, ambient conditions
    │   ├── ColdChainSummaryWidget.tsx  # Compact refrigerated transport status badge and degree-day thermal tracker
    │   ├── ShelfLifeDigitalTwinCard.tsx# Biological twin status summary card
    │   ├── MultiAgentTrace.tsx         # Step-by-step telemetry list showing active agents and execution latency
    │   ├── MultiAgentModal.tsx         # Interactive 5-tab Swarm Blueprint & Dynamic Skills Matrix Studio
    │   ├── SupplyChainEconomics.tsx    # Economic calculation cards (shrinkage savings, margin, revenue recovery)
    │   └── AuditHistorySection.tsx     # Collapsible session audit ledger, filtering, search, CSV & PDF export
    └── utils/
        ├── auditAndVersioningEngine.ts   # Cryptographic hashing & audit ledger version management
        ├── demandAndRoutingEngine.ts     # Micro-fulfillment route optimizer and shelf-life matching
        ├── digitalTwinEngine.ts          # Biochemical cellular respiration & ethylene kinetic simulation
        ├── gradeEngine.ts                # Commercial tolerance rules evaluator (Quick-Commerce, Export, Processing)
        ├── imageQualityGate.ts           # Blur detection, lighting lux checks, and framing validator
        ├── imageRasterizer.ts            # Downsamples camera captures, handles SVG to raster conversion
        ├── mobileFieldAdvisory.ts        # Agronomic field recommendations & spray-window advisories
        ├── pdfReportGenerator.ts         # jsPDF multi-page inspection report & certification generator
        ├── pricingOptimizer.ts           # Dynamic markdown price elasticity curve calculator
        ├── qrScanner.ts                  # jsQR wrapper for video frame barcode scanning
        ├── seasonalClimate.ts            # Regional monsoon & climate thermal profiles
        ├── supplierIntelligenceEngine.ts # Supplier SLA compliance & risk scoring model
        └── telemetryEngine.ts            # IoT temperature logger anomaly detection & degree-hour calculations
```

---

## 4. Multi-Agent Pipeline & Data Schema

Each inspection invokes an autonomous **9-Agent Swarm** orchestrated across an asynchronous parallel **Directed Acyclic Graph (DAG)**, returning a unified `AgriGradeReport`:

### DAG Execution Topology:
1. **Supervisor Dispatch (Agent 0 - Swarm Orchestrator)**: Ingests raw camera frames, sensor streams, and logistics context, dispatching Phase 1 parallel workers.
2. **Phase 1: Parallel Perception & Biophysics (Concurrent Execution)**:
   - **Agent 1: Optical Perception & Phenotyping Lead (`agent_phenotyping`)**: USDA 1–6 color stage, 4-channel spectral decomposition, aspect ratio morphology, caliper dimensioning.
   - **Agent 2: Defect & Pathology Segmentation Lead (`agent_pathology`)**: Contiguous defect area segmentation (cm²), 360° spherical fusion, pathogen classification (*Botrytis*, *Rhizopus*), contagion quarantine flags.
   - **Agent 3: Kinetic Bio-Decay Digital Twin Lead (`agent_kinetic_decay`)**: Arrhenius $Q_{10}$ respiration curve, 144-point thermal exposure degree-hour integral, Vapor Pressure Deficit ($VPD$) transpiration, ethylene catalyst modeling.
3. **Barrier Synchronization**: Validates optical-biological numerical consistency before triggering commercial logic.
4. **Phase 2: Commercial Decision & Disposition**:
   - **Agent 4: Commercial Decision & Rules Engine Lead (`agent_gatekeeper`)**: Clause-by-clause contract tolerance evaluation (Zepto Quick-Commerce, Gourmet Supermarket, Food Processing), ERP disposition tags, fast-track dispatch windows.
5. **Phase 3: Downstream Optimization Solvers (Concurrent Execution)**:
   - **Agent 5: Demand Forecasting & Waste Prevention Lead**: Store-level sales velocity nowcasting, weather multipliers, FEFO picking queues, waste hazard probability %.
   - **Agent 6: Intelligent Routing & Logistics Lead**: Multi-store margin optimization, live traffic heat delay simulations, cubic cold-room capacity gating.
   - **Agent 7: Dynamic Pricing & Markdown Optimizer Lead**: 8-variable price elasticity solver, contribution margin floor guard, phased time-decay schedules.
   - **Agent 8: Autonomous Risk & Root Cause Diagnostic Lead**: Supply chain forensics (carrier cold-chain breach vs farm field infection), automated debit note drafting, Bayesian vendor risk tiers.
6. **Phase 4: Continual Ground Truth Feedback**:
   - **Agent 9: Closed-Loop Model Calibration & Learning Lead**: Matches initial dock predictions to actual store POS sales, scrap logs, and refund claims; tunes Arrhenius $Q_{10}$ offsets, supplier trust scores, and detects seasonal concept drift.

---

## 5. Kinetic Decay Mathematical Formulations

To ensure biological accuracy, shelf-life calculations must adhere to the following formulas in `server.ts` and `digitalTwinEngine.ts`:

1. **Temperature Delta Factor**:
   $$\Delta T = T_{\text{actual}} - T_{\text{ref}}$$
   $$\text{TempFactor} = Q_{10}^{-\frac{\Delta T}{10.0}}$$

2. **Ripeness Factor**:
   $$\text{RipenessFactor} = \max\left(0.05, 1.0 - \frac{\text{Ripeness}\%}{100.0}\right)$$

3. **Bruise Penalty**:
   $$D_{\text{bruise}} = \min\left(0.8, \frac{\text{BruiseDefectIndex}}{100.0} \times 0.9\right)$$

4. **Marketable Days**:
   $$\text{AmbientDays} = SL_{\text{base}} \times \text{RipenessFactor} \times \text{TempFactor} \times (1.0 - D_{\text{bruise}})$$

---

## 6. Responsive Multi-Device UI Architecture (Desktop, Tablet, Mobile)

AgriGrade is designed to provide an uncompromised experience across **desktop workstations**, **warehouse tablets**, and **handheld mobile devices**:

1. **Tailwind CSS v4 Configuration**:
   - Root stylesheet `src/index.css` imports Tailwind using `@import "tailwindcss";`.
   - Smooth scrolling, touch-target optimization (`-webkit-tap-highlight-color: transparent;`), and customized thin scrollbars for dense data grids.
   - Typographic hierarchy using **Plus Jakarta Sans** for interfaces and **JetBrains Mono** with `font-variant-numeric: tabular-nums` for sensor readings, percentages, and currencies.
2. **Header Architecture (`src/components/Header.tsx`)**:
   - **Desktop**: Inline wordmark with leaf accent, segmented core paradigm buttons (*Field Harvest*, *Dark Store Gate*, *Command Center*), and an *Intelligence Studios* dropdown menu.
   - **Tablet & Mobile**: Dedicated hamburger toggle opening an animated slide-over drawer with distinct sections for Core Paradigms, Intelligence Studios, Quick Actions, and System Status.
3. **Workspace Context Hero Bar (`src/App.tsx`)**:
   - Dynamically adapts based on active studio or inspection mode.
   - Displays clear breadcrumb metadata, specimen identifiers, and status chips.
   - Integrated action dock offering direct PDF certificate downloads, chat mode activation, and return buttons.
4. **Adaptive Viewport Grid**:
   - Desktop viewports split into a 5-column camera viewfinder and 7-column telemetry dock.
   - Tablet and mobile viewports seamlessly stack into a touch-friendly vertical flow.
   - Interactive handheld phone frame simulation toggle allows desktop operators to preview the field scout experience.

---

## 7. Interactive Agent Chat Mode (`POST /api/chat`) & Dynamic Skills Studio

AgriGrade features an interactive conversational system grounded strictly in verified scan telemetry, with support for 9 distinct specialist personas:
- **Zero-Hallucination Directives**: When querying `/api/chat`, the model is strictly bound to the active `AgriGradeReport`. If no scan exists, it prompts for a scan rather than hallucinating metrics.
- **9 Specialist Personas + Supervisor (`AgentFocusType`)**:
  - `swarm`: Swarm Orchestrator & Synthesis Supervisor.
  - `agent_1`: Optical Phenotyping (Maturity, Variety & Caliper Specialist).
  - `agent_2`: Defect Segmentation (Surface Integrity & Bruise Specialist).
  - `agent_3`: Kinetic Respiration Twin (Arrhenius Bio-Decay & Cold-Chain Specialist).
  - `agent_4`: Commercial Rules Engine (Customer Tolerances & Dock Gatekeeper).
  - `agent_5`: Demand Forecasting (Store Velocity & Waste Hazard Specialist).
  - `agent_6`: Intelligent Routing (Network Allocation & Logistics Specialist).
  - `agent_7`: Dynamic Pricing (Margin Optimization & Price Elasticity Specialist).
  - `agent_8`: Root Cause Forensics (Supply Chain Forensics & Vendor Risk Specialist).
  - `agent_9`: Closed-Loop Calibration (Outcome Feedback & Continual Retraining Specialist).
- **Interactive Swarm Blueprint Studio (`MultiAgentModal.tsx`)**:
  - 5-tab inspector: Swarm Topology & DAG, Agent Skills Catalog (28+ active and expansion skills), Hardened System Instructions & Prompts, Inter-Agent Data Contracts, and Autonomous Self-Healing / Failure Modes.
  - One-click copyable production system prompts and skill JSON schemas (`src/data/agentSkillsMatrix.ts`).
- **Interactive Citation Badges**: Responses cite verified report metrics (e.g., `Stage 4 Pink`, `Firmness 4.8 kg/cm²`, `Bruise Index 12.4%`).
- **Deterministic Offline Fallback**: If `GEMINI_API_KEY` is absent or unreachable, `server.ts` employs a deterministic fact extraction parser directly answering key metrics.

---

## 8. AgriGrade 2.1 Enterprise Capabilities & Extensions

1. **Decoupled Biophysics Engine (`/api/physics/recalculate`)**:
   - Heavy Gemini multimodal vision runs once upon image capture/preset change.
   - All subsequent slider changes (temperature, transit hours, distance, cold chain sensors) call `/api/physics/recalculate` with cached optical data.
   - Provides sub-5ms reactive recalculation without re-uploading massive Base64 payloads.

2. **Crate Lot Sampling Mode (`CrateLotSamplingModal.tsx`, `/api/grade/crate-sample`)**:
   - Simulates and audits 20-specimen crate lots according to USDA/Codex Alimentarius standards.
   - Computes statistical lot yield (% Grade A, % Grade B, % Cull/Reject) and recommends lot acceptance or dynamic markdowns.

3. **Zebra TSPL Thermal Label Generator (`ThermalLabelModal.tsx`, `/api/barcode/generate-label`)**:
   - Produces raw TSPL thermal printer code, Code 128 barcodes, and 2D QR codes for 4"×3" crate stickers and 2"×1" shelf tags.
   - Supports native printing dialog and instant clipboard copy.

4. **Arrhenius "What-If" Sensitivity & Cold-Chain ROI Simulator (`WhatIfSimulatorModal.tsx`)**:
   - Models thermal transit excursions (15°C–45°C, 0–12h) vs. chilled reefer freight.
   - Computes biological shelf-life lost vs. saved, financial cargo loss, reefer rental ROI, and salvage recovery.

5. **Server-Side File Persistence (`runtime_store.json`)**:
   - In `server.ts`, commercial rules, alerts, audit trails, and feedback loop metrics are persisted to `runtime_store.json`.
   - On server startup, `loadRuntimeStore()` restores all configurations and calibrations.

6. **Role-Based Workspace Topology**:
   - Navigation is driven by `WorkspaceTab` ('INSPECTION', 'COMMAND_CENTER', 'RULES_ENGINE', 'SUPPLY_CHAIN', 'FEEDBACK_LEDGER', 'COMMODITY_DB', 'CHAT_SWARM').
   - `OperationalRole` ('FIELD_SCOUT', 'DOCK_QC', 'SUPPLY_CHAIN_LEAD') automatically configures view presets and available tools.

---

## 9. Guidelines for Modifying Code

1. **Never mock or fake external integrations**: When creating features like QR scanning or PDF generation, use real working libraries (`jsqr`, `jspdf`, `recharts`), never stub timeouts or dummy alert boxes.
2. **Never change port 3000**: Port 3000 is required by the container environment.
3. **Always preserve fallback heuristics**: `server.ts` includes deterministic mathematical generation for when `GEMINI_API_KEY` is not populated or offline. Never remove this fallback.
4. **Type imports must be at top-level**: Always use standard TypeScript `import type { ... } from './types'`.
5. **Icon imports**: Must come strictly from `lucide-react`. Do not create inline SVGs.
6. **Animations**: Use `motion` imported strictly from `motion/react`.
7. **Always verify compilation**: Run `npm run lint` and `npm run build` after changes.
