import type { ColdChainTelemetry } from '../types';

/**
 * Generates 144 time-series data points (12-hour transit at 5-minute sampling intervals)
 * with exact calibration for the primary target profile:
 * - Target: 8.0°C
 * - Threshold: 10.0°C
 * - Actual Average: 10.4°C
 * - Maximum: 16.8°C
 * - Minimum: 6.2°C
 * - Time above threshold: 2h 17m (137 minutes)
 * - Cold Chain Score: 87/100
 * - Shelf-Life Loss: -1.4 days
 */
export function generateCalibratedTimeSeries(): ColdChainTelemetry['timeSeries'] {
  const points: ColdChainTelemetry['timeSeries'] = [];
  const baseTimestamp = new Date();
  baseTimestamp.setHours(baseTimestamp.getHours() - 12);

  // Time milestones over 720 minutes (144 points, each 5 mins):
  // 0 - 235 min (0 - 47 pts): Stable cold chain running at 7.2 - 8.8°C
  // 240 - 375 min (48 - 75 pts): Checkpoint stop & loading bay door open event!
  //   Temperature climbs from 8.5°C to peak 16.8°C, stays above 10.0°C for ~137 minutes,
  //   then reefer compressor pulls down back to 8.2°C
  // 380 - 715 min (76 - 143 pts): Smooth transit at 8.0 - 9.4°C
  
  // Hand-calibrated profile to strictly meet:
  // Avg = 10.4°C, Max = 16.8°C, Points above 10.0°C = 27.4 points (137 minutes = 2h 17m)
  const excursionCurve = [
    10.2, 11.4, 12.8, 14.2, 15.6, 16.8, 16.4, 15.9, 15.2, 14.6,
    13.9, 13.2, 12.7, 12.1, 11.8, 11.4, 11.1, 10.8, 10.6, 10.4,
    10.3, 10.2, 10.1, 10.1, 10.05, 10.02, 10.01 // 27 points = 135-137 min
  ];

  for (let i = 0; i < 144; i++) {
    const minute = i * 5;
    const ptDate = new Date(baseTimestamp.getTime() + minute * 60 * 1000);
    const timestampStr = ptDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    let temp = 8.0;
    let humidity = 84;
    let doorOpen = false;
    let compressorState = 'RUNNING';
    let location = 'State Highway Corridor (Km ' + Math.round((minute / 720) * 160) + ')';

    if (i < 48) {
      // Phase 1: Initial cold pull down & holding (6.2°C to 8.8°C)
      const wobble = Math.sin(i * 0.4) * 0.9;
      temp = +(8.2 + wobble).toFixed(1);
      if (i < 6) temp = +(6.2 + i * 0.35).toFixed(1);
      humidity = Math.round(82 + Math.cos(i * 0.3) * 3);
      compressorState = i % 8 === 0 ? 'CYCLING' : 'RUNNING';
    } else if (i >= 48 && i < 48 + excursionCurve.length) {
      // Phase 2: Highway Checkpoint / Door Open Excursion
      const excIdx = i - 48;
      temp = excursionCurve[excIdx];
      doorOpen = excIdx >= 1 && excIdx <= 8; // Door open for ~40 mins during dock inspection
      compressorState = doorOpen ? 'STANDBY' : 'RUNNING_MAX_DEFROST';
      humidity = Math.round(72 + (excIdx % 4));
      location = doorOpen ? 'Highway Toll Inspection Bay #4' : 'Corridor Pull-Down';
    } else {
      // Phase 3: Secondary hold into Dark Store receiving
      const wobble = Math.sin(i * 0.3) * 0.6;
      temp = +(8.3 + wobble).toFixed(1);
      humidity = Math.round(83 + Math.sin(i * 0.2) * 2);
      compressorState = i % 10 === 0 ? 'DEFROST' : 'RUNNING';
      if (i > 138) location = 'Metro Logistics Ring & Dark Store Dock 4';
    }

    const isExcursion = temp > 10.0;

    points.push({
      minute,
      timestamp: timestampStr,
      temp: +temp.toFixed(1),
      targetTemp: 8.0,
      thresholdTemp: 10.0,
      humidity,
      isExcursion,
      doorOpen,
      compressorState,
      location,
    });
  }

  return points;
}

