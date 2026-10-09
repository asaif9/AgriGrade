import type {
  MobileFieldHarvestAdvisory,
  WeatherHarvestIntelligence,
  PackagingIntelligence,
  OperationalAlert,
} from '../types';

/**
 * Mobile Field Scout Harvest & Logistics Decision Engine
 */
export function getMobileFieldAdvisory(
  stage: number = 2,
  destination: string = 'Bangalore DC (Whitefield Hub)',
  ambientTemp: number = 32
): MobileFieldHarvestAdvisory {
  if (stage <= 2) {
    // Stage 1 or 2 (Mature Green or Breaker) -> Perfect for long haul transit
    return {
      scanStatus: 'HARVEST_TODAY',
      targetDestination: destination,
      recommendedTransport: ambientTemp > 28 ? 'REFERRED_REEFER' : 'VENTILATED_LORRY',
      maximumTransitHours: 14,
      fieldActionChecklist: [
        'Harvest during pre-dawn hours (04:30 - 08:00 AM) to minimize field heat',
        'Stack crates max 4-high to prevent lower tier compression bruising',
        'Transfer to shading staging canopy within 45 minutes of picking',
        'Initiate pre-cooling airflow before loading into reefer transport',
      ],
    };
  } else if (stage === 3 || stage === 4) {
    // Turning or Pink -> Needs quick regional delivery
    return {
      scanStatus: 'HARVEST_TODAY',
      targetDestination: 'Regional City Dark Store Hub (Local Express)',
      recommendedTransport: 'REFERRED_REEFER',
      maximumTransitHours: 6,
      fieldActionChecklist: [
        'Expedite immediate dispatch; produce will reach Stage 5 (Light Red) in transit',
        'Maintain chilled temperature at 10-12°C to decelerate ethylene surge',
        'Direct route bypass to nearest dark store without multi-hub staging',
      ],
    };
  } else {
    // Full ripe (Stage 5 or 6) -> Local consumption or puree/processing
    return {
      scanStatus: 'EXPEDITE_LOCAL',
      targetDestination: 'Local Mandi / Food Processing Pulp Mill',
      recommendedTransport: 'CRATE_CANOPY',
      maximumTransitHours: 2,
      fieldActionChecklist: [
        'Do not dispatch to long-distance quick-commerce hubs (high transit squish risk)',
        'Route to local food processing or institutional dining within 24 hours',
      ],
    };
  }
}

/**
 * Weather Harvest Intelligence
 */
export function getWeatherIntelligence(
  currentAmbientTemp: number = 31,
  rainRisk: boolean = false
): WeatherHarvestIntelligence {
  const heatwaveActive = currentAmbientTemp >= 36;
  const tomorrowForecastTemp = heatwaveActive ? 39 : currentAmbientTemp + 3;
  const deteriorationRiskIncreasePct = heatwaveActive ? 48 : 34;

  const advisory = `Harvest today because tomorrow's forecast (${tomorrowForecastTemp}°C + 85% RH) increases expected post-harvest deterioration by ${deteriorationRiskIncreasePct}%. Immediate pre-dawn harvest preserves 2.8 additional shelf-life days.`;

  return {
    ambientForecastTempC: tomorrowForecastTemp,
    relativeHumidityPct: 82,
    rainfallProbabilityPct: rainRisk ? 75 : 15,
    heatwaveActive,
    coldWaveActive: false,
    harvestAdvisory: advisory,
    deteriorationRiskIncreasePct,
  };
}

/**
 * Packaging Intelligence Evaluator
 */
export function getPackagingIntelligence(
  selectedType: string = 'VENTILATED_PLASTIC_CRATE'
): PackagingIntelligence {
  const comparison = [
    {
      type: 'Traditional Wooden Crate',
      expectedShelfLifeDays: 2.4,
      bruiseRiskPct: 18.5,
      costPerCrateInr: 35,
      recommended: false,
    },
    {
      type: 'Corrugated Cardboard Box',
      expectedShelfLifeDays: 3.2,
      bruiseRiskPct: 9.8,
      costPerCrateInr: 45,
      recommended: false,
    },
    {
      type: 'Ventilated Plastic Crate',
      expectedShelfLifeDays: 4.8,
      bruiseRiskPct: 4.2,
      costPerCrateInr: 120, // Reusable amortized ~₹8/trip
      recommended: true,
    },
    {
      type: 'Modified Atmosphere Packaging (MAP Film)',
      expectedShelfLifeDays: 7.2,
      bruiseRiskPct: 1.2,
      costPerCrateInr: 160,
      recommended: false,
    },
  ];

  return {
    currentPackaging: selectedType,
    comparison,
    recommendation: 'Ventilated Plastic Crate delivers optimal cost-to-shelf-life ratio (+2.4 days over wooden crates, reducing mechanical vibration bruising to under 4.2%).',
  };
}

/**
 * Initial Operational Broadcast Alerts (WhatsApp & Push)
 */
export const INITIAL_OPERATIONAL_ALERTS: OperationalAlert[] = [
  {
    id: 'alert-01',
    timestamp: '2026-10-08 08:42 AM',
    type: 'COLD_CHAIN_BREACH',
    severity: 'CRITICAL',
    title: '🚨 Reefer Temp Excursion Warning',
    message: 'Reefer Truck KA-04-E-8821 exceeded 12°C threshold (currently 14.8°C for 3.2 hours). Accelerating kinetic decay.',
    batchId: 'CRATE-TOM-8821',
    actionLabel: 'Check Reefer Telemetry',
  },
  {
    id: 'alert-02',
    timestamp: '2026-10-08 08:15 AM',
    type: 'EXPIRY_WARNING',
    severity: 'WARNING',
    title: '⚠️ Shelf Life Below 48 Hours',
    message: 'Batch CRATE-4892 shelf-life dropped below 48 hours. Dynamic Pricing Engine triggered 18% flash markdown on Zepto/Blinkit.',
    batchId: 'BATCH CRATE-4892',
    actionLabel: 'View Pricing Optimizer',
  },
  {
    id: 'alert-03',
    timestamp: '2026-10-08 07:30 AM',
    type: 'SUPPLIER_RISK',
    severity: 'WARNING',
    title: '🔴 Supplier Risk Alert',
    message: 'Deccan Organic FPO exhibits 37% rejection probability for upcoming transit batch. Recommend pre-dispatch dock inspection.',
    actionLabel: 'Inspect Scorecard',
  },
  {
    id: 'alert-04',
    timestamp: '2026-10-08 06:00 AM',
    type: 'DISPATCH_READY',
    severity: 'SUCCESS',
    title: '🟢 182 Batches Ready for Dispatch',
    message: 'Nashik Agro Cluster completed automated optical gate with 95% Grade A yield. Cleared for dark store routing.',
    actionLabel: 'View Routing Map',
  },
];
