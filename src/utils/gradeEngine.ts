import type { USDAMaturityStage } from '../types';

export interface GradeClauseSpec {
  defect_percent?: string; // e.g. "<5", "<=5", "5-15", ">15"
  maturity?: number[]; // e.g. [4, 5] or [1, 2, 3]
  firmness?: string; // e.g. ">3.5", "2.5-3.5", "<2.0"
  min_shelf_life_days?: string; // e.g. ">3", ">=2"
  recommended_discount_percent?: number;
  fast_track_hours?: number;
  erp_routing_tag?: string;
}

export interface CommercialGradeRule {
  id: string;
  name: string; // e.g. "Zepto / Blinkit Quick-Commerce"
  customer: string; // e.g. "Zepto, Blinkit & Instacart"
  commodity: string; // e.g. "tomato", "apple", "banana", "bell_pepper"
  market: 'quick_commerce' | 'premium_supermarket' | 'food_service_processing' | 'export_cold_chain' | 'wholesale_mandi' | 'custom';
  description: string;
  grade_a: {
    defect_percent: string;
    maturity?: number[];
    firmness?: string;
    min_shelf_life_days?: string;
    erp_routing_tag?: string;
  };
  grade_b: {
    defect_percent: string;
    maturity?: number[];
    firmness?: string;
    min_shelf_life_days?: string;
    recommended_discount_percent?: number;
    fast_track_hours?: number;
    erp_routing_tag?: string;
  };
  reject_criteria?: {
    max_defect_percent?: string; // e.g. ">15"
    min_firmness?: string; // e.g. "<2.0"
    unacceptable_defects?: string[]; // e.g. ["Fungal Mold", "Deep Puncture", "Bacterial Soft Rot"]
    erp_routing_tag?: string;
  };
}

export interface ClauseCheckResult {
  parameter: 'defect_percent' | 'maturity' | 'firmness' | 'shelf_life' | 'defect_type';
  label: string;
  ruleExpression: string;
  measuredValue: number | string | number[];
  passed: boolean;
  explanation: string;
}

export interface GradeTierEvaluation {
  tier: 'GRADE_A' | 'GRADE_B';
  passed: boolean;
  clauses: ClauseCheckResult[];
  unmetClauses: ClauseCheckResult[];
}

export interface DynamicGradeEvaluationResult {
  ruleId: string;
  ruleName: string;
  customer: string;
  commodity: string;
  market: string;
  verdict: 'ACCEPTED_GRADE_A' | 'ACCEPTED_GRADE_B' | 'REJECTED_AT_DOCK';
  qualityScore: number; // 0 - 100
  recommendedDiscountPercent: number;
  fastTrackDispatchRequired: boolean;
  dispatchWindowHours: number;
  erpRoutingTag: string;
  dispositionNotes: string;
  gradeAEvaluation: GradeTierEvaluation;
  gradeBEvaluation: GradeTierEvaluation;
  evaluatedClauses: ClauseCheckResult[];
  rejectionReasons: string[];
  appliedRuleJson: Record<string, any>;
}

export interface EvaluationInputMetrics {
  commodity: string;
  defectPercent: number; // e.g. 7.5
  maturityStage: USDAMaturityStage; // 1 to 6
  firmnessKgCm2: number; // e.g. 3.8
  ambientShelfLifeDays: number; // e.g. 3.5
  detectedDefectTypes?: string[];
}

