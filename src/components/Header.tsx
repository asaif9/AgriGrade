import React, { useState } from 'react';
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
  Printer,
  FileCheck2,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';
import type { InspectionMode, WorkspaceTab, OperationalRole } from '../types';

interface HeaderProps {
  mode: InspectionMode;
  onModeChange: (newMode: InspectionMode) => void;
  isMobileView: boolean;
  onToggleMobileView: () => void;
  geminiReady: boolean;
  onOpenMultiAgentModal: () => void;
  activeWorkspace?: WorkspaceTab;
  onSelectWorkspaceTab?: (tab: WorkspaceTab) => void;
  userRole?: OperationalRole;
  onRoleChange?: (role: OperationalRole) => void;
  onOpenAlertsModal?: () => void;
  onOpenAuditModal?: () => void;
  onOpenBarcodeModal?: () => void;
  unreadAlertsCount?: number;

  // Legacy fallback props for compatibility
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
}

export const Header: React.FC<HeaderProps> = ({
  mode,
  onModeChange,
  isMobileView,
  onToggleMobileView,
  geminiReady,
  onOpenMultiAgentModal,
  activeWorkspace = 'INSPECTION',
  onSelectWorkspaceTab,
  userRole = 'DOCK_QC',
  onRoleChange,
  onOpenAlertsModal,
  onOpenAuditModal,
  onOpenBarcodeModal,
  unreadAlertsCount = 2,
  // Legacy props
  onToggleChatMode,
  onToggleFeedbackStudio,
  onToggleCommodityDatabase,
  onToggleGradeEngine,
  onToggleCommandCenter,
  onTogglePricingStudio,
  onToggleDemandRoutingStudio,
  onToggleSupplierScorecardStudio,
  onOpenMobileFieldModal,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleTabClick = (tab: WorkspaceTab) => {
    if (onSelectWorkspaceTab) {
      onSelectWorkspaceTab(tab);
    } else {
      // Legacy trigger routing
      if (tab === 'CHAT_SWARM' && onToggleChatMode) onToggleChatMode();
      if (tab === 'COMMAND_CENTER' && onToggleCommandCenter) onToggleCommandCenter();
      if (tab === 'RULES_ENGINE' && onToggleGradeEngine) onToggleGradeEngine();
      if (tab === 'FEEDBACK_LEDGER' && onToggleFeedbackStudio) onToggleFeedbackStudio();
      if (tab === 'COMMODITY_DB' && onToggleCommodityDatabase) onToggleCommodityDatabase();
      if (tab === 'SUPPLY_CHAIN' && onTogglePricingStudio) onTogglePricingStudio();
    }
    setIsMobileMenuOpen(false);
  };

  const workspaceTabs: Array<{ id: WorkspaceTab; label: string; icon: React.ReactNode; badge?: string }> = [
    {
      id: 'INSPECTION',
      label: 'Live Inspection',
      icon: <Activity className="w-4 h-4" />,
    },
    {
      id: 'COMMAND_CENTER',
      label: 'Command Center',
      icon: <Globe2 className="w-4 h-4" />,
    },
    {
      id: 'RULES_ENGINE',
      label: 'Rules Engine',
      icon: <Scale className="w-4 h-4" />,
    },
    {
      id: 'SUPPLY_CHAIN',
      label: 'Supply Chain & ROI',
      icon: <TrendingUp className="w-4 h-4" />,
    },
    {
      id: 'FEEDBACK_LEDGER',
      label: 'Audit & Learning',
      icon: <History className="w-4 h-4" />,
    },
    {
      id: 'COMMODITY_DB',
      label: 'Produce DB',
      icon: <Database className="w-4 h-4" />,
    },
    {
      id: 'CHAT_SWARM',
      label: 'Swarm Chat',
      icon: <MessageSquare className="w-4 h-4" />,
    },
  ];

  return (
    <header className="bg-stone-900 border-b border-stone-800 sticky top-0 z-40 backdrop-blur-md bg-stone-900/95 shadow-md">
      {/* Top Banner Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-15 gap-4">
          {/* Brand Logo & Tagline */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleTabClick('INSPECTION')}
              className="flex items-center gap-2.5 text-left group focus:outline-none"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-800 flex items-center justify-center text-white shadow-md shadow-emerald-950/40 group-hover:scale-105 transition-transform">
                <Sprout className="w-5 h-5 text-emerald-100" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-base tracking-tight text-white font-sans">AgriGrade</span>
                  <span className="text-[10px] font-mono tracking-widest uppercase bg-stone-800 text-emerald-400 px-1.5 py-0.5 rounded border border-stone-700">
                    2.1 Enterprise
                  </span>
                </div>
                <p className="text-[11px] text-stone-400 hidden sm:block">
                  Multi-Agent Post-Harvest Quality & Kinetic Respiration Intelligence
                </p>
              </div>
            </button>
          </div>

          {/* Center: Operational Role Selector */}
          <div className="hidden md:flex items-center bg-stone-950/80 p-1 rounded-xl border border-stone-800 text-xs">
            <span className="px-2.5 text-stone-500 font-medium">Role:</span>
            <button
              onClick={() => {
                if (onRoleChange) onRoleChange('DOCK_QC');
                onModeChange('DARK_STORE_INBOUND');
              }}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
                userRole === 'DOCK_QC'
                  ? 'bg-amber-950 text-amber-200 border border-amber-600/50 shadow-sm'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <Warehouse className="w-3.5 h-3.5 text-amber-400" />
              <span>Dock QA Inspector</span>
            </button>
            <button
              onClick={() => {
                if (onRoleChange) onRoleChange('FIELD_SCOUT');
                onModeChange('FIELD_PRE_HARVEST');
              }}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
                userRole === 'FIELD_SCOUT'
                  ? 'bg-emerald-950 text-emerald-200 border border-emerald-600/50 shadow-sm'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <Sprout className="w-3.5 h-3.5 text-emerald-400" />
              <span>Field Scout</span>
            </button>
            <button
              onClick={() => {
                if (onRoleChange) onRoleChange('SUPPLY_CHAIN_LEAD');
                handleTabClick('COMMAND_CENTER');
              }}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
                userRole === 'SUPPLY_CHAIN_LEAD'
                  ? 'bg-indigo-950 text-indigo-200 border border-indigo-600/50 shadow-sm'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <Globe2 className="w-3.5 h-3.5 text-indigo-400" />
              <span>Supply Chain Lead</span>
            </button>
          </div>

          {/* Right Action Icons & Status */}
          <div className="flex items-center gap-2">
            {/* Thermal Crate Label Generator Shortcut */}
            {onOpenBarcodeModal && (
              <button
                onClick={onOpenBarcodeModal}
                className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 border border-stone-700 text-xs transition-colors flex items-center gap-1.5"
                title="Print Crate Barcode & Thermal Label"
              >
                <Printer className="w-4 h-4 text-emerald-400" />
                <span className="hidden xl:inline font-medium">Print Label</span>
              </button>
            )}

            {/* Operational WhatsApp/Dispatch Alerts Modal */}
            {onOpenAlertsModal && (
              <button
                onClick={onOpenAlertsModal}
                className="relative p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 border border-stone-700 transition-colors"
                title="Operational Alerts"
              >
                <Bell className="w-4 h-4 text-amber-400" />
                {unreadAlertsCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-amber-500 text-stone-950 font-bold text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                    {unreadAlertsCount}
                  </span>
                )}
              </button>
            )}

            {/* Audit Trail Modal */}
            {onOpenAuditModal && (
              <button
                onClick={onOpenAuditModal}
                className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 border border-stone-700 transition-colors hidden sm:flex items-center gap-1.5 text-xs"
                title="Open Audit Trail & HITL Log"
              >
                <FileCheck2 className="w-4 h-4 text-cyan-400" />
                <span className="hidden xl:inline font-medium">Audit Ledger</span>
              </button>
            )}

            {/* 9-Agent Swarm Modal */}
            <button
              onClick={onOpenMultiAgentModal}
              className="p-2 rounded-xl bg-purple-950/80 hover:bg-purple-900/90 text-purple-200 border border-purple-700/80 text-xs transition-colors flex items-center gap-1.5 shadow-sm"
              title="Inspect 9-Agent Architecture Trace"
            >
              <Cpu className="w-4 h-4 text-purple-400" />
              <span className="hidden lg:inline font-medium">9 Agents</span>
            </button>

            {/* Mobile View Toggle */}
            <button
              onClick={onToggleMobileView}
              className={`p-2 rounded-xl border text-xs transition-colors ${
                isMobileView
                  ? 'bg-emerald-950 border-emerald-500/60 text-emerald-200'
                  : 'bg-stone-800 border-stone-700 text-stone-400 hover:text-stone-200'
              }`}
              title={isMobileView ? 'Switch to Desktop Layout' : 'Preview Field Mobile Layout'}
            >
              {isMobileView ? <Monitor className="w-4 h-4" /> : <Smartphone className="w-4 h-4" />}
            </button>

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-xl bg-stone-800 border border-stone-700 text-stone-300 md:hidden"
              aria-label="Toggle navigation menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Desktop Tab Navigation Bar */}
        <div className="hidden md:flex items-center gap-1 py-1.5 border-t border-stone-800/80 overflow-x-auto scrollbar-none">
          {workspaceTabs.map((tab) => {
            const isActive = activeWorkspace === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-2 transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-950/40'
                    : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/60'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Mobile Accordion Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-stone-800 bg-stone-950 px-4 py-3 space-y-3">
          <div className="text-xs text-stone-500 font-semibold uppercase tracking-wider">
            Operational Workspace
          </div>
          <div className="grid grid-cols-2 gap-2">
            {workspaceTabs.map((tab) => {
              const isActive = activeWorkspace === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabClick(tab.id)}
                  className={`p-2.5 rounded-xl text-xs font-medium flex items-center gap-2 transition-all ${
                    isActive
                      ? 'bg-emerald-600 text-white'
                      : 'bg-stone-900 border border-stone-800 text-stone-300'
                  }`}
                >
                  {tab.icon}
                  <span className="truncate">{tab.label}</span>
                </button>
              );
            })}
          </div>

          <div className="pt-2 border-t border-stone-800 flex items-center justify-between text-xs text-stone-400">
            <span>Gemini Vision Model:</span>
            <span className="font-mono text-emerald-400 font-semibold">gemini-3.8-flash</span>
          </div>
        </div>
      )}
    </header>
  );
};
