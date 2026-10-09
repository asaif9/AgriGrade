export type InspectionMode = 'FIELD_PRE_HARVEST' | 'DARK_STORE_INBOUND';

export type USDAMaturityStage = 1 | 2 | 3 | 4 | 5 | 6;

export interface DefectDetail {
  id: string;
  defect_type: string; // e.g. "Mechanical Compression Bruise", "Blossom End Rot", "Sunscald", "Skin Rupture / Catfacing", "Fungal Sporulation"
  surface_area_percentage: number; // e.g. 4.8%
  severity: 'NEGLIGIBLE' | 'COMMERCIAL_ACCEPTABLE' | 'CRITICAL';
  boundingBox?: {
    x: number; // 0-100 percentage
    y: number;
    width: number;
    height: number;
  };
  description: string;
}

export interface HarvestAction {
  should_harvest_today: boolean;
  optimal_harvest_window: string; // e.g. "Within 12-18 hours (early morning pick)"
  target_channel: string; // e.g. "Quick-Commerce Dark Store Hub (will reach Stage 3-4 upon arrival)"
  transit_viability_score: number; // 0 - 100
  harvest_risk_assessment: string;
  field_action_steps: string[];
}

export interface InboundAction {
  verdict: 'ACCEPTED_GRADE_A' | 'ACCEPTED_GRADE_B' | 'REJECTED_AT_DOCK';
  quality_score: number; // 0 - 100
  fast_track_dispatch_required: boolean;
  dispatch_window_hours?: number; // e.g. 8
  recommended_dynamic_discount_percent: number; // e.g. 0%, 15%, 25%
  erp_routing_tag: string; // e.g. "FAST_DISPATCH_SHELF_2", "PREMIUM_RETAIL_BIN", "RETURN_TO_VENDOR"
  disposition_notes: string;
  compliance_check_passed: boolean;
}

export interface AgentTraceStep {
  agent_name: string;
  role: string;
  status: 'pending' | 'processing' | 'completed' | 'flagged';
  latency_ms: number;
  summary: string;
  findings: Record<string, any>;
}

// Model Confidence & Uncertainty Breakdown
export interface ModelConfidenceBreakdown {
  overallConfidencePct: number; // e.g. 94%
  maturityConfidencePct: number; // e.g. 96%
  defectConfidencePct: number; // e.g. 91%
  varietyConfidencePct: number; // e.g. 83%
  shelfLifeConfidencePct: number; // e.g. 87%
  humanReviewRecommended: boolean;
  humanReviewReason?: string;
}

// Human-in-the-Loop (HITL) Override Data
export interface HumanOverrideRecord {
  overrideId: string;
  originalVerdict: string;
  newVerdict: 'ACCEPTED_GRADE_A' | 'ACCEPTED_GRADE_B' | 'REJECTED_AT_DOCK';
  inspectorName: string;
  overrideReason: string;
  timestamp: string;
  feedbackCaptured: boolean;
  adjustedDiscountPercent?: number;
}

// Model & Prompt Version Provenance
export interface ModelProvenance {
  visionModel: string; // e.g. "Gemini 3.8 Flash"
  modelVersion: string; // e.g. "v3.8.2"
  promptVersion: string; // e.g. "P-14"
  kineticEngineVersion: string; // e.g. "v2.4"
  rulesEngineVersion: string; // e.g. "v7.1"
  calibrationCycle: number; // e.g. 1842
}

// Demand Forecasting & Waste Prevention
export interface DemandForecastResult {
  currentInventoryKg: number; // e.g. 400 kg
  remainingShelfLifeDays: number; // e.g. 2.3 days
  storeSalesVelocityKgDay: number; // e.g. 80 kg/day
  expectedSellThroughKg: number; // e.g. 184 kg
  expectedUnsoldKg: number; // e.g. 216 kg
  wasteProbabilityPct: number; // e.g. 61%
  recommendation: 'TRANSFER_INVENTORY' | 'FLASH_MARKDOWN' | 'NORMAL_DISPATCH' | 'DIVERT_TO_PROCESSING';
  recommendedTransferKg: number; // e.g. 150 kg
  recommendedTargetStore: string; // e.g. "Store B (Indiranagar Hub)"
  rationale: string;
}

