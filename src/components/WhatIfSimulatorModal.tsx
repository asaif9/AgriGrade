import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  TrendingUp,
  Snowflake,
  Sun,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  DollarSign,
  Truck,
  RotateCcw,
  Sparkles,
  X,
  Sliders,
} from 'lucide-react';
import type { AgriGradeReport } from '../types';

interface WhatIfSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  report?: AgriGradeReport | null;
}

export const WhatIfSimulatorModal: React.FC<WhatIfSimulatorModalProps> = ({
  isOpen,
  onClose,
  report,
}) => {
  const [transitTempC, setTransitTempC] = useState<number>(34);
  const [excursionHours, setExcursionHours] = useState<number>(4);
  const [useChilledReefer, setUseChilledReefer] = useState<boolean>(true);
  const [crateVolumeKg, setCrateVolumeKg] = useState<number>(500);
  const [basePricePerKgInr, setBasePricePerKgInr] = useState<number>(42);

  if (!isOpen) return null;

  const baselineDays = report?.ambient_shelf_life_days || 4.5;
  const q10 = 2.1;

  // Temperature simulation
  const effectiveTemp = useChilledReefer ? 9.5 : transitTempC;
  const tempDeltaFromRef = effectiveTemp - 13.0;
  const respirationSpeedup = Math.pow(q10, tempDeltaFromRef / 10.0);

  // Excursion penalty
  const thermalExcursionLossDays = useChilledReefer
    ? 0.2
    : Math.min(2.8, Math.round(((transitTempC - 20) * 0.12 * excursionHours) * 10) / 10);

  const simulatedRemainingDays = Math.max(
    0.8,
    Math.round((baselineDays * (useChilledReefer ? 1.6 : 1 / respirationSpeedup) - thermalExcursionLossDays) * 10) / 10
  );

  // Economic analysis
  const totalCargoValueInr = crateVolumeKg * basePricePerKgInr;
  const reeferRentalCostInr = useChilledReefer ? 2400 : 0;

  // Projected spoilage
  const spoilageRateAmbientPct = Math.min(45, Math.round(12 + excursionHours * 4.5));
  const spoilageRateReeferPct = 4;
  const activeSpoilagePct = useChilledReefer ? spoilageRateReeferPct : spoilageRateAmbientPct;

  const preventedSpoilageValueInr = useChilledReefer
    ? Math.round(((spoilageRateAmbientPct - spoilageRateReeferPct) / 100) * totalCargoValueInr)
    : 0;

  const netEconomicBenefitInr = preventedSpoilageValueInr - reeferRentalCostInr;
  const roiMultiplier = reeferRentalCostInr > 0 ? (preventedSpoilageValueInr / reeferRentalCostInr).toFixed(1) : 'N/A';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/85 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="w-full max-w-3xl bg-stone-900 border border-stone-800 rounded-3xl shadow-2xl p-5 sm:p-6 max-h-[92vh] overflow-y-auto flex flex-col gap-5 text-stone-100"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-950 border border-indigo-600/50 flex items-center justify-center text-indigo-300">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
                <span>"What-If" Sensitivity & Logistics ROI Simulator</span>
                <span className="text-[10px] font-mono uppercase bg-stone-800 text-indigo-400 px-2 py-0.5 rounded border border-stone-700">
                  Arrhenius $Q_{10}$ Engine
                </span>
              </h2>
              <p className="text-xs text-stone-400">
                Simulate highway breakdowns, ambient heatwaves vs. reefer investment ROI
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Interactive Sliders */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-stone-950 p-4 rounded-2xl border border-stone-800 text-xs">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-stone-300 font-semibold flex items-center gap-1.5">
                <Sun className="w-4 h-4 text-amber-400" />
                Ambient Highway Temperature
              </span>
              <span className="font-mono text-amber-300 font-bold">{transitTempC}°C</span>
            </div>
            <input
              type="range"
              min="20"
              max="44"
              value={transitTempC}
              onChange={(e) => setTransitTempC(Number(e.target.value))}
              className="w-full accent-amber-500"
            />
            <div className="flex justify-between text-[10px] text-stone-500 mt-0.5">
              <span>20°C Mild</span>
              <span>32°C Normal</span>
              <span>44°C Extreme Heatwave</span>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-stone-300 font-semibold flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                Thermal Breakdown Delay
              </span>
              <span className="font-mono text-rose-300 font-bold">{excursionHours} hours</span>
            </div>
            <input
              type="range"
              min="0"
              max="12"
              value={excursionHours}
              onChange={(e) => setExcursionHours(Number(e.target.value))}
              className="w-full accent-rose-500"
            />
            <div className="flex justify-between text-[10px] text-stone-500 mt-0.5">
              <span>0h No Delay</span>
              <span>4h Traffic Jam</span>
              <span>12h Lorry Breakdown</span>
            </div>
          </div>

          <div className="md:col-span-2 pt-2 border-t border-stone-800 flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <span className="text-stone-400">Cargo Volume:</span>
              <input
                type="number"
                value={crateVolumeKg}
                onChange={(e) => setCrateVolumeKg(Math.max(50, Number(e.target.value)))}
                className="w-24 bg-stone-900 border border-stone-700 rounded-lg px-2 py-1 text-white text-xs font-mono"
              />
              <span className="text-stone-500">kg @ ₹{basePricePerKgInr}/kg (₹{totalCargoValueInr.toLocaleString()})</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-stone-400">Logistics Mode:</span>
              <button
                onClick={() => setUseChilledReefer(!useChilledReefer)}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
                  useChilledReefer
                    ? 'bg-cyan-600 text-stone-950 shadow-md'
                    : 'bg-stone-800 text-stone-400 hover:text-stone-200'
                }`}
              >
                <Snowflake className="w-3.5 h-3.5" />
                <span>{useChilledReefer ? 'Chilled Reefer (+₹2,400)' : 'Ambient Lorry (₹0)'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Results Comparison Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800 flex flex-col justify-between">
            <span className="text-[11px] text-stone-400 font-semibold uppercase">Projected Shelf-Life</span>
            <div className="my-2">
              <div className="text-2xl font-bold text-white flex items-baseline gap-1">
                <span>{simulatedRemainingDays}</span>
                <span className="text-xs text-stone-400 font-normal">days remaining</span>
              </div>
              <span className="text-[10px] text-stone-500">
                Baseline was {baselineDays} days
              </span>
            </div>
            <div className="text-[11px] text-cyan-300 font-medium">
              Respiration speed: {(respirationSpeedup).toFixed(1)}x
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800 flex flex-col justify-between">
            <span className="text-[11px] text-stone-400 font-semibold uppercase">Shrinkage / Cull Rate</span>
            <div className="my-2">
              <div className="text-2xl font-bold text-rose-400 flex items-baseline gap-1">
                <span>{activeSpoilagePct}%</span>
                <span className="text-xs text-stone-400 font-normal">loss at dock</span>
              </div>
              <span className="text-[10px] text-stone-500">
                Worth ₹{Math.round((activeSpoilagePct / 100) * totalCargoValueInr).toLocaleString()}
              </span>
            </div>
            <div className="text-[11px] text-stone-400 font-medium">
              Thermal loss: -{thermalExcursionLossDays} days
            </div>
          </div>

          <div
            className={`p-4 rounded-2xl border flex flex-col justify-between ${
              useChilledReefer && netEconomicBenefitInr > 0
                ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
                : 'bg-stone-950 border-stone-800'
            }`}
          >
            <span className="text-[11px] text-stone-400 font-semibold uppercase">Net Logistics ROI</span>
            <div className="my-2">
              <div className="text-2xl font-bold text-emerald-400 flex items-baseline gap-1">
                <span>₹{useChilledReefer ? netEconomicBenefitInr.toLocaleString() : '0'}</span>
                <span className="text-xs text-stone-400 font-normal">profit gain</span>
              </div>
              <span className="text-[10px] text-stone-400">
                ROI Multiplier: <strong className="text-white">{roiMultiplier}x</strong>
              </span>
            </div>
            <div className="text-[11px] text-emerald-300 font-medium">
              {useChilledReefer ? `Saved ₹${preventedSpoilageValueInr.toLocaleString()} in markdown culls` : 'Ambient baseline'}
            </div>
          </div>
        </div>

        {/* Decision Recommendation Banner */}
        <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/40 flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
          <div className="text-xs">
            <strong className="text-indigo-200 block text-sm">
              Autonomous Recommendation: {useChilledReefer ? 'Invest in Chilled Reefer' : 'Switch to Chilled Reefer Recommended'}
            </strong>
            <p className="text-stone-300 mt-1 leading-relaxed">
              At {transitTempC}°C with a potential {excursionHours}-hour road delay, Arrhenius kinetics accelerate respiration by{' '}
              {respirationSpeedup.toFixed(1)}x. Investing ₹2,400 into cold-chain reefer delivery preserves {simulatedRemainingDays} days of shelf-life,
              preventing ₹{preventedSpoilageValueInr.toLocaleString()} in quick-commerce spoilage with a net ROI of{' '}
              <strong>{roiMultiplier}x</strong>.
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end pt-3 border-t border-stone-800 text-xs">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 font-semibold transition-colors"
          >
            Close Simulator
          </button>
        </div>
      </motion.div>
    </div>
  );
};
