import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Box,
  Building2,
  CheckCircle2,
  ChevronRight,
  Clock,
  Compass,
  DollarSign,
  Flame,
  Globe2,
  Layers,
  MapPin,
  Radio,
  RefreshCw,
  RotateCcw,
  Route,
  ShieldAlert,
  ShieldCheck,
  Thermometer,
  Truck,
  TrendingUp,
  Zap,
} from 'lucide-react';
import {
  COMMAND_CENTER_KPIS,
  SUPPLY_CHAIN_NODES,
  NETWORK_CONNECTIONS,
  type SupplyChainNode,
} from '../data/agriGradeDataPlatform';

interface AgriGradeCommandCenterProps {
  onSelectNode?: (nodeId: string) => void;
  onOpenDemandRouting?: () => void;
  onOpenPricingStudio?: () => void;
  onOpenSupplierScorecard?: () => void;
  onOpenAlerts?: () => void;
}

export const AgriGradeCommandCenter: React.FC<AgriGradeCommandCenterProps> = ({
  onSelectNode,
  onOpenDemandRouting,
  onOpenPricingStudio,
  onOpenSupplierScorecard,
  onOpenAlerts,
}) => {
  const [selectedNodeId, setSelectedNodeId] = useState<string>('node-transit-truck1');
  const [selectedFilter, setSelectedFilter] = useState<'ALL' | 'FARM' | 'TRANSIT' | 'DC' | 'DARK_STORE'>('ALL');

  const selectedNode = SUPPLY_CHAIN_NODES.find((n) => n.id === selectedNodeId) || SUPPLY_CHAIN_NODES[0];

  const filteredNodes = SUPPLY_CHAIN_NODES.filter(
    (n) => selectedFilter === 'ALL' || n.type === selectedFilter
  );

  return (
    <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 shadow-2xl flex flex-col gap-6">
      {/* Top Banner: AgriGrade 2.0 Command Center */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-stone-800">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Globe2 className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 font-bold">
                  AgriGrade 2.0
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800">
                  Autonomous Operations Active
                </span>
              </div>
              <h2 className="text-lg font-black text-white tracking-tight">
                Farm-to-Shelf Operations Command Center
              </h2>
            </div>
          </div>
          <p className="text-xs text-stone-400 mt-1">
            Real-time multi-echelon network intelligence: Farm harvest yield → In-transit reefer telematics → DC dock inspection → Dark store demand balancing.
          </p>
        </div>

        {/* Live Operations Alert Button */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={onOpenAlerts}
            className="px-3.5 py-2 rounded-xl bg-rose-950/60 hover:bg-rose-900/60 border border-rose-700/60 text-rose-200 text-xs font-bold flex items-center gap-2 transition-all shadow-lg"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500" />
            </span>
            <span>Broadcast Alerts Center</span>
          </button>
        </div>
      </div>

      {/* 4 Primary Command Center KPI Cards (Item 26 specification) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-stone-950/80 border border-stone-800 rounded-xl p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-stone-400 text-xs">
            <span className="font-mono uppercase tracking-wider">Batches Tracked</span>
            <Box className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black text-white font-mono">
              {COMMAND_CENTER_KPIS.totalBatchesTracked.toLocaleString()}
            </div>
            <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1 mt-0.5">
              <TrendingUp className="w-3 h-3" /> +142 added today
            </span>
          </div>
        </div>

        <div className="bg-stone-950/80 border border-amber-900/40 rounded-xl p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-stone-400 text-xs">
            <span className="font-mono uppercase tracking-wider">At Risk</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black text-amber-400 font-mono">
              {COMMAND_CENTER_KPIS.batchesAtRisk}
            </div>
            <span className="text-[10px] text-amber-300 font-mono">
              Shelf-life &lt; 48h or excursion
            </span>
          </div>
        </div>

        <div className="bg-stone-950/80 border border-rose-900/40 rounded-xl p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-stone-400 text-xs">
            <span className="font-mono uppercase tracking-wider">Waste Risk</span>
            <Flame className="w-4 h-4 text-rose-400" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black text-rose-400 font-mono">
              ₹{(COMMAND_CENTER_KPIS.totalWasteRiskInr / 100000).toFixed(1)}L
            </div>
            <span className="text-[10px] text-rose-300 font-mono">
              Unsold shrinkage hazard
            </span>
          </div>
        </div>

        <div className="bg-stone-950/80 border border-cyan-900/40 rounded-xl p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-stone-400 text-xs">
            <span className="font-mono uppercase tracking-wider">Avg Shelf Life</span>
            <Clock className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black text-cyan-400 font-mono">
              {COMMAND_CENTER_KPIS.averageShelfLifeDays} days
            </div>
            <span className="text-[10px] text-cyan-300 font-mono">
              Kinetic digital twin calibrated
            </span>
          </div>
        </div>
      </div>

      {/* Live Operations Alert Strip (Item 26 specification) */}
      <div className="bg-stone-950 border border-stone-800 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono uppercase tracking-wider font-black px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
            LIVE OPERATIONS
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
          <span className="text-rose-400 flex items-center gap-1.5 font-bold">
            <span>🚨</span>
            <span>{COMMAND_CENTER_KPIS.liveAlerts.coldChainBreaches} Cold Chain Breaches</span>
          </span>
          <span className="text-amber-400 flex items-center gap-1.5 font-bold">
            <span>⚠️</span>
            <span>{COMMAND_CENTER_KPIS.liveAlerts.shortShelfLifeBatches} Batches &lt;48h Shelf Life</span>
          </span>
          <span className="text-rose-300 flex items-center gap-1.5 font-bold">
            <span>🔴</span>
            <span>{COMMAND_CENTER_KPIS.liveAlerts.supplierRiskAlerts} Supplier Risk Alerts</span>
          </span>
          <span className="text-emerald-400 flex items-center gap-1.5 font-bold">
            <span>🟢</span>
            <span>{COMMAND_CENTER_KPIS.liveAlerts.readyForDispatch} Batches Ready for Dispatch</span>
          </span>
        </div>
      </div>

      {/* Network Topology & Live Supply Chain Map View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left 2 Cols: Interactive Multi-Echelon Pipeline Diagram */}
        <div className="lg:col-span-2 bg-stone-950 border border-stone-800 rounded-xl p-4 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Route className="w-4 h-4 text-emerald-400" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Supply Chain Network Topology
              </h3>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1">
              {(['ALL', 'FARM', 'TRANSIT', 'DC', 'DARK_STORE'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setSelectedFilter(filter)}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors ${
                    selectedFilter === filter
                      ? 'bg-emerald-500 text-stone-950 font-bold'
                      : 'bg-stone-900 text-stone-400 hover:text-stone-200'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          {/* Node Visualizer Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filteredNodes.map((node) => {
              const isSelected = node.id === selectedNodeId;
              const isCritical = node.riskStatus === 'CRITICAL';
              const isWarning = node.riskStatus === 'WARNING';

              return (
                <div
                  key={node.id}
                  onClick={() => {
                    setSelectedNodeId(node.id);
                    onSelectNode?.(node.id);
                  }}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-stone-850 border-emerald-500/80 shadow-md shadow-emerald-950/40 ring-1 ring-emerald-500/40'
                      : isCritical
                      ? 'bg-rose-950/20 border-rose-800/60 hover:bg-rose-950/40'
                      : isWarning
                      ? 'bg-amber-950/20 border-amber-800/60 hover:bg-amber-950/40'
                      : 'bg-stone-900 border-stone-800 hover:bg-stone-850'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                          node.type === 'FARM'
                            ? 'bg-lime-500/20 text-lime-400'
                            : node.type === 'TRANSIT'
                            ? 'bg-cyan-500/20 text-cyan-400'
                            : node.type === 'DC'
                            ? 'bg-indigo-500/20 text-indigo-400'
                            : 'bg-emerald-500/20 text-emerald-400'
                        }`}
                      >
                        {node.type === 'FARM' ? '🌱' : node.type === 'TRANSIT' ? '🚛' : node.type === 'DC' ? '🏭' : '⚡'}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-stone-100 flex items-center gap-1.5">
                          <span>{node.name}</span>
                        </div>
                        <span className="text-[10px] font-mono text-stone-400">{node.city}</span>
                      </div>
                    </div>

                    <span
                      className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold uppercase ${
                        isCritical
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                          : isWarning
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      }`}
                    >
                      {node.riskStatus}
                    </span>
                  </div>

                  <div className="mt-2.5 pt-2 border-t border-stone-800/80 flex items-center justify-between text-[11px] font-mono">
                    <span className="text-stone-400">{node.keyMetricLabel}:</span>
                    <span
                      className={`font-bold ${
                        isCritical ? 'text-rose-400' : isWarning ? 'text-amber-400' : 'text-emerald-400'
                      }`}
                    >
                      {node.keyMetricValue}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Flow Corridor Representation */}
          <div className="bg-stone-900/60 border border-stone-800 p-3 rounded-xl flex items-center justify-between text-xs font-mono text-stone-300 overflow-x-auto">
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-lime-400 font-bold">1. FARM</span>
              <span className="text-stone-600">→</span>
              <span className="text-cyan-400 font-bold">2. REEFER TRANSIT</span>
              <span className="text-stone-600">→</span>
              <span className="text-indigo-400 font-bold">3. DC QUALITY GATE</span>
              <span className="text-stone-600">→</span>
              <span className="text-emerald-400 font-bold">4. DARK STORES</span>
            </div>
            <span className="text-[10px] text-stone-500 hidden sm:block shrink-0">
              End-to-End Traceability • 100% Real IoT Streams
            </span>
          </div>
        </div>

        {/* Right 1 Col: Selected Node Detail & Action Trigger */}
        <div className="bg-stone-950 border border-stone-800 rounded-xl p-4 flex flex-col justify-between gap-4">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-stone-800">
              <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-bold">
                Node Telemetry
              </span>
              <span className="text-xs font-mono text-stone-400">
                {selectedNode.activeBatchesCount} Active Batches
              </span>
            </div>

            <h4 className="text-sm font-bold text-white mt-3">{selectedNode.name}</h4>
            <p className="text-xs text-stone-400 mt-0.5">{selectedNode.city}</p>

            <div className="bg-stone-900 border border-stone-800 rounded-lg p-3 mt-3 flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-stone-400">{selectedNode.keyMetricLabel}:</span>
                <span className="text-stone-100 font-bold">{selectedNode.keyMetricValue}</span>
              </div>
              <p className="text-xs text-stone-300 leading-relaxed">{selectedNode.details}</p>
            </div>

            {selectedNode.riskStatus === 'CRITICAL' && (
              <div className="mt-3 p-3 rounded-lg bg-rose-950/40 border border-rose-800/80 text-xs text-rose-200 flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Temperature Excursion Active:</span> Cargo exceeded 12.0°C. Respiration burn accelerated. Automatic 18% flash-discount recommended upon arrival.
                </div>
              </div>
            )}
          </div>

          {/* Action Trigger Buttons */}
          <div className="flex flex-col gap-2 pt-3 border-t border-stone-800">
            {onOpenDemandRouting && (
              <button
                onClick={onOpenDemandRouting}
                className="w-full py-2 px-3 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-stone-950 text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-md"
              >
                <Route className="w-3.5 h-3.5" />
                <span>Demand Forecast & Intelligent Routing</span>
              </button>
            )}

            {onOpenPricingStudio && (
              <button
                onClick={onOpenPricingStudio}
                className="w-full py-2 px-3 rounded-lg bg-stone-850 hover:bg-stone-800 border border-stone-700 text-stone-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <DollarSign className="w-3.5 h-3.5 text-amber-400" />
                <span>Dynamic Pricing / Markdown Optimizer</span>
              </button>
            )}

            {onOpenSupplierScorecard && (
              <button
                onClick={onOpenSupplierScorecard}
                className="w-full py-2 px-3 rounded-lg bg-stone-850 hover:bg-stone-800 border border-stone-700 text-stone-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <Building2 className="w-3.5 h-3.5 text-cyan-400" />
                <span>Deep Supplier Scorecard & Forensics</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
