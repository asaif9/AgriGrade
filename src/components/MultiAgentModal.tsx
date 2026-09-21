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
            End-to-End Multi-Agent Swarm Pipeline
          </div>
          <div className="text-stone-400 leading-relaxed">
            [Camera Stream / Upload] ──&gt; [Laplacian Variance &amp; Reticle HUD Check]
            <br />
            &nbsp;&nbsp;│
            <br />
            &nbsp;&nbsp;├──► <strong className="text-emerald-300">Agent 1: Optical Perception &amp; Phenotyping</strong> (USDA 1-6 Stage, Variety, Bruise %)
            <br />
            &nbsp;&nbsp;│&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;│
            <br />
            &nbsp;&nbsp;│&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;▼
            <br />
            &nbsp;&nbsp;├──► <strong className="text-lime-300">Agent 2: Kinetic Decay &amp; Agronomy Engine</strong> (Arrhenius &amp; Respiration Q10 Formula)
            <br />
            &nbsp;&nbsp;│&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;│
            <br />
            &nbsp;&nbsp;├──► [Branch by Context Mode]
            <br />
            &nbsp;&nbsp;│&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├─► <strong className="text-cyan-300">Agent 3: Field Decision &amp; Logistics Routing</strong> (Pick Now vs Hold, Lorry Route)
            <br />
            &nbsp;&nbsp;│&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;└─► <strong className="text-amber-300">Agent 4: Inbound Quality Gate &amp; Dynamic Markdown</strong> (A/B/Reject, Flash -15%, ERP)
          </div>
        </div>

        {/* The 4 Agent Profiles */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          {/* Agent 1 */}
          <div className="p-3.5 rounded-xl bg-stone-950/70 border border-stone-800 flex flex-col gap-1.5">
            <div className="flex items-center gap-2 font-bold text-emerald-300">
              <span className="w-5 h-5 rounded-full bg-emerald-950 border border-emerald-800 text-[10px] flex items-center justify-center font-mono">
                1
              </span>
              <span>Agent 1: Optical Perception &amp; Phenotyping</span>
            </div>
            <p className="text-stone-400 text-[11px] leading-relaxed">
              Processes the incoming image or high-res capture. Analyzes chlorophyll breakdown (green to lycopene red), identifies variety, and segments mechanical punctures, compression bruises, and fungal sporulation.
            </p>
          </div>

          {/* Agent 2 */}
          <div className="p-3.5 rounded-xl bg-stone-950/70 border border-stone-800 flex flex-col gap-1.5">
            <div className="flex items-center gap-2 font-bold text-lime-300">
              <span className="w-5 h-5 rounded-full bg-lime-950 border border-lime-800 text-[10px] flex items-center justify-center font-mono">
                2
              </span>
              <span>Agent 2: Kinetic Shelf-Life Decay Engine</span>
            </div>
            <p className="text-stone-400 text-[11px] leading-relaxed">
              Executes the post-harvest kinetic respiration formula using real ambient field/dock temperature, bruise penalty coefficient, and commodity baseline shelf life to output remaining days under ambient vs cold storage.
            </p>
          </div>

          {/* Agent 3 */}
          <div className="p-3.5 rounded-xl bg-stone-950/70 border border-stone-800 flex flex-col gap-1.5">
            <div className="flex items-center gap-2 font-bold text-cyan-300">
              <span className="w-5 h-5 rounded-full bg-cyan-950 border border-cyan-800 text-[10px] flex items-center justify-center font-mono">
                3
              </span>
              <span>Agent 3: Pre-Harvest Decision &amp; Logistics Routing</span>
            </div>
            <p className="text-stone-400 text-[11px] leading-relaxed">
              Field Mode specialist. Correlates produce biochemical stage with planned transit distance (km) and road transit hours to prevent premature or overripe harvests, directing crops to optimal channels.
            </p>
          </div>

          {/* Agent 4 */}
          <div className="p-3.5 rounded-xl bg-stone-950/70 border border-stone-800 flex flex-col gap-1.5">
            <div className="flex items-center gap-2 font-bold text-amber-300">
              <span className="w-5 h-5 rounded-full bg-amber-950 border border-amber-800 text-[10px] flex items-center justify-center font-mono">
                4
              </span>
              <span>Agent 4: Inbound Quality Gate &amp; Dynamic Markdown</span>
            </div>
            <p className="text-stone-400 text-[11px] leading-relaxed">
              Dark Store Mode specialist. Evaluates incoming crates in &lt;2 seconds, assigns Grade A/B/Reject disposition, and triggers automated flash markdown discounts on consumer quick-commerce storefronts to clear inventory.
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
