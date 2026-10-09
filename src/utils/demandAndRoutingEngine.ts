import type {
  DemandForecastResult,
  IntelligentRoutingResult,
  StoreRoutingOption,
} from '../types';

/**
 * Calculates stochastic demand forecast and waste prevention recommendations.
 * e.g., Shelf life = 2.3 days, Inventory = 400 kg, Store sales velocity = 80 kg/day
 * -> Expected unsold = 216 kg, Waste probability = 61%
 * -> Recommends: Transfer 150 kg to Store B to mitigate loss.
 */
export function calculateDemandForecast(
  inventoryKg: number = 400,
  shelfLifeDays: number = 2.3,
  salesVelocityKgDay: number = 80,
  demandSurgeFactor: number = 1.0
): DemandForecastResult {
  const effectiveVelocity = Math.max(10, salesVelocityKgDay * demandSurgeFactor);
  const expectedSellThroughKg = Math.min(inventoryKg, Math.round(shelfLifeDays * effectiveVelocity));
  const rawUnsoldKg = Math.max(0, inventoryKg - expectedSellThroughKg);
  
  // Calculate stochastic waste risk accounting for daily variance
  const wasteRatio = rawUnsoldKg / Math.max(1, inventoryKg);
  const wasteProbabilityPct = Math.min(99, Math.max(4, Math.round(wasteRatio * 100 * 1.13)));

  let recommendation: 'TRANSFER_INVENTORY' | 'FLASH_MARKDOWN' | 'NORMAL_DISPATCH' | 'DIVERT_TO_PROCESSING' = 'NORMAL_DISPATCH';
  let recommendedTransferKg = 0;
  let recommendedTargetStore = 'Local Store Inventory (Sufficient Velocity)';
  let rationale = 'Store sales velocity is sufficient to clear inventory before kinetic degradation.';

  if (wasteProbabilityPct >= 50) {
    recommendation = 'TRANSFER_INVENTORY';
    // Transfer excess inventory to a deficit hub
    recommendedTransferKg = Math.min(rawUnsoldKg, Math.round(rawUnsoldKg * 0.7));
    recommendedTargetStore = 'Indiranagar Hub B (High Demand Deficit)';
    rationale = `High waste risk (${wasteProbabilityPct}%). At current velocity (${effectiveVelocity} kg/day), ${rawUnsoldKg} kg will expire unsold. Transfer ${recommendedTransferKg} kg immediately to Store B to avoid dumping.`;
  } else if (wasteProbabilityPct >= 25) {
    recommendation = 'FLASH_MARKDOWN';
    recommendedTransferKg = 0;
    recommendedTargetStore = 'Current Store (Local Flash Discounting)';
    rationale = `Moderate waste risk (${wasteProbabilityPct}%). Apply dynamic markdown to accelerate velocity by +45% before day ${shelfLifeDays.toFixed(1)}.`;
  }

  return {
    currentInventoryKg: inventoryKg,
    remainingShelfLifeDays: Number(shelfLifeDays.toFixed(1)),
    storeSalesVelocityKgDay: effectiveVelocity,
    expectedSellThroughKg,
    expectedUnsoldKg: rawUnsoldKg,
    wasteProbabilityPct,
    recommendation,
    recommendedTransferKg,
    recommendedTargetStore,
    rationale,
  };
}

/**
 * Intelligent Multi-Store Routing Optimizer
 * Evaluates candidate destinations based on:
 * Batch -> Shelf-Life -> Demand -> Distance -> Store Capacity -> Expected Sales -> Waste Probability -> Best Destination
 */
