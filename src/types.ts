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
  };

  // Dual Mode Domain Decisions
  harvest_guidance?: HarvestAction;
  inbound_action?: InboundAction;

  // Multi-Agent Execution Telemetry
  agent_traces: AgentTraceStep[];
  overall_summary: string;
}

export interface InspectionRequest {
  image_b64: string;
  mode: InspectionMode;
  crop_type_hint?: string;
  ambient_temp_celsius?: number;
  transit_hours_to_hub?: number;
  transit_distance_km?: number;
  storage_method?: 'AMBIENT_LORRY' | 'CHILLED_REEFER';
  batch_id?: string;
  supplier_name?: string;
}

export type AgentFocusType = 'swarm' | 'agent_1' | 'agent_2' | 'agent_3' | 'agent_4';

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