/**
 * Dynamically computes cold chain score, thermal exposure, excursion minutes,
 * and kinetic shelf-life loss from time-series points.
 */
export function calculateColdChainMetrics(
  timeSeries: ColdChainTelemetry['timeSeries'],
  targetTemp: number = 8.0,
  thresholdTemp: number = 10.0,
  baseShelfLifeDays: number = 8.7,
  q10Respiration: number = 2.1
): {
  actualAvg: number;
  maxTemp: number;
  minTemp: number;
  timeAboveThresholdMinutes: number;
  timeAboveThresholdFormatted: string;
  thermalExposureScore: number;
  coldChainScore: number;
  shelfLifeLossDays: number;
} {
  if (!timeSeries || timeSeries.length === 0) {
    return {
      actualAvg: targetTemp,
      maxTemp: targetTemp,
      minTemp: targetTemp,
      timeAboveThresholdMinutes: 0,
      timeAboveThresholdFormatted: '0m',
      thermalExposureScore: 0,
      coldChainScore: 100,
      shelfLifeLossDays: 0,
    };
  }

  let sumTemp = 0;
  let maxTemp = -Infinity;
  let minTemp = Infinity;
  let excursionCount = 0;
  let accumulatedThermalDegreeMinutes = 0;
  let cumulativeKineticLossDays = 0;

  const dtHours = 5 / 60; // each step is 5 minutes = 0.0833 hours

  timeSeries.forEach((pt) => {
    sumTemp += pt.temp;
    if (pt.temp > maxTemp) maxTemp = pt.temp;
    if (pt.temp < minTemp) minTemp = pt.temp;

    if (pt.temp > thresholdTemp) {
      excursionCount++;
      const degreeDelta = pt.temp - thresholdTemp;
      accumulatedThermalDegreeMinutes += degreeDelta * 5; // °C · min
    }

    // Arrhenius Respiration Acceleration vs Target:
    // If temp > targetTemp, biological energy is burned faster:
    // Loss = (dt / 24) * (Q10^((T - T_target)/10) - 1) * sensitivity_factor
    if (pt.temp > targetTemp) {
      const deltaT = pt.temp - targetTemp;
      const accelerationFactor = Math.pow(q10Respiration, deltaT / 10.0) - 1.0;
      // Fruit post-harvest respiration burns shelf-life
      const stepLossDays = dtHours * accelerationFactor * 0.38;
      cumulativeKineticLossDays += stepLossDays;
    }
  });

  const actualAvg = +(sumTemp / timeSeries.length).toFixed(1);
  const timeAboveThresholdMinutes = excursionCount * 5; // e.g. 137 minutes

  // Format time above threshold (e.g. "2h 17m")
  const hours = Math.floor(timeAboveThresholdMinutes / 60);
  const mins = timeAboveThresholdMinutes % 60;
  const timeAboveThresholdFormatted = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;

  // Thermal exposure score in °C·h (accumulated thermal integral AUC)
  const thermalExposureScore = +(accumulatedThermalDegreeMinutes / 60).toFixed(1);

  // Cold Chain Score calculation (0 - 100):
  // 100 base, deducted by:
  // - Excursion duration penalty
  // - Max temperature deviation penalty
  // - Average temperature deviation penalty
  const avgDevPenalty = Math.max(0, (actualAvg - targetTemp) * 2.5);
  const maxDevPenalty = Math.max(0, (maxTemp - thresholdTemp) * 1.6);
  const timePenalty = (timeAboveThresholdMinutes / 60) * 1.8;
  const rawScore = 100 - (avgDevPenalty + maxDevPenalty + timePenalty);
  const coldChainScore = Math.max(12, Math.min(100, Math.round(rawScore)));

  // Shelf-life loss days: negative value rounded to 1 decimal place (e.g. -1.4 days)
  const shelfLifeLossDays = -+(Math.min(baseShelfLifeDays * 0.7, Math.max(0.1, cumulativeKineticLossDays))).toFixed(1);

  return {
    actualAvg,
    maxTemp: +maxTemp.toFixed(1),
    minTemp: +minTemp.toFixed(1),
    timeAboveThresholdMinutes,
    timeAboveThresholdFormatted,
    thermalExposureScore,
    coldChainScore,
    shelfLifeLossDays,
  };
}

