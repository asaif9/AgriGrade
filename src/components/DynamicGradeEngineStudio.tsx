import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Scale,
  Sliders,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Store,
  Building2,
  Factory,
  Globe2,
  ShoppingBag,
  Edit3,
  Code,
  RotateCcw,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  Info,
  Layers,
  Save,
  Check,
  RefreshCw,
  Cpu,
  Download,
  Upload,
} from 'lucide-react';
import type { AgriGradeReport, USDAMaturityStage } from '../types';
import {
  DEFAULT_COMMERCIAL_RULES,
  evaluateCommercialRules,
  type CommercialGradeRule,
  type DynamicGradeEvaluationResult,
  type EvaluationInputMetrics,
} from '../utils/gradeEngine';

interface DynamicGradeEngineStudioProps {
  report: AgriGradeReport | null;
  activeRuleId: string;
  onSelectRuleId: (ruleId: string) => void;
  customRule: CommercialGradeRule | null;
  onUpdateCustomRule: (rule: CommercialGradeRule) => void;
  onClose?: () => void;
}

export const DynamicGradeEngineStudio: React.FC<DynamicGradeEngineStudioProps> = ({
  report,
  activeRuleId,
  onSelectRuleId,
  customRule,
  onUpdateCustomRule,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'matrix' | 'configurator' | 'json'>('matrix');
  const [rulesList, setRulesList] = useState<CommercialGradeRule[]>(() => {
    return customRule
      ? [...DEFAULT_COMMERCIAL_RULES, customRule]
      : DEFAULT_COMMERCIAL_RULES;
  });

  // Current batch metrics (derived from active report or default test specimen)
  const currentMetrics: EvaluationInputMetrics = useMemo(() => {
    return {
      commodity: (report?.produce_type || 'Tomato').toLowerCase(),
      defectPercent: report?.bruise_defect_index ?? 7.5,
      maturityStage: (report?.usda_color_stage || 4) as USDAMaturityStage,
      firmnessKgCm2: report?.firmness_estimate_penetrometer ?? 3.8,
      ambientShelfLifeDays: report?.ambient_shelf_life_days ?? 3.5,
      detectedDefectTypes: (report?.defects || []).map((d) => d.defect_type),
    };
  }, [report]);

  // Find active rule
  const activeRule = useMemo(() => {
    if (customRule && activeRuleId === customRule.id) return customRule;
    return rulesList.find((r) => r.id === activeRuleId) || rulesList[0];
  }, [activeRuleId, rulesList, customRule]);

  // Active evaluation
  const activeEvaluation: DynamicGradeEvaluationResult = useMemo(() => {
    return evaluateCommercialRules(currentMetrics, activeRule);
  }, [currentMetrics, activeRule]);

  // Comparative evaluation across all customer rules
  const multiCustomerComparisons = useMemo(() => {
    return rulesList.map((rule) => {
      const evalResult = evaluateCommercialRules(currentMetrics, rule);
      return {
        rule,
        evalResult,
      };
    });
  }, [rulesList, currentMetrics]);

  // Configurator form state for custom tuning
  const [editCommodity, setEditCommodity] = useState<string>(activeRule.commodity);
  const [editMarket, setEditMarket] = useState<CommercialGradeRule['market']>(activeRule.market);
  const [editCustomerName, setEditCustomerName] = useState<string>(activeRule.customer);
  const [gradeADefect, setGradeADefect] = useState<string>(activeRule.grade_a.defect_percent);
  const [gradeAMaturity, setGradeAMaturity] = useState<string>(
    activeRule.grade_a.maturity ? activeRule.grade_a.maturity.join(',') : '4,5'
  );
  const [gradeAFirmness, setGradeAFirmness] = useState<string>(activeRule.grade_a.firmness || '>3.5');
  const [gradeBDefect, setGradeBDefect] = useState<string>(activeRule.grade_b.defect_percent);
  const [gradeBFirmness, setGradeBFirmness] = useState<string>(activeRule.grade_b.firmness || '2.5-3.5');
  const [gradeBDiscount, setGradeBDiscount] = useState<number>(
    activeRule.grade_b.recommended_discount_percent ?? 15
  );

  // JSON editor state matching the exact user prompt
  const [jsonString, setJsonString] = useState<string>(() => {
    const cleanPromptObj = {
      commodity: activeRule.commodity,
      market: activeRule.market,
      customer: activeRule.customer,
      grade_a: {
        defect_percent: activeRule.grade_a.defect_percent,
        maturity: activeRule.grade_a.maturity || [4, 5],
        firmness: activeRule.grade_a.firmness || '>3.5',
      },
      grade_b: {
        defect_percent: activeRule.grade_b.defect_percent,
        firmness: activeRule.grade_b.firmness || '2.5-3.5',
        recommended_discount_percent: activeRule.grade_b.recommended_discount_percent ?? 15,
      },
    };
    return JSON.stringify(cleanPromptObj, null, 2);
  });
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  // Sync edit form whenever activeRule changes
  const handleSelectRule = (ruleId: string) => {
    onSelectRuleId(ruleId);
    const r = rulesList.find((item) => item.id === ruleId) || rulesList[0];
    setEditCommodity(r.commodity);
    setEditMarket(r.market);
    setEditCustomerName(r.customer);
    setGradeADefect(r.grade_a.defect_percent);
    setGradeAMaturity(r.grade_a.maturity ? r.grade_a.maturity.join(',') : '4,5');
    setGradeAFirmness(r.grade_a.firmness || '>3.5');
    setGradeBDefect(r.grade_b.defect_percent);
    setGradeBFirmness(r.grade_b.firmness || '2.5-3.5');
    setGradeBDiscount(r.grade_b.recommended_discount_percent ?? 15);

    const cleanPromptObj = {
      commodity: r.commodity,
      market: r.market,
      customer: r.customer,
      grade_a: {
        defect_percent: r.grade_a.defect_percent,
        maturity: r.grade_a.maturity || [4, 5],
        firmness: r.grade_a.firmness || '>3.5',
      },
      grade_b: {
        defect_percent: r.grade_b.defect_percent,
        firmness: r.grade_b.firmness || '2.5-3.5',
        recommended_discount_percent: r.grade_b.recommended_discount_percent ?? 15,
      },
    };
    setJsonString(JSON.stringify(cleanPromptObj, null, 2));
    setJsonError(null);
  };

  // Apply visual configurator edits
  const handleApplyConfigurator = () => {
    const parsedMaturity = gradeAMaturity
      .split(',')
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => !isNaN(n) && n >= 1 && n <= 6);

    const updated: CommercialGradeRule = {
      ...activeRule,
      commodity: editCommodity.toLowerCase(),
      market: editMarket,
      customer: editCustomerName,
      grade_a: {
        ...activeRule.grade_a,
        defect_percent: gradeADefect,
        maturity: parsedMaturity.length > 0 ? parsedMaturity : [4, 5],
        firmness: gradeAFirmness,
      },
      grade_b: {
        ...activeRule.grade_b,
        defect_percent: gradeBDefect,
        firmness: gradeBFirmness,
        recommended_discount_percent: gradeBDiscount,
      },
    };

    onUpdateCustomRule(updated);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  // Apply JSON edits
  const handleApplyJson = () => {
    try {
      setJsonError(null);
      const parsed = JSON.parse(jsonString);

      if (!parsed.commodity || !parsed.market) {
        throw new Error('JSON must include "commodity" and "market" fields.');
      }
      if (!parsed.grade_a || !parsed.grade_b) {
        throw new Error('JSON must include "grade_a" and "grade_b" criteria objects.');
      }

      const updated: CommercialGradeRule = {
        id: `rule-custom-${Date.now().toString(36)}`,
        name: `Custom Rule (${parsed.commodity} - ${parsed.market})`,
        customer: parsed.customer || `Custom Market: ${parsed.market}`,
        commodity: parsed.commodity.toLowerCase(),
        market: parsed.market,
        description: `Configured commercial rule for ${parsed.commodity} (${parsed.market}).`,
        grade_a: {
          defect_percent: parsed.grade_a.defect_percent || '<5',
          maturity: Array.isArray(parsed.grade_a.maturity) ? parsed.grade_a.maturity : [4, 5],
          firmness: parsed.grade_a.firmness || '>3.5',
          min_shelf_life_days: parsed.grade_a.min_shelf_life_days || '>3.0',
          erp_routing_tag: 'PREMIUM_RETAIL_BIN',
        },
        grade_b: {
          defect_percent: parsed.grade_b.defect_percent || '5-15',
          maturity: Array.isArray(parsed.grade_b.maturity) ? parsed.grade_b.maturity : [3, 4, 5, 6],
          firmness: parsed.grade_b.firmness || '2.5-3.5',
          min_shelf_life_days: parsed.grade_b.min_shelf_life_days || '>1.5',
          recommended_discount_percent: parsed.grade_b.recommended_discount_percent ?? 15,
          fast_track_hours: 8,
          erp_routing_tag: 'FAST_DISPATCH_DISCOUNT_15',
        },
        reject_criteria: {
          max_defect_percent: '>20',
          min_firmness: '<2.0',
          unacceptable_defects: ['Fungal Mold', 'Bacterial Soft Rot'],
          erp_routing_tag: 'RETURN_TO_VENDOR_REJECT',
        },
      };

      setRulesList((prev) => [updated, ...prev.filter((r) => r.id !== updated.id)]);
      onUpdateCustomRule(updated);
      onSelectRuleId(updated.id);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (err: any) {
      setJsonError(err.message || 'Invalid JSON format');
    }
  };

  const handleExportRulesJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(rulesList, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `agrigrade-commercial-rules-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportRulesFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const incomingRules: CommercialGradeRule[] = Array.isArray(parsed) ? parsed : [parsed];
      if (incomingRules.length === 0) throw new Error('No valid rules found in file');

      setRulesList((prev) => {
        const combined = [...incomingRules, ...prev.filter((p) => !incomingRules.some((i) => i.id === p.id))];
        return combined;
      });
      if (incomingRules[0]) {
        onUpdateCustomRule(incomingRules[0]);
        onSelectRuleId(incomingRules[0].id);
      }

      await fetch('/api/commercial-rules/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rules: incomingRules }),
      });

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (err: any) {
      setJsonError('Failed to import rules: ' + (err.message || 'Invalid format'));
    } finally {
      e.target.value = '';
    }
  };

  const getMarketIcon = (market: string) => {
    switch (market) {
      case 'quick_commerce':
        return <Zap className="w-4 h-4 text-amber-400" />;
      case 'premium_supermarket':
        return <Store className="w-4 h-4 text-emerald-400" />;
      case 'food_service_processing':
        return <Factory className="w-4 h-4 text-purple-400" />;
      case 'export_cold_chain':
        return <Globe2 className="w-4 h-4 text-cyan-400" />;
      case 'wholesale_mandi':
        return <Building2 className="w-4 h-4 text-yellow-400" />;
      default:
        return <Scale className="w-4 h-4 text-stone-400" />;
    }
  };

  return (
    <div className="bg-stone-900 rounded-2xl border border-stone-800 p-5 shadow-2xl flex flex-col gap-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-800 pb-5">
        <div className="flex items-start gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500/20 to-emerald-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0 shadow-lg">
            <Scale className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-bold text-white tracking-tight">
                Dynamic Commercial Grade Engine
              </h2>
              <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-950/80 text-amber-300 border border-amber-800/80">
                Agent 4: Multi-Agent Swarm
              </span>
              <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-800/80">
                Configurable Tolerances
              </span>
            </div>
            <p className="text-xs text-stone-300 mt-1 max-w-2xl leading-relaxed">
              Eliminating rigid hardcoded thresholds (<code className="text-amber-300 font-mono">Defects &gt; X → Reject</code>). Each customer channel (Quick-Commerce, Premium Supermarket, Food Processing, Export) enforces custom tolerance matrices.
            </p>
          </div>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-1.5 bg-stone-950 p-1.5 rounded-xl border border-stone-800 self-start md:self-center">
          <button
            onClick={() => setActiveTab('matrix')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'matrix'
                ? 'bg-amber-500 text-stone-950 font-bold shadow-md'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Customer Tolerance Matrix</span>
          </button>
          <button
            onClick={() => setActiveTab('configurator')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'configurator'
                ? 'bg-amber-500 text-stone-950 font-bold shadow-md'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Rule Configurator</span>
          </button>
          <button
            onClick={() => setActiveTab('json')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'json'
                ? 'bg-amber-500 text-stone-950 font-bold shadow-md'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            <span>Commercial JSON</span>
          </button>
        </div>
      </div>

      {/* Current Active Batch Telemetry Strip */}
      <div className="p-3.5 rounded-xl bg-stone-950/70 border border-stone-800/80 flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
        <div className="flex items-center gap-2 text-stone-300">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="font-bold text-stone-200">Active Inspected Specimen:</span>
          <span className="text-emerald-400 capitalize">{currentMetrics.commodity}</span>
        </div>
        <div className="flex flex-wrap items-center gap-4 text-stone-400">
          <div>
            Defect Index: <span className="text-white font-bold">{currentMetrics.defectPercent.toFixed(1)}%</span>
          </div>
          <div>
            USDA Stage: <span className="text-white font-bold">{currentMetrics.maturityStage}</span>
          </div>
          <div>
            Penetrometer Firmness: <span className="text-white font-bold">{currentMetrics.firmnessKgCm2} kg/cm²</span>
          </div>
          <div>
            Remaining Shelf Life: <span className="text-white font-bold">{currentMetrics.ambientShelfLifeDays}d</span>
          </div>
        </div>
      </div>

      {/* Tab 1: Multi-Customer Tolerance Matrix */}
      {activeTab === 'matrix' && (
        <div className="flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-stone-100 flex items-center gap-2">
                Simultaneous Multi-Customer Tolerance Benchmark
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-stone-800 text-stone-300">
                  {multiCustomerComparisons.length} Commercial Profiles
                </span>
              </h3>
              <p className="text-xs text-stone-400 mt-0.5">
                Notice how the <strong>exact same batch</strong> receives completely different commercial outcomes based on client specifications!
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {multiCustomerComparisons.map(({ rule, evalResult }) => {
              const isSelected = activeRule.id === rule.id;
              const isGradeA = evalResult.verdict === 'ACCEPTED_GRADE_A';
              const isGradeB = evalResult.verdict === 'ACCEPTED_GRADE_B';
              const isReject = evalResult.verdict === 'REJECTED_AT_DOCK';

              return (
                <div
                  key={rule.id}
                  onClick={() => handleSelectRule(rule.id)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                    isSelected
                      ? 'bg-stone-900 border-amber-500 ring-2 ring-amber-500/20 shadow-lg'
                      : 'bg-stone-950/60 border-stone-800 hover:border-stone-700'
                  }`}
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {getMarketIcon(rule.market)}
                        <div>
                          <div className="text-xs font-bold text-stone-100 flex items-center gap-1.5">
                            <span>{rule.name}</span>
                            {isSelected && (
                              <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded font-mono">
                                ACTIVE
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-stone-400 font-sans">{rule.customer}</div>
                        </div>
                      </div>

                      {/* Verdict Badge */}
                      <span
                        className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                          isGradeA
                            ? 'bg-emerald-950/80 text-emerald-300 border-emerald-600'
                            : isGradeB
                            ? 'bg-amber-950/80 text-amber-300 border-amber-600'
                            : 'bg-rose-950/80 text-rose-300 border-rose-600'
                        }`}
                      >
                        {isGradeA ? 'GRADE A' : isGradeB ? 'GRADE B' : 'REJECTED'}
                      </span>
                    </div>

                    {/* Rule Tolerances Snapshot */}
                    <div className="mt-3 p-2.5 rounded-lg bg-stone-900/90 border border-stone-800/80 text-[11px] font-mono space-y-1">
                      <div className="flex justify-between text-stone-400">
                        <span>Grade A Defect:</span>
                        <span className="text-stone-200">{rule.grade_a.defect_percent}%</span>
                      </div>
                      <div className="flex justify-between text-stone-400">
                        <span>Grade A Firmness:</span>
                        <span className="text-stone-200">{rule.grade_a.firmness || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between text-stone-400">
                        <span>Grade B Defect:</span>
                        <span className="text-stone-200">{rule.grade_b.defect_percent}%</span>
                      </div>
                      <div className="flex justify-between text-stone-400">
                        <span>Dynamic Markdown:</span>
                        <span className="text-amber-400">-{rule.grade_b.recommended_discount_percent || 15}%</span>
                      </div>
                    </div>

                    {/* Explanation Summary */}
                    <p className="text-[11px] text-stone-300 mt-2.5 line-clamp-3 leading-relaxed">
                      {evalResult.dispositionNotes}
                    </p>
                  </div>

                  {/* Footer Action */}
                  <div className="pt-2.5 border-t border-stone-800/80 flex items-center justify-between text-xs">
                    <span className="text-[10px] text-stone-500 font-mono">
                      Score: <strong className="text-stone-300">{evalResult.qualityScore}/100</strong>
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectRule(rule.id);
                      }}
                      className={`px-2.5 py-1 rounded text-[11px] font-semibold flex items-center gap-1 transition-colors ${
                        isSelected
                          ? 'bg-amber-500 text-stone-950 font-bold'
                          : 'bg-stone-800 text-stone-300 hover:text-white'
                      }`}
                    >
                      {isSelected ? 'Applied to Dock' : 'Select Customer'}
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Active Rule In-Depth Clause Evaluation Checklist */}
          <div className="p-4 rounded-xl bg-stone-950 border border-stone-800 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <h4 className="text-xs font-bold text-stone-200 uppercase tracking-wider">
                  Live Clause Verification for "{activeRule.name}"
                </h4>
              </div>
              <span className="text-xs font-mono text-stone-400">
                Verdict: <strong className="text-white">{activeEvaluation.verdict}</strong> ({activeEvaluation.qualityScore}/100)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 mt-1">
              {activeEvaluation.evaluatedClauses.map((clause, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-lg border text-xs flex flex-col justify-between gap-1.5 ${
                    clause.passed
                      ? 'bg-emerald-950/20 border-emerald-800/60 text-emerald-200'
                      : 'bg-rose-950/20 border-rose-800/60 text-rose-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-stone-200 truncate">{clause.label}</span>
                    {clause.passed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    )}
                  </div>
                  <div className="font-mono text-[11px] text-stone-400">
                    Rule: <span className="text-stone-300">{clause.ruleExpression}</span>
                  </div>
                  <div className="font-mono text-[11px]">
                    Measured: <strong className="text-white">{clause.measuredValue}</strong>
                  </div>
                  <p className="text-[10px] text-stone-400 line-clamp-2 mt-0.5">
                    {clause.explanation}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Rule Configurator (Visual Sliders & Inputs) */}
      {activeTab === 'configurator' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="flex flex-col gap-4 bg-stone-950 p-5 rounded-xl border border-stone-800">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                <Sliders className="w-4 h-4" />
                Tune Commercial Tolerances
              </h3>
              <span className="text-[11px] text-stone-400 font-mono">
                Customer: {editCustomerName}
              </span>
            </div>

            {/* Profile Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-stone-400 block mb-1">
                  Commodity Name
                </label>
                <input
                  type="text"
                  value={editCommodity}
                  onChange={(e) => setEditCommodity(e.target.value)}
                  className="w-full bg-stone-900 border border-stone-800 rounded-lg px-3 py-1.5 text-xs text-stone-100 font-mono"
                  placeholder="e.g. tomato"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-stone-400 block mb-1">
                  Market Channel
                </label>
                <select
                  value={editMarket}
                  onChange={(e) => setEditMarket(e.target.value as any)}
                  className="w-full bg-stone-900 border border-stone-800 rounded-lg px-3 py-1.5 text-xs text-stone-100 font-mono"
                >
                  <option value="quick_commerce">quick_commerce (10-Min Delivery)</option>
                  <option value="premium_supermarket">premium_supermarket (Organic/Whole Foods)</option>
                  <option value="food_service_processing">food_service_processing (Puree/Sauce)</option>
                  <option value="export_cold_chain">export_cold_chain (Long-Haul)</option>
                  <option value="wholesale_mandi">wholesale_mandi (APMC Bulk)</option>
                  <option value="custom">custom (Custom Tolerance)</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="text-[11px] font-semibold text-stone-400 block mb-1">
                  Client / Customer Account Name
                </label>
                <input
                  type="text"
                  value={editCustomerName}
                  onChange={(e) => setEditCustomerName(e.target.value)}
                  className="w-full bg-stone-900 border border-stone-800 rounded-lg px-3 py-1.5 text-xs text-stone-100"
                  placeholder="e.g. Zepto Quick-Commerce Hub #14"
                />
              </div>
            </div>

            {/* Grade A Rules */}
            <div className="p-3.5 rounded-lg bg-emerald-950/20 border border-emerald-900/60 flex flex-col gap-3">
              <div className="text-xs font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                Grade A Criteria (Premium Acceptance)
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] text-stone-400 block mb-1 font-mono">
                    Defect Percent (e.g. &lt;5)
                  </label>
                  <input
                    type="text"
                    value={gradeADefect}
                    onChange={(e) => setGradeADefect(e.target.value)}
                    className="w-full bg-stone-900 border border-stone-800 rounded-lg px-2.5 py-1 text-xs text-stone-100 font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-stone-400 block mb-1 font-mono">
                    Maturity Stages (e.g. 4,5)
                  </label>
                  <input
                    type="text"
                    value={gradeAMaturity}
                    onChange={(e) => setGradeAMaturity(e.target.value)}
                    className="w-full bg-stone-900 border border-stone-800 rounded-lg px-2.5 py-1 text-xs text-stone-100 font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-stone-400 block mb-1 font-mono">
                    Firmness (e.g. &gt;3.5)
                  </label>
                  <input
                    type="text"
                    value={gradeAFirmness}
                    onChange={(e) => setGradeAFirmness(e.target.value)}
                    className="w-full bg-stone-900 border border-stone-800 rounded-lg px-2.5 py-1 text-xs text-stone-100 font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Grade B Rules */}
            <div className="p-3.5 rounded-lg bg-amber-950/20 border border-amber-900/60 flex flex-col gap-3">
              <div className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5" />
                Grade B Criteria (Fast-Track Dispatch &amp; Dynamic Discount)
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] text-stone-400 block mb-1 font-mono">
                    Defect Percent (e.g. 5-15)
                  </label>
                  <input
                    type="text"
                    value={gradeBDefect}
                    onChange={(e) => setGradeBDefect(e.target.value)}
                    className="w-full bg-stone-900 border border-stone-800 rounded-lg px-2.5 py-1 text-xs text-stone-100 font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-stone-400 block mb-1 font-mono">
                    Firmness (e.g. 2.5-3.5)
                  </label>
                  <input
                    type="text"
                    value={gradeBFirmness}
                    onChange={(e) => setGradeBFirmness(e.target.value)}
                    className="w-full bg-stone-900 border border-stone-800 rounded-lg px-2.5 py-1 text-xs text-stone-100 font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-stone-400 block mb-1 font-mono">
                    Dynamic Discount (% markdown)
                  </label>
                  <input
                    type="number"
                    value={gradeBDiscount}
                    onChange={(e) => setGradeBDiscount(Number(e.target.value))}
                    className="w-full bg-stone-900 border border-stone-800 rounded-lg px-2.5 py-1 text-xs text-stone-100 font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Apply Button */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={handleApplyConfigurator}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs flex items-center gap-2 shadow-md transition-all"
              >
                {saveSuccess ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Applied to Grade Engine!</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Apply &amp; Test Live Tolerances</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Real-time Preview of Configured Rule */}
          <div className="flex flex-col gap-4 bg-stone-950 p-5 rounded-xl border border-stone-800">
            <div className="border-b border-stone-800 pb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-200">
                Live Simulation Output for Active Batch
              </h3>
              <p className="text-[11px] text-stone-400 mt-0.5">
                Evaluation results using the current tuned parameters
              </p>
            </div>

            {/* Verdict Display */}
            <div
              className={`p-4 rounded-xl border flex items-center justify-between ${
                activeEvaluation.verdict === 'ACCEPTED_GRADE_A'
                  ? 'bg-emerald-950/40 border-emerald-500 text-emerald-100'
                  : activeEvaluation.verdict === 'ACCEPTED_GRADE_B'
                  ? 'bg-amber-950/40 border-amber-500 text-amber-100'
                  : 'bg-rose-950/40 border-rose-500 text-rose-100'
              }`}
            >
              <div>
                <div className="text-[10px] font-mono uppercase tracking-wider">
                  Resulting Verdict
                </div>
                <div className="text-lg font-black tracking-tight mt-0.5">
                  {activeEvaluation.verdict}
                </div>
                <p className="text-xs text-stone-300 mt-1">
                  {activeEvaluation.dispositionNotes}
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-black font-mono">
                  {activeEvaluation.qualityScore}
                  <span className="text-xs text-stone-400">/100</span>
                </div>
                {activeEvaluation.recommendedDiscountPercent > 0 && (
                  <div className="text-[11px] font-mono text-amber-400 mt-1 font-bold">
                    -{activeEvaluation.recommendedDiscountPercent}% Markdown
                  </div>
                )}
              </div>
            </div>

            {/* Routing Tag & Dispatch Window */}
            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div className="p-3 rounded-lg bg-stone-900 border border-stone-800">
                <span className="text-[10px] text-stone-400 block">WMS ERP Routing Bin:</span>
                <span className="text-cyan-300 font-bold mt-1 block truncate">
                  {activeEvaluation.erpRoutingTag}
                </span>
              </div>
              <div className="p-3 rounded-lg bg-stone-900 border border-stone-800">
                <span className="text-[10px] text-stone-400 block">Dispatch Window:</span>
                <span className="text-amber-300 font-bold mt-1 block">
                  {activeEvaluation.dispatchWindowHours > 0
                    ? `< ${activeEvaluation.dispatchWindowHours} Hours`
                    : 'Standard Cycle'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Commercial JSON Format (Directly matching User Request Example) */}
      {activeTab === 'json' && (
        <div className="flex flex-col gap-4 bg-stone-950 p-5 rounded-xl border border-stone-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-800 pb-3">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
                <Code className="w-4 h-4" />
                Raw Commercial Rules Specification (JSON)
              </h3>
              <p className="text-xs text-stone-400 mt-0.5">
                Exact schema demonstrated in your brief: define commodity, market, grade_a tolerances, and grade_b windows.
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={handleExportRulesJson}
                className="px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-[11px] font-mono flex items-center gap-1 border border-stone-700"
                title="Export all commercial rules to JSON file"
              >
                <Download className="w-3 h-3 text-cyan-400" />
                <span>Export JSON</span>
              </button>
              <label
                className="px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-[11px] font-mono flex items-center gap-1 border border-stone-700 cursor-pointer"
                title="Import commercial rules from JSON file"
              >
                <Upload className="w-3 h-3 text-amber-400" />
                <span>Import JSON</span>
                <input
                  type="file"
                  accept=".json,application/json"
                  className="hidden"
                  onChange={handleImportRulesFile}
                />
              </label>
              <button
                onClick={() => {
                  const sampleJson = {
                    commodity: "tomato",
                    market: "quick_commerce",
                    grade_a: {
                      defect_percent: "<5",
                      maturity: [4, 5],
                      firmness: ">3.5"
                    },
                    grade_b: {
                      defect_percent: "5-15",
                      firmness: "2.5-3.5"
                    }
                  };
                  setJsonString(JSON.stringify(sampleJson, null, 2));
                  setJsonError(null);
                }}
                className="px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 text-[11px] font-mono flex items-center gap-1"
                title="Reset to User Brief Example"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Load Brief Example</span>
              </button>
            </div>
          </div>

          <div className="relative">
            <textarea
              value={jsonString}
              onChange={(e) => {
                setJsonString(e.target.value);
                setJsonError(null);
              }}
              rows={14}
              className="w-full bg-stone-900 border border-stone-800 rounded-xl p-4 font-mono text-xs text-emerald-400 focus:outline-none focus:border-cyan-500 leading-relaxed"
              spellCheck={false}
            />
          </div>

          {jsonError && (
            <div className="p-3 rounded-lg bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{jsonError}</span>
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <span className="text-[11px] text-stone-400 font-mono">
              Auto-parses numeric expressions: &lt;X, &lt;=X, &gt;X, X-Y ranges, and [X,Y] arrays.
            </span>
            <button
              onClick={handleApplyJson}
              className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-stone-950 font-bold text-xs flex items-center gap-2 shadow-md transition-all"
            >
              {saveSuccess ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Custom Rule Deployed!</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Parse &amp; Apply JSON Rule</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