// Intelligent Routing Option
export interface StoreRoutingOption {
  storeId: string;
  storeName: string;
  distanceKm: number;
  transitMinutes: number;
  storeCapacityKg: number;
  currentDemandVelocityKgDay: number;
  expectedSellThroughPct: number; // e.g. 82%, 54%, 91%
  wasteRiskPct: number;
  netRealizedRevenueInr: number;
  recommendationScore: number; // 0 - 100
  isOptimal: boolean;
}

// Intelligent Routing Destination Decision
export interface IntelligentRoutingResult {
  batchId: string;
  commodity: string;
  quantityKg: number;
  shelfLifeDays: number;
  evaluatedStores: StoreRoutingOption[];
  selectedStore: StoreRoutingOption;
  routingRationale: string;
  dispatchUrgencyHours: number;
}

// Dynamic Markdown Optimization
export interface DynamicMarkdownOptimization {
  basePricePerKg: number; // e.g. ₹40
  recommendedMarkdownPct: number; // e.g. 18%
  finalPricePerKg: number; // e.g. ₹32.8
  factors: {
    shelfLifeHours: number;
    inventoryPressureScore: number;
    demandVelocityScore: number;
    competitorPricePerKg: number;
    timeOfDayFactor: number;
    dayOfWeekFactor: number;
    expectedWastageRiskPct: number;
    gradeMultiplier: number;
  };
  optimizationExplanation: string;
  projectedRevenueGainInr: number;
}

// Deep Supplier Scorecard
export interface DeepSupplierScorecard {
  supplierId: string;
  supplierName: string;
  clusterRegion: string;
  overallScore: number; // e.g. 86 / 100
  qualityScore: number; // e.g. 92
  consistencyScore: number; // e.g. 87
  coldChainScore: number; // e.g. 74
  gradeAYieldPct: number; // e.g. 81%
  rejectionRatePct: number; // e.g. 6%
  shelfLifeAccuracyPct: number; // e.g. 89%
  damageRatePct: number; // e.g. 4%
  onTimeDeliveryPct: number; // e.g. 94%
  topRootCause: string; // e.g. "Temperature excursions during transit (+2.4°C above SLA for 3.2 hrs)"
  historicalBatchesCount: number;
  predictiveRiskTier: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  predictiveRejectionProbPct: number; // e.g. 37%
  autonomousProcurementRecommendation?: {
    alternativeSupplier: string;
    priceDifferencePct: number; // e.g. +8%
    wasteReductionPct: number; // e.g. -14%
    projectedMonthlySavingsInr: number; // e.g. ₹180,000
    recommendationText: string;
  };
}

// Image Quality Validation Gate
export interface ImageQualityGateResult {
  passed: boolean;
  blurScore: number; // 0 - 100 (min 70)
  lightingLuxScore: number; // 0 - 100 (min 60)
  occlusionScore: number; // 0 - 100 (% visible)
  cameraAngleScore: number; // 0 - 100
  resolutionDetected: string; // "1920x1080 (1080p)"
  produceVisibilityPct: number; // 92%
  issues: string[];
  guidanceText: string;
}

// Computer Vision Segmentation & 360 Multi-Image Fusion
export interface MultiAngleInspection {
  angles: {
    top?: string;
    front?: string;
    left?: string;
    right?: string;
    bottom?: string;
  };
  compositeScore: number;
  surfaceScannedPct: number;
  totalDefectAreaCm2: number;
  totalVisibleSurfaceCm2: number;
  defectPercentageCalculated: number;
}

// Weather Harvest Intelligence
export interface WeatherHarvestIntelligence {
  ambientForecastTempC: number;
  relativeHumidityPct: number;
  rainfallProbabilityPct: number;
  heatwaveActive: boolean;
  coldWaveActive: boolean;
  harvestAdvisory: string;
  deteriorationRiskIncreasePct: number;
}

// Packaging Intelligence
export interface PackagingIntelligence {
  currentPackaging: string;
  comparison: Array<{
    type: string;
    expectedShelfLifeDays: number;
    bruiseRiskPct: number;
    costPerCrateInr: number;
    recommended: boolean;
  }>;
  recommendation: string;
}

// Autonomous Root Cause Analysis
export interface AutonomousRootCauseAnalysis {
  primaryCause: string;
  secondaryCause: string;
  supplierCorrelation: string;
  preventativeAction: string;
}

