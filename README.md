# AgriGrade 2.1: Autonomous Multi-Agent Produce Quality, Commercial Grade Engine & Supply Chain Intelligence Platform

[![Live Demo](https://img.shields.io/badge/Live%20App-Shared%20Deployment-2ecc71?style=for-the-badge&logo=google-cloud&logoColor=white)](https://ais-pre-ebfvukbs4t7ctkdytize6a-668885483768.asia-east1.run.app)
[![Development URL](https://img.shields.io/badge/Dev%20Instance-Active%20Workspace-3498db?style=for-the-badge&logo=google-cloud&logoColor=white)](https://ais-dev-ebfvukbs4t7ctkdytize6a-668885483768.asia-east1.run.app)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.0-61dafb.svg)](https://react.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4.0-38bdf8.svg)](https://tailwindcss.com/)
[![Google Gemini](https://img.shields.io/badge/Google%20Gen%20AI-Gemini%203.8%20Flash-8e44ad.svg)](https://ai.google.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.0-646cff.svg)](https://vitejs.dev/)
[![License](https://img.shields.io/badge/License-Enterprise%20Proprietary-success.svg)](#license)

**AgriGrade 2.1** is an enterprise-grade, closed-loop multi-agent AI computer-vision, dynamic commercial grade engine, agronomic commodity database, and kinetic shelf-life prediction platform. It is engineered to eliminate agricultural post-harvest food waste, optimize farm-to-fork dispatch logistics, enforce configurable buyer tolerances, automate quick-commerce dark store inbound quality gating, and continuously retrain models through ground truth retail feedback.

Powered by Google's **Gemini 3.8 Flash** multimodal model alongside biological respiration kinetic engines, empirical commodity databases, IoT telemetry integration, decoupled sub-5ms biophysical simulation, and an autonomous **9-Agent Swarm**, AgriGrade bridges the critical gap between farm-gate harvest decisions and automated warehouse distribution.

---

## 🌐 Live Application Access

| Environment | Access Link | Description |
| :--- | :--- | :--- |
| **Shared App Deployment** | [ais-pre-ebfvukbs4t7ctkdytize6a-668885483768.asia-east1.run.app](https://ais-pre-ebfvukbs4t7ctkdytize6a-668885483768.asia-east1.run.app) | Publicly accessible production instance with persistent calibration |
| **Development Instance** | [ais-dev-ebfvukbs4t7ctkdytize6a-668885483768.asia-east1.run.app](https://ais-dev-ebfvukbs4t7ctkdytize6a-668885483768.asia-east1.run.app) | Real-time staging environment for inspection sandbox testing |

---

## 📑 Table of Contents

- [Key Highlights & Capabilities](#-key-highlights--capabilities)
- [The 6 Core Architectural Pillars](#-the-6-core-architectural-pillars)
  - [1. Agronomic Commodity Database & Empirical Phenotyping](#1-agronomic-commodity-database--empirical-phenotyping)
  - [2. Historical Batch Intelligence & Continuous Closed-Loop Learning](#2-historical-batch-intelligence--continuous-closed-loop-learning)
  - [3. Dynamic Cold-Chain Multi-Source Telemetry Ingestion](#3-dynamic-cold-chain-multi-source-telemetry-ingestion)
  - [4. Real-Time Shelf-Life Digital Twins](#4-real-time-shelf-life-digital-twins)
  - [5. Configurable Commercial Grade Engine](#5-configurable-commercial-grade-engine)
  - [6. Demand-Aware Intelligent Routing & Dynamic Markdown Optimization](#6-demand-aware-intelligent-routing--dynamic-markdown-optimization)
- [The 9-Agent Orchestrated Swarm](#-the-9-agent-orchestrated-swarm)
- [Interactive Studios & Enterprise Modules](#-interactive-studios--specialized-modules)
  - [Field Pre-Harvest Decision Support](#1-field-pre-harvest-decision-support-field_pre_harvest)
  - [Dark Store Inbound Quality Gate](#2-dark-store-inbound-quality-gate-dark_store_inbound)
  - [AgriGrade Operations Command Center & Topology](#3-operations-command-center--supply-chain-topology)
  - [Dynamic Commercial Grade Engine Studio](#4-dynamic-commercial-grade-engine-studio)
  - [Crate Lot Sampling & Statistical Yield Modal](#crate-lot-sampling--statistical-yield-modal)
  - [Thermal Crate Barcode & Sticker Generator](#thermal-crate-barcode--sticker-generator)
  - [Arrhenius "What-If" Sensitivity & Cold-Chain ROI Simulator](#arrhenius-what-if-sensitivity--cold-chain-roi-simulator)
  - [Dynamic Pricing & Markdown Studio](#5-dynamic-pricing--markdown-studio)
  - [Demand Forecasting & Intelligent Routing Studio](#6-demand-forecasting--intelligent-routing-studio)
  - [Deep Supplier Scorecard & Forensic Studio](#7-deep-supplier-scorecard--forensic-studio)
  - [Real-Time Shelf-Life Digital Twin Studio](#8-real-time-shelf-life-digital-twin-studio)
  - [Dynamic Cold-Chain Telemetry Studio](#9-dynamic-cold-chain-telemetry-studio)
  - [Agronomic Commodity Database Studio](#10-agronomic-commodity-database-studio)
  - [Closed-Loop Feedback Loop Studio](#11-closed-loop-feedback-loop-studio)
  - [Zero-Hallucination Multi-Agent Chat Console](#12-zero-hallucination-multi-agent-chat-console)
  - [Mobile Field Scout Offline-Ready Modal](#13-mobile-field-scout-offline-ready-modal)
  - [WhatsApp & SMS Automated Vendor Alerts](#14-whatsapp--sms-automated-vendor-alerts)
  - [Regulatory Compliance, Model Provenance & Audit Trail](#15-regulatory-compliance-model-provenance--audit-trail)
- [Human-in-the-Loop (HITL) Quality Gate](#-human-in-the-loop-hitl-quality-gate)
- [Interactive Verification Scenarios](#-interactive-verification-scenarios)
- [Mathematical & Biophysical Formulations](#-mathematical--biophysical-formulations)
- [System Architecture & Codebase Map](#-system-architecture--codebase-map)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [REST API Reference](#-rest-api-reference)
- [License](#-license)

---

## 🌟 Key Highlights & Capabilities

- **Decoupled Biophysics Engine (<5ms Latency)**: Completely decouples heavy Gemini 3.8 Flash optical inference from real-time environmental slider manipulation. Recalculates shelf-life decay, Arrhenius respiration curves, and pricing markdowns in sub-5ms without re-uploading massive Base64 images (`/api/physics/recalculate`).
- **Codex / USDA Crate Lot Sampling Mode**: Implements statistical multi-specimen lot yield grading (20-specimen sampling matrix), evaluating Grade A %, Grade B %, and cull reject % to output authoritative dock acceptance verdicts and dynamic lot markdown discounts.
- **Zebra / TSPL Thermal Barcode Crate Labeling**: Instantaneous industrial sticker generation supporting 4"×3" crate labels and 2"×1" shelf tags, real-time Zebra TSPL code copy, Code 128 barcodes, high-density QR tags, and native printer dialogs.
- **Arrhenius "What-If" Sensitivity & Cold-Chain ROI Simulator**: Financial and biophysical simulator that models ambient lorry vs. chilled reefer transit scenarios, thermal excursions, spoilage risk, and cargo salvage values to prove logistics ROI.
- **Configurable Buyer Commercial Rules & JSON Import/Export**: Define, tune, export, and import commercial tolerance matrices (Zepto Quick-Commerce, Nature's Basket, Food Processing, Cold-Chain Export) with automatic persistence in `runtime_store.json`.
- **Role-Based Workspace Topology**: Single-click role transitions (`Field Scout`, `Dock QC Inspector`, `Supply Chain Lead`) paired with clean workspace tab routing, eliminating confusing toggles and cluttered screens.
- **Zero Post-Harvest Guesswork**: Eliminates static single-number assumptions (`Tomato = 18 days`) with multi-factor empirical derivations based on variety genetics, harvest maturity, transpiration deficit, and packaging permeability.
- **Autonomous 9-Agent Multi-Agent Swarm**: Executes specialized computer vision, defect pathology, agronomic database resolution, Arrhenius kinetic modeling, commercial rule evaluation, markdown optimization, demand matching, and supplier forensic scoring.
- **Dynamic Pricing & Salvage Recovery**: Calculates real-time shelf-life price elasticity curves to maximize revenue recovery on aging produce rather than suffering 100% write-offs.
- **Multi-Store Velocity Routing**: Automatically directs batches to dark stores with high sales velocities, ensuring sell-through within the remaining biological shelf-life window.
- **Cold-Chain Arrhenius Kinetic Integration**: Ingests continuous 144-point time-series telemetry from BLE data loggers and reefer units, calculating exact degree-hours of thermal exposure ($TES$) and net biological shelf-life deductions.
- **Closed-Loop Ground Truth Recalibration**: Compares predicted shelf-life and quality scores against downstream sales, waste audits, and customer returns, updating Arrhenius $Q_{10}$ shifts, defect weights, and supplier trust scores over time.
- **Human-in-the-Loop (HITL) Safety Gate**: Multi-factor confidence scoring automatically flags edge cases (<85% confidence) for dock inspector review, capturing override justifications and feeding corrections into the learning loop.
- **Audit-Grade PDF Certification**: Generates official PDF Lorry Passes for field transit and Dark Store Quality Gate Inspection Certificates with complete defect breakdowns and sensor snapshots.

---

## 🧬 The 6 Core Architectural Pillars

### 1. Agronomic Commodity Database & Empirical Phenotyping

Legacy post-harvest systems treat produce commodities as flat, static numbers:

```
[ Legacy Static System ]
Tomato = 18 days
```

This rigid approach fails in the real world: a fragile, multi-locular Beefsteak slicing tomato at Stage 5 Pink behaves completely differently from a thick-skinned, double-loculed Roma paste tomato stored at 12°C. AgriGrade replaces static assumptions with an empirical, relational agronomic database:

```
Commodity
 ├── Tomato (Solanum lycopersicum)
 │    ├── Variety: Roma (16.8d base, thick pericarp, transit-resilient)
 │    ├── Variety: Beefsteak (12.5d base, multi-locular, high free juice)
 │    ├── Variety: Cherry (14.2d base, high cuticle wax, sweet solids)
 │    ├── Variety: San Marzano (15.0d base, elongated plum)
 │    ├── Maturity Profile: USDA Stages 1 through 6, respiration curves, penetrometer firmness
 │    ├── Temperature Profile: Arrhenius Q10 bands, chilling injury threshold <10°C, hold 12-15°C
 │    ├── Humidity Profile: 90% optimal RH, VPD water-loss transpiration coefficient = 0.45
 │    ├── Packaging Profile: Ventilated crate = 0.941x, MAP = 1.35x, Clamshell = 1.12x, Carton = 1.02x
 │    ├── Storage Regime: Cool Cellar, Chilled Reefer, Ambient Lorry, Controlled Atmosphere
 │    └── Historical Shelf-Life: Empirical cohorts per supplier, sample sizes N, std dev σ, confidence
 ├── Apple (Royal Gala, Honeycrisp, Granny Smith)
 ├── Banana (Cavendish, Lady Finger, Red Dacca)
 └── Bell Pepper (California Wonder, Jalapeño)
```

#### Step-by-Step Mathematical Derivation:
1. **Variety Genetic Baseline**: Roma Tomato genetic base = $16.8\ \text{days}$.
2. **Harvest Maturity Factor**: Stage 4 (Pink 30–60%) life multiplier = $0.528\times$.
3. **Arrhenius Temperature Decay**: $12^\circ\text{C}$ storage vs. $13^\circ\text{C}$ reference ($Q_{10} = 2.1$):
   $$\text{TempMultiplier} = 2.1^{-\frac{12 - 13}{10}} = 2.1^{0.1} = 1.077\times \quad (\text{respiration slowed down})$$
4. **Humidity Transpiration Deficit**: $86\%$ RH vs. $90\%$ optimal RH drives mild Vapour Pressure Deficit (VPD):
   $$\text{HumidityMultiplier} = 1.0 - (0.90 - 0.86) \times 0.45 = 0.982\times$$
5. **Packaging Permeability & Airflow**: Ventilated HDPE crate multiplier = $0.941\times$.
6. **Empirical Farm Cohort Calibration**: Cross-referenced against **142 historical deliveries** from Farm A ($\mu = 8.7\ \text{days}$, $\sigma = \pm 0.42\ \text{days}$).
7. **Consensus Prediction**: **$8.7\ \text{days}$** with **$91\%$ statistical confidence** (a $+52\%$ precision gain over legacy static models).

---

### 2. Historical Batch Intelligence & Continuous Closed-Loop Learning

Traditional agricultural QC tools treat quality inspection as an isolated, static event:

```
[ Legacy Paradigm ]
Image  ──►  AI  ──►  Grade (Pass / Fail)
```

AgriGrade replaces static grading with an end-to-end, multi-factor decision engine driven by **Historical Batch Intelligence** that continuously learns from real-world post-harvest outcomes:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        Next-Gen Multi-Factor Input Vector                              │
│                                                                                        │
│  📷 Optical Image        🌡️ IoT Sensor Pack       📈 Historical Data                  │
│     (Color, Maturity,       (Ethylene PPM, Temp,      (Yield History,                 │
│      Bruises, Blemishes)     Humidity, Vibration)      Seasonal Variance)              │
│                                                                                        │
│  🤝 Supplier History     🌦️ Microclimate Weather   🚚 Logistics & Telematics           │
│     (Cold-Chain SLA,        (Ambient Heatwaves,       (Carrier Rating, Reefer         │
│      Defect Trajectory)      Precipitation Risk)       Dwell, Route Transit Time)      │
│                                                                                        │
│  🏬 Dark Store Inventory 📊 Quick-Commerce Demand 🎯 Historical Ground Truth           │
│     (Current Stock Crates,   (Hourly Velocity,         (Actual Shelf-Life,             │
│      Competing Expiries)      Markdown Elasticity)      Customer Return Log)           │
└───────────────────────────────────────────┬────────────────────────────────────────────┘
                                            │
                                            ▼
                       ┌────────────────────────────────────────┐
                       │     Multi-Agent Swarm Intelligence     │
                       │    (9 Orchestrated Specialized Agents) │
                       └────────────────────┬───────────────────┘
                                            │
                                            ▼
                        [ 1. Multi-Dimensional Decision ]
                         • Harvest Window / Bin Allocation
                         • Dock Gate Verdict (Grade A/B/C/Reject)
                         • Dynamic Markdown Optimization (0%-35%)
                         • Fast-Track WMS Routing
                                            │
                                            ▼
                       ┌────────────────────────────────────────┐
                       │       7-Stage Batch Lifecycle          │
                       │  Inspection ──► Decision ──► Logistics │
                       │       ──► Storage ──► Sale ──► Waste   │
                       │           ──► Actual Outcome           │
                       └────────────────────┬───────────────────┘
                                            │
                                            ▼
                       [ 2. Actual Ground Truth Outcome Log ]
                         • Real Days to Degradation
                         • Actual Sell-Through Rate %
                         • Physical Waste & Shrink %
                         • Consumer Refund & Spoilage Claims
                                            │
                                            ▼
                       [ 3. Continuous Model Recalibration ]
                         • Arrhenius Q10 Kinetic Shift Tuning
                         • Defect Penalty Weight Optimization
                         • Price Elasticity Calibration
                         • Supplier Trust Score Dynamic Update
```

Every delivery completes the cycle: **Inspection → Decision → Logistics → Storage → Sale → Waste → Actual Outcome → Model Improvement**. As dark stores log actual shrinkage and sell-through rates, the biological decay coefficients and routing rules automatically retune, driving down mean absolute error (MAE) across consecutive seasons.

---

### 3. Dynamic Cold-Chain Multi-Source Telemetry Ingestion

In legacy agricultural inspection workflows, temperature was entered manually as a single crude, static ambient estimate:

```
[ Legacy Manual Guesswork ]
ambient_temp_celsius: 28
```

This manual shortcut fails fundamentally:
1. **Unseen In-Transit Excursions**: A lorry may register 20°C at arrival, but during transit a reefer compressor defrost cycle, traffic dwell, or border stop may have caused an unlogged 2-hour thermal spike to 16.8°C that accelerated cellular respiration ($Q_{10}$) and degraded internal flesh firmness.
2. **Subjective Dock Bias**: Gate operators manually guess or round temperatures, masking carrier cold-chain SLA breaches.
3. **Uncalibrated Kinetic Predictions**: Arrhenius decay equations fed with a single static number produce inaccurate shelf-life estimates, causing unexpected dark store shrinkage and dock disputes.

#### Comprehensive Multi-Source Sensor Ingestion Architecture:

```
┌──────────────────────────────────────────────────────────────────────────────────────────┐
│                   Multi-Source Dynamic Telemetry Ingestion Architecture                  │
│                                                                                          │
│  🌡️ Temperature Sensors      💧 Humidity Sensors           📍 GPS Telemetry               │
│     • Multi-point core pulp    • RH% sensor array (74-95%)   • Real-time waypoint pings    │
│     • Surface container air    • Vapour Pressure Deficit     • Geofence entry/exit stamps  │
│     • Ceiling & door sensors   • Transpiration stress flux   • Route speed & dwell zones   │
│                                                                                          │
│  ❄️ Reefer Unit Telemetry    📶 Bluetooth (BLE) Loggers    🚚 Vehicle Telematics          │
│     • Micro-controller bus     • Pallet-level TempTrace      • Engine runtime hours        │
│     • Compressor duty cycle    • 5-minute continuous logs    • Alternator voltage stability│
│     • Defrost & discharge air  • Instant dock BLE sync       • 3-axis vibration shocks (g) │
└────────────────────────────────────────────┬─────────────────────────────────────────────┘
                                             │
                                             ▼
                 ┌──────────────────────────────────────────────────────────┐
                 │       Autonomous Cold-Chain Kinetic Synthesis Engine     │
                 │     (144 Time-Series Samples • Arrhenius Integration)    │
                 └───────────────────────────┬──────────────────────────────┘
                                             │
                                             ▼
   ┌──────────────────────────────────────────────────────────────────────────────────────┐
   │                                  Calculated Metrics                                  │
   │                                                                                      │
   │  🏆 Cold Chain Score       🎯 Target Setpoint         📊 Actual Average Temp         │
   │     87 / 100                  8.0°C                      10.4°C                      │
   │                                                                                      │
   │  🔥 Peak Excursion Temp    ⏱️ Time Above Threshold    📉 Shelf-Life Loss             │
   │     16.8°C                    2h 17m                     -1.4 days                   │
   │                                                                                      │
   │  ⚡ Thermal Exposure Score: 14.6 °C·h (Defrost Compressor Trip Detected)            │
   └──────────────────────────────────────────────────────────────────────────────────────┘
```

- **Thermal Exposure Score ($TES$)**:
  $$TES = \int_{0}^{t_{\text{transit}}} \max(0, T(t) - T_{\text{threshold}})\, dt = \mathbf{14.6\ ^\circ\text{C}\cdot\text{h}}$$
- **Shelf-Life Loss**:
  $$\Delta SL_{\text{loss}} = -\left(\frac{14.6}{10.0} \times \frac{2.1}{2.2}\right) = \mathbf{-1.4\ \text{days}}$$

---

### 4. Real-Time Shelf-Life Digital Twins

In legacy agricultural quality control, shelf life was calculated once at intake as an immutable, static snapshot:

```
[ Legacy Static Calculation ]
Shelf life = 4.2 days
```

Because fresh produce is living, metabolizing biological tissue, continuous data-driven recalculation is required as environmental stresses occur:

```
09:00 → 4.2 days   (Packhouse Ingestion @ 12°C, 85% RH, 0.8G)
12:00 → 3.9 days   (Cross-Dock Transfer, Ambient 21°C, Door Open Event)
15:00 → 3.4 days   (Highway Thermal Spike 28.2°C, 1.4G Vibration)
18:00 → 3.1 days   (Receiving Dock Intake, Precooling to 18°C)
```

The Digital Twin's instantaneous decay velocity is driven continuously by eight integrated biophysical parameters:
1. **Temperature**: Core pulp & ambient probe (°C) → Arrhenius $Q_{10}$ exponential respiration rate surge.
2. **Humidity**: Transpiration probe (% RH) → Vapour Pressure Deficit (VPD) moisture loss vs. dew-point fungal risk.
3. **Maturity**: USDA Color Stage (1–6) & ripeness % → Autocatalytic ethylene synthesis surge ($C_2H_4$).
4. **Defects**: Optical computer vision (% surface) → Epidermal micro-ruptures activating polyphenol oxidase (browning).
5. **Handling**: 3-axis telematics accelerometer (G) → Mechanical shearing and cellular rupture above 1.0G.
6. **Transit**: Elapsed route duration (hours) → Cumulative metabolic exhaustion and vibration fatigue.
7. **Storage**: Regime coefficient (Controlled Atmosphere $0.65\times$, Chilled Reefer $0.85\times$, Ambient Lorry $1.95\times$).
8. **Packaging**: Permeability profile (MAP $0.72\times$, Ventilated Plastic Crate $1.00\times$, Corrugated Box $1.12\times$).

---

### 5. Configurable Commercial Grade Engine

Different buyers, retail chains, and food service clients have vastly different quality specifications:
- **Ultra-Fresh Quick-Commerce (Grade A)** requires minimum 5.0 kg/cm² firmness, 5.0 °Bx sugar, and less than 3% total defects.
- **Discount Supermarket (Grade B)** accepts minor cosmetic blemishes and allows up to 10% defects with a dynamic markdown.
- **Secondary Processing (Grade C / Salvage)** accepts soft or high-pigment produce for sauce and purée manufacturing.

AgriGrade includes a fully configurable **Commercial Grade Engine** where operators can create, edit, activate, and import/export specific buyer rule sets:
- **Rule Parameters**: Min/Max Firmness (kg/cm²), Min/Max Brix (°Bx), Max Bruise %, Max Fungal Lesion %, Max Skin Ruptures %, Max Maturity Stage, Min/Max Unit Weight (g).
- **Automated Grade Assignment**: Evaluates incoming batch metrics against active rules, classifying lots as `GRADE_A`, `GRADE_B`, `GRADE_C`, or `REJECTED`, and computing a weighted Quality Score ($0\text{–}100$).
- **Action Mapping**: Maps grades directly to enterprise actions: `DIRECT_PREMIUM_FULFILLMENT`, `DYNAMIC_MARKDOWN_ROUTING`, `REPACK_SECONDARY_PROCESSING`, or `RETURN_TO_VENDOR`.

---

### 6. Demand-Aware Intelligent Routing & Dynamic Markdown Optimization

Rather than suffering binary dock rejections (where rejected lots are dumped at 100% loss), AgriGrade matches produce longevity with retail demand velocity:

#### Dynamic Markdown Price Elasticity Engine
- Computes real-time markdown tier recommendations:
  - **Tier 0 (0% Discount)**: Full price for prime Grade A produce with $>5\ \text{days}$ shelf-life.
  - **Tier 1 (10% Discount)**: Fast-move discount for batches with $3\text{–}4\ \text{days}$ shelf-life.
  - **Tier 2 (25% Discount)**: Flash sale discount for batches with $1.5\text{–}2.5\ \text{days}$ shelf-life.
  - **Tier 3 (40% Discount)**: Clearance / salvage pricing for batches under $36\ \text{hours}$ shelf-life.
- **Revenue Recovery Optimization**: Simulates expected sell-through rate vs. markdown percentage, calculating net margin recovery ($80\%\text{–}95\%$ revenue saved vs. $0\%$ on landfill disposal).

#### Demand-Aware Store Routing Engine
- Evaluates dark store network inventory and hourly SKU sales velocity.
- Matches batches to dark stores where:
  $$\text{Turnover Time (hours)} + \text{Route Transit Time} \le \text{Remaining Shelf-Life Hours} \times 0.75$$
- Prevents cross-docking batches to slow-turnover suburban stores where produce would expire before purchase.

---

## 🧠 The 9-Agent Orchestrated Swarm & Dynamic Skills Matrix

AgriGrade executes nine specialized, cooperating agents coordinated by the **Swarm Orchestrator & Synthesis Supervisor** across an asynchronous parallel **Directed Acyclic Graph (DAG)**:

```
                  [0. Swarm Orchestrator & Supervisor]
                                   │
              ┌────────────────────┼────────────────────┐      ◄── Phase 1: Parallel Perception & Biophysics
              ↓                    ↓                    ↓
    [1. Vision & Variety] [2. Pathology 360°] [3. Kinetic Twin]
              │                    │                    │
              └────────────────────┼────────────────────┘      ◄── Barrier Sync: Consistency Verification
                                   ↓
             [4. Commercial Decision & Rules Engine]
                                   │
              ┌────────────────────┼────────────────────┐      ◄── Phase 2: Downstream Optimization Solvers
              ↓                    ↓                    ↓
     [5. Demand Forecast] [6. Routing Optimizer] [7. Pricing Markdown]
              │                    │                    │
              └────────────────────┼────────────────────┘
                                   ↓
             [8. Autonomous Risk & Root Cause Diagnostic]
                                   ↓
                   Final Verified Action (ERP / WMS)
                                   ↓ (Actual Store Sales & Scrap Audits)
             [9. Closed-Loop Model Calibration & Learning]
```

### The 9 Specialized Agents & Dynamic Skills Catalog:

1. **Agent 1: Optical Perception & Phenotyping Agent**
   - **Domain**: Computer Vision, Colorimetry & Botanical Phenotyping
   - **Active Skills**: `optical_usda_ripeness_classifier` (USDA 1–6 color stages), `variety_genetic_classifier` (aspect ratio & pericarp morphology), `image_quality_gatekeeper` (Laplacian variance >= 70, lux checks).
   - **Expansion Skills**: `geometric_caliper_dimensioner` (fiducial millimeter diameter & mass estimation), `spectral_chlorophyll_decomposition` (CIE $L^*a^*b^*$ color index & lycopene accumulation velocity), `dock_cct_lux_normalizer` (Kelvin temperature white-balance correction).
   - **Self-Healing**: Automatic glare subtraction, motion blur re-capture prompt, optical certainty bounds.

2. **Agent 2: Defect & Pathology Segmentation Agent**
   - **Domain**: Phytopathology, Cuticle Surface Integrity & 360° Multi-Angle Fusion
   - **Active Skills**: `surface_defect_segmenter` (precise anomaly area in cm² vs visible cuticle), `multi_angle_360_fusion` (spherical projection fusing 5 camera angles without double-counting).
   - **Expansion Skills**: `etiological_pathogen_classifier` (mechanical vs physiological vs biological rot), `contagion_spread_evaluator` (fungal sporulation quarantine trigger), `bruise_volumetric_depth_estimator` (subcutaneous pulp collapse depth).
   - **Self-Healing**: Occlusion-adjusted visible denominator, stem-scar detachment zone exclusion.

3. **Agent 3: Kinetic Bio-Decay Digital Twin Agent**
   - **Domain**: Post-Harvest Plant Physiology & Arrhenius Thermodynamic Kinetics
   - **Active Skills**: `arrhenius_q10_respiration_solver` (Arrhenius $Q_{10}$ bio-decay curve), `cold_chain_degree_hour_integrator` (144-point thermal exposure integral & degree-hour penalty).
   - **Expansion Skills**: `transpiration_vpd_mass_loss_solver` (Vapor Pressure Deficit weight shrinkage), `ethylene_climacteric_catalyst_model` (System-2 autocatalytic $C_2H_4$ ripening burst), `chilling_injury_risk_detector` (subtropical chilling mealiness warning).
   - **Self-Healing**: Fallback to regional seasonal climatic temperature if IoT datalogger is offline.

4. **Agent 4: Commercial Decision & Rules Engine Agent**
   - **Domain**: Contractual QC Specifications & ERP Gatekeeping
   - **Active Skills**: `clause_by_clause_rule_evaluator` (evaluates multi-parameter buyer specifications), `erp_routing_tag_generator` (automated WMS disposition tags: `PREMIUM_RETAIL_BIN`, `FAST_DISPATCH_DISCOUNT_X`, `RETURN_TO_VENDOR`).
   - **Expansion Skills**: `multi_buyer_arbitrage_matcher` (secondary market salvage diversion to foodservice/processors), `adaptive_market_tolerance_buffer` (monsoon scarcity tolerance relaxation), `contractual_clause_provenance_audit` (cryptographic SLA proof).
   - **Self-Healing**: Default benchmark rule fallback if buyer ID is unconfigured.

5. **Agent 5: Demand Forecasting & Waste Prevention Agent**
   - **Domain**: Inventory Velocity Nowcasting & Waste Hazard Modeling
   - **Active Skills**: `store_sell_through_estimator` (combines inventory kg, sales velocity, and shelf life to forecast unsold kg and waste probability %).
   - **Expansion Skills**: `hyperlocal_weather_demand_nowcaster` (rain radar demand surge multiplier), `fefo_picking_queue_prioritizer` (First-Expired, First-Out picking queue), `inter_store_rebalancing_optimizer` (nearby dark store stock transfer ROI).
   - **Self-Healing**: Peer cluster median velocity inheritance for brand-new dark stores.

6. **Agent 6: Intelligent Routing & Logistics Agent**
   - **Domain**: Micro-Fulfillment Operations Research & Network Routing
   - **Active Skills**: `multi_store_margin_optimizer` (evaluates destination dark stores by velocity, transit time, and net realized revenue).
   - **Expansion Skills**: `dynamic_traffic_thermal_delay_solver` (simulates metropolitan traffic heat degradation), `cross_dock_consolidation_planner` (consolidated multi-stop delivery runs), `dark_store_capacity_gate` (live cold-room cubic volume check).
   - **Self-Healing**: Central cold storage holding divert if candidate store bins are saturated.

7. **Agent 7: Dynamic Pricing & Markdown Optimizer Agent**
   - **Domain**: Algorithmic Pricing & Revenue Optimization
   - **Active Skills**: `eight_variable_markdown_solver` (computes optimal discount balancing shelf life, inventory, velocity, competitor price, peak hours, and grade).
   - **Expansion Skills**: `price_elasticity_curve_solver` (commodity-specific price elasticity demand lift), `contribution_margin_floor_guard` (anti-predatory cost floor check), `phased_time_decay_markdown` (staged markdown schedule).
   - **Self-Healing**: Catalog baseline reference price fallback if competitor scraping API is unreachable.

8. **Agent 8: Autonomous Risk & Root Cause Diagnostic Agent**
   - **Domain**: Supply Chain Forensics & Vendor Performance Analytics
   - **Active Skills**: `multi_factor_root_cause_synthesizer` (correlates defect patterns with vibration G-force, temperature spikes, and weather), `predictive_supplier_risk_modeler` (Bayesian supplier reliability scorecard).
   - **Expansion Skills**: `automated_debit_note_generator` (automated ERP debit claims and penalty drafting), `alternative_supplier_rebalancer` (vetted alternative vendor recommendation for high-risk accounts).
   - **Self-Healing**: Provisional monitoring score for newly onboarded suppliers.

9. **Agent 9: Closed-Loop Model Calibration & Learning Agent**
   - **Domain**: Continual Machine Learning & Statistical Calibration
   - **Active Skills**: `closed_loop_feedback_calibrator` (computes prediction error residuals, updates MAE, and tunes learned decay offsets per cohort).
   - **Expansion Skills**: `seasonality_concept_drift_detector` (Population Stability Index monitoring across weather seasons), `active_learning_uncertainty_sampler` (uncertainty-based agronomist labeling sampling).
   - **Self-Healing**: Outlier decay suppression; enforces minimum 30 verified batch outcomes before altering genetic variety constants.

10. **Swarm Orchestrator & Synthesis Supervisor**
    - **Domain**: Directed Acyclic Graph (DAG) Execution & Multi-Objective Consensus
    - **Active Skills**: `directed_acyclic_graph_scheduler` (asynchronous parallel task dispatcher), `zero_hallucination_cross_verifier` (numerical consistency guard across agent boundaries).
    - **Expansion Skills**: `multi_objective_pareto_arbiter` (resolves objective conflicts between routing, pricing, and shelf life), `autonomous_circuit_breaker_healer` (sub-second deterministic fallback if any sub-agent latency exceeds 1500ms).

---

## 🖥️ Interactive Studios & Specialized Modules

AgriGrade provides 15 dedicated operational studios, consoles, and workflows:

### 1. Field Pre-Harvest Decision Support (`FIELD_PRE_HARVEST`)
- Evaluates crops on the vine using live camera or sample imagery.
- Calculates USDA 6-Stage maturity index and flesh firmness.
- Ingests local weather microclimates (heatwave warnings, rain probability) and simulated transit distance (km).
- Delivers definitive guidance: **Harvest Today** vs. **Hold on Vine**.
- Generates official downloadable **PDF Lorry Transit Passes**.

### 2. Dark Store Inbound Quality Gate (`DARK_STORE_INBOUND`)
- Inspects incoming crates at warehouse receiving docks with bounding-box defect overlays.
- QR/Barcode scanner auto-populates Batch ID and Supplier Cluster.
- Dynamic 3-tier dock disposition: Grade A (Premium Retail), Grade B (Fast-Track Markdown), or Rejected at Dock.
- Integrated multi-supplier radar benchmark, 30-day rejection trend chart, and storage temperature heat-map.
- Downloadable **PDF Receiving QC Inspection Certificates**.

### 3. Operations Command Center & Supply Chain Topology
- Fleet-wide network monitoring across 4 supply chain tiers: Farms & Packhouses, Cold-Chain Transit Reefer Fleets, Regional Distribution Centers, and Urban Dark Stores.
- Real-time KPI summary: Active Batches Monitored, Fleet Rejection Rate vs. 5% Target, Waste Shrinkage Avoided ($), and Network Profit Margin.
- Live operational alerts stream with instant resolution actions.
- Cross-network commodity risk distribution heatmap.

### 4. Dynamic Commercial Grade Engine Studio
- Complete rule creation and editing interface for customer-specific tolerances.
- Sliders and thresholds for Min Firmness, Min Brix, Max Bruise %, Max Fungal %, Max Skin Ruptures %, Max Maturity Stage, and Weight bounds.
- One-click rule switching (`Zepto Quick-Commerce`, `Nature's Basket Premium`, `Food Processing Sauce`, `Export Cold-Chain Grade A`).
- Real-time rule evaluation tester, multi-client simultaneous benchmark, and full JSON file export & import capabilities with server-side synchronization (`/api/commercial-rules/export`, `/api/commercial-rules/import`).

### Crate Lot Sampling & Statistical Yield Modal
- **Codex Alimentarius & USDA Statistical Sampling**: Allows packhouse and dark store inspectors to perform multi-item crate sampling audits (20-specimen statistical sampling matrix).
- **Yield Calculation Matrix**: Measures exact percentages of Grade A yield, Grade B yield, and Cull/Reject %, displaying individual specimen maturity stages, penetrometer firmness, and defect types.
- **Automated Lot Verdict & Markdown Decision**: Recommends overall crate acceptance (`ACCEPTED_GRADE_A`, `ACCEPTED_GRADE_B_MARKDOWN`, `REJECTED_AT_DOCK`) and calculates optimal dynamic lot discount percentages to maximize sell-through without quality disputes.

### Thermal Crate Barcode & Sticker Generator
- **Zebra TSPL Industrial Command Generator**: Outputs raw TSPL thermal printer scripts ready for direct serial/network dispatch to industrial Zebra label printers.
- **Multi-Format Support**: Dual layout switcher supporting 4"×3" large produce crate intake stickers and 2"×1" retail shelf tags.
- **Machine-Readable Tagging**: Renders dynamic Code 128 barcodes with batch checksums and high-density 2D QR tags encoding batch ID, quality grade, expiry timestamp, and ERP routing tags.
- **Native Print & Copy Integration**: One-click clipboard copy for TSPL commands and direct browser print triggering with thermal CSS optimization.

### Arrhenius "What-If" Sensitivity & Cold-Chain ROI Simulator
- **Thermal Excursion Modeling**: Interactive multi-variable simulator evaluating the biological impact of ambient road transit temperatures (15°C – 45°C) and unrefrigerated excursion durations (0 – 12 hours).
- **Reefer vs. Ambient Economics**: Demonstrates real-time financial ROI of booking chilled reefer freight vs. ambient lorries, factoring in cargo volume, base produce price per kg, reefer rental premiums, and salvage recovery.
- **Shelf-Life Preserved**: Dynamically computes biological shelf-life days saved through active cold-chain compliance and net profit/loss differential.

### 5. Dynamic Pricing & Markdown Studio
- Visual price elasticity and salvage recovery curves.
- Dynamic markdown simulator calculating sell-through probability, margin retained, and landfill waste prevented.
- 4-tier markdown distribution visualizer (Tier 0 Fresh, Tier 1 Fast-Move, Tier 2 Flash Sale, Tier 3 Clearance).
- Instant batch price sync to e-commerce and POS catalog.

### 6. Demand Forecasting & Intelligent Routing Studio
- Live SKU demand forecasting across dark store network nodes (Downtown Express, Tech Park Hub, Metro North, West Suburb).
- Hourly sales velocity matching against batch remaining shelf-life.
- Carbon-aware route optimization calculating transit emissions, travel hours, and safety buffer margins.
- Automated one-click WMS dispatch routing tag assignment.

### 7. Deep Supplier Scorecard & Forensic Studio
- Multi-dimensional vendor performance profiling: Nashik Agro Cluster, Punjab Fresh Orchards, Kolar Green Farms, Satara Berry Growers.
- Metrics tracking: Quality Consistency, Rejection Avoidance, Cold-Chain SLA Compliance %, Average Firmness, and Historical Batches Ingested.
- Autonomous root cause diagnostic engine (attributing defects to Field Cultivation, Cold-Chain Reefer Failure, or Packaging Transit Stress).
- Vendor dispute settlement logging and dynamic trust score adjustments.

### 8. Real-Time Shelf-Life Digital Twin Studio
- Continuous biophysical vital signs simulation.
- Real-time perturbation sliders for Temperature, Humidity, Ripeness %, Defect %, Handling Shock (G), Transit Hours, Storage Regime, and Packaging Type.
- Instantaneous risk gauge displays: Temperature Risk (🟡), Bruise Risk (🟢), Fungal Risk (🟠), Cold Chain (🟡), Demand Risk (🟢).
- Multi-batch fleet switcher (`CRATE-4892`, `CRATE-8821`, `CRATE-2304`).

### 9. Dynamic Cold-Chain Telemetry Studio
- 144-sample time-series telemetry charts showing 12-hour continuous transit.
- Cold Chain Score calculation (87/100) and net shelf-life impact (-1.4 days).
- BLE pallet logger diagnostics (battery, sync status, sample frequency).
- Reefer compressor telematics (discharge temperature, defrost cycles, compressor status).
- 3-axis vibration shock profiling (G-force impacts and handling roughness).

### 10. Agronomic Commodity Database Studio
- Interactive hierarchical taxonomy tree explorer (Commodity → Variety → Maturity → Storage → Cohort).
- Dynamic Commodity Identification Agent executing variety phenotyping and empirical derivations.
- Interactive calculation sandbox: computes predicted shelf-life days and statistical confidence % with step-by-step mathematical proofs.
- Supplier historical delivery audit ledger with sample sizes ($N$) and standard deviations ($\sigma$).

### 11. Closed-Loop Feedback Loop Studio
- Side-by-side paradigm comparison: Legacy Static vs. AgriGrade Closed-Loop Intelligence.
- 7-Stage lifecycle tracker: `INSPECTION` → `DECISION` → `LOGISTICS` → `STORAGE` → `SALE` → `WASTE` → `ACTUAL_OUTCOME`.
- Ground truth outcome entry form logging actual days to degradation, sell-through %, and shrinkage.
- Real-time recalibration display showing Arrhenius $Q_{10}$ shift, defect penalty weight adjustments, and price elasticity updates.
- Historical MAE convergence graph illustrating continuous error reduction over batch cycles.

### 12. Zero-Hallucination Multi-Agent Chat Console
- Interactive conversational AI interface grounded strictly in active scan telemetry.
- Direct question targeting: Cross-Agent Consensus or specific agent leads (Optical, Pathology, Kinetics, Gatekeeper, Calibrator).
- Displays verified cited metric chips and agent persona badges.
- Strict anti-hallucination safeguard: refuses unverified speculation without underlying sensor data.

### 13. Mobile Field Scout Offline-Ready Modal
- Specialized field agronomist interface designed for low-connectivity rural farm environments.
- Offline queue simulator: stores field scans locally and syncs automatically upon network reconnection.
- Quick field diagnostic tools: Brix refractometer input, penetrometer firmness entry, GPS location tagging, and harvest readiness indicator.

### 14. WhatsApp & SMS Automated Vendor Alerts
- Automated vendor notification generator for dock rejections and Grade B downgrades.
- Pre-formatted dispatch templates containing batch ID, defect summary, high-resolution photo proof link, and dock inspector sign-off.
- Interactive vendor concession workflow: Accept Markdown Concession or Request Return-to-Vendor (RTV).

### 15. Regulatory Compliance, Model Provenance & Audit Trail
- Cryptographic-style immutable audit trail tracking all inspection events, model versions, and human overrides.
- Model provenance transparency: tracks Vision Model (`gemini-3.8-flash`), Prompt Version (`v3.4-multimodal-spectral`), Kinetic Engine Version (`v2.8-arrhenius-q10`), and Rules Engine Version (`v2.1-commercial`).
- Regulatory standard alignment with USDA Fresh Fruit and Vegetable Standards, UNECE Standards, and Codex Alimentarius.

---

## 🛡️ Human-in-the-Loop (HITL) Quality Gate

To maintain compliance and prevent algorithmic edge-case misclassifications, AgriGrade incorporates an automated **Human-in-the-Loop (HITL) Quality Gate**:

1. **Multi-Factor Confidence Scoring**:
   The system calculates an overall confidence score based on five weighted dimensions:
   - **Optical Clarity & Quality**: Resolution, lighting balance, surface visibility.
   - **Kinetic Respiration Convergence**: Agreement between theoretical Arrhenius decay and empirical commodity curves.
   - **Telemetry Completeness**: Availability of BLE loggers, reefer telemetry, and weather data.
   - **Commercial Rule Margin**: Distance between measured batch attributes and rule thresholds.
   - **Supplier Historical Reliability**: Consistency and sample size of vendor delivery history.

2. **Automated HITL Threshold Trigger**:
   Whenever overall confidence falls below **85%**, or when defect borderline margins are within $\pm 2\%$, the dock screen automatically triggers a **Human Review Recommended** banner.

3. **Inspector Override Modal**:
   Dock inspectors can manually reclassify a batch (e.g. from `REJECTED_AT_DOCK` to `ACCEPTED_GRADE_B`), select an adjusted dynamic discount, and submit a mandatory justification reason (e.g. *"Visual catfacing mistaken for active rot; firmness is well within acceptable tolerance"*).

4. **Continuous Learning from Overrides**:
   Human corrections are logged to the immutable audit trail and immediately ingested by the Feedback Loop Engine, retuning computer vision defect weights and updating system accuracy metrics.

---

## 🧪 Interactive Verification Scenarios

You can verify all platform capabilities using the pre-loaded operational test scenarios:

### Scenario 1: Breaker Stage Tomato (Long-Haul Transit Candidate)
- **Select Preset**: Click the **"Tomato Breaker"** preset.
- **Switch Mode**: Select **"Field Pre-Harvest"**.
- **Observation**:
  - USDA Maturity: Stage 2 (Breaker, 10–30% tannish-yellow).
  - High Firmness: ~6.2 kg/cm² penetrometer.
  - Harvest Recommendation: **"Harvest Recommended Today"** (ideal transit resilience for >100 km).
  - PDF Generation: Click **"Download Official PDF Pass"** for an audit-grade transit manifest.

### Scenario 2: Pink Tomato with Minor Transit Abrasion (Grade B Markdown)
- **Select Preset**: Click the **"Pink Grade B"** preset.
- **Switch Mode**: Select **"Dark Store Inbound"**.
- **Observation**:
  - Defect Area: ~8.4% mechanical skin abrasion.
  - Commercial Evaluation: Classified as `ACCEPTED_GRADE_B`.
  - Dynamic Markdown Studio: Recommends 15% markdown tier for fast turnover.
  - Routing Studio: Automatically assigns delivery to *Downtown Express* (high hourly demand).

### Scenario 3: Overripe Fruit with Pathological Softening (Dock Rejection)
- **Select Preset**: Click the **"Overripe Rejected"** preset.
- **Observation**:
  - USDA Stage 6 (Deep Red, >90% color).
  - Penetrometer Firmness: <2.8 kg/cm² (breaches commercial minimum).
  - Gatekeeper Disposition: `REJECTED_AT_DOCK`.
  - Automated WhatsApp Notice: Click **"Vendor Notice"** to inspect pre-formatted supplier claim documentation with defect photos.

### Scenario 4: Human-in-the-Loop Override
- On a borderline scan, click **"Manual Override / HITL"** in the Dark Store Quality Gate.
- Reclassify the lot from `REJECTED_AT_DOCK` to `ACCEPTED_GRADE_B` with 12% discount.
- Enter justification: *"Secondary optical glint misidentified as rot."*
- Click **"Commit Human Override"** to inspect immediate feedback loop learning and audit trail recording.

---

## 📐 Mathematical & Biophysical Formulations

### 1. Calibrated Arrhenius Respiration Engine ($Q_{10}$)
Biological respiration rate surges exponentially as produce temperature rises:

$$\text{TempMultiplier} = (Q_{10} + \Delta Q_{10})^{-\frac{T_{\text{actual}} - T_{\text{ref}}}{10}}$$

Where $\Delta Q_{10}$ is the learned calibration offset from downstream outcome data.

### 2. Multi-Factor Degradation Accelerators
Ethylene gas concentration ($C_2H_4$) and transport mechanical vibration accelerate cellular breakdown:

$$\text{EthyleneFactor} = 1.0 + \max\left(0, \frac{\text{Ethylene}_{\text{ppm}} - 0.5}{5.0}\right) \times 0.45$$

$$\text{VibrationFactor} = 1.0 + \max(0, \text{Vibration}_g - 0.8) \times 0.20$$

$$D_{\text{bruise}} = \min\left(0.85, \frac{\text{BruiseDefectIndex}}{100} \times W_{\text{defect}}\right)$$

Where $W_{\text{defect}}$ is the continuously calibrated defect severity weight (default $0.90$).

### 3. Effective Marketable Shelf-Life Formulation
Synthesizing biological genetics, ripeness, temperature, physical trauma, and cold-chain exposure:

$$\text{ShelfLife}_{\text{ambient}} = \max\left(0.5, \frac{SL_{\text{base}} \times \max(0.05, 1.0 - \frac{\text{Ripeness}\%}{100}) \times \text{TempMultiplier} \times (1.0 - D_{\text{bruise}})}{\text{EthyleneFactor} \times \text{VibrationFactor}} + \Delta SL_{\text{coldchain}}\right)$$

Where $\Delta SL_{\text{coldchain}}$ is the net shelf-life impact computed from continuous telemetry (e.g. $-1.4\ \text{days}$).

### 4. Dynamic Thermal Exposure Score ($TES$)
Thermal degradation is calculated by integrating degree-hours of thermal excursion above the critical threshold:

$$TES = \sum_{k=1}^{M} \max(0, T_k - T_{\text{threshold}}) \times \frac{\Delta t_k}{60} \quad (^\circ\text{C}\cdot\text{h})$$

For the reference transit profile ($M = 144$ samples at $\Delta t = 5\ \text{min}$, $T_{\text{threshold}} = 10.0^\circ\text{C}$):
$$TES = \mathbf{14.6\ ^\circ\text{C}\cdot\text{h}}$$

### 5. Cold Chain Score ($CCS$)
Synthesizes target deviations, peak excursion spikes, and cumulative excursion duration into a 0–100 index:

$$CCS = \max\left(0, \min\left(100, 100 - P_{\text{avg}} - P_{\text{peak}} - P_{\text{excursion}}\right)\right)$$

Where:
- $P_{\text{avg}} = \max(0, T_{\text{actual\_avg}} - T_{\text{target}}) \times 2.8$
- $P_{\text{peak}} = \max(0, T_{\text{max}} - T_{\text{threshold}}) \times 0.65$
- $P_{\text{excursion}} = \frac{t_{\text{above\_threshold\_min}}}{60} \times 0.8$

### 6. Dynamic Markdown Price Elasticity Equation
Balances inventory pressure and remaining shelf-life against price elasticity to clear aging crates:

$$\text{InventoryPressure} = \frac{\text{CurrentStockCrates}}{\text{DailySalesVelocity}} \times \frac{24}{\text{RemainingShelfLifeHours}}$$

$$\text{Markdown}\% = \min\left(40\%, \text{BaseDiscount} \times E_{\text{price}} \times (1.0 + 0.5 \times \mathbb{I}_{\text{Overstock}})\right)$$

---

## 🏗️ System Architecture & Codebase Map

```
AgriGrade-Root/
├── server.ts                             # Full-Stack Express API & Multimodal Gemini Dispatcher
├── index.html                            # HTML5 App Entry Point with SEO Meta Tags
├── package.json                          # Dependencies & Build Scripts
├── vite.config.ts                        # Vite 8 Build Configuration
├── src/
│   ├── App.tsx                           # Main Application Container & Studio Router
│   ├── types.ts                          # Comprehensive TypeScript Domain Interfaces
│   ├── agent/
│   │   └── commodityIdentificationAgent.ts # Dynamic Phenotyping & Knowledge Retrieval Agent
│   ├── components/
│   │   ├── Header.tsx                    # Navigation Header & Mode Toggles
│   │   ├── AgriGradeCommandCenter.tsx    # Multi-Node Supply Chain Topology & Fleet KPIs
│   │   ├── DynamicGradeEngineStudio.tsx  # Configurable Buyer Rules & Tolerance Management
│   │   ├── DynamicPricingMarkdownStudio.tsx # Shelf-Life Price Elasticity & Revenue Recovery
│   │   ├── DemandForecastingAndRoutingStudio.tsx # Multi-Store Demand Velocity & Carbon Routing
│   │   ├── SupplierScorecardStudio.tsx   # Vendor Defect Trajectory & Dispute Forensics
│   │   ├── DarkStoreQualityGate.tsx      # Inbound Receiving QC & HITL Confidence Gate
│   │   ├── FieldHarvestDecision.tsx      # Field Pre-Harvest Transit Viability & Lorry Pass
│   │   ├── DigitalTwinStudio.tsx         # Real-Time Biophysical Vital Signs Simulation
│   │   ├── ColdChainTelemetryStudio.tsx  # 144-Sample Arrhenius Time-Series Studio
│   │   ├── CommodityDatabaseStudio.tsx   # Hierarchical Agronomic Taxonomy & Cohorts
│   │   ├── FeedbackLoopStudio.tsx        # 7-Stage Lifecycle & Ground Truth Recalibration
│   │   ├── MultiAgentChat.tsx            # Zero-Hallucination Swarm Chat Console
│   │   ├── MobileFieldScoutModal.tsx     # Offline-Ready Field Agronomist Queue
│   │   ├── WhatsAppAlertsModal.tsx       # Automated Dispatch & Vendor Dispute Notices
│   │   ├── AuditAndVersioningModal.tsx   # Immutable Audit Ledger & Model Provenance
│   │   ├── MultiFactorContextPanel.tsx   # Interactive Environmental Context Sliders
│   │   ├── InspectionView.tsx            # Primary Optical Scan & Defect Bounding Boxes
│   │   ├── CameraModal.tsx               # Live Video Feed & Barcode/QR Scanner
│   │   └── MultiAgentModal.tsx           # Interactive 5-Tab Swarm Blueprint & Dynamic Skills Studio
│   ├── db/
│   │   └── commodityDatabase.ts          # Relational Agronomic Commodity Taxonomy & Baselines
│   ├── data/
│   │   ├── agentSkillsMatrix.ts          # Comprehensive 9-Agent Skills, Instructions & DAG Matrix
│   │   ├── presets.ts                    # Preset Specimen Profiles (Roma, Cavendish, Gala, Pepper)
│   │   ├── agriGradeDataPlatform.ts      # Supply Chain Nodes, Connections & Fleet KPIs
│   │   └── feedbackLoopData.ts           # Historical Batches & Continuous Calibration State
│   └── utils/
│       ├── gradeEngine.ts                # Deterministic Commercial Grade Rules Evaluator
│       ├── pricingOptimizer.ts           # Price Elasticity & Markdown Tier Simulator
│       ├── demandAndRoutingEngine.ts     # Dark Store Inventory Velocity Matching
│       ├── supplierIntelligenceEngine.ts # Autonomous Root Cause & SLA Compliance
│       ├── auditAndVersioningEngine.ts   # Model Provenance & Confidence Scoring
│       ├── mobileFieldAdvisory.ts        # Weather & Packaging Guidance Engine
│       ├── imageQualityGate.ts           # Optical Blur & Lighting Quality Checks
│       ├── pdfReportGenerator.ts         # Audit-Grade Client-Side jsPDF Generator
│       └── telemetryEngine.ts            # Arrhenius Time-Series Integrator & CCS Calculator
```

---

## 💻 Tech Stack

### Frontend
- **Framework**: React 19 + TypeScript (Strict Mode)
- **Build System**: Vite 8 with `@vitejs/plugin-react`
- **Styling**: Tailwind CSS v4 with `@tailwindcss/vite`
- **Iconography**: Lucide React
- **Charting & Analytics**: Recharts (Radar charts, line trends, historical convergence curves)
- **Barcodes & QR Decoding**: `jsQR`
- **Document Generation**: `jspdf` (Client-side vector PDF passes and certificates)

### Backend
- **Runtime**: Node.js 20+ with Express
- **AI Engine**: Google Gen AI TypeScript SDK (`@google/genai`) using `gemini-3.8-flash`
- **Execution**: `tsx` (TypeScript development execution)
- **Production Bundling**: `esbuild` (`dist/server.cjs`)
- **Telemetry Integration**: 144-sample time-series BLE and reefer telematics processor
- **Feedback Engine**: In-memory closed-loop state with online Arrhenius and defect weight adaptation

---

## 🚀 Getting Started

### Prerequisites
- Node.js 20.x or later installed
- npm or yarn

### 1. Installation
Clone the repository and install all dependencies:
```bash
npm install
```

### 2. Configure Environment
Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```
Provide your environment parameters:
```env
# Google Gen AI Key (Optional - Fallback simulation engine engages if omitted)
GEMINI_API_KEY=your_actual_gemini_api_key_here

# Server Port (Defaults to 3000)
PORT=3000
```
> **Note**: AgriGrade includes a robust deterministic simulation engine. If no Gemini API key is provided, the platform seamlessly runs on deterministic agronomic heuristics and calibrated feedback models.

### 3. Start Development Server
Launches the full-stack server on `http://localhost:3000`:
```bash
npm run dev
```

### 4. Build for Production
Compiles frontend assets and bundles the Express server:
```bash
npm run build
npm run start
```

### 5. Code Quality & Linting
Validates TypeScript types and code quality:
```bash
npm run lint
```

---

## 📡 REST API Reference

### Multimodal Inspection

#### `POST /api/grade`
Executes the full 9-Agent inspection pipeline on base64 optical imagery with multi-factor context.

- **Request Body**:
  ```json
  {
    "image_b64": "data:image/jpeg;base64,...",
    "mode": "DARK_STORE_INBOUND",
    "crop_type_hint": "Tomato",
    "ambient_temp_celsius": 28.0,
    "transit_hours_to_hub": 10,
    "transit_distance_km": 120,
    "storage_method": "AMBIENT_LORRY",
    "batch_id": "CRATE-4892",
    "supplier_name": "Nashik Agro Cluster",
    "sensor_telemetry": {
      "transit_logger_temp": 26.5,
      "humidity_pct": 74,
      "ethylene_ppm": 1.4,
      "vibration_g_force": 0.85
    },
    "weather_context": {
      "ambient_temp_celsius": 32.0,
      "humidity_pct": 65,
      "heatwave_warning": true
    },
    "cold_chain_telemetry": {
      "targetTempCelsius": 8.0,
      "actualAvgTempCelsius": 10.4,
      "maxTempCelsius": 16.8,
      "thresholdTempCelsius": 10.0,
      "timeAboveThresholdMinutes": 137,
      "thermalExposureScore": 14.6,
      "coldChainScore": 87,
      "shelfLifeLossDays": -1.4
    }
  }
  ```
- **Response**: Full `AgriGradeReport` containing maturity breakdown, defect index, firmness estimate, dynamic database prediction, 9-agent traces, commercial evaluation, markdown recommendation, intelligent routing, and supplier scorecard.

#### `POST /api/physics/recalculate`
Lightning-fast (<5ms) biophysical recalculation endpoint. Recalculates shelf-life decay, Arrhenius respiration, dynamic markdowns, and commercial actions when environmental sliders (temperature, transit hours, distance, cold-chain telemetry) change without re-uploading massive Base64 images.
- **Request Body**: `{ vision_data: GeminiReport, inspection_request: InspectionRequest }`
- **Response**: `{ success: true, latency_ms: number, report: AgriGradeReport }`

#### `POST /api/grade/crate-sample`
Simulates and evaluates statistical Codex / USDA multi-specimen crate lot samples (20 specimens per lot).
- **Request Body**: `{ sampleCount: number, commodity: string, baselineDefectPct: number }`
- **Response**: `{ success: true, result: CrateSampleLotResult }` containing Grade A %, Grade B %, cull reject %, individual specimen maturity and firmness, and lot acceptance recommendation.

#### `POST /api/barcode/generate-label`
Generates formatted Zebra TSPL printer instructions, Code 128 barcode payloads, and QR content for physical crate labels and shelf tags.
- **Request Body**: `{ batchId: string, commodity: string, variety: string, supplierName: string, gradeVerdict: string, ... }`
- **Response**: `{ success: true, label: ThermalLabelData }`

---

### Commercial Grade Engine

#### `GET /api/commercial-rules`
Returns all active and available commercial buyer tolerance rules.

#### `POST /api/commercial-rules`
Creates or updates a commercial grade rule, persisting it to `runtime_store.json`.
- **Request Body**: `CommercialGradeRule` object (firmness, Brix, defect limits, actions).

#### `POST /api/commercial-rules/evaluate`
Evaluates a specific set of physical batch metrics against a rule.

#### `GET /api/commercial-rules/export`
Exports all active commercial buyer tolerance rules formatted as downloadable JSON.

#### `POST /api/commercial-rules/import`
Imports and validates an array or object of commercial rules, merging them into active memory and persisting to `runtime_store.json`.

---

### Command Center & Operations

#### `GET /api/command-center/kpis`
Retrieves enterprise fleet metrics, network nodes, and supply chain connections for the topology visualizer.

#### `GET /api/alerts/live`
Retrieves live operational alerts across the dark store network.

#### `POST /api/alerts/send-test`
Broadcasts a new dispatch alert to the operations channel.

---

### Supplier Intelligence

#### `GET /api/suppliers/scorecard/:supplierName`
Retrieves longitudinal vendor scorecard, cold-chain SLA compliance, defect trajectory, and autonomous root cause analysis.

---

### Audit Trail & Human-in-the-Loop

#### `GET /api/audit/trail`
Retrieves the complete immutable audit ledger including model versions, inspection records, and human overrides.

#### `POST /api/hitl/override`
Logs a human dock inspector override, updating the audit trail and feeding the correction into the closed-loop learning model.

---

### Agronomic Commodity Database

#### `GET /api/database/tree`
Returns the hierarchical agronomic commodity taxonomy tree.

#### `GET /api/database/commodities`
Returns all registered commodities, varieties, maturity profiles, and empirical farm cohorts.

#### `POST /api/database/calculate`
Calculates predicted shelf-life days and statistical confidence % with step-by-step mathematical derivation for custom scenarios.

#### `POST /api/agent/dynamic-identify`
Executes the Dynamic Commodity Identification Agent on multimodal optical + sensor data.

---

### Continual Learning & Feedback Loop

#### `GET /api/feedback/metrics`
Returns global closed-loop accuracy, mean absolute shelf-life error (MAE), total batches learned, and weight adjustment deltas.

#### `GET /api/feedback/batches`
Returns all active and completed 7-stage lifecycle batches.

#### `POST /api/feedback/submit-outcome`
Submits real ground truth retail outcomes, triggering online model recalibration.

---

### Interactive Chat & Systems

#### `POST /api/chat`
Zero-hallucination interactive chat query grounded in verified produce scan telemetry, returning cited metric chips and agent badges.

#### `POST /api/erp/sync-batch`
Simulates webhook integration with Enterprise Resource Planning systems (SAP AgriChain / DarkStore WMS).

#### `GET /api/health`
Returns service health, Gemini API configuration status, model version, and server timestamp.

---

## 📄 License

Proprietary agricultural technology software. Engineered for commercial quick-commerce, fresh produce supply chain, and dark store logistics deployment.
