import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Route,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  Send,
  Store,
  Box,
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  Sliders,
  DollarSign,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import {
  calculateDemandForecast,
  calculateIntelligentRouting,
} from '../utils/demandAndRoutingEngine';

interface DemandForecastingAndRoutingStudioProps {
  onClose?: () => void;
  batchId?: string;
  commodityName?: string;
}

export const DemandForecastingAndRoutingStudio: React.FC<DemandForecastingAndRoutingStudioProps> = ({
  onClose,
  batchId = 'CRATE-TOM-8821',
  commodityName = 'Roma Tomatoes',
}) => {
  const [shelfLifeDays, setShelfLifeDays] = useState<number>(2.3);
  const [inventoryKg, setInventoryKg] = useState<number>(400);
  const [salesVelocityKgDay, setSalesVelocityKgDay] = useState<number>(80);
  const [transferExecuted, setTransferExecuted] = useState<boolean>(false);
  const [routingDispatched, setRoutingDispatched] = useState<boolean>(false);

  // Live forecast and routing calculations
  const forecast = calculateDemandForecast(inventoryKg, shelfLifeDays, salesVelocityKgDay, 1.0);
  const routing = calculateIntelligentRouting(batchId, commodityName, inventoryKg, shelfLifeDays);

  return (
    <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 shadow-2xl flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-800">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
              <Route className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-widest text-indigo-400 font-bold">
                  AgriGrade Logistics Intelligence
                </span>
                <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-800">
                  Agent 5 & Agent 6
                </span>
              </div>
              <h2 className="text-base font-black text-white tracking-tight mt-0.5">
                Demand Forecasting & Intelligent Multi-Store Routing
              </h2>
            </div>
          </div>
          <p className="text-xs text-stone-400 mt-1">
            Solves the farm-to-shelf mismatch: Recommends multi-store inventory transfers rather than blind markdown or waste dumping.
          </p>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-750 text-stone-300 text-xs font-semibold self-start sm:self-center transition-colors"
          >
            Close Studio
          </button>
        )}
      </div>

      {/* Interactive Sliders to recreate the exact user scenario:
          Shelf life = 2.3 days, Inventory = 400 kg, Store sales velocity = 80 kg/day */}
      <div className="bg-stone-950 p-4 rounded-xl border border-stone-800 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-stone-200 uppercase tracking-wider flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-indigo-400" />
            <span>Store Inventory & Demand Parameters</span>
          </span>
          <span className="text-[10px] font-mono text-stone-500">Live Mathematical Simulation</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-stone-400">Shelf Life Remaining:</span>
              <span className="font-mono font-bold text-amber-400">{shelfLifeDays} days</span>
            </div>
            <input
              type="range"
              min="1.0"
              max="5.0"
              step="0.1"
              value={shelfLifeDays}
              onChange={(e) => setShelfLifeDays(parseFloat(e.target.value))}
              className="accent-amber-500 cursor-pointer"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-stone-400">Current Inventory:</span>
              <span className="font-mono font-bold text-stone-200">{inventoryKg} kg</span>
            </div>
            <input
              type="range"
              min="100"
              max="1000"
              step="25"
              value={inventoryKg}
              onChange={(e) => setInventoryKg(parseInt(e.target.value, 10))}
              className="accent-stone-400 cursor-pointer"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-stone-400">Store Sales Velocity:</span>
              <span className="font-mono font-bold text-emerald-400">{salesVelocityKgDay} kg/day</span>
            </div>
            <input
              type="range"
              min="20"
              max="200"
              step="5"
              value={salesVelocityKgDay}
              onChange={(e) => setSalesVelocityKgDay(parseInt(e.target.value, 10))}
              className="accent-emerald-500 cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Part 1: Demand Forecast Result Panel (Item 9 requirement) */}
      <div className="bg-gradient-to-br from-stone-950 to-stone-900 border border-stone-800 rounded-xl p-4 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-rose-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Item 9: Demand Forecast & Waste Probability
            </h3>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800">
            Agent 5 Forecast
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-stone-900/80 p-3 rounded-lg border border-stone-800">
            <span className="text-[10px] font-mono text-stone-400 uppercase">Sell-Through Window</span>
            <div className="text-lg font-black text-emerald-400 font-mono mt-1">
              {forecast.expectedSellThroughKg} kg
            </div>
            <span className="text-[10px] text-stone-500">at {forecast.storeSalesVelocityKgDay} kg/day</span>
          </div>

          <div className="bg-stone-900/80 p-3 rounded-lg border border-stone-800">
            <span className="text-[10px] font-mono text-stone-400 uppercase">Expected Unsold</span>
            <div className="text-lg font-black text-rose-400 font-mono mt-1">
              {forecast.expectedUnsoldKg} kg
            </div>
            <span className="text-[10px] text-stone-500">before decay expires</span>
          </div>

          <div className="bg-stone-900/80 p-3 rounded-lg border border-stone-800">
            <span className="text-[10px] font-mono text-stone-400 uppercase">Waste Probability</span>
            <div className="text-lg font-black text-amber-400 font-mono mt-1">
              {forecast.wasteProbabilityPct}%
            </div>
            <span className="text-[10px] text-stone-500">shrinkage risk</span>
          </div>

          <div className="bg-stone-900/80 p-3 rounded-lg border border-stone-800 flex flex-col justify-between">
            <span className="text-[10px] font-mono text-stone-400 uppercase">Recommendation</span>
            <div className="text-xs font-black text-indigo-300 font-mono mt-1">
              {forecast.recommendation === 'TRANSFER_INVENTORY'
                ? `Transfer ${forecast.recommendedTransferKg} kg`
                : 'Local Clearance'}
            </div>
            <span className="text-[10px] text-stone-500">to prevent dumping</span>
          </div>
        </div>

        {/* Actionable Transfer Recommendation Banner */}
        {forecast.recommendation === 'TRANSFER_INVENTORY' && (
          <div className="p-3.5 rounded-xl bg-indigo-950/40 border border-indigo-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <Store className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
              <div className="text-xs">
                <span className="font-bold text-indigo-200">
                  AgriGrade Action: Transfer {forecast.recommendedTransferKg} kg to {forecast.recommendedTargetStore}
                </span>
                <p className="text-stone-300 mt-0.5 leading-relaxed">
                  Rather than simply rejecting or dumping {forecast.expectedUnsoldKg} kg, transfer {forecast.recommendedTransferKg} kg to high-velocity Store B to prevent ₹{((forecast.recommendedTransferKg * 42)).toLocaleString()} in waste write-offs.
                </p>
              </div>
            </div>

            <button
              onClick={() => setTransferExecuted(true)}
              disabled={transferExecuted}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 transition-all ${
                transferExecuted
                  ? 'bg-emerald-950 border border-emerald-600 text-emerald-300'
                  : 'bg-indigo-500 hover:bg-indigo-400 text-stone-950 shadow-md'
              }`}
            >
              {transferExecuted ? '✓ Inter-Store Transfer Scheduled' : `Execute ${forecast.recommendedTransferKg}kg Transfer`}
            </button>
          </div>
        )}
      </div>

      {/* Part 2: Intelligent Routing Matrix (Item 10 requirement) */}
      <div className="bg-stone-950 border border-stone-800 rounded-xl p-4 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Truck className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Item 10: Intelligent Multi-Store Destination Routing
            </h3>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
            Agent 6 Routing Engine
          </span>
        </div>

        <p className="text-xs text-stone-400">
          Evaluates pipeline: <span className="font-mono text-stone-300">Batch → Shelf-Life → Demand → Distance → Store Capacity → Expected Sales → Waste Probability → Best Destination</span>
        </p>

        {/* 3 Candidate Stores Table */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {routing.evaluatedStores.map((store) => {
            const isWinner = store.isOptimal;
            return (
              <div
                key={store.storeId}
                className={`p-3.5 rounded-xl border flex flex-col justify-between gap-3 transition-all ${
                  isWinner
                    ? 'bg-emerald-950/30 border-emerald-500 shadow-lg shadow-emerald-950/40 ring-1 ring-emerald-500'
                    : 'bg-stone-900 border-stone-800'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">{store.storeName}</span>
                    {isWinner && (
                      <span className="text-[9px] font-mono uppercase bg-emerald-500 text-stone-950 font-black px-1.5 py-0.5 rounded">
                        Optimal Target
                      </span>
                    )}
                  </div>

                  <div className="mt-2.5 flex items-center justify-between text-xs font-mono">
                    <span className="text-stone-400">Sell-Through Rate:</span>
                    <span
                      className={`font-black text-sm ${
                        store.expectedSellThroughPct > 85
                          ? 'text-emerald-400'
                          : store.expectedSellThroughPct > 70
                          ? 'text-amber-400'
                          : 'text-rose-400'
                      }`}
                    >
                      {store.expectedSellThroughPct}%
                    </span>
                  </div>

                  <div className="mt-1 flex items-center justify-between text-xs font-mono">
                    <span className="text-stone-400">Waste Risk:</span>
                    <span className="font-bold text-stone-300">{store.wasteRiskPct}%</span>
                  </div>

                  <div className="mt-1 flex items-center justify-between text-xs font-mono">
                    <span className="text-stone-400">Transit:</span>
                    <span className="text-stone-300">
                      {store.distanceKm} km ({store.transitMinutes} mins)
                    </span>
                  </div>

                  <div className="mt-1 flex items-center justify-between text-xs font-mono">
                    <span className="text-stone-400">Net Realized:</span>
                    <span className="text-emerald-300 font-bold">
                      ₹{store.netRealizedRevenueInr.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-stone-800 flex items-center justify-between text-[10px] font-mono">
                  <span className="text-stone-500">Score: {store.recommendationScore}/100</span>
                  <span className={isWinner ? 'text-emerald-400 font-bold' : 'text-stone-400'}>
                    {isWinner ? 'Highest Velocity' : 'Sub-Optimal'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Routing Decision Bar */}
        <div className="p-3 rounded-lg bg-stone-900 border border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="text-stone-200">
              System Recommendation: <strong className="text-emerald-400">Route batch to {routing.selectedStore.storeName}</strong> ({routing.selectedStore.expectedSellThroughPct}% sell-through, lowest waste hazard).
            </span>
          </div>

          <button
            onClick={() => setRoutingDispatched(true)}
            disabled={routingDispatched}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
              routingDispatched
                ? 'bg-emerald-950 border border-emerald-600 text-emerald-300'
                : 'bg-emerald-500 hover:bg-emerald-400 text-stone-950'
            }`}
          >
            {routingDispatched ? '✓ Routed to Store 3' : 'Dispatch Route to Driver WMS'}
          </button>
        </div>
      </div>
    </div>
  );
};
