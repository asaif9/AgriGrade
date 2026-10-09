import React from 'react';
import { X, Cpu, Sprout, Warehouse, Activity, CheckCircle2, ShieldCheck, ArrowRight, Layers } from 'lucide-react';

interface MultiAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MultiAgentModal: React.FC<MultiAgentModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-stone-900 border border-stone-800 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl flex flex-col gap-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">AgriGrade Multi-Agent Architecture</h2>
              <p className="text-xs text-stone-400">
                Coordinated Agentic Pipeline: Field Advisory to Dark Store Gatekeeping
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Architecture Flow Diagram */}
        <div className="p-4 rounded-xl bg-stone-950 border border-stone-800 font-mono text-[11px] text-stone-300 flex flex-col gap-2">
          <div className="text-emerald-400 font-bold uppercase tracking-wider text-[10px]">
            Item 22: 9-Agent Orchestration Swarm Architecture
          </div>
          <div className="text-stone-400 leading-relaxed overflow-x-auto">
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Orchestrator
            <br />
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;│
            <br />
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;┌────────────┼─────────────┐
            <br />
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;↓&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;↓&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;↓
            <br />
            &nbsp;&nbsp;&nbsp;<strong className="text-emerald-300">1. Vision</strong>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<strong className="text-rose-300">2. Pathology</strong>&nbsp;&nbsp;&nbsp;&nbsp;<strong className="text-cyan-300">3. Kinetic Twin</strong>
            <br />
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;↓&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;↓&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;↓
            <br />
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;└──────────► <strong className="text-amber-300">4. Decision &amp; Rules</strong> ◄┘
            <br />
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;│
            <br />
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;┌──────────┼────────────┐
            <br />
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;↓&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;↓&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;↓
            <br />
            &nbsp;&nbsp;&nbsp;&nbsp;<strong className="text-indigo-300">5. Demand</strong>&nbsp;&nbsp;&nbsp;&nbsp;<strong className="text-amber-400">7. Pricing</strong>&nbsp;&nbsp;&nbsp;&nbsp;<strong className="text-emerald-400">6. Routing</strong>
            <br />
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;│&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;│&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;│
            <br />
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;└──────────┼────────────┘
            <br />
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;↓
            <br />
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<strong className="text-cyan-400">8. Risk &amp; Root Cause</strong>
            <br />
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;↓
            <br />
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<strong className="text-white">Final Action (ERP / WMS / Dispatch)</strong>
            <br />
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;↓
            <br />
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<strong className="text-stone-300">Actual Outcome (Sales / Waste Audit)</strong>
            <br />
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;↓
            <br />
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<strong className="text-purple-400">9. Learning Agent (Continuous Calibration)</strong>
          </div>
        </div>

        {/* The 9 Agent Profiles */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          {/* Agent 1 */}
          <div className="p-3.5 rounded-xl bg-stone-950 border border-stone-800 flex flex-col gap-1.5">
            <div className="flex items-center gap-2 font-bold text-emerald-300">
              <span className="w-5 h-5 rounded-full bg-emerald-950 border border-emerald-800 text-[10px] flex items-center justify-center font-mono">1</span>
              <span>Vision &amp; Variety</span>
            </div>
            <p className="text-stone-400 text-[11px] leading-relaxed">
              Optical phenotyping, USDA 1-6 stage, variety identification, and image quality validation gate.
            </p>
          </div>

          {/* Agent 2 */}
          <div className="p-3.5 rounded-xl bg-stone-950 border border-stone-800 flex flex-col gap-1.5">
            <div className="flex items-center gap-2 font-bold text-rose-300">
              <span className="w-5 h-5 rounded-full bg-rose-950 border border-rose-800 text-[10px] flex items-center justify-center font-mono">2</span>
              <span>Pathology &amp; Segmentation</span>
            </div>
            <p className="text-stone-400 text-[11px] leading-relaxed">
              Calculates exact defect surface area (e.g. 8.7 cm² / 74 cm² = 11.7%) and 360° multi-image fusion.
            </p>
          </div>

          {/* Agent 3 */}
          <div className="p-3.5 rounded-xl bg-stone-950 border border-stone-800 flex flex-col gap-1.5">
            <div className="flex items-center gap-2 font-bold text-cyan-300">
              <span className="w-5 h-5 rounded-full bg-cyan-950 border border-cyan-800 text-[10px] flex items-center justify-center font-mono">3</span>
              <span>Kinetic Digital Twin</span>
            </div>
            <p className="text-stone-400 text-[11px] leading-relaxed">
              Arrhenius bio-decay simulation using real IoT reefer telemetry, temperature excursions, and ethylene.
            </p>
          </div>

          {/* Agent 4 */}
          <div className="p-3.5 rounded-xl bg-stone-950 border border-stone-800 flex flex-col gap-1.5">
            <div className="flex items-center gap-2 font-bold text-amber-300">
              <span className="w-5 h-5 rounded-full bg-amber-950 border border-amber-800 text-[10px] flex items-center justify-center font-mono">4</span>
              <span>Rules Engine</span>
            </div>
            <p className="text-stone-400 text-[11px] leading-relaxed">
              Deterministic customer commercial tolerances (Zepto Quick-Commerce vs Premium vs Processing).
            </p>
          </div>

          {/* Agent 5 */}
          <div className="p-3.5 rounded-xl bg-stone-950 border border-stone-800 flex flex-col gap-1.5">
            <div className="flex items-center gap-2 font-bold text-indigo-300">
              <span className="w-5 h-5 rounded-full bg-indigo-950 border border-indigo-800 text-[10px] flex items-center justify-center font-mono">5</span>
              <span>Demand Forecast</span>
            </div>
            <p className="text-stone-400 text-[11px] leading-relaxed">
              Forecasts store-level sell-through, expected unsold kg, and triggers inter-store inventory transfer.
            </p>
          </div>

          {/* Agent 6 */}
          <div className="p-3.5 rounded-xl bg-stone-950 border border-stone-800 flex flex-col gap-1.5">
            <div className="flex items-center gap-2 font-bold text-emerald-300">
              <span className="w-5 h-5 rounded-full bg-emerald-950 border border-emerald-800 text-[10px] flex items-center justify-center font-mono">6</span>
              <span>Routing Optimizer</span>
            </div>
            <p className="text-stone-400 text-[11px] leading-relaxed">
              Evaluates multi-store network (Store 1: 82%, Store 2: 54%, Store 3: 91%) to select highest margin destination.
            </p>
          </div>

          {/* Agent 7 */}
          <div className="p-3.5 rounded-xl bg-stone-950 border border-stone-800 flex flex-col gap-1.5">
            <div className="flex items-center gap-2 font-bold text-amber-400">
              <span className="w-5 h-5 rounded-full bg-amber-950 border border-amber-800 text-[10px] flex items-center justify-center font-mono">7</span>
              <span>Pricing &amp; Markdown</span>
            </div>
            <p className="text-stone-400 text-[11px] leading-relaxed">
              8-variable dynamic markdown optimizer (shelf-life, inventory, velocity, competitor price, peak hours).
            </p>
          </div>

          {/* Agent 8 */}
          <div className="p-3.5 rounded-xl bg-stone-950 border border-stone-800 flex flex-col gap-1.5">
            <div className="flex items-center gap-2 font-bold text-rose-400">
              <span className="w-5 h-5 rounded-full bg-rose-950 border border-rose-800 text-[10px] flex items-center justify-center font-mono">8</span>
              <span>Risk &amp; Root Cause</span>
            </div>
            <p className="text-stone-400 text-[11px] leading-relaxed">
              Autonomous root cause diagnostics (e.g. 61% compression bruise) and predictive supplier risk scoring.
            </p>
          </div>

          {/* Agent 9 */}
          <div className="p-3.5 rounded-xl bg-purple-950/40 border border-purple-800 flex flex-col gap-1.5">
            <div className="flex items-center gap-2 font-bold text-purple-300">
              <span className="w-5 h-5 rounded-full bg-purple-950 border border-purple-800 text-[10px] flex items-center justify-center font-mono">9</span>
              <span>Learning &amp; Calibration</span>
            </div>
            <p className="text-stone-300 text-[11px] leading-relaxed">
              Continuous model calibration from ground-truth sales and customer refund claims.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-3 border-t border-stone-800">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors"
          >
            Close Overview
          </button>
        </div>
      </div>
    </div>
  );
};