// Helper to evaluate string expressions like "<5", "<=5", ">3.5", ">=3.5", "5-15", "2.5-3.5"
export function evaluateNumericExpression(value: number, expression: string): { passed: boolean; cleanExpr: string } {
  if (!expression || typeof expression !== 'string') {
    return { passed: true, cleanExpr: 'Any' };
  }

  const expr = expression.trim();

  // Range pattern: "5-15" or "2.5-3.5"
  if (expr.includes('-') && !expr.startsWith('-')) {
    const parts = expr.split('-').map((p) => parseFloat(p.trim()));
    if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
      const [min, max] = parts;
      const passed = value >= min && value <= max;
      return { passed, cleanExpr: `${min} to ${max}` };
    }
  }

  // Less than or equal: "<=5"
  if (expr.startsWith('<=')) {
    const target = parseFloat(expr.slice(2).trim());
    return { passed: value <= target, cleanExpr: `≤ ${target}` };
  }

  // Less than: "<5"
  if (expr.startsWith('<')) {
    const target = parseFloat(expr.slice(1).trim());
    return { passed: value < target, cleanExpr: `< ${target}` };
  }

  // Greater than or equal: ">=3.5"
  if (expr.startsWith('>=')) {
    const target = parseFloat(expr.slice(2).trim());
    return { passed: value >= target, cleanExpr: `≥ ${target}` };
  }

  // Greater than: ">3.5"
  if (expr.startsWith('>')) {
    const target = parseFloat(expr.slice(1).trim());
    return { passed: value > target, cleanExpr: `> ${target}` };
  }

  // Exact number or fallback
  const exact = parseFloat(expr);
  if (!isNaN(exact)) {
    return { passed: Math.abs(value - exact) < 0.01, cleanExpr: `= ${exact}` };
  }

  return { passed: true, cleanExpr: expr };
}

