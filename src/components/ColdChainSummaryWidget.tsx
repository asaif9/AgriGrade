import React from 'react';
import {
  Thermometer,
  ShieldCheck,
  Clock,
  TrendingDown,
  Activity,
  Flame,
  Gauge,
  Bluetooth,
  ChevronRight,
  Radio,
} from 'lucide-react';
import type { ColdChainTelemetry } from '../types';

interface ColdChainSummaryWidgetProps {
  telemetry: ColdChainTelemetry;
  onOpenTelemetryStudio?: () => void;
  compact?: boolean;
}

export const ColdChainSummaryWidget: React.FC<ColdChainSummaryWidgetProps> = ({
  telemetry,
  onOpenTelemetryStudio,
  compact = false,
}) => {
  return (
    <div className="bg-stone-950/90 border border-stone-800 rounded-xl p-3.5 flex flex-col gap-3 shadow-lg">
      {/* Header with Live Status & Open Button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-cyan-950 border border-cyan-800 flex items-center justify-center text-cyan-400">
            <Radio className="w-3.5 h-3.5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-stone-100 uppercase tracking-wider">
                Dynamic Cold Chain Telemetry
              </span>
              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                Data-Driven
              </span>
            </div>
            <p className="text-[10px] text-stone-400">
              BLE Logger • Reefer • GPS • Vehicle Telematics
            </p>
          </div>
        </div>

        {onOpenTelemetryStudio && (
          <button
            onClick={onOpenTelemetryStudio}
            className="px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-[11px] font-medium flex items-center gap-1 transition-colors cursor-pointer"
          >
            <span>Telemetry Studio</span>
            <ChevronRight className="w-3 h-3 text-cyan-400" />
          </button>
        )}
      </div>

      {/* 6 Key Calculations Requested by User */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-xs font-mono">
        {/* Cold Chain Score = 87/100 */}
        <div className="bg-stone-900/90 border border-emerald-900/40 rounded-lg p-2 flex flex-col justify-between">
          <div className="text-[10px] text-stone-400 flex items-center justify-between">
            <span>Score</span>
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
          </div>
          <div className="mt-1 flex items-baseline gap-0.5">
            <span className="text-lg font-bold text-white">
              {telemetry.coldChainScore}
            </span>
            <span className="text-[10px] text-stone-400">/100</span>
          </div>
          <span className="text-[9px] text-emerald-400 font-sans">
            {telemetry.coldChainScore >= 90 ? 'Grade A' : 'Grade B Adherence'}
          </span>
        </div>

        {/* Target: 8°C */}
        <div className="bg-stone-900/90 border border-stone-800 rounded-lg p-2 flex flex-col justify-between">
          <div className="text-[10px] text-stone-400 flex items-center justify-between">
            <span>Target</span>
            <Gauge className="w-3 h-3 text-cyan-400" />
          </div>
          <div className="mt-1">
            <span className="text-lg font-bold text-cyan-300">
              {telemetry.targetTempCelsius}°C
            </span>
          </div>
          <span className="text-[9px] text-stone-500 font-sans">Reefer Setpoint</span>
        </div>

        {/* Actual Average: 10.4°C */}
        <div className="bg-stone-900/90 border border-stone-800 rounded-lg p-2 flex flex-col justify-between">
          <div className="text-[10px] text-stone-400 flex items-center justify-between">
            <span>Actual Avg</span>
            <Thermometer className="w-3 h-3 text-amber-400" />
          </div>
          <div className="mt-1">
            <span className="text-lg font-bold text-amber-300">
              {telemetry.actualAvgTempCelsius}°C
            </span>
          </div>
          <span className="text-[9px] text-stone-500 font-sans">144 samples (12h)</span>
        </div>

        {/* Maximum: 16.8°C */}
        <div className="bg-stone-900/90 border border-stone-800 rounded-lg p-2 flex flex-col justify-between">
          <div className="text-[10px] text-stone-400 flex items-center justify-between">
            <span>Maximum</span>
            <Flame className="w-3 h-3 text-rose-400" />
          </div>
          <div className="mt-1">
            <span className="text-lg font-bold text-rose-400">
              {telemetry.maxTempCelsius}°C
            </span>
          </div>
          <span className="text-[9px] text-rose-400/80 font-sans">Door Open Peak</span>
        </div>

        {/* Time above threshold: 2h 17m */}
        <div className="bg-stone-900/90 border border-stone-800 rounded-lg p-2 flex flex-col justify-between">
          <div className="text-[10px] text-stone-400 flex items-center justify-between">
            <span>Above Thresh</span>
            <Clock className="w-3 h-3 text-amber-400" />
          </div>
          <div className="mt-1">
            <span className="text-base font-bold text-amber-300">
              {telemetry.timeAboveThresholdFormatted}
            </span>
          </div>
          <span className="text-[9px] text-stone-500 font-sans">&gt; {telemetry.thresholdTempCelsius}°C</span>
        </div>

        {/* Shelf-life loss: -1.4 days */}
        <div className="bg-stone-900/90 border border-rose-900/50 rounded-lg p-2 flex flex-col justify-between">
          <div className="text-[10px] text-rose-300 flex items-center justify-between">
            <span>Shelf-Life Loss</span>
            <TrendingDown className="w-3 h-3 text-rose-400" />
          </div>
          <div className="mt-1">
            <span className="text-lg font-bold text-rose-400">
              {telemetry.shelfLifeLossDays}
            </span>
            <span className="text-[10px] text-rose-300 ml-0.5">days</span>
          </div>
          <span className="text-[9px] text-rose-400 font-sans">Arrhenius Kinetic Cut</span>
        </div>
      </div>

      {/* Sensor Ingestion Badge Footer */}
      {!compact && (
        <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono text-stone-400 pt-1 border-t border-stone-800/80">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              BLE Logger: {telemetry.bluetoothDataLoggers.deviceModel}
            </span>
            <span className="text-stone-500">•</span>
            <span>Reefer: {telemetry.reeferTelemetry.reeferUnitModel}</span>
            <span className="text-stone-500">•</span>
            <span>GPS: {telemetry.gpsTelematics.totalDistanceKm} km corridor</span>
          </div>
          <span className="text-cyan-400">
            Thermal Exposure: {telemetry.thermalExposureScore} °C·h
          </span>
        </div>
      )}
    </div>
  );
};