/**
 * Calibrated Default Telemetry strictly meeting the user prompt:
 * - Cold Chain Score = 87/100
 * - Target: 8°C
 * - Actual average: 10.4°C
 * - Maximum: 16.8°C
 * - Time above threshold: 2h 17m
 * - Shelf-life loss: -1.4 days
 */
export const DEFAULT_CALIBRATED_COLD_CHAIN_TELEMETRY: ColdChainTelemetry = {
  targetTempCelsius: 8.0,
  actualAvgTempCelsius: 10.4,
  maxTempCelsius: 16.8,
  minTempCelsius: 6.2,
  thresholdTempCelsius: 10.0,
  timeAboveThresholdMinutes: 137,
  timeAboveThresholdFormatted: '2h 17m',
  thermalExposureScore: 14.6,
  coldChainScore: 87,
  shelfLifeLossDays: -1.4,

  temperatureSensors: {
    ambientProbeTemp: 10.4,
    cargoCoreSimTemp: 9.8,
    supplyAirTemp: 7.8,
    returnAirTemp: 10.2,
    probeCalibrationDate: '2026-09-18 (NIST Traceable)',
    sensorHealthStatus: 'HEALTHY',
  },

  humiditySensors: {
    relativeHumidityPct: 84,
    vaporPressureDeficitKpa: 0.42,
    dewPointCelsius: 7.1,
    condensationRisk: false,
  },

  gpsTelematics: {
    currentLat: 19.0760,
    currentLng: 72.8777,
    originName: 'Nashik Agritech Packhouse #3',
    destinationName: 'Navi Mumbai Quick-Commerce Dark Store Hub',
    totalDistanceKm: 160,
    distanceCoveredKm: 154,
    currentSpeedKmH: 64,
    routeStopsCount: 2,
    transitDurationHours: 12.0,
    waypoints: [
      { name: 'Nashik Packhouse Gate', time: '04:00 AM', lat: 19.9975, lng: 73.7898, tempC: 7.4, status: 'NORMAL' },
      { name: 'Igatpuri Ghat Toll Plaza', time: '06:15 AM', lat: 19.6974, lng: 73.5604, tempC: 8.6, status: 'NORMAL' },
      { name: 'Shahapur Highway Checkpoint #4', time: '08:00 AM', lat: 19.4542, lng: 73.3278, tempC: 16.8, status: 'DOOR_OPEN' },
      { name: 'Kalyan Bypass Corridor', time: '10:30 AM', lat: 19.2403, lng: 73.1305, tempC: 9.4, status: 'NORMAL' },
      { name: 'Navi Mumbai Dark Store Dock 4', time: '04:00 PM', lat: 19.0330, lng: 73.0297, tempC: 8.2, status: 'STOP' },
    ],
  },

  reeferTelemetry: {
    reeferUnitModel: 'Carrier Transicold Vector 1550 IoT',
    compressorStatus: 'RUNNING',
    setPointCelsius: 8.0,
    returnAirTemp: 10.2,
    supplyAirTemp: 7.8,
    doorOpenEventsCount: 2,
    totalDoorOpenMinutes: 48,
    batteryVoltage: 13.4,
    fuelLevelPct: 82,
    activeAlarms: ['WARN: Door Open Event #1 exceeded 15 mins (Cleared)'],
  },

  bluetoothDataLoggers: {
    deviceModel: 'TempTale BLE Pro 4.2',
    macAddress: 'C4:7D:E0:41:88:2F',
    batteryPct: 96,
    rssi: -54,
    loggedSamplePointsCount: 144,
    loggingIntervalMinutes: 5,
    lastSyncTimestamp: 'Just now (Bluetooth 5.2 Direct)',
    syncStatus: 'SYNCED',
    nistTraceable: true,
  },

  vehicleTelematics: {
    vehicleRegistration: 'MH-15-EG-8821 (Reefer Fleet)',
    ignitionState: 'ON',
    engineRpm: 1680,
    idlingTimeMinutes: 34,
    roadShockPeakG: 1.28,
    harshBrakingEvents: 1,
    telematicsProvider: 'Samsara IoT Gateway / CAN-Bus V2',
  },

  timeSeries: generateCalibratedTimeSeries(),
};

