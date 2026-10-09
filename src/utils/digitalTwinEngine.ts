import type {
  DigitalTwinCrateProfile,
  DigitalTwinFactors,
  DigitalTwinRisks,
  DigitalTwinRiskItem,
  DigitalTwinTelemetryStep,
  DigitalTwinStorageMode,
  DigitalTwinPackagingType,
  USDAMaturityStage,
} from '../types';

/**
 * Generates the authentic ASCII progress bar requested in the prompt:
 * e.g. "████████░░" for 3.8 days out of 5.0 days baseline
 */
export function renderShelfLifeAsciiBar(remainingDays: number, maxDays: number = 5.0, totalBlocks: number = 10): string {
  const clamped = Math.max(0, Math.min(maxDays, remainingDays));
  const fillFraction = clamped / maxDays;
  const filledCount = Math.round(fillFraction * totalBlocks);
  const emptyCount = Math.max(0, totalBlocks - filledCount);
  return '█'.repeat(filledCount) + '░'.repeat(emptyCount);
}

/**
 * Biophysical Respiration & Quality Kinetics Model:
 * Evaluates instantaneous burn rate multiplier based on the 8 key factors:
 * temperature, humidity, maturity, defects, handling, transit, storage, packaging.
 */
export function calculateDecayMultipliers(factors: DigitalTwinFactors): {
  tempMultiplier: number;
  humidityMultiplier: number;
  maturityMultiplier: number;
  defectsMultiplier: number;
  handlingMultiplier: number;
  transitMultiplier: number;
  storageMultiplier: number;
  packagingMultiplier: number;
  totalBurnRate: number;
} {
  // 1. Temperature: Arrhenius Q10 kinetic acceleration (Q10 = 2.2, T_ref = 10°C)
  const tempDelta = factors.temperature - 10.0;
  const tempMultiplier = Math.max(0.4, Math.pow(2.2, tempDelta / 10.0));

  // 2. Humidity: Transpiration vs Mold Risk
  // Optimal Solanaceae/Produce RH is 85-90%.
  // Low RH (<70%) causes rapid cellular water loss; extreme RH (>94%) triggers fungal decay.
  let humidityMultiplier = 1.0;
  if (factors.humidity < 75) {
    humidityMultiplier += (75 - factors.humidity) * 0.018; // Transpiration wilting
  } else if (factors.humidity > 92) {
    humidityMultiplier += (factors.humidity - 92) * 0.025; // Condensation & fungal sporulation
  }

  // 3. Maturity: USDA Stage 1 (Green) to Stage 6 (Red)
  // Ethylene production increases autocatalytically with ripeness stage
  const maturityMultiplier = 1.0 + (factors.maturityStage - 1) * 0.22 + (factors.maturityPct / 100) * 0.15;

  // 4. Defects: Surface punctures, bruises, skin breaks allow enzymatic oxidation
  const defectsMultiplier = 1.0 + (factors.defectsPct / 100) * 1.75;

  // 5. Handling: Mechanical shock & vibration (0.8G baseline)
  const handlingMultiplier = 1.0 + Math.max(0, factors.handlingGForce - 0.8) * 0.42;

  // 6. Transit: Cumulative vibration & route fatigue
  const transitMultiplier = 1.0 + (factors.transitHours / 24) * 0.18;

  // 7. Storage Mode: Chilled vs Ambient vs Controlled Atmosphere
  const storageMap: Record<DigitalTwinStorageMode, number> = {
    CONTROLLED_ATMOSPHERE: 0.65,
    CHILLED_REEFER: 0.85,
    PRECOOLED_DOCK: 1.15,
    DARK_STORE_RACK: 1.35,
    AMBIENT_LORRY: 1.95,
  };
  const storageMultiplier = storageMap[factors.storageMode] ?? 1.0;

  // 8. Packaging Type: Modified Atmosphere vs Open Crate
  const packagingMap: Record<DigitalTwinPackagingType, number> = {
    MAP_FILM: 0.72,
    VENTILATED_PLASTIC_CRATE: 1.0,
    CORRUGATED_BOX: 1.12,
    OPEN_WOODEN_CRATE: 1.38,
  };
  const packagingMultiplier = packagingMap[factors.packagingType] ?? 1.0;

  const totalBurnRate = +(
    tempMultiplier *
    humidityMultiplier *
    maturityMultiplier *
    defectsMultiplier *
    handlingMultiplier *
    transitMultiplier *
    storageMultiplier *
    packagingMultiplier
  ).toFixed(2);

  return {
    tempMultiplier: +tempMultiplier.toFixed(2),
    humidityMultiplier: +humidityMultiplier.toFixed(2),
    maturityMultiplier: +maturityMultiplier.toFixed(2),
    defectsMultiplier: +defectsMultiplier.toFixed(2),
    handlingMultiplier: +handlingMultiplier.toFixed(2),
    transitMultiplier: +transitMultiplier.toFixed(2),
    storageMultiplier: +storageMultiplier.toFixed(2),
    packagingMultiplier: +packagingMultiplier.toFixed(2),
    totalBurnRate,
  };
}