// Mobile Field Harvest Recommendation
export interface MobileFieldHarvestAdvisory {
  scanStatus: 'HARVEST_TODAY' | 'DELAY_HARVEST' | 'EXPEDITE_LOCAL';
  targetDestination: string;
  recommendedTransport: 'REFERRED_REEFER' | 'VENTILATED_LORRY' | 'CRATE_CANOPY';
  maximumTransitHours: number;
  fieldActionChecklist: string[];
}

// Operational Broadcast Alert (WhatsApp & Dispatch)
export interface OperationalAlert {
  id: string;
  timestamp: string;
  type: 'COLD_CHAIN_BREACH' | 'EXPIRY_WARNING' | 'SUPPLIER_RISK' | 'DISPATCH_READY';
  severity: 'CRITICAL' | 'WARNING' | 'INFO' | 'SUCCESS';
  title: string;
  message: string;
  batchId?: string;
  storeId?: string;
  actionLabel?: string;
  resolved?: boolean;
}

// Comprehensive Audit Record
export interface ComprehensiveAuditRecord {
  auditId: string;
  timestamp: string;
  actor: string;
  eventType: 'INITIAL_INSPECTION' | 'HUMAN_OVERRIDE' | 'ROUTING_DISPATCH' | 'PRICE_MARKDOWN' | 'ERP_COMMIT';
  batchId: string;
  produceType: string;
  variety: string;
  modelVersion: string;
  promptVersion: string;
  kineticEngineVersion: string;
  rulesEngineVersion: string;
  verdict: string;
  confidenceOverall: number;
  sensorSnapshot: Record<string, any>;
  agentOutputsSummary: Record<string, any>;
  reasonSummary: string;
  humanOverrideDetails?: HumanOverrideRecord;
}

// Next-Generation Multi-Factor Ingestion Contexts
export interface ColdChainTelemetry {
  targetTempCelsius: number; // e.g. 8.0°C
  actualAvgTempCelsius: number; // e.g. 10.4°C
  maxTempCelsius: number; // e.g. 16.8°C
  minTempCelsius: number; // e.g. 6.2°C
  thresholdTempCelsius: number; // e.g. 10.0°C
  timeAboveThresholdMinutes: number; // e.g. 137 minutes
  timeAboveThresholdFormatted: string; // e.g. "2h 17m"
  thermalExposureScore: number; // e.g. 14.6 °C·h (accumulated degree-hours)
  coldChainScore: number; // e.g. 87 (out of 100)
  shelfLifeLossDays: number; // e.g. -1.4 days (kinetic deduction)
  
  // 6 Integrated Telemetry Streams:
  temperatureSensors: {
    ambientProbeTemp: number; // °C
    cargoCoreSimTemp: number; // °C (fruit pulp internal temperature)
    supplyAirTemp: number; // °C
    returnAirTemp: number; // °C
    probeCalibrationDate: string;
    sensorHealthStatus: 'HEALTHY' | 'DRIFT_DETECTED' | 'DISCONNECTED';
  };
  humiditySensors: {
    relativeHumidityPct: number; // e.g. 84%
    vaporPressureDeficitKpa: number; // e.g. 0.42 kPa
    dewPointCelsius: number; // e.g. 7.1°C
    condensationRisk: boolean;
  };
  gpsTelematics: {
    currentLat: number;
    currentLng: number;
    originName: string;
    destinationName: string;
    totalDistanceKm: number;
    distanceCoveredKm: number;
    currentSpeedKmH: number;
    routeStopsCount: number;
    transitDurationHours: number;
    waypoints: Array<{
      name: string;
      time: string;
      lat: number;
      lng: number;
      tempC: number;
      status: 'NORMAL' | 'EXCURSION' | 'DOOR_OPEN' | 'STOP';
    }>;
  };
  reeferTelemetry: {
    reeferUnitModel: string;
    compressorStatus: 'RUNNING' | 'CYCLING' | 'DEFROST' | 'STANDBY' | 'FAULT' | 'OFF';
    setPointCelsius: number;
    returnAirTemp: number;
    supplyAirTemp: number;
    doorOpenEventsCount: number;
    totalDoorOpenMinutes: number;
    batteryVoltage: number;
    fuelLevelPct: number;
    activeAlarms: string[];
  };
  bluetoothDataLoggers: {
    deviceModel: string;
    macAddress: string;
    batteryPct: number;
    rssi: number;
    loggedSamplePointsCount: number;
    loggingIntervalMinutes: number;
    lastSyncTimestamp: string;
    syncStatus: 'SYNCED' | 'SYNCING' | 'SEARCHING' | 'OFFLINE';
    nistTraceable: boolean;
  };
  vehicleTelematics: {
    vehicleRegistration: string;
    ignitionState: 'ON' | 'ACC' | 'OFF';
    engineRpm: number;
    idlingTimeMinutes: number;
    roadShockPeakG: number;
    harshBrakingEvents: number;
    telematicsProvider: string;
  };