export function calculateIntelligentRouting(
  batchId: string = 'CRATE-TOM-8821',
  commodity: string = 'Tomato (Roma)',
  quantityKg: number = 400,
  shelfLifeDays: number = 2.4
): IntelligentRoutingResult {
  const candidateStores: Array<{
    id: string;
    name: string;
    distanceKm: number;
    transitMinutes: number;
    capacityKg: number;
    currentDemandVelocityKgDay: number;
    baseSellThroughPct: number;
    baseWasteRiskPct: number;
    unitPriceInr: number;
  }> = [
    {
      id: 'store-koramangala',
      name: 'Store 1 — Koramangala Dark Store Hub',
      distanceKm: 14,
      transitMinutes: 45,
      capacityKg: 850,
      currentDemandVelocityKgDay: 130,
      baseSellThroughPct: 82,
      baseWasteRiskPct: 18,
      unitPriceInr: 42,
    },
    {
      id: 'store-whitefield',
      name: 'Store 2 — Whitefield Sub-Center',
      distanceKm: 32,
      transitMinutes: 95,
      capacityKg: 400,
      currentDemandVelocityKgDay: 55,
      baseSellThroughPct: 54,
      baseWasteRiskPct: 46,
      unitPriceInr: 38,
    },
    {
      id: 'store-indiranagar',
      name: 'Store 3 — Indiranagar Express Center',
      distanceKm: 9,
      transitMinutes: 28,
      capacityKg: 1200,
      currentDemandVelocityKgDay: 195,
      baseSellThroughPct: 91,
      baseWasteRiskPct: 9,
      unitPriceInr: 44,
    },
  ];

  // Dynamically calculate scores based on shelf-life and demand match
  const evaluatedStores: StoreRoutingOption[] = candidateStores.map((store) => {
    // If shelf life is short, penalty for transit distance is high
    const transitPenalty = (store.transitMinutes / 60) * (shelfLifeDays < 2.0 ? 8 : 3);
    const capacityRatio = Math.min(1.2, store.capacityKg / Math.max(quantityKg, 1));
    const demandMatch = Math.min(1.0, (store.currentDemandVelocityKgDay * shelfLifeDays) / quantityKg);

    let sellThroughPct = Math.min(99, Math.round(store.baseSellThroughPct * (0.8 + 0.2 * demandMatch) - transitPenalty));
    sellThroughPct = Math.max(35, sellThroughPct);
    const wasteRiskPct = 100 - sellThroughPct;

    const projectedSoldKg = (quantityKg * sellThroughPct) / 100;
    const netRealizedRevenueInr = Math.round(projectedSoldKg * store.unitPriceInr);

    // Multi-criteria optimization score (0-100)
    const recommendationScore = Math.round(
      sellThroughPct * 0.5 +
        (100 - store.transitMinutes) * 0.2 +
        (store.capacityKg > quantityKg ? 15 : 5) +
        (netRealizedRevenueInr / (quantityKg * 45)) * 15
    );

    return {
      storeId: store.id,
      storeName: store.name,
      distanceKm: store.distanceKm,
      transitMinutes: store.transitMinutes,
      storeCapacityKg: store.capacityKg,
      currentDemandVelocityKgDay: store.currentDemandVelocityKgDay,
      expectedSellThroughPct: sellThroughPct,
      wasteRiskPct,
      netRealizedRevenueInr,
      recommendationScore,
      isOptimal: false,
    };
  });

  // Sort by recommendation score descending
  evaluatedStores.sort((a, b) => b.recommendationScore - a.recommendationScore);
  evaluatedStores[0].isOptimal = true;

  const optimal = evaluatedStores[0];
  const dispatchUrgencyHours = shelfLifeDays < 2.0 ? 4 : shelfLifeDays < 3.5 ? 8 : 16;

  return {
    batchId,
    commodity,
    quantityKg,
    shelfLifeDays,
    evaluatedStores,
    selectedStore: optimal,
    routingRationale: `Route batch to ${optimal.storeName}. It achieves the highest expected sell-through (${optimal.expectedSellThroughPct}%) and lowest waste probability (${optimal.wasteRiskPct}%), generating ₹${optimal.netRealizedRevenueInr.toLocaleString()} net realized revenue with only ${optimal.transitMinutes}m transit.`,
    dispatchUrgencyHours,
  };
}
