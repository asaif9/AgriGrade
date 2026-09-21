import React, { useState } from 'react';
import { Cpu, CheckCircle2, ChevronDown, ChevronRight, Clock, ShieldCheck, Zap, Layers, Sparkles } from 'lucide-react';
import type { AgentTraceStep } from '../types';

interface MultiAgentTraceProps {
  traces: AgentTraceStep[];
}

export const MultiAgentTrace: React.FC<MultiAgentTraceProps> = ({ traces }) => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

  const toggleExpand = (idx: number) => {
    setExpandedIndex(expandedIndex === idx ? null : idx);
  };

  return (
    <div className="bg-stone-900 rounded-2xl border border-stone-800 p-4 sm:p-5 shadow-xl flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-950 border border-emerald-800 flex items-center justify-center text-emerald-400">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-stone-100 flex items-center gap-2">
              Multi-Agent Orchestration Swarm
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/80">
                {traces.length} Active Agents
              </span>
            </h3>
            <p className="text-[11px] text-stone-400">
              Autonomous reasoning & deterministic mathematical pipelines
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-[11px] font-mono text-stone-400 bg-stone-950 px-2 py-1 rounded border border-stone-800">
          <Clock className="w-3 h-3 text-emerald-400" />
          <span>
            Total: {traces.reduce((acc, t) => acc + (t.latency_ms || 0), 0)}ms
          </span>
        </div>
      </div>

      {/* Agents Waterfall */}
      <div className="space-y-2 mt-1">
        {traces.map((trace, idx) => {
          const isExpanded = expandedIndex === idx;
          return (
            <div
              key={idx}
              className={`rounded-xl border transition-all ${
                isExpanded
                  ? 'bg-stone-950 border-stone-700 shadow-md'
                  : 'bg-stone-950/50 border-stone-800/80 hover:border-stone-700'
              }`}
            >
              <button
                onClick={() => toggleExpand(idx)}
                className="w-full p-3 flex items-center justify-between gap-3 text-left"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-mono font-bold shrink-0 ${
                      trace.status === 'completed'
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        : 'bg-amber-950 text-amber-400 border border-amber-800'
                    }`}
                  >
                    {idx + 1}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-stone-200">{trace.agent_name}</div>
                    <div className="text-[10px] text-stone-400 font-mono">{trace.role}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono text-stone-400 hidden sm:inline">
                    {trace.latency_ms}ms
                  </span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4 text-stone-400" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-stone-400" />
                  )}
                </div>
              </button>

              {isExpanded && (
                <div className="px-3 pb-3 pt-1 border-t border-stone-800/80 flex flex-col gap-2 text-xs">
                  <p className="text-stone-300 leading-relaxed bg-stone-900/60 p-2.5 rounded-lg border border-stone-800/60 font-sans">
                    {trace.summary}
                  </p>

                  {/* Findings breakdown */}
                  {trace.findings && (
                    <div className="bg-stone-900/90 rounded-lg p-2.5 border border-stone-800 font-mono text-[11px] text-stone-400 overflow-x-auto">
                      <div className="text-[10px] text-stone-500 font-bold uppercase mb-1">
                        Agent Payload Output
                      </div>
                      <pre className="text-emerald-400/90 whitespace-pre-wrap">
                        {JSON.stringify(trace.findings, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
