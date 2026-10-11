import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Boxes,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Percent,
  Activity,
  Layers,
  ArrowRight,
  Printer,
  RefreshCw,
  X,
  FileCheck2,
} from 'lucide-react';
import type { CrateSampleLotResult, CrateItemSample, USDAMaturityStage } from '../types';

interface CrateLotSamplingModalProps {
  isOpen: boolean;
  onClose: () => void;
  cropHint?: string;
  batchId?: string;
  supplierName?: string;
}

export const CrateLotSamplingModal: React.FC<CrateLotSamplingModalProps> = ({
  isOpen,
  onClose,
  cropHint = 'Tomato',
  batchId = 'CRATE-TOM-8821',
  supplierName = 'Saraswati Agritech Cluster #3',
}) => {
  const [sampleCount, setSampleCount] = useState<number>(20);
  const [defectBaseline, setDefectBaseline] = useState<number>(6.5);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedItem, setSelectedItem] = useState<CrateItemSample | null>(null);

  // Generate initial simulated crate lot sample
  const [lotResult, setLotResult] = useState<CrateSampleLotResult>(() => {
    const items: CrateItemSample[] = [];
    let gA = 0;
    let gB = 0;
    let rej = 0;
    for (let i = 1; i <= 20; i++) {
      const def = Math.max(1, Math.min(28, Math.round((6.5 + Math.sin(i * 1.5) * 5) * 10) / 10));
      const stg = (Math.min(6, Math.max(1, Math.round(2 + (i % 5) * 0.7)))) as USDAMaturityStage;
      let verdict: 'GRADE_A' | 'GRADE_B' | 'REJECT' = 'GRADE_A';
      if (def > 16 || stg >= 6) {
        verdict = 'REJECT';
        rej++;
      } else if (def > 6 || stg === 5) {
        verdict = 'GRADE_B';
        gB++;
      } else {
        verdict = 'GRADE_A';
        gA++;
      }
      items.push({
        id: `ITEM-${i}`,
        itemNumber: i,
        stage: stg,
        ripenessPct: Math.round(stg * 16.6),
        defectPercent: def,
        gradeVerdict: verdict,
        defectType: def > 16 ? 'Severe Compression Impact' : def > 6 ? 'Minor Cuticle Scuff' : undefined,
        firmnessKgCm2: Math.round((6.8 - stg * 0.7) * 10) / 10,
      });
    }
    return {
      totalItemsScanned: 20,
      gradeAYieldPct: Math.round((gA / 20) * 100),
      gradeBYieldPct: Math.round((gB / 20) * 100),
      cullRejectPct: Math.round((rej / 20) * 100),
      overallLotVerdict: rej > 3 ? 'REJECTED_AT_DOCK' : gB > 5 ? 'ACCEPTED_GRADE_B_MARKDOWN' : 'ACCEPTED_GRADE_A',
      averageRipenessPct: 48,
      averageFirmnessKgCm2: 4.6,
      recommendedLotMarkdownPct: gB > 5 ? 15 : 0,
      items,
      lotAcceptanceRationale: 'Lot meets Grade A standard with 80% Grade A yield and 5% cull rate.',
    };
  });

  if (!isOpen) return null;

  const handleRunResample = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/grade/crate-sample', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sampleCount,
          commodity: cropHint,
          baselineDefectPct: defectBaseline,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.result) {
          setLotResult(data.result);
          setSelectedItem(data.result.items[0]);
        }
      }
    } catch (err) {
      console.warn('Crate sample API fallback:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/85 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="w-full max-w-4xl bg-stone-900 border border-stone-800 rounded-3xl shadow-2xl p-5 sm:p-6 max-h-[92vh] overflow-y-auto flex flex-col gap-5 text-stone-100"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-950 border border-amber-600/50 flex items-center justify-center text-amber-300">
              <Boxes className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
                <span>Crate Lot Sampling & Yield Inspection</span>
                <span className="text-[10px] font-mono uppercase bg-stone-800 text-stone-300 px-2 py-0.5 rounded border border-stone-700">
                  Codex / USDA Standard
                </span>
              </h2>
              <p className="text-xs text-stone-400">
                {batchId} · {supplierName} · {cropHint}
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

        {/* Top Lot Verdict Banner */}
        <div
          className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
            lotResult.overallLotVerdict === 'ACCEPTED_GRADE_A'
              ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
              : lotResult.overallLotVerdict === 'ACCEPTED_GRADE_B_MARKDOWN'
              ? 'bg-amber-950/40 border-amber-500/40 text-amber-200'
              : 'bg-rose-950/40 border-rose-500/40 text-rose-200'
          }`}
        >
          <div>
            <div className="flex items-center gap-2">
              {lotResult.overallLotVerdict === 'ACCEPTED_GRADE_A' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              ) : lotResult.overallLotVerdict === 'ACCEPTED_GRADE_B_MARKDOWN' ? (
                <AlertTriangle className="w-5 h-5 text-amber-400" />
              ) : (
                <XCircle className="w-5 h-5 text-rose-400" />
              )}
              <span className="text-sm sm:text-base font-bold">
                {lotResult.overallLotVerdict === 'ACCEPTED_GRADE_A'
                  ? 'LOT ACCEPTED (GRADE A)'
                  : lotResult.overallLotVerdict === 'ACCEPTED_GRADE_B_MARKDOWN'
                  ? `LOT ACCEPTED WITH ${lotResult.recommendedLotMarkdownPct}% MARKDOWN`
                  : 'LOT REJECTED AT DOCK (RETURN TO VENDOR)'}
              </span>
            </div>
            <p className="text-xs text-stone-300 mt-1">{lotResult.lotAcceptanceRationale}</p>
          </div>

          <div className="flex items-center gap-3 shrink-0 text-xs">
            <div className="bg-stone-900/80 px-3 py-1.5 rounded-xl border border-stone-800 text-center">
              <span className="text-stone-400 block text-[10px]">Grade A Yield</span>
              <span className="font-bold text-emerald-400 text-sm">{lotResult.gradeAYieldPct}%</span>
            </div>
            <div className="bg-stone-900/80 px-3 py-1.5 rounded-xl border border-stone-800 text-center">
              <span className="text-stone-400 block text-[10px]">Grade B</span>
              <span className="font-bold text-amber-400 text-sm">{lotResult.gradeBYieldPct}%</span>
            </div>
            <div className="bg-stone-900/80 px-3 py-1.5 rounded-xl border border-stone-800 text-center">
              <span className="text-stone-400 block text-[10px]">Cull / Reject</span>
              <span className="font-bold text-rose-400 text-sm">{lotResult.cullRejectPct}%</span>
            </div>
          </div>
        </div>

        {/* Sampling Configuration Bar */}
        <div className="bg-stone-950 p-3.5 rounded-2xl border border-stone-800 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-stone-400">Sample Size:</span>
              <select
                value={sampleCount}
                onChange={(e) => setSampleCount(Number(e.target.value))}
                className="bg-stone-900 border border-stone-700 rounded-lg px-2.5 py-1 text-white text-xs"
              >
                <option value={15}>15 fruits (Quick spot check)</option>
                <option value={20}>20 fruits (Standard crate)</option>
                <option value={30}>30 fruits (Deep audit)</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-stone-400">Defect Baseline:</span>
              <input
                type="range"
                min="2"
                max="25"
                step="0.5"
                value={defectBaseline}
                onChange={(e) => setDefectBaseline(Number(e.target.value))}
                className="w-24 accent-amber-500"
              />
              <span className="font-mono text-stone-200">{defectBaseline}%</span>
            </div>
          </div>

          <button
            onClick={handleRunResample}
            disabled={isLoading}
            className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 text-xs font-bold transition-colors flex items-center gap-1.5 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Resample Crate</span>
          </button>
        </div>

        {/* Visual Crate Grid (20-30 Items) */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-stone-300">
              Visual Specimen Map ({lotResult.items.length} units scanned)
            </span>
            <span className="text-[11px] text-stone-400">Click any fruit to view pathology</span>
          </div>

          <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-10 gap-2">
            {lotResult.items.map((item) => {
              const isSelected = selectedItem?.id === item.id;
              const isA = item.gradeVerdict === 'GRADE_A';
              const isB = item.gradeVerdict === 'GRADE_B';
              return (
                <button
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  className={`p-2 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all text-center relative ${
                    isSelected
                      ? 'ring-2 ring-white border-white bg-stone-800'
                      : isA
                      ? 'bg-emerald-950/30 border-emerald-700/40 hover:bg-emerald-900/40'
                      : isB
                      ? 'bg-amber-950/30 border-amber-700/40 hover:bg-amber-900/40'
                      : 'bg-rose-950/30 border-rose-700/40 hover:bg-rose-900/40'
                  }`}
                >
                  <span className="text-[10px] font-mono text-stone-400">#{item.itemNumber}</span>
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      isA ? 'bg-emerald-500 text-stone-950' : isB ? 'bg-amber-500 text-stone-950' : 'bg-rose-500 text-white'
                    }`}
                  >
                    {isA ? 'A' : isB ? 'B' : 'X'}
                  </div>
                  <span className="text-[10px] font-mono text-stone-300">{item.defectPercent}%</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Specimen Detail Inspector */}
        {selectedItem && (
          <div className="p-3.5 rounded-2xl bg-stone-950 border border-stone-800 text-xs grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <span className="text-stone-400 block text-[10px]">Specimen</span>
              <span className="font-bold text-white">Item #{selectedItem.itemNumber} ({selectedItem.gradeVerdict})</span>
            </div>
            <div>
              <span className="text-stone-400 block text-[10px]">Maturity</span>
              <span className="font-bold text-amber-300">Stage {selectedItem.stage} ({selectedItem.ripenessPct}% ripe)</span>
            </div>
            <div>
              <span className="text-stone-400 block text-[10px]">Firmness</span>
              <span className="font-bold text-cyan-300">{selectedItem.firmnessKgCm2} kg/cm²</span>
            </div>
            <div>
              <span className="text-stone-400 block text-[10px]">Surface Defect</span>
              <span className="font-bold text-rose-300">
                {selectedItem.defectPercent}% {selectedItem.defectType ? `(${selectedItem.defectType})` : ''}
              </span>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-stone-800 text-xs">
          <div className="text-stone-400">
            Average Firmness: <strong className="text-white">{lotResult.averageFirmnessKgCm2} kg/cm²</strong> · Avg Ripeness:{' '}
            <strong className="text-white">{lotResult.averageRipenessPct}%</strong>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 font-semibold transition-colors"
          >
            Close Sampling Inspection
          </button>
        </div>
      </motion.div>
    </div>
  );
};
