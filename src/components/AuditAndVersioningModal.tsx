import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  ShieldCheck,
  History,
  Cpu,
  FileText,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  UserCheck,
  ChevronRight,
  Download,
  X,
  Sparkles,
} from 'lucide-react';
import { CURRENT_MODEL_PROVENANCE, INITIAL_AUDIT_TRAIL } from '../utils/auditAndVersioningEngine';
import type { ComprehensiveAuditRecord } from '../types';

interface AuditAndVersioningModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuditAndVersioningModal: React.FC<AuditAndVersioningModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [trail, setTrail] = useState<ComprehensiveAuditRecord[]>(INITIAL_AUDIT_TRAIL);
  const [filterType, setFilterType] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      fetch('/api/audit/trail')
        .then((res) => res.json())
        .then((data) => {
          if (data.trail) {
            setTrail(data.trail);
          }
        })
        .catch((e) => console.warn('Could not fetch server audit trail:', e));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredTrail = trail.filter((item) => {
    const matchesType = filterType === 'ALL' || item.eventType === filterType;
    const matchesSearch =
      searchQuery === '' ||
      item.batchId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.actor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.produceType.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-4xl bg-stone-900 border border-stone-800 rounded-3xl shadow-2xl p-5 sm:p-6 max-h-[90vh] overflow-y-auto flex flex-col gap-5"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
              <History className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-purple-400 font-bold">
                Item 15 & Item 16
              </span>
              <h3 className="text-sm font-black text-white">
                Enterprise Audit Trail & AI Provenance Registry
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-750 text-stone-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Model & Prompt Versioning Provenance Card (Item 16 specification) */}
        <div className="bg-stone-950 p-4 rounded-xl border border-stone-800 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
              <Cpu className="w-4 h-4 text-purple-400" />
              <span>Active Model & Engine Provenance (Reproducibility Guarantee)</span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800 font-bold">
              100% Deterministic Provenance
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs font-mono">
            <div className="bg-stone-900/80 p-2.5 rounded-lg border border-stone-800">
              <span className="text-[10px] text-stone-500 uppercase">Vision Model</span>
              <div className="font-bold text-emerald-400 mt-0.5">{CURRENT_MODEL_PROVENANCE.visionModel}</div>
            </div>

            <div className="bg-stone-900/80 p-2.5 rounded-lg border border-stone-800">
              <span className="text-[10px] text-stone-500 uppercase">Model Version</span>
              <div className="font-bold text-white mt-0.5">{CURRENT_MODEL_PROVENANCE.modelVersion}</div>
            </div>

            <div className="bg-stone-900/80 p-2.5 rounded-lg border border-stone-800">
              <span className="text-[10px] text-stone-500 uppercase">Prompt Version</span>
              <div className="font-bold text-cyan-400 mt-0.5">{CURRENT_MODEL_PROVENANCE.promptVersion}</div>
            </div>

            <div className="bg-stone-900/80 p-2.5 rounded-lg border border-stone-800">
              <span className="text-[10px] text-stone-500 uppercase">Kinetic Engine</span>
              <div className="font-bold text-amber-400 mt-0.5">{CURRENT_MODEL_PROVENANCE.kineticEngineVersion}</div>
            </div>

            <div className="bg-stone-900/80 p-2.5 rounded-lg border border-stone-800">
              <span className="text-[10px] text-stone-500 uppercase">Rules Engine</span>
              <div className="font-bold text-purple-400 mt-0.5">{CURRENT_MODEL_PROVENANCE.rulesEngineVersion}</div>
            </div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-stone-500" />
            <input
              type="text"
              placeholder="Search batch, inspector, or produce..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-stone-950 border border-stone-800 rounded-lg px-2.5 py-1 text-xs text-stone-200 focus:outline-none focus:border-purple-500"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto">
            {['ALL', 'INITIAL_INSPECTION', 'HUMAN_OVERRIDE', 'ROUTING_DISPATCH'].map((t) => (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-mono transition-colors ${
                  filterType === t
                    ? 'bg-purple-600 text-white font-bold'
                    : 'bg-stone-950 text-stone-400 hover:text-stone-200'
                }`}
              >
                {t.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Immutable Audit Log Records Table (Item 15 specification) */}
        <div className="flex flex-col gap-2.5 max-h-80 overflow-y-auto pr-1">
          {filteredTrail.map((record) => (
            <div
              key={record.auditId}
              className={`p-3.5 rounded-xl border flex flex-col gap-2 text-xs ${
                record.eventType === 'HUMAN_OVERRIDE'
                  ? 'bg-amber-950/20 border-amber-800/80'
                  : 'bg-stone-950 border-stone-800'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-purple-400 font-bold">{record.auditId}</span>
                  <span className="text-stone-500">•</span>
                  <span className="text-stone-300 font-semibold">{record.batchId}</span>
                  <span className="text-[10px] font-mono text-stone-500">({record.produceType} - {record.variety})</span>
                </div>

                <div className="flex items-center gap-2 font-mono text-[10px]">
                  <span className="text-stone-400">{record.timestamp}</span>
                  <span
                    className={`px-2 py-0.5 rounded font-bold uppercase ${
                      record.verdict.includes('GRADE_A')
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        : record.verdict.includes('GRADE_B')
                        ? 'bg-amber-950 text-amber-300 border border-amber-800'
                        : 'bg-rose-950 text-rose-300 border border-rose-800'
                    }`}
                  >
                    {record.verdict}
                  </span>
                </div>
              </div>

              {/* Who, What, Why, Model Version Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-stone-800/80 text-[11px]">
                <div>
                  <span className="text-stone-500">Who (Actor):</span>
                  <div className="text-stone-200 font-medium">{record.actor}</div>
                </div>
                <div>
                  <span className="text-stone-500">Model Provenance:</span>
                  <div className="font-mono text-stone-300">{record.modelVersion} • {record.promptVersion}</div>
                </div>
                <div>
                  <span className="text-stone-500">Why (Reason):</span>
                  <div className="text-stone-300 line-clamp-1">{record.reasonSummary}</div>
                </div>
              </div>

              {/* Specific Human Override Breakdown if applicable */}
              {record.humanOverrideDetails && (
                <div className="p-2.5 rounded-lg bg-amber-950/30 border border-amber-700/60 flex items-start gap-2 text-[11px] text-amber-200">
                  <UserCheck className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Human Override Captured:</span> Changed from{' '}
                    <span className="line-through text-stone-400">{record.humanOverrideDetails.originalVerdict}</span> to{' '}
                    <strong className="text-emerald-300">{record.humanOverrideDetails.newVerdict}</strong> by{' '}
                    {record.humanOverrideDetails.inspectorName}. Reason: "{record.humanOverrideDetails.overrideReason}"
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};
