# AgriGrade: Autonomous Multi-Agent Produce Quality & Supply Chain Intelligence

AgriGrade is an enterprise-grade, dual-mode multi-agent AI computer-vision and kinetic shelf-life prediction platform designed to eliminate agricultural post-harvest food waste, optimize farm-to-fork dispatch logistics, and automate quick-commerce dark store inbound quality gating.

Powered by Google's **Gemini 3.8 Flash** multimodal model alongside deterministic biological respiration kinetic engines, AgriGrade bridges the critical gap between farm-gate harvest decisions and automated warehouse distribution.

---

## 🌾 The Problem: Agricultural Post-Harvest Loss & Dark Store Shrink

In fast-paced agricultural supply chains and 10-minute quick-commerce delivery networks (e.g., Zepto, Blinkit, Instamart, Gopuff):
1. **Subjective Harvest Timing**: Farmers harvest crops too ripe for long transit (>100 km) or too green for immediate retail, resulting in 25–40% spoilage before reaching consumers.
2. **Dock Rejection Bottlenecks**: Dark store receiving docks rely on manual, inconsistent visual inspections, causing delayed unload times and high rejection rates (12–18%).
3. **Thermal Shock & Cold-Chain Failure**: Ambient lorries operating at 28°C–38°C drastically accelerate respiration rates ($Q_{10}$ decay factor), causing produce to arrive overripe or bruised.
4. **All-or-Nothing Rejection Loss**: Rejected crates are often discarded or returned at catastrophic loss to suppliers, rather than dynamically discounted or routed to fast-track fulfillment.

---

## ⚡ Dual-Mode Operational Architecture

AgriGrade operates in two distinct operational operational paradigms tailored to each stage of the fresh supply chain:

### 1. 🚜 Field Pre-Harvest Decision Support (`FIELD_PRE_HARVEST`)
- **Target User**: Agronomists, field scouts, harvest managers, and farm co-ops.
- **Workflow**:
  - Live camera or uploaded photos evaluate crop maturity in the field.
  - Computes the official **USDA 6-Stage Maturity Index** (e.g., Stage 1 Green through Stage 6 Red for tomatoes).
  - Simulates transit distance (km) and estimated transit hours under ambient vs. reefer transport.
  - Delivers a definitive binary decision: **Harvest Today** vs. **Hold in Field**.
  - Recommends target logistics channels: Long-haul distribution center (>100 km), local dark store (<24h), farm-gate sale, or processing diversion.
  - Generates verifiable **Official PDF Lorry Passes** certifying harvest maturity parameters for transit.

### 2. 🏬 Dark Store Inbound Quality Gate (`DARK_STORE_INBOUND`)
- **Target User**: Inbound dock receiving managers, dark store QC inspectors, warehouse operations.
- **Workflow**:
  - Crates are scanned via live camera, preset samples, or high-resolution batch uploads.
  - Optical bounding-box defect detection identifies mechanical compression, blossom-end rot, skin ruptures, sunscald, and fungal lesions.
  - Real-time **QR code scanning** auto-populates crate Batch IDs and Supplier Cluster metadata.
  - Automated 3-tier dock disposition:
    - **Grade A (Accepted)**: Premium retail bin, standard pricing (with visual pulse highlight on scan completion).
    - **Grade B (Accepted with Fast-Track Routing)**: Dynamic markdown discount (5%–30%) and expedited pick-and-pack routing before shelf-life expires.
    - **Rejected at Dock**: Defect index exceeds commercial tolerance threshold; automated supplier return documentation.
  - **Multi-Supplier Radar Benchmark & Trend Analytics**: Interactive Recharts radar visualization comparing suppliers across Quality Consistency, Rejection Avoidance against 5% SLA, Grade A Yield %, Cold-Chain Discipline, and Firmness Integrity, complemented by a 30-day rejection trend chart and CSV export.
  - **Predictive Kinetic Decay Heat-Map**: Integrated $2^\circ\text{C}$ to $30^\circ\text{C}$ storage temperature variation grid calculating shelf-life days and delta impacts under ambient vs. cold-chain protocols.
  - Instant one-click ERP & WMS webhook sync (SAP AgriChain & DarkStore WMS simulation).
  - Downloadable **PDF Quality Gate Certificates**.

