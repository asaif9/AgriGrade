# AGENT.MD: System Architecture & Development Guidelines for AI Coding Agents

This document serves as the permanent technical specification, architecture handbook, and operational contract for AI coding agents (Antigravity, Gemini, Claude, Copilot) maintaining and extending the **AgriGrade** platform.

---

## 1. System Identity & Mission

**AgriGrade** is an autonomous multi-agent computer vision and agricultural kinetic decay platform that operates in two environments:
1. **Field Pre-Harvest Mode (`FIELD_PRE_HARVEST`)**: Determines whether crops should be harvested immediately or held in the field, optimizing for transit distance, ambient temperature, and downstream channel viability.
2. **Dark Store Inbound Quality Gate (`DARK_STORE_INBOUND`)**: Automates crate acceptance, grading (Grade A, Grade B with fast-track dynamic discounting, or Dock Rejection), supplier defect compliance, and ERP warehouse sync.

---

## 2. Core Operational Constraints & Environment Rules

1. **Port & Reverse Proxy Rules**:
   - The application runs inside a sandboxed Cloud Run container behind an Nginx reverse proxy.
   - **Port 3000 is the ONLY accessible port.**
   - All server listeners (`server.ts`) **MUST** bind to `0.0.0.0` and port `3000`. Never change the port.
2. **Full-Stack Architecture (Server + Client)**:
   - Client is a Single-Page Application (React 19 + Vite 8).
   - Server is an Express 4 backend running in Node.js ESM.
   - **All Gemini API calls MUST be executed server-side in `server.ts`** using `process.env.GEMINI_API_KEY`.
   - Secret API keys must never be prefixed with `VITE_` or sent to the browser.
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
├── vite.config.ts                  # Vite config with Tailwind CSS and React plugins
├── tsconfig.json                   # TypeScript configuration
├── public/                         # Static assets and demo produce images
└── src/
    ├── main.tsx                    # React client mount point
    ├── App.tsx                     # Top-level state container, camera controller, scan coordinator, PDF triggers, chat mode toggle
    ├── types.ts                    # Canonical TypeScript interfaces (AgriGradeReport, HarvestAction, InboundAction, etc.)
    ├── data/
    │   └── presets.ts              # Preset produce specimens (Roma tomato, Cavendish banana, Gala apple, Bell pepper)
    ├── components/
    │   ├── Header.tsx              # Application header, mode indicator, mobile simulation toggle, status badge, chat toggle
    │   ├── CameraViewfinder.tsx    # Live camera stream, Canvas rasterizer, QR decoder (jsQR), bounding-box HUD
    │   ├── KineticDecayWidget.tsx  # Dynamic shelf-life calculator, thermal slider, reefer toggle, motion decay bar
    │   ├── FieldHarvestDecision.tsx# USDA 6-stage maturity selector, transit viability, lorry pass export, ask agents trigger
    │   ├── DarkStoreQualityGate.tsx# Dock disposition, dynamic markdown discount slider, ERP webhook trigger, ask agents trigger
    │   ├── SupplierRejectionAnalytics.tsx # Recharts 30-day historical supplier rejection trend chart
    │   ├── SupplierRadarComparison.tsx    # 5-axis benchmark radar chart comparing supplier consistency & SLA compliance
    │   ├── MultiAgentTrace.tsx     # Step-by-step telemetry list showing the 4 agents and execution latency
    │   ├── MultiAgentModal.tsx     # Detailed inspection modal with agent reasoning and payload inspection
    │   ├── AgentChatMode.tsx       # Grounded Q&A interface with specialist selector, telemetry snapshot, and citation badges
    │   ├── SupplyChainEconomics.tsx# Economic calculation cards (shrinkage savings, margin, revenue recovery)
    │   └── AuditHistorySection.tsx # Collapsible session audit ledger, filtering, search, CSV & PDF export
    └── utils/
        ├── imageRasterizer.ts      # Downsamples camera captures, handles SVG to raster conversion
        └── pdfReportGenerator.ts   # jsPDF multi-page inspection report & certification generator
