import React, { useState } from 'react';
import { TrendingUp, DollarSign, Leaf, Sparkles, Scale, RefreshCcw } from 'lucide-react';

export const SupplyChainEconomics: React.FC = () => {
  const [storeCount, setStoreCount] = useState<number>(120);
  const [dailyVolumeKg, setDailyVolumeKg] = useState<number>(3500);

  // Economic calculations
  const baselineWastePct = 0.22; // 22% typical quick-commerce produce write-off
  const agriGradeWastePct = 0.08; // 8% post-implementation
  const avgCostPerKg = 0.85; // $0.85/kg

  const annualKgHandled = storeCount * dailyVolumeKg * 365;
  const baselineLossDollars = annualKgHandled * baselineWastePct * avgCostPerKg;
  const agriGradeLossDollars = annualKgHandled * agriGradeWastePct * avgCostPerKg;
  const annualSavingsDollars = baselineLossDollars - agriGradeLossDollars;
  const savedFoodKg = (baselineWastePct - agriGradeWastePct) * annualKgHandled;

  return (
    <div className="bg-stone-900 rounded-2xl border border-stone-800 p-5 shadow-xl flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-950 border border-emerald-800 flex items-center justify-center text-emerald-400">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-stone-100">
              Supply Chain & Food Waste Unit Economics
            </h3>
            <p className="text-[11px] text-stone-400">
              Eliminating the 15-28% post-harvest quick-commerce grading gap
            </p>
          </div>
        </div>

        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
          ROI Simulator
        </span>
      </div>

      {/* Simulator Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-stone-950/60 p-3.5 rounded-xl border border-stone-800">
        <div>
          <div className="flex justify-between text-xs text-stone-300 font-medium">
            <span>Dark Stores / Distribution Hubs:</span>
            <span className="font-mono text-emerald-400 font-bold">{storeCount} hubs</span>
          </div>
          <input
            type="range"
            min="10"
            max="500"
            step="10"
            value={storeCount}
            onChange={(e) => setStoreCount(Number(e.target.value))}
            className="w-full accent-emerald-500 mt-2 cursor-pointer"
          />
        </div>

        <div>
          <div className="flex justify-between text-xs text-stone-300 font-medium">
            <span>Daily Produce Volume per Hub:</span>
            <span className="font-mono text-emerald-400 font-bold">{dailyVolumeKg.toLocaleString()} kg/day</span>
          </div>
          <input
            type="range"
            min="500"
            max="10000"
            step="500"
            value={dailyVolumeKg}
            onChange={(e) => setDailyVolumeKg(Number(e.target.value))}
            className="w-full accent-emerald-500 mt-2 cursor-pointer"
          />
        </div>
      </div>

      {/* Projected Financial & Environmental Recovery */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3.5 rounded-xl bg-stone-950/80 border border-stone-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-stone-400">
            <span>Annual Spoilage Prevention</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black font-mono text-emerald-400 mt-2">
            ${(annualSavingsDollars / 1000000).toFixed(2)}M
          </div>
          <div className="text-[10px] text-stone-500 mt-1">
            Reclaimed write-offs via right-time harvest & dynamic markdowns
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-stone-950/80 border border-stone-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-stone-400">
            <span>Prevented Food Landfill</span>
            <Leaf className="w-4 h-4 text-lime-400" />
          </div>
          <div className="text-2xl font-black font-mono text-lime-400 mt-2">
            {(savedFoodKg / 1000000).toFixed(2)}M kg
          </div>
          <div className="text-[10px] text-stone-500 mt-1">
            Equivalent to ~{(savedFoodKg * 1.9 / 1000).toFixed(0)} metric tons CO₂e offset
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-stone-950/80 border border-stone-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-stone-400">
            <span>Customer Dispute Drop</span>
            <RefreshCcw className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-black font-mono text-cyan-300 mt-2">
            -72.4%
          </div>
          <div className="text-[10px] text-stone-500 mt-1">
            Drop in unripe "crunchy" or bruised tomato refund claims
          </div>
        </div>
      </div>
    </div>
  );
};