  // Time-Series for Dynamic Graphs & Excursion Highlighting
  timeSeries: Array<{
    minute: number;
    timestamp: string;
    temp: number;
    targetTemp: number;
    thresholdTemp: number;
    humidity: number;
    isExcursion: boolean;
    doorOpen?: boolean;
    compressorState?: string;
    location?: string;
  }>;
}

export interface SensorTelemetry {
  transit_logger_temp?: number; // °C logger
  humidity_pct?: number; // e.g. 82%
  ethylene_ppm?: number; // e.g. 1.8 ppm
  vibration_g_force?: number; // e.g. 2.1 G peak shock
  temp_spike_detected?: boolean;
  temp_spike_duration_hours?: number;
  cold_chain?: ColdChainTelemetry;
}

export interface WeatherContext {
  harvest_ambient_temp: number; // °C
  heatwave_warning: boolean;
  precipitation_at_harvest: boolean;
  humidity_relative_pct: number;
  solar_radiation_index: 'MODERATE' | 'HIGH' | 'EXTREME';
}

export interface LogisticsContext {
  transit_hours_to_hub: number;
  transit_distance_km: number;
  storage_method: 'AMBIENT_LORRY' | 'CHILLED_REEFER';
  reefer_temperature_hold?: number;
  road_condition: 'SMOOTH_HIGHWAY' | 'MODERATE_RURAL' | 'ROUGH_UNPAVED';
  transit_delay_hours: number;
  carrier_sla_rating: number; // 0 - 100
}

export interface DemandAndInventoryContext {
  dark_store_inventory_crates: number;
  shelf_turnover_hours: number;
  current_hourly_demand_rate: number;
  active_discount_promos: boolean;
  competing_batch_expiry_hours: number;
  demand_surge_factor: number;
}

export interface SupplierReliabilityProfile {
  supplier_name: string;
  tier: 'TIER_1_PREFERRED' | 'TIER_2_STANDARD' | 'TIER_3_REVIEW';
  historical_rejection_rate_pct: number;
  cold_chain_compliance_pct: number;
  grade_a_yield_pct: number;
  variance_std_dev: number;
  total_lifetime_batches: number;
}

export type LifecycleStageName = 
  | 'INSPECTION' 
  | 'DECISION' 
  | 'LOGISTICS' 
  | 'STORAGE' 
  | 'SALE' 
  | 'WASTE' 
  | 'ACTUAL_OUTCOME';

export interface BatchLifecycleStage {
  stage: LifecycleStageName;
  label: string;
  status: 'completed' | 'in_progress' | 'pending' | 'flagged';
  timestamp?: string;
  details: Record<string, any>;
  keyMetric?: { label: string; value: string; status?: 'good' | 'warning' | 'bad' };
}

export interface ActualOutcomeRecord {
  id: string;
  batchId: string;
  supplierName: string;
  crop: string;
  predictedVerdict: string;
  predictedQualityScore: number;
  predictedAmbientShelfLifeDays: number;
  predictedWastePct: number;
  
  // Actual logged outcomes:
  actualArrivalTemp: number;
  actualStorageHours: number;
  actualSellThroughHours: number;
  actualSellThroughPct: number; // e.g. 93%
  actualWastePct: number; // e.g. 7%
  actualCustomerComplaintCount: number;
  actualCustomerRefundPct: number;
  actualMarginRealized: number; // e.g. 22.4%
  actualDaysToDegradation: number; // e.g. 3.2 days
  
