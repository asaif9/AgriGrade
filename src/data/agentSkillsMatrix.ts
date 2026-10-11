/**
 * AgriGrade Multi-Agent Architecture: Skills, Instructions & Operational Directives
 * 
 * Comprehensive specification for all 9 autonomous agents + Swarm Orchestrator.
 * Defines:
 * - Core Mission & Architectural Role
 * - Active & Proposed Skills with parameters, outputs, and algorithmic logic
 * - Production System Instructions with Chain-of-Thought directives
 * - Dynamic Inter-Agent Message Contracts (Inputs Consumed & Outputs Emitted)
 * - Autonomous Failure Modes & Self-Healing Fallbacks
 */

export interface AgentSkillDefinition {
  id: string;
  name: string;
  category: 'perception' | 'biophysical' | 'decision' | 'optimization' | 'forensics' | 'learning' | 'orchestration';
  status: 'active' | 'recommended_expansion' | 'experimental';
  description: string;
  parameters: Array<{
    name: string;
    type: string;
    required: boolean;
    description: string;
  }>;
  outputSchema: string;
  edgeHeuristics: string;
  businessImpact: string;
}

export interface AgentFailureMode {
  condition: string;
  symptom: string;
  autonomousMitigation: string;
  fallbackState: string;
}

export interface AgentProfileSpecification {
  id: string;
  agentNumber: number;
  name: string;
  shortRole: string;
  domain: string;
  badgeColor: string;
  coreMission: string;
  activeSkills: AgentSkillDefinition[];
  proposedSkills: AgentSkillDefinition[];
  systemInstructions: {
    systemPrompt: string;
    reasoningChain: string[];
    groundingRules: string[];
    outputGuardrails: string[];
  };
  interAgentContracts: {
    consumesFrom: Array<{ agentId: string; dataFields: string[] }>;
    providesTo: Array<{ agentId: string; dataFields: string[] }>;
  };
  failureModes: AgentFailureMode[];
  keyFormulasOrHeuristics?: string[];
}

