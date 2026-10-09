import React, { useState, useRef, useEffect } from 'react';
import {
  Sprout,
  Warehouse,
  Smartphone,
  Monitor,
  Cpu,
  MessageSquare,
  History,
  Database,
  Radio,
  Activity,
  Scale,
  Globe2,
  Tag,
  Route,
  Award,
  ChevronDown,
  Menu,
  X,
  Bell,
  Sparkles,
  Layers,
} from 'lucide-react';
import type { InspectionMode } from '../types';

interface HeaderProps {
  mode: InspectionMode;
  onModeChange: (newMode: InspectionMode) => void;
  isMobileView: boolean;
  onToggleMobileView: () => void;
  geminiReady: boolean;
  onOpenMultiAgentModal: () => void;
  isChatMode?: boolean;
  onToggleChatMode?: () => void;
  isFeedbackStudio?: boolean;
  onToggleFeedbackStudio?: () => void;
  isCommodityDatabase?: boolean;
  onToggleCommodityDatabase?: () => void;
  isTelemetryStudio?: boolean;
  onToggleTelemetryStudio?: () => void;
  isDigitalTwin?: boolean;
  onToggleDigitalTwin?: () => void;
  isGradeEngine?: boolean;
  onToggleGradeEngine?: () => void;
  isCommandCenter?: boolean;
  onToggleCommandCenter?: () => void;
  isPricingStudio?: boolean;
  onTogglePricingStudio?: () => void;
  isDemandRoutingStudio?: boolean;
  onToggleDemandRoutingStudio?: () => void;
  isSupplierScorecardStudio?: boolean;
  onToggleSupplierScorecardStudio?: () => void;
  onOpenMobileFieldModal?: () => void;
  onOpenAlertsModal?: () => void;
  onOpenAuditModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  mode,
  onModeChange,
  isMobileView,
  onToggleMobileView,
  geminiReady,
  onOpenMultiAgentModal,
  isChatMode = false,
  onToggleChatMode,
  isFeedbackStudio = false,
  onToggleFeedbackStudio,
  isCommodityDatabase = false,
  onToggleCommodityDatabase,
  isTelemetryStudio = false,
  onToggleTelemetryStudio,
  isDigitalTwin = false,
  onToggleDigitalTwin,
  isGradeEngine = false,
  onToggleGradeEngine,
  isCommandCenter = false,
  onToggleCommandCenter,
  isPricingStudio = false,
  onTogglePricingStudio,
  isDemandRoutingStudio = false,
  onToggleDemandRoutingStudio,
  isSupplierScorecardStudio = false,
  onToggleSupplierScorecardStudio,
  onOpenMobileFieldModal,
  onOpenAlertsModal,
  onOpenAuditModal,
}) => {
  const [isStudiosMenuOpen, setIsStudiosMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const studiosDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        studiosDropdownRef.current &&
        !studiosDropdownRef.current.contains(event.target as Node)
      ) {
        setIsStudiosMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu on resize to desktop
  useEffect(() => {
    function handleResize() {
      if (window.innerWidth >= 1024) {
        setIsMobileMenuOpen(false);
      }
    }
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const anyStudioActive =
    isFeedbackStudio ||
    isCommodityDatabase ||
    isTelemetryStudio ||
    isDigitalTwin ||
    isGradeEngine ||
    isPricingStudio ||
    isDemandRoutingStudio ||
    isSupplierScorecardStudio;

  const getActiveStudioLabel = () => {
    if (isGradeEngine) return 'Grade Rules';
    if (isPricingStudio) return 'Dynamic Pricing';
    if (isDemandRoutingStudio) return 'Logistics & Demand';
    if (isSupplierScorecardStudio) return 'Suppliers';
    if (isDigitalTwin) return 'Digital Twin';
    if (isTelemetryStudio) return 'Cold Chain IoT';
    if (isCommodityDatabase) return 'Produce DB';
    if (isFeedbackStudio) return 'Feedback Loop';
    return 'Intelligence Studios';
  };

  const closeAllStudios = () => {
    if (isChatMode && onToggleChatMode) onToggleChatMode();
    if (isFeedbackStudio && onToggleFeedbackStudio) onToggleFeedbackStudio();
    if (isCommodityDatabase && onToggleCommodityDatabase) onToggleCommodityDatabase();
    if (isTelemetryStudio && onToggleTelemetryStudio) onToggleTelemetryStudio();
    if (isDigitalTwin && onToggleDigitalTwin) onToggleDigitalTwin();
    if (isGradeEngine && onToggleGradeEngine) onToggleGradeEngine();
    if (isCommandCenter && onToggleCommandCenter) onToggleCommandCenter();
    if (isPricingStudio && onTogglePricingStudio) onTogglePricingStudio();
    if (isDemandRoutingStudio && onToggleDemandRoutingStudio) onToggleDemandRoutingStudio();
    if (isSupplierScorecardStudio && onToggleSupplierScorecardStudio) onToggleSupplierScorecardStudio();
  };

  return (
    <header className="border-b border-stone-800/80 bg-stone-950/90 backdrop-blur-xl sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Brand Wordmark & Tagline */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => {
                closeAllStudios();
                onModeChange('FIELD_PRE_HARVEST');
                setIsMobileMenuOpen(false);
              }}
              className="flex items-center gap-2.5 text-left group focus:outline-none"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center shadow-lg shadow-emerald-950/50 group-hover:scale-105 transition-transform">
                <Sprout className="w-5 h-5 text-stone-950 stroke-[2.5]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-lg sm:text-xl tracking-tight text-white font-sans">
                    Agri<span className="text-emerald-400">Grade</span>
                  </span>
                  <span className="text-[10px] font-mono tracking-wider px-1.5 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 hidden sm:inline-block">
                    PRODUCE QA
                  </span>
                </div>
                <p className="text-[11px] text-stone-400 font-sans hidden xl:block leading-none mt-0.5">
                  Multi-Factor Quality &amp; Dynamic Supply Chain
                </p>
              </div>
            </button>
          </div>

          {/* Desktop & Tablet Navigation: Primary Modes & Studios */}
          <nav className="hidden md:flex items-center gap-1.5 bg-stone-900/80 p-1 rounded-xl border border-stone-800 shadow-inner">
            <button
              onClick={() => {
                closeAllStudios();
                onModeChange('FIELD_PRE_HARVEST');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
                mode === 'FIELD_PRE_HARVEST' && !anyStudioActive && !isCommandCenter && !isChatMode
                  ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-950/50'
                  : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/60'
              }`}
            >
              <Sprout className="w-3.5 h-3.5" />
              <span>Field Harvest</span>
            </button>

            <button
              onClick={() => {
                closeAllStudios();
                onModeChange('DARK_STORE_INBOUND');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
                mode === 'DARK_STORE_INBOUND' && !anyStudioActive && !isCommandCenter && !isChatMode
                  ? 'bg-amber-600 text-white shadow-sm shadow-amber-950/50'
                  : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/60'
              }`}
            >
              <Warehouse className="w-3.5 h-3.5" />
              <span>Dark Store Gate</span>
            </button>

            {onToggleCommandCenter && (
              <button
                onClick={() => {
                  closeAllStudios();
                  onToggleCommandCenter();
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
                  isCommandCenter
                    ? 'bg-teal-600 text-white shadow-sm shadow-teal-950/50'
                    : 'text-teal-400 hover:text-teal-200 hover:bg-stone-800/60'
                }`}
              >
                <Globe2 className="w-3.5 h-3.5" />
                <span>Command Center</span>
              </button>
            )}

            {/* Studios Popover Menu */}
            <div className="relative" ref={studiosDropdownRef}>
              <button
                onClick={() => setIsStudiosMenuOpen(!isStudiosMenuOpen)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
                  anyStudioActive
                    ? 'bg-purple-600 text-white shadow-sm shadow-purple-950/50'
                    : 'text-purple-300 hover:text-purple-100 hover:bg-stone-800/60'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>{getActiveStudioLabel()}</span>
                <ChevronDown className={`w-3 h-3 transition-transform ${isStudiosMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {isStudiosMenuOpen && (
                <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-stone-900 border border-stone-800 shadow-2xl p-2 z-50 flex flex-col gap-1 backdrop-blur-2xl">
                  <div className="px-2.5 py-1.5 text-[10px] font-mono uppercase tracking-wider text-stone-400 border-b border-stone-800/80">
                    Advanced Intelligence Studios
                  </div>

                  {onToggleGradeEngine && (
                    <button
                      onClick={() => {
                        closeAllStudios();
                        onToggleGradeEngine();
                        setIsStudiosMenuOpen(false);
                      }}
                      className={`flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs text-left transition-colors ${
                        isGradeEngine ? 'bg-amber-500/20 text-amber-300 font-semibold' : 'text-stone-300 hover:bg-stone-800 hover:text-white'
                      }`}
                    >
                      <Scale className="w-4 h-4 text-amber-400 shrink-0" />
                      <div>
                        <div className="font-medium">Dynamic Grade Rules</div>
                        <div className="text-[10px] text-stone-400">Customer thresholds &amp; tolerances</div>
                      </div>
                    </button>
                  )}

                  {onTogglePricingStudio && (
                    <button
                      onClick={() => {
                        closeAllStudios();
                        onTogglePricingStudio();
                        setIsStudiosMenuOpen(false);
                      }}
                      className={`flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs text-left transition-colors ${
                        isPricingStudio ? 'bg-amber-500/20 text-amber-300 font-semibold' : 'text-stone-300 hover:bg-stone-800 hover:text-white'
                      }`}
                    >
                      <Tag className="w-4 h-4 text-amber-400 shrink-0" />
                      <div>
                        <div className="font-medium">Dynamic Pricing Optimizer</div>
                        <div className="text-[10px] text-stone-400">8-factor automated markdown engine</div>
                      </div>
                    </button>
                  )}

                  {onToggleDemandRoutingStudio && (
                    <button
                      onClick={() => {
                        closeAllStudios();
                        onToggleDemandRoutingStudio();
                        setIsStudiosMenuOpen(false);
                      }}
                      className={`flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs text-left transition-colors ${
                        isDemandRoutingStudio ? 'bg-indigo-500/20 text-indigo-300 font-semibold' : 'text-stone-300 hover:bg-stone-800 hover:text-white'
                      }`}
                    >
                      <Route className="w-4 h-4 text-indigo-400 shrink-0" />
                      <div>
                        <div className="font-medium">Inter-Store Demand &amp; Routing</div>
                        <div className="text-[10px] text-stone-400">Stochastic waste routing redistribution</div>
                      </div>
                    </button>
                  )}

                  {onToggleSupplierScorecardStudio && (
                    <button
                      onClick={() => {
                        closeAllStudios();
                        onToggleSupplierScorecardStudio();
                        setIsStudiosMenuOpen(false);
                      }}
                      className={`flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs text-left transition-colors ${
                        isSupplierScorecardStudio ? 'bg-cyan-500/20 text-cyan-300 font-semibold' : 'text-stone-300 hover:bg-stone-800 hover:text-white'
                      }`}
                    >
                      <Award className="w-4 h-4 text-cyan-400 shrink-0" />
                      <div>
                        <div className="font-medium">Supplier Forensics &amp; Risk</div>
                        <div className="text-[10px] text-stone-400">Scorecard &amp; root-cause diagnostics</div>
                      </div>
                    </button>
                  )}

                  {onToggleDigitalTwin && (
                    <button
                      onClick={() => {
                        closeAllStudios();
                        onToggleDigitalTwin();
                        setIsStudiosMenuOpen(false);
                      }}
                      className={`flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs text-left transition-colors ${
                        isDigitalTwin ? 'bg-emerald-500/20 text-emerald-300 font-semibold' : 'text-stone-300 hover:bg-stone-800 hover:text-white'
                      }`}
                    >
                      <Activity className="w-4 h-4 text-emerald-400 shrink-0" />
                      <div>
                        <div className="font-medium">Real-Time Digital Twin</div>
                        <div className="text-[10px] text-stone-400">Continuous Arrhenius kinetics</div>
                      </div>
                    </button>
                  )}

                  {onToggleTelemetryStudio && (
                    <button
                      onClick={() => {
                        closeAllStudios();
                        onToggleTelemetryStudio();
                        setIsStudiosMenuOpen(false);
                      }}
                      className={`flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs text-left transition-colors ${
                        isTelemetryStudio ? 'bg-cyan-500/20 text-cyan-300 font-semibold' : 'text-stone-300 hover:bg-stone-800 hover:text-white'
                      }`}
                    >
                      <Radio className="w-4 h-4 text-cyan-400 shrink-0" />
                      <div>
                        <div className="font-medium">Cold Chain IoT Telemetry</div>
                        <div className="text-[10px] text-stone-400">BLE loggers, reefer &amp; excursions</div>
                      </div>
                    </button>
                  )}

                  {onToggleCommodityDatabase && (
                    <button
                      onClick={() => {
                        closeAllStudios();
                        onToggleCommodityDatabase();
                        setIsStudiosMenuOpen(false);
                      }}
                      className={`flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs text-left transition-colors ${
                        isCommodityDatabase ? 'bg-purple-500/20 text-purple-300 font-semibold' : 'text-stone-300 hover:bg-stone-800 hover:text-white'
                      }`}
                    >
                      <Database className="w-4 h-4 text-purple-400 shrink-0" />
                      <div>
                        <div className="font-medium">Produce Intelligence DB</div>
                        <div className="text-[10px] text-stone-400">Variety priors &amp; agronomy data</div>
                      </div>
                    </button>
                  )}

                  {onToggleFeedbackStudio && (
                    <button
                      onClick={() => {
                        closeAllStudios();
                        onToggleFeedbackStudio();
                        setIsStudiosMenuOpen(false);
                      }}
                      className={`flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs text-left transition-colors ${
                        isFeedbackStudio ? 'bg-purple-500/20 text-purple-300 font-semibold' : 'text-stone-300 hover:bg-stone-800 hover:text-white'
                      }`}
                    >
                      <History className="w-4 h-4 text-purple-400 shrink-0" />
                      <div>
                        <div className="font-medium">Closed-Loop Learning</div>
                        <div className="text-[10px] text-stone-400">Historical batches &amp; outcomes</div>
                      </div>
                    </button>
                  )}
                </div>
              )}
            </div>
          </nav>

          {/* Right Action Tools: Scout, Alerts, Audit, Swarm, Chat, View Toggle */}
          <div className="hidden lg:flex items-center gap-2 shrink-0">
            {onOpenMobileFieldModal && (
              <button
                onClick={onOpenMobileFieldModal}
                className="px-2.5 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-stone-300 hover:text-white border border-stone-800 text-xs font-medium transition-colors flex items-center gap-1.5"
                title="Open Field Scout Mobile Assistant"
              >
                <Smartphone className="w-3.5 h-3.5 text-lime-400" />
                <span>Scout</span>
              </button>
            )}

            {onOpenAlertsModal && (
              <button
                onClick={onOpenAlertsModal}
                className="px-2.5 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-stone-300 hover:text-white border border-stone-800 text-xs font-medium transition-colors flex items-center gap-1.5"
                title="Operational Alerts & WhatsApp Dispatch"
              >
                <Bell className="w-3.5 h-3.5 text-rose-400" />
                <span>Alerts</span>
              </button>
            )}

            {onOpenAuditModal && (
              <button
                onClick={onOpenAuditModal}
                className="px-2.5 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-stone-300 hover:text-white border border-stone-800 text-xs font-medium transition-colors flex items-center gap-1.5"
                title="Audit Trail & Model Version Provenance"
              >
                <History className="w-3.5 h-3.5 text-purple-400" />
                <span>Audit</span>
              </button>
            )}

            <button
              onClick={onOpenMultiAgentModal}
              className="px-2.5 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-stone-300 hover:text-white border border-stone-800 text-xs font-medium transition-colors flex items-center gap-1.5"
              title="Inspect 9-Agent Multi-Agent Swarm Topology"
            >
              <Cpu className="w-3.5 h-3.5 text-emerald-400" />
              <span>9 Agents</span>
            </button>

            {onToggleChatMode && (
              <button
                onClick={onToggleChatMode}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  isChatMode
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-950/60'
                    : 'bg-stone-900 hover:bg-stone-800 text-purple-300 hover:text-white border border-stone-800'
                }`}
                title="Open Zero-Hallucination Agent Chat"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Agent Chat</span>
              </button>
            )}

            {/* Handheld Preview Toggle */}
            <button
              onClick={onToggleMobileView}
              className={`p-2 rounded-lg border text-xs font-medium transition-colors ${
                isMobileView
                  ? 'bg-emerald-950/80 border-emerald-700 text-emerald-300'
                  : 'bg-stone-900 hover:bg-stone-800 border-stone-800 text-stone-400 hover:text-stone-200'
              }`}
              title="Toggle 390px Mobile View Preview"
            >
              {isMobileView ? <Smartphone className="w-3.5 h-3.5" /> : <Monitor className="w-3.5 h-3.5" />}
            </button>

            {/* AI Status */}
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-stone-900 border border-stone-800 text-[11px] text-stone-400">
              <span className={`w-1.5 h-1.5 rounded-full ${geminiReady ? 'bg-emerald-400' : 'bg-lime-400'}`} />
              <span className="font-mono">Gemini 3.8</span>
            </div>
          </div>

          {/* Mobile & Tablet Hamburger Toggle */}
          <div className="flex items-center gap-2 md:hidden">
            {onToggleChatMode && (
              <button
                onClick={onToggleChatMode}
                className={`p-2 rounded-xl border text-xs transition-colors ${
                  isChatMode
                    ? 'bg-purple-600 border-purple-500 text-white'
                    : 'bg-stone-900 border-stone-800 text-purple-300'
                }`}
                aria-label="Toggle Agent Chat"
              >
                <MessageSquare className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-200 border border-stone-800 focus:outline-none"
              aria-label="Toggle Navigation Menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile & Tablet Full-Screen Sheet Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-stone-800/80 bg-stone-950/98 backdrop-blur-2xl max-h-[85vh] overflow-y-auto px-4 py-5 flex flex-col gap-5 shadow-2xl">
          {/* Primary Operations Modes */}
          <div className="flex flex-col gap-2">
            <div className="text-[11px] font-mono uppercase tracking-wider text-stone-400 px-1">
              Primary Inspection &amp; Control
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  closeAllStudios();
                  onModeChange('FIELD_PRE_HARVEST');
                  setIsMobileMenuOpen(false);
                }}
                className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition-all ${
                  mode === 'FIELD_PRE_HARVEST' && !anyStudioActive && !isCommandCenter && !isChatMode
                    ? 'bg-emerald-950/70 border-emerald-500 text-emerald-200 shadow-sm'
                    : 'bg-stone-900/60 border-stone-800 text-stone-300 hover:bg-stone-800'
                }`}
              >
                <Sprout className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold">Field Mode</span>
                <span className="text-[10px] text-stone-400">Pre-Harvest Advisory</span>
              </button>

              <button
                onClick={() => {
                  closeAllStudios();
                  onModeChange('DARK_STORE_INBOUND');
                  setIsMobileMenuOpen(false);
                }}
                className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition-all ${
                  mode === 'DARK_STORE_INBOUND' && !anyStudioActive && !isCommandCenter && !isChatMode
                    ? 'bg-amber-950/70 border-amber-500 text-amber-200 shadow-sm'
                    : 'bg-stone-900/60 border-stone-800 text-stone-300 hover:bg-stone-800'
                }`}
              >
                <Warehouse className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold">Dark Store</span>
                <span className="text-[10px] text-stone-400">Dock Quality Gate</span>
              </button>
            </div>

            {onToggleCommandCenter && (
              <button
                onClick={() => {
                  closeAllStudios();
                  onToggleCommandCenter();
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                  isCommandCenter
                    ? 'bg-teal-950/70 border-teal-500 text-teal-200'
                    : 'bg-stone-900/60 border-stone-800 text-stone-300 hover:bg-stone-800'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Globe2 className="w-4 h-4 text-teal-400" />
                  <div>
                    <div className="text-xs font-bold">AgriGrade Command Center</div>
                    <div className="text-[10px] text-stone-400">Farm-to-shelf multi-echelon network</div>
                  </div>
                </div>
                <span className="text-xs font-mono text-teal-400">Live</span>
              </button>
            )}
          </div>

          {/* Advanced Intelligence Studios */}
          <div className="flex flex-col gap-2">
            <div className="text-[11px] font-mono uppercase tracking-wider text-stone-400 px-1">
              Intelligence Studios
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {onToggleGradeEngine && (
                <button
                  onClick={() => {
                    closeAllStudios();
                    onToggleGradeEngine();
                    setIsMobileMenuOpen(false);
                  }}
                  className={`p-2.5 rounded-xl border text-left flex items-center gap-2.5 ${
                    isGradeEngine ? 'bg-amber-950/70 border-amber-500 text-amber-200' : 'bg-stone-900/50 border-stone-800 text-stone-300'
                  }`}
                >
                  <Scale className="w-4 h-4 text-amber-400 shrink-0" />
                  <div className="min-w-0">
                    <div className="text-xs font-semibold truncate">Dynamic Grade Rules</div>
                    <div className="text-[10px] text-stone-400 truncate">Customer tolerances</div>
                  </div>
                </button>
              )}

              {onTogglePricingStudio && (
                <button
                  onClick={() => {
                    closeAllStudios();
                    onTogglePricingStudio();
                    setIsMobileMenuOpen(false);
                  }}
                  className={`p-2.5 rounded-xl border text-left flex items-center gap-2.5 ${
                    isPricingStudio ? 'bg-amber-950/70 border-amber-500 text-amber-200' : 'bg-stone-900/50 border-stone-800 text-stone-300'
                  }`}
                >
                  <Tag className="w-4 h-4 text-amber-400 shrink-0" />
                  <div className="min-w-0">
                    <div className="text-xs font-semibold truncate">Dynamic Pricing</div>
                    <div className="text-[10px] text-stone-400 truncate">Markdown optimizer</div>
                  </div>
                </button>
              )}

              {onToggleDemandRoutingStudio && (
                <button
                  onClick={() => {
                    closeAllStudios();
                    onToggleDemandRoutingStudio();
                    setIsMobileMenuOpen(false);
                  }}
                  className={`p-2.5 rounded-xl border text-left flex items-center gap-2.5 ${
                    isDemandRoutingStudio ? 'bg-indigo-950/70 border-indigo-500 text-indigo-200' : 'bg-stone-900/50 border-stone-800 text-stone-300'
                  }`}
                >
                  <Route className="w-4 h-4 text-indigo-400 shrink-0" />
                  <div className="min-w-0">
                    <div className="text-xs font-semibold truncate">Demand &amp; Routing</div>
                    <div className="text-[10px] text-stone-400 truncate">Inter-store transfers</div>
                  </div>
                </button>
              )}

              {onToggleSupplierScorecardStudio && (
                <button
                  onClick={() => {
                    closeAllStudios();
                    onToggleSupplierScorecardStudio();
                    setIsMobileMenuOpen(false);
                  }}
                  className={`p-2.5 rounded-xl border text-left flex items-center gap-2.5 ${
                    isSupplierScorecardStudio ? 'bg-cyan-950/70 border-cyan-500 text-cyan-200' : 'bg-stone-900/50 border-stone-800 text-stone-300'
                  }`}
                >
                  <Award className="w-4 h-4 text-cyan-400 shrink-0" />
                  <div className="min-w-0">
                    <div className="text-xs font-semibold truncate">Supplier Forensics</div>
                    <div className="text-[10px] text-stone-400 truncate">Scorecard &amp; diagnostics</div>
                  </div>
                </button>
              )}

              {onToggleDigitalTwin && (
                <button
                  onClick={() => {
                    closeAllStudios();
                    onToggleDigitalTwin();
                    setIsMobileMenuOpen(false);
                  }}
                  className={`p-2.5 rounded-xl border text-left flex items-center gap-2.5 ${
                    isDigitalTwin ? 'bg-emerald-950/70 border-emerald-500 text-emerald-200' : 'bg-stone-900/50 border-stone-800 text-stone-300'
                  }`}
                >
                  <Activity className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div className="min-w-0">
                    <div className="text-xs font-semibold truncate">Shelf-Life Digital Twin</div>
                    <div className="text-[10px] text-stone-400 truncate">Dynamic Arrhenius model</div>
                  </div>
                </button>
              )}

              {onToggleTelemetryStudio && (
                <button
                  onClick={() => {
                    closeAllStudios();
                    onToggleTelemetryStudio();
                    setIsMobileMenuOpen(false);
                  }}
                  className={`p-2.5 rounded-xl border text-left flex items-center gap-2.5 ${
                    isTelemetryStudio ? 'bg-cyan-950/70 border-cyan-500 text-cyan-200' : 'bg-stone-900/50 border-stone-800 text-stone-300'
                  }`}
                >
                  <Radio className="w-4 h-4 text-cyan-400 shrink-0" />
                  <div className="min-w-0">
                    <div className="text-xs font-semibold truncate">Cold Chain Telemetry</div>
                    <div className="text-[10px] text-stone-400 truncate">BLE loggers &amp; excursions</div>
                  </div>
                </button>
              )}

              {onToggleCommodityDatabase && (
                <button
                  onClick={() => {
                    closeAllStudios();
                    onToggleCommodityDatabase();
                    setIsMobileMenuOpen(false);
                  }}
                  className={`p-2.5 rounded-xl border text-left flex items-center gap-2.5 ${
                    isCommodityDatabase ? 'bg-purple-950/70 border-purple-500 text-purple-200' : 'bg-stone-900/50 border-stone-800 text-stone-300'
                  }`}
                >
                  <Database className="w-4 h-4 text-purple-400 shrink-0" />
                  <div className="min-w-0">
                    <div className="text-xs font-semibold truncate">Produce Intelligence DB</div>
                    <div className="text-[10px] text-stone-400 truncate">Variety cultivars</div>
                  </div>
                </button>
              )}

              {onToggleFeedbackStudio && (
                <button
                  onClick={() => {
                    closeAllStudios();
                    onToggleFeedbackStudio();
                    setIsMobileMenuOpen(false);
                  }}
                  className={`p-2.5 rounded-xl border text-left flex items-center gap-2.5 ${
                    isFeedbackStudio ? 'bg-purple-950/70 border-purple-500 text-purple-200' : 'bg-stone-900/50 border-stone-800 text-stone-300'
                  }`}
                >
                  <History className="w-4 h-4 text-purple-400 shrink-0" />
                  <div className="min-w-0">
                    <div className="text-xs font-semibold truncate">Closed-Loop Learning</div>
                    <div className="text-[10px] text-stone-400 truncate">Historical batch feedback</div>
                  </div>
                </button>
              )}
            </div>
          </div>

          {/* Operational Tools & Diagnostics */}
          <div className="flex flex-col gap-2 pt-2 border-t border-stone-800">
            <div className="text-[11px] font-mono uppercase tracking-wider text-stone-400 px-1">
              Field &amp; Compliance Tools
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {onOpenMobileFieldModal && (
                <button
                  onClick={() => {
                    onOpenMobileFieldModal();
                    setIsMobileMenuOpen(false);
                  }}
                  className="p-2.5 rounded-xl bg-stone-900 border border-stone-800 text-left flex flex-col gap-1 text-stone-200"
                >
                  <Smartphone className="w-4 h-4 text-lime-400" />
                  <span className="text-xs font-semibold">Field Scout</span>
                </button>
              )}

              {onOpenAlertsModal && (
                <button
                  onClick={() => {
                    onOpenAlertsModal();
                    setIsMobileMenuOpen(false);
                  }}
                  className="p-2.5 rounded-xl bg-stone-900 border border-stone-800 text-left flex flex-col gap-1 text-stone-200"
                >
                  <Bell className="w-4 h-4 text-rose-400" />
                  <span className="text-xs font-semibold">Alerts</span>
                </button>
              )}

              {onOpenAuditModal && (
                <button
                  onClick={() => {
                    onOpenAuditModal();
                    setIsMobileMenuOpen(false);
                  }}
                  className="p-2.5 rounded-xl bg-stone-900 border border-stone-800 text-left flex flex-col gap-1 text-stone-200"
                >
                  <History className="w-4 h-4 text-purple-400" />
                  <span className="text-xs font-semibold">Audit Trail</span>
                </button>
              )}

              <button
                onClick={() => {
                  onOpenMultiAgentModal();
                  setIsMobileMenuOpen(false);
                }}
                className="p-2.5 rounded-xl bg-stone-900 border border-stone-800 text-left flex flex-col gap-1 text-stone-200"
              >
                <Cpu className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-semibold">9 Swarm Agents</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