/**
 * Risk Assessment Matrix:
 * Generates the exact 5 risks with symbols matching the prompt:
 * Temperature Risk, Bruise Risk, Fungal Risk, Cold Chain, Demand Risk
 */
export function evaluateDigitalTwinRisks(
  factors: DigitalTwinFactors,
  remainingDays: number,
  storeTurnoverHours: number = 32
): DigitalTwinRisks {
  // 1. Temperature Risk
  let tempRisk: DigitalTwinRiskItem;
  if (factors.temperature <= 12) {
    tempRisk = { level: 'LOW', symbol: '🟢', label: 'Optimal', detail: `${factors.temperature}°C in safe zone`, score: 15 };
  } else if (factors.temperature <= 22) {
    tempRisk = { level: 'MEDIUM', symbol: '🟡', label: 'Moderate', detail: `${factors.temperature}°C mild acceleration`, score: 48 };
  } else if (factors.temperature <= 28) {
    tempRisk = { level: 'ELEVATED', symbol: '🟠', label: 'Elevated', detail: `${factors.temperature}°C rapid respiration`, score: 74 };
  } else {
    tempRisk = { level: 'HIGH', symbol: '🔴', label: 'Critical', detail: `${factors.temperature}°C severe thermal load`, score: 92 };
  }

  // 2. Bruise Risk (Handling G-Force + Defects)
  const combinedBruiseScore = (factors.handlingGForce / 3.0) * 50 + (factors.defectsPct / 30) * 50;
  let bruiseRisk: DigitalTwinRiskItem;
  if (combinedBruiseScore < 30) {
    bruiseRisk = { level: 'LOW', symbol: '🟢', label: 'Low', detail: `${factors.handlingGForce.toFixed(1)}G shock · intact cell walls`, score: Math.round(combinedBruiseScore) };
  } else if (combinedBruiseScore < 55) {
    bruiseRisk = { level: 'MEDIUM', symbol: '🟡', label: 'Moderate', detail: 'Mild compression along bottom layer', score: Math.round(combinedBruiseScore) };
  } else if (combinedBruiseScore < 75) {
    bruiseRisk = { level: 'ELEVATED', symbol: '🟠', label: 'Elevated', detail: 'Sub-epidermal bruising detected', score: Math.round(combinedBruiseScore) };
  } else {
    bruiseRisk = { level: 'HIGH', symbol: '🔴', label: 'Severe', detail: 'Extensive mechanical crush injuries', score: Math.round(combinedBruiseScore) };
  }

  // 3. Fungal Risk (Humidity + Skin Defect Entry Points + Warmth)
  let fungalRiskScore = 0;
  if (factors.humidity > 88) fungalRiskScore += 35;
  if (factors.humidity > 93) fungalRiskScore += 25;
  if (factors.temperature > 18) fungalRiskScore += 20;
  if (factors.defectsPct > 5) fungalRiskScore += 20;

  let fungalRisk: DigitalTwinRiskItem;
  if (fungalRiskScore < 35) {
    fungalRisk = { level: 'LOW', symbol: '🟢', label: 'Low', detail: 'Dry surface · low mycelium risk', score: fungalRiskScore };
  } else if (fungalRiskScore < 60) {
    fungalRisk = { level: 'MEDIUM', symbol: '🟡', label: 'Moderate', detail: 'RH near dew point', score: fungalRiskScore };
  } else if (fungalRiskScore < 80) {
    // Matches prompt default: Fungal Risk 🟠
    fungalRisk = { level: 'ELEVATED', symbol: '🟠', label: 'Elevated', detail: `${factors.humidity}% RH + surface micro-fractures`, score: fungalRiskScore };
  } else {
    fungalRisk = { level: 'HIGH', symbol: '🔴', label: 'High', detail: 'Active condensation · high sporulation risk', score: fungalRiskScore };
  }

  // 4. Cold Chain Risk (Storage mode + Temp excursion)
  let coldChainRisk: DigitalTwinRiskItem;
  if (factors.storageMode === 'CONTROLLED_ATMOSPHERE' || (factors.storageMode === 'CHILLED_REEFER' && factors.temperature <= 10)) {
    coldChainRisk = { level: 'LOW', symbol: '🟢', label: 'Compliant', detail: 'Strict 8-10°C thermal envelope maintained', score: 12 };
  } else if (factors.storageMode === 'CHILLED_REEFER' || factors.storageMode === 'PRECOOLED_DOCK' || factors.temperature <= 20) {
    // Matches prompt default: Cold Chain 🟡
    coldChainRisk = { level: 'MEDIUM', symbol: '🟡', label: 'Warning', detail: 'Excursion detected during dock transfer', score: 52 };
  } else if (factors.storageMode === 'DARK_STORE_RACK' || factors.temperature <= 26) {
    coldChainRisk = { level: 'ELEVATED', symbol: '🟠', label: 'Elevated', detail: 'Unchilled staging > 4 hours', score: 72 };
  } else {
    coldChainRisk = { level: 'HIGH', symbol: '🔴', label: 'Broken', detail: 'Extended ambient lorry transit > 28°C', score: 95 };
  }

  // 5. Demand Risk (Sell-Through Velocity vs Remaining Shelf Life)
  const remainingHours = remainingDays * 24;
  const safetyBufferHours = remainingHours - storeTurnoverHours;
  let demandRisk: DigitalTwinRiskItem;
  if (safetyBufferHours > 36) {
    // Matches prompt default: Demand Risk 🟢
    demandRisk = { level: 'LOW', symbol: '🟢', label: 'Optimal', detail: `Turnover ${storeTurnoverHours}h well within ${Math.round(remainingHours)}h life`, score: 18 };
  } else if (safetyBufferHours > 12) {
    demandRisk = { level: 'MEDIUM', symbol: '🟡', label: 'Tight', detail: 'Sell-through requires standard display prioritization', score: 45 };
  } else if (safetyBufferHours > 0) {
    demandRisk = { level: 'ELEVATED', symbol: '🟠', label: 'High Risk', detail: 'Requires promotional markdown to avoid waste', score: 78 };
  } else {
    demandRisk = { level: 'HIGH', symbol: '🔴', label: 'Critical', detail: 'Expected shelf expiry before full sell-through', score: 95 };
  }

  return {
    temperatureRisk: tempRisk,
    bruiseRisk,
    fungalRisk,
    coldChainRisk,
    demandRisk,
  };
}

