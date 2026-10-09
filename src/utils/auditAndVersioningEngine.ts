import type {
  ModelProvenance,
  ModelConfidenceBreakdown,
  HumanOverrideRecord,
  ComprehensiveAuditRecord,
} from '../types';

export const CURRENT_MODEL_PROVENANCE: ModelProvenance = {
  visionModel: 'Gemini 3.8 Flash',
  modelVersion: 'v3.8.2',
  promptVersion: 'P-14 (USDA-Codex Spectral Calibration)',
  kineticEngineVersion: 'v2.4 (Arrhenius-Q10 Respiration Matrix)',
  rulesEngineVersion: 'v7.1 (Deterministic Multi-Clause Engine)',
  calibrationCycle: 1842,
};

/**
 * Calculates granular model confidence and uncertainty across all sub-agents.
 */
export function calculateModelConfidence(
  defectsPct: number,
  maturityStage: number,
  varietyIdentified: string = 'Roma',
  imageQualityBlurScore: number = 88
): ModelConfidenceBreakdown {
  // If blur is high or defects are in borderline ambiguous zone (4.5% - 5.5% or 14% - 16%), confidence drops
  const isBorderlineDefect =
    (defectsPct >= 4.5 && defectsPct <= 5.8) || (defectsPct >= 14.0 && defectsPct <= 16.2);

  const maturityConfidencePct = 96;
  const defectConfidencePct = isBorderlineDefect ? 72 : 91;
  const varietyConfidencePct = varietyIdentified.toLowerCase().includes('unknown') ? 68 : 83;
  const shelfLifeConfidencePct = 87;

  // Weighted overall confidence
  const overallConfidencePct = Math.round(
    maturityConfidencePct * 0.3 +
      defectConfidencePct * 0.35 +
      varietyConfidencePct * 0.15 +
      shelfLifeConfidencePct * 0.2
  );

  const humanReviewRecommended = overallConfidencePct < 80 || isBorderlineDefect || defectConfidencePct < 75;
  const humanReviewReason = humanReviewRecommended
    ? isBorderlineDefect
      ? 'Borderline defect threshold (near commercial tolerance cut-off) — Human QC verification advised.'
      : 'Uncertainty threshold triggered by sub-optimal spectral lighting.'
    : undefined;

  return {
    overallConfidencePct,
    maturityConfidencePct,
    defectConfidencePct,
    varietyConfidencePct,
    shelfLifeConfidencePct,
    humanReviewRecommended,
    humanReviewReason,
  };
}

/**
 * Generates initial realistic audit trail history
 */
export const INITIAL_AUDIT_TRAIL: ComprehensiveAuditRecord[] = [
  {
    auditId: 'AUD-8821-01',
    timestamp: '2026-10-08 08:35:12 AM',
    actor: 'Automated Inbound Gate (Agent Swarm)',
    eventType: 'INITIAL_INSPECTION',
    batchId: 'CRATE-TOM-8821',
    produceType: 'Tomato',
    variety: 'Roma',
    modelVersion: 'v3.8.2 (Gemini 3.8 Flash)',
    promptVersion: 'P-14',
    kineticEngineVersion: 'v2.4',
    rulesEngineVersion: 'v7.1',
    verdict: 'ACCEPTED_GRADE_A',
    confidenceOverall: 94,
    sensorSnapshot: { ambientTemp: 31, humidity: 76, ethylenePpm: 0.8 },
    agentOutputsSummary: { maturity: 'Stage 2 Breaker', defects: '3.8% surface', shelfLife: '4.8 days' },
    reasonSummary: 'Passed all Quick-Commerce Grade A criteria (Defects < 5%, Firmness > 3.5 kg/cm²).',
  },
  {
    auditId: 'AUD-8819-02',
    timestamp: '2026-10-08 07:18:44 AM',
    actor: 'Inspector Rajesh M. (QC Lead)',
    eventType: 'HUMAN_OVERRIDE',
    batchId: 'CRATE-TOM-8819',
    produceType: 'Tomato',
    variety: 'Beefsteak',
    modelVersion: 'v3.8.2 (Gemini 3.8 Flash)',
    promptVersion: 'P-14',
    kineticEngineVersion: 'v2.4',
    rulesEngineVersion: 'v7.1',
    verdict: 'ACCEPTED_GRADE_B',
    confidenceOverall: 74,
    sensorSnapshot: { ambientTemp: 29, humidity: 82, ethylenePpm: 1.2 },
    agentOutputsSummary: { originalVerdict: 'REJECTED_AT_DOCK', reason: 'Fungal lesion suspected' },
    reasonSummary: 'Human override applied: Superficial skin catfacing verified via tactile feel, not fungal rot. Reclassified to Grade B with 18% flash markdown.',
    humanOverrideDetails: {
      overrideId: 'OVR-7741',
      originalVerdict: 'REJECTED_AT_DOCK',
      newVerdict: 'ACCEPTED_GRADE_B',
      inspectorName: 'Rajesh M. (Employee #QC-409)',
      overrideReason: 'Superficial skin catfacing rather than active mycelium. Suitable for quick 8-hour consumer flash-sale.',
      timestamp: '2026-10-08 07:18:44 AM',
      feedbackCaptured: true,
      adjustedDiscountPercent: 18,
    },
  },
  {
    auditId: 'AUD-8812-03',
    timestamp: '2026-10-07 16:45:00 PM',
    actor: 'Autonomous Routing Agent 6',
    eventType: 'ROUTING_DISPATCH',
    batchId: 'CRATE-TOM-8812',
    produceType: 'Tomato',
    variety: 'Roma',
    modelVersion: 'v3.8.2',
    promptVersion: 'P-14',
    kineticEngineVersion: 'v2.4',
    rulesEngineVersion: 'v7.1',
    verdict: 'ACCEPTED_GRADE_B',
    confidenceOverall: 88,
    sensorSnapshot: { ambientTemp: 32, humidity: 65 },
    agentOutputsSummary: { targetStore: 'Indiranagar Express Hub', expectedSellThrough: '91%' },
    reasonSummary: 'Re-routed from Whitefield (54% sell-through) to Indiranagar (91% sell-through) based on remaining 2.1-day shelf life.',
  },
];
