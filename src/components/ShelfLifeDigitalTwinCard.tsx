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
} from 'lucide-react';
import type {
  DigitalTwinCrateProfile,
  DigitalTwinFactors,
  DigitalTwinRisks,
  DigitalTwinTelemetryStep,
} from '../types';
import {
  renderShelfLifeAsciiBar,
  calculateDecayMultipliers,
  evaluateDigitalTwinRisks,
  determineRecommendedAction,
  INITIAL_DIGITAL_TWIN_BATCHES,
} from '../utils/digitalTwinEngine';

interface ShelfLifeDigitalTwinCardProps {
  onOpenFullStudio?: () => void;
  activeBatchId?: string;
  onSelectBatch?: (crateId: string) => void;
  compact?: boolean;
}

export const ShelfLifeDigitalTwinCard: React.FC<ShelfLifeDigitalTwinCardProps> = ({
  onOpenFullStudio,
  activeBatchId = 'BATCH CRATE-4892',
  onSelectBatch,
  compact = false,
}) => {
  // Find current active crate from predefined or create dynamic state
  const [selectedCrateId, setSelectedCrateId] = useState<string>(activeBatchId);
  const [activeStepIndex, setActiveStepIndex] = useState<number>(1); // Step 1 is the 3.8 days state
  const [isSimulatingLive, setIsSimulatingLive] = useState<boolean>(false);
  const [showFactorControls, setShowFactorControls] = useState<boolean>(false);

  // Sync when prop changes
  useEffect(() => {
    if (activeBatchId) {
      setSelectedCrateId(activeBatchId);
    }
  }, [activeBatchId]);

  const activeCrate = useMemo(() => {
    return (
      INITIAL_DIGITAL_TWIN_BATCHES.find((b) => b.crateId === selectedCrateId) ||
      INITIAL_DIGITAL_TWIN_BATCHES[0]
    );
  }, [selectedCrateId]);

  // Live editable factors (allows live simulation of temperature, humidity, defects, etc.)
  const [liveFactors, setLiveFactors] = useState<DigitalTwinFactors>(activeCrate.factors);

  // Sync factors when batch changes
  useEffect(() => {
    setLiveFactors(activeCrate.factors);
    setActiveStepIndex(1);
  }, [selectedCrateId, activeCrate]);

  // Calculate live decay multipliers and risks
  const multipliers = useMemo(() => {
    return calculateDecayMultipliers(liveFactors);
  }, [liveFactors]);

  // Live remaining shelf life calculated dynamically:
  // Base nominal decay modified by live multipliers & elapsed time
  const dynamicRemainingDays = useMemo(() => {
    // If viewing a timeline step from the prompt progression:
    const timeline = activeCrate.timeline;
    if (timeline && timeline.length > 0 && activeStepIndex < timeline.length) {
      // If user hasn't overridden sliders, show exact timeline step
      const step = timeline[activeStepIndex];
      // Apply delta from liveFactor temperature if changed
      const tempDelta = liveFactors.temperature - step.factors.temperature;
      const penalty = tempDelta > 0 ? (tempDelta / 10) * 0.25 : 0;
      return Math.max(0.4, +(step.remainingShelfLifeDays - penalty).toFixed(1));
    }
    // Continuous dynamic twin computation
    const baseline = activeCrate.initialShelfLifeDays;
    const elapsedDays = (liveFactors.transitHours / 24) * multipliers.totalBurnRate;
    return Math.max(0.4, +(baseline - elapsedDays).toFixed(1));
  }, [activeCrate, activeStepIndex, liveFactors, multipliers]);

  // Evaluate dynamic risks
  const dynamicRisks = useMemo<DigitalTwinRisks>(() => {
    return evaluateDigitalTwinRisks(liveFactors, dynamicRemainingDays);
  }, [liveFactors, dynamicRemainingDays]);

  // Evaluate dynamic recommended action
  const dynamicAction = useMemo(() => {
    return determineRecommendedAction(
      activeCrate.crateId,
      dynamicRemainingDays,
      dynamicRisks,
      activeCrate.targetStore
    );
  }, [activeCrate, dynamicRemainingDays, dynamicRisks]);

  // Dynamic ASCII bar exactly as formatted in prompt:
  // e.g. "████████░░ 3.8 days"
  const asciiBar = useMemo(() => {
    return renderShelfLifeAsciiBar(dynamicRemainingDays, 5.0, 10);
  }, [dynamicRemainingDays]);

  // Auto-simulation ticker
  useEffect(() => {
    if (!isSimulatingLive) return;
    const interval = setInterval(() => {
      setActiveStepIndex((prev) => {
        const next = prev + 1;
        if (next >= activeCrate.timeline.length) {
          return 0; // loop back to 09:00
        }
        return next;
      });
    }, 3200);

    return () => clearInterval(interval);
  }, [isSimulatingLive, activeCrate.timeline]);

  // When activeStepIndex changes, sync liveFactors from that timeline step
  useEffect(() => {
    const timeline = activeCrate.timeline;
    if (timeline && timeline[activeStepIndex]) {
      setLiveFactors(timeline[activeStepIndex].factors);
    }
  }, [activeStepIndex, activeCrate]);

  const handleStepSelect = (idx: number) => {
    setActiveStepIndex(idx);
    setIsSimulatingLive(false);
  };

  return (
    <section
      aria-label="Real-time Shelf-Life Digital Twin"
      className="bg-stone-900 border border-stone-800 rounded-2xl p-5 shadow-xl relative overflow-hidden flex flex-col gap-4"
    >
      {/* Subtle background ambient pulse */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header Row: Title, Marquee Batch Tag & Full Studio Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-800/80 pb-3.5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-950 border border-emerald-700/80 flex items-center justify-center text-emerald-400 shadow-sm shrink-0">
            <Activity className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white tracking-tight">
                Real-Time Shelf-Life Digital Twin
              </h3>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
                LIVE DYNAMIC TWIN
              </span>
            </div>
            <p className="text-[11px] text-stone-400">
              Continuously updating biophysical decay vs static one-time estimates
            </p>
          </div>
        </div>

        {/* Crate Selector / Switcher */}
        <div className="flex items-center gap-2">
          <select
            value={selectedCrateId}
            onChange={(e) => {
              setSelectedCrateId(e.target.value);
              if (onSelectBatch) onSelectBatch(e.target.value);
            }}
            className="bg-stone-950 border border-stone-700 text-stone-200 text-xs font-mono rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-emerald-500 transition-colors"
          >
            {INITIAL_DIGITAL_TWIN_BATCHES.map((b) => (
              <option key={b.crateId} value={b.crateId}>
                {b.crateId} ({b.commodity})
              </option>
            ))}
          </select>

          {onOpenFullStudio && (
            <button
              onClick={onOpenFullStudio}
              className="text-[11px] font-semibold text-emerald-300 hover:text-white bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-700/80 px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition-colors whitespace-nowrap"
            >
              <span>Full Studio</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column (7 cols): The exact UI specified in user prompt */}
        <div className="lg:col-span-7 bg-stone-950/90 rounded-xl border border-stone-800 p-4 flex flex-col gap-4 font-mono shadow-inner">
          {/* Crate ID Header Badge */}
          <div className="flex items-center justify-between border-b border-stone-800/80 pb-2.5">
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-stone-400 uppercase tracking-widest font-sans">
                Active Batch
              </span>
              <span className="text-sm font-bold text-white tracking-wide">
                {activeCrate.crateId}
              </span>
            </div>
            <div className="text-[11px] text-stone-400 font-sans">
              {activeCrate.commodity}
            </div>
          </div>

          {/* Remaining Shelf Life Section (Exact Prompt Representation) */}
          <div className="flex flex-col gap-1.5 py-1">
            <div className="flex justify-between items-center text-xs">
              <span className="text-stone-300 font-sans font-semibold">Remaining Shelf Life</span>
              <span className="text-stone-400 text-[11px]">
                Burn Speed: <span className="text-amber-400 font-bold">{multipliers.totalBurnRate}x</span> nominal
              </span>
            </div>

            {/* ASCII & Modern Segmented Display */}
            <div className="bg-stone-900/90 border border-stone-800 rounded-lg p-3 flex flex-col gap-2">
              <div className="flex items-baseline justify-between">
                {/* The exact block ASCII string requested: ████████░░ 3.8 days */}
                <div className="text-xl sm:text-2xl font-mono font-black tracking-tight text-emerald-400 select-all">
                  <span className="text-emerald-400">{asciiBar.slice(0, 8)}</span>
                  <span className="text-stone-600">{asciiBar.slice(8, 10)}</span>
                  <span className="text-white ml-2.5">{dynamicRemainingDays.toFixed(1)} days</span>
                </div>
                <span className="text-xs text-stone-400 font-mono">
                  {Math.round(dynamicRemainingDays * 24)}h
                </span>
              </div>

              {/* Responsive Progress Bar Track */}
              <div className="w-full bg-stone-950 rounded-full h-2 overflow-hidden border border-stone-800 flex">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 via-lime-400 to-amber-400 transition-all duration-500 rounded-full"
                  style={{
                    width: `${Math.min(100, Math.max(8, (dynamicRemainingDays / 5.0) * 100))}%`,
                  }}
                />
              </div>

              {/* Static vs Dynamic Comparison Insight */}
              <div className="flex items-center justify-between text-[11px] text-stone-400 pt-0.5 font-sans">
                <span className="text-stone-400">
                  Static one-time calc: <span className="line-through text-stone-400">{activeCrate.baselineStaticShelfLifeDays}d</span>
                </span>
                <span className="text-emerald-400 font-medium flex items-center gap-1">
                  <Zap className="w-3 h-3" /> Digital Twin active
                </span>
              </div>
            </div>
          </div>

          {/* Risk Matrix (Exact prompt formatting with symbols 🟡 🟢 🟠) */}
          <div className="flex flex-col gap-2 border-t border-stone-800/80 pt-3 text-xs">
            <span className="text-[11px] font-sans uppercase tracking-wider text-stone-400 font-semibold">
              Multi-Factor Risk Assessment
            </span>

            <div className="space-y-1.5">
              {/* Temperature Risk */}
              <div className="flex items-center justify-between bg-stone-900/60 px-3 py-1.5 rounded-lg border border-stone-800/60 hover:border-stone-700 transition-colors">
                <span className="text-stone-300 font-sans">Temperature Risk</span>
                <div className="flex items-center gap-2">
                  <span className="text-stone-400 text-[11px]">{dynamicRisks.temperatureRisk.label}</span>
                  <span className="text-base leading-none select-none">{dynamicRisks.temperatureRisk.symbol}</span>
                </div>
              </div>

              {/* Bruise Risk */}
              <div className="flex items-center justify-between bg-stone-900/60 px-3 py-1.5 rounded-lg border border-stone-800/60 hover:border-stone-700 transition-colors">
                <span className="text-stone-300 font-sans">Bruise Risk</span>
                <div className="flex items-center gap-2">
                  <span className="text-stone-400 text-[11px]">{dynamicRisks.bruiseRisk.label}</span>
                  <span className="text-base leading-none select-none">{dynamicRisks.bruiseRisk.symbol}</span>
                </div>
              </div>

              {/* Fungal Risk */}
              <div className="flex items-center justify-between bg-stone-900/60 px-3 py-1.5 rounded-lg border border-stone-800/60 hover:border-stone-700 transition-colors">
                <span className="text-stone-300 font-sans">Fungal Risk</span>
                <div className="flex items-center gap-2">
                  <span className="text-stone-400 text-[11px]">{dynamicRisks.fungalRisk.label}</span>
                  <span className="text-base leading-none select-none">{dynamicRisks.fungalRisk.symbol}</span>
                </div>
              </div>

              {/* Cold Chain */}
              <div className="flex items-center justify-between bg-stone-900/60 px-3 py-1.5 rounded-lg border border-stone-800/60 hover:border-stone-700 transition-colors">
                <span className="text-stone-300 font-sans">Cold Chain</span>
                <div className="flex items-center gap-2">
                  <span className="text-stone-400 text-[11px]">{dynamicRisks.coldChainRisk.label}</span>
                  <span className="text-base leading-none select-none">{dynamicRisks.coldChainRisk.symbol}</span>
                </div>
              </div>

              {/* Demand Risk */}
              <div className="flex items-center justify-between bg-stone-900/60 px-3 py-1.5 rounded-lg border border-stone-800/60 hover:border-stone-700 transition-colors">
                <span className="text-stone-300 font-sans">Demand Risk</span>
                <div className="flex items-center gap-2">
                  <span className="text-stone-400 text-[11px]">{dynamicRisks.demandRisk.label}</span>
                  <span className="text-base leading-none select-none">{dynamicRisks.demandRisk.symbol}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Recommended Action (Exact prompt formatting) */}
          <div className="border-t border-stone-800/80 pt-3 flex flex-col gap-2">
            <span className="text-[11px] font-sans uppercase tracking-wider text-stone-400 font-semibold">
              Recommended Action:
            </span>

            <div className="bg-emerald-950/40 border border-emerald-700/60 rounded-xl p-3 flex flex-col gap-1 text-emerald-300 font-bold">
              <div className="text-sm font-sans flex items-center gap-1.5 text-white">
                <span className="text-emerald-400 font-mono font-bold">→</span>
                <span>{dynamicAction.primaryDispatch.replace(/^→\s*/, '')}</span>
              </div>
              <div className="text-xs font-sans flex items-center gap-1.5 text-emerald-300">
                <span className="text-emerald-400 font-mono font-bold">→</span>
                <span>{dynamicAction.urgencyWindow.replace(/^→\s*/, '')}</span>
              </div>
              {dynamicAction.secondaryRouting && (
                <div className="text-[11px] font-normal text-stone-400 mt-1 font-sans">
                  {dynamicAction.secondaryRouting}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column (5 cols): Dynamic Time Stream & 8-Factor Live Perturbation */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {/* Continuous Timeline Updates (09:00 → 4.2d, 12:00 → 3.9d, 15:00 → 3.4d, 18:00 → 3.1d) */}
          <div className="bg-stone-950/70 border border-stone-800 rounded-xl p-3.5 flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-stone-200 uppercase tracking-wider font-sans">
                Continuous Update Stream
              </span>

              {/* Play / Pause simulation toggle */}
              <button
                onClick={() => setIsSimulatingLive(!isSimulatingLive)}
                className={`text-[11px] px-2 py-1 rounded font-medium flex items-center gap-1 transition-colors ${
                  isSimulatingLive
                    ? 'bg-amber-950 text-amber-300 border border-amber-800'
                    : 'bg-stone-800 text-stone-300 hover:text-white'
                }`}
                title="Toggle continuous streaming ticker"
              >
                {isSimulatingLive ? (
                  <>
                    <Pause className="w-3 h-3" /> Pause
                  </>
                ) : (
                  <>
                    <Play className="w-3 h-3" /> Auto-Tick
                  </>
                )}
              </button>
            </div>

            {/* Timeline Stream Steps */}
            <div className="space-y-1.5 font-mono text-xs">
              {activeCrate.timeline.map((step, idx) => {
                const isSelected = activeStepIndex === idx;
                return (
                  <button
                    key={step.timeFormatted}
                    onClick={() => handleStepSelect(idx)}
                    className={`w-full text-left p-2 rounded-lg border transition-all flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-950/80 border-emerald-600 text-white shadow-sm'
                        : 'bg-stone-900/60 border-stone-800 text-stone-400 hover:text-stone-200 hover:bg-stone-900'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`font-bold ${isSelected ? 'text-emerald-400' : 'text-stone-300'}`}>
                        {step.timeFormatted}
                      </span>
                      <span className="text-stone-500">→</span>
                      <span className="font-bold text-white">
                        {step.remainingShelfLifeDays.toFixed(1)} days
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-[11px]">
                      <span className="text-stone-500">
                        {step.factors.temperature}°C · {step.factors.storageMode === 'CHILLED_REEFER' ? 'Reefer' : 'Lorry'}
                      </span>
                      {isSelected && (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 8 Biophysical Factors Summary / Toggle */}
          <div className="bg-stone-950/70 border border-stone-800 rounded-xl p-3.5 flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-stone-200 uppercase tracking-wider font-sans">
                8 Data-Driven Inputs
              </span>
              <button
                onClick={() => setShowFactorControls(!showFactorControls)}
                className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-sans"
              >
                <Sliders className="w-3 h-3" />
                <span>{showFactorControls ? 'Hide Sliders' : 'Simulate Stress'}</span>
              </button>
            </div>

            {/* Compact grid of 8 drivers */}
            <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
              <div className="bg-stone-900/80 p-2 rounded border border-stone-800">
                <span className="text-stone-400 block font-sans text-[10px]">1. Temperature</span>
                <span className="text-rose-300 font-bold">{liveFactors.temperature}°C</span>
              </div>
              <div className="bg-stone-900/80 p-2 rounded border border-stone-800">
                <span className="text-stone-400 block font-sans text-[10px]">2. Humidity</span>
                <span className="text-blue-300 font-bold">{liveFactors.humidity}% RH</span>
              </div>
              <div className="bg-stone-900/80 p-2 rounded border border-stone-800">
                <span className="text-stone-400 block font-sans text-[10px]">3. Maturity</span>
                <span className="text-amber-300 font-bold">Stage {liveFactors.maturityStage} ({liveFactors.maturityPct}%)</span>
              </div>
              <div className="bg-stone-900/80 p-2 rounded border border-stone-800">
                <span className="text-stone-400 block font-sans text-[10px]">4. Defects</span>
                <span className="text-orange-300 font-bold">{liveFactors.defectsPct}% surface</span>
              </div>
              <div className="bg-stone-900/80 p-2 rounded border border-stone-800">
                <span className="text-stone-400 block font-sans text-[10px]">5. Handling</span>
                <span className="text-teal-300 font-bold">{liveFactors.handlingGForce.toFixed(1)}G Peak</span>
              </div>
              <div className="bg-stone-900/80 p-2 rounded border border-stone-800">
                <span className="text-stone-400 block font-sans text-[10px]">6. Transit</span>
                <span className="text-yellow-300 font-bold">{liveFactors.transitHours}h elapsed</span>
              </div>
              <div className="bg-stone-900/80 p-2 rounded border border-stone-800">
                <span className="text-stone-400 block font-sans text-[10px]">7. Storage</span>
                <span className="text-cyan-300 font-bold truncate block">
                  {liveFactors.storageMode.replace('_', ' ')}
                </span>
              </div>
              <div className="bg-stone-900/80 p-2 rounded border border-stone-800">
                <span className="text-stone-400 block font-sans text-[10px]">8. Packaging</span>
                <span className="text-emerald-300 font-bold truncate block">
                  {liveFactors.packagingType.replace('_', ' ')}
                </span>
              </div>
            </div>

            {/* Collapsible Live Sliders for real-time manipulation */}
            {showFactorControls && (
              <div className="space-y-2.5 pt-2 border-t border-stone-800 text-xs">
                {/* Temperature slider */}
                <div>
                  <div className="flex justify-between text-stone-300">
                    <span className="flex items-center gap-1 font-sans">
                      <Thermometer className="w-3 h-3 text-rose-400" /> Temperature
                    </span>
                    <span className="font-mono text-rose-300 font-bold">{liveFactors.temperature}°C</span>
                  </div>
                  <input
                    type="range"
                    min="4"
                    max="38"
                    step="0.5"
                    value={liveFactors.temperature}
                    onChange={(e) =>
                      setLiveFactors({ ...liveFactors, temperature: Number(e.target.value) })
                    }
                    className="w-full accent-rose-500 mt-1 cursor-pointer"
                  />
                </div>

                {/* Humidity slider */}
                <div>
                  <div className="flex justify-between text-stone-300">
                    <span className="flex items-center gap-1 font-sans">
                      <Droplets className="w-3 h-3 text-blue-400" /> Humidity
                    </span>
                    <span className="font-mono text-blue-300 font-bold">{liveFactors.humidity}%</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="98"
                    step="1"
                    value={liveFactors.humidity}
                    onChange={(e) =>
                      setLiveFactors({ ...liveFactors, humidity: Number(e.target.value) })
                    }
                    className="w-full accent-blue-500 mt-1 cursor-pointer"
                  />
                </div>

                {/* Handling shock slider */}
                <div>
                  <div className="flex justify-between text-stone-300">
                    <span className="flex items-center gap-1 font-sans">
                      <Truck className="w-3 h-3 text-teal-400" /> Handling Shock
                    </span>
                    <span className="font-mono text-teal-300 font-bold">{liveFactors.handlingGForce}G</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="3.2"
                    step="0.1"
                    value={liveFactors.handlingGForce}
                    onChange={(e) =>
                      setLiveFactors({ ...liveFactors, handlingGForce: Number(e.target.value) })
                    }
                    className="w-full accent-teal-500 mt-1 cursor-pointer"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