### 3. 💬 Zero-Hallucination Multi-Agent Chat Mode (`AGENT_CHAT_MODE`)
- **Target User**: Agronomists, procurement officers, supply chain analysts, dock managers.
- **Workflow**:
  - Full-screen or modal interactive conversational console directly tethered to the active inspection report.
  - Users can question the **Cross-Agent Consensus** or direct inquiries to specific agents:
    - *Agent 1: Optical Phenotyping Lead* (Maturity stage, color ratio, Brix, variety)
    - *Agent 2: Defect & Bruise Pathology Lead* (Bruise depth, skin tears, fungal spots)
    - *Agent 3: Kinetic Respiration Lead* (Arrhenius thermal shelf-life, Q10 acceleration)
    - *Agent 4: Supply Chain Gatekeeper* (Accept/Reject rationale, ERP routing, dynamic discount)
  - Zero-hallucination constraint: strictly grounded in scan telemetry, returning agent badges and cited metric chips.
  - Deterministic facts-extraction fallback when running offline or without Gemini API key.

---

## 🧠 Autonomous Multi-Agent Swarm Architecture

AgriGrade executes four specialized, orchestrated AI agents for every inspection:

```
                  ┌─────────────────────────────────┐
                  │       Inspection Payload        │
                  │   (Base64 Image + Logistics)    │
                  └────────────────┬────────────────┘
                                   │
         ┌─────────────────────────┴─────────────────────────┐
         ▼                                                   ▼
┌───────────────────────────────┐           ┌───────────────────────────────┐
│   1. Vision Phenotyping       │           │ 2. Defect & Bruise Pathology   │
│   Agent (Optical Sensor)      │           │    Agent (Surface Anomaly)    │
├───────────────────────────────┤           ├───────────────────────────────┤
│ • USDA 6-stage maturity scale │           │ • Mechanical bruise detection │
│ • Spectral pigment breakdown  │           │ • Pathological lesions (rot)  │
│ • Firmness penetrometer est.  │           │ • Cumulative defect index     │
│ • Variety identification      │           │ • Severity classification     │
└───────────────┬───────────────┘           └───────────────┬───────────────┘
                │                                           │
                └─────────────────────┬─────────────────────┘
                                      │
                                      ▼
                  ┌────────────────────────────────────────┐
                  │ 3. Kinetic Shelf-Life Decay Engine     │
                  │    (Biochemical Arrhenius/Q10 Model)   │
                  ├────────────────────────────────────────┤
                  │ • Respiration acceleration via Q10     │
                  │ • Bruise decay penalty multiplier      │
                  │ • Ambient vs. Chilled shelf-life days  │
                  │ • Real-time interactive thermal slider │
                  └───────────────────┬────────────────────┘
                                      │
                                      ▼
                  ┌────────────────────────────────────────┐
                  │ 4. Supply Chain & Logistics Gatekeeper │
                  │    (Autonomous Decision Synthesizer)   │
                  ├────────────────────────────────────────┤
                  │ • Field: Harvest Window & Lorry Tier   │
                  │ • Dock: Gate Verdict (Grade A/B/Reject)│
                  │ • Dynamic Markdown Discount Optimizer  │
                  │ • ERP Routing Tag Allocation           │
                  └────────────────────────────────────────┘
```

1. **Vision Phenotyping Agent**: Classifies produce type, exact biological variety (e.g., Roma, Beefsteak, Cavendish, Gala), and computes precise 4-channel spectral ratios (Green, Yellow, Pink/Orange, Deep Red).
2. **Defect & Bruise Pathology Agent**: Localizes physical trauma, catfacing, mold, and micro-punctures with percentage surface area and bounding boxes.
3. **Kinetic Post-Harvest Decay Agent**: Simulates daily degradation rates and calculates remaining marketable shelf-life under variable ambient temperatures ($16^\circ\text{C} - 42^\circ\text{C}$).
4. **Supply Chain Gatekeeper Agent**: Synthesizes phenotyping, pathological, and kinetic findings into actionable warehouse or field directives.

---

## 📐 Deterministic Kinetic Decay Physics Engine

Produce deterioration is non-linear and biologically governed by respiration rate escalation as temperature increases. AgriGrade models shelf-life $SL$ using an empirical agricultural Arrhenius/$Q_{10}$ equation:

$$\text{TempFactor} = Q_{10}^{-\frac{T_{\text{actual}} - T_{\text{ref}}}{10}}$$

$$\text{RipenessFactor} = \max\left(0.05, 1.0 - \frac{\text{Ripeness}\%}{100}\right)$$

$$D_{\text{bruise}} = \min\left(0.8, \frac{\text{BruiseDefectIndex}}{100} \times 0.9\right)$$