// Built-in Commercial Rules Presets for Different Customers and Markets
export const DEFAULT_COMMERCIAL_RULES: CommercialGradeRule[] = [
  {
    id: 'rule-zepto-quick-commerce',
    name: 'Quick-Commerce Hyperlocal Dark Store',
    customer: 'Zepto / Blinkit / Instacart (10-Min Delivery)',
    commodity: 'tomato',
    market: 'quick_commerce',
    description: 'Calibrated for rapid shelf turnover (12-24h). Accepts moderate color and slight scuff for Grade B dynamic markdown.',
    grade_a: {
      defect_percent: '<5',
      maturity: [4, 5],
      firmness: '>3.5',
      min_shelf_life_days: '>3.0',
      erp_routing_tag: 'PREMIUM_RETAIL_BIN',
    },
    grade_b: {
      defect_percent: '5-15',
      maturity: [3, 4, 5, 6],
      firmness: '2.5-3.5',
      min_shelf_life_days: '>1.5',
      recommended_discount_percent: 15,
      fast_track_hours: 8,
      erp_routing_tag: 'FAST_DISPATCH_DISCOUNT_15',
    },
    reject_criteria: {
      max_defect_percent: '>15',
      min_firmness: '<2.2',
      unacceptable_defects: ['Fungal Mold', 'Bacterial Soft Rot', 'Deep Fruit Fly Puncture'],
      erp_routing_tag: 'RETURN_TO_VENDOR_REJECT',
    },
  },
  {
    id: 'rule-whole-foods-premium',
    name: 'Premium Organic Supermarket',
    customer: 'Whole Foods / Nature\'s Basket / Fresh & Del Monte',
    commodity: 'tomato',
    market: 'premium_supermarket',
    description: 'Zero cosmetic defect tolerance. Requires immaculate firmness and vibrant color for high-end shelf display.',
    grade_a: {
      defect_percent: '<3',
      maturity: [4, 5],
      firmness: '>4.0',
      min_shelf_life_days: '>4.0',
      erp_routing_tag: 'PREMIUM_ORGANIC_TIER1',
    },
    grade_b: {
      defect_percent: '3-8',
      maturity: [3, 4, 5],
      firmness: '3.2-4.0',
      min_shelf_life_days: '>2.5',
      recommended_discount_percent: 10,
      fast_track_hours: 12,
      erp_routing_tag: 'STANDARD_SUPERMARKET_DISPLAY',
    },
    reject_criteria: {
      max_defect_percent: '>8',
      min_firmness: '<3.0',
      unacceptable_defects: ['Fungal Mold', 'Compression Impact Bruise', 'Sunscald', 'Skin Rupture'],
      erp_routing_tag: 'RETURN_TO_VENDOR_PREMIUM_REJECT',
    },
  },
  {
    id: 'rule-heinz-food-processing',
    name: 'Food Service & Puree Processing',
    customer: 'Heinz, Kissan & Commercial Sauces',
    commodity: 'tomato',
    market: 'food_service_processing',
    description: 'High cosmetic defect tolerance. Seeks full lycopene red color (Stages 5-6) and accepts softer texture since produce is cooked/pureed.',
    grade_a: {
      defect_percent: '<12',
      maturity: [5, 6],
      firmness: '>2.2',
      min_shelf_life_days: '>1.0',
      erp_routing_tag: 'PROCESSING_PUREE_VAT_A',
    },
    grade_b: {
      defect_percent: '12-25',
      maturity: [4, 5, 6],
      firmness: '1.8-2.5',
      min_shelf_life_days: '>0.8',
      recommended_discount_percent: 25,
      fast_track_hours: 6,
      erp_routing_tag: 'INDUSTRIAL_PULP_RECOVERY',
    },
    reject_criteria: {
      max_defect_percent: '>25',
      min_firmness: '<1.5',
      unacceptable_defects: ['Fungal Sporulation', 'Black Mold Infestation'],
      erp_routing_tag: 'BIO_COMPOST_REJECT',
    },
  },
  {
    id: 'rule-export-cold-chain',
    name: 'Interstate & Long-Haul Export',
    customer: 'Global Cargo & APEDA Cold-Chain Freight',
    commodity: 'tomato',
    market: 'export_cold_chain',
    description: 'Harvested pre-ripe (Breaker/Turning) with maximum wall firmness (>4.5 kg/cm²) to withstand multi-day transit vibration without rupture.',
    grade_a: {
      defect_percent: '<4',
      maturity: [2, 3],
      firmness: '>4.5',
      min_shelf_life_days: '>6.0',
      erp_routing_tag: 'EXPORT_REEFER_CONTAINER',
    },
    grade_b: {
      defect_percent: '4-10',
      maturity: [1, 2, 3, 4],
      firmness: '3.8-4.5',
      min_shelf_life_days: '>4.0',
      recommended_discount_percent: 10,
      fast_track_hours: 24,
      erp_routing_tag: 'DOMESTIC_INTERSTATE_TRUCK',
    },
    reject_criteria: {
      max_defect_percent: '>10',
      min_firmness: '<3.5',
      unacceptable_defects: ['Cuticle Split', 'Mechanical Compression', 'Mold'],
      erp_routing_tag: 'EXPORT_DISQUALIFIED_REVERT',
    },
  },
  {
    id: 'rule-wholesale-mandi',
    name: 'Traditional Wholesale Mandi / Bulk Grocery',
    customer: 'Regional APMC Mandi & Neighborhood Kiranas',
    commodity: 'tomato',
    market: 'wholesale_mandi',
    description: 'Broad pragmatic commercial tolerance. Price-elastic bulk trading with high velocity clearing.',
    grade_a: {
      defect_percent: '<8',
      maturity: [3, 4, 5],
      firmness: '>3.0',
      min_shelf_life_days: '>2.5',
      erp_routing_tag: 'MANDI_GRADE_A_CRATE',
    },
    grade_b: {
      defect_percent: '8-20',
      maturity: [2, 3, 4, 5, 6],
      firmness: '2.0-3.0',
      min_shelf_life_days: '>1.2',
      recommended_discount_percent: 20,
      fast_track_hours: 10,
      erp_routing_tag: 'MANDI_BULK_DISCOUNT_LOT',
    },
    reject_criteria: {
      max_defect_percent: '>20',
      min_firmness: '<1.8',
      unacceptable_defects: ['Severe Rot', 'Crushed Pulp'],
      erp_routing_tag: 'MANDI_DOCK_REJECT',
    },
  },
];

