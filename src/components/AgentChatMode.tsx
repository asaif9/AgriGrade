import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  MessageSquare,
  Send,
  Sparkles,
  Bot,
  User,
  ShieldCheck,
  RefreshCw,
  Copy,
  Check,
  Cpu,
  Layers,
  HelpCircle,
  Thermometer,
  Clock,
  AlertTriangle,
  Tag,
  Sprout,
  Warehouse,
  ChevronRight,
  Database,
  ArrowLeft,
  X,
  Zap,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import type { AgriGradeReport, AgentFocusType, ChatMessage, ChatMetricItem } from '../types';

interface AgentChatModeProps {
  report: AgriGradeReport | null;
  batchId: string;
  supplierName: string;
  ambientTemp: number;
  transitHours: number;
  transitKm: number;
  storageMethod: 'AMBIENT_LORRY' | 'CHILLED_REEFER';
  onClose?: () => void;
  onNavigateToScan?: () => void;
}

export const AgentChatMode: React.FC<AgentChatModeProps> = ({
  report,
  batchId,
  supplierName,
  ambientTemp,
  transitHours,
  transitKm,
  storageMethod,
  onClose,
  onNavigateToScan,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [agentFocus, setAgentFocus] = useState<AgentFocusType>('swarm');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showTelemetryDrawer, setShowTelemetryDrawer] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom of conversation
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Focus input on load
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Compute smart suggested prompts tailored to active scan state
  const suggestedPrompts = React.useMemo(() => {
    if (!report) {
      return [
        'How do the 4 agents prevent optical hallucination?',
        'What produce varieties can AgriGrade inspect?',
        'How is Arrhenius respiration kinetics modeled for shelf-life?',
      ];
    }

    const prompts: string[] = [];

    if (report.inbound_action) {
      if (report.inbound_action.verdict === 'ACCEPTED_GRADE_A') {
        prompts.push(
          'What specific metrics qualified this batch for Grade A Premium?',
          'What is the shelf-life if stored at 10°C cold chain vs 28°C ambient?',
          'Are there any micro-defects or skin scuffs detected on the cuticle?'
        );
      } else if (report.inbound_action.verdict === 'ACCEPTED_GRADE_B') {
        prompts.push(
          `Why was this batch assigned a ${report.inbound_action.recommended_dynamic_discount_percent}% dynamic markdown?`,
          'What is the exact Bruise Defect Index and which areas are damaged?',
          `Why is fast-track dispatch required within ${report.inbound_action.dispatch_window_hours} hours?`
        );
      } else {
        prompts.push(
          'What critical defects triggered the Return-to-Vendor dock rejection?',
          'How does the Bruise Defect Index compare to the 25% dock tolerance threshold?',
          'What was the penetrometer firmness estimate and tissue breakdown status?'
        );
      }
    } else if (report.harvest_guidance) {
      prompts.push(
        report.harvest_guidance.should_harvest_today
          ? 'Why is immediate harvest recommended for quick-commerce transit today?'
          : 'Why should this crop be held on the vine instead of harvested today?',
        `Will this crop survive a ${transitHours}-hour transit to the distribution hub?`,
        `What chlorophyll breakdown stage was detected in the color spectrum?`
      );
    }

    // Always include a kinetic comparison question
    prompts.push(`How does Arrhenius decay affect shelf-life if transit temperature spikes to 36°C?`);

    return prompts.slice(0, 4);
  }, [report, transitHours]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputQuery).trim();
    if (!query || isLoading) return;

    const userMsgId = `msg-user-${Date.now()}`;
    const userMessage: ChatMessage = {
      id: userMsgId,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputQuery('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          history: messages.map((m) => ({
            role: m.sender,
            text: m.text,
          })),
          report,
          agentFocus,
          batchId,
          supplierName,
          ambientTemp,
          transitHours,
          transitKm,
          storageMethod,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }

      const data = await response.json();
      const assistantMsg: ChatMessage = {
        id: `msg-agent-${Date.now()}`,
        sender: 'assistant',
        text: data.reply || 'No telemetry response returned.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        agentBadge: data.agentBadge,
        metricsCited: data.metricsCited,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      console.error('Chat error:', err);
      const fallbackMsg: ChatMessage = {
        id: `msg-err-${Date.now()}`,
        sender: 'assistant',
        text: `⚠️ **Communication Notice**: Agent communication encountered a temporary network delay. Here are the verified scan facts directly from active telemetry:\n\n• **Specimen**: ${report?.produce_type || 'Unknown'} (${report?.stage_name || 'N/A'})\n• **Ripeness**: ${report?.ripeness_percentage ?? 'N/A'}%\n• **Bruise Defect Index**: ${report?.bruise_defect_index.toFixed(1) ?? 'N/A'}%\n• **Ambient Shelf-Life**: ${report?.ambient_shelf_life_days ?? 'N/A'} days\n• **Verdict**: ${report?.inbound_action?.verdict || report?.harvest_guidance?.optimal_harvest_window || 'N/A'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        agentBadge: {
          name: 'AgriGrade Telemetry Guard',
          role: 'Deterministic Grounding Backup',
          color: 'emerald',
        },
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearHistory = () => {
    setMessages([]);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] min-h-[580px] max-w-7xl mx-auto w-full bg-stone-900 rounded-2xl border border-stone-800 shadow-2xl overflow-hidden relative">
      {/* Top Header & Telemetry Bar */}
      <div className="bg-stone-950 border-b border-stone-800 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-purple-950/50 shrink-0">
            <Bot className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>AgriGrade Agent Chat</span>
                <span className="text-xs font-mono font-normal text-stone-400">
                  (Scan-Grounded Intelligence)
                </span>
              </h2>
              <span className="inline-flex items-center gap-1 text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-700/60 text-emerald-400">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                <span>Zero-Hallucination Shield Active</span>
              </span>
            </div>
            <p className="text-[11px] text-stone-400">
              Ask any question based on current scan facts. Answers cite verified numbers from all 4 specialized agents.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setShowTelemetryDrawer(!showTelemetryDrawer)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition-colors ${
              showTelemetryDrawer
                ? 'bg-purple-950 border-purple-700 text-purple-300'
                : 'bg-stone-900 border-stone-800 text-stone-300 hover:bg-stone-800'
            }`}
            title="Inspect raw scan telemetry facts"
          >
            <Database className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden sm:inline">Telemetry Facts</span>
          </button>

          {messages.length > 0 && (
            <button
              onClick={handleClearHistory}
              className="px-2.5 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-800 text-xs text-stone-400 hover:text-stone-200 transition-colors"
              title="Clear chat history"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          )}

          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-800 text-stone-400 hover:text-white transition-colors"
              title="Return to Inspection Dashboard"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Grounding Status Pill Banner */}
      <div className="bg-stone-950/80 px-4 py-2 border-b border-stone-800/80 flex items-center justify-between gap-2 overflow-x-auto text-xs shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-stone-400 font-mono">Grounded Knowledge:</span>
          {report ? (
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-stone-900 border border-stone-800 text-[11px] font-mono text-cyan-300">
                {report.produce_type} • {report.stage_name}
              </span>
              <span className="px-2 py-0.5 rounded-md bg-stone-900 border border-stone-800 text-[11px] font-mono text-stone-300">
                BDI: <strong className="text-amber-400">{report.bruise_defect_index.toFixed(1)}%</strong>
              </span>
              <span className="px-2 py-0.5 rounded-md bg-stone-900 border border-stone-800 text-[11px] font-mono text-stone-300">
                Life: <strong className="text-emerald-400">{report.ambient_shelf_life_days}d</strong>
              </span>
              <span
                className={`px-2 py-0.5 rounded-md border text-[11px] font-mono font-bold uppercase ${
                  report.inbound_action?.verdict === 'ACCEPTED_GRADE_A'
                    ? 'bg-emerald-950/60 border-emerald-700 text-emerald-300'
                    : report.inbound_action?.verdict === 'ACCEPTED_GRADE_B'
                    ? 'bg-amber-950/60 border-amber-700 text-amber-300'
                    : report.inbound_action?.verdict === 'REJECTED_AT_DOCK'
                    ? 'bg-rose-950/60 border-rose-700 text-rose-300'
                    : 'bg-emerald-950/60 border-emerald-700 text-emerald-300'
                }`}
              >
                {report.inbound_action?.verdict ?? (report.harvest_guidance?.should_harvest_today ? 'HARVEST RECOMMENDED' : 'DELAY HARVEST')}
              </span>
            </div>
          ) : (
            <span className="text-stone-400 text-xs italic">
              No active scan loaded. Camera optical data required for ground truth.
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 text-[10px] text-stone-400 font-mono shrink-0">
          <span>Batch: <strong className="text-stone-200">{batchId}</strong></span>
          <span>•</span>
          <span>Supplier: <strong className="text-stone-200 truncate max-w-[120px]">{supplierName}</strong></span>
        </div>
      </div>

      {/* Agent Focus Selector Tabs */}
      <div className="bg-stone-900/90 px-4 py-2 border-b border-stone-800 flex items-center justify-between gap-2 overflow-x-auto shrink-0">
        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-[10px] uppercase font-mono tracking-wider text-stone-400 font-semibold mr-1">
            Agent Focus:
          </span>
          <button
            onClick={() => setAgentFocus('swarm')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition-all ${
              agentFocus === 'swarm'
                ? 'bg-purple-600 text-white shadow-sm shadow-purple-950/60'
                : 'bg-stone-950 text-stone-400 hover:text-stone-200 border border-stone-800'
            }`}
          >
            <Sparkles className="w-3 h-3 text-purple-300" />
            <span>All Swarm Agents</span>
          </button>

          <button
            onClick={() => setAgentFocus('agent_1')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition-all ${
              agentFocus === 'agent_1'
                ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-950/60'
                : 'bg-stone-950 text-stone-400 hover:text-stone-200 border border-stone-800'
            }`}
          >
            <Sprout className="w-3 h-3 text-emerald-400" />
            <span>Agent 1 (Maturity)</span>
          </button>

          <button
            onClick={() => setAgentFocus('agent_2')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition-all ${
              agentFocus === 'agent_2'
                ? 'bg-rose-600 text-white shadow-sm shadow-rose-950/60'
                : 'bg-stone-950 text-stone-400 hover:text-stone-200 border border-stone-800'
            }`}
          >
            <AlertTriangle className="w-3 h-3 text-rose-400" />
            <span>Agent 2 (Defects & Bruises)</span>
          </button>

          <button
            onClick={() => setAgentFocus('agent_3')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition-all ${
              agentFocus === 'agent_3'
                ? 'bg-cyan-600 text-white shadow-sm shadow-cyan-950/60'
                : 'bg-stone-950 text-stone-400 hover:text-stone-200 border border-stone-800'
            }`}
          >
            <Thermometer className="w-3 h-3 text-cyan-400" />
            <span>Agent 3 (Kinetic Decay)</span>
          </button>

          <button
            onClick={() => setAgentFocus('agent_4')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition-all ${
              agentFocus === 'agent_4'
                ? 'bg-amber-600 text-white shadow-sm shadow-amber-950/60'
                : 'bg-stone-950 text-stone-400 hover:text-stone-200 border border-stone-800'
            }`}
          >
            <Tag className="w-3 h-3 text-amber-400" />
            <span>Agent 4 (Commercial Gate)</span>
          </button>
        </div>
      </div>

      {/* Main Conversation Stream */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {/* Telemetry Facts Drawer (Collapsible) */}
        <AnimatePresence>
          {showTelemetryDrawer && report && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mb-4"
            >
              <div className="bg-stone-950 border border-purple-800/40 rounded-xl p-4 text-xs space-y-3 shadow-lg">
                <div className="flex items-center justify-between border-b border-stone-800 pb-2">
                  <div className="flex items-center gap-2">
                    <Database className="w-4 h-4 text-purple-400" />
                    <span className="font-bold text-white">Active Verified Scan Telemetry</span>
                    <span className="text-[10px] text-stone-400 font-mono">(Ground Truth Record)</span>
                  </div>
                  <button
                    onClick={() => setShowTelemetryDrawer(false)}
                    className="text-stone-400 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[11px] font-mono">
                  <div className="bg-stone-900/80 p-2.5 rounded-lg border border-stone-800">
                    <span className="text-stone-400 block text-[10px]">Crop & Stage</span>
                    <strong className="text-stone-200">{report.produce_type}</strong>
                    <div className="text-cyan-400">{report.stage_name}</div>
                  </div>
                  <div className="bg-stone-900/80 p-2.5 rounded-lg border border-stone-800">
                    <span className="text-stone-400 block text-[10px]">Ripeness & Firmness</span>
                    <strong className="text-emerald-400">{report.ripeness_percentage}%</strong>
                    <div className="text-stone-300">{report.firmness_estimate_penetrometer} kg/cm²</div>
                  </div>
                  <div className="bg-stone-900/80 p-2.5 rounded-lg border border-stone-800">
                    <span className="text-stone-400 block text-[10px]">Bruise Defect Index</span>
                    <strong className="text-amber-400">{report.bruise_defect_index.toFixed(1)}%</strong>
                    <div className="text-stone-400">{report.defects.length} defect(s)</div>
                  </div>
                  <div className="bg-stone-900/80 p-2.5 rounded-lg border border-stone-800">
                    <span className="text-stone-400 block text-[10px]">Ambient / Cold Life</span>
                    <strong className="text-cyan-400">{report.ambient_shelf_life_days}d @ {ambientTemp}°C</strong>
                    <div className="text-emerald-400">{report.cold_storage_shelf_life_days}d Reefer</div>
                  </div>
                </div>

                {report.inbound_action && (
                  <div className="bg-stone-900/60 p-2.5 rounded-lg border border-stone-800/80 flex items-center justify-between text-[11px] font-mono">
                    <span>
                      Gate Verdict: <strong className="text-amber-300">{report.inbound_action.verdict}</strong> ({report.inbound_action.quality_score}/100)
                    </span>
                    <span>
                      Markdown: <strong className="text-rose-400">{report.inbound_action.recommended_dynamic_discount_percent}%</strong>
                    </span>
                    <span>
                      Routing: <strong className="text-cyan-300">{report.inbound_action.erp_routing_tag}</strong>
                    </span>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty State / Welcome Screen */}
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center min-h-[320px] text-center max-w-lg mx-auto py-8">
            <div className="w-14 h-14 rounded-2xl bg-purple-950/80 border border-purple-800/80 flex items-center justify-center text-purple-400 mb-4 shadow-lg shadow-purple-950/50">
              <Sparkles className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-white">
              Zero-Hallucination Multi-Agent Chat
            </h3>
            <p className="text-xs text-stone-300 mt-1.5 leading-relaxed">
              Every answer is formulated strictly from the optical segmentation, USDA maturity classification, and kinetic Arrhenius calculations of the active scan.
            </p>

            {/* Quick suggested prompt list */}
            <div className="w-full mt-6 space-y-2 text-left">
              <span className="text-[10px] uppercase font-mono tracking-wider text-stone-400 font-semibold block px-1">
                Suggested Questions on Active Scan:
              </span>
              <div className="grid grid-cols-1 gap-2">
                {suggestedPrompts.map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(prompt)}
                    className="p-2.5 rounded-xl bg-stone-950 hover:bg-stone-800 border border-stone-800 hover:border-purple-600/60 text-xs text-stone-300 hover:text-white transition-all text-left flex items-center justify-between group"
                  >
                    <span>{prompt}</span>
                    <ChevronRight className="w-4 h-4 text-stone-400 group-hover:text-purple-400 shrink-0 transition-transform group-hover:translate-x-0.5" />
                  </button>
                ))}
              </div>
            </div>

            {!report && onNavigateToScan && (
              <button
                onClick={onNavigateToScan}
                className="mt-6 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-emerald-950/60 transition-colors"
              >
                <Sprout className="w-3.5 h-3.5" />
                <span>Run First Scan or Pick Sample</span>
              </button>
            )}
          </div>
        )}

        {/* Message Thread */}
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex flex-col ${message.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            {/* Sender Label & Agent Badge */}
            <div className="flex items-center gap-2 mb-1 px-1">
              {message.sender === 'user' ? (
                <span className="text-[10px] font-mono text-stone-400 flex items-center gap-1">
                  <span>Inspector</span>
                  <User className="w-3 h-3 text-cyan-400" />
                </span>
              ) : (
                <div className="flex items-center gap-1.5">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border shadow-sm ${
                      message.agentBadge?.color === 'emerald'
                        ? 'bg-emerald-950/80 border-emerald-700/80 text-emerald-300'
                        : message.agentBadge?.color === 'amber'
                        ? 'bg-amber-950/80 border-amber-700/80 text-amber-300'
                        : message.agentBadge?.color === 'rose'
                        ? 'bg-rose-950/80 border-rose-700/80 text-rose-300'
                        : message.agentBadge?.color === 'cyan'
                        ? 'bg-cyan-950/80 border-cyan-700/80 text-cyan-300'
                        : 'bg-purple-950/80 border-purple-700/80 text-purple-300'
                    }`}
                  >
                    <Bot className="w-3 h-3" />
                    <span>{message.agentBadge?.name || 'AgriGrade Swarm'}</span>
                  </span>
                  <span className="text-[10px] font-mono text-stone-400">
                    {message.timestamp}
                  </span>
                </div>
              )}
            </div>

            {/* Bubble Content */}
            <div
              className={`max-w-2xl rounded-2xl p-4 text-xs leading-relaxed relative group ${
                message.sender === 'user'
                  ? 'bg-cyan-950/70 border border-cyan-700/60 text-cyan-100 rounded-tr-sm'
                  : 'bg-stone-950 border border-stone-800 text-stone-200 rounded-tl-sm shadow-md'
              }`}
            >
              {message.sender === 'user' ? (
                <p className="whitespace-pre-wrap">{message.text}</p>
              ) : (
                <div className="space-y-3">
                  {/* Markdown Renderer */}
                  <div className="prose prose-invert prose-stone max-w-none text-xs leading-relaxed prose-headings:text-stone-100 prose-headings:font-bold prose-headings:text-sm prose-headings:my-2 prose-p:my-1.5 prose-ul:my-1 prose-li:my-0.5 prose-strong:text-stone-100 prose-code:bg-stone-900 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-cyan-300 prose-code:font-mono">
                    <ReactMarkdown>{message.text}</ReactMarkdown>
                  </div>

                  {/* Grounded Cited Metrics Pills */}
                  {message.metricsCited && message.metricsCited.length > 0 && (
                    <div className="pt-2.5 mt-2.5 border-t border-stone-800/80 flex flex-wrap items-center gap-1.5">
                      <span className="text-[10px] uppercase font-mono text-stone-400 font-semibold mr-1 flex items-center gap-1">
                        <Database className="w-3 h-3 text-purple-400" />
                        <span>Verified Facts:</span>
                      </span>
                      {message.metricsCited.slice(0, 5).map((m, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded-md bg-stone-900 border border-stone-800 text-[10px] font-mono text-stone-300 flex items-center gap-1"
                        >
                          <span className="text-stone-400">{m.label}:</span>
                          <strong className="text-stone-100 font-bold">{m.value}</strong>
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Copy Button */}
                  <div className="flex items-center justify-end pt-1">
                    <button
                      onClick={() => handleCopyText(message.id, message.text)}
                      className="text-[10px] text-stone-400 hover:text-stone-200 flex items-center gap-1 px-2 py-0.5 rounded bg-stone-900 hover:bg-stone-800 border border-stone-800 transition-colors"
                      title="Copy response"
                    >
                      {copiedId === message.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex flex-col items-start space-y-1">
            <span className="text-[10px] font-mono text-stone-400 flex items-center gap-1 px-1">
              <Bot className="w-3 h-3 text-purple-400" />
              <span>Agents synthesizing scan telemetry...</span>
            </span>
            <div className="bg-stone-950 border border-stone-800 rounded-2xl rounded-tl-sm p-3.5 flex items-center gap-3 text-xs text-stone-400 shadow-md">
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse delay-150" />
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse delay-300" />
              </div>
              <span className="font-mono text-[11px] text-stone-300">
                Checking optical spectrum &amp; Arrhenius kinetic equations...
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompt Carousel (When messages exist) */}
      {messages.length > 0 && (
        <div className="px-4 py-1.5 bg-stone-950/80 border-t border-stone-800/80 flex items-center gap-1.5 overflow-x-auto text-[11px] shrink-0">
          <span className="text-[10px] uppercase font-mono text-stone-400 shrink-0">
            Quick Ask:
          </span>
          {suggestedPrompts.slice(0, 3).map((prompt, i) => (
            <button
              key={i}
              onClick={() => handleSendMessage(prompt)}
              className="px-2.5 py-0.5 rounded-full bg-stone-900 hover:bg-stone-800 border border-stone-800 text-stone-300 hover:text-white shrink-0 transition-colors truncate max-w-xs"
            >
              {prompt}
            </button>
          ))}
        </div>
      )}

      {/* Input Box Footer */}
      <div className="bg-stone-950 border-t border-stone-800 p-3 sm:p-4 shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <div className="relative flex-1">
            <input
              ref={inputRef}
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder={
                report
                  ? `Ask any question about ${report.produce_type} (${report.stage_name}, BDI: ${report.bruise_defect_index.toFixed(1)}%)...`
                  : 'Ask about AgriGrade optical inspection and multi-agent grading...'
              }
              className="w-full bg-stone-900 border border-stone-800 rounded-xl px-4 py-2.5 text-xs text-stone-100 placeholder-stone-400 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all font-sans"
              disabled={isLoading}
            />
          </div>

          <button
            type="submit"
            disabled={!inputQuery.trim() || isLoading}
            className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-40 disabled:hover:bg-purple-600 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-md shadow-purple-950/50 shrink-0"
          >
            <span>Ask Agents</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>

        <div className="flex items-center justify-between text-[10px] text-stone-400 mt-2 font-mono">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            Zero-Hallucination Policy: All facts verified against real scan telemetry
          </span>
          <span className="hidden sm:inline">Press Enter to send</span>
        </div>
      </div>
    </div>
  );
};
