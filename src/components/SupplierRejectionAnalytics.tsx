import React, { useState, useMemo } from 'react';
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
  ReferenceLine,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  AlertOctagon,
  Building2,
  Calendar,
  CheckCircle2,
  Filter,
  BarChart3,
  Percent,
  Download,
  AlertTriangle,
  Compass,
  Award,
  ShieldCheck,
  CheckSquare,
  Square,
  Activity,
  Layers,
} from 'lucide-react';

interface SupplierRejectionAnalyticsProps {
  currentSupplier: string;
  onSelectSupplier?: (supplierName: string) => void;
}

export interface DailySupplierMetric {
  date: string;
  displayDate: string;
  totalCrates: number;
  acceptedGradeA: number;
  acceptedGradeB: number;
  rejectedCrates: number;
  rejectionRate: number;
  slaLimit: number;
  primaryDefect: string;
  avgFirmness: number;
}

export interface SupplierRadarProfile {
  supplier: string;
  shortName: string;
  color: string;
  fillColor: string;
  borderClass: string;
  badgeClass: string;
  metrics: {
    qualityConsistency: number; // 0-100 (high = low variance / steady quality)
    rejectionAvoidance: number; // 0-100 (high = low rejection / SLA adherence)
    gradeAYield: number;        // 0-100 (% of delivery accepted as Grade A)
    coldChainDiscipline: number;// 0-100 (thermal transit integrity)
    firmnessIndex: number;      // 0-100 (mechanical firmness score)
    volumeReliability: number;  // 0-100 (PO order fulfillment rate)
  };
  rawStats: {
    avgRejectionRate: number;
    gradeAPct: number;
    totalCrates: number;
    avgFirmness: number;
    scoreStdDev: number;
    overallTier: string;
    compositeScore: number;
  };
}

// Well-known dark store suppliers for fast switching & benchmarking
const PRESET_SUPPLIERS = [
  'Saraswati Agritech Cluster #3',
  'GreenField Organic Farms #4',
  'Himalayan Orchard Union #12',
  'Kashmir Valley Logistics',
];

const SUPPLIER_THEME_MAP: Record<
  string,
  {
    color: string;
    fillColor: string;
    shortName: string;
    borderClass: string;
    badgeClass: string;
  }
> = {
  'Saraswati Agritech Cluster #3': {
    color: '#38bdf8', // Cyan 400
    fillColor: '#0284c7', // Cyan 600
    shortName: 'Saraswati Cluster',
    borderClass: 'border-cyan-500/50 text-cyan-300 bg-cyan-950/40',
    badgeClass: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
  },
  'GreenField Organic Farms #4': {
    color: '#34d399', // Emerald 400
    fillColor: '#059669', // Emerald 600
    shortName: 'GreenField Farms',
    borderClass: 'border-emerald-500/50 text-emerald-300 bg-emerald-950/40',
    badgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
  },
  'Himalayan Orchard Union #12': {
    color: '#fbbf24', // Amber 400
    fillColor: '#d97706', // Amber 600
    shortName: 'Himalayan Orchards',
    borderClass: 'border-amber-500/50 text-amber-300 bg-amber-950/40',
    badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
  },
  'Kashmir Valley Logistics': {
    color: '#c084fc', // Purple 400
    fillColor: '#9333ea', // Purple 600
    shortName: 'Kashmir Valley',
    borderClass: 'border-purple-500/50 text-purple-300 bg-purple-950/40',
    badgeClass: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
  },
};

function getSupplierTheme(supplier: string, index = 0) {
  if (SUPPLIER_THEME_MAP[supplier]) {
    return SUPPLIER_THEME_MAP[supplier];
  }
  const fallbackColors = [
    {
      color: '#f43f5e',
      fillColor: '#e11d48',
      borderClass: 'border-rose-500/50 text-rose-300 bg-rose-950/40',
      badgeClass: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    },
    {
      color: '#818cf8',
      fillColor: '#4f46e5',
      borderClass: 'border-indigo-500/50 text-indigo-300 bg-indigo-950/40',
      badgeClass: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
    },
  ];
  const choice = fallbackColors[index % fallbackColors.length];
  return {
    ...choice,
    shortName: supplier.length > 18 ? supplier.slice(0, 16) + '..' : supplier,
  };
}

const RADAR_METRIC_AXES = [
  {
    key: 'qualityConsistency',
    label: 'Quality Consistency',
    description: 'Score stability & low variance across 30 days',
  },
  {
    key: 'rejectionAvoidance',
    label: 'Rejection Avoidance',
    description: 'Dock acceptance compliance against ≤ 5% SLA',
  },
  {
    key: 'gradeAYield',
    label: 'Grade A Pass Rate',
    description: 'Ratio of crates accepted as premium Grade A',
  },
  {
    key: 'coldChainDiscipline',
    label: 'Cold-Chain Discipline',
    description: 'Reefer thermal adherence & arrival temperature',
  },
  {
    key: 'firmnessIndex',
    label: 'Firmness Integrity',
    description: 'Penetrometer mechanical resistance at gate',
  },
  {
    key: 'volumeReliability',
    label: 'Volume Fulfillment',
    description: 'Order fulfillment adherence against dock PO',
  },
] as const;

/**
 * Deterministically generates realistic 30-day receiving dock rejection data for any supplier.
 */