  // Feedback loop analytics:
  predictionErrorDays: number; // actual - predicted
  wastePredictionDeltaPct: number;
  learningTriggered: boolean;
  parameterAdjustments: {
    q10_respiration_delta: number;
    supplier_trust_adjustment: number;
    pricing_elasticity_shift: number;
    decay_rate_correction: number;
  };
  feedbackNotes: string;
  closedAt: string;
  stages: BatchLifecycleStage[];
}

export interface ModelImprovementMetrics {
  totalBatchesLearned: number;
  baselineAccuracyPct: number; // Image-only baseline (~71.4%)
  currentClosedLoopAccuracyPct: number; // Next-gen multi-factor feedback loop (~94.8%)
  wasteReductionPct: number; // -34.8%
  customerRefundReductionPct: number; // -46.2%
  meanAbsoluteErrorDays: number; // 0.28 days
  q10ConvergencePct: number; // 96%
  calibrationHistory: Array<{
    batchCycle: number;
    date: string;
    accuracy: number;
    wastePct: number;
    maeDays: number;
  }>;
  learnedWeights: {
    opticalWeight: number; // e.g. 32%
    sensorWeight: number; // e.g. 24%
    supplierHistoryWeight: number; // e.g. 18%
    weatherLogisticsWeight: number; // e.g. 14%
    demandInventoryWeight: number; // e.g. 12%
  };
}

export interface AuditScanRecord {
  id: string;
  timestamp: string; // ISO string
  displayTime: string; // e.g. "11:51:24 AM"
  batchId: string;
  supplierName: string;
  mode: InspectionMode;
  produceType: string;
  varietyDetected?: string;
  thumbnailUrl?: string;
  finalDecision: {
    verdict: 'ACCEPTED_GRADE_A' | 'ACCEPTED_GRADE_B' | 'REJECTED_AT_DOCK' | 'HARVEST_RECOMMENDED' | 'DELAY_HARVEST';
    label: string;
    summary: string;
    color: 'emerald' | 'amber' | 'rose' | 'cyan';
  };
  qualityScore?: number;
  report: AgriGradeReport;
}

export interface AgriGradeReport {
  id: string;
  timestamp: string;
  mode: InspectionMode;
  produce_type: string; // "Tomato", "Apple", "Banana", "Bell Pepper", "Grains"
  variety_detected: string; // e.g. "Roma", "Beefsteak", "Gala", "Cavendish"
  confidence: number; // 0 - 1
  
  // Optical & Color Maturity
  usda_color_stage: USDAMaturityStage;
  stage_name: string; // "Stage 1 (Green)", "Stage 2 (Breaker)", etc.
  ripeness_percentage: number; // 0 - 100%
  color_breakdown: {
    green_pct: number;
    yellow_pct: number;
    pink_orange_pct: number;
    deep_red_pct: number;
  };

  // Defect & Bruise Index
  bruise_defect_index: number; // 0.0 (pristine) to 100.0 (severely spoiled)
  defects: DefectDetail[];
  firmness_estimate_penetrometer: number; // e.g., 4.2 kg/cm²

  // Kinetic Shelf-Life Decay Engine
  ambient_shelf_life_days: number; // at ambient temp (e.g., 26-30°C)
  cold_storage_shelf_life_days: number; // at 8-12°C
  kinetic_parameters: {
    base_shelf_life_days: number;
    q10_respiration_factor: number;
    ambient_temp_used: number;
    ref_temp_used: number;
    bruise_penalty_applied: number;
    daily_decay_rate_pct: number;
    calibrated_q10_with_feedback?: number;
    cold_chain_shelf_life_loss_days?: number; // e.g. -1.4 days
    cold_chain_score?: number; // e.g. 87/100
    thermal_exposure_score?: number; // e.g. 14.6 °C·h
  };

  // Dynamic Commodity Identification Agent & Database Prediction
  commodity_database_result?: {
    commodity_name: string;
    variety_name: string;
    farm_name: string;
    harvest_maturity_stage: number;
    temperature_celsius: number;
    humidity_pct: number;
    packaging_type: string;
    storage_method: string;
    predicted_shelf_life_days: number;
    confidence_score_pct: number;
    legacy_static_days: number;
    variance_from_legacy_days: number;
    cohort_batches_sampled: number;
    cohort_std_dev: number;
    calculation_summary: string;
  };

