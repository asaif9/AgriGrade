import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Award,
  AlertTriangle,
  Building2,
  CheckCircle2,
  ChevronRight,
  Clock,
  Compass,
  DollarSign,
  Flame,
  Globe2,
  LineChart,
  RefreshCw,
  Search,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Thermometer,
  TrendingDown,
  TrendingUp,
  Truck,
  Zap,
} from 'lucide-react';
import {
  SUPPLIER_SCORECARD_PRESETS,
  getSupplierScorecard,
  generateAutonomousRootCause,
} from '../utils/supplierIntelligenceEngine';
import type { DeepSupplierScorecard } from '../types';

interface SupplierScorecardStudioProps {
  onClose?: () => void;
  currentSupplier?: string;
}

export const SupplierScorecardStudio: React.FC<SupplierScorecardStudioProps> = ({
  onClose,
  currentSupplier = 'Nashik Agro Cluster',
}) => {
  const [selectedSupplierName, setSelectedSupplierName] = useState<string>(
    SUPPLIER_SCORECARD_PRESETS[currentSupplier] ? currentSupplier : 'Nashik Agro Cluster'
  );

  const scorecard = getSupplierScorecard(selectedSupplierName);
  const rootCause = generateAutonomousRootCause(selectedSupplierName, 16.5, 3.2, 1.8);

  return (
    <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 shadow-2xl flex flex-col gap-6">
      {/* Header & Supplier Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-800">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 font-bold">
                  AgriGrade Enterprise Forensics
                </span>
                <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800">
                  Item 11 & Item 18
                </span>
              </div>
              <h2 className="text-base font-black text-white tracking-tight mt-0.5">
                Deep Supplier Scorecard & Autonomous Root-Cause Diagnostics
              </h2>
            </div>
          </div>
          <p className="text-xs text-stone-400 mt-1">
            Replaces superficial star ratings with 8 deep performance vectors, transit physics forensics, predictive risk, and procurement ROI.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedSupplierName}
            onChange={(e) => setSelectedSupplierName(e.target.value)}
            className="bg-stone-950 border border-stone-700 rounded-lg px-2.5 py-1.5 text-xs text-stone-200 font-semibold cursor-pointer focus:outline-none focus:border-cyan-500"
          >
            {Object.keys(SUPPLIER_SCORECARD_PRESETS).map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          {onClose && (
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-750 text-stone-300 text-xs font-semibold transition-colors"
            >
              Close
            </button>
          )}
        </div>
      </div>

      {/* Main Scorecard Banner: 86 / 100 Overall Score (Item 11 specification) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Big Overall Score & High-Level Breakdown (4 cols) */}
        <div className="lg:col-span-4 bg-stone-950 rounded-xl border border-stone-800 p-4 flex flex-col justify-between gap-4">
          <div>
            <div className="flex items-center justify-between text-xs font-mono text-stone-400 pb-2 border-b border-stone-800">
              <span className="uppercase tracking-wider">Cluster Region</span>
              <span className="text-stone-300">{scorecard.clusterRegion}</span>
            </div>

            <div className="text-center py-4">
              <span className="text-xs font-mono uppercase tracking-widest text-stone-400 font-bold">
                Overall Supplier Score
              </span>
              <div className="text-5xl font-black text-white font-mono tracking-tight my-2">
                <span className="text-emerald-400">{scorecard.overallScore}</span>
                <span className="text-stone-600 text-2xl font-normal">/100</span>
              </div>
              <span className="text-xs text-stone-300 font-semibold">
                Supplier: <strong className="text-white">{scorecard.supplierName}</strong>
              </span>
              <div className="text-[10px] font-mono text-stone-500 mt-0.5">
                Evaluated across {scorecard.historicalBatchesCount} verified dock batches
              </div>
            </div>

            {/* Top Root Cause Diagnostic (Item 11 specification) */}
            <div className="bg-rose-950/30 border border-rose-800/60 rounded-xl p-3 flex flex-col gap-1 text-xs">
              <div className="flex items-center gap-1.5 text-rose-300 font-bold uppercase tracking-wider text-[10px]">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                <span>Top Root Cause Identified:</span>
              </div>
              <p className="text-rose-100 font-medium text-[11px] leading-relaxed">
                {scorecard.topRootCause}
              </p>
            </div>
          </div>

          {/* Predictive Supplier Risk Box (Item 18 specification) */}
          <div className="p-3 rounded-lg bg-stone-900 border border-stone-800 flex items-center justify-between text-xs">
            <div>
              <div className="text-[10px] font-mono text-stone-400 uppercase">Pre-Arrival Risk:</div>
              <div className="font-bold text-amber-400 flex items-center gap-1 mt-0.5">
                <span>{scorecard.predictiveRiskTier === 'HIGH' ? '🟠 HIGH RISK' : '🟢 LOW / MODERATE'}</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] font-mono text-stone-400 uppercase">Prob. of Grade B / Reject:</div>
              <div className="font-bold text-stone-200 font-mono mt-0.5">
                {scorecard.predictiveRejectionProbPct}%
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: 8 Deep Metrics Table & Forensics (8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          {/* 8 Granular Metric Cards Grid (Item 11 exact parameters) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="bg-stone-950 p-3 rounded-xl border border-stone-800">
              <span className="text-[10px] font-mono text-stone-400 uppercase">Quality</span>
              <div className="text-xl font-black text-emerald-400 font-mono mt-0.5">
                {scorecard.qualityScore}
              </div>
              <span className="text-[10px] text-stone-500">Benchmark: 88</span>
            </div>

            <div className="bg-stone-950 p-3 rounded-xl border border-stone-800">
              <span className="text-[10px] font-mono text-stone-400 uppercase">Consistency</span>
              <div className="text-xl font-black text-stone-100 font-mono mt-0.5">
                {scorecard.consistencyScore}
              </div>
              <span className="text-[10px] text-stone-500">Benchmark: 82</span>
            </div>

            <div className="bg-stone-950 p-3 rounded-xl border border-amber-900/40">
              <span className="text-[10px] font-mono text-amber-400 uppercase">Cold Chain</span>
              <div className="text-xl font-black text-amber-400 font-mono mt-0.5">
                {scorecard.coldChainScore}
              </div>
              <span className="text-[10px] text-amber-500">Excursion penalty</span>
            </div>

            <div className="bg-stone-950 p-3 rounded-xl border border-stone-800">
              <span className="text-[10px] font-mono text-stone-400 uppercase">Grade A Yield</span>
              <div className="text-xl font-black text-emerald-400 font-mono mt-0.5">
                {scorecard.gradeAYieldPct}%
              </div>
              <span className="text-[10px] text-stone-500">High yield tier</span>
            </div>

            <div className="bg-stone-950 p-3 rounded-xl border border-stone-800">
              <span className="text-[10px] font-mono text-stone-400 uppercase">Rejection Rate</span>
              <div className="text-xl font-black text-stone-200 font-mono mt-0.5">
                {scorecard.rejectionRatePct}%
              </div>
              <span className="text-[10px] text-stone-500">SLA max: 8%</span>
            </div>

            <div className="bg-stone-950 p-3 rounded-xl border border-stone-800">
              <span className="text-[10px] font-mono text-stone-400 uppercase">Shelf-Life Acc.</span>
              <div className="text-xl font-black text-cyan-400 font-mono mt-0.5">
                {scorecard.shelfLifeAccuracyPct}%
              </div>
              <span className="text-[10px] text-stone-500">Predictive precision</span>
            </div>

            <div className="bg-stone-950 p-3 rounded-xl border border-stone-800">
              <span className="text-[10px] font-mono text-stone-400 uppercase">Damage Rate</span>
              <div className="text-xl font-black text-stone-200 font-mono mt-0.5">
                {scorecard.damageRatePct}%
              </div>
              <span className="text-[10px] text-stone-500">Road transit shock</span>
            </div>

            <div className="bg-stone-950 p-3 rounded-xl border border-stone-800">
              <span className="text-[10px] font-mono text-stone-400 uppercase">On-Time Delivery</span>
              <div className="text-xl font-black text-emerald-400 font-mono mt-0.5">
                {scorecard.onTimeDeliveryPct}%
              </div>
              <span className="text-[10px] text-stone-500">Carrier dispatch</span>
            </div>
          </div>

          {/* Autonomous Root Cause Analysis (Item 18 specification) */}
          <div className="bg-stone-950 p-4 rounded-xl border border-stone-800 flex flex-col gap-2.5">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Autonomous Root Cause Analysis
              </h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs mt-1">
              <div className="bg-stone-900/80 p-3 rounded-lg border border-stone-800">
                <span className="text-[10px] font-mono text-rose-400 font-bold uppercase">Primary Cause</span>
                <p className="text-stone-300 mt-1 leading-relaxed">
                  {rootCause.primaryCause}
                </p>
              </div>

              <div className="bg-stone-900/80 p-3 rounded-lg border border-stone-800">
                <span className="text-[10px] font-mono text-amber-400 font-bold uppercase">Secondary Cause</span>
                <p className="text-stone-300 mt-1 leading-relaxed">
                  {rootCause.secondaryCause}
                </p>
              </div>

              <div className="bg-stone-900/80 p-3 rounded-lg border border-stone-800">
                <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase">Supplier Correlation</span>
                <p className="text-stone-300 mt-1 leading-relaxed">
                  {rootCause.supplierCorrelation}
                </p>
              </div>
            </div>
          </div>

          {/* Autonomous Procurement Recommendations (Item 18 specification) */}
          {scorecard.autonomousProcurementRecommendation && scorecard.autonomousProcurementRecommendation.projectedMonthlySavingsInr > 0 && (
            <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-700/60 flex items-start gap-3">
              <DollarSign className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div className="text-xs">
                <div className="flex items-center gap-2 font-bold text-emerald-200 uppercase tracking-wider">
                  <span>Autonomous Procurement Recommendation</span>
                  <span className="text-[9px] font-mono bg-emerald-500 text-stone-950 px-1.5 py-0.2 rounded font-black">
                    Net Savings: ₹{(scorecard.autonomousProcurementRecommendation.projectedMonthlySavingsInr / 100000).toFixed(1)}L / month
                  </span>
                </div>
                <p className="text-stone-300 mt-1 leading-relaxed">
                  {scorecard.autonomousProcurementRecommendation.recommendationText}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
