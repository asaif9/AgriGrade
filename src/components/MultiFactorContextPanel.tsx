import React, { useState } from 'react';
import {
  Activity,
  Thermometer,
  Wind,
  Gauge,
  SunMedium,
  CloudRain,
  Truck,
  Boxes,
  Zap,
  ChevronDown,
  ChevronUp,
  SlidersHorizontal,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  Radio,
  Bluetooth,
  Snowflake,
  Clock,
  TrendingDown,
  Flame,
  ChevronRight,
} from 'lucide-react';
import type {
  SensorTelemetry,
  WeatherContext,
  LogisticsContext,
  DemandAndInventoryContext,
  InspectionMode,
} from '../types';

interface MultiFactorContextPanelProps {
  mode: InspectionMode;
  sensorTelemetry: SensorTelemetry;
  weatherContext: WeatherContext;
  logisticsContext: LogisticsContext;
  demandContext: DemandAndInventoryContext;
  onUpdateSensor: (updated: Partial<SensorTelemetry>) => void;
  onUpdateWeather: (updated: Partial<WeatherContext>) => void;
  onUpdateLogistics: (updated: Partial<LogisticsContext>) => void;
  onUpdateDemand: (updated: Partial<DemandAndInventoryContext>) => void;
  onResetDefaults: () => void;
  ambientTemp: number;
  onOpenTelemetryStudio?: () => void;
}