// Core Evaluation Engine
export function evaluateCommercialRules(
  metrics: EvaluationInputMetrics,
  rule: CommercialGradeRule
): DynamicGradeEvaluationResult {
  const evaluatedClauses: ClauseCheckResult[] = [];
  const rejectionReasons: string[] = [];

  // Check prohibited defect types first
  const prohibited = rule.reject_criteria?.unacceptable_defects || [];
  if (metrics.detectedDefectTypes && metrics.detectedDefectTypes.length > 0 && prohibited.length > 0) {
    const violatingDefects = metrics.detectedDefectTypes.filter((d) =>
      prohibited.some((p) => d.toLowerCase().includes(p.toLowerCase()))
    );
    if (violatingDefects.length > 0) {
      const clause: ClauseCheckResult = {
        parameter: 'defect_type',
        label: 'Zero-Tolerance Defect Check',
        ruleExpression: `Prohibited: ${prohibited.join(', ')}`,
        measuredValue: violatingDefects.join(', '),
        passed: false,
        explanation: `Critical defect detected (${violatingDefects.join(', ')}), violating zero-tolerance policy.`,
      };
      evaluatedClauses.push(clause);
      rejectionReasons.push(`Zero-tolerance defect present: ${violatingDefects.join(', ')}`);
    }
  }

  // --- Grade A Clauses Evaluation ---
  const gradeAClauses: ClauseCheckResult[] = [];

  // 1. Defect Percent
  const aDefectCheck = evaluateNumericExpression(metrics.defectPercent, rule.grade_a.defect_percent);
  gradeAClauses.push({
    parameter: 'defect_percent',
    label: 'Grade A Defect Tolerance',
    ruleExpression: rule.grade_a.defect_percent,
    measuredValue: `${metrics.defectPercent.toFixed(1)}%`,
    passed: aDefectCheck.passed,
    explanation: aDefectCheck.passed
      ? `Measured ${metrics.defectPercent.toFixed(1)}% satisfies ${rule.grade_a.defect_percent}% threshold.`
      : `Measured ${metrics.defectPercent.toFixed(1)}% exceeds Grade A threshold (${rule.grade_a.defect_percent}%).`,
  });

  // 2. Maturity Stage
  if (rule.grade_a.maturity && rule.grade_a.maturity.length > 0) {
    const aMaturityPassed = rule.grade_a.maturity.includes(metrics.maturityStage);
    gradeAClauses.push({
      parameter: 'maturity',
      label: 'Grade A Maturity Stage',
      ruleExpression: `Stages [${rule.grade_a.maturity.join(', ')}]`,
      measuredValue: `Stage ${metrics.maturityStage}`,
      passed: aMaturityPassed,
      explanation: aMaturityPassed
        ? `Stage ${metrics.maturityStage} is within approved Grade A stages [${rule.grade_a.maturity.join(', ')}].`
        : `Stage ${metrics.maturityStage} is outside Grade A acceptable window [${rule.grade_a.maturity.join(', ')}].`,
    });
  }

  // 3. Firmness
  if (rule.grade_a.firmness) {
    const aFirmnessCheck = evaluateNumericExpression(metrics.firmnessKgCm2, rule.grade_a.firmness);
    gradeAClauses.push({
      parameter: 'firmness',
      label: 'Grade A Penetrometer Firmness',
      ruleExpression: `${rule.grade_a.firmness} kg/cm²`,
      measuredValue: `${metrics.firmnessKgCm2.toFixed(1)} kg/cm²`,
      passed: aFirmnessCheck.passed,
      explanation: aFirmnessCheck.passed
        ? `Firmness ${metrics.firmnessKgCm2.toFixed(1)} kg/cm² satisfies ${rule.grade_a.firmness}.`
        : `Firmness ${metrics.firmnessKgCm2.toFixed(1)} kg/cm² fails Grade A specification (${rule.grade_a.firmness}).`,
    });
  }

  // 4. Shelf Life
  if (rule.grade_a.min_shelf_life_days) {
    const aShelfCheck = evaluateNumericExpression(metrics.ambientShelfLifeDays, rule.grade_a.min_shelf_life_days);
    gradeAClauses.push({
      parameter: 'shelf_life',
      label: 'Grade A Minimum Shelf-Life',
      ruleExpression: `${rule.grade_a.min_shelf_life_days} days`,
      measuredValue: `${metrics.ambientShelfLifeDays.toFixed(1)} days`,
      passed: aShelfCheck.passed,
      explanation: aShelfCheck.passed
        ? `Shelf life ${metrics.ambientShelfLifeDays.toFixed(1)}d meets ${rule.grade_a.min_shelf_life_days}d.`
        : `Shelf life ${metrics.ambientShelfLifeDays.toFixed(1)}d is below Grade A requirement (${rule.grade_a.min_shelf_life_days}d).`,
    });
  }

  const gradeAPassed = gradeAClauses.every((c) => c.passed) && rejectionReasons.length === 0;

  // --- Grade B Clauses Evaluation ---
  const gradeBClauses: ClauseCheckResult[] = [];

  // 1. Defect Percent
  const bDefectCheck = evaluateNumericExpression(metrics.defectPercent, rule.grade_b.defect_percent);
  gradeBClauses.push({
    parameter: 'defect_percent',
    label: 'Grade B Defect Tolerance',
    ruleExpression: rule.grade_b.defect_percent,
    measuredValue: `${metrics.defectPercent.toFixed(1)}%`,
    passed: bDefectCheck.passed,
    explanation: bDefectCheck.passed
      ? `Measured ${metrics.defectPercent.toFixed(1)}% qualifies for Grade B (${rule.grade_b.defect_percent}%).`
      : `Measured ${metrics.defectPercent.toFixed(1)}% fails Grade B allowance (${rule.grade_b.defect_percent}%).`,
  });

  // 2. Maturity Stage
  if (rule.grade_b.maturity && rule.grade_b.maturity.length > 0) {
    const bMaturityPassed = rule.grade_b.maturity.includes(metrics.maturityStage);
    gradeBClauses.push({
      parameter: 'maturity',
      label: 'Grade B Maturity Stage',
      ruleExpression: `Stages [${rule.grade_b.maturity.join(', ')}]`,
      measuredValue: `Stage ${metrics.maturityStage}`,
      passed: bMaturityPassed,
      explanation: bMaturityPassed
        ? `Stage ${metrics.maturityStage} acceptable for Grade B fast-dispatch.`
        : `Stage ${metrics.maturityStage} fails Grade B window [${rule.grade_b.maturity.join(', ')}].`,
    });
  }

  // 3. Firmness
  if (rule.grade_b.firmness) {
    const bFirmnessCheck = evaluateNumericExpression(metrics.firmnessKgCm2, rule.grade_b.firmness);
    gradeBClauses.push({
      parameter: 'firmness',
      label: 'Grade B Penetrometer Firmness',
      ruleExpression: `${rule.grade_b.firmness} kg/cm²`,
      measuredValue: `${metrics.firmnessKgCm2.toFixed(1)} kg/cm²`,
      passed: bFirmnessCheck.passed,
      explanation: bFirmnessCheck.passed
        ? `Firmness ${metrics.firmnessKgCm2.toFixed(1)} kg/cm² meets Grade B allowance.`
        : `Firmness ${metrics.firmnessKgCm2.toFixed(1)} kg/cm² fails Grade B (${rule.grade_b.firmness}).`,
    });
  }

  // 4. Shelf Life
  if (rule.grade_b.min_shelf_life_days) {
    const bShelfCheck = evaluateNumericExpression(metrics.ambientShelfLifeDays, rule.grade_b.min_shelf_life_days);
    gradeBClauses.push({
      parameter: 'shelf_life',
      label: 'Grade B Minimum Shelf-Life',
      ruleExpression: `${rule.grade_b.min_shelf_life_days} days`,
      measuredValue: `${metrics.ambientShelfLifeDays.toFixed(1)} days`,
      passed: bShelfCheck.passed,
      explanation: bShelfCheck.passed
        ? `Remaining shelf-life ${metrics.ambientShelfLifeDays.toFixed(1)}d is sufficient for fast-track.`
        : `Remaining shelf-life ${metrics.ambientShelfLifeDays.toFixed(1)}d is insufficient (<${rule.grade_b.min_shelf_life_days}d).`,
    });
  }

  const gradeBPassed = gradeBClauses.every((c) => c.passed) && rejectionReasons.length === 0;

  // Compile final verdict
  let verdict: 'ACCEPTED_GRADE_A' | 'ACCEPTED_GRADE_B' | 'REJECTED_AT_DOCK';
  let score: number;
  let discount: number = 0;
  let fastTrack: boolean = false;
  let windowHours: number = 24;
  let routingTag: string = rule.grade_a.erp_routing_tag || 'PREMIUM_RETAIL_BIN';
  let notes: string = '';

  if (gradeAPassed) {
    verdict = 'ACCEPTED_GRADE_A';
    score = Math.min(98, Math.max(88, Math.round(100 - metrics.defectPercent * 1.5)));
    discount = 0;
    fastTrack = false;
    windowHours = 36;
    routingTag = rule.grade_a.erp_routing_tag || 'PREMIUM_RETAIL_BIN';
    notes = `Passed all commercial Grade A tolerances for ${rule.customer}. Firmness ${metrics.firmnessKgCm2.toFixed(1)} kg/cm² and defect index ${metrics.defectPercent.toFixed(1)}% meet premium standards.`;
  } else if (gradeBPassed) {
    verdict = 'ACCEPTED_GRADE_B';
    score = Math.min(84, Math.max(68, Math.round(85 - metrics.defectPercent * 0.8)));
    discount = rule.grade_b.recommended_discount_percent ?? 15;
    fastTrack = true;
    windowHours = rule.grade_b.fast_track_hours ?? 8;
    routingTag = rule.grade_b.erp_routing_tag || 'FAST_DISPATCH_DISCOUNT_15';
    const failingA = gradeAClauses.filter((c) => !c.passed).map((c) => c.label).join(', ');
    notes = `Fails Grade A (${failingA}), but meets Grade B commercial tolerances for ${rule.customer}. Automated ${discount}% markdown triggered for fast-track dispatch under ${windowHours} hours.`;
  } else {
    verdict = 'REJECTED_AT_DOCK';
    score = Math.min(50, Math.max(15, Math.round(55 - metrics.defectPercent * 1.2)));
    discount = 0;
    fastTrack = false;
    windowHours = 0;
    routingTag = rule.reject_criteria?.erp_routing_tag || 'RETURN_TO_VENDOR_REJECT';

    // Collect why it was rejected
    const failingB = gradeBClauses.filter((c) => !c.passed);
    failingB.forEach((c) => rejectionReasons.push(c.explanation));

    notes = `Rejected at dock under ${rule.customer} commercial intake rules: ${rejectionReasons.join('; ')}.`;
  }

  // Combine clauses for inspection
  const allClauses = [
    ...evaluatedClauses,
    ...gradeAClauses.map((c) => ({ ...c, label: `Grade A: ${c.label}` })),
    ...gradeBClauses.map((c) => ({ ...c, label: `Grade B: ${c.label}` })),
  ];

  return {
    ruleId: rule.id,
    ruleName: rule.name,
    customer: rule.customer,
    commodity: rule.commodity,
    market: rule.market,
    verdict,
    qualityScore: score,
    recommendedDiscountPercent: discount,
    fastTrackDispatchRequired: fastTrack,
    dispatchWindowHours: windowHours,
    erpRoutingTag: routingTag,
    dispositionNotes: notes,
    gradeAEvaluation: {
      tier: 'GRADE_A',
      passed: gradeAPassed,
      clauses: gradeAClauses,
      unmetClauses: gradeAClauses.filter((c) => !c.passed),
    },
    gradeBEvaluation: {
      tier: 'GRADE_B',
      passed: gradeBPassed,
      clauses: gradeBClauses,
      unmetClauses: gradeBClauses.filter((c) => !c.passed),
    },
    evaluatedClauses: allClauses,
    rejectionReasons,
    appliedRuleJson: {
      commodity: rule.commodity,
      market: rule.market,
      customer: rule.customer,
      grade_a: rule.grade_a,
      grade_b: rule.grade_b,
      reject_criteria: rule.reject_criteria,
    },
  };
}
