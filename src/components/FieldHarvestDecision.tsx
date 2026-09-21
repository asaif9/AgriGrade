import React, { useState } from 'react';
import { CheckCircle2, AlertOctagon, Clock, Truck, ShieldCheck, ArrowRight, FileText, Download, Check, MessageSquare } from 'lucide-react';
import { generateInspectionPdfReport } from '../utils/pdfReportGenerator';
import type { AgriGradeReport, USDAMaturityStage } from '../types';

interface FieldHarvestDecisionProps {
  report: AgriGradeReport;
  transitHours: number;
  transitKm: number;
  onOpenChat?: (prompt?: string) => void;
}

export const FieldHarvestDecision: React.FC<FieldHarvestDecisionProps> = ({
  report,
  transitHours,
  transitKm,
  onOpenChat,
}) => {
  const [downloadedPass, setDownloadedPass] = useState(false);

  const {
    produce_type,
    variety_detected,
    usda_color_stage,
    stage_name,
    ripeness_percentage,
    harvest_guidance,
    color_breakdown,
  } = report;

  const guidance = harvest_guidance || {
    should_harvest_today: usda_color_stage === 2 || usda_color_stage === 3,
    optimal_harvest_window: usda_color_stage === 2 ? 'Within 12-18 hours (early morning pick)' : 'Wait 2 days',
    target_channel: usda_color_stage === 2 ? 'Quick-Commerce Dark Store Hub (>100 km)' : 'Hold for Local Mandi',
    transit_viability_score: usda_color_stage === 2 ? 96 : 58,
    harvest_risk_assessment: 'Evaluation based on color spectrum and transit kinetics.',
    field_action_steps: [
      'Pick at dawn before ambient temperature exceeds 24°C.',
      'Stack max 2 layers deep to avoid bottom-crate compression.',
    ],
  };

  const usdaStages: { stage: USDAMaturityStage; name: string; color: string; desc: string }[] = [
    { stage: 1, name: 'Stage 1: Green', color: 'bg-lime-700', desc: 'Hold unless export >7d' },
    { stage: 2, name: 'Stage 2: Breaker', color: 'bg-lime-500', desc: 'Optimal for QC Hubs (100km+)' },
    { stage: 3, name: 'Stage 3: Turning', color: 'bg-amber-500', desc: 'Local Dark Stores (<24h)' },
    { stage: 4, name: 'Stage 4: Pink', color: 'bg-orange-500', desc: 'Immediate Farm-Gate Sale' },
    { stage: 5, name: 'Stage 5: Light Red', color: 'bg-rose-500', desc: 'Local retail only (high transit risk)' },
    { stage: 6, name: 'Stage 6: Red', color: 'bg-red-700', desc: 'Divert to Sauce / Puree' },
  ];

  const handleDownloadPass = async () => {
    setDownloadedPass(true);
    try {
      await generateInspectionPdfReport({
        report,
        batchId: report.id,
        supplierName: 'Field Producer Co-Op',
        transitHours,
        transitKm,
      });
    } catch (err) {
      console.error('Failed to generate PDF pass:', err);
    } finally {
      setTimeout(() => setDownloadedPass(false), 2500);
    }
  };

  return (
    <div className="bg-stone-900 rounded-2xl border border-stone-800 p-5 shadow-xl flex flex-col gap-5">
      {/* Primary Decision Banner */}
      <div
        className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
          guidance.should_harvest_today
            ? 'bg-emerald-950/40 border-emerald-500/80 text-emerald-100'
            : usda_color_stage >= 5
            ? 'bg-rose-950/40 border-rose-500/80 text-rose-100'
            : 'bg-amber-950/40 border-amber-500/80 text-amber-100'
        }`}
      >
        <div className="flex items-start gap-3.5">
          <div
            className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
              guidance.should_harvest_today
                ? 'bg-emerald-500 text-stone-950 shadow-md shadow-emerald-950/50'
                : usda_color_stage >= 5
                ? 'bg-rose-500 text-white shadow-md shadow-rose-950/50'
                : 'bg-amber-500 text-stone-950 shadow-md shadow-amber-950/50'
            }`}
          >
            {guidance.should_harvest_today ? (
              <CheckCircle2 className="w-6 h-6 stroke-[2.5]" />
            ) : (
              <AlertOctagon className="w-6 h-6 stroke-[2.5]" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-wider font-bold px-2 py-0.5 rounded bg-stone-950/60 border border-stone-800">
                Agent 3 Decision
              </span>
              <span className="text-xs text-stone-300 font-medium">
                {produce_type} ({variety_detected})
              </span>
            </div>
            <h3 className="text-xl font-black tracking-tight mt-0.5">
              {guidance.should_harvest_today
                ? 'RECOMMENDED: HARVEST TODAY'
                : usda_color_stage >= 5
                ? 'DO NOT HARVEST FOR TRANSIT'
                : 'HOLD HARVEST: RETAIN ON VINE'}
            </h3>
            <p className="text-xs text-stone-300 mt-1 max-w-lg leading-relaxed">
              {guidance.harvest_risk_assessment}
            </p>
          </div>
        </div>

        {/* Viability Gauge */}
        <div className="flex sm:flex-col items-center sm:items-end justify-between border-t sm:border-t-0 border-stone-800/80 pt-3 sm:pt-0">
          <span className="text-xs text-stone-400 font-medium">Transit Viability</span>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black font-mono text-emerald-400">
              {guidance.transit_viability_score}
            </span>
            <span className="text-xs font-mono text-stone-500">/100</span>
          </div>
          <span className="text-[10px] text-stone-400">
            {transitKm} km • {transitHours}h route
          </span>
        </div>
      </div>

      {/* Target Route & Optimal Picking Window Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="p-3.5 rounded-xl bg-stone-950/60 border border-stone-800 flex items-start gap-3">
          <Clock className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <div className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">Optimal Picking Window</div>
            <div className="text-sm font-bold text-stone-100 mt-0.5">{guidance.optimal_harvest_window}</div>
            <p className="text-[11px] text-stone-400 mt-1">
              Harvesting during dawn cool hours minimizes post-harvest field heat load.
            </p>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-stone-950/60 border border-stone-800 flex items-start gap-3">
          <Truck className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
          <div>
            <div className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">Target Distribution Channel</div>
            <div className="text-sm font-bold text-stone-100 mt-0.5">{guidance.target_channel}</div>
            <p className="text-[11px] text-stone-400 mt-1">
              Reaches Stage 3-4 upon dark store arrival, preventing transit over-ripening.
            </p>
          </div>
        </div>
      </div>

      {/* USDA 6-Stage Maturity Visual Scale */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-stone-300">USDA Color Maturity Classification Matrix</span>
          <span className="font-mono text-emerald-400 font-bold">{stage_name} ({ripeness_percentage.toFixed(0)}% Ripeness)</span>
        </div>
        <div className="grid grid-cols-6 gap-1.5 p-1.5 rounded-xl bg-stone-950 border border-stone-800">
          {usdaStages.map((s) => {
            const isCurrent = s.stage === usda_color_stage;
            return (
              <div
                key={s.stage}
                className={`p-2 rounded-lg text-center flex flex-col items-center justify-between transition-all ${
                  isCurrent
                    ? 'ring-2 ring-emerald-400 bg-stone-800/90 shadow-md'
                    : 'opacity-50 hover:opacity-75'
                }`}
              >
                <div className={`w-full h-3 rounded ${s.color} mb-1.5`} />
                <span className="text-[10px] font-bold text-stone-200">Stage {s.stage}</span>
                <span className="text-[8px] text-stone-400 leading-tight mt-0.5 hidden sm:block truncate w-full">
                  {s.desc}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Field Crew Action Checklist */}
      <div className="p-4 rounded-xl bg-stone-950/70 border border-stone-800 flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-stone-200 uppercase tracking-wider flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Field Harvesting SOP & Crew Checklist
          </h4>
          <span className="text-[10px] font-mono text-stone-400">{guidance.field_action_steps.length} Steps</span>
        </div>
        <div className="space-y-1.5">
          {guidance.field_action_steps.map((step, idx) => (
            <div key={idx} className="flex items-start gap-2.5 text-xs text-stone-300">
              <span className="w-4 h-4 rounded-full bg-emerald-950 border border-emerald-800 text-emerald-400 text-[10px] flex items-center justify-center shrink-0 font-mono mt-0.5">
                {idx + 1}
              </span>
              <p className="leading-relaxed">{step}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Dispatch Clearance Pass Download Action */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-stone-800">
        <div className="text-xs text-stone-400">
          Batch: <span className="font-mono text-stone-200">{report.id}</span> • Certified by AgriGrade Swarm
        </div>
        <div className="flex items-center gap-2">
          {onOpenChat && (
            <button
              onClick={() =>
                onOpenChat(
                  `Why is ${guidance.should_harvest_today ? 'immediate harvest' : 'holding on the vine'} recommended for this ${produce_type} at ${stage_name}?`
                )
              }
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-purple-950 hover:bg-purple-900 border border-purple-700/80 text-purple-200 flex items-center gap-1.5 transition-colors shadow-sm"
              title="Ask agents about harvest and transit window"
            >
              <MessageSquare className="w-3.5 h-3.5 text-purple-400" />
              <span>Ask Agents</span>
            </button>
          )}

          <button
            onClick={handleDownloadPass}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition-all ${
              downloadedPass
                ? 'bg-emerald-950 border-emerald-600 text-emerald-300'
                : 'bg-stone-800 hover:bg-stone-700 border-stone-700 text-stone-200'
            }`}
            title="Download PDF Dispatch Pass & Quality Certificate"
          >
            {downloadedPass ? <Check className="w-3.5 h-3.5" /> : <FileText className="w-3.5 h-3.5 text-cyan-400" />}
            <span>{downloadedPass ? 'PDF Generated!' : 'Export PDF Lorry Pass'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