/**
 * Generates Recommended Action dynamically based on remaining days and risks:
 * e.g. "→ Dispatch to Store #14", "→ Sell within 72 hours"
 */
export function determineRecommendedAction(
  crateId: string,
  remainingDays: number,
  risks: DigitalTwinRisks,
  defaultStore: string = 'Store #14'
): DigitalTwinCrateProfile['recommendedAction'] {
  const remainingHours = Math.round(remainingDays * 24);

  // Safety buffer calculation for sell-through window
  let sellWithinHours: number;
  let primaryDispatch: string = `Dispatch to ${defaultStore}`;
  let secondaryRouting: string | undefined;
  let actionType: DigitalTwinCrateProfile['recommendedAction']['actionType'] = 'OPTIMAL_RETAIL';
  let rationale = '';

  if (remainingDays >= 3.5) {
    // Prompt default: Sell within 72 hours
    sellWithinHours = 72;
    primaryDispatch = `Dispatch to ${defaultStore}`;
    secondaryRouting = 'Secondary: Dark Store Hub #03 (14 km)';
    actionType = 'OPTIMAL_RETAIL';
    rationale = `Produce has ${remainingDays.toFixed(1)} days remaining. Safe for full-price retail distribution at high-velocity ${defaultStore}.`;
  } else if (remainingDays >= 2.5) {
    sellWithinHours = 48;
    primaryDispatch = `Fast-Track Dispatch to ${defaultStore}`;
    secondaryRouting = 'Express Quick-Commerce Dark Store Hub #08';
    actionType = 'EXPEDITE_DISPATCH';
    rationale = `Produce has ${remainingDays.toFixed(1)} days remaining (${remainingHours}h). Route immediately to front display bin.`;
  } else if (remainingDays >= 1.2) {
    sellWithinHours = 24;
    primaryDispatch = `Dispatch to Clearance Outlet Store #09`;
    secondaryRouting = 'Apply 20% Dynamic Discount Promotion';
    actionType = 'FLASH_MARKDOWN';
    rationale = `Elevated decay rate burns shelf-life quickly. Sell within 24 hours with flash promotion to recover maximum margin.`;
  } else {
    sellWithinHours = 12;
    primaryDispatch = `Reroute to Central Food Processing / Sauce Facility`;
    secondaryRouting = 'Secondary: Instant B2B Commercial Kitchens';
    actionType = 'PULP_RECOVERY';
    rationale = `Critical shelf life (< 1.2 days). Divert from fresh retail to processing to eliminate 100% post-harvest waste.`;
  }

  return {
    primaryDispatch: `→ ${primaryDispatch}`,
    urgencyWindow: `→ Sell within ${sellWithinHours} hours`,
    secondaryRouting: secondaryRouting ? `→ ${secondaryRouting}` : undefined,
    actionType,
    confidencePct: 96,
    economicImpact:
      actionType === 'OPTIMAL_RETAIL'
        ? 'Preserves 100% Gross Margin ($2.80/kg)'
        : actionType === 'EXPEDITE_DISPATCH'
        ? 'Prevents 18% inventory loss risk'
        : 'Recovers 65-80% value vs zero-revenue landfill',
    rationale,
  };
}

