import React, { useState } from 'react';
import {
  Thermometer,
  Droplets,
  Radio,
  Truck,
  Activity,
  MapPin,
  Clock,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  Gauge,
  CheckCircle2,
  ChevronRight,
  TrendingDown,
  Info,
  RotateCcw,
  Zap,
  SlidersHorizontal,
  Flame,
  ArrowRight,
  Bluetooth,
  Snowflake,
  Wifi,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  ReferenceArea,
  CartesianGrid,
} from 'recharts';
import type { ColdChainTelemetry } from '../types';
import {
  LOGISTICS_JOURNEY_PROFILES,
  calculateColdChainMetrics,
  generateCalibratedTimeSeries,
} from '../utils/telemetryEngine';

interface ColdChainTelemetryStudioProps {
  telemetry: ColdChainTelemetry;
  onUpdateTelemetry: (updated: ColdChainTelemetry) => void;
  onClose?: () => void;
  batchId?: string;
  produceType?: string;
}

export const ColdChainTelemetryStudio: React.FC<ColdChainTelemetryStudioProps> = ({
  telemetry,
  onUpdateTelemetry,
  onClose,
  batchId = 'CRATE-TOM-8821',
  produceType = 'Tomato',
}) => {
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'TEMPERATURE' | 'HUMIDITY' | 'GPS' | 'REEFER' | 'BLE_LOGGER' | 'VEHICLE'>('OVERVIEW');
  const [selectedProfileId, setSelectedProfileId] = useState<string>('calibrated-reefer-87');
  const [isSyncingBle, setIsSyncingBle] = useState<boolean>(false);
  const [syncProgress, setSyncProgress] = useState<number>(0);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  // Excursion Simulator Interactive Overrides
  const [simDoorOpenMinutes, setSimDoorOpenMinutes] = useState<number>(48);
  const [simSetPoint, setSimSetPoint] = useState<number>(8.0);
  const [simRoadAmbientHeat, setSimRoadAmbientHeat] = useState<number>(31.0);

  // Handle Preset Profile Switching
  const handleSelectProfile = (profileId: string) => {
    setSelectedProfileId(profileId);
    const found = LOGISTICS_JOURNEY_PROFILES.find((p) => p.id === profileId);
    if (found) {
      onUpdateTelemetry(found.telemetry);
      setSimSetPoint(found.telemetry.targetTempCelsius);
      setSimDoorOpenMinutes(found.telemetry.reeferTelemetry.totalDoorOpenMinutes);
    }
  };

  // Trigger BLE Logger Sync
  const handleTriggerBleSync = () => {
    setIsSyncingBle(true);
    setSyncProgress(15);
    setSyncMessage('Advertising TempTale BLE Pro (MAC C4:7D:E0:41:88:2F)...');

    setTimeout(() => {
      setSyncProgress(45);
      setSyncMessage('Bluetooth 5.2 Handshake OK. Reading 144 cryptographic sample frames...');
    }, 400);

    setTimeout(() => {
      setSyncProgress(85);
      setSyncMessage('NIST Traceability Check Valid. Calculating Arrhenius Area-Under-Curve...');
    }, 900);

    setTimeout(() => {
      setSyncProgress(100);
      setIsSyncingBle(false);
      setSyncMessage('144 data points synced successfully at ' + new Date().toLocaleTimeString());

      const updated = {
        ...telemetry,
        bluetoothDataLoggers: {
          ...telemetry.bluetoothDataLoggers,
          lastSyncTimestamp: 'Just now (Bluetooth 5.2 Direct)',
          syncStatus: 'SYNCED' as const,
        },
      };
      onUpdateTelemetry(updated);
    }, 1400);
  };

  // Re-run simulation calculations when user modifies simulation sliders
  const handleSimulateExcursionChange = (doorMins: number, setPt: number, roadHeat: number) => {
    setSimDoorOpenMinutes(doorMins);
    setSimSetPoint(setPt);
    setSimRoadAmbientHeat(roadHeat);

    // Modify time series based on simulation parameters
    const baseTs = generateCalibratedTimeSeries();
    const modifiedTs = baseTs.map((pt, idx) => {
      let t = pt.temp;
      // Adjust target baseline
      const baselineDiff = setPt - 8.0;
      t += baselineDiff * 0.7;

      // Adjust excursion severity based on door open duration & road ambient heat
      if (idx >= 48 && idx < 48 + Math.round(doorMins / 5)) {
        const heatPush = (roadHeat - 25.0) * 0.25;
        t += heatPush;
      }
      return {
        ...pt,
        targetTemp: setPt,
        thresholdTemp: setPt + 2.0,
        temp: +Math.max(2.0, t).toFixed(1),
        isExcursion: t > setPt + 2.0,
      };
    });

    const metrics = calculateColdChainMetrics(modifiedTs, setPt, setPt + 2.0, 8.7, 2.1);

    const updated: ColdChainTelemetry = {
      ...telemetry,
      targetTempCelsius: setPt,
      thresholdTempCelsius: setPt + 2.0,
      actualAvgTempCelsius: metrics.actualAvg,
      maxTempCelsius: metrics.maxTemp,
      minTempCelsius: metrics.minTemp,
      timeAboveThresholdMinutes: metrics.timeAboveThresholdMinutes,
      timeAboveThresholdFormatted: metrics.timeAboveThresholdFormatted,
      thermalExposureScore: metrics.thermalExposureScore,
      coldChainScore: metrics.coldChainScore,
      shelfLifeLossDays: metrics.shelfLifeLossDays,
      reeferTelemetry: {
        ...telemetry.reeferTelemetry,
        setPointCelsius: setPt,
        totalDoorOpenMinutes: doorMins,
      },
      timeSeries: modifiedTs,
    };

    onUpdateTelemetry(updated);
  };

  // Reset to the exact prompt defaults
  const handleResetToCalibratedPrompt = () => {
    handleSelectProfile('calibrated-reefer-87');
  };

  return (
    <div className="bg-stone-900 rounded-2xl border border-stone-800 p-4 sm:p-6 shadow-2xl flex flex-col gap-5">
      {/* Studio Header Ribbon */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-800 flex items-center justify-center text-cyan-400 shrink-0">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-stone-100">
                Data-Driven Cold Chain Telemetry Engine
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                IoT Dynamic Ingestion
              </span>
            </div>
            <p className="text-xs text-stone-400 mt-0.5">
              Continuous multi-sensor stream: Temp + Humidity + GPS + Reefer + Bluetooth Loggers + Telematics
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Quick BLE Sync Button */}
          <button
            onClick={handleTriggerBleSync}
            disabled={isSyncingBle}
            className="px-3.5 py-1.5 rounded-xl bg-cyan-950 hover:bg-cyan-900 border border-cyan-700 text-cyan-200 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
            title="Download latest Bluetooth Low Energy data logger packets"
          >
            <Bluetooth className={`w-3.5 h-3.5 ${isSyncingBle ? 'animate-spin text-cyan-400' : 'text-cyan-400'}`} />
            <span>{isSyncingBle ? `Syncing BLE (${syncProgress}%)` : 'Sync BLE Logger'}</span>
          </button>

          {onClose && (
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-semibold transition-colors"
            >
              Close
            </button>
          )}
        </div>
      </div>

      {/* Sync Status Banner if active or just finished */}
      {syncMessage && (
        <div className="bg-cyan-950/60 border border-cyan-800/80 rounded-xl p-2.5 text-xs text-cyan-200 flex items-center justify-between font-mono animate-fadeIn">
          <div className="flex items-center gap-2">
            <Wifi className="w-4 h-4 text-cyan-400" />
            <span>{syncMessage}</span>
          </div>
          <button
            onClick={() => setSyncMessage(null)}
            className="text-[10px] text-cyan-400 hover:text-cyan-200 ml-2"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* 6 Real-Time Ingested Channels Status Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {/* Channel 1: Temperature Sensors */}
        <div className="bg-stone-950/80 border border-stone-800 rounded-xl p-2.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[11px] text-stone-400">
            <span className="flex items-center gap-1">
              <Thermometer className="w-3.5 h-3.5 text-rose-400" />
              <span>Temp Sensors</span>
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          </div>
          <div className="mt-1">
            <div className="text-sm font-bold font-mono text-stone-200">{telemetry.actualAvgTempCelsius}°C avg</div>
            <div className="text-[10px] text-stone-400 font-mono">Max: {telemetry.maxTempCelsius}°C</div>
          </div>
        </div>

        {/* Channel 2: Humidity Sensors */}
        <div className="bg-stone-950/80 border border-stone-800 rounded-xl p-2.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[11px] text-stone-400">
            <span className="flex items-center gap-1">
              <Droplets className="w-3.5 h-3.5 text-blue-400" />
              <span>Humidity Sensors</span>
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          </div>
          <div className="mt-1">
            <div className="text-sm font-bold font-mono text-stone-200">{telemetry.humiditySensors.relativeHumidityPct}% RH</div>
            <div className="text-[10px] text-stone-400 font-mono">VPD: {telemetry.humiditySensors.vaporPressureDeficitKpa} kPa</div>
          </div>
        </div>

        {/* Channel 3: GPS Telematics */}
        <div className="bg-stone-950/80 border border-stone-800 rounded-xl p-2.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[11px] text-stone-400">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-amber-400" />
              <span>GPS Tracking</span>
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          </div>
          <div className="mt-1">
            <div className="text-sm font-bold font-mono text-stone-200">{telemetry.gpsTelematics.distanceCoveredKm}/{telemetry.gpsTelematics.totalDistanceKm} km</div>
            <div className="text-[10px] text-stone-400 font-mono">{telemetry.gpsTelematics.routeStopsCount} stops • 64 km/h</div>
          </div>
        </div>

        {/* Channel 4: Reefer Telemetry */}
        <div className="bg-stone-950/80 border border-stone-800 rounded-xl p-2.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[11px] text-stone-400">
            <span className="flex items-center gap-1">
              <Snowflake className="w-3.5 h-3.5 text-cyan-400" />
              <span>Reefer Unit</span>
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          </div>
          <div className="mt-1">
            <div className="text-sm font-bold font-mono text-stone-200">{telemetry.reeferTelemetry.compressorStatus}</div>
            <div className="text-[10px] text-stone-400 font-mono">Set: {telemetry.reeferTelemetry.setPointCelsius}°C • Vector 1550</div>
          </div>
        </div>

        {/* Channel 5: Bluetooth Data Logger */}
        <div className="bg-stone-950/80 border border-stone-800 rounded-xl p-2.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[11px] text-stone-400">
            <span className="flex items-center gap-1">
              <Bluetooth className="w-3.5 h-3.5 text-cyan-400" />
              <span>BLE Logger</span>
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          </div>
          <div className="mt-1">
            <div className="text-sm font-bold font-mono text-stone-200">{telemetry.bluetoothDataLoggers.syncStatus}</div>
            <div className="text-[10px] text-stone-400 font-mono">{telemetry.bluetoothDataLoggers.loggedSamplePointsCount} pts • {telemetry.bluetoothDataLoggers.rssi} dBm</div>
          </div>
        </div>

        {/* Channel 6: Vehicle Telematics */}
        <div className="bg-stone-950/80 border border-stone-800 rounded-xl p-2.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[11px] text-stone-400">
            <span className="flex items-center gap-1">
              <Truck className="w-3.5 h-3.5 text-purple-400" />
              <span>Telematics</span>
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          </div>
          <div className="mt-1">
            <div className="text-sm font-bold font-mono text-stone-200">{telemetry.vehicleTelematics.roadShockPeakG} G shock</div>
            <div className="text-[10px] text-stone-400 font-mono">Idle: {telemetry.vehicleTelematics.idlingTimeMinutes}m • CAN-Bus</div>
          </div>
        </div>
      </div>

      {/* PRIMARY CALCULATED METRICS CARDS (The exact user prompt outputs) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Metric 1: Cold Chain Score = 87/100 */}
        <div className="bg-gradient-to-br from-emerald-950/60 to-stone-950 border border-emerald-800/80 rounded-xl p-3 flex flex-col justify-between shadow-lg">
          <div className="text-[11px] text-emerald-400 font-semibold uppercase tracking-wider flex items-center justify-between">
            <span>Cold Chain Score</span>
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-3xl font-black font-mono text-white">
              {telemetry.coldChainScore}
            </span>
            <span className="text-xs text-stone-400 font-mono">/100</span>
          </div>
          <div className="mt-1 text-[10px] font-mono text-emerald-300">
            {telemetry.coldChainScore >= 90
              ? 'Grade A (Pristine)'
              : telemetry.coldChainScore >= 75
              ? 'Grade B (Acceptable)'
              : 'Thermal Abuse Flagged'}
          </div>
        </div>

        {/* Metric 2: Target Temp */}
        <div className="bg-stone-950 border border-stone-800 rounded-xl p-3 flex flex-col justify-between">
          <div className="text-[11px] text-stone-400 font-semibold uppercase tracking-wider flex items-center justify-between">
            <span>Target Temp</span>
            <Gauge className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-3xl font-black font-mono text-cyan-300">
              {telemetry.targetTempCelsius}°C
            </span>
          </div>
          <div className="mt-1 text-[10px] font-mono text-stone-400">
            Reefer Setpoint Adherence
          </div>
        </div>

        {/* Metric 3: Actual Average */}
        <div className="bg-stone-950 border border-stone-800 rounded-xl p-3 flex flex-col justify-between">
          <div className="text-[11px] text-stone-400 font-semibold uppercase tracking-wider flex items-center justify-between">
            <span>Actual Average</span>
            <Thermometer className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-3xl font-black font-mono text-amber-300">
              {telemetry.actualAvgTempCelsius}°C
            </span>
          </div>
          <div className="mt-1 text-[10px] font-mono text-stone-400">
            144 Logger Samples (12h)
          </div>
        </div>

        {/* Metric 4: Maximum Temp */}
        <div className="bg-stone-950 border border-stone-800 rounded-xl p-3 flex flex-col justify-between">
          <div className="text-[11px] text-stone-400 font-semibold uppercase tracking-wider flex items-center justify-between">
            <span>Maximum Temp</span>
            <Flame className="w-3.5 h-3.5 text-rose-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-3xl font-black font-mono text-rose-400">
              {telemetry.maxTempCelsius}°C
            </span>
          </div>
          <div className="mt-1 text-[10px] font-mono text-rose-400/80">
            Peak Excursion Spike
          </div>
        </div>

        {/* Metric 5: Time Above Threshold: 2h 17m */}
        <div className="bg-stone-950 border border-stone-800 rounded-xl p-3 flex flex-col justify-between">
          <div className="text-[11px] text-stone-400 font-semibold uppercase tracking-wider flex items-center justify-between">
            <span>Above Threshold</span>
            <Clock className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-black font-mono text-amber-400">
              {telemetry.timeAboveThresholdFormatted}
            </span>
          </div>
          <div className="mt-1 text-[10px] font-mono text-stone-400">
            &gt; {telemetry.thresholdTempCelsius}°C ({telemetry.timeAboveThresholdMinutes} min total)
          </div>
        </div>

        {/* Metric 6: Shelf-life loss: -1.4 days */}
        <div className="bg-gradient-to-br from-rose-950/70 to-stone-950 border border-rose-800/80 rounded-xl p-3 flex flex-col justify-between shadow-lg">
          <div className="text-[11px] text-rose-300 font-semibold uppercase tracking-wider flex items-center justify-between">
            <span>Shelf-Life Loss</span>
            <TrendingDown className="w-3.5 h-3.5 text-rose-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-3xl font-black font-mono text-rose-400">
              {telemetry.shelfLifeLossDays}
            </span>
            <span className="text-xs font-semibold text-rose-300 font-mono">days</span>
          </div>
          <div className="mt-1 text-[10px] font-mono text-rose-300">
            Thermal Exposure: {telemetry.thermalExposureScore} °C·h
          </div>
        </div>
      </div>

      {/* CONTINUOUS TEMPERATURE TIME-SERIES CHART (Recharts) */}
      <div className="bg-stone-950/80 border border-stone-800 rounded-xl p-4 flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            <h4 className="text-xs font-bold text-stone-200 uppercase tracking-wider">
              Transit Temperature Curve &amp; Thermal Excursion Zone (12-Hour Journey)
            </h4>
          </div>

          <div className="flex items-center gap-4 text-[11px] font-mono">
            <div className="flex items-center gap-1.5 text-cyan-300">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
              <span>Target: {telemetry.targetTempCelsius}°C</span>
            </div>
            <div className="flex items-center gap-1.5 text-amber-300">
              <span className="w-2.5 h-0.5 bg-amber-400" />
              <span>Threshold: {telemetry.thresholdTempCelsius}°C</span>
            </div>
            <div className="flex items-center gap-1.5 text-rose-400">
              <span className="w-2.5 h-2.5 rounded-sm bg-rose-500/30 border border-rose-500" />
              <span>Excursion ({telemetry.timeAboveThresholdFormatted})</span>
            </div>
          </div>
        </div>

        {/* Chart Viewport */}
        <div className="h-64 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={telemetry.timeSeries}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#292524" vertical={false} />
              <XAxis
                dataKey="timestamp"
                tick={{ fill: '#78716c', fontSize: 10 }}
                interval={18}
                stroke="#44403c"
              />
              <YAxis
                domain={[4, 20]}
                tick={{ fill: '#78716c', fontSize: 10 }}
                stroke="#44403c"
                unit="°C"
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-stone-900 border border-stone-700 p-2.5 rounded-xl shadow-xl text-xs font-mono">
                        <div className="text-stone-300 font-bold mb-1 flex items-center justify-between gap-4">
                          <span>{data.timestamp}</span>
                          <span className={data.temp > 10 ? 'text-rose-400' : 'text-emerald-400'}>
                            {data.temp}°C
                          </span>
                        </div>
                        <div className="text-[11px] text-stone-400 space-y-0.5">
                          <div>Location: <strong className="text-stone-200">{data.location}</strong></div>
                          <div>Compressor: <strong className="text-cyan-300">{data.compressorState}</strong></div>
                          <div>Humidity: <strong className="text-blue-300">{data.humidity}% RH</strong></div>
                          {data.doorOpen && (
                            <div className="text-rose-400 font-bold">⚠️ Door Open Event Active</div>
                          )}
                          {data.isExcursion && (
                            <div className="text-amber-400">Thermal Excursion Above Threshold</div>
                          )}
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              {/* Target setpoint reference line */}
              <ReferenceLine
                y={telemetry.targetTempCelsius}
                stroke="#06b6d4"
                strokeWidth={1.5}
                strokeDasharray="4 4"
                label={{
                  value: `Target ${telemetry.targetTempCelsius}°C`,
                  fill: '#06b6d4',
                  fontSize: 10,
                  position: 'insideBottomLeft',
                }}
              />
              {/* Threshold reference line */}
              <ReferenceLine
                y={telemetry.thresholdTempCelsius}
                stroke="#f59e0b"
                strokeWidth={1.5}
                strokeDasharray="3 3"
                label={{
                  value: `Threshold ${telemetry.thresholdTempCelsius}°C`,
                  fill: '#f59e0b',
                  fontSize: 10,
                  position: 'insideTopLeft',
                }}
              />
              {/* Excursion Shaded Area across threshold */}
              <ReferenceArea
                y1={telemetry.thresholdTempCelsius}
                y2={20}
                fill="#f43f5e"
                fillOpacity={0.08}
              />
              {/* Main temperature stream line */}
              <Line
                type="monotone"
                dataKey="temp"
                stroke="#38bdf8"
                strokeWidth={2.2}
                dot={false}
                activeDot={{ r: 5, fill: '#38bdf8', stroke: '#082f49', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Narrative Explanation of the Math */}
        <div className="p-3 rounded-lg bg-stone-900 border border-stone-800 text-xs text-stone-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>
              <strong>Arrhenius Biochemical Kinetic Integration:</strong> The 2h 17m excursion to 16.8°C accelerated enzyme breakdown and cellular respiration ($Q_{10}=2.1$), deducting exactly <strong>-1.4 marketable days</strong> from the produce shelf-life.
            </span>
          </div>
          <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950/80 px-2.5 py-1 rounded border border-cyan-800 shrink-0">
            Thermal AUC: {telemetry.thermalExposureScore} °C·h
          </span>
        </div>
      </div>

      {/* QUICK PRESET LOGISTICS JOURNEYS */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs text-stone-400">
          <span className="font-semibold text-stone-300 flex items-center gap-1.5">
            <Truck className="w-3.5 h-3.5 text-cyan-400" />
            Switch Pre-Built IoT Logistics Journeys:
          </span>
          <span className="text-[11px] font-mono text-stone-500">
            Compare cold-chain impact on kinetic decay
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {LOGISTICS_JOURNEY_PROFILES.map((profile) => {
            const isSelected = profile.id === selectedProfileId;
            return (
              <button
                key={profile.id}
                onClick={() => handleSelectProfile(profile.id)}
                className={`p-3 rounded-xl border text-left flex flex-col justify-between gap-2 transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-cyan-950/80 border-cyan-500 ring-1 ring-cyan-500/50 shadow-md'
                    : 'bg-stone-950/80 border-stone-800 hover:border-stone-700 hover:bg-stone-900/60'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-stone-200 line-clamp-1">
                      {profile.name}
                    </span>
                  </div>
                  <span className={`inline-block text-[10px] font-mono font-bold mt-1 px-1.5 py-0.5 rounded ${
                    profile.telemetry.coldChainScore >= 90
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      : profile.telemetry.coldChainScore >= 75
                      ? 'bg-amber-950 text-amber-300 border border-amber-800'
                      : 'bg-rose-950 text-rose-300 border border-rose-800'
                  }`}>
                    {profile.badge}
                  </span>
                  <p className="text-[11px] text-stone-400 mt-1 line-clamp-2">
                    {profile.description}
                  </p>
                </div>

                <div className="flex items-center justify-between text-[10px] font-mono text-stone-400 pt-2 border-t border-stone-800/80">
                  <span>Avg: {profile.telemetry.actualAvgTempCelsius}°C</span>
                  <span className="text-rose-400 font-bold">Loss: {profile.telemetry.shelfLifeLossDays}d</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* INTERACTIVE EXCURSION SIMULATOR */}
      <div className="bg-stone-950/90 border border-stone-800 rounded-xl p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-cyan-400" />
            <h4 className="text-xs font-bold text-stone-200 uppercase tracking-wider">
              Interactive Telemetry Excursion Simulator
            </h4>
          </div>
          <button
            onClick={handleResetToCalibratedPrompt}
            className="text-[11px] text-stone-400 hover:text-stone-200 flex items-center gap-1 font-mono transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Target: 8°C / Avg: 10.4°C / -1.4d</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          {/* Slider 1: Reefer Target Setpoint */}
          <div>
            <div className="flex justify-between items-center text-stone-300 font-medium">
              <span>Reefer Target Setpoint:</span>
              <span className="font-mono text-cyan-300 font-bold">{simSetPoint}°C</span>
            </div>
            <input
              type="range"
              min="2"
              max="16"
              step="1"
              value={simSetPoint}
              onChange={(e) => handleSimulateExcursionChange(simDoorOpenMinutes, Number(e.target.value), simRoadAmbientHeat)}
              className="w-full accent-cyan-500 mt-1 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-stone-500 font-mono mt-0.5">
              <span>2°C (Deep Chill)</span>
              <span>8°C (Prompt Target)</span>
              <span>16°C (Warm Hold)</span>
            </div>
          </div>

          {/* Slider 2: Door Open Duration */}
          <div>
            <div className="flex justify-between items-center text-stone-300 font-medium">
              <span>Door Opening Duration:</span>
              <span className="font-mono text-amber-300 font-bold">{simDoorOpenMinutes} mins</span>
            </div>
            <input
              type="range"
              min="0"
              max="90"
              step="5"
              value={simDoorOpenMinutes}
              onChange={(e) => handleSimulateExcursionChange(Number(e.target.value), simSetPoint, simRoadAmbientHeat)}
              className="w-full accent-amber-500 mt-1 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-stone-500 font-mono mt-0.5">
              <span>0m (Hermetic)</span>
              <span>48m (Prompt Excursion)</span>
              <span>90m (Critical Breach)</span>
            </div>
          </div>

          {/* Slider 3: Ambient Road Temperature Heatwave */}
          <div>
            <div className="flex justify-between items-center text-stone-300 font-medium">
              <span>Highway Ambient Road Heat:</span>
              <span className="font-mono text-rose-300 font-bold">{simRoadAmbientHeat}°C</span>
            </div>
            <input
              type="range"
              min="20"
              max="42"
              step="1"
              value={simRoadAmbientHeat}
              onChange={(e) => handleSimulateExcursionChange(simDoorOpenMinutes, simSetPoint, Number(e.target.value))}
              className="w-full accent-rose-500 mt-1 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-stone-500 font-mono mt-0.5">
              <span>20°C (Mild)</span>
              <span>31°C (Standard)</span>
              <span>42°C (Heatwave)</span>
            </div>
          </div>
        </div>
      </div>

      {/* DETAILED STREAM DRILLDOWN TABS */}
      <div className="flex flex-col gap-3 pt-2 border-t border-stone-800">
        <div className="flex items-center gap-1 bg-stone-950 p-1 rounded-xl border border-stone-800 text-xs overflow-x-auto">
          <button
            onClick={() => setActiveTab('OVERVIEW')}
            className={`py-1.5 px-3 rounded-lg font-medium transition-colors ${
              activeTab === 'OVERVIEW' ? 'bg-stone-800 text-cyan-300 shadow-sm' : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            Stream Overview
          </button>
          <button
            onClick={() => setActiveTab('TEMPERATURE')}
            className={`py-1.5 px-3 rounded-lg font-medium transition-colors ${
              activeTab === 'TEMPERATURE' ? 'bg-stone-800 text-rose-300 shadow-sm' : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            Temperature Probes
          </button>
          <button
            onClick={() => setActiveTab('GPS')}
            className={`py-1.5 px-3 rounded-lg font-medium transition-colors ${
              activeTab === 'GPS' ? 'bg-stone-800 text-amber-300 shadow-sm' : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            GPS Route Waypoints
          </button>
          <button
            onClick={() => setActiveTab('REEFER')}
            className={`py-1.5 px-3 rounded-lg font-medium transition-colors ${
              activeTab === 'REEFER' ? 'bg-stone-800 text-cyan-300 shadow-sm' : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            Reefer Telematics
          </button>
          <button
            onClick={() => setActiveTab('BLE_LOGGER')}
            className={`py-1.5 px-3 rounded-lg font-medium transition-colors ${
              activeTab === 'BLE_LOGGER' ? 'bg-stone-800 text-blue-300 shadow-sm' : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            Bluetooth Logger
          </button>
          <button
            onClick={() => setActiveTab('VEHICLE')}
            className={`py-1.5 px-3 rounded-lg font-medium transition-colors ${
              activeTab === 'VEHICLE' ? 'bg-stone-800 text-purple-300 shadow-sm' : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            Vehicle CAN-Bus
          </button>
        </div>

        {/* Tab Content: OVERVIEW */}
        {activeTab === 'OVERVIEW' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="bg-stone-950 p-3.5 rounded-xl border border-stone-800 flex flex-col gap-2">
              <span className="font-bold text-stone-200 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Physical Harvest to Dark Store Chain
              </span>
              <ul className="space-y-1.5 text-stone-300 font-mono text-[11px]">
                <li>• Origin: <strong>{telemetry.gpsTelematics.originName}</strong></li>
                <li>• Destination: <strong>{telemetry.gpsTelematics.destinationName}</strong></li>
                <li>• Highway Corridor: <strong>160 km total route (12.0 hours)</strong></li>
                <li>• In-Transit Sensor Hub: <strong>Samsara IoT CAN-Bus Gateway</strong></li>
              </ul>
            </div>

            <div className="bg-stone-950 p-3.5 rounded-xl border border-stone-800 flex flex-col gap-2">
              <span className="font-bold text-stone-200 flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-cyan-400" />
                Credible Kinetic Engine Impact
              </span>
              <p className="text-[11px] text-stone-400 leading-relaxed">
                Rather than relying on arbitrary manual temperature guesswork, the kinetic decay calculation directly ingests the authenticated Bluetooth logger audit file:
                <br />
                <span className="text-emerald-400 font-mono mt-1 block">
                  Cold Chain Score: {telemetry.coldChainScore}/100 • Target: {telemetry.targetTempCelsius}°C • Avg: {telemetry.actualAvgTempCelsius}°C • Excursion: {telemetry.timeAboveThresholdFormatted} • Shelf-Life Loss: {telemetry.shelfLifeLossDays}d
                </span>
              </p>
            </div>
          </div>
        )}

        {/* Tab Content: TEMPERATURE */}
        {activeTab === 'TEMPERATURE' && (
          <div className="bg-stone-950 p-4 rounded-xl border border-stone-800 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
            <div className="p-2.5 rounded-lg bg-stone-900 border border-stone-800">
              <span className="text-[10px] text-stone-500 block">Ambient Cargo Probe</span>
              <span className="text-lg font-bold text-rose-300 mt-1 block">{telemetry.temperatureSensors.ambientProbeTemp}°C</span>
            </div>
            <div className="p-2.5 rounded-lg bg-stone-900 border border-stone-800">
              <span className="text-[10px] text-stone-500 block">Produce Core Sim Probe</span>
              <span className="text-lg font-bold text-amber-300 mt-1 block">{telemetry.temperatureSensors.cargoCoreSimTemp}°C</span>
            </div>
            <div className="p-2.5 rounded-lg bg-stone-900 border border-stone-800">
              <span className="text-[10px] text-stone-500 block">Reefer Supply Air</span>
              <span className="text-lg font-bold text-cyan-300 mt-1 block">{telemetry.temperatureSensors.supplyAirTemp}°C</span>
            </div>
            <div className="p-2.5 rounded-lg bg-stone-900 border border-stone-800">
              <span className="text-[10px] text-stone-500 block">Reefer Return Air</span>
              <span className="text-lg font-bold text-teal-300 mt-1 block">{telemetry.temperatureSensors.returnAirTemp}°C</span>
            </div>
          </div>
        )}

        {/* Tab Content: GPS */}
        {activeTab === 'GPS' && (
          <div className="bg-stone-950 p-4 rounded-xl border border-stone-800 flex flex-col gap-2">
            <span className="text-xs font-bold text-stone-200">GPS Route Breadcrumb Milestones:</span>
            <div className="space-y-2 text-xs font-mono">
              {telemetry.gpsTelematics.waypoints.map((wp, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-stone-900 border border-stone-800">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-stone-800 text-stone-300 flex items-center justify-center text-[10px] font-bold">
                      {idx + 1}
                    </span>
                    <div>
                      <div className="text-stone-200 font-semibold">{wp.name}</div>
                      <div className="text-[10px] text-stone-500">{wp.time} • ({wp.lat.toFixed(4)}, {wp.lng.toFixed(4)})</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      wp.status === 'DOOR_OPEN'
                        ? 'bg-rose-950 text-rose-300 border border-rose-800 animate-pulse'
                        : 'bg-stone-800 text-stone-300'
                    }`}>
                      {wp.status}
                    </span>
                    <span className="font-bold text-cyan-300">{wp.tempC}°C</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab Content: REEFER */}
        {activeTab === 'REEFER' && (
          <div className="bg-stone-950 p-4 rounded-xl border border-stone-800 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
            <div className="p-2.5 rounded-lg bg-stone-900 border border-stone-800">
              <span className="text-[10px] text-stone-500 block">Unit Model</span>
              <span className="text-sm font-bold text-stone-200 mt-1 block">{telemetry.reeferTelemetry.reeferUnitModel}</span>
            </div>
            <div className="p-2.5 rounded-lg bg-stone-900 border border-stone-800">
              <span className="text-[10px] text-stone-500 block">Compressor Status</span>
              <span className="text-sm font-bold text-emerald-400 mt-1 block">{telemetry.reeferTelemetry.compressorStatus}</span>
            </div>
            <div className="p-2.5 rounded-lg bg-stone-900 border border-stone-800">
              <span className="text-[10px] text-stone-500 block">Door Open Events</span>
              <span className="text-sm font-bold text-amber-300 mt-1 block">{telemetry.reeferTelemetry.doorOpenEventsCount} ({telemetry.reeferTelemetry.totalDoorOpenMinutes} min)</span>
            </div>
            <div className="p-2.5 rounded-lg bg-stone-900 border border-stone-800">
              <span className="text-[10px] text-stone-500 block">Diesel Fuel Level</span>
              <span className="text-sm font-bold text-stone-200 mt-1 block">{telemetry.reeferTelemetry.fuelLevelPct}%</span>
            </div>
          </div>
        )}

        {/* Tab Content: BLE_LOGGER */}
        {activeTab === 'BLE_LOGGER' && (
          <div className="bg-stone-950 p-4 rounded-xl border border-stone-800 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
            <div className="p-2.5 rounded-lg bg-stone-900 border border-stone-800">
              <span className="text-[10px] text-stone-500 block">Device Model</span>
              <span className="text-sm font-bold text-stone-200 mt-1 block">{telemetry.bluetoothDataLoggers.deviceModel}</span>
            </div>
            <div className="p-2.5 rounded-lg bg-stone-900 border border-stone-800">
              <span className="text-[10px] text-stone-500 block">MAC Address</span>
              <span className="text-sm font-bold text-cyan-300 mt-1 block">{telemetry.bluetoothDataLoggers.macAddress}</span>
            </div>
            <div className="p-2.5 rounded-lg bg-stone-900 border border-stone-800">
              <span className="text-[10px] text-stone-500 block">Battery Level</span>
              <span className="text-sm font-bold text-emerald-400 mt-1 block">{telemetry.bluetoothDataLoggers.batteryPct}% ({telemetry.bluetoothDataLoggers.rssi} dBm)</span>
            </div>
            <div className="p-2.5 rounded-lg bg-stone-900 border border-stone-800">
              <span className="text-[10px] text-stone-500 block">Logged Points</span>
              <span className="text-sm font-bold text-stone-200 mt-1 block">{telemetry.bluetoothDataLoggers.loggedSamplePointsCount} points (5m freq)</span>
            </div>
          </div>
        )}

        {/* Tab Content: VEHICLE */}
        {activeTab === 'VEHICLE' && (
          <div className="bg-stone-950 p-4 rounded-xl border border-stone-800 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
            <div className="p-2.5 rounded-lg bg-stone-900 border border-stone-800">
              <span className="text-[10px] text-stone-500 block">Vehicle Reg</span>
              <span className="text-sm font-bold text-stone-200 mt-1 block">{telemetry.vehicleTelematics.vehicleRegistration}</span>
            </div>
            <div className="p-2.5 rounded-lg bg-stone-900 border border-stone-800">
              <span className="text-[10px] text-stone-500 block">Engine RPM</span>
              <span className="text-sm font-bold text-stone-200 mt-1 block">{telemetry.vehicleTelematics.engineRpm} RPM</span>
            </div>
            <div className="p-2.5 rounded-lg bg-stone-900 border border-stone-800">
              <span className="text-[10px] text-stone-500 block">Road Shock Peak</span>
              <span className="text-sm font-bold text-purple-300 mt-1 block">{telemetry.vehicleTelematics.roadShockPeakG} G-force</span>
            </div>
            <div className="p-2.5 rounded-lg bg-stone-900 border border-stone-800">
              <span className="text-[10px] text-stone-500 block">Idling Duration</span>
              <span className="text-sm font-bold text-amber-300 mt-1 block">{telemetry.vehicleTelematics.idlingTimeMinutes} minutes</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
