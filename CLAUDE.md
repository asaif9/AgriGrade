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
| **Styling** | Tailwind CSS v4 | Imported via `@import "tailwindcss";`, no CSS modules |
| **Animations** | Motion (`motion/react`) | Used in `KineticDecayWidget.tsx` for bar depletion |
| **Icons** | Lucide React | All icons imported strictly from `lucide-react` |
| **Charts** | Recharts v3 | Rejection rate bar & line trend chart in `SupplierRejectionAnalytics.tsx` |
| **QR Code Scanner** | jsQR | Decodes video stream canvases in `CameraViewfinder.tsx` |
| **PDF Generation** | jsPDF v4 | Formats official certificates in `src/utils/pdfReportGenerator.ts` |
| **Server** | Express 4 + Node.js ESM | Binds strictly to `0.0.0.0:3000` |
| **AI Vision Model** | Gemini 3.8 Flash (`@google/genai`) | Model alias: `gemini-3.8-flash`, initialized lazily |
| **Build Tooling** | Vite 8 + esbuild + tsx | Dual pipeline for SPA client + bundled Node server |

---

## 3. Architecture & Data Flow

```
User Input (Live Video / Image Upload / Preset)
                        │
                        ▼
      [CameraViewfinder.tsx / App.tsx]
      - Canvas capture & rasterization
      - jsQR barcode/crate detection
                        │
                        ▼  POST /api/grade
            [server.ts (Port 3000)]
      - Multi-Agent prompt orchestration
      - Google Gemini 3.8 Flash vision call
      - Fallback deterministic heuristic engine
      - Q10 Respiration kinetic decay math
                        │
                        ▼  Returns AgriGradeReport
                 [App.tsx State]
        ┌───────────────┴───────────────┐
        ▼                               ▼
[FIELD_PRE_HARVEST]            [DARK_STORE_INBOUND]
- FieldHarvestDecision.tsx      - DarkStoreQualityGate.tsx
  - USDA Stage 1-6 selector       - Grade A / B / Reject badge
  - Transit viability score       - Dynamic discount slider
  - Lorry dispatch pass           - Recharts rejection history
                                  - ERP SAP sync webhook
        │                               │
        └───────────────┬───────────────┘
                        ▼
           [Shared Analysis & Reporting]
           - KineticDecayWidget.tsx (thermal depletion bar)
           - MultiAgentTrace.tsx (agent latency & steps)
           - SupplyChainEconomics.tsx (financial ROI)
           - AuditHistorySection.tsx (chronological ledger)
           - pdfReportGenerator.ts (official PDF certificate)
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

---

## 5. Critical Files & Their Roles

- `server.ts`:
  - Handles `/api/health`, `/api/erp/sync-batch`, `/api/grade`, and `/api/chat`.
  - Lazy loads `@google/genai` client only when `process.env.GEMINI_API_KEY` is present.
  - Implements the complete deterministic biological respiration engine for instant fallback without API keys.
  - Hosts Vite middleware in dev; serves `dist/index.html` in production.
  - Bundled by `esbuild` to CommonJS (`dist/server.cjs`). Uses `process.cwd()` for paths (avoid `import.meta.url` which causes runtime errors in CJS).
- `src/App.tsx`:
  - Central brain holding `report`, `mode`, `ambientTemp`, `transitHours`, `transitKm`, `storageMethod`, `batchId`, `auditHistory`, and `isChatMode`.
  - Coordinates PDF downloads (`handleDownloadPdf`) and Agent Chat Mode toggle.
  - Implements mobile simulation frame toggle.
- `src/components/AgentChatMode.tsx`:
  - Grounded interactive conversational interface with specialist persona selector (`swarm`, `phenotyping`, `pathology`, `kinetic`, `gatekeeper`).
  - Renders live scan telemetry snapshot and returns cited metric badges.
- `src/components/SupplierRadarComparison.tsx`:
  - 5-axis benchmark radar visualization comparing multiple regional farm suppliers.
- `src/utils/pdfReportGenerator.ts`:
  - Generates multi-page formatted certificates.
  - Uses `doc.roundedRect` for styled cards and metric blocks.
  - Conditionally prints either Inbound WMS disposition or Field Transit guidance.
- `src/components/KineticDecayWidget.tsx`:
  - Interactive temperature slider ($16^\circ\text{C} - 42^\circ\text{C}$).
  - Uses `motion.div` from `motion/react` to animate the shelf-life depletion bar smoothly.
- `src/components/CameraViewfinder.tsx`:
  - Manages WebRTC video stream (`navigator.mediaDevices.getUserMedia`).
  - Draws optical bounding boxes around detected produce defects.
  - Contains continuous requestAnimationFrame loop reading video frames into `jsQR` to decode crate tags.

---

## 6. Development Rules & Common Pitfalls

1. **Avoid TypeScript Missing Property Errors**:
   - In `report.inbound_action`, use `action.disposition_notes` and `action.erp_routing_tag` (do not invent non-existent fields like `dock_action_summary`).
   - In `report.harvest_guidance`, use `guidance.target_channel` and `guidance.harvest_risk_assessment`.
2. **Icons**:
   - Always import from `lucide-react`. Never create raw inline SVGs.
3. **Animations**:
   - Always import from `motion/react` (e.g. `import { motion } from 'motion/react'`).
4. **Port 3000**:
   - Do NOT change the port or attempt to bind to `3001` or `5173`. Port 3000 is required by the container reverse proxy.
5. **No Alert or Window.Open in iFrame**:
   - Avoid `window.alert()` or `window.open()`; use in-app modals (`MultiAgentModal.tsx`) or direct downloads (`doc.save(...)`).
