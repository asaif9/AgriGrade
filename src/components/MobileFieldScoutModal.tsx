import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Smartphone,
  Sprout,
  Truck,
  Clock,
  Thermometer,
  CloudRain,
  Sun,
  Package,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  X,
} from 'lucide-react';
import {
  getMobileFieldAdvisory,
  getWeatherIntelligence,
  getPackagingIntelligence,
} from '../utils/mobileFieldAdvisory';

interface MobileFieldScoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentStage?: number;
  produceName?: string;
}

export const MobileFieldScoutModal: React.FC<MobileFieldScoutModalProps> = ({
  isOpen,
  onClose,
  currentStage = 2,
  produceName = 'Roma Tomatoes',
}) => {
  const [selectedDestination, setSelectedDestination] = useState<string>('Bangalore DC (Whitefield Hub)');
  const [ambientTemp, setAmbientTemp] = useState<number>(32);
  const [stage, setStage] = useState<number>(currentStage);
  const [selectedPackaging, setSelectedPackaging] = useState<string>('Ventilated Plastic Crate');

  if (!isOpen) return null;

  const advisory = getMobileFieldAdvisory(stage, selectedDestination, ambientTemp);
  const weather = getWeatherIntelligence(ambientTemp, false);
  const packaging = getPackagingIntelligence(selectedPackaging);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-2xl bg-stone-900 border border-stone-800 rounded-3xl shadow-2xl p-5 sm:p-6 max-h-[90vh] overflow-y-auto flex flex-col gap-5"
      >
        {/* Top Modal Bar */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-lime-500/20 border border-lime-500/40 flex items-center justify-center text-lime-400">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-lime-400 font-bold">
                AgriGrade Field Scout App
              </span>
              <h3 className="text-sm font-black text-white">
                Farmer & Scout Harvest Advisory Flow
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

        {/* Step-by-Step Flow Banner */}
        <div className="bg-stone-950 p-3 rounded-xl border border-stone-800 flex items-center justify-between text-xs font-mono text-stone-300 overflow-x-auto">
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-lime-400 font-bold">1. SCAN ON VINE</span>
            <span className="text-stone-600">→</span>
            <span className="text-cyan-400 font-bold">2. AI ANALYZES</span>
            <span className="text-stone-600">→</span>
            <span className="text-amber-400 font-bold">3. SELECT DESTINATION</span>
            <span className="text-stone-600">→</span>
            <span className="text-emerald-400 font-bold">4. HARVEST RECOMMENDATION</span>
          </div>
        </div>

        {/* Scout Inputs: Stage & Destination */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 bg-stone-950 p-3.5 rounded-xl border border-stone-800">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-stone-300">Target Destination:</label>
            <select
              value={selectedDestination}
              onChange={(e) => setSelectedDestination(e.target.value)}
              className="bg-stone-900 border border-stone-700 rounded-lg p-2 text-xs text-stone-100 font-semibold focus:outline-none focus:border-lime-500"
            >
              <option value="Bangalore DC (Whitefield Hub)">Bangalore DC (Whitefield Hub - 160 km)</option>
              <option value="Chennai Fulfillment Hub">Chennai Fulfillment Hub (340 km)</option>
              <option value="Local Kolar Mandi">Local Kolar Mandi (18 km)</option>
              <option value="Food Processing Sauce Unit">Food Processing Sauce Unit (35 km)</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-stone-300">Scanned Maturity Stage:</label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5, 6].map((s) => (
                <button
                  key={s}
                  onClick={() => setStage(s)}
                  className={`flex-1 py-1.5 rounded text-xs font-mono font-bold transition-all ${
                    stage === s
                      ? 'bg-lime-500 text-stone-950 shadow-md'
                      : 'bg-stone-900 text-stone-400 hover:text-stone-200'
                  }`}
                >
                  S{s}
                </button>
              ))}
            </div>
            <span className="text-[10px] text-stone-500">
              {stage === 1 ? 'Mature Green' : stage === 2 ? 'Breaker (Star Mark)' : stage === 3 ? 'Turning' : stage === 4 ? 'Pink' : 'Light/Full Red'}
            </span>
          </div>
        </div>

        {/* Primary Field Scout Recommendation Card (Item 20 exact specification) */}
        <div
          className={`p-4 rounded-2xl border flex flex-col gap-3 ${
            advisory.scanStatus === 'HARVEST_TODAY'
              ? 'bg-emerald-950/40 border-emerald-500/80 text-emerald-100'
              : advisory.scanStatus === 'DELAY_HARVEST'
              ? 'bg-amber-950/40 border-amber-500/80 text-amber-100'
              : 'bg-cyan-950/40 border-cyan-500/80 text-cyan-100'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Mobile Field Recommendation</span>
            </div>
            <span className="text-xs font-mono font-black px-2.5 py-0.5 rounded-full bg-stone-950/80 border border-stone-800">
              {advisory.scanStatus === 'HARVEST_TODAY' ? '🟢 HARVEST TODAY' : advisory.scanStatus}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-emerald-800/40 font-mono text-xs">
            <div>
              <span className="text-stone-400 text-[10px] uppercase">Target Destination:</span>
              <div className="font-bold text-white mt-0.5">{advisory.targetDestination}</div>
            </div>
            <div>
              <span className="text-stone-400 text-[10px] uppercase">Recommended Transport:</span>
              <div className="font-bold text-emerald-300 mt-0.5">
                {advisory.recommendedTransport.replace('_', ' ')}
              </div>
            </div>
            <div>
              <span className="text-stone-400 text-[10px] uppercase">Maximum Transit Window:</span>
              <div className="font-bold text-cyan-300 mt-0.5">{advisory.maximumTransitHours} Hours</div>
            </div>
          </div>

          {/* Action Checklist */}
          <div className="mt-1 pt-2 border-t border-emerald-800/30 flex flex-col gap-1 text-xs">
            <span className="text-[10px] font-mono uppercase tracking-wider text-stone-300 font-bold">
              Field Action Checklist:
            </span>
            <ul className="list-disc list-inside space-y-0.5 text-stone-300 text-[11px]">
              {advisory.fieldActionChecklist.map((step, idx) => (
                <li key={idx}>{step}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Weather Intelligence Advisory (Item 17 specification) */}
        <div className="bg-stone-950 p-3.5 rounded-xl border border-stone-800 flex items-start gap-3 text-xs">
          <Sun className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <div className="flex items-center gap-2 font-bold text-amber-300 uppercase tracking-wider text-[11px]">
              <span>Weather Intelligence Advisory</span>
              <span className="text-[10px] font-mono text-stone-400">
                Tomorrow Forecast: {weather.ambientForecastTempC}°C ({weather.relativeHumidityPct}% RH)
              </span>
            </div>
            <p className="text-stone-300 mt-1 leading-relaxed">
              "{weather.harvestAdvisory}"
            </p>
          </div>
        </div>

        {/* Packaging Intelligence Comparison (Item 17 specification) */}
        <div className="bg-stone-950 p-3.5 rounded-xl border border-stone-800 flex flex-col gap-2.5 text-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-white uppercase tracking-wider text-[11px]">
              <Package className="w-4 h-4 text-cyan-400" />
              <span>Packaging Intelligence Comparison</span>
            </div>
            <span className="text-[10px] font-mono text-stone-400">Tested vs Actual Shelf-Life</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {packaging.comparison.map((p) => (
              <div
                key={p.type}
                className={`p-2.5 rounded-lg border flex flex-col justify-between ${
                  p.recommended
                    ? 'bg-emerald-950/30 border-emerald-500'
                    : 'bg-stone-900 border-stone-800'
                }`}
              >
                <div>
                  <span className="text-[10px] font-bold text-stone-200 block truncate">{p.type}</span>
                  <div className="text-sm font-black text-cyan-400 font-mono mt-1">
                    {p.expectedShelfLifeDays} days
                  </div>
                  <span className="text-[10px] text-stone-400 font-mono">
                    {p.bruiseRiskPct}% bruise rate
                  </span>
                </div>
                {p.recommended && (
                  <span className="text-[9px] font-mono text-emerald-400 font-bold mt-1">
                    ✓ Recommended
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