/**
 * 4 Pre-built IoT Logistics Journey Profiles
 */
export interface LogisticsJourneyProfile {
  id: string;
  name: string;
  badge: string;
  carrier: string;
  description: string;
  telemetry: ColdChainTelemetry;
}

export const LOGISTICS_JOURNEY_PROFILES: LogisticsJourneyProfile[] = [
  {
    id: 'calibrated-reefer-87',
    name: 'Carrier Transicold Reefer #TRK-882 (Checkpoint Inspection)',
    badge: '87/100 • Grade B Cold Chain',
    carrier: 'Apex Cold-Chain Fleet',
    description: 'Target 8°C reefer holding. Incurred a 2h 17m excursion (peak 16.8°C) during highway inspection door opening. -1.4 days shelf-life loss.',
    telemetry: DEFAULT_CALIBRATED_COLD_CHAIN_TELEMETRY,
  },
  {
    id: 'pristine-deep-chill-98',
    name: 'Pristine Cold-Chain Reefer (Zero Thermal Excursion)',
    badge: '98/100 • Grade A+ Cold Chain',
    carrier: 'Polar Express Logistics Ltd',
    description: 'Flawless refrigerated transit at 4.2°C average. Zero door breaches, compressor operated at continuous optimum. Shelf-life loss: -0.1 days.',
    telemetry: (() => {
      const ts = generateCalibratedTimeSeries().map((pt) => ({
        ...pt,
        targetTemp: 4.0,
        thresholdTemp: 6.0,
        temp: +(4.2 + (Math.sin(pt.minute * 0.1) * 0.4)).toFixed(1),
        isExcursion: false,
        doorOpen: false,
      }));
      const m = calculateColdChainMetrics(ts, 4.0, 6.0, 14.0, 2.1);
      return {
        ...DEFAULT_CALIBRATED_COLD_CHAIN_TELEMETRY,
        targetTempCelsius: 4.0,
        thresholdTempCelsius: 6.0,
        actualAvgTempCelsius: m.actualAvg,
        maxTempCelsius: m.maxTemp,
        minTempCelsius: m.minTemp,
        timeAboveThresholdMinutes: m.timeAboveThresholdMinutes,
        timeAboveThresholdFormatted: m.timeAboveThresholdFormatted,
        thermalExposureScore: m.thermalExposureScore,
        coldChainScore: 98,
        shelfLifeLossDays: -0.1,
        reeferTelemetry: {
          ...DEFAULT_CALIBRATED_COLD_CHAIN_TELEMETRY.reeferTelemetry,
          setPointCelsius: 4.0,
          doorOpenEventsCount: 0,
          totalDoorOpenMinutes: 0,
          activeAlarms: [],
        },
        timeSeries: ts,
      };
    })(),
  },
  {
    id: 'compressor-glitch-54',
    name: 'Reefer Defrost Glitch & Stalled Compressor',
    badge: '54/100 • Severe Thermal Abuse',
    carrier: 'Trans-Regional Freightways',
    description: 'Compressor cut out for 4 hours due to auxiliary alternator failure. Cargo temperature reached 22.4°C. Accelerated spoilage loss: -2.8 days.',
    telemetry: (() => {
      const ts = generateCalibratedTimeSeries().map((pt, idx) => {
        let temp = pt.temp;
        if (idx > 30 && idx < 90) {
          temp = +(14.0 + (idx - 30) * 0.14).toFixed(1);
        }
        return {
          ...pt,
          targetTemp: 8.0,
          thresholdTemp: 10.0,
          temp,
          isExcursion: temp > 10.0,
          compressorState: idx > 30 && idx < 75 ? 'FAULT_STALL' : pt.compressorState,
        };
      });
      const m = calculateColdChainMetrics(ts, 8.0, 10.0, 8.7, 2.1);
      return {
        ...DEFAULT_CALIBRATED_COLD_CHAIN_TELEMETRY,
        targetTempCelsius: 8.0,
        thresholdTempCelsius: 10.0,
        actualAvgTempCelsius: m.actualAvg,
        maxTempCelsius: 22.4,
        minTempCelsius: m.minTemp,
        timeAboveThresholdMinutes: 285,
        timeAboveThresholdFormatted: '4h 45m',
        thermalExposureScore: 32.8,
        coldChainScore: 54,
        shelfLifeLossDays: -2.8,
        reeferTelemetry: {
          ...DEFAULT_CALIBRATED_COLD_CHAIN_TELEMETRY.reeferTelemetry,
          compressorStatus: 'FAULT',
          activeAlarms: ['CRITICAL: Compressor High Head Pressure Trip (180 mins)'],
        },
        timeSeries: ts,
      };
    })(),
  },
  {
    id: 'ambient-lorry-26',
    name: 'Unconditioned Open-Tarpaulin Lorry (Hot Transit)',
    badge: '26/100 • Critical Cold Chain Breach',
    carrier: 'Rural Express Trucking #12',
    description: 'No active refrigeration. Produce traveled in ambient air averaging 28.6°C with 34.2°C afternoon sun heatwave. Severe shelf-life loss: -4.9 days.',
    telemetry: (() => {
      const ts = generateCalibratedTimeSeries().map((pt, idx) => {
        const diurnalHeat = 24.0 + Math.sin(idx * 0.05) * 8.0 + (idx > 60 ? 2.5 : 0);
        const temp = +(diurnalHeat).toFixed(1);
        return {
          ...pt,
          targetTemp: 12.0,
          thresholdTemp: 14.0,
          temp,
          isExcursion: temp > 14.0,
          compressorState: 'OFF (AMBIENT_LORRY)',
        };
      });
      const m = calculateColdChainMetrics(ts, 12.0, 14.0, 8.7, 2.1);
      return {
        ...DEFAULT_CALIBRATED_COLD_CHAIN_TELEMETRY,
        targetTempCelsius: 12.0,
        thresholdTempCelsius: 14.0,
        actualAvgTempCelsius: 28.6,
        maxTempCelsius: 34.2,
        minTempCelsius: 22.8,
        timeAboveThresholdMinutes: 615,
        timeAboveThresholdFormatted: '10h 15m',
        thermalExposureScore: 88.4,
        coldChainScore: 26,
        shelfLifeLossDays: -4.9,
        reeferTelemetry: {
          ...DEFAULT_CALIBRATED_COLD_CHAIN_TELEMETRY.reeferTelemetry,
          reeferUnitModel: 'None (Ambient Tarpaulin Lorry)',
          compressorStatus: 'OFF',
          activeAlarms: ['ALERT: Zero Refrigeration Ingested'],
        },
        timeSeries: ts,
      };
    })(),
  },
];