export const AGENT_SKILLS_AND_INSTRUCTIONS: AgentProfileSpecification[] = [
  // AGENT 1
  {
    id: 'agent_vision_phenotyping',
    agentNumber: 1,
    name: 'Optical Perception & Phenotyping Agent',
    shortRole: 'Computer Vision & Morphological Variety Identification',
    domain: 'Computer Vision & Botanical Phenotyping',
    badgeColor: 'emerald',
    coreMission: 'Transform raw RGB camera frames into verified botanical taxonomic classifications, USDA 6-stage maturity ratings, physical geometric dimensions, and optical confidence bounds without hallucination.',
    activeSkills: [
      {
        id: 'optical_usda_ripeness_classifier',
        name: 'USDA 6-Stage Maturity Phenotyping',
        category: 'perception',
        status: 'active',
        description: 'Analyzes visual pigment distribution across RGB/HSV channels to classify produce into USDA Standards 1 through 6 (Green, Breaker, Turning, Pink, Light Red, Red).',
        parameters: [
          { name: 'image_b64', type: 'string (base64)', required: true, description: 'Pre-processed camera frame' },
          { name: 'crop_hint', type: 'string', required: false, description: 'Optional user or barcode hint' },
        ],
        outputSchema: '{ stage: 1-6, stage_name: string, ripeness_pct: number, confidence: number }',
        edgeHeuristics: 'If produce has uneven mottling, weights color stage by polar calyx region vs equatorial cheek.',
        businessImpact: 'Prevents harvesting or dispatching at wrong maturity, avoiding early spoilage or unsellable green produce.'
      },
      {
        id: 'variety_genetic_classifier',
        name: 'Morphological Variety Profiler',
        category: 'perception',
        status: 'active',
        description: 'Classifies exact cultivar (e.g. Roma Plum vs Beefsteak slicing tomato) via aspect ratio, pericarp geometry, calyx shape, and pigment texture.',
        parameters: [
          { name: 'image_b64', type: 'string', required: true, description: 'Produce image' },
          { name: 'commodity_hint', type: 'string', required: false, description: 'Commodity family' }
        ],
        outputSchema: '{ variety_id: string, variety_name: string, certainty: number, genetic_class: string }',
        edgeHeuristics: 'Aspect ratio > 1.25 triggers plum/Roma classification; aspect ratio < 1.05 with ridges triggers beefsteak.',
        businessImpact: 'Enables variety-specific kinetic shelf life modeling instead of coarse commodity guesses.'
      },
      {
        id: 'image_quality_gatekeeper',
        name: 'Image Quality & Glare Validation Gate',
        category: 'perception',
        status: 'active',
        description: 'Evaluates Laplacian blur variance, lighting lux levels, specularity glare index, and bounding coverage before admitting frame to downstream analysis.',
        parameters: [
          { name: 'image_b64', type: 'string', required: true, description: 'Raw camera capture' }
        ],
        outputSchema: '{ passed: boolean, blur_score: number, lux_score: number, issues: string[] }',
        edgeHeuristics: 'Rejects images with Laplacian variance < 70 or saturated specularity > 15% surface area.',
        businessImpact: 'Eliminates 99% of optical hallucinations caused by blurry or poorly lit dock cameras.'
      }
    ],
    proposedSkills: [
      {
        id: 'geometric_caliper_dimensioner',
        name: 'Zero-Hardware Geometric Caliper Dimensioner',
        category: 'perception',
        status: 'recommended_expansion',
        description: 'Uses crate lip fiducial markers, barcode dimension anchors, or dual-lens stereopsis to compute real millimeter equatorial diameter and volumetric mass estimate in grams.',
        parameters: [
          { name: 'frame_pixels', type: 'number[2]', required: true, description: 'Bounding box width/height in px' },
          { name: 'reference_marker_mm', type: 'number', required: false, description: 'Standard crate corner width (default 24mm)' }
        ],
        outputSchema: '{ equatorial_diameter_mm: number, longitudinal_length_mm: number, estimated_mass_g: number, size_grade: string }',
        edgeHeuristics: 'Cross-checks mass against USDA Size Class (Small <54mm, Medium 54-64mm, Large 64-73mm, Extra Large >73mm).',
        businessImpact: 'Automates size grading without manual weighing scales, eliminating underweight customer rejections.'
      },
      {
        id: 'spectral_chlorophyll_decomposition',
        name: 'Multi-Spectral Chlorophyll & Lycopene Decomposition',
        category: 'perception',
        status: 'recommended_expansion',
        description: 'Decomposes image into simulated CIE L*a*b* color space and computes the a*/b* ratio (color index) and Lycopene Accumulation Velocity ($LAV$).',
        parameters: [
          { name: 'color_histogram', type: 'RGBColorHistogram', required: true, description: 'Segmented surface color breakdown' }
        ],
        outputSchema: '{ lab_a_over_b_ratio: number, lycopene_mg_100g: number, chlorophyll_depletion_pct: number, days_to_full_red: number }',
        edgeHeuristics: 'Negative a*/b* indicates pre-climacteric green; a*/b* > 0.8 represents peak lycopene accumulation.',
        businessImpact: 'Predicts exact hour when turning fruit will reach retail presentation red.'
      },
      {
        id: 'environmental_cct_lux_normalizer',
        name: 'Dock Lighting & Color Temperature Normalizer',
        category: 'perception',
        status: 'recommended_expansion',
        description: 'Estimates Correlated Color Temperature (CCT in Kelvin) and White-Balance matrix from background crate white strips to eliminate sodium vapor or warm LED tint distortion.',
        parameters: [
          { name: 'background_patches', type: 'RGBColor[]', required: true, description: 'Neutral reference background samples' }
        ],
        outputSchema: '{ detected_cct_kelvin: number, lux_level: number, color_correction_matrix: number[3][3] }',
        edgeHeuristics: 'Prevents warm 3000K warehouse lighting from making a Stage 3 tomato look like Stage 5.',
        businessImpact: 'Standardizes inspection across 100+ dark stores with varying light fixtures.'
      }
    ],
    systemInstructions: {
      systemPrompt: `You are Agent 1: Optical Perception & Phenotyping Specialist in the AgriGrade Autonomous Swarm.
Your sole mission is to extract objective botanical, morphological, and ripeness facts from the provided produce capture.

OPERATIONAL PROTOCOL:
1. VALIDATE: Verify frame sharpness (Laplacian variance >= 70) and lighting. If occluded or blurry, set status: 'flagged' and report specific optical issue.
2. SEGMENT: Separate specimen foreground from background conveyor, hands, or plastic crate.
3. MORPHOLOGY: Determine physical aspect ratio (polar diameter / equatorial diameter) to distinguish variety (e.g. Roma plum = ratio 1.25-1.45, Round/Beefsteak = 0.90-1.05).
4. MATURITY: Grade USDA 1-6 stage using equatorial cheek color, ignoring stem scars or shadow recesses.
5. CALIPER: Estimate diameter against standard crate reference.
6. ZERO-HALLUCINATION: Do NOT guess variety from color alone. If certainty is under 80%, flag human review with exact uncertainty rationale.`,
      reasoningChain: [
        'Run image quality gate (blur, exposure, occlusions)',
        'Segment specimen boundary and calculate foreground surface area',
        'Extract color histogram in CIE L*a*b* space',
        'Compute equatorial aspect ratio and surface curvature',
        'Match against agronomic variety genetic priors',
        'Output USDA color stage with confidence interval'
      ],
      groundingRules: [
        'Never state a maturity stage without providing the corresponding percentage ripeness range.',
        'Quote optical confidence percentage derived from color histogram entropy.',
        'Explicitly state if image quality gate had to apply edge smoothing or shadow suppression.'
      ],
      outputGuardrails: [
        'Maturity stage must strictly be an integer between 1 and 6.',
        'Ripeness percentage must match USDA definition: Stage 1 = 0-10%, Stage 2 = 10-25%, Stage 3 = 25-45%, Stage 4 = 45-75%, Stage 5 = 75-90%, Stage 6 = 90-100%.',
        'Variety must match registered cultivar database or return "UNKNOWN_HYBRID" with review flag.'
      ]
    },
    interAgentContracts: {
      consumesFrom: [],
      providesTo: [
        { agentId: 'agent_pathology', dataFields: ['specimen_mask', 'surface_area_px', 'variety_id'] },
        { agentId: 'agent_kinetic_twin', dataFields: ['crop', 'variety_id', 'usda_stage', 'ripeness_pct'] },
        { agentId: 'agent_rules_engine', dataFields: ['usda_stage', 'firmness_estimate', 'confidence_pct'] }
      ]
    },
    failureModes: [
      {
        condition: 'Severe Motion Blur (Laplacian variance < 40)',
        symptom: 'Surface edges cannot be demarcated; defect pixels smear.',
        autonomousMitigation: 'Auto-reject image gatekeeper; trigger viewfinder re-capture prompt with haptic warning.',
        fallbackState: 'Use crop hint default with minimum confidence (0.40) and force manual inspection.'
      },
      {
        condition: 'High Specular Glare from Wet Produce or Direct Spotlight',
        symptom: 'Saturated white patches mimic blossom-end rot or sunscald.',
        autonomousMitigation: 'Apply chromaticity thresholding mask (V > 0.95 & S < 0.10) to subtract specular highlights before defect analysis.',
        fallbackState: 'Deduct glare surface area from total denominator so defect ratio is not skewed.'
      }
    ],
    keyFormulasOrHeuristics: [
      'Ripeness% = USDA_Stage * 16.66% (calibrated against cheek carotenoid absorption)',
      'Aspect Ratio = Length_Polar / Width_Equatorial',
      'Laplacian Variance: Var = Σ (Δ²I - μ)² / N'
    ]
  },

  // AGENT 2
  {
    id: 'agent_pathology',
    agentNumber: 2,
    name: 'Defect & Pathology Segmentation Agent',
    shortRole: 'Surface Pathology, Bruise Index & 360° Multi-Angle Fusion',
    domain: 'Phytopathology & Computer Vision Segmentation',
    badgeColor: 'rose',
    coreMission: 'Precisely segment, classify, and quantify surface defects, distinguishing biological pathogens from mechanical handling damage, and fuse multi-angle captures into unified defect surface area percentages.',
    activeSkills: [
      {
        id: 'surface_defect_segmenter',
        name: 'Surface Area Defect Pixel Segmentation',
        category: 'perception',
        status: 'active',
        description: 'Segments contiguous anomaly contours (bruises, scars, rot, cracks) and calculates defect surface area in cm² against total visible specimen surface area.',
        parameters: [
          { name: 'image_b64', type: 'string', required: true, description: 'Segmented specimen image' },
          { name: 'specimen_mask', type: 'object', required: false, description: 'Foreground mask from Agent 1' }
        ],
        outputSchema: '{ defects: DefectDetail[], total_defect_cm2: number, total_surface_cm2: number, defect_ratio_pct: number }',
        edgeHeuristics: 'Filters out normal stem-scar detachment zone (< 1.5 cm² at apical pole) so it is not misclassified as rot.',
        businessImpact: 'Eliminates human inspector disputes by providing exact square centimeter defect measurements.'
      },
      {
        id: 'multi_angle_360_fusion',
        name: 'Multi-Angle 360° Inspection Fusion',
        category: 'perception',
        status: 'active',
        description: 'Fuses up to 5 sequential captures (top, front, left, right, bottom) using projected spherical coordinates to prevent double-counting overlapping defect contours.',
        parameters: [
          { name: 'angle_captures', type: 'Record<string, string>', required: true, description: 'Keyed image angles' }
        ],
        outputSchema: '{ composite_score: number, surface_scanned_pct: number, total_defect_area_cm2: number, defect_pct: number }',
        edgeHeuristics: 'If blind spots exist (< 85% spherical coverage), reduces inspection certainty score proportionally.',
        businessImpact: 'Prevents deceptive crates where damaged underside of fruit is hidden from single-camera inspection.'
      }
    ],
    proposedSkills: [
      {
        id: 'etiological_pathogen_classifier',
        name: 'Etiological Pathogen & Defect Classifier',
        category: 'forensics',
        status: 'recommended_expansion',
        description: 'Distinguishes between 3 distinct defect etiologies: (1) Pathological (Botrytis gray mold, Alternaria black rot, Bacterial soft rot), (2) Mechanical (compression bruising, vibration abrasion, impact rupture), and (3) Physiological (sunscald, blossom-end rot, catfacing, russeting).',
        parameters: [
          { name: 'defect_texture_patches', type: 'ImagePatch[]', required: true, description: 'Zoomed-in defect crops' }
        ],
        outputSchema: '{ etiology: "PATHOLOGICAL" | "MECHANICAL" | "PHYSIOLOGICAL", pathogen_name?: string, contagion_risk: "CRITICAL" | "MODERATE" | "NONE" }',
        edgeHeuristics: 'Any hyphae or sporulation texture automatically triggers CRITICAL contagion risk regardless of area.',
        businessImpact: 'Quarantines infectious mold before it cross-contaminates adjacent crates during warehouse storage.'
      },
      {
        id: 'bruise_volumetric_depth_estimator',
        name: 'Photometric Bruise Depth & Firmness Loss Estimator',
        category: 'biophysical',
        status: 'recommended_expansion',
        description: 'Estimates internal tissue softening and subcutaneous bruise depth (in mm) using shadow depression gradients and color darkening profiles.',
        parameters: [
          { name: 'bruise_contour', type: 'DefectDetail', required: true, description: 'Segmented bruise region' }
        ],
        outputSchema: '{ estimated_depth_mm: number, localized_firmness_kg_cm2: number, internal_pulp_liquefaction: boolean }',
        edgeHeuristics: 'Water-soaked translucent margins indicate severe cell wall pectolytic rupture.',
        businessImpact: 'Detects internal damage before produce leaks juice and collapses in customer grocery bags.'
      }
    ],
    systemInstructions: {
      systemPrompt: `You are Agent 2: Defect & Pathology Segmentation Specialist in the AgriGrade Autonomous Swarm.
Your sole mission is to audit produce surface integrity, measure defect areas, and classify pathological severity.

OPERATIONAL PROTOCOL:
1. DETECT: Identify all mechanical abrasions, compression bruises, micro-cracks, and biotic lesions.
2. CLASSIFY: Label defect etiology accurately (Mechanical vs Pathological vs Physiological).
3. MEASURE: Compute surface area in cm² and calculate Bruise Defect Index (BDI = Defect Area / Total Surface Area * 100).
4. CONTAGION RULE: If fungal sporulation (Botrytis, Rhizopus) is detected, mark severity: 'CRITICAL' and flag immediate dock quarantine, even if surface area is < 1%.
5. CALIBRATE: Cross-verify penetrometer firmness estimate against USDA minimum thresholds.`,
      reasoningChain: [
        'Isolate specimen foreground mask from Agent 1',
        'Run color-texture anomaly detector across cuticle surface',
        'Differentiate physiological calyx detachment from true pathological lesions',
        'Compute bounding boxes [x, y, w, h] and pixel surface area',
        'Calculate composite Bruise Defect Index (BDI)',
        'Check for fungal spore presence to determine contagion risk'
      ],
      groundingRules: [
        'Every detected defect must include normalized bounding box coordinates and square centimeter area.',
        'Never classify cosmetic catfacing or light zipper scars as active bacterial soft rot.',
        'State whether the scan was single-view or 360-degree multi-angle composite.'
      ],
      outputGuardrails: [
        'Total defect percentage must not exceed 100.0%.',
        'Defect severity must be strictly: NEGLIGIBLE, COMMERCIAL_ACCEPTABLE, or CRITICAL.'
      ]
    },
    interAgentContracts: {
      consumesFrom: [
        { agentId: 'agent_vision_phenotyping', dataFields: ['specimen_mask', 'variety_id'] }
      ],
      providesTo: [
        { agentId: 'agent_kinetic_twin', dataFields: ['bruise_defect_index', 'has_fungal_lesion', 'firmness_penetrometer'] },
        { agentId: 'agent_rules_engine', dataFields: ['bruise_defect_index', 'defects_list', 'critical_defects_count'] },
        { agentId: 'agent_root_cause', dataFields: ['defect_etiologies', 'bruise_type'] }
      ]
    },
    failureModes: [
      {
        condition: 'Produce partially obscured by crate slats or label',
        symptom: 'Part of surface area is occluded.',
        autonomousMitigation: 'Compute defect ratio solely against visible surface area and output occlusionScore in image quality gate.',
        fallbackState: 'Add uncertainty penalty to quality score.'
      }
    ]
  },

  // AGENT 3
  {
    id: 'agent_kinetic_twin',
    agentNumber: 3,
    name: 'Kinetic Bio-Decay Digital Twin Agent',
    shortRole: 'Arrhenius Biochemical Modeling & Cold-Chain Telemetry Integration',
    domain: 'Post-Harvest Plant Physiology & Bio-Decay Kinetics',
    badgeColor: 'cyan',
    coreMission: 'Model the biological respiration rate, cellular transpiration, and ethylene-induced senescence using Arrhenius kinetics and real-time IoT cold chain telemetry to compute exact remaining shelf life.',
    activeSkills: [
      {
        id: 'arrhenius_q10_respiration_solver',
        name: 'Arrhenius Q10 Respiration Shelf-Life Solver',
        category: 'biophysical',
        status: 'active',
        description: 'Calculates marketable shelf-life days at ambient and cold-chain temperatures using thermodynamic Arrhenius equations, Q10 temperature coefficient, and maturity multipliers.',
        parameters: [
          { name: 'commodity_id', type: 'string', required: true, description: 'Taxonomic produce key' },
          { name: 'variety_id', type: 'string', required: true, description: 'Specific cultivar' },
          { name: 'usda_stage', type: 'number', required: true, description: 'Color maturity stage' },
          { name: 'ambient_temp_c', type: 'number', required: true, description: 'Current temperature in °C' },
          { name: 'bruise_defect_index', type: 'number', required: true, description: 'Defect damage ratio' }
        ],
        outputSchema: '{ ambient_shelf_life_days: number, cold_shelf_life_days: number, q10_factor: number, daily_decay_rate_pct: number }',
        edgeHeuristics: 'Caps maximum shelf life at variety genetic ceiling; applies non-linear decay curve once stage exceeds 4.',
        businessImpact: 'Replaces static inaccurate specifications with scientifically grounded shelf-life days.'
      },
      {
        id: 'cold_chain_degree_hour_integrator',
        name: 'IoT Telemetry & Degree-Hour Thermal Integrator',
        category: 'biophysical',
        status: 'active',
        description: 'Ingests multi-point temperature logs, calculates accumulated thermal exposure degree-hours above safety threshold, and applies shelf-life deduction.',
        parameters: [
          { name: 'telemetry_stream', type: 'ColdChainTelemetry', required: true, description: 'IoT datalogger payload' },
          { name: 'threshold_temp_c', type: 'number', required: true, description: 'Max allowed temperature (e.g. 10°C)' }
        ],
        outputSchema: '{ thermal_exposure_degree_hours: number, shelf_life_loss_days: number, cold_chain_score: number }',
        edgeHeuristics: 'Applies quadratic penalty if temperature exceeds threshold for more than 120 consecutive minutes.',
        businessImpact: 'Hold logistics carriers accountable for reefer refrigeration shutoffs during transit.'
      }
    ],
    proposedSkills: [
      {
        id: 'transpiration_vpd_mass_loss_solver',
        name: 'Vapor Pressure Deficit (VPD) Transpiration Model',
        category: 'biophysical',
        status: 'recommended_expansion',
        description: 'Computes Vapor Pressure Deficit from ambient temperature and relative humidity ($VPD = e_s(T) \\times (1 - RH/100)$) to model water loss, cuticle shriveling, and saleable weight shrinkage.',
        parameters: [
          { name: 'temp_c', type: 'number', required: true, description: 'Air temperature °C' },
          { name: 'rh_pct', type: 'number', required: true, description: 'Relative humidity %' },
          { name: 'packaging_permeability', type: 'number', required: true, description: 'Water vapor transmission rate' }
        ],
        outputSchema: '{ vpd_kpa: number, daily_mass_loss_pct: number, days_until_visible_shrivel: number }',
        edgeHeuristics: 'VPD > 1.2 kPa accelerates dehydration 3x faster; triggers misting or film enclosure recommendation.',
        businessImpact: 'Prevents weight shrinkage losses (which account for 3-5% of grocery produce revenue).'
      },
      {
        id: 'ethylene_climacteric_catalyst_model',
        name: 'Ethylene Catalytic Acceleration Model',
        category: 'biophysical',
        status: 'recommended_expansion',
        description: 'Models autocatalytic System-2 ethylene ($C_2H_4$) burst in climacteric produce (tomatoes, bananas, apples), computing ripening acceleration when co-stored with high emitters.',
        parameters: [
          { name: 'ethylene_ppm', type: 'number', required: true, description: 'Air sensor ethylene concentration' },
          { name: 'co_stored_commodities', type: 'string[]', required: false, description: 'Adjacent cargo items' }
        ],
        outputSchema: '{ ethylene_acceleration_multiplier: number, days_to_senescence: number, segregation_required: boolean }',
        edgeHeuristics: 'Ethylene > 1.0 ppm triples chlorophyll breakdown rate in breaker tomatoes.',
        businessImpact: 'Prevents accidental co-loading of bananas and leafy greens or ripening tomatoes in mixed logistics.'
      },
      {
        id: 'chilling_injury_risk_detector',
        name: 'Subtropical Chilling Injury Risk Detector',
        category: 'biophysical',
        status: 'recommended_expansion',
        description: 'Monitors if tropical/subtropical produce (tomatoes, bananas, peppers) was stored below critical threshold (< 10°C / 12°C) causing irreversible pitting, off-flavor, and failure to ripen.',
        parameters: [
          { name: 'time_below_chilling_threshold_hours', type: 'number', required: true, description: 'Hours spent below critical temp' }
        ],
        outputSchema: '{ chilling_injury_detected: boolean, severity: "NONE" | "MODERATE" | "SEVERE", flavor_development_impaired: boolean }',
        edgeHeuristics: 'Tomato held < 5°C for > 36 hours loses volatile aroma compounds and develops watery mealiness.',
        businessImpact: 'Prevents over-chilling sensitive crops in generalized frozen/chilled distribution centers.'
      }
    ],
    systemInstructions: {
      systemPrompt: `You are Agent 3: Kinetic Bio-Decay Digital Twin Specialist in the AgriGrade Autonomous Swarm.
Your sole mission is to simulate the biological respiration rate, cellular decay, and remaining marketable shelf life.

OPERATIONAL PROTOCOL:
1. RETRIEVE: Ingest variety genetic base shelf life ($SL_{base}$) and reference temperature ($T_{ref}$) from Commodity Database.
2. TEMPERATURE KINETICS: Apply Arrhenius decay: TempFactor = Q10^(-(T_actual - T_ref) / 10).
3. MATURITY KINETICS: Scale decay by USDA stage: RipenessFactor = 1.0 - (Ripeness% / 100).
4. PATHOLOGY PENALTY: Deduct shelf life for mechanical bruises: D_bruise = min(0.8, BDI / 100 * 0.9).
5. TELEMETRY INTEGRATION: Ingest cold chain degree-hours. Deduct penalty days for thermal spikes > 10°C.
6. COLD VS AMBIENT: Output BOTH ambient shelf life and cold-chain refrigerated shelf life with exact delta days.`,
      reasoningChain: [
        'Query Commodity Database for variety genetic constants (SL_base, T_ref, Q10)',
        'Compute Arrhenius temperature acceleration quotient',
        'Compute maturity stage respiration coefficient',
        'Apply bruise index cellular damage penalty',
        'Integrate IoT datalogger degree-hours and compute cold chain SLA score',
        'Output calibrated ambient days, cold days, and daily decay percentage'
      ],
      groundingRules: [
        'Always quote both ambient temperature shelf life and 8°C cold chain shelf life.',
        'Never predict 0 days unless specimen is rotten or stage 6 with deep fungal liquefaction; minimum marketable window is 0.5 days.',
        'State the exact Q10 respiration constant used in the calculation.'
      ],
      outputGuardrails: [
        'Ambient shelf life must be a non-negative float.',
        'Cold storage shelf life must always be >= ambient shelf life under normal refrigeration conditions.'
      ]
    },
    interAgentContracts: {
      consumesFrom: [
        { agentId: 'agent_vision_phenotyping', dataFields: ['crop', 'variety_id', 'usda_stage', 'ripeness_pct'] },
        { agentId: 'agent_pathology', dataFields: ['bruise_defect_index', 'firmness_penetrometer'] }
      ],
      providesTo: [
        { agentId: 'agent_rules_engine', dataFields: ['ambient_shelf_life_days', 'cold_shelf_life_days'] },
        { agentId: 'agent_demand_forecast', dataFields: ['remaining_shelf_life_days', 'daily_decay_rate_pct'] },
        { agentId: 'agent_pricing_optimizer', dataFields: ['shelf_life_remaining_days'] },
        { agentId: 'agent_routing_optimizer', dataFields: ['shelf_life_remaining_days'] }
      ]
    },
    failureModes: [
      {
        condition: 'IoT Datalogger Missing or Disconnected',
        symptom: 'No continuous temperature history is available.',
        autonomousMitigation: 'Fall back to current ambient probe temperature or regional seasonal meteorological average with flag.',
        fallbackState: 'Set cold chain score to "ESTIMATED_AMBIENT" and widen confidence interval by ±1.5 days.'
      }
    ],
    keyFormulasOrHeuristics: [
      'TempFactor = Q10^(-(T_actual - T_ref) / 10.0)',
      'Remaining Life = SL_base * RipenessFactor * TempFactor * (1.0 - D_bruise)',
      'Thermal Exposure = Σ (T_sample - T_threshold) * Δt_hours'
    ]
  },

  // AGENT 4
  {
    id: 'agent_rules_engine',
    agentNumber: 4,
    name: 'Commercial Decision & Rules Engine Agent',
    shortRole: 'Customer Commercial Tolerances & Dock Disposition Gatekeeping',
    domain: 'Contractual QC Specifications & ERP Gatekeeping',
    badgeColor: 'amber',
    coreMission: 'Apply strict, configurable, clause-by-clause commercial grading rules for specific buyers (e.g. Zepto Quick-Commerce vs Whole Foods vs Heinz Processing) to assign definitive dock verdicts (Grade A, Grade B Markdown, Dock Rejection).',
    activeSkills: [
      {
        id: 'clause_by_clause_rule_evaluator',
        name: 'Configurable Commercial Tolerance Evaluator',
        category: 'decision',
        status: 'active',
        description: 'Parses complex multi-parameter commercial rule specifications (defect %, maturity array, firmness threshold, minimum shelf-life days) and evaluates compliance.',
        parameters: [
          { name: 'rule_specification', type: 'CommercialGradeRule', required: true, description: 'Customer contract specification' },
          { name: 'metrics', type: 'EvaluationInputMetrics', required: true, description: 'Measured inspection metrics' }
        ],
        outputSchema: '{ verdict: "ACCEPTED_GRADE_A" | "ACCEPTED_GRADE_B" | "REJECTED_AT_DOCK", quality_score: number, clauses: ClauseCheckResult[] }',
        edgeHeuristics: 'Grade A requires 100% of Grade A clauses to pass. If any Grade A clause fails, evaluates Grade B clauses.',
        businessImpact: 'Prevents subjective human grader bias and ensures contractual compliance with major retail accounts.'
      },
      {
        id: 'erp_routing_tag_generator',
        name: 'Automated ERP Warehouse Routing Tag Generator',
        category: 'decision',
        status: 'active',
        description: 'Assigns machine-readable warehouse dispatch tags (e.g. PREMIUM_RETAIL_BIN, FAST_DISPATCH_DISCOUNT_15, RETURN_TO_VENDOR) and sets dispatch window deadlines in hours.',
        parameters: [
          { name: 'verdict', type: 'string', required: true, description: 'Grading verdict' },
          { name: 'shelf_life_days', type: 'number', required: true, description: 'Remaining shelf life' }
        ],
        outputSchema: '{ erp_tag: string, dispatch_urgency_hours: number, requires_fast_track: boolean }',
        edgeHeuristics: 'Grade B produce with shelf life < 2.5 days is capped at max 8-hour dispatch window.',
        businessImpact: 'Accelerates dock turnaround time from 45 minutes to under 30 seconds.'
      }
    ],
    proposedSkills: [
      {
        id: 'multi_buyer_arbitrage_matcher',
        name: 'Multi-Buyer Opportunity Arbitrage Matcher',
        category: 'decision',
        status: 'recommended_expansion',
        description: 'When a batch fails Grade A for Buyer X (e.g. Zepto rejection due to cosmetic blemishes), this skill concurrently queries all other registered buyers in the network (e.g. local restaurant chain, juice processing plant) to find alternative profitable destinations instead of dumping or returning to farm.',
        parameters: [
          { name: 'metrics', type: 'EvaluationInputMetrics', required: true, description: 'Batch metrics' },
          { name: 'buyer_rules_registry', type: 'CommercialGradeRule[]', required: true, description: 'All active enterprise buyer rules' }
        ],
        outputSchema: '{ secondary_matches: Array<{ customer: string, verdict: string, net_realized_price: number, diversion_recommendation: string }> }',
        edgeHeuristics: 'Ranks alternative buyers by net realized revenue minus inter-facility re-routing freight costs.',
        businessImpact: 'Converts 40% of dock rejections into secondary sales, recovering millions in supplier revenue.'
      },
      {
        id: 'dynamic_monsoon_tolerance_buffer',
        name: 'Adaptive Market Scarcity Tolerance Buffer',
        category: 'decision',
        status: 'recommended_expansion',
        description: 'Dynamically widens or tightens defect tolerances based on live wholesale market supply deficit data (e.g. when national tomato prices spike 300% due to monsoon rain, Grade A tolerance relaxes from 5% to 8% with automated markdown calibration).',
        parameters: [
          { name: 'market_scarcity_index', type: 'number', required: true, description: 'Current supply scarcity score (1.0 to 2.5)' }
        ],
        outputSchema: '{ adjusted_defect_limit_pct: number, contract_amendment_active: boolean }',
        edgeHeuristics: 'Never relaxes tolerances for safety-critical defects (fungal mold or bacterial rot).',
        businessImpact: 'Prevents empty supermarket shelves during severe regional agricultural supply shocks.'
      }
    ],
    systemInstructions: {
      systemPrompt: `You are Agent 4: Commercial Decision & Rules Engine Specialist in the AgriGrade Autonomous Swarm.
Your sole mission is to deterministically evaluate produce against customer contract tolerances and generate warehouse disposition orders.

OPERATIONAL PROTOCOL:
1. RETRIEVE: Ingest active customer commercial rule (e.g. Zepto Quick-Commerce, Whole Foods Premium, Heinz Processing).
2. CLAUSE AUDIT: Evaluate metrics (BDI, USDA stage, firmness, shelf life) against Grade A clauses.
3. TIER RESOLUTION:
   - If ALL Grade A clauses pass -> ACCEPTED_GRADE_A (Tag: PREMIUM_RETAIL_BIN, Markdown: 0%).
   - If Grade A fails but Grade B passes -> ACCEPTED_GRADE_B (Tag: FAST_DISPATCH_DISCOUNT_X, Markdown: 10-25%, Dispatch Window: <= 8 hours).
   - If Grade B fails or critical defects exist -> REJECTED_AT_DOCK (Tag: RETURN_TO_VENDOR_REJECT).
4. EXPLAIN: Provide transparent clause-by-clause audit log citing measured value vs contract threshold.`,
      reasoningChain: [
        'Load active commercial rule specification',
        'Execute boolean evaluation for each Grade A clause',
        'If Grade A fails, execute boolean evaluation for Grade B clauses',
        'Check for disqualifying critical defects (rot, extreme softening)',
        'Assign final verdict, quality score, discount percentage, and ERP routing tag',
        'Generate structured disposition note'
      ],
      groundingRules: [
        'Every rejection must cite the exact failing clause and numerical measurement.',
        'Never issue a Grade A verdict if defect surface area exceeds the customer Grade A threshold.'
      ],
      outputGuardrails: [
        'Verdict must strictly be: ACCEPTED_GRADE_A, ACCEPTED_GRADE_B, or REJECTED_AT_DOCK.',
        'Quality score must be an integer between 0 and 100.'
      ]
    },
    interAgentContracts: {
      consumesFrom: [
        { agentId: 'agent_vision_phenotyping', dataFields: ['usda_stage', 'firmness_estimate', 'confidence_pct'] },
        { agentId: 'agent_pathology', dataFields: ['bruise_defect_index', 'defects_list'] },
        { agentId: 'agent_kinetic_twin', dataFields: ['ambient_shelf_life_days', 'cold_shelf_life_days'] }
      ],
      providesTo: [
        { agentId: 'agent_demand_forecast', dataFields: ['verdict', 'quality_score', 'dispatch_window_hours'] },
        { agentId: 'agent_pricing_optimizer', dataFields: ['verdict', 'recommended_discount_percent', 'quality_score'] },
        { agentId: 'agent_root_cause', dataFields: ['verdict', 'rejection_reasons'] }
      ]
    },
    failureModes: [
      {
        condition: 'Unknown or unconfigured customer rule ID',
        symptom: 'Requested buyer specification not found in database.',
        autonomousMitigation: 'Safely fall back to default general Quick-Commerce benchmark rule and log audit event.',
        fallbackState: 'Apply default rule (Grade A <5%, Grade B 5-15%).'
      }
    ]
  },

  // AGENT 5
  {
    id: 'agent_demand_forecast',
    agentNumber: 5,
    name: 'Demand Forecasting & Waste Prevention Agent',
    shortRole: 'Store-Level Velocity Nowcasting & Waste Hazard Modeling',
    domain: 'Inventory Operations & Perishable Demand Forecasting',
    badgeColor: 'indigo',
    coreMission: 'Predict store-level sales velocity, compute expected unsold inventory before expiration, and trigger automated stock rebalancing or flash markdowns before produce turns to food waste.',
    activeSkills: [
      {
        id: 'store_sell_through_estimator',
        name: 'Store Sell-Through & Spoilage Hazard Forecaster',
        category: 'optimization',
        status: 'active',
        description: 'Combines current batch inventory (kg), store sales velocity (kg/day), and kinetic remaining shelf life to forecast exact unsold kg and waste probability %.',
        parameters: [
          { name: 'current_inventory_kg', type: 'number', required: true, description: 'Store current stock' },
          { name: 'shelf_life_days', type: 'number', required: true, description: 'Remaining marketable window' },
          { name: 'store_sales_velocity_kg_day', type: 'number', required: true, description: 'Average daily sales velocity' }
        ],
        outputSchema: '{ expected_sell_through_kg: number, expected_unsold_kg: number, waste_probability_pct: number, recommendation: string }',
        edgeHeuristics: 'If waste probability exceeds 40%, recommendation escalates from NORMAL_DISPATCH to FLASH_MARKDOWN or TRANSFER_INVENTORY.',
        businessImpact: 'Prevents dark store shrinkage by acting 48 hours before produce expires on the shelf.'
      }
    ],
    proposedSkills: [
      {
        id: 'hyperlocal_weather_demand_nowcaster',
        name: 'Hyperlocal Weather & Event Demand Nowcaster',
        category: 'optimization',
        status: 'recommended_expansion',
        description: 'Adjusts hourly sales velocity using real-time precipitation radars and local events (e.g. heavy rain increases quick-commerce vegetable orders by +35% to +60% as consumers avoid traveling to open markets).',
        parameters: [
          { name: 'rainfall_active', type: 'boolean', required: true, description: 'Current rain radar' },
          { name: 'day_of_week', type: 'number', required: true, description: 'Day of week (0-6)' }
        ],
        outputSchema: '{ adjusted_sales_velocity_kg_day: number, weather_surge_multiplier: number, confidence_pct: number }',
        edgeHeuristics: 'Friday/Saturday evening combined with rain triggers highest quick-commerce vegetable velocity.',
        businessImpact: 'Prevents premature markdowns during high-demand rainy windows.'
      },
      {
        id: 'fefo_picking_queue_prioritizer',
        name: 'FEFO (First-Expired, First-Out) Warehouse Picking Engine',
        category: 'optimization',
        status: 'recommended_expansion',
        description: 'Directs dark store picker handheld terminals (RF scanners) to pick batches by lowest remaining kinetic shelf life rather than invoice arrival date (FIFO).',
        parameters: [
          { name: 'store_bin_batches', type: 'Array<{ bin_id: string, shelf_life_days: number }>', required: true, description: 'Active bins' }
        ],
        outputSchema: '{ prioritized_picking_bin: string, estimated_waste_avoided_kg: number }',
        edgeHeuristics: 'Prioritizes bins with shelf life < 1.5 days even if they arrived on a later truck.',
        businessImpact: 'Reduces dark store dump waste by 22% through pure picking priority optimization.'
      }
    ],
    systemInstructions: {
      systemPrompt: `You are Agent 5: Demand Forecasting & Waste Prevention Specialist in the AgriGrade Autonomous Swarm.
Your sole mission is to forecast perishable inventory clearance, quantify waste risk, and recommend inventory protection actions.

OPERATIONAL PROTOCOL:
1. MODEL: Expected Sell-Through (kg) = min(Current Inventory kg, Shelf Life Days * Sales Velocity kg/day * Demand Surge Factor).
2. CALCULATE HAZARD: Unsold (kg) = Current Inventory - Sell Through. Waste Probability (%) = (Unsold / Current Inventory) * 100.
3. RECOMMEND:
   - If Waste Prob < 20% -> NORMAL_DISPATCH.
   - If Waste Prob 20-50% -> FLASH_MARKDOWN.
   - If Waste Prob >= 50% -> TRANSFER_INVENTORY (or DIVERT_TO_PROCESSING if shelf life < 1 day).
4. QUANTIFY: Provide exact kg and monetary waste risk if no intervention is taken.`,
      reasoningChain: [
        'Calculate maximum marketable window from Agent 3',
        'Multiply velocity by available hours/days to determine absorption capacity',
        'Compute difference between batch weight and absorption capacity',
        'Assign waste risk tier and select optimal counter-measure'
      ],
      groundingRules: [
        'Always quote both expected sell-through kg and expected unsold kg.',
        'Never recommend normal dispatch if waste probability is >= 50%.'
      ],
      outputGuardrails: [
        'Waste probability must be bounded between 0% and 100%.',
        'Recommendation must match enum: TRANSFER_INVENTORY, FLASH_MARKDOWN, NORMAL_DISPATCH, DIVERT_TO_PROCESSING.'
      ]
    },
    interAgentContracts: {
      consumesFrom: [
        { agentId: 'agent_kinetic_twin', dataFields: ['ambient_shelf_life_days'] },
        { agentId: 'agent_rules_engine', dataFields: ['verdict', 'dispatch_window_hours'] }
      ],
      providesTo: [
        { agentId: 'agent_routing_optimizer', dataFields: ['waste_probability_pct', 'recommended_transfer_kg'] },
        { agentId: 'agent_pricing_optimizer', dataFields: ['waste_probability_pct', 'expected_unsold_kg'] }
      ]
    },
    failureModes: [
      {
        condition: 'New dark store with zero historical velocity data',
        symptom: 'Division by zero or lack of sales velocity baseline.',
        autonomousMitigation: 'Inherit cluster peer store median velocity and apply conservative 0.7x ramp factor.',
        fallbackState: 'Use cluster median velocity with 20% wider buffer.'
      }
    ]
  },

  // AGENT 6
  {
    id: 'agent_routing_optimizer',
    agentNumber: 6,
    name: 'Intelligent Routing & Logistics Agent',
    shortRole: 'Multi-Store Network Allocation & Margin Maximization',
    domain: 'Supply Chain Operations Research & Logistics Optimization',
    badgeColor: 'emerald',
    coreMission: 'Evaluate multi-store micro-fulfillment networks to route incoming perishable batches to the destination hub that maximizes sell-through and net realized revenue while minimizing transit degradation.',
    activeSkills: [
      {
        id: 'multi_store_margin_optimizer',
        name: 'Multi-Store Allocation & Net Revenue Solver',
        category: 'optimization',
        status: 'active',
        description: 'Simulates delivery to alternative dark store hubs (distance, transit time, current demand velocity, capacity) to choose the optimal destination.',
        parameters: [
          { name: 'batch_kg', type: 'number', required: true, description: 'Batch weight' },
          { name: 'shelf_life_days', type: 'number', required: true, description: 'Remaining shelf life' },
          { name: 'candidate_stores', type: 'StoreRoutingOption[]', required: true, description: 'Candidate network nodes' }
        ],
        outputSchema: '{ selected_store: StoreRoutingOption, evaluated_stores: StoreRoutingOption[], routing_rationale: string }',
        edgeHeuristics: 'Penalizes distant stores (> 25 km) if batch shelf life is < 2.0 days due to transit heat exposure.',
        businessImpact: 'Prevents sending short-shelf-life produce to slow-moving suburban stores where it rots.'
      }
    ],
    proposedSkills: [
      {
        id: 'dynamic_traffic_thermal_delay_solver',
        name: 'Live Traffic & Urban Heat Island Transit Simulator',
        category: 'optimization',
        status: 'recommended_expansion',
        description: 'Ingests live road traffic congestion APIs and urban heat island temperatures to simulate non-refrigerated lorry cargo degradation during peak transit gridlock.',
        parameters: [
          { name: 'route_distance_km', type: 'number', required: true, description: 'Route length' },
          { name: 'traffic_delay_minutes', type: 'number', required: true, description: 'Traffic delay' },
          { name: 'vehicle_type', type: 'string', required: true, description: 'AMBIENT_LORRY vs REEFER' }
        ],
        outputSchema: '{ transit_shelf_life_loss_hours: number, maximum_allowed_departure_time: string, diversion_advised: boolean }',
        edgeHeuristics: 'If ambient vehicle is stuck in > 35°C afternoon traffic for > 90 mins, auto-diverts to nearest peripheral hub.',
        businessImpact: 'Prevents cargo spoilage while waiting in metropolitan traffic jams.'
      },
      {
        id: 'cross_dock_consolidation_planner',
        name: 'Cross-Dock & Multi-Stop Consolidation Planner',
        category: 'optimization',
        status: 'recommended_expansion',
        description: 'Batches partial crate lots into consolidated delivery runs across multiple adjacent dark stores to minimize empty miles.',
        parameters: [
          { name: 'network_lot_manifests', type: 'LotManifest[]', required: true, description: 'Active lots' }
        ],
        outputSchema: '{ truck_load_factor_pct: number, route_cost_savings_inr: number }',
        edgeHeuristics: 'Combines Grade A and Grade B lots in separate color-coded crate tiers.',
        businessImpact: 'Cuts per-kilogram urban logistics delivery costs by 18%.'
      }
    ],
    systemInstructions: {
      systemPrompt: `You are Agent 6: Intelligent Routing & Logistics Specialist in the AgriGrade Autonomous Swarm.
Your sole mission is to route perishable batches across the fulfillment network to maximize net realized margin.

OPERATIONAL PROTOCOL:
1. EVALUATE: Score each candidate dark store on: (a) Demand velocity, (b) Available capacity, (c) Transit distance/time, (d) Projected waste risk.
2. NET REVENUE: Net Realized Revenue = Expected Sell-Through (kg) * Base Price - (Transit Cost + Waste Cost).
3. SELECT: Choose the store with highest Recommendation Score and lowest waste hazard.
4. DISPATCH URGENCY: Calculate exact dispatch window deadline based on transit duration and remaining hours.`,
      reasoningChain: [
        'Calculate transit time to candidate dark stores',
        'Project sell-through percentage at each candidate hub',
        'Deduct logistics freight cost from gross sales',
        'Select optimal node and set dispatch urgency deadline'
      ],
      groundingRules: [
        'Quote the net realized revenue for the selected store compared to the baseline.',
        'Never route produce with < 2 days shelf life to a store with transit time > 3 hours in ambient lorries.'
      ],
      outputGuardrails: [
        'Recommendation score must be an integer between 0 and 100.',
        'Selected store must have available storage capacity.'
      ]
    },
    interAgentContracts: {
      consumesFrom: [
        { agentId: 'agent_kinetic_twin', dataFields: ['ambient_shelf_life_days'] },
        { agentId: 'agent_demand_forecast', dataFields: ['waste_probability_pct'] }
      ],
      providesTo: [
        { agentId: 'agent_pricing_optimizer', dataFields: ['selected_store_id', 'transit_minutes'] },
        { agentId: 'agent_orchestrator', dataFields: ['selected_store', 'dispatch_urgency_hours'] }
      ]
    },
    failureModes: [
      {
        condition: 'All candidate stores report 100% capacity saturation',
        symptom: 'No open bin space at primary dark store hubs.',
        autonomousMitigation: 'Trigger mother-hub central cold storage holding protocol or divert to industrial processing.',
        fallbackState: 'Route to Central Cold Storage Facility.'
      }
    ]
  },

  // AGENT 7
  {
    id: 'agent_pricing_optimizer',
    agentNumber: 7,
    name: 'Dynamic Pricing & Markdown Optimizer Agent',
    shortRole: 'Multi-Variable Margin & Price Elasticity Solver',
    domain: 'Algorithmic Pricing & Revenue Management',
    badgeColor: 'amber',
    coreMission: 'Determine the revenue-maximizing price point and dynamic discount percentage across 8 micro-economic variables, ensuring inventory clears before expiration while protecting contribution margins.',
    activeSkills: [
      {
        id: 'eight_variable_markdown_solver',
        name: '8-Variable Perishable Dynamic Markdown Solver',
        category: 'optimization',
        status: 'active',
        description: 'Computes optimal markdown % balancing shelf-life decay, inventory pressure, demand velocity, competitor price benchmark, time-of-day, day-of-week, waste hazard, and quality grade.',
        parameters: [
          { name: 'shelf_life_days', type: 'number', required: true, description: 'Remaining shelf life' },
          { name: 'current_inventory_kg', type: 'number', required: true, description: 'Store inventory' },
          { name: 'competitor_price', type: 'number', required: true, description: 'Market competitor price' },
          { name: 'base_price', type: 'number', required: true, description: 'Catalog base price' },
          { name: 'grade', type: 'string', required: true, description: 'GRADE_A vs GRADE_B' }
        ],
        outputSchema: '{ recommended_markdown_pct: number, final_price_per_kg: number, projected_revenue_gain_inr: number, rationale: string }',
        edgeHeuristics: 'Grade A produce maintains 0% markdown unless shelf life drops under 2 days. Grade B starts at 10-15% markdown.',
        businessImpact: 'Recovers up to 85% of revenue that would otherwise be discarded as 100% write-off waste.'
      }
    ],
    proposedSkills: [
      {
        id: 'price_elasticity_curve_solver',
        name: 'Empirical Price Elasticity Demand Lift Solver',
        category: 'optimization',
        status: 'recommended_expansion',
        description: 'Models commodity-specific price elasticity coefficient $\\epsilon = \\frac{\\% \\Delta Q}{\\% \\Delta P}$ (e.g. $\\epsilon = -1.45$ for cooking tomatoes, $\\epsilon = -0.80$ for premium berries) to simulate exact kilogram volume lift per discount tier.',
        parameters: [
          { name: 'commodity_category', type: 'string', required: true, description: 'Commodity category' },
          { name: 'target_clearance_kg', type: 'number', required: true, description: 'Required kg clearance' }
        ],
        outputSchema: '{ optimal_elasticity_markdown_pct: number, predicted_hourly_sales_lift_kg: number }',
        edgeHeuristics: 'Prevents discounting in inelastic categories where lower prices do not stimulate incremental sales.',
        businessImpact: 'Prevents unnecessary profit give-away on staple items.'
      },
      {
        id: 'contribution_margin_floor_guard',
        name: 'Contribution Margin Floor Guard & Anti-Predatory Check',
        category: 'optimization',
        status: 'recommended_expansion',
        description: 'Enforces hard procurement cost floors plus handling fees so algorithmic markdowns never produce negative unit gross margin.',
        parameters: [
          { name: 'procurement_cost_per_kg', type: 'number', required: true, description: 'Farmer acquisition cost' },
          { name: 'fulfillment_cost_per_kg', type: 'number', required: true, description: 'Pick & pack cost' }
        ],
        outputSchema: '{ minimum_allowable_price: number, floor_breached: boolean }',
        edgeHeuristics: 'If salvage markdown drops below floor, re-evaluates diversion to processing or animal feed donation for tax credit.',
        businessImpact: 'Protects gross unit economics from runaway algorithmic discount cascades.'
      }
    ],
    systemInstructions: {
      systemPrompt: `You are Agent 7: Dynamic Pricing & Markdown Optimizer in the AgriGrade Autonomous Swarm.
Your sole mission is to calculate the revenue-maximizing price point and markdown percentage for perishable batches.

OPERATIONAL PROTOCOL:
1. EVALUATE: Ingest 8 variables (shelf life, inventory, velocity, competitor price, time-of-day, day-of-week, waste risk, grade).
2. SOLVE: Find discount % that accelerates velocity enough to sell 100% of inventory within 80% of remaining shelf life.
3. GUARD: Respect contribution margin floor. Never price below procurement cost unless produce will expire within 8 hours.
4. RATIONALE: Provide clear pricing logic for store managers and automated pricing engines.`,
      reasoningChain: [
        'Calculate inventory pressure (current stock / daily velocity)',
        'Check time-to-decay deadline from Agent 3',
        'Compare catalog base price against competitor benchmark',
        'Compute multi-factor discount percentage',
        'Validate against margin floor and output final price'
      ],
      groundingRules: [
        'Always quote both base price and final discounted price per kg.',
        'Quote the projected revenue gain compared to a 100% inventory spoilage loss.'
      ],
      outputGuardrails: [
        'Markdown percentage must be an integer between 0% and 50%.',
        'Final price must be strictly positive.'
      ]
    },
    interAgentContracts: {
      consumesFrom: [
        { agentId: 'agent_kinetic_twin', dataFields: ['ambient_shelf_life_days'] },
        { agentId: 'agent_rules_engine', dataFields: ['verdict', 'recommended_discount_percent'] },
        { agentId: 'agent_demand_forecast', dataFields: ['expected_unsold_kg', 'waste_probability_pct'] }
      ],
      providesTo: [
        { agentId: 'agent_orchestrator', dataFields: ['recommended_markdown_pct', 'final_price_per_kg'] }
      ]
    },
    failureModes: [
      {
        condition: 'Competitor price API offline',
        symptom: 'Real-time market price benchmark is missing.',
        autonomousMitigation: 'Fall back to internal catalog standard reference price without external comparison.',
        fallbackState: 'Use internal catalog base price.'
      }
    ]
  },

  // AGENT 8
  {
    id: 'agent_root_cause',
    agentNumber: 8,
    name: 'Autonomous Risk & Root Cause Diagnostic Agent',
    shortRole: 'Supply Chain Forensics & Predictive Supplier Reliability',
    domain: 'Quality Forensics & Vendor Performance Analytics',
    badgeColor: 'rose',
    coreMission: 'Correlate inspection defects with IoT transit telemetry, weather, and supplier historical records to isolate root causes (farm harvest vs transit shock vs cold-chain breach) and score supplier predictive risk.',
    activeSkills: [
      {
        id: 'multi_factor_root_cause_synthesizer',
        name: 'Multi-Factor Root Cause Forensic Synthesizer',
        category: 'forensics',
        status: 'active',
        description: 'Analyzes defect patterns (compression bruise, thermal softening, fungal rot) alongside g-force vibration logs, degree-hours, and rain history to pinpoint blame.',
        parameters: [
          { name: 'supplier_name', type: 'string', required: true, description: 'Supplier ID' },
          { name: 'bruise_index', type: 'number', required: true, description: 'BDI %' },
          { name: 'thermal_excursion_hours', type: 'number', required: true, description: 'Hours above 10°C' },
          { name: 'vibration_g_force', type: 'number', required: true, description: 'Peak road shock G' }
        ],
        outputSchema: '{ primary_cause: string, secondary_cause: string, supplier_correlation: string, preventative_action: string }',
        edgeHeuristics: 'High vibration (> 2.0G) + compression bruises = Inadequate crate strapping and rough road transit.',
        businessImpact: 'Resolves vendor disputes by providing irrefutable objective forensic causality.'
      },
      {
        id: 'predictive_supplier_risk_modeler',
        name: 'Bayesian Supplier Reliability & Risk Modeler',
        category: 'forensics',
        status: 'active',
        description: 'Computes multi-dimensional supplier scorecards (Quality, Cold Chain, Consistency, Delivery) and predicts future batch rejection probability.',
        parameters: [
          { name: 'supplier_name', type: 'string', required: true, description: 'Supplier name' }
        ],
        outputSchema: '{ overall_score: number, predictive_risk_tier: "LOW" | "MODERATE" | "HIGH" | "CRITICAL", predictive_rejection_prob_pct: number }',
        edgeHeuristics: 'Suppliers with 3 consecutive temperature excursions are flagged HIGH risk with mandatory dock inspection.',
        businessImpact: 'Prevents accepting bad cargo by prioritizing QA audits on high-risk vendors.'
      }
    ],
    proposedSkills: [
      {
        id: 'automated_debit_note_generator',
        name: 'Automated Commercial Debit Note & SLA Penalty Drafter',
        category: 'forensics',
        status: 'recommended_expansion',
        description: 'Automatically drafts ERP commercial debit notes and contract penalty claims based on quantified dock rejection loss and carrier temperature breaches.',
        parameters: [
          { name: 'rejection_kg', type: 'number', required: true, description: 'Rejected volume' },
          { name: 'contract_unit_price', type: 'number', required: true, description: 'Agreed unit price' },
          { name: 'cause_category', type: 'string', required: true, description: 'FARM_DEFECT vs CARRIER_BREACH' }
        ],
        outputSchema: '{ debit_amount_inr: number, legal_sla_clause_cited: string, formal_claim_letter_text: string }',
        edgeHeuristics: 'Applies 100% debit to supplier for pre-harvest defects; applies debit to third-party logistics for thermal breach.',
        businessImpact: 'Recovers 100% of contractual penalties without manual accounting investigations.'
      },
      {
        id: 'alternative_supplier_rebalancer',
        name: 'Autonomous Supplier Reallocation Recommender',
        category: 'forensics',
        status: 'recommended_expansion',
        description: 'When a supplier enters HIGH risk tier, queries network database to recommend vetted alternative suppliers in the same cluster with lower defect rates and higher cold chain scores.',
        parameters: [
          { name: 'failing_supplier_id', type: 'string', required: true, description: 'High risk vendor' },
          { name: 'commodity', type: 'string', required: true, description: 'Required commodity' }
        ],
        outputSchema: '{ recommended_supplier: string, price_delta_pct: number, projected_waste_reduction_pct: number }',
        edgeHeuristics: 'Recommends suppliers within 50 km radius to maintain freight economics.',
        businessImpact: 'Protects procurement supply chain from chronic low-performing suppliers.'
      }
    ],
    systemInstructions: {
      systemPrompt: `You are Agent 8: Autonomous Risk & Root Cause Diagnostic Specialist in the AgriGrade Autonomous Swarm.
Your sole mission is to investigate defect causes, attribute responsibility between farm and transit, and manage vendor risk.

OPERATIONAL PROTOCOL:
1. FORENSIC ATTRIBUTION:
   - If thermal excursion > 2 hrs + soft tissue -> Carrier Cold-Chain Breach.
   - If vibration > 1.8G + bottom-layer compression -> Inadequate Crate Packaging & Rough Transit.
   - If fungal sporulation + sunburn -> Farm-Gate Pre-Harvest Field Infection.
2. VENDOR SCORING: Calculate 5-axis score (Quality, Consistency, Cold Chain, Delivery, Damage).
3. ACTION: Issue actionable remediation (e.g. adjust reefer setpoint, limit crate stacking to 5 tiers).`,
      reasoningChain: [
        'Analyze defect morphology from Agent 2',
        'Cross-examine IoT temperature and accelerometer logs from Agent 3',
        'Review supplier historical batch records',
        'Synthesize primary and secondary root causes',
        'Calculate predictive risk tier and procurement action'
      ],
      groundingRules: [
        'Always attribute causality to either Farm-Gate, Logistics-Transit, or Packaging.',
        'Quote specific sensor numbers (temperature hours or G-force) when asserting transit blame.'
      ],
      outputGuardrails: [
        'Predictive risk tier must strictly be: LOW, MODERATE, HIGH, or CRITICAL.',
        'Rejection probability must be a percentage between 0% and 100%.'
      ]
    },
    interAgentContracts: {
      consumesFrom: [
        { agentId: 'agent_pathology', dataFields: ['bruise_defect_index', 'defects_list'] },
        { agentId: 'agent_kinetic_twin', dataFields: ['cold_chain_score', 'actual_avg_temp_c'] },
        { agentId: 'agent_rules_engine', dataFields: ['verdict', 'rejection_reasons'] }
      ],
      providesTo: [
        { agentId: 'agent_learning_agent', dataFields: ['root_cause_tags', 'supplier_score'] }
      ]
    },
    failureModes: [
      {
        condition: 'First delivery from brand-new supplier',
        symptom: 'No historical deliveries in scorecard database.',
        autonomousMitigation: 'Assign provisional baseline score of 75/100 and mark as PROVISIONAL_MONITORING status.',
        fallbackState: 'Provisional Moderate Risk tier.'
      }
    ]
  },

  // AGENT 9
  {
    id: 'agent_learning_agent',
    agentNumber: 9,
    name: 'Closed-Loop Model Calibration & Learning Agent',
    shortRole: 'Ground-Truth Outcome Feedback & Continuous Calibration',
    domain: 'Continual Machine Learning & Statistical Calibration',
    badgeColor: 'purple',
    coreMission: 'Close the loop between initial dock inspection predictions and downstream actual outcomes (actual sales, dump waste, customer refund claims) to continuously calibrate model accuracy and eliminate drift.',
    activeSkills: [
      {
        id: 'closed_loop_feedback_calibrator',
        name: 'Bayesian Shelf-Life Residual Calibrator',
        category: 'learning',
        status: 'active',
        description: 'Computes prediction error residual ($e = \\text{ActualDays} - \\text{PredictedDays}$), updates Mean Absolute Error (MAE), and calculates learned decay offset for specific cultivars and farms.',
        parameters: [
          { name: 'completed_batches', type: 'ActualOutcomeRecord[]', required: true, description: 'Historical batches with known outcomes' }
        ],
        outputSchema: '{ total_batches_learned: number, mae_days: number, accuracy_pct: number, learned_decay_offset_days: number }',
        edgeHeuristics: 'Uses exponential moving average with decay factor alpha = 0.15 to prevent single outliers from skewing model.',
        businessImpact: 'Transforms static software into a self-improving intelligence platform that gets smarter every week.'
      }
    ],
    proposedSkills: [
      {
        id: 'seasonality_concept_drift_detector',
        name: 'Seasonality & Climate Concept Drift Detector',
        category: 'learning',
        status: 'recommended_expansion',
        description: 'Monitors population stability index (PSI) and prediction residuals across changing seasons (e.g. monsoon moisture transition) to detect concept drift and auto-trigger recalibration.',
        parameters: [
          { name: 'rolling_residual_window', type: 'number[]', required: true, description: 'Past 50 batch residuals' }
        ],
        outputSchema: '{ drift_detected: boolean, drift_magnitude_sigma: number, recalibration_required: boolean }',
        edgeHeuristics: 'If MAE drifts by > 0.8 days over 14 days, issues concept drift advisory to agronomy team.',
        businessImpact: 'Prevents seasonal accuracy drop during monsoon or summer heat transitions.'
      },
      {
        id: 'active_learning_uncertainty_sampler',
        name: 'Active Learning Epistemic Uncertainty Sampler',
        category: 'learning',
        status: 'recommended_expansion',
        description: 'Flags borderline batches with high epistemic model uncertainty (> 20% prediction variance) for mandatory agronomist ground-truth labeling, maximizing retraining data value.',
        parameters: [
          { name: 'batch_confidence_breakdown', type: 'ModelConfidenceBreakdown', required: true, description: 'Current scan confidence' }
        ],
        outputSchema: '{ sample_for_training: boolean, sampling_priority: "HIGH" | "MEDIUM" | "LOW", ground_truth_task_id: string }',
        edgeHeuristics: 'Prioritizes rare varieties and borderline Grade A/B decision thresholds.',
        businessImpact: 'Reduces manual agronomist labeling effort by 80% while accelerating model learning speed.'
      }
    ],
    systemInstructions: {
      systemPrompt: `You are Agent 9: Closed-Loop Model Calibration & Learning Specialist in the AgriGrade Autonomous Swarm.
Your sole mission is to ingest actual historical outcomes (sales, dumps, refunds) and continuously calibrate model weights.

OPERATIONAL PROTOCOL:
1. INGEST: Match initial dock inspection prediction against downstream actual store outcome record.
2. COMPUTE ERROR: Residual = Actual Shelf Life - Predicted Shelf Life. Compute Mean Absolute Error (MAE).
3. CALIBRATE: Update learned decay offset for variety and supplier cohort using Bayesian priors.
4. AUDIT: Record version provenance with timestamp and statistical calibration cycle count.`,
      reasoningChain: [
        'Match inspection record to final warehouse outcome audit',
        'Calculate error residual and accuracy percentage',
        'Update exponential moving average for variety shelf life',
        'Check for seasonal model drift',
        'Emit updated calibration metrics and ledger entry'
      ],
      groundingRules: [
        'Always quote total number of historical batches learned and current MAE in days.',
        'Never overwrite genetic baseline variety constants without at least 30 verified batch outcomes.'
      ],
      outputGuardrails: [
        'Accuracy percentage must be bounded between 0% and 100%.',
        'Learned decay offset must be bounded between -3.0 and +3.0 days.'
      ]
    },
    interAgentContracts: {
      consumesFrom: [
        { agentId: 'agent_root_cause', dataFields: ['root_cause_tags', 'supplier_score'] },
        { agentId: 'agent_rules_engine', dataFields: ['verdict', 'quality_score'] }
      ],
      providesTo: [
        { agentId: 'agent_kinetic_twin', dataFields: ['learned_decay_offset_days'] },
        { agentId: 'agent_vision_phenotyping', dataFields: ['variety_confidence_priors'] }
      ]
    },
    failureModes: [
      {
        condition: 'Insufficient historical outcome records (< 5 batches)',
        symptom: 'Small sample size risks statistical overfitting.',
        autonomousMitigation: 'Retain theoretical Arrhenius baseline without applying empirical offset until sample threshold is reached.',
        fallbackState: 'Zero learned offset until N >= 10 batches.'
      }
    ]
  },

  // SWARM ORCHESTRATOR
  {
    id: 'agent_orchestrator',
    agentNumber: 0,
    name: 'Swarm Orchestrator & Synthesis Supervisor',
    shortRole: 'DAG Scheduling, Cross-Agent Synthesis & Consensus Guard',
    domain: 'Multi-Agent Coordination & System Orchestration',
    badgeColor: 'purple',
    coreMission: 'Supervise the 9-agent directed acyclic graph (DAG), manage asynchronous parallel execution, enforce inter-agent data contracts, resolve conflicting recommendations, and guarantee zero-hallucination factual consistency.',
    activeSkills: [
      {
        id: 'directed_acyclic_graph_scheduler',
        name: 'Parallel Asynchronous DAG Task Scheduler',
        category: 'orchestration',
        status: 'active',
        description: 'Schedules Agent 1 (Vision), Agent 2 (Pathology), and Agent 3 (Kinetic Twin) in parallel; waits for barrier synchronization, then executes Agent 4 (Rules), followed by concurrent downstream solvers (Demand, Routing, Pricing, Risk).',
        parameters: [
          { name: 'inspection_payload', type: 'InspectionRequest', required: true, description: 'Raw camera and context input' }
        ],
        outputSchema: '{ execution_graph_ms: number, agent_traces: AgentTraceStep[], composite_report: AgriGradeReport }',
        edgeHeuristics: 'Fails fast if Agent 1 image quality gate fails catastrophically.',
        businessImpact: 'Completes entire 9-agent analysis in under 850 milliseconds.'
      },
      {
        id: 'zero_hallucination_cross_verifier',
        name: 'Cross-Agent Numerical Consistency Guard',
        category: 'orchestration',
        status: 'active',
        description: 'Validates that downstream agents (Pricing, Routing, Chat) quote the exact numbers produced by upstream specialized agents (e.g. BDI from Agent 2, days from Agent 3) without hallucination or numerical drift.',
        parameters: [
          { name: 'agent_outputs', type: 'Record<string, any>', required: true, description: 'All agent outputs' }
        ],
        outputSchema: '{ verified: boolean, drifted_fields: string[] }',
        edgeHeuristics: 'Enforces strict assertion checks across all inter-agent contract boundaries.',
        businessImpact: 'Guarantees 100% mathematical auditability for enterprise customers.'
      }
    ],
    proposedSkills: [
      {
        id: 'multi_objective_nash_conflict_resolver',
        name: 'Multi-Objective Pareto & Conflict Arbiter',
        category: 'orchestration',
        status: 'recommended_expansion',
        description: 'Arbitrates when downstream agents emit conflicting recommendations (e.g., Routing Agent wants to ship to Store A for velocity, but Pricing Agent calculates that marking down at Store B yields +₹4,500 higher margin; or Field Advisor says harvest today while Weather Advisor says delay 24h due to morning rain).',
        parameters: [
          { name: 'agent_recommendations', type: 'Array<{ agentId: string, action: string, objective_value: number }>', required: true, description: 'Conflicting options' }
        ],
        outputSchema: '{ arbitrated_verdict: string, pareto_optimal_score: number, conflict_resolution_rationale: string }',
        edgeHeuristics: 'Always gives safety-critical and product shelf-life constraints higher priority than raw pricing optimization.',
        businessImpact: 'Eliminates operational deadlock between conflicting micro-fulfillment departments.'
      },
      {
        id: 'autonomous_circuit_breaker_healer',
        name: 'Autonomous Agent Circuit Breaker & Graceful Degrader',
        category: 'orchestration',
        status: 'recommended_expansion',
        description: 'Monitors agent latency and failure rates; if an external API or sub-agent fails or times out (> 1500ms), trips the circuit breaker and substitutes a verified deterministic backup without crashing the pipeline.',
        parameters: [
          { name: 'agent_latencies_ms', type: 'Record<string, number>', required: true, description: 'Latency stream' }
        ],
        outputSchema: '{ circuit_breaker_tripped: boolean, fallback_invoked: string }',
        edgeHeuristics: 'Ensures the dock worker terminal never hangs or shows a blank loading spinner.',
        businessImpact: 'Maintains 99.99% dock gatekeeping uptime even during cloud connectivity dips.'
      }
    ],
    systemInstructions: {
      systemPrompt: `You are the Swarm Orchestrator & Synthesis Supervisor of the AgriGrade Multi-Agent Platform.
Your mission is to coordinate the 9 specialized agents, guarantee cross-agent factual consistency, and produce an integrated, authoritative AgriGrade Report.

COORDINATION DIRECTIVES:
1. DISPATCH: Launch Perception (Agents 1 & 2) and Kinetic Twin (Agent 3) in parallel.
2. SYNCHRONIZE: Verify all optical and biological metrics are consistent before triggering Rules Engine (Agent 4).
3. DOWNSTREAM ARBITRATION: Direct outputs to Demand (Agent 5), Routing (Agent 6), and Pricing (Agent 7). If objectives conflict, prioritize waste prevention and food safety over speculative price gains.
4. AUDIT: Record comprehensive cryptographic provenance ledger for the entire execution.`,
      reasoningChain: [
        'Ingest raw camera frame and sensor telemetry context',
        'Execute Perception & Kinetic pipeline in parallel',
        'Barrier sync: Verify data integrity across agents 1, 2, and 3',
        'Execute deterministic commercial rules engine (Agent 4)',
        'Trigger concurrent optimization engines (Agents 5, 6, 7)',
        'Compile forensic risk and closed-loop feedback (Agents 8, 9)',
        'Emit finalized unified AgriGrade Report'
      ],
      groundingRules: [
        'Never permit downstream agents to hallucinate or modify numbers generated by upstream agents.',
        'Always maintain full traceable execution latency per agent in the trace step array.'
      ],
      outputGuardrails: [
        'Total swarm execution time must stay under 1500ms.',
        'Unified report must conform strictly to AgriGradeReport schema.'
      ]
    },
    interAgentContracts: {
      consumesFrom: [
        { agentId: 'agent_vision_phenotyping', dataFields: ['*'] },
        { agentId: 'agent_pathology', dataFields: ['*'] },
        { agentId: 'agent_kinetic_twin', dataFields: ['*'] },
        { agentId: 'agent_rules_engine', dataFields: ['*'] },
        { agentId: 'agent_demand_forecast', dataFields: ['*'] },
        { agentId: 'agent_routing_optimizer', dataFields: ['*'] },
        { agentId: 'agent_pricing_optimizer', dataFields: ['*'] },
        { agentId: 'agent_root_cause', dataFields: ['*'] },
        { agentId: 'agent_learning_agent', dataFields: ['*'] }
      ],
      providesTo: []
    },
    failureModes: [
      {
        condition: 'Perception agent timeout or corrupt image',
        symptom: 'Agent 1 or 2 fails to return segmentation within 1200ms.',
        autonomousMitigation: 'Invoke deterministic image fallback pipeline using crop hint and standard preset parameters.',
        fallbackState: 'Fallback inspection report with flagged status and manual review badge.'
      }
    ]
  }
];
