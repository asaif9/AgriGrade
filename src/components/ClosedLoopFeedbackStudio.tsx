import React, { useState, useEffect, useMemo } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  AreaChart,
  Area,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  ScatterChart,
  Scatter,
  ReferenceLine,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  RefreshCw,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Layers,
  Activity,
  Boxes,
  Truck,
  Building2,
  Clock,
  ShieldCheck,
  Award,
  Zap,
  HelpCircle,
  PlusCircle,
  Send,
  Eye,
  Sliders,
  DollarSign,
  Trash2,
  Database,
  History,
} from 'lucide-react';
import type {
  ActualOutcomeRecord,
  BatchLifecycleStage,
  ModelImprovementMetrics,
  LifecycleStageName,
} from '../types';

interface ClosedLoopFeedbackStudioProps {
  onSelectBatchForScan?: (batchId: string) => void;
  onNavigateToScan?: () => void;
  currentReportBatchId?: string;
}

export const ClosedLoopFeedbackStudio: React.FC<ClosedLoopFeedbackStudioProps> = ({
  onSelectBatchForScan,
  onNavigateToScan,
  currentReportBatchId,
}) => {
  const [metrics, setMetrics] = useState<ModelImprovementMetrics | null>(null);
  const [completedBatches, setCompletedBatches] = useState<ActualOutcomeRecord[]>([]);
  const [activeBatches, setActiveBatches] = useState<ActualOutcomeRecord[]>([]);
  const [selectedBatchId, setSelectedBatchId] = useState<string>('CRATE-TOM-8821');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showLogModal, setShowLogModal] = useState<boolean>(false);
  const [feedbackSuccessNotice, setFeedbackSuccessNotice] = useState<string | null>(null);

  // Form state for logging actual outcome
  const [formBatchId, setFormBatchId] = useState<string>('CRATE-LIVE-103');
  const [formSupplier, setFormSupplier] = useState<string>('GreenField Organic Farms #4');
  const [formCrop, setFormCrop] = useState<string>('Tomato (Turning)');
  const [formPredictedDays, setFormPredictedDays] = useState<number>(2.8);
  const [formPredictedWaste, setFormPredictedWaste] = useState<number>(8.5);
  const [formActualDays, setFormActualDays] = useState<number>(2.7);
  const [formActualSellThrough, setFormActualSellThrough] = useState<number>(93.5);
  const [formActualWaste, setFormActualWaste] = useState<number>(6.5);
  const [formRefundClaims, setFormRefundClaims] = useState<number>(0);
  const [formNotes, setFormNotes] = useState<string>('Expedited via 10% markdown. Cleared before softening with 0 consumer refund claims.');

  // Fetch feedback metrics and batches from server
  const loadFeedbackData = async () => {
    try {
      setIsLoading(true);
      const [mRes, bRes] = await Promise.all([
        fetch('/api/feedback/metrics'),
        fetch('/api/feedback/batches'),
      ]);

      if (mRes.ok) {
        const mData = await mRes.json();
        setMetrics(mData.metrics);
      }
      if (bRes.ok) {
        const bData = await bRes.json();
        setCompletedBatches(bData.completed || []);
        setActiveBatches(bData.active || []);
        if (bData.completed?.length && !selectedBatchId) {
          setSelectedBatchId(bData.completed[0].batchId);
        }
      }
    } catch (err) {
      console.warn('Feedback API warning, loaded local state:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadFeedbackData();
  }, []);

  const allBatches = useMemo(() => {
    return [...activeBatches, ...completedBatches];
  }, [activeBatches, completedBatches]);

  const selectedBatch = useMemo(() => {
    return allBatches.find((b) => b.batchId === selectedBatchId) || completedBatches[0] || activeBatches[0];
  }, [allBatches, selectedBatchId, completedBatches, activeBatches]);

  // Handle actual outcome submission to close feedback loop
  const handleSubmitOutcome = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        batchId: formBatchId,
        supplierName: formSupplier,
        crop: formCrop,
        predictedAmbientShelfLifeDays: Number(formPredictedDays),
        predictedWastePct: Number(formPredictedWaste),
        actualDaysToDegradation: Number(formActualDays),
        actualSellThroughPct: Number(formActualSellThrough),
        actualWastePct: Number(formActualWaste),
        actualCustomerComplaintCount: Number(formRefundClaims),
        actualCustomerRefundPct: Number(formRefundClaims) > 0 ? 0.8 : 0.0,
        feedbackNotes: formNotes,
      };

      const res = await fetch('/api/feedback/submit-outcome', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        setMetrics(data.updatedMetrics);
        setFeedbackSuccessNotice(data.message);
        setShowLogModal(false);
        setSelectedBatchId(data.record.batchId);
        await loadFeedbackData();
        setTimeout(() => setFeedbackSuccessNotice(null), 8000);
      }
    } catch (err) {
      console.error('Submit outcome failed:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Parity Plot Data: Predicted Shelf Life vs Actual Shelf Life
  const parityChartData = useMemo(() => {
    return completedBatches.map((b) => ({
      batchId: b.batchId,
      supplier: b.supplierName,
      crop: b.crop,
      predictedDays: b.predictedAmbientShelfLifeDays,
      actualDays: b.actualDaysToDegradation,
      error: +(b.actualDaysToDegradation - b.predictedAmbientShelfLifeDays).toFixed(2),
      wastePct: b.actualWastePct,
    }));
  }, [completedBatches]);

  // Multi-Factor Weight Allocation for Donut Chart
  const weightsPieData = useMemo(() => {
    if (!metrics) return [];
    return [
      { name: 'Optical Vision & Bruise', value: metrics.learnedWeights.opticalWeight, color: '#10b981' }, // Emerald
      { name: 'Multi-Sensor IoT (Ethylene/Vibe)', value: metrics.learnedWeights.sensorWeight, color: '#06b6d4' }, // Cyan
      { name: 'Supplier Historical Reliability', value: metrics.learnedWeights.supplierHistoryWeight, color: '#a855f7' }, // Purple
      { name: 'Weather & Route Logistics', value: metrics.learnedWeights.weatherLogisticsWeight, color: '#f59e0b' }, // Amber
      { name: 'Dark Store Demand & Turnover', value: metrics.learnedWeights.demandInventoryWeight, color: '#ec4899' }, // Pink
    ];
  }, [metrics]);

  return (
    <div className="space-y-6">
      {/* SUCCESS NOTIFICATION TOAST */}
      {feedbackSuccessNotice && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/90 via-emerald-900/80 to-stone-900 border border-emerald-500/60 shadow-2xl flex items-start justify-between gap-3 animate-fade-in">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
              <Sparkles className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <div className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <span>Historical Batch Intelligence Executed</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-700">
                  Model Retrained
                </span>
              </div>
              <p className="text-xs text-stone-200 mt-1 leading-relaxed">
                {feedbackSuccessNotice}
              </p>
            </div>
          </div>
          <button
            onClick={() => setFeedbackSuccessNotice(null)}
            className="text-stone-400 hover:text-white text-xs font-bold px-2 py-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* PARADIGM COMPARISON HERO BANNER */}
      <div className="rounded-2xl bg-gradient-to-br from-stone-900 via-stone-900 to-stone-950 border border-stone-800 p-5 sm:p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-purple-950 text-purple-300 border border-purple-800 flex items-center gap-1.5">
                <History className="w-3 h-3 text-purple-300" />
                Historical Batch Intelligence
              </span>
              <span className="text-[10px] font-mono text-stone-400">
                Continuous Operational Learning
              </span>
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              From Single-Shot Inspection to Historical Batch Intelligence
            </h3>

            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
              Traditional computer vision operates blindly as <span className="font-mono text-stone-400 line-through">Image → AI → Grade</span>.
              Next-generation AgriGrade closes the loop with historical batch intelligence across the entire operational chain:
            </p>

            {/* Architecture Flow Formula */}
            <div className="p-3 rounded-xl bg-stone-950/80 border border-stone-800/80 font-mono text-[11px] leading-relaxed space-y-2">
              <div className="text-stone-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                <span className="line-through text-stone-500">Conventional Vision: Image → AI → Static Grade (71.4% accuracy, blind to logistics)</span>
              </div>
              <div className="text-emerald-300 flex items-start gap-1.5 font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 mt-1 shrink-0" />
                <span>
                  Next-Gen Swarm: <span className="text-cyan-300">Image</span> + <span className="text-cyan-300">Sensors</span> + <span className="text-purple-300">Supplier History</span> + <span className="text-amber-300">Weather</span> + <span className="text-amber-300">Logistics</span> + <span className="text-emerald-300">Demand</span> + <span className="text-emerald-300">Inventory</span> + <span className="text-pink-300">Actual Outcomes</span> → Decision → Outcome → Model Improvement
                </span>
              </div>
            </div>
          </div>

          {/* Action Callouts */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
            <button
              onClick={() => setShowLogModal(true)}
              className="px-4 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-purple-950/50 flex items-center justify-center gap-2 border border-purple-400/40 transition-all hover:scale-102 active:scale-98"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Log Actual Outcome &amp; Retrain</span>
            </button>

            {onNavigateToScan && (
              <button
                onClick={onNavigateToScan}
                className="px-4 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
              >
                <Eye className="w-3.5 h-3.5 text-emerald-400" />
                <span>Return to Live Viewfinder</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* CONTINUAL LEARNING KPI SUMMARY RIBBON */}
      {metrics && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="p-3.5 rounded-xl bg-stone-900 border border-stone-800">
            <div className="text-[10px] text-stone-400 uppercase font-semibold flex items-center justify-between">
              <span>Batches Learned</span>
              <Database className="w-3.5 h-3.5 text-purple-400" />
            </div>
            <div className="text-xl font-black font-mono text-purple-300 mt-1">
              {metrics.totalBatchesLearned.toLocaleString()}
            </div>
            <div className="text-[10px] text-stone-500 font-mono mt-0.5">
              Closed feedback iterations
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-stone-900 border border-stone-800">
            <div className="text-[10px] text-stone-400 uppercase font-semibold flex items-center justify-between">
              <span>Model Accuracy</span>
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="text-xl font-black font-mono text-emerald-400 mt-1">
              {metrics.currentClosedLoopAccuracyPct}%
            </div>
            <div className="text-[10px] text-stone-500 font-mono mt-0.5">
              Baseline: {metrics.baselineAccuracyPct}% (+{(metrics.currentClosedLoopAccuracyPct - metrics.baselineAccuracyPct).toFixed(1)}%)
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-stone-900 border border-stone-800">
            <div className="text-[10px] text-stone-400 uppercase font-semibold flex items-center justify-between">
              <span>Retail Waste Saved</span>
              <Trash2 className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="text-xl font-black font-mono text-emerald-400 mt-1">
              {metrics.wasteReductionPct}%
            </div>
            <div className="text-[10px] text-stone-500 font-mono mt-0.5">
              Reduced dock &amp; shelf shrink
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-stone-900 border border-stone-800">
            <div className="text-[10px] text-stone-400 uppercase font-semibold flex items-center justify-between">
              <span>Shelf-Life MAE</span>
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
            </div>
            <div className="text-xl font-black font-mono text-cyan-300 mt-1">
              ±{metrics.meanAbsoluteErrorDays} <span className="text-xs font-normal text-stone-400">days</span>
            </div>
            <div className="text-[10px] text-stone-500 font-mono mt-0.5">
              Down from ±1.62d
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-stone-900 border border-stone-800 col-span-2 lg:col-span-1">
            <div className="text-[10px] text-stone-400 uppercase font-semibold flex items-center justify-between">
              <span>Customer Refunds</span>
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="text-xl font-black font-mono text-amber-300 mt-1">
              {metrics.customerRefundReductionPct}%
            </div>
            <div className="text-[10px] text-stone-500 font-mono mt-0.5">
              Near-zero squished claims
            </div>
          </div>
        </div>
      )}

      {/* 7-STAGE INTERACTIVE LIFECYCLE CHAIN EXPLORER */}
      <div className="bg-stone-900 rounded-2xl border border-stone-800 p-5 shadow-xl flex flex-col gap-4">
        {/* Pipeline Header and Batch Selector */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-800">
          <div>
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              <h4 className="text-sm font-bold text-white">
                Produce Lifecycle Chain: Inspection → Decision → Logistics → Storage → Sale → Waste → Outcome
              </h4>
            </div>
            <p className="text-xs text-stone-400 mt-0.5">
              Tracking physical crop state, environmental drift, and actual outcomes across the 7 operational milestones.
            </p>
          </div>

          {/* Batch Selector Dropdown */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-stone-400 font-medium shrink-0">Batch Pipeline:</span>
            <select
              value={selectedBatchId}
              onChange={(e) => setSelectedBatchId(e.target.value)}
              className="bg-stone-950 border border-stone-700 text-stone-100 rounded-lg px-2.5 py-1.5 font-mono text-xs outline-none focus:border-purple-500"
            >
              <optgroup label="Active In-Flight Batches">
                {activeBatches.map((b) => (
                  <option key={b.batchId} value={b.batchId}>
                    🟢 {b.batchId} • {b.crop} (In Progress)
                  </option>
                ))}
              </optgroup>
              <optgroup label="Completed Feedback Batches">
                {completedBatches.map((b) => (
                  <option key={b.batchId} value={b.batchId}>
                    ✓ {b.batchId} • {b.crop} (Outcome Closed)
                  </option>
                ))}
              </optgroup>
            </select>
          </div>
        </div>

        {/* Selected Batch Meta Header */}
        {selectedBatch && (
          <div className="p-3 rounded-xl bg-stone-950 border border-stone-800 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <span className="font-mono font-bold text-white text-sm">
                {selectedBatch.batchId}
              </span>
              <span className="px-2 py-0.5 rounded bg-stone-800 text-stone-300 font-medium">
                {selectedBatch.crop}
              </span>
              <span className="text-stone-400">
                Supplier: <span className="text-stone-200 font-medium">{selectedBatch.supplierName}</span>
              </span>
            </div>

            <div className="flex items-center gap-3 text-stone-300 font-mono">
              <span>Predicted: <strong className="text-emerald-400">{selectedBatch.predictedAmbientShelfLifeDays}d</strong></span>
              {selectedBatch.actualDaysToDegradation > 0 && (
                <span>Actual: <strong className="text-purple-300">{selectedBatch.actualDaysToDegradation}d</strong></span>
              )}
              {selectedBatch.actualWastePct > 0 && (
                <span>Waste: <strong className="text-amber-400">{selectedBatch.actualWastePct}%</strong></span>
              )}
              <span
                className={`px-2 py-0.5 rounded border text-[10px] font-bold ${
                  selectedBatch.learningTriggered
                    ? 'bg-purple-950 text-purple-300 border-purple-800'
                    : 'bg-emerald-950 text-emerald-300 border-emerald-800'
                }`}
              >
                {selectedBatch.learningTriggered ? 'LOOP CLOSED' : 'TRACKING LIVE'}
              </span>
            </div>
          </div>
        )}

        {/* 7-Node Step Chain Visualization */}
        {selectedBatch && selectedBatch.stages && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-2.5 pt-2">
            {selectedBatch.stages.map((stg, idx) => {
              const isDone = stg.status === 'completed';
              const isInProgress = stg.status === 'in_progress';
              const isFlagged = stg.status === 'flagged';

              return (
                <div
                  key={stg.stage}
                  className={`p-3 rounded-xl border flex flex-col justify-between gap-2 relative transition-all ${
                    isDone
                      ? 'bg-stone-950/80 border-stone-800 text-stone-200'
                      : isInProgress
                      ? 'bg-purple-950/30 border-purple-500/70 text-white ring-1 ring-purple-500/50 shadow-md shadow-purple-950/40'
                      : 'bg-stone-950/40 border-stone-800/40 text-stone-500'
                  }`}
                >
                  {/* Step Header */}
                  <div>
                    <div className="flex items-center justify-between text-[10px] font-mono">
                      <span className="opacity-70 font-bold">Stage 0{idx + 1}</span>
                      <span
                        className={`w-2 h-2 rounded-full ${
                          isDone
                            ? 'bg-emerald-400'
                            : isInProgress
                            ? 'bg-purple-400 animate-ping'
                            : 'bg-stone-700'
                        }`}
                      />
                    </div>
                    <div className="font-bold text-xs text-white mt-1 leading-tight">
                      {stg.label}
                    </div>
                    {stg.timestamp && (
                      <div className="text-[10px] text-stone-400 font-mono mt-0.5">
                        {stg.timestamp}
                      </div>
                    )}
                  </div>

                  {/* Key Metric Badge */}
                  {stg.keyMetric && (
                    <div className="pt-2 border-t border-stone-800/60">
                      <div className="text-[9px] uppercase font-mono text-stone-400">
                        {stg.keyMetric.label}
                      </div>
                      <div
                        className={`text-xs font-mono font-bold mt-0.5 ${
                          stg.keyMetric.status === 'good'
                            ? 'text-emerald-400'
                            : stg.keyMetric.status === 'warning'
                            ? 'text-amber-400'
                            : stg.keyMetric.status === 'bad'
                            ? 'text-rose-400'
                            : 'text-stone-200'
                        }`}
                      >
                        {stg.keyMetric.value}
                      </div>
                    </div>
                  )}

                  {/* Stage-specific details */}
                  <div className="text-[10px] text-stone-400 space-y-0.5 font-sans leading-tight">
                    {Object.entries(stg.details).slice(0, 2).map(([k, v]) => (
                      <div key={k} className="truncate">
                        <span className="text-stone-500">{k}:</span> {String(v)}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Selected Batch Feedback Impact Note */}
        {selectedBatch && selectedBatch.learningTriggered && (
          <div className="p-3 rounded-xl bg-purple-950/20 border border-purple-800/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400 shrink-0" />
              <div>
                <span className="font-bold text-purple-200">Continual Learning Result:</span>{' '}
                <span className="text-stone-300">
                  {selectedBatch.feedbackNotes}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3 text-[11px] font-mono shrink-0">
              <span className="text-stone-400">
                Q10 Shift: <strong className="text-purple-300">{selectedBatch.parameterAdjustments.q10_respiration_delta >= 0 ? '+' : ''}{selectedBatch.parameterAdjustments.q10_respiration_delta}</strong>
              </span>
              <span className="text-stone-400">
                Vendor Trust: <strong className="text-emerald-400">{selectedBatch.parameterAdjustments.supplier_trust_adjustment >= 0 ? '+' : ''}{selectedBatch.parameterAdjustments.supplier_trust_adjustment}</strong>
              </span>
            </div>
          </div>
        )}
      </div>

      {/* CONTINUAL MODEL LEARNING ANALYTICS GRAPHS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Chart: Accuracy Evolution & Waste Reduction (7 Columns) */}
        <div className="lg:col-span-7 bg-stone-900 rounded-2xl border border-stone-800 p-5 shadow-xl flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <span>Accuracy &amp; Waste Reduction Evolution Over Time</span>
              </h4>
              <p className="text-xs text-stone-400 mt-0.5">
                Model convergence over 1,842 completed batch cycles as actual outcomes refine predictive weights.
              </p>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 self-start sm:self-auto">
              +23.4% Accuracy Gain
            </span>
          </div>

          <div className="w-full h-72">
            {metrics?.calibrationHistory && (
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={metrics.calibrationHistory}
                  margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#292524" vertical={false} />
                  <XAxis
                    dataKey="batchCycle"
                    tick={{ fill: '#a8a29e', fontSize: 10 }}
                    tickFormatter={(v) => `${v} Batches`}
                    axisLine={{ stroke: '#44403c' }}
                  />
                  <YAxis
                    yAxisId="left"
                    domain={[60, 100]}
                    tick={{ fill: '#34d399', fontSize: 10 }}
                    tickFormatter={(v) => `${v}%`}
                    axisLine={{ stroke: '#44403c' }}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    domain={[0, 25]}
                    tick={{ fill: '#f87171', fontSize: 10 }}
                    tickFormatter={(v) => `${v}%`}
                    axisLine={{ stroke: '#44403c' }}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const d = payload[0].payload;
                        return (
                          <div className="bg-stone-900 border border-stone-700 rounded-xl p-3 shadow-2xl text-xs space-y-1.5 font-sans min-w-[200px]">
                            <div className="font-bold text-white border-b border-stone-800 pb-1">
                              Batch Milestone #{d.batchCycle} ({d.date})
                            </div>
                            <div className="flex justify-between text-emerald-400">
                              <span>Closed-Loop Accuracy:</span>
                              <span className="font-mono font-bold">{d.accuracy}%</span>
                            </div>
                            <div className="flex justify-between text-rose-400">
                              <span>Retail Waste Rate:</span>
                              <span className="font-mono font-bold">{d.wastePct}%</span>
                            </div>
                            <div className="flex justify-between text-cyan-400">
                              <span>Shelf-Life Error (MAE):</span>
                              <span className="font-mono font-bold">±{d.maeDays}d</span>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    wrapperStyle={{ paddingTop: '10px', fontSize: '11px' }}
                  />
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="accuracy"
                    name="Model Accuracy (%)"
                    stroke="#10b981"
                    fill="#10b981"
                    fillOpacity={0.15}
                    strokeWidth={2.5}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="wastePct"
                    name="Actual Waste Rate (%)"
                    stroke="#f43f5e"
                    strokeWidth={2}
                    dot={{ r: 3, fill: '#f43f5e' }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Right Chart: Multi-Factor Learned Weight Allocation (5 Columns) */}
        <div className="lg:col-span-5 bg-stone-900 rounded-2xl border border-stone-800 p-5 shadow-xl flex flex-col justify-between gap-4">
          <div>
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-purple-400" />
                <span>Multi-Factor Learned Weights</span>
              </h4>
              <span className="text-[10px] font-mono text-purple-400">
                Self-Calibrated
              </span>
            </div>
            <p className="text-xs text-stone-400 mt-0.5">
              Empirical importance weighting derived across the 1,842 feedback cycles.
            </p>
          </div>

          {/* Donut Chart */}
          <div className="w-full h-44 relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={weightsPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={68}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {weightsPieData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: any) => [`${val}% weight`, 'Influence']}
                  contentStyle={{ backgroundColor: '#1c1917', borderColor: '#44403c', borderRadius: '8px', fontSize: '11px' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xs font-mono font-bold text-white">5 Factors</span>
              <span className="text-[9px] font-mono text-stone-400">100% Total</span>
            </div>
          </div>

          {/* Weight Legend Pills */}
          <div className="space-y-1.5 text-xs">
            {weightsPieData.map((w) => (
              <div key={w.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: w.color }} />
                  <span className="text-stone-300 text-[11px] truncate max-w-[190px]">{w.name}</span>
                </div>
                <span className="font-mono font-bold text-white text-[11px]">{w.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* COMPLETED BATCHES GROUND-TRUTH AUDIT TABLE */}
      <div className="bg-stone-900 rounded-2xl border border-stone-800 p-5 shadow-xl flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <History className="w-4 h-4 text-purple-400" />
              <span>Historical Batch Intelligence Ledger: Predicted vs. Actual Outcomes</span>
            </h4>
            <p className="text-xs text-stone-400 mt-0.5">
              Historical batches where actual sales and waste outcomes were logged to update AgriGrade models.
            </p>
          </div>
          <button
            onClick={() => setShowLogModal(true)}
            className="px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 text-xs font-semibold flex items-center gap-1.5 self-start sm:self-auto transition-colors"
          >
            <PlusCircle className="w-3.5 h-3.5 text-purple-400" />
            <span>Add Batch Outcome</span>
          </button>
        </div>

        <div className="overflow-x-auto pt-1">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-stone-800 text-[11px] text-stone-400 font-mono">
                <th className="py-2.5 px-3">Batch ID &amp; Crop</th>
                <th className="py-2.5 px-3">Supplier</th>
                <th className="py-2.5 px-3 text-center">Predicted Shelf-Life</th>
                <th className="py-2.5 px-3 text-center">Actual Degradation</th>
                <th className="py-2.5 px-3 text-center">Sell-Through %</th>
                <th className="py-2.5 px-3 text-center">Actual Waste %</th>
                <th className="py-2.5 px-3 text-center">Complaints</th>
                <th className="py-2.5 px-3 text-right">Model Calibration</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800/60 font-sans">
              {completedBatches.map((b) => {
                const isSelected = b.batchId === selectedBatchId;
                const error = +(b.actualDaysToDegradation - b.predictedAmbientShelfLifeDays).toFixed(2);
                return (
                  <tr
                    key={b.id}
                    onClick={() => setSelectedBatchId(b.batchId)}
                    className={`cursor-pointer transition-colors ${
                      isSelected ? 'bg-purple-950/20' : 'hover:bg-stone-800/50'
                    }`}
                  >
                    <td className="py-3 px-3">
                      <div className="font-mono font-bold text-white flex items-center gap-1.5">
                        <span>{b.batchId}</span>
                        {isSelected && (
                          <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-purple-950 text-purple-300 border border-purple-800">
                            Active
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-stone-400">{b.crop}</div>
                    </td>

                    <td className="py-3 px-3">
                      <div className="text-stone-300 truncate max-w-[160px]">{b.supplierName}</div>
                      <div className="text-[10px] text-stone-500 font-mono">
                        {b.closedAt ? b.closedAt.split('T')[0] : 'Historical'}
                      </div>
                    </td>

                    <td className="py-3 px-3 text-center font-mono font-semibold text-stone-300">
                      {b.predictedAmbientShelfLifeDays} days
                    </td>

                    <td className="py-3 px-3 text-center font-mono font-bold">
                      <span className={Math.abs(error) <= 0.4 ? 'text-emerald-400' : 'text-amber-400'}>
                        {b.actualDaysToDegradation} days
                      </span>
                      <span className="text-[10px] text-stone-500 block">
                        ({error >= 0 ? `+${error}` : error}d error)
                      </span>
                    </td>

                    <td className="py-3 px-3 text-center font-mono font-bold text-emerald-400">
                      {b.actualSellThroughPct}%
                    </td>

                    <td className="py-3 px-3 text-center font-mono font-bold">
                      <span className={b.actualWastePct <= 5.0 ? 'text-emerald-400' : 'text-rose-400'}>
                        {b.actualWastePct}%
                      </span>
                    </td>

                    <td className="py-3 px-3 text-center font-mono">
                      {b.actualCustomerComplaintCount === 0 ? (
                        <span className="text-emerald-400 font-semibold">0 claims</span>
                      ) : (
                        <span className="text-rose-400 font-semibold">{b.actualCustomerComplaintCount} refunds</span>
                      )}
                    </td>

                    <td className="py-3 px-3 text-right">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-stone-800 text-purple-300 border border-purple-800/60">
                        Q10 Δ: {b.parameterAdjustments.q10_respiration_delta >= 0 ? `+${b.parameterAdjustments.q10_respiration_delta}` : b.parameterAdjustments.q10_respiration_delta}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: LOG ACTUAL GROUND-TRUTH OUTCOME & RETRAIN */}
      {showLogModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-stone-700 rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <PlusCircle className="w-5 h-5 text-purple-400" />
                  <span>Log Actual Outcome &amp; Close Feedback Loop</span>
                </h3>
                <p className="text-xs text-stone-400 mt-0.5">
                  Records post-sale ground truth to immediately recalibrate Arrhenius constants and supplier weights.
                </p>
              </div>
              <button
                onClick={() => setShowLogModal(false)}
                className="text-stone-400 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitOutcome} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-stone-400 font-medium block mb-1">Batch Identifier</label>
                  <input
                    type="text"
                    required
                    value={formBatchId}
                    onChange={(e) => setFormBatchId(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-stone-100 font-mono outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="text-stone-400 font-medium block mb-1">Produce Variety</label>
                  <input
                    type="text"
                    required
                    value={formCrop}
                    onChange={(e) => setFormCrop(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-stone-100 outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-stone-400 font-medium block mb-1">Supplier / Farm Cluster</label>
                <input
                  type="text"
                  required
                  value={formSupplier}
                  onChange={(e) => setFormSupplier(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-stone-100 outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-stone-950 border border-stone-800">
                <div>
                  <label className="text-stone-400 font-medium block mb-1">Predicted Shelf Life (Days)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={formPredictedDays}
                    onChange={(e) => setFormPredictedDays(Number(e.target.value))}
                    className="w-full bg-stone-900 border border-stone-700 rounded-lg px-2.5 py-1.5 text-stone-100 font-mono"
                  />
                </div>

                <div>
                  <label className="text-purple-300 font-medium block mb-1">Actual Degradation (Days)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={formActualDays}
                    onChange={(e) => setFormActualDays(Number(e.target.value))}
                    className="w-full bg-stone-900 border border-purple-600/70 rounded-lg px-2.5 py-1.5 text-purple-200 font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-stone-400 font-medium block mb-1">Actual Sell-Through (%)</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    max="100"
                    required
                    value={formActualSellThrough}
                    onChange={(e) => {
                      const st = Number(e.target.value);
                      setFormActualSellThrough(st);
                      setFormActualWaste(+(100 - st).toFixed(1));
                    }}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-emerald-400 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="text-stone-400 font-medium block mb-1">Actual Waste / Shrink (%)</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    max="100"
                    required
                    value={formActualWaste}
                    onChange={(e) => setFormActualWaste(Number(e.target.value))}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-rose-400 font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="text-stone-400 font-medium block mb-1">Customer Spoilage / Rotten Refund Claims</label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={formRefundClaims}
                  onChange={(e) => setFormRefundClaims(Number(e.target.value))}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-stone-100 font-mono"
                />
              </div>

              <div>
                <label className="text-stone-400 font-medium block mb-1">Outcome Notes &amp; Disposition Findings</label>
                <textarea
                  rows={2}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl p-2.5 text-stone-100 outline-none focus:border-purple-500 text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-800">
                <button
                  type="button"
                  onClick={() => setShowLogModal(false)}
                  className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold flex items-center gap-2 shadow-lg shadow-purple-950 disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? 'Calibrating Model...' : 'Apply Outcome & Retrain Model'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export const HistoricalBatchIntelligenceStudio = ClosedLoopFeedbackStudio;