export const MultiFactorContextPanel: React.FC<MultiFactorContextPanelProps> = ({
  mode,
  sensorTelemetry,
  weatherContext,
  logisticsContext,
  demandContext,
  onUpdateSensor,
  onUpdateWeather,
  onUpdateLogistics,
  onUpdateDemand,
  onResetDefaults,
  ambientTemp,
  onOpenTelemetryStudio,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'SENSORS' | 'WEATHER_LOGISTICS' | 'DEMAND_INVENTORY'>('SENSORS');

  const coldChain = sensorTelemetry.cold_chain;

  const hasHighRiskFactors =
    (sensorTelemetry.ethylene_ppm && sensorTelemetry.ethylene_ppm > 1.5) ||
    (sensorTelemetry.vibration_g_force && sensorTelemetry.vibration_g_force > 2.0) ||
    (coldChain && coldChain.coldChainScore < 70) ||
    weatherContext.heatwave_warning ||
    logisticsContext.road_condition === 'ROUGH_UNPAVED' ||
    demandContext.dark_store_inventory_crates > 35;

  return (
    <div className="bg-stone-900 rounded-2xl border border-stone-800 p-4 shadow-xl flex flex-col gap-3">
      {/* Panel Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-950/80 border border-emerald-800/80 flex items-center justify-center text-emerald-400">
            <SlidersHorizontal className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-bold text-stone-100 uppercase tracking-wider">
                Multi-Factor Context Engine
              </h4>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/60">
                Next-Gen Inputs
              </span>
            </div>
            <p className="text-[11px] text-stone-400">
              Sensor IoT + Weather + Logistics + Demand &amp; Inventory Runway
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {hasHighRiskFactors && (
            <span className="hidden sm:flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-800">
              <AlertTriangle className="w-3 h-3 text-amber-400" />
              <span>Risk Factor Active</span>
            </span>
          )}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-lg bg-stone-800 text-stone-400 hover:text-stone-200 transition-colors"
            title="Toggle panel collapse"
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="space-y-3 pt-1 border-t border-stone-800/80">
          {/* Sub-Tabs */}
          <div className="flex items-center gap-1 bg-stone-950 p-1 rounded-xl border border-stone-800 text-xs">
            <button
              onClick={() => setActiveTab('SENSORS')}
              className={`flex-1 py-1 px-2.5 rounded-lg font-medium flex items-center justify-center gap-1.5 transition-colors ${
                activeTab === 'SENSORS'
                  ? 'bg-stone-800 text-emerald-300 shadow-sm'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <Wind className="w-3.5 h-3.5 text-emerald-400" />
              <span>IoT Sensors</span>
              {sensorTelemetry.ethylene_ppm && sensorTelemetry.ethylene_ppm > 1.5 && (
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('WEATHER_LOGISTICS')}
              className={`flex-1 py-1 px-2.5 rounded-lg font-medium flex items-center justify-center gap-1.5 transition-colors ${
                activeTab === 'WEATHER_LOGISTICS'
                  ? 'bg-stone-800 text-amber-300 shadow-sm'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <Truck className="w-3.5 h-3.5 text-amber-400" />
              <span>Weather &amp; Route</span>
              {weatherContext.heatwave_warning && (
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('DEMAND_INVENTORY')}
              className={`flex-1 py-1 px-2.5 rounded-lg font-medium flex items-center justify-center gap-1.5 transition-colors ${
                activeTab === 'DEMAND_INVENTORY'
                  ? 'bg-stone-800 text-cyan-300 shadow-sm'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <Boxes className="w-3.5 h-3.5 text-cyan-400" />
              <span>Demand &amp; Shelf</span>
              {demandContext.dark_store_inventory_crates > 35 && (
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              )}
            </button>
          </div>

          {/* TAB 1: IOT SENSORS */}
          {activeTab === 'SENSORS' && (
            <div className="space-y-3 text-xs bg-stone-950/60 p-3 rounded-xl border border-stone-800/80">
              {/* Cold Chain Score & Excursion Highlights Card */}
              <div className="p-3 rounded-xl bg-stone-900 border border-stone-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-stone-200">
                    <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                    <span>Dynamic Cold Chain Telemetry</span>
                  </div>
                  {onOpenTelemetryStudio && (
                    <button
                      onClick={onOpenTelemetryStudio}
                      className="text-[10px] font-mono text-cyan-300 hover:text-cyan-100 flex items-center gap-0.5 bg-stone-800 hover:bg-stone-700 px-2 py-0.5 rounded transition-colors"
                    >
                      <span>Open Studio</span>
                      <ChevronRight className="w-3 h-3 text-cyan-400" />
                    </button>
                  )}
                </div>

                {/* 6 Key Telemetry Metrics */}
                <div className="grid grid-cols-3 gap-2 text-center font-mono">
                  <div className="p-1.5 rounded-lg bg-stone-950 border border-emerald-900/50">
                    <span className="text-[9px] text-stone-500 block">Cold Chain Score</span>
                    <span className="text-sm font-bold text-emerald-300">{coldChain?.coldChainScore ?? 87}/100</span>
                  </div>
                  <div className="p-1.5 rounded-lg bg-stone-950 border border-stone-800">
                    <span className="text-[9px] text-stone-500 block">Target / Avg</span>
                    <span className="text-sm font-bold text-cyan-300">{coldChain?.targetTempCelsius ?? 8}°C / {coldChain?.actualAvgTempCelsius ?? 10.4}°C</span>
                  </div>
                  <div className="p-1.5 rounded-lg bg-stone-950 border border-rose-900/50">
                    <span className="text-[9px] text-stone-500 block">Max Excursion</span>
                    <span className="text-sm font-bold text-rose-400">{coldChain?.maxTempCelsius ?? 16.8}°C</span>
                  </div>
                  <div className="p-1.5 rounded-lg bg-stone-950 border border-amber-900/50">
                    <span className="text-[9px] text-stone-500 block">Above Thresh</span>
                    <span className="text-sm font-bold text-amber-300">{coldChain?.timeAboveThresholdFormatted ?? '2h 17m'}</span>
                  </div>
                  <div className="p-1.5 rounded-lg bg-stone-950 border border-rose-900/50">
                    <span className="text-[9px] text-stone-500 block">Shelf-Life Loss</span>
                    <span className="text-sm font-bold text-rose-400">{coldChain?.shelfLifeLossDays ?? -1.4}d</span>
                  </div>
                  <div className="p-1.5 rounded-lg bg-stone-950 border border-stone-800">
                    <span className="text-[9px] text-stone-500 block">BLE Logger</span>
                    <span className="text-sm font-bold text-cyan-300">{coldChain?.bluetoothDataLoggers.syncStatus ?? 'SYNCED'}</span>
                  </div>
                </div>

                <div className="text-[10px] text-stone-400 font-mono flex items-center justify-between pt-1 border-t border-stone-800/80">
                  <span className="flex items-center gap-1 text-emerald-400">
                    <Bluetooth className="w-3 h-3 text-cyan-400" /> TempTale BLE Pro 4.2 Synced
                  </span>
                  <span>Thermal Exposure: {coldChain?.thermalExposureScore ?? 14.6} °C·h</span>
                </div>
              </div>

              {/* Ethylene PPM Sensor */}
              <div>
                <div className="flex justify-between items-center text-stone-300">
                  <span className="flex items-center gap-1.5">
                    <Wind className="w-3.5 h-3.5 text-emerald-400" />
                    <span>In-Transit Ethylene Gas (C₂H₄):</span>
                  </span>
                  <span
                    className={`font-mono font-bold ${
                      (sensorTelemetry.ethylene_ppm || 0.8) > 2.0
                        ? 'text-rose-400'
                        : (sensorTelemetry.ethylene_ppm || 0.8) > 1.2
                        ? 'text-amber-400'
                        : 'text-emerald-400'
                    }`}
                  >
                    {sensorTelemetry.ethylene_ppm || 0.8} ppm
                    {(sensorTelemetry.ethylene_ppm || 0.8) > 1.5 && ' (Accelerated Respiration)'}
                  </span>
                </div>
                <input
                  type="range"
                  min="0.2"
                  max="4.0"
                  step="0.1"
                  value={sensorTelemetry.ethylene_ppm || 0.8}
                  onChange={(e) => onUpdateSensor({ ethylene_ppm: Number(e.target.value) })}
                  className="w-full accent-emerald-500 mt-1 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-stone-500 font-mono mt-0.5">
                  <span>0.2 ppm (Basal)</span>
                  <span>1.0 ppm (Threshold)</span>
                  <span>4.0 ppm (Volatile Spike)</span>
                </div>
              </div>

              {/* Road Vibration Shock G-Force */}
              <div>
                <div className="flex justify-between items-center text-stone-300">
                  <span className="flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-cyan-400" />
                    <span>In-Transit Vibration / Shock Logger:</span>
                  </span>
                  <span
                    className={`font-mono font-bold ${
                      (sensorTelemetry.vibration_g_force || 1.1) > 2.2
                        ? 'text-rose-400'
                        : (sensorTelemetry.vibration_g_force || 1.1) > 1.5
                        ? 'text-amber-400'
                        : 'text-cyan-400'
                    }`}
                  >
                    {sensorTelemetry.vibration_g_force || 1.1} G-force
                    {(sensorTelemetry.vibration_g_force || 1.1) > 2.0 && ' (Micro-Bruise Risk)'}
                  </span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="3.5"
                  step="0.1"
                  value={sensorTelemetry.vibration_g_force || 1.1}
                  onChange={(e) => onUpdateSensor({ vibration_g_force: Number(e.target.value) })}
                  className="w-full accent-cyan-500 mt-1 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-stone-500 font-mono mt-0.5">
                  <span>0.5 G (Smooth Reefer)</span>
                  <span>1.5 G (Typical Lorry)</span>
                  <span>3.5 G (Rough Terrain)</span>
                </div>
              </div>

              {/* Relative Humidity */}
              <div className="flex justify-between items-center bg-stone-900/60 p-2 rounded-lg border border-stone-800">
                <span className="text-stone-400 flex items-center gap-1.5">
                  <Gauge className="w-3.5 h-3.5 text-blue-400" />
                  Cargo Relative Humidity:
                </span>
                <span className="font-mono font-bold text-blue-300">
                  {sensorTelemetry.humidity_pct || 78}% RH
                </span>
              </div>
            </div>
          )}

          {/* TAB 2: WEATHER & LOGISTICS */}
          {activeTab === 'WEATHER_LOGISTICS' && (
            <div className="space-y-3 text-xs bg-stone-950/60 p-3 rounded-xl border border-stone-800/80">
              {/* Heatwave Toggle */}
              <div className="flex items-center justify-between p-2 rounded-lg bg-stone-900/60 border border-stone-800">
                <div className="flex items-center gap-2">
                  <SunMedium className="w-4 h-4 text-amber-400" />
                  <div>
                    <div className="font-semibold text-stone-200">Heatwave Forecast Warning</div>
                    <div className="text-[10px] text-stone-400">
                      Ambient road transit temperatures exceeding 33°C
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onUpdateWeather({ heatwave_warning: !weatherContext.heatwave_warning })}
                  className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                    weatherContext.heatwave_warning
                      ? 'bg-rose-950 text-rose-300 border border-rose-700'
                      : 'bg-stone-800 text-stone-400 border border-stone-700'
                  }`}
                >
                  {weatherContext.heatwave_warning ? 'ACTIVE' : 'OFF'}
                </button>
              </div>

              {/* Road Condition */}
              <div>
                <div className="flex justify-between items-center text-stone-300 mb-1">
                  <span className="flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5 text-amber-400" />
                    <span>Logistics Road Corridor:</span>
                  </span>
                  <span className="font-mono text-amber-300 font-bold">
                    {logisticsContext.road_condition.replace('_', ' ')}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['SMOOTH_HIGHWAY', 'MODERATE_RURAL', 'ROUGH_UNPAVED'] as const).map((rc) => (
                    <button
                      key={rc}
                      type="button"
                      onClick={() => onUpdateLogistics({ road_condition: rc })}
                      className={`py-1.5 px-2 rounded-lg text-[10px] font-medium border text-center transition-all ${
                        logisticsContext.road_condition === rc
                          ? 'bg-amber-950/80 text-amber-300 border-amber-600'
                          : 'bg-stone-900 text-stone-400 border-stone-800 hover:text-stone-200'
                      }`}
                    >
                      {rc === 'SMOOTH_HIGHWAY' ? 'Highway' : rc === 'MODERATE_RURAL' ? 'Rural Road' : 'Unpaved Road'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Carrier SLA Rating */}
              <div className="flex justify-between items-center bg-stone-900/60 p-2 rounded-lg border border-stone-800">
                <span className="text-stone-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  Carrier Historical SLA Adherence:
                </span>
                <span className="font-mono font-bold text-emerald-400">
                  {logisticsContext.carrier_sla_rating}% (Tier 1 Reefer Fleet)
                </span>
              </div>
            </div>
          )}

          {/* TAB 3: DEMAND & INVENTORY */}
          {activeTab === 'DEMAND_INVENTORY' && (
            <div className="space-y-3 text-xs bg-stone-950/60 p-3 rounded-xl border border-stone-800/80">
              {/* Dark Store Shelf Stock */}
              <div>
                <div className="flex justify-between items-center text-stone-300">
                  <span className="flex items-center gap-1.5">
                    <Boxes className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Dark Store Shelf Stock:</span>
                  </span>
                  <span
                    className={`font-mono font-bold ${
                      demandContext.dark_store_inventory_crates > 35
                        ? 'text-cyan-300'
                        : 'text-stone-200'
                    }`}
                  >
                    {demandContext.dark_store_inventory_crates} crates
                    {demandContext.dark_store_inventory_crates > 35 && ' (High Stock Pressure)'}
                  </span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="60"
                  step="5"
                  value={demandContext.dark_store_inventory_crates}
                  onChange={(e) => onUpdateDemand({ dark_store_inventory_crates: Number(e.target.value) })}
                  className="w-full accent-cyan-500 mt-1 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-stone-500 font-mono mt-0.5">
                  <span>10 crates (Depleted)</span>
                  <span>30 crates (Balanced)</span>
                  <span>60 crates (Overstocked)</span>
                </div>
              </div>

              {/* Current Hourly Consumer Demand Rate */}
              <div>
                <div className="flex justify-between items-center text-stone-300">
                  <span className="flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    <span>Delivery Demand Velocity:</span>
                  </span>
                  <span className="font-mono font-bold text-amber-300">
                    {demandContext.current_hourly_demand_rate} crates / hr
                  </span>
                </div>
                <input
                  type="range"
                  min="1.0"
                  max="8.0"
                  step="0.5"
                  value={demandContext.current_hourly_demand_rate}
                  onChange={(e) => onUpdateDemand({ current_hourly_demand_rate: Number(e.target.value) })}
                  className="w-full accent-amber-500 mt-1 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-stone-500 font-mono mt-0.5">
                  <span>1.0 cr/h (Slow)</span>
                  <span>4.0 cr/h (Standard)</span>
                  <span>8.0 cr/h (Peak Rush)</span>
                </div>
              </div>

              {/* Dynamic Markdown & Velocity Synthesis Note */}
              <div className="p-2.5 rounded-lg bg-stone-900 border border-stone-800 text-[11px] text-stone-400">
                <div className="font-semibold text-stone-300 flex items-center gap-1 mb-0.5">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Closed-Loop Pricing Automation:</span>
                </div>
                {demandContext.dark_store_inventory_crates > 35 ? (
                  <p className="text-cyan-300">
                    High inventory depth with perishable produce automatically signals Agent 4 to recommend an automated 10-15% markdown to clear shelves before post-harvest spoilage.
                  </p>
                ) : (
                  <p>
                    Inventory levels are within optimal range. Standard Grade A catalog pricing preserved to protect gross margin.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Reset Defaults Button */}
          <div className="flex justify-end pt-1">
            <button
              onClick={onResetDefaults}
              className="text-[11px] text-stone-400 hover:text-stone-200 flex items-center gap-1 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Multi-Factor Parameters</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