/**
 * Pre-configured Initial Batches including the marquee batch from user prompt:
 * BATCH CRATE-4892 (Roma Tomatoes)
 */
export const INITIAL_DIGITAL_TWIN_BATCHES: DigitalTwinCrateProfile[] = [
  {
    crateId: 'BATCH CRATE-4892',
    commodity: 'Roma Tomatoes',
    variety: 'Solanum lycopersicum "Roma VF"',
    supplier: 'Saraswati Agritech Cluster #3 (Nashik)',
    initialShelfLifeDays: 4.8,
    currentRemainingShelfLifeDays: 3.8, // Exactly 3.8 days from prompt
    baselineStaticShelfLifeDays: 4.2, // "Instead of calculating shelf life once: Shelf life = 4.2 days"
    targetStore: 'Store #14',
    sellWithinHours: 72,
    factors: {
      temperature: 19.4,
      humidity: 89,
      maturityStage: 3, // Breaker / Turning
      maturityPct: 45,
      defectsPct: 3.2,
      handlingGForce: 1.1,
      transitHours: 9.5,
      storageMode: 'PRECOOLED_DOCK',
      packagingType: 'VENTILATED_PLASTIC_CRATE',
    },
    risks: {
      temperatureRisk: {
        level: 'MEDIUM',
        symbol: '🟡',
        label: 'Moderate',
        detail: '19.4°C dock hold (target 10-12°C)',
        score: 48,
      },
      bruiseRisk: {
        level: 'LOW',
        symbol: '🟢',
        label: 'Minimal',
        detail: '1.1G road shock · no cellular rupture',
        score: 18,
      },
      fungalRisk: {
        level: 'ELEVATED',
        symbol: '🟠',
        label: 'Elevated',
        detail: '89% RH near dew point · spore caution',
        score: 68,
      },
      coldChainRisk: {
        level: 'MEDIUM',
        symbol: '🟡',
        label: 'Warning',
        detail: '42m reefer door open during highway stop',
        score: 52,
      },
      demandRisk: {
        level: 'LOW',
        symbol: '🟢',
        label: 'Optimal',
        detail: 'Store #14 turnover velocity is 3.8x baseline',
        score: 15,
      },
    },
    recommendedAction: {
      primaryDispatch: '→ Dispatch to Store #14',
      urgencyWindow: '→ Sell within 72 hours',
      secondaryRouting: '→ Secondary: Dark Store Hub #03 (14 km)',
      actionType: 'OPTIMAL_RETAIL',
      confidencePct: 97,
      economicImpact: 'Preserves 100% Gross Margin ($2.80/kg)',
      rationale:
        'Continuous digital twin tracking indicates 3.8 days of remaining vitality. Store #14 dark store turnover (28h) guarantees 100% fresh customer receipt within 72 hours.',
    },
    timeline: [
      {
        stepIndex: 0,
        timeFormatted: '09:00',
        timestampIso: '2026-10-05T09:00:00Z',
        hoursElapsed: 0,
        remainingShelfLifeDays: 4.2, // User prompt: 09:00 → 4.2 days
        instantaneousBurnRate: 1.2,
        eventNote: 'Packhouse crate intake & optical grading. Initial baseline shelf life established.',
        factors: {
          temperature: 12.0,
          humidity: 85,
          maturityStage: 2,
          maturityPct: 25,
          defectsPct: 2.0,
          handlingGForce: 0.8,
          transitHours: 0,
          storageMode: 'CHILLED_REEFER',
          packagingType: 'VENTILATED_PLASTIC_CRATE',
        },
        risks: {
          temperatureRisk: { level: 'LOW', symbol: '🟢', label: 'Optimal', detail: '12°C packhouse baseline', score: 15 },
          bruiseRisk: { level: 'LOW', symbol: '🟢', label: 'Low', detail: '0.8G gentle pack line', score: 10 },
          fungalRisk: { level: 'LOW', symbol: '🟢', label: 'Low', detail: '85% RH dry pack', score: 20 },
          coldChainRisk: { level: 'LOW', symbol: '🟢', label: 'Compliant', detail: 'Reefer loaded at setpoint', score: 10 },
          demandRisk: { level: 'LOW', symbol: '🟢', label: 'Optimal', detail: 'Allocated to Store #14', score: 12 },
        },
      },
      {
        stepIndex: 1,
        timeFormatted: '12:00',
        timestampIso: '2026-10-05T12:00:00Z',
        hoursElapsed: 3,
        remainingShelfLifeDays: 3.9, // User prompt: 12:00 → 3.9 days
        instantaneousBurnRate: 2.4,
        eventNote: 'Cross-dock staging & ambient lorry transfer. Mild thermal excursion to 21°C.',
        factors: {
          temperature: 21.0,
          humidity: 82,
          maturityStage: 3,
          maturityPct: 35,
          defectsPct: 2.8,
          handlingGForce: 1.0,
          transitHours: 3.0,
          storageMode: 'PRECOOLED_DOCK',
          packagingType: 'VENTILATED_PLASTIC_CRATE',
        },
        risks: {
          temperatureRisk: { level: 'MEDIUM', symbol: '🟡', label: 'Moderate', detail: '21°C dock staging', score: 48 },
          bruiseRisk: { level: 'LOW', symbol: '🟢', label: 'Low', detail: '1.0G pallet transfer', score: 20 },
          fungalRisk: { level: 'MEDIUM', symbol: '🟡', label: 'Moderate', detail: '82% RH stable', score: 38 },
          coldChainRisk: { level: 'MEDIUM', symbol: '🟡', label: 'Warning', detail: 'Transfer door excursion', score: 45 },
          demandRisk: { level: 'LOW', symbol: '🟢', label: 'Optimal', detail: 'Fast dispatch track', score: 15 },
        },
      },
      {
        stepIndex: 2,
        timeFormatted: '15:00',
        timestampIso: '2026-10-05T15:00:00Z',
        hoursElapsed: 6,
        remainingShelfLifeDays: 3.4, // User prompt: 15:00 → 3.4 days
        instantaneousBurnRate: 4.0,
        eventNote: 'Highway corridor transit. Midday solar heat excursion (28°C) + road vibration 1.4G.',
        factors: {
          temperature: 28.2,
          humidity: 88,
          maturityStage: 3,
          maturityPct: 42,
          defectsPct: 3.2,
          handlingGForce: 1.4,
          transitHours: 6.0,
          storageMode: 'AMBIENT_LORRY',
          packagingType: 'VENTILATED_PLASTIC_CRATE',
        },
        risks: {
          temperatureRisk: { level: 'ELEVATED', symbol: '🟠', label: 'Elevated', detail: '28.2°C ambient spike', score: 76 },
          bruiseRisk: { level: 'MEDIUM', symbol: '🟡', label: 'Moderate', detail: '1.4G rough highway shock', score: 42 },
          fungalRisk: { level: 'ELEVATED', symbol: '🟠', label: 'Elevated', detail: '88% RH + high temp', score: 65 },
          coldChainRisk: { level: 'ELEVATED', symbol: '🟠', label: 'High', detail: 'Lorry AC compressor cycling', score: 68 },
          demandRisk: { level: 'LOW', symbol: '🟢', label: 'Optimal', detail: 'Routing to quick-commerce', score: 20 },
        },
      },
      {
        stepIndex: 3,
        timeFormatted: '18:00',
        timestampIso: '2026-10-05T18:00:00Z',
        hoursElapsed: 9,
        remainingShelfLifeDays: 3.1, // User prompt: 18:00 → 3.1 days
        instantaneousBurnRate: 2.4,
        eventNote: 'Regional distribution hub receiving dock. Precooling started down to 18°C.',
        factors: {
          temperature: 18.0,
          humidity: 91,
          maturityStage: 3,
          maturityPct: 48,
          defectsPct: 3.5,
          handlingGForce: 0.9,
          transitHours: 9.0,
          storageMode: 'PRECOOLED_DOCK',
          packagingType: 'VENTILATED_PLASTIC_CRATE',
        },
        risks: {
          temperatureRisk: { level: 'MEDIUM', symbol: '🟡', label: 'Moderate', detail: 'Precooling to 18°C', score: 42 },
          bruiseRisk: { level: 'LOW', symbol: '🟢', label: 'Low', detail: 'Stationary pallet staging', score: 18 },
          fungalRisk: { level: 'ELEVATED', symbol: '🟠', label: 'Elevated', detail: '91% RH high humidity', score: 72 },
          coldChainRisk: { level: 'MEDIUM', symbol: '🟡', label: 'Recovering', detail: 'Dock refrigeration active', score: 40 },
          demandRisk: { level: 'LOW', symbol: '🟢', label: 'Optimal', detail: 'Store #14 van loaded', score: 14 },
        },
      },
    ],
  },
  {
    crateId: 'BATCH CRATE-8821',
    commodity: 'Field Harvest Tomatoes',
    variety: 'Solanum lycopersicum "Pusa Ruby"',
    supplier: 'Maharashtra Organic Grower FPO',
    initialShelfLifeDays: 6.5,
    currentRemainingShelfLifeDays: 5.6,
    baselineStaticShelfLifeDays: 5.8,
    targetStore: 'Store #03 (Bandra Express)',
    sellWithinHours: 96,
    factors: {
      temperature: 14.2,
      humidity: 86,
      maturityStage: 2,
      maturityPct: 20,
      defectsPct: 1.8,
      handlingGForce: 0.8,
      transitHours: 4.0,
      storageMode: 'CHILLED_REEFER',
      packagingType: 'VENTILATED_PLASTIC_CRATE',
    },
    risks: {
      temperatureRisk: { level: 'LOW', symbol: '🟢', label: 'Optimal', detail: '14.2°C controlled chill', score: 18 },
      bruiseRisk: { level: 'LOW', symbol: '🟢', label: 'Low', detail: '0.8G smooth transport', score: 12 },
      fungalRisk: { level: 'LOW', symbol: '🟢', label: 'Low', detail: '86% RH optimal range', score: 22 },
      coldChainRisk: { level: 'LOW', symbol: '🟢', label: 'Compliant', detail: 'Continuous active reefer', score: 14 },
      demandRisk: { level: 'LOW', symbol: '🟢', label: 'Optimal', detail: 'Premium Grade A allocation', score: 10 },
    },
    recommendedAction: {
      primaryDispatch: '→ Dispatch to Store #03',
      urgencyWindow: '→ Sell within 96 hours',
      actionType: 'OPTIMAL_RETAIL',
      confidencePct: 98,
      economicImpact: 'Preserves 100% Premium Shelf Tier',
      rationale: 'Low respiration and minimal defects provide 5.6 days of remaining shelf life.',
    },
    timeline: [
      {
        stepIndex: 0,
        timeFormatted: '07:30',
        timestampIso: '2026-10-05T07:30:00Z',
        hoursElapsed: 0,
        remainingShelfLifeDays: 6.5,
        instantaneousBurnRate: 1.0,
        eventNote: 'Early morning field harvest. High cellular turgidity.',
        factors: {
          temperature: 18.0,
          humidity: 88,
          maturityStage: 1,
          maturityPct: 10,
          defectsPct: 1.0,
          handlingGForce: 0.6,
          transitHours: 0,
          storageMode: 'PRECOOLED_DOCK',
          packagingType: 'VENTILATED_PLASTIC_CRATE',
        },
        risks: {
          temperatureRisk: { level: 'LOW', symbol: '🟢', label: 'Optimal', detail: 'Field chill', score: 14 },
          bruiseRisk: { level: 'LOW', symbol: '🟢', label: 'Low', detail: 'Hand-picked', score: 8 },
          fungalRisk: { level: 'LOW', symbol: '🟢', label: 'Low', detail: 'Dry foliage', score: 15 },
          coldChainRisk: { level: 'LOW', symbol: '🟢', label: 'Compliant', detail: 'Precooled immediately', score: 12 },
          demandRisk: { level: 'LOW', symbol: '🟢', label: 'Optimal', detail: 'High demand', score: 10 },
        },
      },
      {
        stepIndex: 1,
        timeFormatted: '11:30',
        timestampIso: '2026-10-05T11:30:00Z',
        hoursElapsed: 4,
        remainingShelfLifeDays: 5.6,
        instantaneousBurnRate: 1.2,
        eventNote: 'Transferred to chilled reefer @ 14°C.',
        factors: {
          temperature: 14.2,
          humidity: 86,
          maturityStage: 2,
          maturityPct: 20,
          defectsPct: 1.8,
          handlingGForce: 0.8,
          transitHours: 4.0,
          storageMode: 'CHILLED_REEFER',
          packagingType: 'VENTILATED_PLASTIC_CRATE',
        },
        risks: {
          temperatureRisk: { level: 'LOW', symbol: '🟢', label: 'Optimal', detail: 'Reefer steady', score: 18 },
          bruiseRisk: { level: 'LOW', symbol: '🟢', label: 'Low', detail: 'Highway smooth', score: 12 },
          fungalRisk: { level: 'LOW', symbol: '🟢', label: 'Low', detail: 'No condensation', score: 22 },
          coldChainRisk: { level: 'LOW', symbol: '🟢', label: 'Compliant', detail: '0 alarms', score: 14 },
          demandRisk: { level: 'LOW', symbol: '🟢', label: 'Optimal', detail: 'Safe buffer', score: 10 },
        },
      },
    ],
  },
  {
    crateId: 'BATCH CRATE-2304',
    commodity: 'Alphonso Mangoes',
    variety: 'Mangifera indica "Ratnagiri"',
    supplier: 'Konkan Coast Horticulture Coop',
    initialShelfLifeDays: 4.0,
    currentRemainingShelfLifeDays: 2.3,
    baselineStaticShelfLifeDays: 3.5,
    targetStore: 'Store #22 (Quick Flash Markdown)',
    sellWithinHours: 36,
    factors: {
      temperature: 26.5,
      humidity: 78,
      maturityStage: 5,
      maturityPct: 82,
      defectsPct: 6.4,
      handlingGForce: 1.6,
      transitHours: 18.0,
      storageMode: 'AMBIENT_LORRY',
      packagingType: 'CORRUGATED_BOX',
    },
    risks: {
      temperatureRisk: { level: 'ELEVATED', symbol: '🟠', label: 'Elevated', detail: '26.5°C warm transit', score: 72 },
      bruiseRisk: { level: 'MEDIUM', symbol: '🟡', label: 'Moderate', detail: '1.6G box compression', score: 48 },
      fungalRisk: { level: 'MEDIUM', symbol: '🟡', label: 'Moderate', detail: 'Anthracnose vulnerability', score: 54 },
      coldChainRisk: { level: 'HIGH', symbol: '🔴', label: 'Broken', detail: 'Ambient haul without cooling', score: 88 },
      demandRisk: { level: 'ELEVATED', symbol: '🟠', label: 'High', detail: 'Fast markdown needed', score: 70 },
    },
    recommendedAction: {
      primaryDispatch: '→ Dispatch to Store #22',
      urgencyWindow: '→ Sell within 36 hours (Flash 15% Off)',
      actionType: 'FLASH_MARKDOWN',
      confidencePct: 94,
      economicImpact: 'Recovers $3.20/kg before pulp softening',
      rationale: 'Advanced ripeness (Stage 5) and ambient thermal load accelerate senescent breakdown.',
    },
    timeline: [
      {
        stepIndex: 0,
        timeFormatted: '08:00',
        timestampIso: '2026-10-05T08:00:00Z',
        hoursElapsed: 0,
        remainingShelfLifeDays: 4.0,
        instantaneousBurnRate: 1.6,
        eventNote: 'Orchard packing in corrugated cartons.',
        factors: {
          temperature: 22.0,
          humidity: 80,
          maturityStage: 4,
          maturityPct: 65,
          defectsPct: 3.0,
          handlingGForce: 0.9,
          transitHours: 0,
          storageMode: 'PRECOOLED_DOCK',
          packagingType: 'CORRUGATED_BOX',
        },
        risks: {
          temperatureRisk: { level: 'MEDIUM', symbol: '🟡', label: 'Moderate', detail: 'Ambient pack', score: 45 },
          bruiseRisk: { level: 'LOW', symbol: '🟢', label: 'Low', detail: 'Cushioned', score: 20 },
          fungalRisk: { level: 'LOW', symbol: '🟢', label: 'Low', detail: 'Clean peel', score: 25 },
          coldChainRisk: { level: 'MEDIUM', symbol: '🟡', label: 'Unchilled', detail: 'Dock hold', score: 40 },
          demandRisk: { level: 'LOW', symbol: '🟢', label: 'Optimal', detail: 'High season', score: 15 },
        },
      },
      {
        stepIndex: 1,
        timeFormatted: '16:00',
        timestampIso: '2026-10-05T16:00:00Z',
        hoursElapsed: 8,
        remainingShelfLifeDays: 2.3,
        instantaneousBurnRate: 4.8,
        eventNote: 'Ghat pass delay + ambient lorry overheating to 26.5°C.',
        factors: {
          temperature: 26.5,
          humidity: 78,
          maturityStage: 5,
          maturityPct: 82,
          defectsPct: 6.4,
          handlingGForce: 1.6,
          transitHours: 18.0,
          storageMode: 'AMBIENT_LORRY',
          packagingType: 'CORRUGATED_BOX',
        },
        risks: {
          temperatureRisk: { level: 'ELEVATED', symbol: '🟠', label: 'Elevated', detail: 'Overheating', score: 72 },
          bruiseRisk: { level: 'MEDIUM', symbol: '🟡', label: 'Moderate', detail: 'Box crush', score: 48 },
          fungalRisk: { level: 'MEDIUM', symbol: '🟡', label: 'Moderate', detail: 'Skin tear', score: 54 },
          coldChainRisk: { level: 'HIGH', symbol: '🔴', label: 'Broken', detail: 'Zero reefer', score: 88 },
          demandRisk: { level: 'ELEVATED', symbol: '🟠', label: 'High', detail: 'Flash sale', score: 70 },
        },
      },
    ],
  },
];
