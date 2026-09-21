import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, ShieldAlert, AlertTriangle, Zap, Tag, ArrowRight, Check, Send, Store, Box, RotateCcw, FileText, MessageSquare } from 'lucide-react';
import { SupplierRejectionAnalytics } from './SupplierRejectionAnalytics';
import { generateInspectionPdfReport } from '../utils/pdfReportGenerator';
import type { AgriGradeReport } from '../types';

interface DarkStoreQualityGateProps {
  report: AgriGradeReport;
  batchId: string;
  supplierName: string;
  onOpenChat?: (prompt?: string) => void;
}

export const DarkStoreQualityGate: React.FC<DarkStoreQualityGateProps> = ({
  report,
  batchId,
  supplierName,
  onOpenChat,
}) => {
  const [erpSyncing, setErpSyncing] = useState(false);
  const [erpSynced, setErpSynced] = useState(false);
  const [discountPercent, setDiscountPercent] = useState<number>(
    report.inbound_action?.recommended_dynamic_discount_percent ?? 15
  );

  const inbound = report.inbound_action || {
    verdict: report.bruise_defect_index > 25 ? 'REJECTED_AT_DOCK' : report.bruise_defect_index > 10 ? 'ACCEPTED_GRADE_B' : 'ACCEPTED_GRADE_A',
    quality_score: 82,
    fast_track_dispatch_required: report.bruise_defect_index > 10,
    dispatch_window_hours: 8,
    recommended_dynamic_discount_percent: report.bruise_defect_index > 10 ? 15 : 0,
    erp_routing_tag: report.bruise_defect_index > 10 ? 'FAST_DISPATCH_DISCOUNT_15' : 'PREMIUM_RETAIL_BIN',
    disposition_notes: 'Automated dock optical inspection completed.',
    compliance_check_passed: report.bruise_defect_index <= 25,
  };

  const handleSyncErp = async () => {
    setErpSyncing(true);
    try {
      const res = await fetch('/api/erp/sync-batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          batch_id: batchId,
          verdict: inbound.verdict,
          discount_applied: discountPercent,
          routing_tag: inbound.erp_routing_tag,
        }),
      });
      if (res.ok) {
        setErpSynced(true);
      }
    } catch (e) {
      console.error('ERP sync failed:', e);
    } finally {
      setErpSyncing(false);
    }
  };

  return (
    <div className="bg-stone-900 rounded-2xl border border-stone-800 p-5 shadow-xl flex flex-col gap-5">
      {/* Dock Quality Verdict Card */}
      <div
        className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
          inbound.verdict === 'ACCEPTED_GRADE_A'
            ? 'bg-emerald-950/40 border-emerald-500/80 text-emerald-100'
            : inbound.verdict === 'ACCEPTED_GRADE_B'
            ? 'bg-amber-950/40 border-amber-500/80 text-amber-100'
            : 'bg-rose-950/40 border-rose-500/80 text-rose-100'
        }`}
      >
        <div className="flex items-start gap-3.5">
          {/* Verdict Icon with subtle pulse ring */}
          <div className="relative shrink-0">
            <motion.div
              key={`verdict-pulse-aura-${report.id}-${inbound.verdict}`}
              initial={{ scale: 0.9, opacity: 0.4 }}
              animate={{
                scale: [1, 1.28, 1],
                opacity: [0.55, 0.12, 0.55],
              }}
              transition={{
                duration: 2.2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className={`absolute -inset-1 rounded-2xl -z-10 blur-xs ${
                inbound.verdict === 'ACCEPTED_GRADE_A'
                  ? 'bg-emerald-500/40'
                  : inbound.verdict === 'ACCEPTED_GRADE_B'
                  ? 'bg-amber-500/40'
                  : 'bg-rose-500/40'
              }`}
            />
            <motion.div
              key={`verdict-icon-${report.id}-${inbound.verdict}`}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: [1, 1.04, 1], opacity: 1 }}
              transition={{
                scale: { duration: 2.2, repeat: Infinity, ease: 'easeInOut' },
                opacity: { duration: 0.25 },
              }}
              className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                inbound.verdict === 'ACCEPTED_GRADE_A'
                  ? 'bg-emerald-500 text-stone-950 shadow-md shadow-emerald-950/50'
                  : inbound.verdict === 'ACCEPTED_GRADE_B'
                  ? 'bg-amber-500 text-stone-950 shadow-md shadow-amber-950/50'
                  : 'bg-rose-500 text-white shadow-md shadow-rose-950/50'
              }`}
            >
              {inbound.verdict === 'ACCEPTED_GRADE_A' ? (
                <ShieldCheck className="w-6 h-6 stroke-[2.5]" />
              ) : inbound.verdict === 'ACCEPTED_GRADE_B' ? (
                <Zap className="w-6 h-6 stroke-[2.5]" />
              ) : (
                <ShieldAlert className="w-6 h-6 stroke-[2.5]" />
              )}
            </motion.div>
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-wider font-bold px-2 py-0.5 rounded bg-stone-950/60 border border-stone-800">
                Inbound Quality Gate
              </span>

              {/* Subtle Pulsing Verdict Badge (Accepted / Rejected) */}
              <div className="relative inline-flex items-center">
                {/* Outer attention pulse ripple on new scan */}
                <motion.span
                  key={`verdict-ripple-${report.id}-${inbound.verdict}`}
                  initial={{ opacity: 0.8, scale: 0.95 }}
                  animate={{
                    opacity: [0.75, 0],
                    scale: [1, 1.28],
                  }}
                  transition={{
                    duration: 1.8,
                    repeat: Infinity,
                    ease: 'easeOut',
                  }}
                  className={`absolute -inset-1 rounded-full pointer-events-none border ${
                    inbound.verdict === 'ACCEPTED_GRADE_A'
                      ? 'border-emerald-400/60 bg-emerald-400/10'
                      : inbound.verdict === 'ACCEPTED_GRADE_B'
                      ? 'border-amber-400/60 bg-amber-400/10'
                      : 'border-rose-400/60 bg-rose-400/15'
                  }`}
                />

                <motion.div
                  key={`verdict-pill-${report.id}-${inbound.verdict}`}
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{
                    scale: [1, 1.04, 1],
                    boxShadow:
                      inbound.verdict === 'ACCEPTED_GRADE_A'
                        ? [
                            '0 0 0 0 rgba(16, 185, 129, 0.4)',
                            '0 0 0 4px rgba(16, 185, 129, 0.15)',
                            '0 0 0 0 rgba(16, 185, 129, 0.4)',
                          ]
                        : inbound.verdict === 'ACCEPTED_GRADE_B'
                        ? [
                            '0 0 0 0 rgba(245, 158, 11, 0.4)',
                            '0 0 0 4px rgba(245, 158, 11, 0.15)',
                            '0 0 0 0 rgba(245, 158, 11, 0.4)',
                          ]
                        : [
                            '0 0 0 0 rgba(244, 63, 94, 0.45)',
                            '0 0 0 5px rgba(244, 63, 94, 0.18)',
                            '0 0 0 0 rgba(244, 63, 94, 0.45)',
                          ],
                    opacity: 1,
                  }}
                  transition={{
                    scale: { duration: 2.2, repeat: Infinity, ease: 'easeInOut' },
                    boxShadow: { duration: 2.2, repeat: Infinity, ease: 'easeInOut' },
                    opacity: { duration: 0.2 },
                  }}
                  className={`relative inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase border shadow-sm ${
                    inbound.verdict === 'ACCEPTED_GRADE_A'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                      : inbound.verdict === 'ACCEPTED_GRADE_B'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                      : 'bg-rose-500/20 text-rose-300 border-rose-500/50'
                  }`}
                >
                  <span className="relative flex h-2 w-2">
                    <span
                      className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                        inbound.verdict === 'ACCEPTED_GRADE_A'
                          ? 'bg-emerald-400'
                          : inbound.verdict === 'ACCEPTED_GRADE_B'
                          ? 'bg-amber-400'
                          : 'bg-rose-400'
                      }`}
                    />
                    <span
                      className={`relative inline-flex rounded-full h-2 w-2 ${
                        inbound.verdict === 'ACCEPTED_GRADE_A'
                          ? 'bg-emerald-400'
                          : inbound.verdict === 'ACCEPTED_GRADE_B'
                          ? 'bg-amber-400'
                          : 'bg-rose-400'
                      }`}
                    />
                  </span>
                  <span>
                    {inbound.verdict === 'ACCEPTED_GRADE_A'
                      ? 'Accepted • Grade A'
                      : inbound.verdict === 'ACCEPTED_GRADE_B'
                      ? 'Accepted • Grade B'
                      : 'Rejected at Dock'}
                  </span>
                </motion.div>
              </div>

              <span className="text-xs text-stone-300 font-mono">
                {batchId} • {supplierName}
              </span>
            </div>

            <motion.h3
              key={`verdict-heading-${report.id}`}
              initial={{ opacity: 0, y: -2 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="text-xl font-black tracking-tight mt-1"
            >
              {inbound.verdict === 'ACCEPTED_GRADE_A'
                ? 'ACCEPTED — GRADE A (PREMIUM)'
                : inbound.verdict === 'ACCEPTED_GRADE_B'
                ? 'ACCEPTED — GRADE B (FAST-TRACK DISPATCH)'
                : 'REJECTED AT DOCK (RETURN TO VENDOR)'}
            </motion.h3>
            <p className="text-xs text-stone-300 mt-1 max-w-lg leading-relaxed">
              {inbound.disposition_notes}
            </p>
            {onOpenChat && (
              <div className="mt-2 flex items-center gap-2">
                <button
                  onClick={() =>
                    onOpenChat(
                      `Why was batch ${batchId} graded as ${inbound.verdict} with a score of ${inbound.quality_score}/100?`
                    )
                  }
                  className="px-2.5 py-1 rounded-lg bg-purple-950/80 hover:bg-purple-900 border border-purple-700/80 text-[11px] font-semibold text-purple-200 flex items-center gap-1.5 transition-colors shadow-sm"
                  title="Ask zero-hallucination agent swarm about this verdict"
                >
                  <MessageSquare className="w-3 h-3 text-purple-400" />
                  <span>Ask Agents About Verdict</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Quality Score & Penetrometer Firmness */}
        <div className="flex sm:flex-col items-center sm:items-end justify-between border-t sm:border-t-0 border-stone-800/80 pt-3 sm:pt-0">
          <span className="text-xs text-stone-400 font-medium">Composite Grade</span>
          <div className="flex items-baseline gap-1">
            <motion.span
              key={`score-${report.id}-${inbound.quality_score}`}
              initial={{ scale: 1.15, opacity: 0.8 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              className={`text-2xl font-black font-mono ${
                inbound.verdict === 'ACCEPTED_GRADE_A'
                  ? 'text-emerald-400'
                  : inbound.verdict === 'ACCEPTED_GRADE_B'
                  ? 'text-amber-400'
                  : 'text-rose-400'
              }`}
            >
              {inbound.quality_score}
            </motion.span>
            <span className="text-xs font-mono text-stone-500">/100</span>
          </div>
          <span className="text-[10px] text-stone-400 font-mono">
            Firmness: {report.firmness_estimate_penetrometer} kg/cm²
          </span>
        </div>
      </div>

      {/* Defect & Bruise Breakdown */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3 rounded-xl bg-stone-950/60 border border-stone-800">
          <div className="text-[11px] text-stone-400 font-semibold uppercase">Bruise Defect Index</div>
          <div className="text-xl font-bold font-mono text-stone-100 mt-1">
            {report.bruise_defect_index.toFixed(1)}%
          </div>
          <p className="text-[10px] text-stone-500 mt-0.5">Threshold: &lt;10% Grade A, &lt;25% Grade B</p>
        </div>

        <div className="p-3 rounded-xl bg-stone-950/60 border border-stone-800">
          <div className="text-[11px] text-stone-400 font-semibold uppercase">Remaining Marketable Life</div>
          <div className="text-xl font-bold font-mono text-amber-400 mt-1">
            {report.ambient_shelf_life_days} Days
          </div>
          <p className="text-[10px] text-stone-500 mt-0.5">Under ambient dock temperature</p>
        </div>

        <div className="p-3 rounded-xl bg-stone-950/60 border border-stone-800">
          <div className="text-[11px] text-stone-400 font-semibold uppercase">Inventory Routing Bin</div>
          <div className="text-xs font-bold font-mono text-cyan-300 mt-1 truncate">
            {inbound.erp_routing_tag}
          </div>
          <p className="text-[10px] text-stone-500 mt-0.5">Assigned micro-warehouse zone</p>
        </div>
      </div>

      {/* Surface Anomalies List */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-stone-300">Surface Defect Classification</span>
          <span className="text-stone-400 font-mono text-[11px]">{report.defects.length} detected anomaly</span>
        </div>
        <div className="space-y-2">
          {report.defects.map((d) => (
            <div
              key={d.id}
              className="p-3 rounded-xl bg-stone-950 border border-stone-800 flex items-center justify-between gap-3 text-xs"
            >
              <div className="flex items-center gap-2.5">
                <span
                  className={`w-2 h-2 rounded-full ${
                    d.severity === 'CRITICAL' ? 'bg-rose-400' : d.severity === 'COMMERCIAL_ACCEPTABLE' ? 'bg-amber-400' : 'bg-emerald-400'
                  }`}
                />
                <div>
                  <div className="font-semibold text-stone-200">{d.defect_type}</div>
                  <div className="text-[11px] text-stone-400">{d.description}</div>
                </div>
              </div>
              <div className="text-right shrink-0">
                <span className="font-mono text-stone-300 font-bold">{d.surface_area_percentage}% Area</span>
                <div className="text-[10px] uppercase font-mono text-stone-500">{d.severity}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Dynamic Pricing / Flash-Sale Trigger & Consumer App Preview */}
      {inbound.verdict === 'ACCEPTED_GRADE_B' && (
        <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-800/60 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-amber-400" />
              <h4 className="text-xs font-bold text-amber-200 uppercase tracking-wider">
                Automated Dynamic Flash Markdown Trigger
              </h4>
            </div>
            <span className="text-[10px] font-mono bg-amber-900/60 text-amber-300 px-2 py-0.5 rounded border border-amber-700/60">
              Dispatches &lt; 8 Hours
            </span>
          </div>
          <p className="text-xs text-stone-300">
            Because remaining shelf life is under 3 days, Agent 4 automatically triggers a dynamic discount on consumer delivery apps (Zepto/Blinkit/Instacart) to sell through inventory before spoilage.
          </p>

          {/* Discount Slider */}
          <div className="flex items-center gap-4 bg-stone-950/80 p-3 rounded-xl border border-stone-800">
            <span className="text-xs font-semibold text-stone-400">Discount:</span>
            <input
              type="range"
              min="5"
              max="35"
              step="5"
              value={discountPercent}
              onChange={(e) => setDiscountPercent(Number(e.target.value))}
              className="flex-1 accent-amber-500 cursor-pointer"
            />
            <span className="font-mono text-sm font-black text-amber-400 w-12 text-right">
              -{discountPercent}%
            </span>
          </div>

          {/* Quick-Commerce Consumer App Mockup */}
          <div className="p-3 rounded-lg bg-stone-950 border border-stone-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                <Store className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-stone-100 flex items-center gap-1.5">
                  <span>⚡ Quick-Commerce Flash Deal</span>
                  <span className="text-[9px] bg-rose-950 text-rose-300 px-1.5 py-0.2 rounded font-mono">
                    -{discountPercent}% OFF
                  </span>
                </div>
                <div className="text-[11px] text-stone-400">
                  {report.produce_type} ({report.variety_detected}) • 10-Min Delivery Fresh Batch
                </div>
              </div>
            </div>
            <span className="text-[11px] font-mono text-emerald-400 font-bold hidden sm:block">
              Auto-Live on Storefront
            </span>
          </div>
        </div>
      )}

      {/* Reject Notice if REJECTED_AT_DOCK */}
      {inbound.verdict === 'REJECTED_AT_DOCK' && (
        <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-800/80 flex items-start gap-3">
          <RotateCcw className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div className="text-xs">
            <h4 className="font-bold text-rose-200 uppercase tracking-wider">
              Automatic RMA Rejection Notice Generated
            </h4>
            <p className="text-stone-300 mt-1 leading-relaxed">
              Batch {batchId} failed commercial threshold (Bruise index {report.bruise_defect_index}% exceeds maximum 25%). Dock debit memo issued to {supplierName}. Produce routed to isolation bay for vendor pickup.
            </p>
          </div>
        </div>
      )}

      {/* 30-Day Supplier Rejection Analytics (Recharts) */}
      <SupplierRejectionAnalytics currentSupplier={supplierName} />

      {/* ERP Sync Webhook Action & PDF Export */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-stone-800">
        <div className="text-xs text-stone-400">
          Dark Store WMS: <span className="font-mono text-stone-200">SAP & Zepto Core API</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() =>
              generateInspectionPdfReport({
                report,
                batchId,
                supplierName,
              })
            }
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-stone-850 hover:bg-stone-800 border border-stone-700 text-stone-200 flex items-center gap-1.5 transition-colors"
            title="Download PDF Quality Gate Certificate"
          >
            <FileText className="w-3.5 h-3.5 text-cyan-400" />
            <span>PDF Certificate</span>
          </button>

          {onOpenChat && (
            <button
              onClick={() => onOpenChat()}
              className="px-3 py-2 rounded-xl text-xs font-semibold bg-purple-950 hover:bg-purple-900 border border-purple-700/80 text-purple-200 flex items-center gap-1.5 transition-colors shadow-sm"
              title="Open full Agent Chat Mode"
            >
              <MessageSquare className="w-3.5 h-3.5 text-purple-400" />
              <span>Chat with Agents</span>
            </button>
          )}

          <button
            onClick={handleSyncErp}
            disabled={erpSyncing || erpSynced}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
              erpSynced
                ? 'bg-emerald-950 border border-emerald-600 text-emerald-300'
                : 'bg-emerald-500 hover:bg-emerald-400 text-stone-950 shadow-md'
            }`}
          >
            {erpSyncing ? (
              <span>Syncing to ERP...</span>
            ) : erpSynced ? (
              <>
                <Check className="w-4 h-4" />
                <span>Committed to ERP & Warehouse</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Commit Inbound Batch to ERP</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