function generate30DaySupplierHistory(supplier: string): DailySupplierMetric[] {
  // Deterministic seed based on string hash
  let hash = 0;
  for (let i = 0; i < supplier.length; i++) {
    hash = (hash << 5) - hash + supplier.charCodeAt(i);
    hash |= 0;
  }
  const absHash = Math.abs(hash);

  // Baseline rejection rate for this supplier (between 2.5% and 9.5%)
  const baseRate = 2.5 + (absHash % 70) / 10;
  const isHighRisk = absHash % 3 === 0;

  const defectsList = [
    'Transit Bruising',
    'Sunscald / Over-exposure',
    'Mechanical Compression',
    'Fungal Soft Rot',
    'Stem Scar Tearing',
    'Over-ripeness / Internal Breakdown',
  ];

  const metrics: DailySupplierMetric[] = [];
  const baseDate = new Date('2026-09-21T00:00:00Z');

  for (let i = 29; i >= 0; i--) {
    const d = new Date(baseDate);
    d.setDate(d.getDate() - i);

    const monthStr = d.toLocaleDateString('en-US', { month: 'short' });
    const dayStr = String(d.getDate()).padStart(2, '0');
    const displayDate = `${monthStr} ${dayStr}`;

    // Delivery batch size varies between 40 and 120 crates
    const daySeed = (absHash + i * 37) % 100;
    const totalCrates = 50 + ((daySeed * 7) % 70);

    // Occasional spikes (e.g. heatwave or rough transit)
    let variance = ((daySeed % 11) - 5) * 0.8;
    if (i === 4 || i === 18) {
      variance += isHighRisk ? 5.5 : 2.5; // realistic spike day
    }

    const rejectionRate = Math.max(0.5, Math.min(22, +(baseRate + variance).toFixed(1)));
    const rejectedCrates = Math.round((rejectionRate / 100) * totalCrates);
    const acceptedTotal = totalCrates - rejectedCrates;
    const acceptedGradeB = Math.round(acceptedTotal * 0.22);
    const acceptedGradeA = acceptedTotal - acceptedGradeB;

    const primaryDefect = defectsList[(absHash + i) % defectsList.length];
    const avgFirmness = +(4.2 + ((daySeed % 15) / 10)).toFixed(1);

    metrics.push({
      date: d.toISOString().split('T')[0],
      displayDate,
      totalCrates,
      acceptedGradeA,
      acceptedGradeB,
      rejectedCrates,
      rejectionRate,
      slaLimit: 5.0, // Dark Store 5% contractual max rejection SLA
      primaryDefect,
      avgFirmness,
    });
  }

  return metrics;
}

/**
 * Derives normalized 0-100 radar comparison metrics from a supplier's 30-day historical data.
 */
function calculateSupplierRadarProfile(
  supplier: string,
  history: DailySupplierMetric[],
  index = 0
): SupplierRadarProfile {
  let hash = 0;
  for (let i = 0; i < supplier.length; i++) {
    hash = (hash << 5) - hash + supplier.charCodeAt(i);
    hash |= 0;
  }
  const absHash = Math.abs(hash);

  const totalCrates = history.reduce((sum, h) => sum + h.totalCrates, 0);
  const totalRejected = history.reduce((sum, h) => sum + h.rejectedCrates, 0);
  const totalGradeA = history.reduce((sum, h) => sum + h.acceptedGradeA, 0);
  const avgRejectionRate = +(
    history.reduce((sum, h) => sum + h.rejectionRate, 0) / history.length
  ).toFixed(1);

  // Quality Consistency: calculate standard deviation of daily rejection rates
  const meanRate = avgRejectionRate;
  const variance =
    history.reduce((acc, h) => acc + Math.pow(h.rejectionRate - meanRate, 2), 0) / history.length;
  const stdDev = Math.sqrt(variance);
  // Quality consistency: 100 is perfectly consistent, each 1% std dev drops consistency by ~8.5 points
  const qualityConsistency = Math.min(98, Math.max(50, Math.round(98 - stdDev * 8.5)));

  // Rejection avoidance (SLA adherence): inverse of rejection rate (5% SLA = ~65, 2% = 85+)
  const rejectionAvoidance = Math.min(99, Math.max(45, Math.round(99 - avgRejectionRate * 7.2)));

  // Grade A Yield: % of total delivery that is Grade A
  const gradeAPct = Math.round((totalGradeA / Math.max(1, totalCrates)) * 100);
  const gradeAYield = Math.min(98, Math.max(55, gradeAPct));

  // Cold Chain Discipline: Seeded deterministically with realistic variation
  const coldChainDiscipline = Math.min(98, Math.max(62, Math.round(85 + ((absHash % 17) - 6))));

  // Firmness Integrity: average penetrometer score normalized to 0-100
  const avgFirmness = +(
    history.reduce((sum, h) => sum + h.avgFirmness, 0) / history.length
  ).toFixed(1);
  const firmnessIndex = Math.min(98, Math.max(55, Math.round((avgFirmness / 5.4) * 95)));

  // Volume Reliability: fulfillment adherence
  const volumeReliability = Math.min(99, Math.max(68, Math.round(90 + ((absHash % 13) - 4))));

  const compositeScore = Math.round(
    (qualityConsistency +
      rejectionAvoidance +
      gradeAYield +
      coldChainDiscipline +
      firmnessIndex +
      volumeReliability) /
      6
  );

  let overallTier = 'Tier 1 • Preferred';
  if (avgRejectionRate > 6.0 || qualityConsistency < 72) {
    overallTier = 'Tier 3 • Under Review';
  } else if (avgRejectionRate > 4.5 || qualityConsistency < 83) {
    overallTier = 'Tier 2 • Standard Monitor';
  }

  const theme = getSupplierTheme(supplier, index);

  return {
    supplier,
    shortName: theme.shortName,
    color: theme.color,
    fillColor: theme.fillColor,
    borderClass: theme.borderClass,
    badgeClass: theme.badgeClass,
    metrics: {
      qualityConsistency,
      rejectionAvoidance,
      gradeAYield,
      coldChainDiscipline,
      firmnessIndex,
      volumeReliability,
    },
    rawStats: {
      avgRejectionRate,
      gradeAPct,
      totalCrates,
      avgFirmness,
      scoreStdDev: +stdDev.toFixed(2),
      overallTier,
      compositeScore,
    },
  };
}

