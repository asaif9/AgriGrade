import React, { useState, useEffect, useMemo } from 'react';
import {
  Activity,
  Zap,
  Play,
  Pause,
  RotateCcw,
  FastForward,
  ChevronRight,
  Sliders,
  Radio,
  Thermometer,
  Droplets,
  Sprout,
  ShieldAlert,
  Truck,
  Box,
  Layers,
  ArrowRight,
  TrendingDown,
  Info,
  Clock,
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Store,
  Compass,
  FileText,
  Percent,
} from 'lucide-react';
import type {
  DigitalTwinCrateProfile,
  DigitalTwinFactors,
  DigitalTwinRisks,
  DigitalTwinStorageMode,
  DigitalTwinPackagingType,
  USDAMaturityStage,
} from '../types';
import {
  renderShelfLifeAsciiBar,
  calculateDecayMultipliers,
  evaluateDigitalTwinRisks,
  determineRecommendedAction,
  INITIAL_DIGITAL_TWIN_BATCHES,
} from '../utils/digitalTwinEngine';

interface DigitalTwinStudioProps {
  onClose: () => void;
  initialBatchId?: string;
  onApplyBatchToInspection?: (crate: DigitalTwinCrateProfile) => void;
}

export const DigitalTwinStudio: React.FC<DigitalTwinStudioProps> = ({
  onClose,
  initialBatchId = 'BATCH CRATE-4892',
  onApplyBatchToInspection,
}) => {
  const [selectedBatchId, setSelectedBatchId] = useState<string>(initialBatchId);
  const [activeStepIndex, setActiveStepIndex] = useState<number>(1); // Default to Step 1 (the 3.8d state)
  const [isSimulatingLive, setIsSimulatingLive] = useState<boolean>(false);
  const [simulationSpeedMs, setSimulationSpeedMs] = useState<number>(3000);
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'FACTORS' | 'ROUTING' | 'FLEET'>('OVERVIEW');

  // Selected Crate
  const activeCrate = useMemo(() => {
    return (
      INITIAL_DIGITAL_TWIN_BATCHES.find((b) => b.crateId === selectedBatchId) ||
      INITIAL_DIGITAL_TWIN_BATCHES[0]
    );
  }, [selectedBatchId]);

  // Live controllable factors for active crate
  const [factors, setFactors] = useState<DigitalTwinFactors>(activeCrate.factors);

  // Sync when crate changes
  useEffect(() => {
    setFactors(activeCrate.factors);
    setActiveStepIndex(1);
  }, [selectedBatchId, activeCrate]);

  // Sync factors when stepping through timeline
  useEffect(() => {
    if (activeCrate.timeline && activeCrate.timeline[activeStepIndex]) {
      setFactors(activeCrate.timeline[activeStepIndex].factors);
    }
  }, [activeStepIndex, activeCrate]);

  // Real-time decay multipliers across all 8 factors
  const multipliers = useMemo(() => {
    return calculateDecayMultipliers(factors);
  }, [factors]);

  // Live remaining shelf life calculated dynamically:
  const dynamicRemainingDays = useMemo(() => {
    const timeline = activeCrate.timeline;
    if (timeline && timeline.length > 0 && activeStepIndex < timeline.length) {
      const step = timeline[activeStepIndex];
      const tempDelta = factors.temperature - step.factors.temperature;
      const penalty = tempDelta > 0 ? (tempDelta / 10) * 0.25 : 0;
      return Math.max(0.3, +(step.remainingShelfLifeDays - penalty).toFixed(1));
    }
    const elapsedDays = (factors.transitHours / 24) * multipliers.totalBurnRate;
    return Math.max(0.3, +(activeCrate.initialShelfLifeDays - elapsedDays).toFixed(1));
  }, [activeCrate, activeStepIndex, factors, multipliers]);

  // Live risk evaluation
  const dynamicRisks = useMemo<DigitalTwinRisks>(() => {
    return evaluateDigitalTwinRisks(factors, dynamicRemainingDays);
  }, [factors, dynamicRemainingDays]);

  // Live recommended action
  const dynamicAction = useMemo(() => {
    return determineRecommendedAction(
      activeCrate.crateId,
      dynamicRemainingDays,
      dynamicRisks,
      activeCrate.targetStore
    );
  }, [activeCrate, dynamicRemainingDays, dynamicRisks]);

  // ASCII bar: e.g. "████████░░ 3.8 days"
  const asciiBar = useMemo(() => {
    return renderShelfLifeAsciiBar(dynamicRemainingDays, 5.0, 10);
  }, [dynamicRemainingDays]);

  // Live ticker progression
  useEffect(() => {
    if (!isSimulatingLive) return;
    const timer = setInterval(() => {
      setActiveStepIndex((prev) => {
        const next = prev + 1;
        if (next >= activeCrate.timeline.length) {
          return 0; // wrap around
        }
        return next;
      });
    }, simulationSpeedMs);

    return () => clearInterval(timer);
  }, [isSimulatingLive, simulationSpeedMs, activeCrate.timeline]);

  return (
    <div className="w-full flex flex-col gap-6 animate-fadeIn">
      {/* Studio Header & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-stone-900 border border-stone-800 rounded-2xl p-4 sm:p-5 shadow-xl">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white border border-stone-700 transition-colors"
            title="Return to main inspection dock"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white font-sans tracking-tight">
                Shelf-Life Digital Twin Studio
              </h2>
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800">
                Continuous Biophysical Simulation
              </span>
            </div>
            <p className="text-xs text-stone-400">
              Transforming static single-point estimates (4.2d) into dynamic, real-time telemetry-driven twins
            </p>
          </div>
        </div>

        {/* Crate Selector and Simulation Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Crate switcher */}
          <div className="flex items-center gap-1.5 bg-stone-950 px-3 py-1.5 rounded-xl border border-stone-800">
            <Box className="w-3.5 h-3.5 text-emerald-400" />
            <select
              value={selectedBatchId}
              onChange={(e) => setSelectedBatchId(e.target.value)}
              className="bg-transparent text-xs font-mono font-bold text-white focus:outline-none cursor-pointer"
            >
              {INITIAL_DIGITAL_TWIN_BATCHES.map((b) => (
                <option key={b.crateId} value={b.crateId} className="bg-stone-900 text-white">
                  {b.crateId} — {b.commodity}
                </option>
              ))}
            </select>
          </div>

          {/* Live auto-simulation toggle */}
          <button
            onClick={() => setIsSimulatingLive(!isSimulatingLive)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm ${
              isSimulatingLive
                ? 'bg-amber-600 border-amber-500 text-white shadow-amber-950/50'
                : 'bg-stone-800 hover:bg-stone-700 border-stone-700 text-stone-200'
            }`}
          >
            {isSimulatingLive ? (
              <>
                <Pause className="w-3.5 h-3.5" />
                <span>Simulating Live</span>
                <span className="w-2 h-2 rounded-full bg-white animate-ping" />
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 text-emerald-400" />
                <span>Run Live Telemetry</span>
              </>
            )}
          </button>

          {/* Apply to inspection */}
          {onApplyBatchToInspection && (
            <button
              onClick={() => onApplyBatchToInspection(activeCrate)}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors flex items-center gap-1 shadow-sm"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Use in Dock Intake</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Feature Banner: The Core Problem & Solution */}
      <div className="bg-gradient-to-r from-stone-900 via-stone-900 to-emerald-950/40 border border-emerald-800/40 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1 max-w-2xl">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AgriGrade Primary Differentiator</span>
          </div>
          <h3 className="text-base font-bold text-white">
            Dynamic Continuous Updating vs. Traditional Static Guesswork
          </h3>
          <p className="text-xs text-stone-300 leading-relaxed">
            Standard systems calculate shelf life once (<span className="font-mono text-stone-400">Shelf life = 4.2 days</span>) and leave operators blind to thermal spikes and transit shock. AgriGrade continuously updates the remaining vitality across time: <span className="font-mono text-emerald-400">09:00 → 4.2d</span>, <span className="font-mono text-emerald-400">12:00 → 3.9d</span>, <span className="font-mono text-amber-400">15:00 → 3.4d</span>, <span className="font-mono text-amber-400">18:00 → 3.1d</span>.
          </p>
        </div>

        {/* Burn Rate Badge */}
        <div className="bg-stone-950 rounded-xl p-3.5 border border-stone-800 shrink-0 text-center flex flex-col items-center justify-center min-w-[160px]">
          <span className="text-[10px] text-stone-400 uppercase font-sans tracking-wider">
            Current Decay Speed
          </span>
          <div className="text-2xl font-black font-mono text-amber-400 my-0.5">
            {multipliers.totalBurnRate}x
          </div>
          <span className="text-[11px] text-stone-400">
            vs. 1.0x baseline reference
          </span>
        </div>
      </div>

      {/* Grid Layout: Primary Crate UI Card & Continuous Stream Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (5 cols): The EXACT UI requested in user prompt */}
        <div className="lg:col-span-5 bg-stone-900 border border-stone-800 rounded-2xl p-5 shadow-xl flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-stone-800 pb-3">
            <div>
              <span className="text-[10px] text-stone-400 uppercase font-mono tracking-widest block">
                Target Crate Digital Twin
              </span>
              <h3 className="text-lg font-black font-mono text-white tracking-wide">
                {activeCrate.crateId}
              </h3>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-emerald-400 block font-sans">
                {activeCrate.commodity}
              </span>
              <span className="text-[10px] text-stone-400 block font-mono">
                {activeCrate.variety}
              </span>
            </div>
          </div>

          {/* Remaining Shelf Life Block Display */}
          <div className="bg-stone-950 rounded-xl p-4 border border-stone-800/80 flex flex-col gap-2 font-mono">
            <div className="flex items-center justify-between text-xs font-sans">
              <span className="text-stone-300 font-semibold">Remaining Shelf Life</span>
              <span className="text-stone-400 text-[11px]">
                {Math.round(dynamicRemainingDays * 24)} hours left
              </span>
            </div>

            {/* The exact prompt representation: ████████░░ 3.8 days */}
            <div className="text-2xl sm:text-3xl font-black tracking-tight my-1 text-emerald-400 flex items-baseline gap-2">
              <span className="text-emerald-400">{asciiBar.slice(0, 8)}</span>
              <span className="text-stone-600">{asciiBar.slice(8, 10)}</span>
              <span className="text-white ml-2 text-xl sm:text-2xl">
                {dynamicRemainingDays.toFixed(1)} days
              </span>
            </div>

            {/* Visual Progress Bar */}
            <div className="w-full bg-stone-900 rounded-full h-2.5 overflow-hidden border border-stone-800">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 via-lime-400 to-amber-400 transition-all duration-300 rounded-full"
                style={{
                  width: `${Math.min(100, Math.max(5, (dynamicRemainingDays / 5.0) * 100))}%`,
                }}
              />
            </div>

            <div className="flex justify-between items-center text-[11px] text-stone-400 font-sans pt-1">
              <span>Origin: {activeCrate.supplier}</span>
              <span className="text-emerald-400 font-medium">97% Confidence</span>
            </div>
          </div>

          {/* Risk Matrix with Exact Symbols */}
          <div className="bg-stone-950 rounded-xl p-4 border border-stone-800/80 flex flex-col gap-2.5 font-mono text-xs">
            <span className="text-[11px] uppercase tracking-wider text-stone-400 font-sans font-semibold border-b border-stone-800 pb-1.5">
              Risk Breakdown Matrix
            </span>

            <div className="space-y-2">
              {/* Temperature Risk 🟡 */}
              <div className="flex items-center justify-between p-2 rounded-lg bg-stone-900/60 border border-stone-800/80">
                <div className="flex items-center gap-2">
                  <Thermometer className="w-3.5 h-3.5 text-rose-400" />
                  <span className="text-stone-200 font-sans font-medium">Temperature Risk</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-stone-400 text-[11px]">{dynamicRisks.temperatureRisk.detail}</span>
                  <span className="text-lg leading-none select-none">{dynamicRisks.temperatureRisk.symbol}</span>
                </div>
              </div>

              {/* Bruise Risk 🟢 */}
              <div className="flex items-center justify-between p-2 rounded-lg bg-stone-900/60 border border-stone-800/80">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-stone-200 font-sans font-medium">Bruise Risk</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-stone-400 text-[11px]">{dynamicRisks.bruiseRisk.detail}</span>
                  <span className="text-lg leading-none select-none">{dynamicRisks.bruiseRisk.symbol}</span>
                </div>
              </div>

              {/* Fungal Risk 🟠 */}
              <div className="flex items-center justify-between p-2 rounded-lg bg-stone-900/60 border border-stone-800/80">
                <div className="flex items-center gap-2">
                  <Droplets className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-stone-200 font-sans font-medium">Fungal Risk</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-stone-400 text-[11px]">{dynamicRisks.fungalRisk.detail}</span>
                  <span className="text-lg leading-none select-none">{dynamicRisks.fungalRisk.symbol}</span>
                </div>
              </div>

              {/* Cold Chain 🟡 */}
              <div className="flex items-center justify-between p-2 rounded-lg bg-stone-900/60 border border-stone-800/80">
                <div className="flex items-center gap-2">
                  <Radio className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="text-stone-200 font-sans font-medium">Cold Chain</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-stone-400 text-[11px]">{dynamicRisks.coldChainRisk.detail}</span>
                  <span className="text-lg leading-none select-none">{dynamicRisks.coldChainRisk.symbol}</span>
                </div>
              </div>

              {/* Demand Risk 🟢 */}
              <div className="flex items-center justify-between p-2 rounded-lg bg-stone-900/60 border border-stone-800/80">
                <div className="flex items-center gap-2">
                  <Store className="w-3.5 h-3.5 text-teal-400" />
                  <span className="text-stone-200 font-sans font-medium">Demand Risk</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-stone-400 text-[11px]">{dynamicRisks.demandRisk.detail}</span>
                  <span className="text-lg leading-none select-none">{dynamicRisks.demandRisk.symbol}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Recommended Action (Exact prompt formatting) */}
          <div className="bg-stone-950 rounded-xl p-4 border border-stone-800/80 flex flex-col gap-2">
            <span className="text-[11px] uppercase tracking-wider text-stone-400 font-sans font-semibold">
              Recommended Action:
            </span>

            <div className="bg-emerald-950/50 border border-emerald-700/70 rounded-xl p-3.5 flex flex-col gap-1.5">
              <div className="text-sm font-bold text-white font-sans flex items-center gap-2">
                <span className="text-emerald-400 font-mono text-base">→</span>
                <span>{dynamicAction.primaryDispatch.replace(/^→\s*/, '')}</span>
              </div>
              <div className="text-xs font-bold text-emerald-300 font-sans flex items-center gap-2">
                <span className="text-emerald-400 font-mono text-base">→</span>
                <span>{dynamicAction.urgencyWindow.replace(/^→\s*/, '')}</span>
              </div>
              {dynamicAction.secondaryRouting && (
                <div className="text-[11px] text-stone-400 font-sans mt-0.5">
                  {dynamicAction.secondaryRouting}
                </div>
              )}
              <p className="text-[11px] text-stone-300 font-sans mt-1 leading-relaxed border-t border-emerald-900/60 pt-2">
                {dynamicAction.rationale}
              </p>
            </div>
          </div>
        </div>

        {/* Right Column (7 cols): The Dynamic Time Stream & 8 Data-Driven Inputs */}
        <div className="lg:col-span-7 flex flex-col gap-5">
          {/* Continuous Timeline Stream (09:00 → 4.2d, 12:00 → 3.9d, 15:00 → 3.4d, 18:00 → 3.1d) */}
          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 shadow-xl flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-800 pb-3">
              <div>
                <h4 className="text-sm font-bold text-white font-sans flex items-center gap-2">
                  <Clock className="w-4 h-4 text-emerald-400" />
                  <span>Continuous Update Ledger</span>
                </h4>
                <p className="text-xs text-stone-400">
                  Telemetry logs streaming from IoT probes, dispatch docks &amp; transport loggers
                </p>
              </div>

              {/* Scrubber step buttons */}
              <div className="flex items-center gap-1.5 bg-stone-950 p-1 rounded-lg border border-stone-800">
                {activeCrate.timeline.map((step, idx) => (
                  <button
                    key={step.timeFormatted}
                    onClick={() => {
                      setActiveStepIndex(idx);
                      setIsSimulatingLive(false);
                    }}
                    className={`px-2.5 py-1 rounded text-xs font-mono font-bold transition-all ${
                      activeStepIndex === idx
                        ? 'bg-emerald-600 text-white shadow'
                        : 'text-stone-400 hover:text-white hover:bg-stone-800'
                    }`}
                  >
                    {step.timeFormatted}
                  </button>
                ))}
              </div>
            </div>

            {/* Interactive Timeline Visual Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {activeCrate.timeline.map((step, idx) => {
                const isSelected = activeStepIndex === idx;
                return (
                  <div
                    key={step.timeFormatted}
                    onClick={() => {
                      setActiveStepIndex(idx);
                      setIsSimulatingLive(false);
                    }}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col gap-2 ${
                      isSelected
                        ? 'bg-gradient-to-br from-stone-950 via-stone-950 to-emerald-950/40 border-emerald-500 shadow-md ring-1 ring-emerald-500/30'
                        : 'bg-stone-950 border-stone-800/80 hover:border-stone-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-emerald-400 font-mono">
                          {step.timeFormatted}
                        </span>
                        <span className="text-stone-600 font-mono">→</span>
                        <span className="text-sm font-black text-white font-mono">
                          {step.remainingShelfLifeDays.toFixed(1)} days
                        </span>
                      </div>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-stone-900 text-stone-300 border border-stone-800">
                        {step.instantaneousBurnRate}x burn
                      </span>
                    </div>

                    <p className="text-[11px] text-stone-400 line-clamp-2 leading-tight font-sans">
                      {step.eventNote}
                    </p>

                    <div className="flex items-center justify-between text-[10px] font-mono text-stone-500 border-t border-stone-800/60 pt-2 mt-auto">
                      <span>{step.factors.temperature}°C</span>
                      <span>{step.factors.humidity}% RH</span>
                      <span>{step.factors.handlingGForce.toFixed(1)}G</span>
                      <span className="text-stone-400">{step.factors.storageMode.replace('_', ' ')}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 8 Data-Driven Biophysical Inputs Panel with Interactive Sliders */}
          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 shadow-xl flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <div>
                <h4 className="text-sm font-bold text-white font-sans flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-cyan-400" />
                  <span>8 Data-Driven Dynamic Factors</span>
                </h4>
                <p className="text-xs text-stone-400">
                  Perturb environmental stressors to observe immediate digital twin recalculation
                </p>
              </div>

              <button
                onClick={() => {
                  setFactors(activeCrate.factors);
                }}
                className="text-[11px] text-stone-400 hover:text-white flex items-center gap-1 font-sans bg-stone-800 px-2 py-1 rounded"
              >
                <RotateCcw className="w-3 h-3" /> Reset Factors
              </button>
            </div>

            {/* 8 Factors Grid with Live Sliders & Pickers */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {/* 1. Temperature */}
              <div className="bg-stone-950 p-3 rounded-xl border border-stone-800/80 flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-stone-200 flex items-center gap-1.5 font-sans">
                    <Thermometer className="w-3.5 h-3.5 text-rose-400" /> 1. Temperature
                  </span>
                  <span className="font-mono text-rose-400 font-bold">{factors.temperature}°C</span>
                </div>
                <input
                  type="range"
                  min="4"
                  max="38"
                  step="0.5"
                  value={factors.temperature}
                  onChange={(e) => setFactors({ ...factors, temperature: Number(e.target.value) })}
                  className="w-full accent-rose-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-stone-500 font-mono">
                  <span>4°C (Cold Storage)</span>
                  <span>Multiplier: {multipliers.tempMultiplier}x</span>
                  <span>38°C (Extreme)</span>
                </div>
              </div>

              {/* 2. Humidity */}
              <div className="bg-stone-950 p-3 rounded-xl border border-stone-800/80 flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-stone-200 flex items-center gap-1.5 font-sans">
                    <Droplets className="w-3.5 h-3.5 text-blue-400" /> 2. Humidity
                  </span>
                  <span className="font-mono text-blue-400 font-bold">{factors.humidity}% RH</span>
                </div>
                <input
                  type="range"
                  min="40"
                  max="98"
                  step="1"
                  value={factors.humidity}
                  onChange={(e) => setFactors({ ...factors, humidity: Number(e.target.value) })}
                  className="w-full accent-blue-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-stone-500 font-mono">
                  <span>40% (Wilting)</span>
                  <span>Multiplier: {multipliers.humidityMultiplier}x</span>
                  <span>98% (Condensation)</span>
                </div>
              </div>

              {/* 3. Maturity */}
              <div className="bg-stone-950 p-3 rounded-xl border border-stone-800/80 flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-stone-200 flex items-center gap-1.5 font-sans">
                    <Sprout className="w-3.5 h-3.5 text-amber-400" /> 3. Maturity Stage
                  </span>
                  <span className="font-mono text-amber-400 font-bold">
                    Stage {factors.maturityStage} ({factors.maturityPct}%)
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="6"
                  step="1"
                  value={factors.maturityStage}
                  onChange={(e) => {
                    const stage = Number(e.target.value) as USDAMaturityStage;
                    setFactors({
                      ...factors,
                      maturityStage: stage,
                      maturityPct: Math.round((stage / 6) * 100),
                    });
                  }}
                  className="w-full accent-amber-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-stone-500 font-mono">
                  <span>Stage 1 (Green)</span>
                  <span>Multiplier: {multipliers.maturityMultiplier}x</span>
                  <span>Stage 6 (Red)</span>
                </div>
              </div>

              {/* 4. Defects */}
              <div className="bg-stone-950 p-3 rounded-xl border border-stone-800/80 flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-stone-200 flex items-center gap-1.5 font-sans">
                    <ShieldAlert className="w-3.5 h-3.5 text-orange-400" /> 4. Defects &amp; Bruises
                  </span>
                  <span className="font-mono text-orange-400 font-bold">{factors.defectsPct}% surface</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="25"
                  step="0.5"
                  value={factors.defectsPct}
                  onChange={(e) => setFactors({ ...factors, defectsPct: Number(e.target.value) })}
                  className="w-full accent-orange-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-stone-500 font-mono">
                  <span>0% (Pristine)</span>
                  <span>Multiplier: {multipliers.defectsMultiplier}x</span>
                  <span>25% (Critical)</span>
                </div>
              </div>

              {/* 5. Handling */}
              <div className="bg-stone-950 p-3 rounded-xl border border-stone-800/80 flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-stone-200 flex items-center gap-1.5 font-sans">
                    <Truck className="w-3.5 h-3.5 text-teal-400" /> 5. Handling G-Shock
                  </span>
                  <span className="font-mono text-teal-400 font-bold">{factors.handlingGForce.toFixed(1)}G</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="3.5"
                  step="0.1"
                  value={factors.handlingGForce}
                  onChange={(e) => setFactors({ ...factors, handlingGForce: Number(e.target.value) })}
                  className="w-full accent-teal-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-stone-500 font-mono">
                  <span>0.5G (Smooth)</span>
                  <span>Multiplier: {multipliers.handlingMultiplier}x</span>
                  <span>3.5G (Severe Drop)</span>
                </div>
              </div>

              {/* 6. Transit Hours */}
              <div className="bg-stone-950 p-3 rounded-xl border border-stone-800/80 flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-stone-200 flex items-center gap-1.5 font-sans">
                    <Clock className="w-3.5 h-3.5 text-yellow-400" /> 6. Transit Duration
                  </span>
                  <span className="font-mono text-yellow-400 font-bold">{factors.transitHours}h elapsed</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="48"
                  step="1"
                  value={factors.transitHours}
                  onChange={(e) => setFactors({ ...factors, transitHours: Number(e.target.value) })}
                  className="w-full accent-yellow-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-stone-500 font-mono">
                  <span>0h (Packhouse)</span>
                  <span>Multiplier: {multipliers.transitMultiplier}x</span>
                  <span>48h (Delayed)</span>
                </div>
              </div>

              {/* 7. Storage Mode */}
              <div className="bg-stone-950 p-3 rounded-xl border border-stone-800/80 flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-stone-200 flex items-center gap-1.5 font-sans">
                    <Layers className="w-3.5 h-3.5 text-cyan-400" /> 7. Storage Regime
                  </span>
                  <span className="font-mono text-cyan-400 text-[11px] font-bold">
                    {multipliers.storageMultiplier}x
                  </span>
                </div>
                <select
                  value={factors.storageMode}
                  onChange={(e) =>
                    setFactors({ ...factors, storageMode: e.target.value as DigitalTwinStorageMode })
                  }
                  className="bg-stone-900 border border-stone-700 text-stone-200 rounded p-1.5 font-mono text-xs focus:outline-none cursor-pointer"
                >
                  <option value="CONTROLLED_ATMOSPHERE">Controlled Atmosphere (0.65x)</option>
                  <option value="CHILLED_REEFER">Chilled Reefer 8-12°C (0.85x)</option>
                  <option value="PRECOOLED_DOCK">Precooled Dock 16-18°C (1.15x)</option>
                  <option value="DARK_STORE_RACK">Dark Store Rack (1.35x)</option>
                  <option value="AMBIENT_LORRY">Ambient Lorry 28-32°C (1.95x)</option>
                </select>
              </div>

              {/* 8. Packaging Type */}
              <div className="bg-stone-950 p-3 rounded-xl border border-stone-800/80 flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-stone-200 flex items-center gap-1.5 font-sans">
                    <Box className="w-3.5 h-3.5 text-emerald-400" /> 8. Packaging Type
                  </span>
                  <span className="font-mono text-emerald-400 text-[11px] font-bold">
                    {multipliers.packagingMultiplier}x
                  </span>
                </div>
                <select
                  value={factors.packagingType}
                  onChange={(e) =>
                    setFactors({ ...factors, packagingType: e.target.value as DigitalTwinPackagingType })
                  }
                  className="bg-stone-900 border border-stone-700 text-stone-200 rounded p-1.5 font-mono text-xs focus:outline-none cursor-pointer"
                >
                  <option value="MAP_FILM">Modified Atmosphere Packaging (0.72x)</option>
                  <option value="VENTILATED_PLASTIC_CRATE">Ventilated Plastic Crate (1.00x)</option>
                  <option value="CORRUGATED_BOX">Corrugated Box with Liner (1.12x)</option>
                  <option value="OPEN_WOODEN_CRATE">Open Wooden Crate (1.38x)</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
