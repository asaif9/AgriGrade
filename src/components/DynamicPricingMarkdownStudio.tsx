import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  DollarSign,
  Tag,
  TrendingDown,
  TrendingUp,
  Percent,
  Clock,
  Box,
  Store,
  Sliders,
  CheckCircle2,
  Sparkles,
  AlertCircle,
  HelpCircle,
  RefreshCw,
  ShoppingBag,
} from 'lucide-react';
import { calculateDynamicMarkdown, type PricingInputFactors } from '../utils/pricingOptimizer';

interface DynamicPricingMarkdownStudioProps {
  onClose?: () => void;
  initialFactors?: Partial<PricingInputFactors>;
  commodityName?: string;
}

export const DynamicPricingMarkdownStudio: React.FC<DynamicPricingMarkdownStudioProps> = ({
  onClose,
  initialFactors,
  commodityName = 'Roma Tomatoes',
}) => {
  const [shelfLifeDays, setShelfLifeDays] = useState<number>(initialFactors?.shelfLifeRemainingDays ?? 2.3);
  const [inventoryKg, setInventoryKg] = useState<number>(initialFactors?.currentInventoryKg ?? 400);
  const [demandVelocity, setDemandVelocity] = useState<number>(initialFactors?.storeDemandVelocityKgHour ?? 8.5);
  const [historicalVelocity, setHistoricalVelocity] = useState<number>(initialFactors?.historicalAvgVelocityKgHour ?? 9.0);
  const [competitorPrice, setCompetitorPrice] = useState<number>(initialFactors?.competitorPricePerKg ?? 38);
  const [basePrice, setBasePrice] = useState<number>(initialFactors?.basePricePerKg ?? 44);
  const [timeOfDay, setTimeOfDay] = useState<number>(initialFactors?.timeOfDayHours ?? 17); // 5 PM evening peak
  const [dayOfWeek, setDayOfWeek] = useState<number>(initialFactors?.dayOfWeek ?? 5); // Friday
  const [grade, setGrade] = useState<'ACCEPTED_GRADE_A' | 'ACCEPTED_GRADE_B' | 'REJECTED_AT_DOCK'>(
    initialFactors?.grade ?? 'ACCEPTED_GRADE_B'
  );
  const [defectPct, setDefectPct] = useState<number>(initialFactors?.defectPercent ?? 8.2);

  // Calculate live dynamic markdown optimization result
  const optimization = calculateDynamicMarkdown({
    shelfLifeRemainingDays: shelfLifeDays,
    currentInventoryKg: inventoryKg,
    storeDemandVelocityKgHour: demandVelocity,
    historicalAvgVelocityKgHour: historicalVelocity,
    competitorPricePerKg: competitorPrice,
    basePricePerKg: basePrice,
    timeOfDayHours: timeOfDay,
    dayOfWeek: dayOfWeek,
    grade: grade,
    defectPercent: defectPct,
  });

  const timeOfDayFormatted = `${timeOfDay.toString().padStart(2, '0')}:00 ${timeOfDay >= 12 ? 'PM' : 'AM'}`;
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  return (
    <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 shadow-2xl flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-800">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Tag className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-bold">
                  AgriGrade Markdown Engine
                </span>
                <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-800">
                  8-Variable Multi-Objective Optimizer
                </span>
              </div>
              <h2 className="text-base font-black text-white tracking-tight mt-0.5">
                Dynamic Pricing & Markdown Optimization
              </h2>
            </div>
          </div>
          <p className="text-xs text-stone-400 mt-1">
            Replaces static rules (e.g., flat Grade B = 15%) with genuinely dynamic price elasticity, decay hazard, and inventory holding optimization.
          </p>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-750 text-stone-300 text-xs font-semibold self-start sm:self-center transition-colors"
          >
            Close Studio
          </button>
        )}
      </div>

      {/* Main 2-Col Layout: 8 Control Factors on Left, Live Optimization Solver on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: 8 Interactive Input Variables (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-stone-200 uppercase tracking-wider flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-amber-400" />
              <span>Commercial & Agronomic Factors</span>
            </h3>
            <span className="text-[10px] font-mono text-stone-500">Live Solved in Real Time</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Factor 1: Shelf Life Remaining */}
            <div className="bg-stone-950 p-3 rounded-xl border border-stone-800 flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-stone-400 font-semibold">1. Shelf Life Remaining</span>
                <span className="font-mono font-bold text-amber-400">{shelfLifeDays} days ({(shelfLifeDays * 24).toFixed(0)}h)</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="6.0"
                step="0.1"
                value={shelfLifeDays}
                onChange={(e) => setShelfLifeDays(parseFloat(e.target.value))}
                className="accent-amber-500 cursor-pointer"
              />
              <span className="text-[10px] text-stone-500">Shorter shelf life accelerates clearance necessity.</span>
            </div>

            {/* Factor 2: Current Inventory */}
            <div className="bg-stone-950 p-3 rounded-xl border border-stone-800 flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-stone-400 font-semibold">2. Current Inventory</span>
                <span className="font-mono font-bold text-stone-200">{inventoryKg} kg</span>
              </div>
              <input
                type="range"
                min="50"
                max="1000"
                step="25"
                value={inventoryKg}
                onChange={(e) => setInventoryKg(parseInt(e.target.value, 10))}
                className="accent-amber-500 cursor-pointer"
              />
              <span className="text-[10px] text-stone-500">Higher stock volume elevates holding decay pressure.</span>
            </div>

            {/* Factor 3: Store Demand Velocity */}
            <div className="bg-stone-950 p-3 rounded-xl border border-stone-800 flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-stone-400 font-semibold">3. Current Demand Velocity</span>
                <span className="font-mono font-bold text-emerald-400">{demandVelocity} kg/hr</span>
              </div>
              <input
                type="range"
                min="2.0"
                max="25.0"
                step="0.5"
                value={demandVelocity}
                onChange={(e) => setDemandVelocity(parseFloat(e.target.value))}
                className="accent-emerald-500 cursor-pointer"
              />
              <span className="text-[10px] text-stone-500">Real-time checkout clearance rate at dark store.</span>
            </div>

            {/* Factor 4: Historical Velocity */}
            <div className="bg-stone-950 p-3 rounded-xl border border-stone-800 flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-stone-400 font-semibold">4. Historical 30-Day Avg</span>
                <span className="font-mono font-bold text-stone-300">{historicalVelocity} kg/hr</span>
              </div>
              <input
                type="range"
                min="4.0"
                max="20.0"
                step="0.5"
                value={historicalVelocity}
                onChange={(e) => setHistoricalVelocity(parseFloat(e.target.value))}
                className="accent-stone-500 cursor-pointer"
              />
              <span className="text-[10px] text-stone-500">Baseline benchmark for consumer demand seasonality.</span>
            </div>

            {/* Factor 5: Competitor Price */}
            <div className="bg-stone-950 p-3 rounded-xl border border-stone-800 flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-stone-400 font-semibold">5. Competitor App Price</span>
                <span className="font-mono font-bold text-cyan-400">₹{competitorPrice}/kg</span>
              </div>
              <input
                type="range"
                min="25"
                max="60"
                step="1"
                value={competitorPrice}
                onChange={(e) => setCompetitorPrice(parseInt(e.target.value, 10))}
                className="accent-cyan-500 cursor-pointer"
              />
              <span className="text-[10px] text-stone-500">Zepto/Blinkit competitor price index.</span>
            </div>

            {/* Factor 6: Base Target Price */}
            <div className="bg-stone-950 p-3 rounded-xl border border-stone-800 flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-stone-400 font-semibold">6. Storefront Base Price</span>
                <span className="font-mono font-bold text-stone-200">₹{basePrice}/kg</span>
              </div>
              <input
                type="range"
                min="30"
                max="70"
                step="1"
                value={basePrice}
                onChange={(e) => setBasePrice(parseInt(e.target.value, 10))}
                className="accent-stone-400 cursor-pointer"
              />
              <span className="text-[10px] text-stone-500">Un-discounted Grade A list price.</span>
            </div>

            {/* Factor 7: Time of Day & Day of Week */}
            <div className="bg-stone-950 p-3 rounded-xl border border-stone-800 flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-stone-400 font-semibold">7. Time of Day</span>
                <span className="font-mono font-bold text-amber-300">{timeOfDayFormatted}</span>
              </div>
              <input
                type="range"
                min="6"
                max="23"
                step="1"
                value={timeOfDay}
                onChange={(e) => setTimeOfDay(parseInt(e.target.value, 10))}
                className="accent-amber-500 cursor-pointer"
              />
              <div className="flex items-center justify-between text-[10px] text-stone-400 pt-1">
                <span>Day:</span>
                <select
                  value={dayOfWeek}
                  onChange={(e) => setDayOfWeek(parseInt(e.target.value, 10))}
                  className="bg-stone-900 border border-stone-700 rounded px-1.5 py-0.5 text-[10px] text-stone-200"
                >
                  {dayNames.map((d, idx) => (
                    <option key={d} value={idx}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Factor 8: Grade & Surface Defect */}
            <div className="bg-stone-950 p-3 rounded-xl border border-stone-800 flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-stone-400 font-semibold">8. Grade & Defect %</span>
                <span className="font-mono font-bold text-rose-300">{defectPct}% BDI</span>
              </div>
              <input
                type="range"
                min="1.0"
                max="25.0"
                step="0.5"
                value={defectPct}
                onChange={(e) => setDefectPct(parseFloat(e.target.value))}
                className="accent-rose-500 cursor-pointer"
              />
              <div className="flex items-center gap-1.5 pt-1">
                {(['ACCEPTED_GRADE_A', 'ACCEPTED_GRADE_B'] as const).map((g) => (
                  <button
                    key={g}
                    onClick={() => setGrade(g)}
                    className={`flex-1 py-1 rounded text-[10px] font-mono font-bold transition-all ${
                      grade === g
                        ? g === 'ACCEPTED_GRADE_A'
                          ? 'bg-emerald-500 text-stone-950'
                          : 'bg-amber-500 text-stone-950'
                        : 'bg-stone-900 text-stone-400'
                    }`}
                  >
                    {g === 'ACCEPTED_GRADE_A' ? 'Grade A' : 'Grade B'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Solved Result & Quick-Commerce Consumer Preview (5 cols) */}
        <div className="lg:col-span-5 bg-stone-950 rounded-xl border border-stone-800 p-4 flex flex-col justify-between gap-5">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-800">
              <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold">
                Optimization Solution
              </span>
              <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                Solves Holding vs Decay Risk
              </span>
            </div>

            {/* Big Headline Recommended Markdown */}
            <div className="bg-gradient-to-br from-amber-950/40 to-stone-900 border border-amber-500/50 rounded-2xl p-4 text-center flex flex-col items-center">
              <span className="text-xs font-mono uppercase tracking-wider text-amber-300 font-semibold">
                Recommended Dynamic Markdown
              </span>
              <motion.div
                key={`md-${optimization.recommendedMarkdownPct}`}
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                className="text-4xl sm:text-5xl font-black text-amber-400 font-mono tracking-tight my-1"
              >
                -{optimization.recommendedMarkdownPct}%
              </motion.div>
              <div className="text-xs font-mono text-stone-300 flex items-center gap-2 mt-1">
                <span className="line-through text-stone-500">₹{optimization.basePricePerKg}/kg</span>
                <span>→</span>
                <span className="text-emerald-400 font-black text-sm">₹{optimization.finalPricePerKg}/kg</span>
              </div>
            </div>

            {/* Why Not Simply Flat 15%? */}
            <div className="bg-stone-900/80 border border-stone-800 rounded-xl p-3 flex flex-col gap-1.5 text-xs">
              <div className="font-bold text-stone-200 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Why {optimization.recommendedMarkdownPct}% rather than flat 15%?</span>
              </div>
              <p className="text-stone-400 text-[11px] leading-relaxed">
                {optimization.optimizationExplanation}
              </p>
            </div>

            {/* Margin Preservation Card */}
            <div className="bg-emerald-950/20 border border-emerald-800/40 rounded-xl p-3 flex items-center justify-between text-xs font-mono">
              <span className="text-stone-400">Projected Margin Saved vs. Dumping:</span>
              <span className="text-emerald-400 font-black text-sm">
                +₹{optimization.projectedRevenueGainInr.toLocaleString()}
              </span>
            </div>

            {/* Quick-Commerce Consumer App Mockup (Item 8 requirement) */}
            <div className="p-3.5 rounded-xl bg-stone-900 border border-stone-800 flex flex-col gap-2">
              <div className="flex items-center justify-between text-[11px] font-mono text-stone-400 pb-1.5 border-b border-stone-800">
                <span className="flex items-center gap-1.5 text-stone-300 font-bold">
                  <ShoppingBag className="w-3.5 h-3.5 text-amber-400" />
                  <span>Zepto / Blinkit 10-Min Flash Deal Preview</span>
                </span>
                <span className="text-emerald-400 font-bold">LIVE API</span>
              </div>

              <div className="flex items-center justify-between mt-1">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-red-500/20 border border-red-500/40 flex items-center justify-center text-lg">
                    🍅
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span>{commodityName} (1 kg)</span>
                      <span className="text-[9px] font-mono bg-rose-500 text-white font-black px-1 rounded">
                        -{optimization.recommendedMarkdownPct}%
                      </span>
                    </div>
                    <div className="text-[10px] text-stone-400">
                      ⚡ Quick-Commerce Clearance • Consume within 2 days
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs font-mono font-black text-emerald-400">
                    ₹{optimization.finalPricePerKg}
                  </div>
                  <div className="text-[10px] font-mono line-through text-stone-500">
                    ₹{optimization.basePricePerKg}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