  // Multi-Factor Ingestion Contexts Synthesized
  sensor_telemetry?: SensorTelemetry;
  cold_chain_telemetry?: ColdChainTelemetry;
  weather_context?: WeatherContext;
  logistics_context?: LogisticsContext;
  demand_inventory_context?: DemandAndInventoryContext;
  supplier_profile?: SupplierReliabilityProfile;

  // Closed-Loop Outcome Feedback Signals
  feedback_loop_calibration?: {
    cohort_batches_analyzed: number;
    historical_model_accuracy_pct: number;
    learned_decay_offset_days: number;
    supplier_trust_multiplier: number;
    demand_elasticity_markdown_bias_pct: number;
    confidence_interval_hours: [number, number];
  };

  // Dual Mode Domain Decisions
  harvest_guidance?: HarvestAction;
  inbound_action?: InboundAction;

  // Dynamic Commercial Grade Engine Evaluation (Configurable Customer Tolerances)
  commercial_grade_evaluation?: {
    ruleId: string;
    ruleName: string;
    customer: string;
    commodity: string;
    market: string;
    verdict: 'ACCEPTED_GRADE_A' | 'ACCEPTED_GRADE_B' | 'REJECTED_AT_DOCK';
    qualityScore: number;
    recommendedDiscountPercent: number;
    fastTrackDispatchRequired: boolean;
    dispatchWindowHours: number;
    erpRoutingTag: string;
    dispositionNotes: string;
    gradeAEvaluation: {
      tier: 'GRADE_A' | 'GRADE_B';
      passed: boolean;
      clauses: Array<{
        parameter: string;
        label: string;
        ruleExpression: string;
        measuredValue: any;
        passed: boolean;
        explanation: string;
      }>;
      unmetClauses: Array<{
        parameter: string;
        label: string;
        ruleExpression: string;
        measuredValue: any;
        passed: boolean;
        explanation: string;
      }>;
    };
    gradeBEvaluation: {
      tier: 'GRADE_A' | 'GRADE_B';
      passed: boolean;
      clauses: Array<{
        parameter: string;
        label: string;
        ruleExpression: string;
        measuredValue: any;
        passed: boolean;
        explanation: string;
      }>;
      unmetClauses: Array<{
        parameter: string;
        label: string;
        ruleExpression: string;
        measuredValue: any;
        passed: boolean;
        explanation: string;
      }>;
    };
    evaluatedClauses: Array<{
      parameter: string;
      label: string;
      ruleExpression: string;
      measuredValue: any;
      passed: boolean;
      explanation: string;
    }>;
    rejectionReasons: string[];
    appliedRuleJson: Record<string, any>;
  };
  active_commercial_rule?: Record<string, any>;

  // Enterprise Intelligence & Orchestration Additions
  confidence_breakdown?: ModelConfidenceBreakdown;
  model_provenance?: ModelProvenance;
  human_override?: HumanOverrideRecord;
  demand_forecast?: DemandForecastResult;
  intelligent_routing?: IntelligentRoutingResult;
  markdown_optimization?: DynamicMarkdownOptimization;
  deep_supplier_scorecard?: DeepSupplierScorecard;
  image_quality_gate?: ImageQualityGateResult;
  multi_angle_inspection?: MultiAngleInspection;
  weather_intelligence?: WeatherHarvestIntelligence;
  packaging_intelligence?: PackagingIntelligence;
  root_cause_analysis?: AutonomousRootCauseAnalysis;
  mobile_field_advisory?: MobileFieldHarvestAdvisory;

  // Multi-Agent Execution Telemetry
  agent_traces: AgentTraceStep[];
  overall_summary: string;
}

export interface InspectionRequest {
  image_b64: string;
  mode: InspectionMode;
  crop_type_hint?: string;
  variety_hint?: string;
  ambient_temp_celsius?: number;
  transit_hours_to_hub?: number;
  transit_distance_km?: number;
  storage_method?: 'AMBIENT_LORRY' | 'CHILLED_REEFER';
  packaging_type?: string;
  humidity_pct?: number;
  batch_id?: string;
  supplier_name?: string;
  farm_name?: string;
  
  // Dynamic Commercial Grade Engine rule selection:
  customer_rule_id?: string;
  custom_commercial_rule?: Record<string, any>;
  
