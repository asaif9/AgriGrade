import React from 'react';
import { Sprout, Warehouse, Smartphone, Monitor, ShieldCheck, Cpu, Sparkles, MessageSquare } from 'lucide-react';
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
}) => {
  return (
    <header className="border-b border-stone-800 bg-stone-900/90 backdrop-blur-md sticky top-0 z-30 px-4 py-3 sm:px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Brand identity */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-lime-600 flex items-center justify-center shadow-lg shadow-emerald-950/40">
              <Sprout className="w-5 h-5 text-stone-950 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-xl tracking-tight text-white font-sans">
                  Agri<span className="text-emerald-400">Grade</span>
                </h1>
                <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-800/60">
                  Multi-Agent v1.2
                </span>
              </div>
              <p className="text-xs text-stone-400 hidden sm:block">
                Dual-Mode Pre/Post-Harvest Optical Grading & Kinetic Supply Chain Intelligence
              </p>
            </div>
          </div>

          {/* Quick mobile view toggle on small screen */}
          <div className="flex items-center gap-2 md:hidden">
            {onToggleChatMode && (
              <button
                onClick={onToggleChatMode}
                className={`p-2 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  isChatMode
                    ? 'bg-purple-600 border-purple-500 text-white'
                    : 'bg-stone-800 border-stone-700 text-purple-300'
                }`}
                title="Toggle Agent Chat Mode"
              >
                <MessageSquare className="w-4 h-4" />
                <span className="text-[11px]">Chat</span>
              </button>
            )}

            <button
              onClick={onToggleMobileView}
              className="p-2 rounded-lg bg-stone-800 text-stone-300 hover:text-white border border-stone-700"
              title="Toggle Viewport"
            >
              {isMobileView ? <Monitor className="w-4 h-4" /> : <Smartphone className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Dual Mode Switcher (The core architectural switch) */}
        <div className="flex items-center gap-2 bg-stone-950/80 p-1.5 rounded-xl border border-stone-800 shadow-inner">
          <button
            onClick={() => {
              if (isChatMode && onToggleChatMode) onToggleChatMode();
              onModeChange('FIELD_PRE_HARVEST');
            }}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
              mode === 'FIELD_PRE_HARVEST' && !isChatMode
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/50'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900'
            }`}
          >
            <Sprout className="w-4 h-4" />
            <div className="text-left leading-tight">
              <div>Field Mode</div>
              <div className="text-[10px] font-normal opacity-80 hidden lg:block">Pre-Harvest Vine Advisory</div>
            </div>
          </button>

          <button
            onClick={() => {
              if (isChatMode && onToggleChatMode) onToggleChatMode();
              onModeChange('DARK_STORE_INBOUND');
            }}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
              mode === 'DARK_STORE_INBOUND' && !isChatMode
                ? 'bg-amber-600 text-white shadow-md shadow-amber-950/50'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900'
            }`}
          >
            <Warehouse className="w-4 h-4" />
            <div className="text-left leading-tight">
              <div>Dark Store Mode</div>
              <div className="text-[10px] font-normal opacity-80 hidden lg:block">Inbound Quality Gate</div>
            </div>
          </button>
        </div>

        {/* Action badges and Controls */}
        <div className="hidden md:flex items-center gap-2.5">
          {/* Dedicated Chat Mode Toggle */}
          {onToggleChatMode && (
            <button
              onClick={onToggleChatMode}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                isChatMode
                  ? 'bg-purple-600 border-purple-500 text-white shadow-md shadow-purple-950/60'
                  : 'bg-stone-800/90 hover:bg-stone-800 border-purple-800/60 text-purple-300 hover:text-white'
              }`}
              title="Chat with AI agents based on scan telemetry facts"
            >
              <MessageSquare className="w-3.5 h-3.5 text-purple-300" />
              <span>Agent Chat Mode</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </button>
          )}

          {/* Multi-Agent Architecture Viewer */}
          <button
            onClick={onOpenMultiAgentModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-800/90 hover:bg-stone-800 text-stone-200 border border-stone-700/80 text-xs font-medium transition-colors"
          >
            <Cpu className="w-3.5 h-3.5 text-emerald-400" />
            <span>4 Swarm Agents</span>
          </button>

          {/* Desktop / Mobile Framing Toggle */}
          <button
            onClick={onToggleMobileView}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
              isMobileView
                ? 'bg-emerald-950/60 border-emerald-700 text-emerald-300'
                : 'bg-stone-800/80 border-stone-700 text-stone-300 hover:text-white'
            }`}
            title="Toggle Handheld Mobile View vs Desktop Wide Dock View"
          >
            {isMobileView ? (
              <>
                <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                <span>Handheld App</span>
              </>
            ) : (
              <>
                <Monitor className="w-3.5 h-3.5" />
                <span>Dock Terminal</span>
              </>
            )}
          </button>

          {/* AI Status */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-stone-950 border border-stone-800 text-[11px] text-stone-300">
            <span className={`w-2 h-2 rounded-full ${geminiReady ? 'bg-emerald-400 animate-pulse' : 'bg-lime-400'}`} />
            <span>Gemini Vision 3.8</span>
          </div>
        </div>
      </div>
    </header>
  );
};