export const SupplierRejectionAnalytics: React.FC<SupplierRejectionAnalyticsProps> = ({
  currentSupplier,
  onSelectSupplier,
}) => {
  const [selectedSupplier, setSelectedSupplier] = useState<string>(
    currentSupplier || PRESET_SUPPLIERS[0]
  );
  const [chartMode, setChartMode] = useState<'COMBINED' | 'RATE_TREND' | 'RADAR_BENCHMARK'>(
    'COMBINED'
  );

  // Sync if parent updates current supplier
  React.useEffect(() => {
    if (currentSupplier && currentSupplier !== selectedSupplier) {
      setSelectedSupplier(currentSupplier);
    }
  }, [currentSupplier]);

  const allSuppliersList = useMemo(() => {
    return Array.from(new Set([selectedSupplier, ...PRESET_SUPPLIERS]));
  }, [selectedSupplier]);

  // Selected suppliers to display simultaneously on the Radar Chart
  const [selectedRadarSuppliers, setSelectedRadarSuppliers] = useState<string[]>(() => [
    ...PRESET_SUPPLIERS,
  ]);

  // Ensure current active supplier is always included in radar comparisons
  React.useEffect(() => {
    setSelectedRadarSuppliers((prev) =>
      prev.includes(selectedSupplier) ? prev : [...prev, selectedSupplier]
    );
  }, [selectedSupplier]);

  const history = useMemo(() => {
    return generate30DaySupplierHistory(selectedSupplier);
  }, [selectedSupplier]);

  // Compute 30-day KPI aggregates for current selected supplier
  const summary = useMemo(() => {
    const totalCrates = history.reduce((acc, curr) => acc + curr.totalCrates, 0);
    const totalRejected = history.reduce((acc, curr) => acc + curr.rejectedCrates, 0);
    const totalAcceptedA = history.reduce((acc, curr) => acc + curr.acceptedGradeA, 0);
    const totalAcceptedB = history.reduce((acc, curr) => acc + curr.acceptedGradeB, 0);
    const avgRejectionRate = +(
      history.reduce((acc, curr) => acc + curr.rejectionRate, 0) / history.length
    ).toFixed(2);

    const highSpikeDays = history.filter((h) => h.rejectionRate > 5.0).length;
    const estimatedRmaLoss = totalRejected * 14.5; // ~$14.50 avg crate cost

    // Defect counts
    const defectMap: Record<string, number> = {};
    history.forEach((h) => {
      if (h.rejectedCrates > 0) {
        defectMap[h.primaryDefect] = (defectMap[h.primaryDefect] || 0) + h.rejectedCrates;
      }
    });

    const topDefect = Object.entries(defectMap).sort((a, b) => b[1] - a[1])[0] || [
      'Transit Bruising',
      0,
    ];

    return {
      totalCrates,
      totalRejected,
      totalAcceptedA,
      totalAcceptedB,
      avgRejectionRate,
      highSpikeDays,
      estimatedRmaLoss,
      topDefectName: topDefect[0],
      topDefectCount: topDefect[1],
      isSlaCompliant: avgRejectionRate <= 5.0,
    };
  }, [history]);

  // Compute full radar profiles for all benchmark suppliers
  const allProfiles = useMemo(() => {
    return allSuppliersList.map((sup, idx) => {
      const supHistory =
        sup === selectedSupplier ? history : generate30DaySupplierHistory(sup);
      return calculateSupplierRadarProfile(sup, supHistory, idx);
    });
  }, [allSuppliersList, selectedSupplier, history]);

  const profilesMap = useMemo(() => {
    const map: Record<string, SupplierRadarProfile> = {};
    allProfiles.forEach((p) => {
      map[p.supplier] = p;
    });
    return map;
  }, [allProfiles]);

  // Transform data for Recharts RadarChart format
  const radarChartData = useMemo(() => {
    return RADAR_METRIC_AXES.map((axis) => {
      const row: Record<string, string | number> = {
        metric: axis.label,
        description: axis.description,
        fullMark: 100,
      };
      allSuppliersList.forEach((sup) => {
        const prof = profilesMap[sup];
        if (prof) {
          row[sup] = prof.metrics[axis.key as keyof typeof prof.metrics];
        }
      });
      return row;
    });
  }, [allSuppliersList, profilesMap]);

  // Active radar profiles based on user checkbox filters
  const activeRadarProfiles = useMemo(() => {
    return allProfiles.filter((p) => selectedRadarSuppliers.includes(p.supplier));
  }, [allProfiles, selectedRadarSuppliers]);

  // Best-in-class highlights
  const bestConsistency = useMemo(() => {
    return [...allProfiles].sort(
      (a, b) => b.metrics.qualityConsistency - a.metrics.qualityConsistency
    )[0];
  }, [allProfiles]);

  const bestRejection = useMemo(() => {
    return [...allProfiles].sort(
      (a, b) => a.rawStats.avgRejectionRate - b.rawStats.avgRejectionRate
    )[0];
  }, [allProfiles]);

  const bestGradeA = useMemo(() => {
    return [...allProfiles].sort(
      (a, b) => b.rawStats.gradeAPct - a.rawStats.gradeAPct
    )[0];
  }, [allProfiles]);

  const toggleRadarSupplier = (sup: string) => {
    setSelectedRadarSuppliers((prev) => {
      if (prev.includes(sup)) {
        if (prev.length === 1) return prev; // Keep at least one
        return prev.filter((s) => s !== sup);
      } else {
        return [...prev, sup];
      }
    });
  };

  const handleSupplierChange = (sup: string) => {
    setSelectedSupplier(sup);
    if (onSelectSupplier) {
      onSelectSupplier(sup);
    }
  };

  return (
    <div className="rounded-xl bg-stone-950/70 border border-stone-800 p-4 sm:p-5 flex flex-col gap-4">
      {/* Header with Title and Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-800/80">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-cyan-950 border border-cyan-800 flex items-center justify-center text-cyan-400">
              <BarChart3 className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-bold text-stone-100 flex items-center gap-2 flex-wrap">
              <span>Dark Store Supplier Quality Gate Analytics</span>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                  summary.isSlaCompliant
                    ? 'bg-emerald-950/70 border-emerald-700 text-emerald-400'
                    : 'bg-rose-950/70 border-rose-700 text-rose-400'
                }`}
              >
                {summary.isSlaCompliant ? 'SLA COMPLIANT (≤5%)' : 'SLA BREACH ALERT (>5%)'}
              </span>
            </h4>
          </div>
          <p className="text-xs text-stone-400 mt-1">
            Receiving dock crate gate rejection rates, multi-supplier consistency radar, and root-cause defect audits.
          </p>
        </div>

        {/* Chart View Modes */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto bg-stone-900 p-1 rounded-xl border border-stone-800 flex-wrap">
          <button
            onClick={() => setChartMode('COMBINED')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              chartMode === 'COMBINED'
                ? 'bg-stone-800 text-cyan-300 shadow-sm'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Volume & Rejection</span>
          </button>
          <button
            onClick={() => setChartMode('RATE_TREND')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              chartMode === 'RATE_TREND'
                ? 'bg-stone-800 text-amber-300 shadow-sm'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Percent className="w-3.5 h-3.5" />
            <span>Rate Trendline</span>
          </button>
          <button
            onClick={() => setChartMode('RADAR_BENCHMARK')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              chartMode === 'RADAR_BENCHMARK'
                ? 'bg-stone-800 text-purple-300 shadow-sm ring-1 ring-purple-500/50'
                : 'text-stone-400 hover:text-stone-200'
            }`}
            title="Compare suppliers across quality score consistency, rejection rates, and cold chain on a radar chart"
          >
            <Compass className="w-3.5 h-3.5 text-purple-400" />
            <span>Supplier Radar</span>
          </button>
        </div>
      </div>

      {/* Supplier Selector Chips (For Focused Inspection) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <span className="text-stone-400 font-medium shrink-0 flex items-center gap-1">
          <Building2 className="w-3.5 h-3.5 text-stone-500" />
          Active Vendor:
        </span>
        <div className="flex items-center gap-1.5 flex-wrap">
          {allSuppliersList.map((sup) => {
            const isSelected = selectedSupplier === sup;
            const theme = getSupplierTheme(sup);
            return (
              <button
                key={sup}
                onClick={() => handleSupplierChange(sup)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all truncate max-w-[220px] flex items-center gap-1.5 ${
                  isSelected
                    ? `${theme.badgeClass} ring-1 ring-cyan-500/50 shadow-sm`
                    : 'bg-stone-900 hover:bg-stone-800 border border-stone-800 text-stone-300'
                }`}
                title={`Inspect ${sup}`}
              >
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: theme.color }}
                />
                <span className="truncate">{theme.shortName}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 30-Day Metrics Summary Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
        <div className="p-3 rounded-xl bg-stone-900/80 border border-stone-800">
          <div className="text-[11px] text-stone-400 uppercase font-semibold">Total Received</div>
          <div className="text-lg font-black font-mono text-stone-100 mt-0.5">
            {summary.totalCrates.toLocaleString()} <span className="text-xs font-normal text-stone-500">crates</span>
          </div>
          <div className="text-[10px] text-emerald-400 font-mono mt-0.5">
            {summary.totalAcceptedA} Grade A • {summary.totalAcceptedB} Grade B
          </div>
        </div>

        <div className="p-3 rounded-xl bg-stone-900/80 border border-stone-800">
          <div className="text-[11px] text-stone-400 uppercase font-semibold">Avg Rejection Rate</div>
          <div
            className={`text-lg font-black font-mono mt-0.5 flex items-baseline gap-1.5 ${
              summary.isSlaCompliant ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            <span>{summary.avgRejectionRate}%</span>
            {summary.isSlaCompliant ? (
              <TrendingDown className="w-3.5 h-3.5 text-emerald-400 inline" />
            ) : (
              <TrendingUp className="w-3.5 h-3.5 text-rose-400 inline" />
            )}
          </div>
          <div className="text-[10px] text-stone-500 font-mono mt-0.5">
            Contractual SLA Target: ≤ 5.0%
          </div>
        </div>

        <div className="p-3 rounded-xl bg-stone-900/80 border border-stone-800">
          <div className="text-[11px] text-stone-400 uppercase font-semibold">Dock Rejections (RMA)</div>
          <div className="text-lg font-black font-mono text-rose-400 mt-0.5">
            {summary.totalRejected} <span className="text-xs font-normal text-stone-500">crates</span>
          </div>
          <div className="text-[10px] text-stone-500 font-mono mt-0.5">
            Debit memos: ~${summary.estimatedRmaLoss.toFixed(0)}
          </div>
        </div>

        <div className="p-3 rounded-xl bg-stone-900/80 border border-stone-800">
          <div className="text-[11px] text-stone-400 uppercase font-semibold">Quality Consistency</div>
          <div className="text-lg font-black font-mono text-purple-300 mt-0.5 flex items-baseline gap-1">
            <span>{profilesMap[selectedSupplier]?.metrics.qualityConsistency || 85}</span>
            <span className="text-xs font-normal text-stone-500">/100</span>
          </div>
          <div className="text-[10px] text-stone-500 font-mono mt-0.5 truncate">
            Variance: ±{profilesMap[selectedSupplier]?.rawStats.scoreStdDev || 1.1}%
          </div>
        </div>
      </div>

      {/* Main Visualization Container */}
      <div className="w-full bg-stone-900/50 rounded-xl p-3 sm:p-4 border border-stone-800/80">
        {chartMode === 'RADAR_BENCHMARK' ? (
          /* MULTI-SUPPLIER RADAR BENCHMARK VIEW */
          <div className="flex flex-col gap-4">
            {/* Radar Header & Supplier Comparison Filter Controls */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-stone-800">
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-purple-400 shrink-0" />
                <div>
                  <h5 className="text-xs font-bold text-stone-200">
                    Multi-Supplier Radar Benchmark (Key Operational Metrics)
                  </h5>
                  <p className="text-[11px] text-stone-400">
                    Comparing Quality Consistency, Rejection Avoidance, Grade A Yield, and Cold-Chain Discipline across receiving dock partners.
                  </p>
                </div>
              </div>

              {/* Convenience Toggles */}
              <div className="flex items-center gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setSelectedRadarSuppliers([...allSuppliersList])}
                  className="px-2.5 py-1 rounded-md bg-stone-800 hover:bg-stone-700 text-stone-300 text-[11px] font-medium transition-colors"
                >
                  Select All ({allSuppliersList.length})
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setSelectedRadarSuppliers([
                      bestConsistency.supplier,
                      bestRejection.supplier,
                    ])
                  }
                  className="px-2.5 py-1 rounded-md bg-purple-950/60 hover:bg-purple-900/80 border border-purple-800/60 text-purple-300 text-[11px] font-medium transition-colors"
                >
                  Compare Top 2
                </button>
              </div>
            </div>

            {/* Interactive Supplier Toggle Pills with Color Markers */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-medium text-stone-400 flex items-center gap-1">
                <Layers className="w-3 h-3 text-stone-500" />
                Active Radar Layers:
              </span>
              {allProfiles.map((p) => {
                const isActive = selectedRadarSuppliers.includes(p.supplier);
                return (
                  <button
                    key={p.supplier}
                    type="button"
                    onClick={() => toggleRadarSupplier(p.supplier)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all ${
                      isActive
                        ? `${p.badgeClass} ring-1 ring-offset-1 ring-offset-stone-950`
                        : 'bg-stone-900/80 border border-stone-800 text-stone-500 hover:text-stone-300 opacity-60'
                    }`}
                    title={`Click to ${isActive ? 'hide' : 'show'} ${p.supplier} on radar`}
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0 border border-black/30"
                      style={{ backgroundColor: p.color }}
                    />
                    <span>{p.shortName}</span>
                    <span className="text-[10px] font-mono opacity-80">
                      ({p.rawStats.compositeScore} pts)
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Radar Chart Display */}
            <div className="w-full h-80 sm:h-96 relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="72%" data={radarChartData}>
                  <PolarGrid stroke="#374151" strokeDasharray="3 3" />
                  <PolarAngleAxis
                    dataKey="metric"
                    tick={{ fill: '#d6d3d1', fontSize: 11, fontWeight: 600 }}
                  />
                  <PolarRadiusAxis
                    angle={30}
                    domain={[0, 100]}
                    stroke="#44403c"
                    tick={{ fill: '#78716c', fontSize: 9 }}
                    tickCount={5}
                  />
                  {activeRadarProfiles.map((profile) => (
                    <Radar
                      key={profile.supplier}
                      name={profile.shortName}
                      dataKey={profile.supplier}
                      stroke={profile.color}
                      fill={profile.fillColor}
                      fillOpacity={activeRadarProfiles.length > 2 ? 0.18 : 0.28}
                      strokeWidth={profile.supplier === selectedSupplier ? 3 : 2}
                      dot={{ r: 3, fill: profile.color }}
                    />
                  ))}
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const metricName = payload[0]?.payload?.metric as string;
                        const metricDesc = payload[0]?.payload?.description as string;
                        return (
                          <div className="bg-stone-900 border border-stone-700 rounded-xl p-3 shadow-2xl text-xs space-y-2 font-sans min-w-[220px]">
                            <div className="border-b border-stone-800 pb-1">
                              <div className="font-bold text-white flex items-center justify-between">
                                <span>{metricName}</span>
                                <span className="text-[10px] font-mono text-stone-400">Scale: 0-100</span>
                              </div>
                              <div className="text-[10px] text-stone-400 mt-0.5">{metricDesc}</div>
                            </div>
                            <div className="space-y-1">
                              {payload.map((entry) => {
                                const supplierName = entry.dataKey as string;
                                const prof = profilesMap[supplierName];
                                const val = entry.value;
                                return (
                                  <div
                                    key={supplierName}
                                    className="flex items-center justify-between gap-2"
                                  >
                                    <div className="flex items-center gap-1.5 truncate">
                                      <span
                                        className="w-2 h-2 rounded-full shrink-0"
                                        style={{ backgroundColor: entry.color }}
                                      />
                                      <span className="text-stone-300 truncate">
                                        {prof?.shortName || supplierName}:
                                      </span>
                                    </div>
                                    <span
                                      className="font-mono font-bold"
                                      style={{ color: entry.color }}
                                    >
                                      {val} / 100
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    iconType="circle"
                    wrapperStyle={{ paddingTop: '12px', fontSize: '11px' }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            {/* Comprehensive Multi-Supplier Scoreboard Table */}
            <div className="flex flex-col gap-2 pt-2 border-t border-stone-800">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-stone-300 flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-purple-400" />
                  Supplier Benchmark Scoreboard Matrix
                </span>
                <span className="text-[11px] text-stone-400 font-mono">
                  SLA benchmark: Rejection ≤ 5.0%
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-stone-800 text-[11px] text-stone-400 font-mono">
                      <th className="py-2 px-2.5">Supplier Name</th>
                      <th className="py-2 px-2.5 text-center">Quality Consistency</th>
                      <th className="py-2 px-2.5 text-center">30D Rejection Rate</th>
                      <th className="py-2 px-2.5 text-center">Grade A Yield</th>
                      <th className="py-2 px-2.5 text-center">Cold-Chain</th>
                      <th className="py-2 px-2.5 text-center">Vendor Tier</th>
                      <th className="py-2 px-2.5 text-right">Dock Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-800/60 font-sans">
                    {allProfiles.map((p) => {
                      const isCurrent = p.supplier === selectedSupplier;
                      const isBestConsistency = p.supplier === bestConsistency.supplier;
                      const isBestRejection = p.supplier === bestRejection.supplier;

                      return (
                        <tr
                          key={p.supplier}
                          className={`transition-colors ${
                            isCurrent
                              ? 'bg-purple-950/20'
                              : 'hover:bg-stone-900/60'
                          }`}
                        >
                          {/* Supplier Name */}
                          <td className="py-2.5 px-2.5">
                            <div className="flex items-center gap-2">
                              <span
                                className="w-2.5 h-2.5 rounded-full shrink-0"
                                style={{ backgroundColor: p.color }}
                              />
                              <div>
                                <div className="font-semibold text-stone-200 flex items-center gap-1.5">
                                  <span>{p.shortName}</span>
                                  {isCurrent && (
                                    <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                                      Active
                                    </span>
                                  )}
                                </div>
                                <div className="text-[10px] text-stone-400 font-mono truncate max-w-[180px]">
                                  {p.supplier}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Quality Consistency */}
                          <td className="py-2.5 px-2.5 text-center">
                            <div className="font-mono font-bold text-stone-200">
                              {p.metrics.qualityConsistency}/100
                            </div>
                            <div className="text-[10px] font-mono text-stone-400">
                              ±{p.rawStats.scoreStdDev}% variance
                              {isBestConsistency && (
                                <span className="text-purple-400 font-semibold ml-1">★ Top</span>
                              )}
                            </div>
                          </td>

                          {/* Rejection Rate */}
                          <td className="py-2.5 px-2.5 text-center">
                            <div
                              className={`font-mono font-bold ${
                                p.rawStats.avgRejectionRate <= 5.0
                                  ? 'text-emerald-400'
                                  : 'text-rose-400'
                              }`}
                            >
                              {p.rawStats.avgRejectionRate}%
                            </div>
                            <span
                              className={`text-[9px] font-mono px-1.5 py-0.2 rounded border ${
                                p.rawStats.avgRejectionRate <= 5.0
                                  ? 'bg-emerald-950/50 text-emerald-300 border-emerald-800'
                                  : 'bg-rose-950/50 text-rose-300 border-rose-800'
                              }`}
                            >
                              {p.rawStats.avgRejectionRate <= 5.0 ? 'Pass SLA' : 'Breach'}
                              {isBestRejection && ' • Lowest'}
                            </span>
                          </td>

                          {/* Grade A Yield */}
                          <td className="py-2.5 px-2.5 text-center">
                            <div className="font-mono font-bold text-stone-200">
                              {p.rawStats.gradeAPct}%
                            </div>
                            <div className="text-[10px] text-stone-400 font-mono">
                              {p.rawStats.totalCrates} crates
                            </div>
                          </td>

                          {/* Cold Chain Score */}
                          <td className="py-2.5 px-2.5 text-center">
                            <div className="font-mono font-semibold text-cyan-300">
                              {p.metrics.coldChainDiscipline}/100
                            </div>
                            <div className="text-[10px] text-stone-400 font-mono">
                              {p.rawStats.avgFirmness} kg/cm²
                            </div>
                          </td>

                          {/* Vendor Tier */}
                          <td className="py-2.5 px-2.5 text-center">
                            <span
                              className={`text-[10px] font-medium px-2 py-0.5 rounded-full border whitespace-nowrap ${
                                p.rawStats.overallTier.includes('Tier 1')
                                  ? 'bg-emerald-950/60 text-emerald-300 border-emerald-700/60'
                                  : p.rawStats.overallTier.includes('Tier 2')
                                  ? 'bg-amber-950/60 text-amber-300 border-amber-700/60'
                                  : 'bg-rose-950/60 text-rose-300 border-rose-700/60'
                              }`}
                            >
                              {p.rawStats.overallTier}
                            </span>
                          </td>

                          {/* Switch Vendor Button */}
                          <td className="py-2.5 px-2.5 text-right">
                            {isCurrent ? (
                              <span className="text-[11px] text-stone-400 italic">Inspecting</span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleSupplierChange(p.supplier)}
                                className="px-2.5 py-1 rounded-md bg-stone-800 hover:bg-stone-700 text-stone-300 text-[11px] font-medium transition-colors whitespace-nowrap"
                              >
                                Select Vendor
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Key Radar Benchmark Insights */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2">
              <div className="p-2.5 rounded-lg bg-purple-950/30 border border-purple-800/40 text-xs">
                <div className="text-[10px] uppercase font-mono text-purple-400 font-bold">
                  Quality Consistency Leader
                </div>
                <div className="font-bold text-stone-100 mt-0.5">
                  {bestConsistency.shortName}
                </div>
                <p className="text-[10px] text-stone-400 mt-0.5">
                  Maintains lowest day-to-day rejection deviation (±{bestConsistency.rawStats.scoreStdDev}%) across 30 deliveries.
                </p>
              </div>

              <div className="p-2.5 rounded-lg bg-emerald-950/30 border border-emerald-800/40 text-xs">
                <div className="text-[10px] uppercase font-mono text-emerald-400 font-bold">
                  Lowest RMA Rejection Rate
                </div>
                <div className="font-bold text-stone-100 mt-0.5">
                  {bestRejection.shortName} ({bestRejection.rawStats.avgRejectionRate}%)
                </div>
                <p className="text-[10px] text-stone-400 mt-0.5">
                  Safely inside 5% dark store SLA with minimal credit notes and zero critical cold rot spikes.
                </p>
              </div>

              <div className="p-2.5 rounded-lg bg-cyan-950/30 border border-cyan-800/40 text-xs">
                <div className="text-[10px] uppercase font-mono text-cyan-400 font-bold">
                  Grade A Yield Benchmark
                </div>
                <div className="font-bold text-stone-100 mt-0.5">
                  {bestGradeA.shortName} ({bestGradeA.rawStats.gradeAPct}% Grade A)
                </div>
                <p className="text-[10px] text-stone-400 mt-0.5">
                  Maximizes premium 10-minute consumer packout with superior cosmetic and shape uniformity.
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* STANDARD VOLUME OR TRENDLINE CHARTS */
          <div>
            <div className="flex items-center justify-between text-xs text-stone-400 mb-2">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded bg-emerald-500/70" />
                  <span>Accepted Crates</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded bg-rose-500" />
                  <span>Rejected Crates</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-0.5 bg-cyan-400" />
                  <span>Rejection Rate (%)</span>
                </div>
              </div>
              <div className="flex items-center gap-1 text-[11px] font-mono text-amber-400">
                <span className="w-3 border-t-2 border-dashed border-amber-400 inline-block" />
                <span>5% SLA Limit</span>
              </div>
            </div>

            <div className="w-full h-64 sm:h-72">
              <ResponsiveContainer width="100%" height="100%">
                {chartMode === 'COMBINED' ? (
                  <ComposedChart data={history} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#292524" vertical={false} />
                    <XAxis
                      dataKey="displayDate"
                      tick={{ fill: '#a8a29e', fontSize: 10 }}
                      tickLine={false}
                      axisLine={{ stroke: '#44403c' }}
                      interval={4}
                    />
                    {/* Left YAxis: Crates Count */}
                    <YAxis
                      yAxisId="left"
                      tick={{ fill: '#a8a29e', fontSize: 10 }}
                      tickLine={false}
                      axisLine={{ stroke: '#44403c' }}
                    />
                    {/* Right YAxis: Rejection Rate % */}
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      domain={[0, 20]}
                      unit="%"
                      tick={{ fill: '#38bdf8', fontSize: 10 }}
                      tickLine={false}
                      axisLine={{ stroke: '#44403c' }}
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload as DailySupplierMetric;
                          return (
                            <div className="bg-stone-900 border border-stone-700 rounded-xl p-3 shadow-2xl text-xs space-y-1.5 font-sans min-w-[190px]">
                              <div className="flex items-center justify-between border-b border-stone-800 pb-1 font-bold text-white">
                                <span>{data.displayDate}, 2026</span>
                                <span
                                  className={`font-mono text-[10px] px-1.5 py-0.2 rounded ${
                                    data.rejectionRate <= 5
                                      ? 'bg-emerald-950 text-emerald-300'
                                      : 'bg-rose-950 text-rose-300'
                                  }`}
                                >
                                  {data.rejectionRate}% Rej
                                </span>
                              </div>
                              <div className="flex justify-between text-stone-300">
                                <span className="text-stone-400">Total Delivery:</span>
                                <span className="font-mono font-semibold">{data.totalCrates} crates</span>
                              </div>
                              <div className="flex justify-between text-emerald-400">
                                <span>Accepted (A+B):</span>
                                <span className="font-mono">{data.acceptedGradeA + data.acceptedGradeB} crates</span>
                              </div>
                              <div className="flex justify-between text-rose-400">
                                <span>Dock Rejections:</span>
                                <span className="font-mono font-bold">{data.rejectedCrates} crates</span>
                              </div>
                              <div className="border-t border-stone-800 pt-1 text-[11px] text-amber-300 flex items-center gap-1">
                                <span className="text-stone-500">Defect:</span>
                                <span className="truncate">{data.primaryDefect}</span>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    {/* 5% SLA Max Allowable Rejection Benchmark */}
                    <ReferenceLine
                      yAxisId="right"
                      y={5.0}
                      stroke="#fbbf24"
                      strokeDasharray="4 4"
                      label={{
                        value: 'SLA Max (5%)',
                        fill: '#fbbf24',
                        fontSize: 9,
                        position: 'insideTopRight',
                      }}
                    />
                    <Bar
                      yAxisId="left"
                      dataKey="acceptedGradeA"
                      name="Grade A"
                      stackId="crates"
                      fill="#059669"
                      opacity={0.8}
                      radius={[0, 0, 0, 0]}
                    />
                    <Bar
                      yAxisId="left"
                      dataKey="acceptedGradeB"
                      name="Grade B"
                      stackId="crates"
                      fill="#d97706"
                      opacity={0.8}
                      radius={[0, 0, 0, 0]}
                    />
                    <Bar
                      yAxisId="left"
                      dataKey="rejectedCrates"
                      name="Rejected"
                      stackId="crates"
                      fill="#f43f5e"
                      radius={[3, 3, 0, 0]}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="rejectionRate"
                      name="Rejection %"
                      stroke="#38bdf8"
                      strokeWidth={2.5}
                      dot={{ r: 2, fill: '#38bdf8' }}
                      activeDot={{ r: 5, fill: '#0284c7', stroke: '#fff', strokeWidth: 1 }}
                    />
                  </ComposedChart>
                ) : (
                  <AreaChart data={history} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="rateGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.8} />
                        <stop offset="50%" stopColor="#f59e0b" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#292524" vertical={false} />
                    <XAxis
                      dataKey="displayDate"
                      tick={{ fill: '#a8a29e', fontSize: 10 }}
                      tickLine={false}
                      axisLine={{ stroke: '#44403c' }}
                      interval={4}
                    />
                    <YAxis
                      domain={[0, 20]}
                      unit="%"
                      tick={{ fill: '#a8a29e', fontSize: 10 }}
                      tickLine={false}
                      axisLine={{ stroke: '#44403c' }}
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload as DailySupplierMetric;
                          return (
                            <div className="bg-stone-900 border border-stone-700 rounded-xl p-3 shadow-2xl text-xs space-y-1 font-sans">
                              <div className="font-bold text-white border-b border-stone-800 pb-1">
                                {data.displayDate}, 2026
                              </div>
                              <div className="text-stone-300">
                                Rejection Rate:{' '}
                                <span className="font-bold font-mono text-cyan-300">
                                  {data.rejectionRate}%
                                </span>
                              </div>
                              <div className="text-stone-400 text-[11px]">
                                {data.rejectedCrates} of {data.totalCrates} crates rejected
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <ReferenceLine
                      y={5.0}
                      stroke="#fbbf24"
                      strokeDasharray="4 4"
                      label={{
                        value: 'SLA Max (5%)',
                        fill: '#fbbf24',
                        fontSize: 9,
                        position: 'insideTopRight',
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="rejectionRate"
                      stroke="#f43f5e"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#rateGradient)"
                    />
                  </AreaChart>
                )}
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      {/* Supplier Performance Insight & Dock Action Advice */}
      <div className="p-3 rounded-xl bg-stone-900/60 border border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-start gap-2.5">
          <AlertOctagon
            className={`w-4 h-4 shrink-0 mt-0.5 ${
              summary.isSlaCompliant ? 'text-emerald-400' : 'text-amber-400'
            }`}
          />
          <div>
            <div className="font-semibold text-stone-200">
              {summary.isSlaCompliant
                ? 'Supplier Quality Tier: Tier-1 Preferred Vendor'
                : 'Supplier Quality Tier: Commercial Review Triggered'}
            </div>
            <p className="text-[11px] text-stone-400 mt-0.5 leading-relaxed">
              {summary.isSlaCompliant
                ? `${selectedSupplier} maintains an average rejection rate of ${summary.avgRejectionRate}%, comfortably under the 5% receiving dock SLA threshold.`
                : `${selectedSupplier} averaged ${summary.avgRejectionRate}% rejections over 30 days. ${summary.topDefectName} accounts for the majority of dock write-downs. An audit memo has been drafted.`}
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            if (chartMode === 'RADAR_BENCHMARK') {
              const csvRows = [
                'Supplier,Quality Consistency (0-100),30D Rejection Rate (%),Grade A Yield (%),Cold Chain Discipline (0-100),Firmness Score (0-100),Volume Reliability (0-100),Vendor Tier',
                ...allProfiles.map(
                  (p) =>
                    `"${p.supplier}",${p.metrics.qualityConsistency},${p.rawStats.avgRejectionRate},${p.rawStats.gradeAPct},${p.metrics.coldChainDiscipline},${p.metrics.firmnessIndex},${p.metrics.volumeReliability},"${p.rawStats.overallTier}"`
                ),
              ].join('\n');
              const blob = new Blob([csvRows], { type: 'text/csv;charset=utf-8;' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `DarkStore_MultiSupplier_Radar_Benchmark.csv`;
              a.click();
              URL.revokeObjectURL(url);
            } else {
              const csvRows = [
                'Date,Total Crates,Grade A,Grade B,Rejected,Rejection Rate (%),Primary Defect',
                ...history.map(
                  (h) =>
                    `${h.date},${h.totalCrates},${h.acceptedGradeA},${h.acceptedGradeB},${h.rejectedCrates},${h.rejectionRate},"${h.primaryDefect}"`
                ),
              ].join('\n');
              const blob = new Blob([csvRows], { type: 'text/csv;charset=utf-8;' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `Supplier_Rejection_Audit_${selectedSupplier.replace(/\s+/g, '_')}_30d.csv`;
              a.click();
              URL.revokeObjectURL(url);
            }
          }}
          className="px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors shrink-0"
        >
          <Download className="w-3.5 h-3.5 text-cyan-400" />
          <span>
            {chartMode === 'RADAR_BENCHMARK'
              ? 'Export Multi-Supplier Benchmark CSV'
              : 'Export 30D Audit CSV'}
          </span>
        </button>
      </div>
    </div>
  );
};