  // Next-generation multi-factor inputs:
  sensor_telemetry?: SensorTelemetry;
  cold_chain_telemetry?: ColdChainTelemetry;
  weather_context?: WeatherContext;
  logistics_context?: LogisticsContext;
  demand_inventory_context?: DemandAndInventoryContext;
}

export type AgentFocusType = 'swarm' | 'agent_1' | 'agent_2' | 'agent_3' | 'agent_4' | 'agent_5';

export interface ChatMetricItem {
  label: string;
  value: string;
  category: 'maturity' | 'defect' | 'shelf_life' | 'commercial';
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  agentBadge?: {
    name: string;
    role: string;
    color: 'emerald' | 'amber' | 'rose' | 'cyan' | 'purple';
  };
  metricsCited?: ChatMetricItem[];
}

// ==========================================
// Dynamic Real-time Shelf-Life Digital Twin Types
// ==========================================
export type DigitalTwinRiskLevel = 'LOW' | 'MEDIUM' | 'ELEVATED' | 'HIGH';
export type DigitalTwinRiskSymbol = '🟢' | '🟡' | '🟠' | '🔴';

export interface DigitalTwinRiskItem {
  level: DigitalTwinRiskLevel;
  symbol: DigitalTwinRiskSymbol;
  label: string;
  detail: string;
  score: number; // 0 - 100
}

export interface DigitalTwinRisks {
  temperatureRisk: DigitalTwinRiskItem;
  bruiseRisk: DigitalTwinRiskItem;
  fungalRisk: DigitalTwinRiskItem;
  coldChainRisk: DigitalTwinRiskItem;
  demandRisk: DigitalTwinRiskItem;
}

export type DigitalTwinStorageMode =
  | 'CHILLED_REEFER'
  | 'AMBIENT_LORRY'
  | 'PRECOOLED_DOCK'
  | 'CONTROLLED_ATMOSPHERE'
  | 'DARK_STORE_RACK';

export type DigitalTwinPackagingType =
  | 'VENTILATED_PLASTIC_CRATE'
  | 'CORRUGATED_BOX'
  | 'MAP_FILM'
  | 'OPEN_WOODEN_CRATE';

export interface DigitalTwinFactors {
  temperature: number; // °C
  humidity: number; // %
  maturityStage: USDAMaturityStage; // 1 - 6
  maturityPct: number; // 0 - 100%
  defectsPct: number; // 0 - 100%
  handlingGForce: number; // e.g. 0.8 - 3.2 G
  transitHours: number; // e.g. 0 - 48
  storageMode: DigitalTwinStorageMode;
  packagingType: DigitalTwinPackagingType;
}

export interface DigitalTwinTelemetryStep {
  stepIndex: number;
  timeFormatted: string; // e.g. "09:00", "12:00", "15:00", "18:00"
  timestampIso: string;
  hoursElapsed: number;
  remainingShelfLifeDays: number;
  instantaneousBurnRate: number; // multiplier over nominal (e.g. 2.4x)
  eventNote: string;
  factors: DigitalTwinFactors;
  risks: DigitalTwinRisks;
}

export interface DigitalTwinCrateProfile {
  crateId: string; // e.g. "BATCH CRATE-4892"
  commodity: string; // e.g. "Roma Tomatoes"
  variety: string; // e.g. "Solanum lycopersicum 'Roma VF'"
  supplier: string; // e.g. "Saraswati Agritech Cluster #3"
  initialShelfLifeDays: number; // e.g. 4.8
  currentRemainingShelfLifeDays: number; // e.g. 3.8
  baselineStaticShelfLifeDays: number; // e.g. 4.2
  targetStore: string; // e.g. "Store #14"
  sellWithinHours: number; // e.g. 72
  recommendedAction: {
    primaryDispatch: string; // e.g. "Dispatch to Store #14"
    urgencyWindow: string; // e.g. "Sell within 72 hours"
    secondaryRouting?: string;
    actionType: 'OPTIMAL_RETAIL' | 'EXPEDITE_DISPATCH' | 'FLASH_MARKDOWN' | 'PULP_RECOVERY';
    confidencePct: number;
    economicImpact: string;
    rationale: string;
  };
  factors: DigitalTwinFactors;
  risks: DigitalTwinRisks;
  timeline: DigitalTwinTelemetryStep[];
}

