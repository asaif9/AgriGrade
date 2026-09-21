import React, { useState, useMemo } from 'react';
import {
  History,
  ChevronDown,
  ChevronUp,
  Clock,
  Tag,
  Building2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowRight,
  Download,
  Trash2,
  Filter,
  Search,
  Eye,
  Sprout,
  Warehouse,
  Sparkles,
  FileSpreadsheet,
  FileText,
} from 'lucide-react';
import { generateInspectionPdfReport } from '../utils/pdfReportGenerator';
import type { AuditScanRecord } from '../types';

interface AuditHistorySectionProps {
  history: AuditScanRecord[];
  onSelectRecord?: (record: AuditScanRecord) => void;
  onClearHistory?: () => void;
  activeReportId?: string | null;
}

export const AuditHistorySection: React.FC<AuditHistorySectionProps> = ({
  history,
  onSelectRecord,
  onClearHistory,
  activeReportId,
}) => {
  // Collapsible state (defaults to open if there are records, or user can toggle)
  const [isOpen, setIsOpen] = useState<boolean>(true);
  const [filterVerdict, setFilterVerdict] = useState<'ALL' | 'ACCEPTED' | 'REJECTED' | 'HARVEST'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Filtered list
  const filteredHistory = useMemo(() => {
    return history.filter((item) => {
      // Filter by verdict category
      if (filterVerdict === 'ACCEPTED') {
        if (!item.finalDecision.verdict.startsWith('ACCEPTED')) return false;
      } else if (filterVerdict === 'REJECTED') {
        if (item.finalDecision.verdict !== 'REJECTED_AT_DOCK') return false;
      } else if (filterVerdict === 'HARVEST') {
        if (!item.finalDecision.verdict.includes('HARVEST')) return false;
      }

      // Filter by search query (batch ID, supplier, produce type)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesBatch = item.batchId.toLowerCase().includes(q);
        const matchesSupplier = item.supplierName.toLowerCase().includes(q);
        const matchesProduce = item.produceType.toLowerCase().includes(q);
        const matchesVerdict = item.finalDecision.label.toLowerCase().includes(q);
        return matchesBatch || matchesSupplier || matchesProduce || matchesVerdict;
      }

      return true;
    });
  }, [history, filterVerdict, searchQuery]);

  // Export audit session as CSV
  const handleExportCSV = () => {
    if (history.length === 0) return;

    const headers = [
      'Timestamp',
      'Batch ID',
      'Supplier',
      'Mode',
      'Produce',
      'Variety',
      'Final Decision Verdict',
      'Decision Label',
      'Decision Summary',
      'Quality Score / Confidence',
      'USDA Maturity Stage',
    ];

    const rows = history.map((item) => {
      return [
        `"${item.timestamp}"`,
        `"${item.batchId}"`,
        `"${item.supplierName}"`,
        `"${item.mode}"`,
        `"${item.produceType}"`,
        `"${item.varietyDetected || ''}"`,
        `"${item.finalDecision.verdict}"`,
        `"${item.finalDecision.label}"`,
        `"${item.finalDecision.summary.replace(/"/g, '""')}"`,
        item.qualityScore ?? item.report.confidence,
        `"Stage ${item.report.usda_color_stage} - ${item.report.stage_name}"`,
      ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Session_Audit_History_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const latestRecord = history[0];

  return (
    <div className="rounded-2xl bg-stone-900 border border-stone-800 shadow-xl overflow-hidden transition-all">
      {/* Collapsible Header */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="p-4 sm:p-5 flex items-center justify-between cursor-pointer hover:bg-stone-850/60 transition-colors select-none"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-800/80 flex items-center justify-center text-cyan-400 shrink-0">
            <History className="w-5 h-5" />
          </div>

          <div>
            <div className="flex items-center gap-2.5">
              <h3 className="text-base font-bold text-white">Session Audit History</h3>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-700/80">
                {history.length} {history.length === 1 ? 'Scan' : 'Scans'}
              </span>
            </div>
            <p className="text-xs text-stone-400 mt-0.5">
              Chronological ledger of timestamps, crate batch IDs, and multi-agent gate verdicts for this session.
            </p>
          </div>
        </div>

        {/* Right side summary / Chevron */}
        <div className="flex items-center gap-3">
          {/* Collapsed mini indicator of latest scan */}
          {!isOpen && latestRecord && (
            <div className="hidden sm:flex items-center gap-2 text-xs font-mono bg-stone-950 px-3 py-1.5 rounded-lg border border-stone-800">
              <span className="text-stone-500">Latest:</span>
              <span className="text-stone-200 font-bold">{latestRecord.batchId}</span>
              <span
                className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                  latestRecord.finalDecision.color === 'emerald'
                    ? 'bg-emerald-950 text-emerald-400'
                    : latestRecord.finalDecision.color === 'rose'
                    ? 'bg-rose-950 text-rose-400'
                    : 'bg-amber-950 text-amber-400'
                }`}
              >
                {latestRecord.finalDecision.label}
              </span>
            </div>
          )}

          <button
            type="button"
            className="w-8 h-8 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 flex items-center justify-center transition-colors"
            aria-label={isOpen ? 'Collapse Audit History' : 'Expand Audit History'}
          >
            {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Expanded Content Body */}
      {isOpen && (
        <div className="border-t border-stone-800 p-4 sm:p-5 flex flex-col gap-4">
          {/* Controls: Search, Filter tabs, Export, Clear */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Filter buttons */}
            <div className="flex items-center gap-1.5 bg-stone-950 p-1 rounded-xl border border-stone-800 text-xs overflow-x-auto">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setFilterVerdict('ALL');
                }}
                className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                  filterVerdict === 'ALL'
                    ? 'bg-stone-800 text-white shadow-sm'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                All ({history.length})
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setFilterVerdict('ACCEPTED');
                }}
                className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                  filterVerdict === 'ACCEPTED'
                    ? 'bg-emerald-950 border border-emerald-700 text-emerald-300'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                Accepted
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setFilterVerdict('REJECTED');
                }}
                className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                  filterVerdict === 'REJECTED'
                    ? 'bg-rose-950 border border-rose-700 text-rose-300'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                Rejected
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setFilterVerdict('HARVEST');
                }}
                className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                  filterVerdict === 'HARVEST'
                    ? 'bg-cyan-950 border border-cyan-700 text-cyan-300'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                Field Decisions
              </button>
            </div>

            {/* Actions: Search & Export */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1 sm:w-48">
                <Search className="w-3.5 h-3.5 text-stone-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter batch or supplier..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-stone-950 border border-stone-800 text-xs text-stone-200 placeholder-stone-500 focus:outline-none focus:border-cyan-600 font-mono"
                />
              </div>

              {history.length > 0 && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleExportCSV();
                    }}
                    className="px-2.5 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 border border-stone-700 text-stone-300 hover:text-white text-xs font-medium flex items-center gap-1.5 transition-colors shrink-0"
                    title="Export session audit history as CSV"
                  >
                    <Download className="w-3.5 h-3.5 text-cyan-400" />
                    <span className="hidden sm:inline">Export CSV</span>
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const target =
                        history.find(
                          (h) => h.id === activeReportId || h.report.id === activeReportId
                        ) || history[0];
                      if (target) {
                        generateInspectionPdfReport({
                          report: target.report,
                          batchId: target.batchId,
                          supplierName: target.supplierName,
                          imageUrl: target.thumbnailUrl,
                        });
                      }
                    }}
                    className="px-2.5 py-1.5 rounded-lg bg-cyan-950 hover:bg-cyan-900 border border-cyan-700/80 text-cyan-200 text-xs font-medium flex items-center gap-1.5 transition-colors shrink-0"
                    title="Download official PDF report for current/latest scan"
                  >
                    <FileText className="w-3.5 h-3.5 text-cyan-400" />
                    <span className="hidden sm:inline">Export PDF</span>
                  </button>

                  {onClearHistory && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm('Clear current session audit logs?')) {
                          onClearHistory();
                        }
                      }}
                      className="p-1.5 rounded-lg bg-stone-800/80 hover:bg-rose-950/60 hover:text-rose-400 border border-stone-700/80 text-stone-400 text-xs transition-colors shrink-0"
                      title="Clear session audit log"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </>
              )}
            </div>
          </div>

          {/* List of Scans */}
          {filteredHistory.length === 0 ? (
            <div className="text-center py-8 px-4 rounded-xl bg-stone-950/50 border border-stone-800/80 text-stone-400">
              <History className="w-8 h-8 text-stone-600 mx-auto mb-2" />
              <p className="text-sm font-semibold text-stone-300">
                {history.length === 0 ? 'No Scans Recorded in This Session Yet' : 'No Scans Match Filter'}
              </p>
              <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
                {history.length === 0
                  ? 'Perform vine scans in Field Mode or inspect incoming produce in Dark Store Mode to track audit records.'
                  : 'Try adjusting your search criteria or switching to the "All" filter.'}
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-2.5">
              {filteredHistory.map((item, idx) => {
                const isActive = activeReportId === item.id;
                const isField = item.mode === 'FIELD_PRE_HARVEST';

                return (
                  <div
                    key={item.id}
                    className={`p-3 sm:p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      isActive
                        ? 'bg-stone-950 border-cyan-500 shadow-md shadow-cyan-950/40'
                        : 'bg-stone-950/70 border-stone-800/90 hover:border-stone-700 hover:bg-stone-900/60'
                    }`}
                  >
                    {/* Left: Thumbnail & Core Identification */}
                    <div className="flex items-start sm:items-center gap-3 min-w-0">
                      {/* Thumbnail or Icon */}
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-stone-900 border border-stone-800 shrink-0 flex items-center justify-center">
                        {item.thumbnailUrl ? (
                          <img
                            src={item.thumbnailUrl}
                            alt={item.batchId}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="text-stone-500">
                            {isField ? <Sprout className="w-5 h-5" /> : <Warehouse className="w-5 h-5" />}
                          </div>
                        )}
                      </div>

                      {/* Batch & Supplier Details */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-xs font-bold text-stone-100 flex items-center gap-1">
                            <Tag className="w-3 h-3 text-cyan-400" />
                            {item.batchId}
                          </span>

                          <span className="text-[10px] font-mono px-2 py-0.2 rounded bg-stone-900 border border-stone-800 text-stone-400">
                            {isField ? 'Field Vine' : 'Dock Gate'}
                          </span>

                          {item.varietyDetected && (
                            <span className="text-[10px] text-stone-400">
                              {item.produceType} ({item.varietyDetected})
                            </span>
                          )}

                          {idx === 0 && (
                            <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                              LATEST
                            </span>
                          )}
                        </div>

                        {/* Supplier and Timestamp */}
                        <div className="flex items-center gap-3 text-xs text-stone-400 mt-1">
                          <span className="flex items-center gap-1 truncate max-w-[200px] sm:max-w-none">
                            <Building2 className="w-3 h-3 text-amber-400 shrink-0" />
                            <span className="truncate">{item.supplierName}</span>
                          </span>

                          <span className="text-stone-600">•</span>

                          <span className="flex items-center gap-1 font-mono text-[11px] text-stone-400 shrink-0">
                            <Clock className="w-3 h-3 text-stone-500" />
                            {item.displayTime}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Final Decision Badge & Action */}
                    <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-stone-800/80">
                      <div className="text-left sm:text-right">
                        <div className="flex items-center sm:justify-end gap-1.5">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold font-mono border ${
                              item.finalDecision.color === 'emerald'
                                ? 'bg-emerald-950/80 border-emerald-600 text-emerald-300'
                                : item.finalDecision.color === 'rose'
                                ? 'bg-rose-950/80 border-rose-600 text-rose-300'
                                : item.finalDecision.color === 'cyan'
                                ? 'bg-cyan-950/80 border-cyan-600 text-cyan-300'
                                : 'bg-amber-950/80 border-amber-600 text-amber-300'
                            }`}
                          >
                            {item.finalDecision.color === 'emerald' && (
                              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            )}
                            {item.finalDecision.color === 'rose' && (
                              <XCircle className="w-3 h-3 text-rose-400" />
                            )}
                            {item.finalDecision.color === 'amber' && (
                              <AlertTriangle className="w-3 h-3 text-amber-400" />
                            )}
                            <span>{item.finalDecision.label}</span>
                          </span>
                        </div>

                        <div className="text-[11px] text-stone-400 mt-1 truncate max-w-[260px] sm:max-w-[300px]">
                          {item.finalDecision.summary}
                        </div>
                      </div>

                      {/* Item Action Buttons: Inspect & Download PDF */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            generateInspectionPdfReport({
                              report: item.report,
                              batchId: item.batchId,
                              supplierName: item.supplierName,
                              imageUrl: item.thumbnailUrl,
                            });
                          }}
                          className="p-2 rounded-lg text-xs font-medium bg-stone-850 hover:bg-cyan-950/80 text-stone-300 hover:text-cyan-300 border border-stone-700 hover:border-cyan-700 transition-colors flex items-center gap-1"
                          title="Download PDF Quality Report for this scan"
                        >
                          <FileText className="w-3.5 h-3.5 text-cyan-400" />
                          <span className="hidden sm:inline">PDF</span>
                        </button>

                        {onSelectRecord && (
                          <button
                            onClick={() => onSelectRecord(item)}
                            className={`p-2 rounded-lg text-xs font-medium transition-colors flex items-center gap-1 ${
                              isActive
                                ? 'bg-cyan-900/60 text-cyan-300 border border-cyan-700'
                                : 'bg-stone-850 hover:bg-stone-800 text-stone-300 hover:text-white border border-stone-700'
                            }`}
                            title="Review this scan report in detail"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span className="hidden md:inline">{isActive ? 'Viewing' : 'Inspect'}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
