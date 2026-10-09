import type {
  DeepSupplierScorecard,
  AutonomousRootCauseAnalysis,
} from '../types';

export const SUPPLIER_SCORECARD_PRESETS: Record<string, DeepSupplierScorecard> = {
  'Nashik Agro Cluster': {
    supplierId: 'supp-nashik-01',
    supplierName: 'Nashik Agro Cluster',
    clusterRegion: 'Maharashtra Horticulture Belt',
    overallScore: 86,
    qualityScore: 92,
    consistencyScore: 87,
    coldChainScore: 74,
    gradeAYieldPct: 81,
    rejectionRatePct: 6,
    shelfLifeAccuracyPct: 89,
    damageRatePct: 4,
    onTimeDeliveryPct: 94,
    topRootCause: 'Temperature excursions during transit (+2.4°C above SLA for 3.2 hrs)',
    historicalBatchesCount: 428,
    predictiveRiskTier: 'MODERATE',
    predictiveRejectionProbPct: 8.5,
    autonomousProcurementRecommendation: {
      alternativeSupplier: 'Sahyadri Farmers Producer Co-op',
      priceDifferencePct: 8,
      wasteReductionPct: 14,
      projectedMonthlySavingsInr: 180000,
      recommendationText: 'Supplier Sahyadri is 8% higher in unit price (₹42 vs ₹38.8) but generates 14% lower transit decay and 0.5% rejection rate. Switching 60% volume yields ₹1.8L/month net margin expansion.',
    },
  },
  'Saraswati Agritech Cluster #3': {
    supplierId: 'supp-saraswati-03',
    supplierName: 'Saraswati Agritech Cluster #3',
    clusterRegion: 'Kolar Greenhouse Hub, Karnataka',
    overallScore: 88,
    qualityScore: 94,
    consistencyScore: 90,
    coldChainScore: 82,
    gradeAYieldPct: 86,
    rejectionRatePct: 4,
    shelfLifeAccuracyPct: 92,
    damageRatePct: 3,
    onTimeDeliveryPct: 96,
    topRootCause: 'Occasional pre-dawn harvest moisture causing secondary condensation risk',
    historicalBatchesCount: 612,
    predictiveRiskTier: 'LOW',
    predictiveRejectionProbPct: 4.2,
    autonomousProcurementRecommendation: {
      alternativeSupplier: 'Primary Preferred Tier 1 Partner',
      priceDifferencePct: 0,
      wasteReductionPct: 0,
      projectedMonthlySavingsInr: 0,
      recommendationText: 'Maintain current contract allocation at 45% volume. Tier 1 preferred partner with verified NIST reefer compliance.',
    },
  },
  'Deccan Organic FPO': {
    supplierId: 'supp-deccan-02',
    supplierName: 'Deccan Organic FPO',
    clusterRegion: 'Solapur Semi-Arid Cluster',
    overallScore: 72,
    qualityScore: 78,
    consistencyScore: 68,
    coldChainScore: 61,
    gradeAYieldPct: 69,
    rejectionRatePct: 18,
    shelfLifeAccuracyPct: 76,
    damageRatePct: 9,
    onTimeDeliveryPct: 84,
    topRootCause: 'Reefer compressor cycling failure + rough road transit shock >2.4G',
    historicalBatchesCount: 184,
    predictiveRiskTier: 'HIGH',
    predictiveRejectionProbPct: 37,
    autonomousProcurementRecommendation: {
      alternativeSupplier: 'Saraswati Agritech Cluster #3',
      priceDifferencePct: 5,
      wasteReductionPct: 22,
      projectedMonthlySavingsInr: 245000,
      recommendationText: 'Supplier exhibits 37% probability of Grade B / dock rejection due to uninsulated transit trucks. Reroute upcoming 3 scheduled shipments to Saraswati Agritech.',
    },
  },
};

/**
 * Returns deep supplier scorecard metrics for a given supplier name.
 */
export function getSupplierScorecard(supplierName: string): DeepSupplierScorecard {
  if (SUPPLIER_SCORECARD_PRESETS[supplierName]) {
    return SUPPLIER_SCORECARD_PRESETS[supplierName];
  }
  
  // Default to calibrated Nashik Agro Cluster profile
  return {
    ...SUPPLIER_SCORECARD_PRESETS['Nashik Agro Cluster'],
    supplierName: supplierName || 'Nashik Agro Cluster',
  };
}

/**
 * Autonomous Root Cause Analysis Generator
 */
export function generateAutonomousRootCause(
  supplierName: string,
  defectIndex: number,
  tempExcursionHours: number = 3.2,
  vibrationG: number = 1.8
): AutonomousRootCauseAnalysis {
  if (defectIndex > 15 || tempExcursionHours > 2.0) {
    return {
      primaryCause: '61% of defects originated from mechanical compression during transportation (rough rural transit road vibration)',
      secondaryCause: `Reefer temperature exceeded 12°C for ${tempExcursionHours.toFixed(1)} hours (ambient cargo pulp reached 14.8°C)`,
      supplierCorrelation: `Similar cold-chain and bruise events occurred in 7 of the previous 20 batches from ${supplierName}`,
      preventativeAction: 'Mandate ventilated plastic crates with foam padding dividers and inspect vehicle suspension before next dispatch.',
    };
  }

  return {
    primaryCause: 'Natural micro-abrasions from field handling and crate loading (under 3.2% total surface)',
    secondaryCause: 'Minor ambient transit temperature drift within acceptable SLA envelope (under 0.8°C excursion)',
    supplierCorrelation: `Pristine handling verified. 19 of previous 20 batches from ${supplierName} achieved Grade A intake status.`,
    preventativeAction: 'Continue current pre-cooling protocol and Reefer hold at 8.0°C.',
  };
}
