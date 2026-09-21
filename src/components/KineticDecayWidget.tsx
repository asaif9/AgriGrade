import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Activity,
  Thermometer,
  ShieldAlert,
  Sparkles,
  Snowflake,
  Sun,
  Clock,
  HelpCircle,
  Zap,
  TrendingDown,
  ThermometerSnowflake,
  Calendar,
  CloudSun,
  Droplets,
  MapPin,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  SlidersHorizontal,
} from 'lucide-react';
import type { AgriGradeReport } from '../types';
import {
  SUPPLY_REGIONS,
  getMonthlyClimate,
  detectRegionFromSupplier,
} from '../utils/seasonalClimate';

interface KineticDecayWidgetProps {
  report: AgriGradeReport;
  ambientTemp: number;
  onTempChange: (temp: number) => void;
  storageMethod: 'AMBIENT_LORRY' | 'CHILLED_REEFER';
  onStorageChange: (method: 'AMBIENT_LORRY' | 'CHILLED_REEFER') => void;
  supplierName?: string;
}

export const KineticDecayWidget: React.FC<KineticDecayWidgetProps> = ({
  report,
  ambientTemp,
  onTempChange,
  storageMethod,
  onStorageChange,
  supplierName,
}) => {
  const [showFormulaDetails, setShowFormulaDetails] = useState(false);
  const [showSeasonalDetails, setShowSeasonalDetails] = useState(false);

  // Auto-detect or select supply region
  const [selectedRegionId, setSelectedRegionId] = useState<string>(() =>
    detectRegionFromSupplier(supplierName)
  );

  // Sync region if supplierName changes
  useEffect(() => {
    if (supplierName) {
      setSelectedRegionId(detectRegionFromSupplier(supplierName));
    }
  }, [supplierName]);

  // Current calendar month (0-11, where 8 = September)
  const currentCalendarMonth = useMemo(() => new Date().getMonth(), []);
  const [selectedMonthIndex, setSelectedMonthIndex] = useState<number>(currentCalendarMonth);
  const [seasonalMultiplierEnabled, setSeasonalMultiplierEnabled] = useState<boolean>(true);

  const {
    ambient_shelf_life_days,
    cold_storage_shelf_life_days,
    ripeness_percentage,
    bruise_defect_index,
    kinetic_parameters,
  } = report;

  // Active region and monthly climate profile
  const activeRegion = useMemo(() => {
    return SUPPLY_REGIONS.find((r) => r.id === selectedRegionId) || SUPPLY_REGIONS[0];
  }, [selectedRegionId]);

  const activeClimate = useMemo(() => {
    return getMonthlyClimate(selectedRegionId, selectedMonthIndex);
  }, [selectedRegionId, selectedMonthIndex]);

  // Active seasonal multiplier applied to respiration kinetics
  const effectiveSeasonalMultiplier = seasonalMultiplierEnabled
    ? activeClimate.seasonalMultiplier
    : 1.0;

  // Real-time biochemical kinetics responding dynamically to temperature & seasonal multiplier
  const dynamicKinetics = useMemo(() => {
    const Q10 = kinetic_parameters?.q10_respiration_factor || 2.2;
    const T_ref = kinetic_parameters?.ref_temp_used || 12.0;
    const SL_base = kinetic_parameters?.base_shelf_life_days || 14.0;
    const D_bruise =
      kinetic_parameters?.bruise_penalty_applied ??
      Math.min(0.8, (bruise_defect_index / 100) * 0.9);

    const actualTemp =
      storageMethod === 'CHILLED_REEFER'
        ? Math.max(8.0, ambientTemp - 14)
        : ambientTemp;
    const tempDelta = actualTemp - T_ref;
    const tempFactor = Math.pow(Q10, -tempDelta / 10.0);
    const ripenessFactor = Math.max(0.05, 1.0 - ripeness_percentage / 100.0);

    // Adjusted life incorporating regional seasonal factor
    const rawLife =
      SL_base *
      effectiveSeasonalMultiplier *
      ripenessFactor *
      tempFactor *
      (1.0 - D_bruise);
    const days = Math.max(0.2, Math.round(rawLife * 10) / 10);

    // Baseline unadjusted shelf life (for seasonal impact delta)
    const rawUnadjustedLife =
      SL_base * 1.0 * ripenessFactor * tempFactor * (1.0 - D_bruise);
    const unadjustedDays = Math.max(0.2, Math.round(rawUnadjustedLife * 10) / 10);
    const seasonalDaysDelta = +(days - unadjustedDays).toFixed(1);

    const maxScaleDays = Math.max(
      14,
      SL_base * effectiveSeasonalMultiplier,
      cold_storage_shelf_life_days || 14
    );
    const percent = Math.min(100, Math.max(4, (days / maxScaleDays) * 100));

    // Respiration acceleration ratio relative to T_ref reference
    const respirationMultiplier = +(
      (1 / tempFactor) *
      (1 / effectiveSeasonalMultiplier)
    ).toFixed(1);

    return {
      days,
      percent,
      maxScaleDays,
      respirationMultiplier,
      tempFactor,
      unadjustedDays,
      seasonalDaysDelta,
    };
  }, [
    kinetic_parameters,
    bruise_defect_index,
    ripeness_percentage,
    ambientTemp,
    storageMethod,
    cold_storage_shelf_life_days,
    effectiveSeasonalMultiplier,
  ]);

  // Color-coded heat-map grid across potential storage variations (2°C to 30°C)
  const heatMapTemperatures = [2, 6, 10, 14, 18, 22, 26, 30];

  const heatMapData = useMemo(() => {
    const Q10 = kinetic_parameters?.q10_respiration_factor || 2.2;
    const T_ref = kinetic_parameters?.ref_temp_used || 12.0;
    const SL_base = kinetic_parameters?.base_shelf_life_days || 14.0;
    const D_bruise =
      kinetic_parameters?.bruise_penalty_applied ??
      Math.min(0.8, (bruise_defect_index / 100) * 0.9);
    const ripenessFactor = Math.max(0.05, 1.0 - ripeness_percentage / 100.0);

    return heatMapTemperatures.map((temp) => {
      const tempDelta = temp - T_ref;
      const tempFactor = Math.pow(Q10, -tempDelta / 10.0);
      const rawLife =
        SL_base *
        effectiveSeasonalMultiplier *
        ripenessFactor *
        tempFactor *
        (1.0 - D_bruise);
      const days = Math.max(0.2, Math.round(rawLife * 10) / 10);
      const hours = Math.round(days * 24);

      let tierLabel = 'Optimal';
      let tierColor = 'bg-cyan-950/70 border-cyan-700/60 text-cyan-200';
      let badgeColor = 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30';
      let hoverBorder = 'hover:border-cyan-400';

      if (temp <= 6) {
        tierLabel = 'Deep Chill';
        tierColor = 'bg-cyan-950/80 border-cyan-700/60 text-cyan-100';
        badgeColor = 'bg-cyan-500/25 text-cyan-300 border-cyan-500/40';
        hoverBorder = 'hover:border-cyan-300';
      } else if (temp <= 12) {
        tierLabel = 'Cold Chain';
        tierColor = 'bg-emerald-950/80 border-emerald-700/60 text-emerald-100';
        badgeColor = 'bg-emerald-500/25 text-emerald-300 border-emerald-500/40';
        hoverBorder = 'hover:border-emerald-300';
      } else if (temp <= 18) {
        tierLabel = 'Cool Cellar';
        tierColor = 'bg-teal-950/80 border-teal-700/60 text-teal-100';
        badgeColor = 'bg-teal-500/25 text-teal-300 border-teal-500/40';
        hoverBorder = 'hover:border-teal-300';
      } else if (temp <= 22) {
        tierLabel = 'Mild Pack';
        tierColor = 'bg-lime-950/80 border-lime-700/60 text-lime-100';
        badgeColor = 'bg-lime-500/25 text-lime-300 border-lime-500/40';
        hoverBorder = 'hover:border-lime-300';
      } else if (temp <= 26) {
        tierLabel = 'Ambient';
        tierColor = 'bg-amber-950/80 border-amber-700/60 text-amber-100';
        badgeColor = 'bg-amber-500/25 text-amber-300 border-amber-500/40';
        hoverBorder = 'hover:border-amber-300';
      } else {
        tierLabel = 'Hot Lorry';
        tierColor = 'bg-rose-950/80 border-rose-700/60 text-rose-100';
        badgeColor = 'bg-rose-500/25 text-rose-300 border-rose-500/40';
        hoverBorder = 'hover:border-rose-300';
      }

      return {
        temp,
        days,
        hours,
        tierLabel,
        tierColor,
        badgeColor,
        hoverBorder,
        isCurrent: Math.abs(ambientTemp - temp) <= 1.9,
      };
    });
  }, [
    kinetic_parameters,
    bruise_defect_index,
    ripeness_percentage,
    ambientTemp,
    effectiveSeasonalMultiplier,
  ]);

  return (
    <div className="bg-stone-900 rounded-2xl border border-stone-800 p-4 sm:p-5 shadow-xl flex flex-col gap-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-lime-950 border border-lime-800 flex items-center justify-center text-lime-400">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-stone-100 flex items-center gap-2">
              Kinetic Shelf-Life Decay Engine
              <button
                onClick={() => setShowFormulaDetails(!showFormulaDetails)}
                className="text-stone-400 hover:text-stone-200 transition-colors"
                title="View Biochemical Formula Details"
              >
                <HelpCircle className="w-3.5 h-3.5" />
              </button>
            </h3>
            <p className="text-[11px] text-stone-400">
              Post-harvest respiration, Arrhenius kinetics &amp; seasonal climate modeling
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 bg-stone-950 p-1 rounded-lg border border-stone-800 text-xs">
          <button
            onClick={() => onStorageChange('AMBIENT_LORRY')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-medium flex items-center gap-1 transition-colors ${
              storageMethod === 'AMBIENT_LORRY'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Sun className="w-3 h-3" />
            <span>Ambient Lorry</span>
          </button>
          <button
            onClick={() => onStorageChange('CHILLED_REEFER')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-medium flex items-center gap-1 transition-colors ${
              storageMethod === 'CHILLED_REEFER'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Snowflake className="w-3 h-3" />
            <span>Cold-Chain Reefer</span>
          </button>
        </div>
      </div>

      {/* Primary Remaining Days KPI Cards */}
      <div className="grid grid-cols-2 gap-3">
        {/* Ambient Room Shelf Life */}
        <div className="bg-stone-950/70 border border-stone-800 rounded-xl p-3.5 flex flex-col justify-between transition-colors">
          <div className="flex items-center justify-between text-xs text-stone-400">
            <span className="flex items-center gap-1">
              <Sun className="w-3.5 h-3.5 text-amber-400" />
              Ambient ({ambientTemp}°C)
            </span>
            <span className="text-[10px] font-mono text-stone-500">Retail Rack</span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <motion.span
              key={dynamicKinetics.days}
              initial={{ scale: 1.15, opacity: 0.8 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.2 }}
              className={`text-3xl font-extrabold tracking-tight ${
                dynamicKinetics.days <= 2
                  ? 'text-rose-400'
                  : dynamicKinetics.days <= 4
                  ? 'text-amber-400'
                  : 'text-emerald-400'
              }`}
            >
              {dynamicKinetics.days}
            </motion.span>
            <span className="text-xs font-semibold text-stone-400">marketable days</span>
          </div>
          <div className="mt-2 flex flex-col gap-1 text-[11px] text-stone-400">
            <div>
              {dynamicKinetics.days <= 2 ? (
                <span className="text-rose-400 font-semibold flex items-center gap-1">
                  <ShieldAlert className="w-3 h-3" /> Rapid degradation window
                </span>
              ) : dynamicKinetics.days <= 4 ? (
                <span className="text-amber-400 font-medium flex items-center gap-1">
                  <Sun className="w-3.5 h-3.5" /> Moderate shelf-life; expedite dispatch
                </span>
              ) : (
                <span className="text-emerald-400 font-medium flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> Safe for extended distribution
                </span>
              )}
            </div>

            {/* Seasonal delta comparison indicator */}
            {seasonalMultiplierEnabled && Math.abs(dynamicKinetics.seasonalDaysDelta) > 0.05 && (
              <span className="text-[10px] font-mono text-stone-500">
                Seasonal impact:{' '}
                <strong
                  className={
                    dynamicKinetics.seasonalDaysDelta > 0
                      ? 'text-emerald-400'
                      : 'text-rose-400'
                  }
                >
                  {dynamicKinetics.seasonalDaysDelta > 0 ? '+' : ''}
                  {dynamicKinetics.seasonalDaysDelta}d
                </strong>{' '}
                vs. dry lab baseline
              </span>
            )}
          </div>
        </div>

        {/* Cold-Chain Shelf Life */}
        <div className="bg-stone-950/70 border border-cyan-900/30 rounded-xl p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-stone-400">
            <span className="flex items-center gap-1">
              <Snowflake className="w-3.5 h-3.5 text-cyan-400" />
              Chilled Storage (8-12°C)
            </span>
            <span className="text-[10px] font-mono text-cyan-500/80">Reefer Hub</span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold tracking-tight text-cyan-300">
              {cold_storage_shelf_life_days}
            </span>
            <span className="text-xs font-semibold text-stone-400">marketable days</span>
          </div>
          <div className="mt-2 text-[11px] text-cyan-400/90 font-medium">
            +{Math.max(0, +(cold_storage_shelf_life_days - dynamicKinetics.days).toFixed(1))} days gained via cooling
          </div>
        </div>
      </div>

      {/* Seasonal Climate Factor Multiplier Module */}
      <div className="bg-stone-950/80 border border-emerald-900/40 rounded-xl p-3.5 flex flex-col gap-3">
        {/* Module Header with Toggle and Active Multiplier */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-950 border border-emerald-800 flex items-center justify-center text-emerald-400 shrink-0">
              <CloudSun className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-stone-200">
                  Regional Seasonal Climate Factor
                </span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-950 border border-emerald-700 text-emerald-300 font-mono font-semibold">
                  {activeClimate.monthShort} Active
                </span>
              </div>
              <p className="text-[11px] text-stone-400">
                Adjusts biological respiration based on typical ambient field conditions
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSeasonalMultiplierEnabled(!seasonalMultiplierEnabled)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer border ${
                seasonalMultiplierEnabled
                  ? 'bg-emerald-950/90 border-emerald-600 text-emerald-300 shadow-sm'
                  : 'bg-stone-900 border-stone-700 text-stone-400 hover:text-stone-300'
              }`}
              title="Toggle seasonal climatic factor in kinetic decay math"
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  seasonalMultiplierEnabled ? 'bg-emerald-400 animate-pulse' : 'bg-stone-500'
                }`}
              />
              <span>Multiplier:</span>
              <strong className="font-mono">
                {seasonalMultiplierEnabled
                  ? `${activeClimate.seasonalMultiplier.toFixed(2)}×`
                  : 'OFF (1.00×)'}
              </strong>
            </button>

            <button
              type="button"
              onClick={() => setShowSeasonalDetails(!showSeasonalDetails)}
              className="text-stone-400 hover:text-stone-200 p-1 rounded hover:bg-stone-900 transition-colors"
              title="Toggle regional details"
            >
              {showSeasonalDetails ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Supply Region Selector Chips */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 border-t border-stone-800/80">
          <div className="flex items-center gap-1 text-[11px] text-stone-400 shrink-0">
            <MapPin className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-medium">Supply Region:</span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            {SUPPLY_REGIONS.map((region) => {
              const isSelected = region.id === selectedRegionId;
              return (
                <button
                  key={region.id}
                  type="button"
                  onClick={() => setSelectedRegionId(region.id)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer border ${
                    isSelected
                      ? 'bg-emerald-950/90 border-emerald-600 text-emerald-200 ring-1 ring-emerald-500/50'
                      : 'bg-stone-900 border-stone-800 text-stone-400 hover:border-stone-700 hover:text-stone-200'
                  }`}
                >
                  {region.shortName}
                </button>
              );
            })}
          </div>
        </div>

        {/* 12-Month Interactive Seasonal Horizon Strip */}
        <div className="flex flex-col gap-1.5 pt-1">
          <div className="flex items-center justify-between text-[11px] text-stone-400 font-mono">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-stone-400" />
              Harvest Month &amp; Climatic Multiplier Horizon:
            </span>
            <span className="text-[10px] text-stone-500">
              Current: <strong className="text-emerald-400">Sep</strong>
            </span>
          </div>

          <div className="grid grid-cols-6 sm:grid-cols-12 gap-1">
            {activeRegion.months.map((m) => {
              const isSelected = m.monthIndex === selectedMonthIndex;
              const isCurrent = m.monthIndex === currentCalendarMonth;

              // Color-coded multiplier styling
              let multClass = 'text-stone-300';
              if (m.seasonalMultiplier >= 1.1) {
                multClass = 'text-emerald-400';
              } else if (m.seasonalMultiplier >= 1.0) {
                multClass = 'text-teal-300';
              } else if (m.seasonalMultiplier >= 0.88) {
                multClass = 'text-amber-300';
              } else {
                multClass = 'text-rose-400';
              }

              return (
                <button
                  key={m.monthIndex}
                  type="button"
                  onClick={() => setSelectedMonthIndex(m.monthIndex)}
                  className={`p-1.5 rounded-lg border text-center transition-all cursor-pointer flex flex-col items-center justify-between relative ${
                    isSelected
                      ? 'bg-emerald-950/90 border-emerald-500 text-white ring-2 ring-emerald-500/50 shadow-md'
                      : 'bg-stone-900/90 border-stone-800 hover:border-stone-700 text-stone-400 hover:text-stone-200'
                  }`}
                  title={`${m.monthName} in ${activeRegion.shortName}: Avg ${m.avgAmbientTempC}°C, ${m.relativeHumidityPct}% RH, Multiplier ${m.seasonalMultiplier}x (${m.seasonCategory})`}
                >
                  {isCurrent && (
                    <span
                      className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 animate-pulse border border-stone-950"
                      title="Current Calendar Month"
                    />
                  )}
                  <span className="text-[11px] font-bold tracking-tight block">
                    {m.monthShort}
                  </span>
                  <span className={`text-[10px] font-mono font-bold mt-0.5 ${multClass}`}>
                    {m.seasonalMultiplier.toFixed(2)}×
                  </span>
                  <span className="text-[9px] text-stone-500 font-mono mt-0.5 block">
                    {m.avgAmbientTempC}°C
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Month Climate Telemetry Banner */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono text-xs">
          {/* Average Regional Ambient Temp */}
          <div className="bg-stone-900/90 border border-stone-800 rounded-lg p-2 flex flex-col justify-between">
            <span className="text-[10px] text-stone-400 flex items-center gap-1">
              <Thermometer className="w-3 h-3 text-rose-400" />
              Field Avg Temp
            </span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-sm font-bold text-stone-200">
                {activeClimate.avgAmbientTempC}°C
              </span>
              <button
                type="button"
                onClick={() => onTempChange(activeClimate.avgAmbientTempC)}
                className="text-[9px] px-1.5 py-0.5 rounded bg-stone-800 hover:bg-stone-700 text-cyan-300 font-sans cursor-pointer transition-colors"
                title="Set ambient temperature slider to this typical month average"
              >
                Apply
              </button>
            </div>
          </div>

          {/* Relative Humidity */}
          <div className="bg-stone-900/90 border border-stone-800 rounded-lg p-2 flex flex-col justify-between">
            <span className="text-[10px] text-stone-400 flex items-center gap-1">
              <Droplets className="w-3 h-3 text-cyan-400" />
              Relative Humidity
            </span>
            <span className="text-sm font-bold text-stone-200 mt-1">
              {activeClimate.relativeHumidityPct}% RH
            </span>
          </div>

          {/* Respiration Stress Rating */}
          <div className="bg-stone-900/90 border border-stone-800 rounded-lg p-2 flex flex-col justify-between">
            <span className="text-[10px] text-stone-400 flex items-center gap-1">
              <Activity className="w-3 h-3 text-amber-400" />
              Stress Level
            </span>
            <span
              className={`text-[11px] font-bold mt-1 ${
                activeClimate.respirationStressLevel === 'CRITICAL'
                  ? 'text-rose-400'
                  : activeClimate.respirationStressLevel === 'HIGH'
                  ? 'text-amber-400'
                  : activeClimate.respirationStressLevel === 'MODERATE'
                  ? 'text-yellow-300'
                  : 'text-emerald-400'
              }`}
            >
              {activeClimate.respirationStressLevel}
            </span>
          </div>

          {/* Net Shelf-Life Shift */}
          <div className="bg-stone-900/90 border border-stone-800 rounded-lg p-2 flex flex-col justify-between">
            <span className="text-[10px] text-stone-400 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-emerald-400" />
              Net Shift
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span
                className={`text-sm font-bold ${
                  effectiveSeasonalMultiplier >= 1.0
                    ? 'text-emerald-400'
                    : 'text-rose-400'
                }`}
              >
                {effectiveSeasonalMultiplier >= 1.0 ? '+' : ''}
                {((effectiveSeasonalMultiplier - 1.0) * 100).toFixed(0)}%
              </span>
              <span className="text-[9px] text-stone-400">
                ({seasonalMultiplierEnabled ? `${activeClimate.seasonalMultiplier}×` : '1.0×'})
              </span>
            </div>
          </div>
        </div>

        {/* Agronomic Context & Actionable Advice Callout */}
        <div className="bg-stone-900/70 border border-stone-800/80 rounded-lg p-2.5 flex flex-col gap-1 text-[11px]">
          <div className="flex items-center justify-between text-stone-300 font-medium">
            <span className="text-emerald-400 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {activeClimate.monthName} ({activeClimate.seasonCategory}):
            </span>
            <span className="text-[10px] text-stone-400 font-mono">
              Zone: {activeRegion.elevation}
            </span>
          </div>
          <p className="text-stone-300 text-[11px] leading-relaxed">
            {activeClimate.agronomicDescription}
          </p>
          <p className="text-emerald-300/90 text-[11px] leading-relaxed font-mono">
            💡 <strong>Dispatch Protocol:</strong> {activeClimate.fieldManagementTip}
          </p>
        </div>

        {/* Collapsible Regional Metadata Breakdown */}
        {showSeasonalDetails && (
          <div className="p-2.5 rounded-lg bg-stone-900/90 border border-stone-800 text-[11px] text-stone-400 grid grid-cols-1 sm:grid-cols-3 gap-2 font-mono">
            <div>
              <span className="text-stone-500 block">Climate Zone:</span>
              <span className="text-stone-200">{activeRegion.climateZone}</span>
            </div>
            <div>
              <span className="text-stone-500 block">Elevation:</span>
              <span className="text-stone-200">{activeRegion.elevation}</span>
            </div>
            <div>
              <span className="text-stone-500 block">Key Horticultural Crops:</span>
              <span className="text-stone-200">{activeRegion.primaryCrops}</span>
            </div>
          </div>
        )}
      </div>

      {/* Interactive Temperature Sensitivity Slider */}
      <div className="bg-stone-950/70 border border-stone-800 rounded-xl p-3.5 flex flex-col gap-2.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-stone-300 font-medium flex items-center gap-1.5">
            <Thermometer className="w-3.5 h-3.5 text-rose-400" />
            Field / Transit Temperature Simulator
          </span>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-stone-400">Slide to test kinetic decay:</span>
            <span
              className={`font-mono font-bold px-2 py-0.5 rounded text-xs border ${
                ambientTemp >= 35
                  ? 'bg-rose-950/80 border-rose-700 text-rose-300'
                  : ambientTemp >= 25
                  ? 'bg-amber-950/80 border-amber-700 text-amber-300'
                  : 'bg-emerald-950/80 border-emerald-700 text-emerald-300'
              }`}
            >
              {ambientTemp}°C
            </span>
          </div>
        </div>

        <input
          type="range"
          min="2"
          max="42"
          step="1"
          value={ambientTemp}
          onChange={(e) => onTempChange(Number(e.target.value))}
          className="w-full accent-cyan-400 h-2 bg-stone-800 rounded-lg cursor-pointer"
        />

        <div className="flex justify-between text-[10px] font-mono text-stone-400">
          <span>2°C (Deep chill)</span>
          <span className="hidden sm:inline">10°C (Cold chain)</span>
          <span>24°C (Standard)</span>
          <span className="text-rose-400 font-semibold">42°C (Heatwave)</span>
        </div>
      </div>

      {/* Color-Coded Thermal Kinetic Shelf-Life Heat-Map Grid (2°C to 30°C) */}
      <div className="bg-stone-950/80 border border-stone-800 rounded-xl p-3.5 flex flex-col gap-2.5">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <ThermometerSnowflake className="w-4 h-4 text-cyan-400 shrink-0" />
            <span className="font-bold text-stone-200">
              Thermal Storage Sensitivity Heat-Map (2°C – 30°C)
            </span>
            <span className="text-[10px] font-mono text-stone-400 hidden md:inline">
              (seasonal {effectiveSeasonalMultiplier.toFixed(2)}× calibrated)
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-stone-400">
            <span className="hidden sm:inline">Click cell to simulate</span>
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
          </div>
        </div>

        {/* 8-Cell Heat-Map Matrix */}
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5 sm:gap-2">
          {heatMapData.map((item) => (
            <button
              key={item.temp}
              type="button"
              onClick={() => onTempChange(item.temp)}
              className={`p-2 rounded-xl border flex flex-col items-center justify-between text-center transition-all cursor-pointer relative overflow-hidden group ${
                item.tierColor
              } ${item.hoverBorder} ${
                item.isCurrent
                  ? 'ring-2 ring-cyan-400 ring-offset-1 ring-offset-stone-950 shadow-lg scale-[1.02]'
                  : 'hover:scale-[1.02] opacity-90 hover:opacity-100'
              }`}
              title={`Simulate storage at ${item.temp}°C: ${item.days} marketable days`}
            >
              {/* Active Indicator Pin */}
              {item.isCurrent && (
                <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
              )}

              {/* Storage Temperature */}
              <div className="flex items-center justify-center gap-0.5 text-xs font-mono font-bold">
                <span>{item.temp}°C</span>
              </div>

              {/* Predicted Days Metric */}
              <div className="my-1.5">
                <span className="text-base sm:text-lg font-black font-mono leading-none tracking-tight">
                  {item.days}
                </span>
                <span className="text-[10px] block font-medium opacity-80 mt-0.5">
                  days
                </span>
              </div>

              {/* Storage Tier Pill */}
              <span
                className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-md border tracking-tight uppercase whitespace-nowrap ${item.badgeColor}`}
              >
                {item.tierLabel}
              </span>
            </button>
          ))}
        </div>

        {/* Dynamic Thermal Advantage Insight Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 text-[11px] text-stone-400 pt-2 border-t border-stone-800/80 font-mono">
          <div className="flex items-center gap-1.5">
            <span className="text-cyan-400 font-semibold">Chilling Advantage:</span>
            <span>
              2°C cold chain yields{' '}
              <strong className="text-cyan-300">
                +{heatMapData[0]?.days ? Math.max(0, +(heatMapData[0].days - (heatMapData[heatMapData.length - 1]?.days || 0)).toFixed(1)) : 0}d
              </strong>{' '}
              longer retail window than 30°C hot lorry.
            </span>
          </div>
          <div className="text-[10px] text-stone-500">
            Active: <strong className="text-stone-300">{ambientTemp}°C</strong> ({dynamicKinetics.days}d)
          </div>
        </div>
      </div>

      {/* Visual Animated Expected Shelf-Life Depletion Bar */}
      <div className="bg-stone-950/80 border border-stone-800 rounded-xl p-4 flex flex-col gap-3">
        {/* Bar Header */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <Clock className="w-4 h-4 text-cyan-400 shrink-0" />
            <div>
              <div className="text-xs font-bold text-stone-200 uppercase tracking-wide flex items-center gap-2">
                <span>Expected Shelf-Life Depletion</span>
                <span className="text-[10px] font-normal text-stone-400 lowercase font-mono">
                  (Arrhenius kinetics)
                </span>
              </div>
              <p className="text-[11px] text-stone-400">
                Respiration accelerates as ambient heat and seasonal factors elevate biological decay.
              </p>
            </div>
          </div>

          {/* Animated Numeric Badge */}
          <motion.div
            key={dynamicKinetics.days}
            initial={{ scale: 1.1, opacity: 0.8 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.2 }}
            className={`px-3 py-1 rounded-lg font-mono text-xs font-bold border flex items-center gap-1.5 shrink-0 ${
              dynamicKinetics.days >= 5
                ? 'bg-emerald-950/90 border-emerald-600 text-emerald-300'
                : dynamicKinetics.days >= 3
                ? 'bg-amber-950/90 border-amber-600 text-amber-300'
                : 'bg-rose-950/90 border-rose-600 text-rose-300 animate-pulse'
            }`}
          >
            <span className="text-sm font-black">{dynamicKinetics.days}</span>
            <span className="text-[11px] font-normal text-stone-300">Days</span>
            <span className="text-[10px] opacity-75 hidden sm:inline">
              (~{Math.round(dynamicKinetics.days * 24)}h)
            </span>
          </motion.div>
        </div>

        {/* Depleting Bar Visual Container */}
        <div className="space-y-1.5 pt-1">
          {/* Milestone markers along the axis */}
          <div className="flex justify-between text-[10px] font-mono text-stone-400 px-0.5">
            <span className="text-rose-400">0d (Spoilage)</span>
            <span className="text-amber-400">3d (Urgent)</span>
            <span className="text-stone-300">7d (Optimal)</span>
            <span className="text-emerald-400">10d</span>
            <span className="text-cyan-400 font-semibold">{dynamicKinetics.maxScaleDays}d (Reefer Max)</span>
          </div>

          {/* Progress Track */}
          <div className="h-6 w-full bg-stone-900 rounded-xl border border-stone-800 p-1 relative overflow-hidden flex items-center">
            {/* Background grid milestone tick lines */}
            <div className="absolute inset-0 flex justify-between px-3 pointer-events-none opacity-25">
              <div className="w-px h-full bg-stone-600" />
              <div className="w-px h-full bg-stone-600" />
              <div className="w-px h-full bg-stone-600" />
              <div className="w-px h-full bg-stone-600" />
            </div>

            {/* The Animated Depleting Bar */}
            <motion.div
              className={`h-full rounded-lg relative overflow-hidden transition-colors ${
                dynamicKinetics.days >= 5
                  ? 'bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-400 shadow-md shadow-emerald-500/20'
                  : dynamicKinetics.days >= 3
                  ? 'bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-400 shadow-md shadow-amber-500/20'
                  : 'bg-gradient-to-r from-rose-700 via-rose-600 to-red-500 shadow-md shadow-rose-500/30'
              }`}
              initial={{ width: `${dynamicKinetics.percent}%` }}
              animate={{ width: `${dynamicKinetics.percent}%` }}
              transition={{
                type: 'spring',
                stiffness: 140,
                damping: 18,
                mass: 0.6,
              }}
            >
              {/* Dynamic Shimmer and Depletion Stream Animation */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent"
                animate={{
                  x: ['-100%', '200%'],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 2.0,
                  ease: 'linear',
                }}
              />
            </motion.div>
          </div>
        </div>

        {/* Kinetic Rate Telemetry & Status Note */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs pt-1 border-t border-stone-800/80">
          <div className="flex items-center gap-1.5 text-stone-400">
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-[11px]">Respiration Multiplier:</span>
            <span
              className={`font-mono font-bold ${
                dynamicKinetics.respirationMultiplier >= 2.5
                  ? 'text-rose-400'
                  : dynamicKinetics.respirationMultiplier >= 1.5
                  ? 'text-amber-400'
                  : 'text-emerald-400'
              }`}
            >
              {dynamicKinetics.respirationMultiplier}x
            </span>
            <span className="text-[10px] text-stone-400 font-mono">
              (vs 12°C reference &amp; {effectiveSeasonalMultiplier.toFixed(2)}× season)
            </span>
          </div>

          <div className="text-[11px] font-mono">
            {dynamicKinetics.days <= 2 ? (
              <span className="text-rose-400 flex items-center gap-1 font-semibold">
                <TrendingDown className="w-3.5 h-3.5" /> Severe thermal degradation window
              </span>
            ) : dynamicKinetics.days <= 4 ? (
              <span className="text-amber-400 flex items-center gap-1">
                <Sun className="w-3.5 h-3.5" /> High respiration; expedite dark store delivery
              </span>
            ) : (
              <span className="text-emerald-400 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> Optimal post-harvest biological stability
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Kinetic Decay Formula Breakdown (Collapsible) */}
      {showFormulaDetails && (
        <div className="p-3.5 rounded-xl bg-stone-950 border border-stone-800 text-xs flex flex-col gap-2">
          <div className="font-mono text-[11px] text-lime-400 font-semibold border-b border-stone-800 pb-1.5">
            SL_rem = SL_base × S_seasonal ({effectiveSeasonalMultiplier.toFixed(2)}×) × (1 - Ripeness% / 100) × Q10^(-(T_actual - T_ref) / 10) × (1 - D_bruise)
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] text-stone-400 font-mono">
            <div>
              • SL_base:{' '}
              <span className="text-stone-200">
                {kinetic_parameters.base_shelf_life_days} days
              </span>
            </div>
            <div>
              • Seasonal Multiplier:{' '}
              <span className="text-emerald-300 font-bold">
                {effectiveSeasonalMultiplier.toFixed(2)}×
              </span>
            </div>
            <div>
              • Q10 Factor:{' '}
              <span className="text-stone-200">
                {kinetic_parameters.q10_respiration_factor}
              </span>
            </div>
            <div>
              • Ripeness Ded:{' '}
              <span className="text-stone-200">
                {ripeness_percentage.toFixed(0)}%
              </span>
            </div>
            <div>
              • Bruise Penalty:{' '}
              <span className="text-stone-200">
                {(kinetic_parameters.bruise_penalty_applied * 100).toFixed(0)}%
              </span>
            </div>
            <div>
              • Active T_actual:{' '}
              <span className="text-cyan-300">
                {storageMethod === 'CHILLED_REEFER'
                  ? `${Math.max(8.0, ambientTemp - 14)}°C (Reefer)`
                  : `${ambientTemp}°C (Ambient)`}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