$$\text{ShelfLife}_{\text{ambient}} = SL_{\text{base}} \times \text{RipenessFactor} \times \text{TempFactor} \times (1.0 - D_{\text{bruise}})$$

### Commodity Parameters:
| Commodity | Baseline Life $SL_{\text{base}}$ | Reference Temp $T_{\text{ref}}$ | Respiration Coeff $Q_{10}$ |
| :--- | :--- | :--- | :--- |
| **Tomato** | 18.0 days | 13.0°C | 2.1 |
| **Apple** | 32.0 days | 4.0°C | 2.2 |
| **Banana** | 14.0 days | 14.0°C | 2.4 |
| **Bell Pepper** | 16.0 days | 8.0°C | 2.0 |
| **Grains** | 180.0 days | 20.0°C | 1.4 |

---

## 🛠️ Tech Stack & Architecture

- **Frontend**:
  - React 19 + TypeScript (Strict Mode)
  - Vite 8 with `@vitejs/plugin-react`
  - Tailwind CSS v4 with `@tailwindcss/vite`
  - Lucide React (featherweight SVG icons)
  - Motion (`motion/react`) for smooth physical transitions
  - Recharts for supplier rejection rate trend analysis
  - jsQR for real-time video stream crate barcode/QR decoding
  - jsPDF for automated, formatted audit certificates
- **Backend**:
  - Node.js + Express
  - `@google/genai` (Google Gen AI SDK v2.4+) with `gemini-3.8-flash`
  - `tsx` for TypeScript runtime execution
  - `esbuild` for production bundling (`dist/server.cjs`)
  - Deterministic mathematical fallback engine when running without API keys

---

## 🚀 Getting Started

### Prerequisites
- Node.js 20+ installed
- npm or bun

### 1. Installation
```bash
npm install
```

### 2. Environment Setup
Create a `.env` file from `.env.example`:
```bash
cp .env.example .env
```
Add your Google Gemini API key:
```env
GEMINI_API_KEY=your_actual_gemini_api_key_here
```
*(Note: If no API key is provided, the platform seamlessly runs on deterministic biological simulation heuristics).*

### 3. Development Server
Starts the full-stack server on `http://localhost:3000`:
```bash
npm run dev
```

### 4. Production Build & Start
```bash
npm run build
npm run start
```

### 5. Linting & Validation
```bash
npm run lint
```

---

## 📡 API Endpoints

### `POST /api/grade`
Performs multi-agent inspection on an uploaded image.
- **Request Body**:
  ```json
  {
    "image_b64": "data:image/jpeg;base64,...",
    "mode": "FIELD_PRE_HARVEST" | "DARK_STORE_INBOUND",
    "crop_type_hint": "Tomato",
    "ambient_temp_celsius": 28.0,
    "transit_hours_to_hub": 10,
    "transit_distance_km": 120,
    "storage_method": "AMBIENT_LORRY" | "CHILLED_REEFER",
    "batch_id": "CRATE-4892",
    "supplier_name": "Nashik Agro Cluster"
  }
  ```
- **Response**: Full `AgriGradeReport` schema including maturity stage, defect index, firmness estimate, kinetic parameters, agent traces, and domain actions.

### `GET /api/health`
Returns service operational status, Gemini connectivity, model version, and server timestamp.

### `POST /api/erp/sync-batch`
Simulates webhook integration with Enterprise Resource Planning (SAP AgriChain / DarkStore WMS).

### `POST /api/chat`
Zero-hallucination interactive chat query grounded in verified produce scan telemetry.
- **Request Body**:
  ```json
  {
    "message": "Why was this batch graded B instead of A?",
    "history": [],
    "report": { ... },
    "agentFocus": "swarm" | "phenotyping" | "pathology" | "kinetic" | "gatekeeper",
    "batchId": "CRATE-4892",
    "ambientTemp": 28
  }
  ```
- **Response**:
  ```json
  {
    "reply": "Agent Gatekeeper explanation...",
    "agentBadge": { "name": "Supply Chain Gatekeeper", "role": "Commercial Dispatch Lead", "color": "blue" },
    "metricsCited": ["Firmness: 3.2 kg/cm²", "Defects: 18.5%", "Ambient Shelf-Life: 4.2d"],
    "confidence": 0.98
  }
  ```

---

## 📄 License
Proprietary agricultural technology software. Engineered for commercial quick-commerce and supply chain deployment.