```

---

## 4. Multi-Agent Pipeline & Data Schema

Each inspection invokes an autonomous multi-agent pipeline returning a structured `AgriGradeReport`.

### The 4 Agents:
1. **Vision Phenotyping Agent (`agent_phenotyping`)**:
   - Identifies produce type, exact biological variety (e.g. *Roma*, *Beefsteak*).
   - Computes USDA maturity stage (1 = Green to 6 = Red).
   - Calculates 4-channel spectral breakdown percentages: `green_pct`, `yellow_pct`, `pink_orange_pct`, `deep_red_pct`.
   - Estimates firmness penetrometer resistance ($kg/cm^2$).
2. **Pathological Defect & Bruise Agent (`agent_pathology`)**:
   - Detects bruises, blossom-end rot, skin ruptures, sunscald, fungal lesions.
   - Calculates cumulative `bruise_defect_index` ($0.0 - 100.0$).
   - Returns bounding boxes with normalized coordinates: `{ x, y, width, height }`.
3. **Kinetic Post-Harvest Decay Agent (`agent_kinetic_decay`)**:
   - Applies the agricultural $Q_{10}$ respiration decay formula.
   - Computes marketable shelf life at ambient temperature ($SL_{\text{ambient}}$) and cold chain ($SL_{\text{cold}}$).
   - Calculates daily decay rate percentage.
4. **Supply Chain & Logistics Gatekeeper Agent (`agent_gatekeeper`)**:
   - For `FIELD_PRE_HARVEST`: Evaluates `should_harvest_today`, `optimal_harvest_window`, `target_channel`, `transit_viability_score`.
   - For `DARK_STORE_INBOUND`: Evaluates `verdict` (`ACCEPTED_GRADE_A`, `ACCEPTED_GRADE_B`, `REJECTED_AT_DOCK`), `quality_score`, `fast_track_dispatch_required`, `recommended_dynamic_discount_percent`, `erp_routing_tag`.

---

## 5. Kinetic Decay Mathematical Formulations

To ensure biological accuracy, shelf-life calculations must adhere to the following formulas in `server.ts`:

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

## 6. Key Integration Interfaces & Type Contracts

```typescript
// From /src/types.ts
export type InspectionMode = 'FIELD_PRE_HARVEST' | 'DARK_STORE_INBOUND';
export type USDAMaturityStage = 1 | 2 | 3 | 4 | 5 | 6;

export interface InboundAction {
  verdict: 'ACCEPTED_GRADE_A' | 'ACCEPTED_GRADE_B' | 'REJECTED_AT_DOCK';
  quality_score: number; // 0 - 100
  fast_track_dispatch_required: boolean;
  dispatch_window_hours?: number;
  recommended_dynamic_discount_percent: number;
  erp_routing_tag: string;
  disposition_notes: string;
  compliance_check_passed: boolean;
}

export interface HarvestAction {
  should_harvest_today: boolean;
  optimal_harvest_window: string;
  target_channel: string;
  transit_viability_score: number;
  harvest_risk_assessment: string;
  field_action_steps: string[];
}
```

---

## 7. Guidelines for Modifying Code

1. **Never mock or fake external integrations**: When creating features like QR scanning or PDF generation, use real working libraries (`jsqr`, `jspdf`, `recharts`), never stub timeouts or dummy alert boxes.
2. **Never change port 3000**: Port 3000 is required by the container environment.
3. **Always preserve fallback heuristics**: `server.ts` includes deterministic mathematical generation for when `GEMINI_API_KEY` is not populated or offline. Never remove this fallback.
4. **Type imports must be at top-level**: Always use standard TypeScript `import type { ... } from './types'`.
5. **Icon imports**: Must come strictly from `lucide-react`. Do not create inline SVGs.
6. **Animations**: Use `motion` imported strictly from `motion/react`.
7. **Always verify compilation**: Run `npm run lint` and `npm run build` after changes.

---

## 8. Interactive Agent Chat Mode (`POST /api/chat`)

AgriGrade features an interactive conversational system grounded strictly in verified scan telemetry:
- **Zero-Hallucination Directives**: When querying `/api/chat`, the model is strictly bound to the active `AgriGradeReport`. If no scan exists, it prompts for a scan rather than hallucinating metrics.
- **Specialist Personas**: Queries can be directed to `swarm` (Consensus Lead), `phenotyping` (Visual Phenotyping Lead), `pathology` (Defect & Bruise Pathology Lead), `kinetic` (Kinetic Respiration Decay Lead), or `gatekeeper` (Supply Chain Gatekeeper).
- **Deterministic Offline Fallback**: If `GEMINI_API_KEY` is absent or unreachable, `server.ts` employs a deterministic fact extraction parser directly answering key metrics (Maturity stage, Firmness, Bruise Index, Ambient Days, Gate Verdict).
