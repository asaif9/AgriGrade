import React, { useState } from 'react';
import {
  X,
  Cpu,
  Layers,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Terminal,
  Copy,
  Check,
  Search,
  Filter,
  Code2,
  Workflow,
  Network,
  BookOpen,
  Zap,
  RefreshCw,
  GitCommit,
  Share2,
  Sliders,
  Eye,
  FileText
} from 'lucide-react';
import { AGENT_SKILLS_AND_INSTRUCTIONS, type AgentProfileSpecification, type AgentSkillDefinition } from '../data/agentSkillsMatrix';

interface MultiAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialAgentId?: string;
}

type TabType = 'overview' | 'skills' | 'prompts' | 'contracts' | 'resilience';

export const MultiAgentModal: React.FC<MultiAgentModalProps> = ({
  isOpen,
  onClose,
  initialAgentId,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [selectedAgentId, setSelectedAgentId] = useState<string>(
    initialAgentId || 'agent_vision_phenotyping'
  );
  const [skillSearchQuery, setSkillSearchQuery] = useState('');
  const [skillFilter, setSkillFilter] = useState<'all' | 'active' | 'recommended_expansion'>('all');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentAgent = AGENT_SKILLS_AND_INSTRUCTIONS.find((a) => a.id === selectedAgentId) || AGENT_SKILLS_AND_INSTRUCTIONS[0];

  const handleCopy = (key: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2200);
  };

  const filteredSkills = [...currentAgent.activeSkills, ...currentAgent.proposedSkills].filter((skill) => {
    const matchesFilter =
      skillFilter === 'all' ||
      (skillFilter === 'active' && skill.status === 'active') ||
      (skillFilter === 'recommended_expansion' && skill.status === 'recommended_expansion');
    const matchesQuery =
      skillSearchQuery === '' ||
      skill.name.toLowerCase().includes(skillSearchQuery.toLowerCase()) ||
      skill.description.toLowerCase().includes(skillSearchQuery.toLowerCase()) ||
      skill.id.toLowerCase().includes(skillSearchQuery.toLowerCase());
    return matchesFilter && matchesQuery;
  });

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-stone-900 border border-stone-800 rounded-2xl max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-stone-800 flex items-center justify-between bg-stone-950/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-bold text-white">
                  Multi-Agent Architecture & Dynamic Skills Matrix
                </h2>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-800 text-emerald-400 font-bold">
                  9 Specialized Agents + Supervisor
                </span>
              </div>
              <p className="text-xs text-stone-400">
                Architectural blueprints, runtime skills, hardened system instructions & failure mitigation
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
            title="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-5 border-b border-stone-800 bg-stone-950/40 flex items-center gap-1 sm:gap-2 overflow-x-auto shrink-0 py-2.5">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'overview'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/60'
            }`}
          >
            <Workflow className="w-3.5 h-3.5" />
            <span>Swarm Topology & DAG</span>
          </button>

          <button
            onClick={() => setActiveTab('skills')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'skills'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/60'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Agent Skills Catalog</span>
            <span className="text-[10px] bg-stone-900/80 px-1.5 py-0.2 rounded-full border border-stone-700 font-mono">
              28+
            </span>
          </button>

          <button
            onClick={() => setActiveTab('prompts')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'prompts'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/60'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>System Instructions & Prompts</span>
          </button>

          <button
            onClick={() => setActiveTab('contracts')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'contracts'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/60'
            }`}
          >
            <Network className="w-3.5 h-3.5" />
            <span>Inter-Agent Contracts</span>
          </button>

          <button
            onClick={() => setActiveTab('resilience')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'resilience'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/60'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Self-Healing & Edge Cases</span>
          </button>
        </div>

        {/* Agent Switcher Pills (shown in skills, prompts, contracts, resilience tabs) */}
        {activeTab !== 'overview' && (
          <div className="px-5 py-2.5 bg-stone-950/80 border-b border-stone-800/80 flex items-center gap-2 overflow-x-auto shrink-0">
            <span className="text-[11px] text-stone-500 font-mono uppercase tracking-wider shrink-0 font-semibold mr-1">
              Select Agent:
            </span>
            {AGENT_SKILLS_AND_INSTRUCTIONS.map((agent) => {
              const isSelected = agent.id === selectedAgentId;
              return (
                <button
                  key={agent.id}
                  onClick={() => setSelectedAgentId(agent.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all shrink-0 flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-stone-800 text-white border border-stone-600 font-bold shadow-sm'
                      : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900 border border-transparent'
                  }`}
                >
                  <span
                    className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-mono ${
                      isSelected ? 'bg-emerald-500 text-stone-950 font-bold' : 'bg-stone-800 text-stone-400'
                    }`}
                  >
                    {agent.agentNumber === 0 ? 'S' : agent.agentNumber}
                  </span>
                  <span>{agent.agentNumber === 0 ? 'Supervisor' : agent.name.split(':')[1]?.trim() || agent.name}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Tab Content Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-6">
          {/* TAB 1: SWARM TOPOLOGY & DAG */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* ASCII / Graphical Architecture Box */}
              <div className="p-5 rounded-2xl bg-stone-950 border border-stone-800/90 shadow-inner">
                <div className="flex items-center justify-between mb-3 border-b border-stone-800/80 pb-2">
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider font-mono flex items-center gap-2">
                    <Workflow className="w-4 h-4" />
                    Asynchronous Parallel Directed Acyclic Graph (DAG) Execution Flow
                  </span>
                  <span className="text-[11px] font-mono text-stone-400">Target Latency: &lt; 850ms</span>
                </div>

                <div className="font-mono text-xs text-stone-300 leading-relaxed overflow-x-auto py-2">
                  <div className="text-purple-400 font-bold">
                    [0. Swarm Orchestrator &amp; Synthesis Supervisor] (Dispatches Parallel Workers)
                  </div>
                  <div className="text-stone-500">
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;│
                    <br />
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;┌──────────────┼──────────────┐&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-emerald-500 font-sans text-[11px]">◄── Phase 1: Parallel Perception &amp; Biophysics</span>
                    <br />
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;↓&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;↓&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;↓
                  </div>
                  <div className="flex items-center gap-4 text-xs my-1">
                    <span className="p-2 rounded-lg bg-emerald-950/60 border border-emerald-700/80 text-emerald-300 font-bold">
                      1. Vision &amp; Phenotyping
                    </span>
                    <span className="p-2 rounded-lg bg-rose-950/60 border border-rose-700/80 text-rose-300 font-bold">
                      2. Pathology &amp; Defect 360°
                    </span>
                    <span className="p-2 rounded-lg bg-cyan-950/60 border border-cyan-700/80 text-cyan-300 font-bold">
                      3. Kinetic Bio-Decay Twin
                    </span>
                  </div>
                  <div className="text-stone-500">
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;│&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;│&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;│
                    <br />
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;└──────────────┼──────────────┘&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-amber-400 font-sans text-[11px]">◄── Barrier Sync: Validates consistency</span>
                    <br />
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;↓
                  </div>
                  <div className="my-1">
                    <span className="p-2 rounded-lg bg-amber-950/80 border border-amber-600 text-amber-200 font-bold">
                      4. Commercial Decision &amp; Rules Engine (Customer Tolerances)
                    </span>
                  </div>
                  <div className="text-stone-500">
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;│
                    <br />
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;┌──────────────┼──────────────┐&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-indigo-400 font-sans text-[11px]">◄── Phase 2: Downstream Optimization Solvers</span>
                    <br />
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;↓&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;↓&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;↓
                  </div>
                  <div className="flex items-center gap-4 text-xs my-1">
                    <span className="p-2 rounded-lg bg-indigo-950/60 border border-indigo-700/80 text-indigo-300 font-bold">
                      5. Demand &amp; Waste Hazard
                    </span>
                    <span className="p-2 rounded-lg bg-emerald-950/60 border border-emerald-700/80 text-emerald-300 font-bold">
                      6. Network Routing
                    </span>
                    <span className="p-2 rounded-lg bg-amber-950/60 border border-amber-700/80 text-amber-300 font-bold">
                      7. Dynamic Pricing Markdown
                    </span>
                  </div>
                  <div className="text-stone-500">
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;│&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;│&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;│
                    <br />
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;└──────────────┼──────────────┘
                    <br />
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;↓
                  </div>
                  <div className="my-1">
                    <span className="p-2 rounded-lg bg-rose-950/80 border border-rose-600 text-rose-200 font-bold">
                      8. Autonomous Risk &amp; Root Cause Diagnostic (Farm vs Transit Attribution)
                    </span>
                  </div>
                  <div className="text-stone-500">
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;↓
                  </div>
                  <div className="my-1">
                    <span className="p-2 rounded-lg bg-stone-900 border border-stone-700 text-stone-200 font-semibold">
                      Final Verified Action (WMS / ERP / Dispatch / Thermal TSPL Sticker)
                    </span>
                  </div>
                  <div className="text-stone-500">
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;↓ (Downstream Actual Sales &amp; Dump Logs)
                  </div>
                  <div className="my-1">
                    <span className="p-2 rounded-lg bg-purple-950/80 border border-purple-600 text-purple-200 font-bold">
                      9. Closed-Loop Model Calibration &amp; Learning Agent (Continual Retraining)
                    </span>
                  </div>
                </div>
              </div>

              {/* High-Level Overview Grid of All 9 Agents */}
              <div>
                <h3 className="text-sm font-bold text-white mb-3 flex items-center justify-between">
                  <span>The 9 Specialized Autonomous Agents</span>
                  <span className="text-xs font-normal text-stone-400">Click any card to inspect its skills &amp; instructions</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {AGENT_SKILLS_AND_INSTRUCTIONS.filter((a) => a.agentNumber > 0).map((agent) => (
                    <button
                      key={agent.id}
                      onClick={() => {
                        setSelectedAgentId(agent.id);
                        setActiveTab('skills');
                      }}
                      className="p-3.5 rounded-xl bg-stone-950/60 border border-stone-800 hover:border-emerald-500/60 hover:bg-stone-900/60 transition-all text-left group flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="w-6 h-6 rounded-lg bg-stone-800 text-stone-300 font-mono font-bold text-xs flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                            {agent.agentNumber}
                          </span>
                          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800/60">
                            {agent.activeSkills.length + agent.proposedSkills.length} Skills
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-stone-100 group-hover:text-emerald-300 transition-colors">
                          {agent.name.split(':')[1]?.trim() || agent.name}
                        </h4>
                        <p className="text-[11px] text-stone-400 mt-1 line-clamp-2 leading-relaxed">
                          {agent.coreMission}
                        </p>
                      </div>

                      <div className="mt-3 pt-2 border-t border-stone-900 flex items-center justify-between text-[10px] text-stone-500 font-mono">
                        <span>{agent.domain.split('&')[0]}</span>
                        <span className="text-emerald-400 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                          Inspect <ArrowRight className="w-3 h-3" />
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: AGENT SKILLS CATALOG */}
          {activeTab === 'skills' && (
            <div className="space-y-5">
              {/* Agent Title & Mission Card */}
              <div className="p-4 rounded-xl bg-stone-950 border border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-md bg-emerald-500/20 text-emerald-400 font-mono text-xs flex items-center justify-center font-bold">
                      {currentAgent.agentNumber === 0 ? 'S' : currentAgent.agentNumber}
                    </span>
                    <h3 className="text-base font-bold text-white">{currentAgent.name}</h3>
                  </div>
                  <p className="text-xs text-stone-400 mt-1">{currentAgent.coreMission}</p>
                </div>
                <div className="shrink-0 flex items-center gap-2">
                  <span className="text-xs font-mono px-2.5 py-1 rounded-lg bg-stone-900 border border-stone-700 text-stone-300">
                    Domain: <strong className="text-emerald-400">{currentAgent.domain}</strong>
                  </span>
                </div>
              </div>

              {/* Search & Filter Bar */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search skills, schemas, tools..."
                    value={skillSearchQuery}
                    onChange={(e) => setSkillSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 bg-stone-950 border border-stone-800 rounded-xl text-xs text-stone-200 placeholder-stone-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="flex items-center gap-1.5 self-start sm:self-auto">
                  <button
                    onClick={() => setSkillFilter('all')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                      skillFilter === 'all'
                        ? 'bg-stone-800 text-white border border-stone-700 font-semibold'
                        : 'text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    All Skills ({currentAgent.activeSkills.length + currentAgent.proposedSkills.length})
                  </button>
                  <button
                    onClick={() => setSkillFilter('active')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                      skillFilter === 'active'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-700 font-semibold'
                        : 'text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    Active In-App ({currentAgent.activeSkills.length})
                  </button>
                  <button
                    onClick={() => setSkillFilter('recommended_expansion')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                      skillFilter === 'recommended_expansion'
                        ? 'bg-purple-950 text-purple-300 border border-purple-700 font-semibold'
                        : 'text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    Recommended Extensions ({currentAgent.proposedSkills.length})
                  </button>
                </div>
              </div>

              {/* Skills Cards List */}
              <div className="space-y-4">
                {filteredSkills.map((skill) => (
                  <div
                    key={skill.id}
                    className="p-4 rounded-xl bg-stone-950/70 border border-stone-800 hover:border-stone-700 transition-all flex flex-col gap-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-900 pb-2.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider ${
                            skill.status === 'active'
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                              : 'bg-purple-950 text-purple-300 border border-purple-800'
                          }`}
                        >
                          {skill.status === 'active' ? 'Active Skill' : 'Recommended Expansion'}
                        </span>
                        <h4 className="text-sm font-bold text-white">{skill.name}</h4>
                        <span className="text-[11px] font-mono text-stone-500">({skill.id})</span>
                      </div>

                      <button
                        onClick={() => handleCopy(skill.id, JSON.stringify(skill, null, 2))}
                        className="self-start sm:self-auto px-2 py-1 rounded-lg bg-stone-900 hover:bg-stone-800 border border-stone-800 text-[11px] text-stone-400 hover:text-stone-200 flex items-center gap-1.5 transition-colors"
                        title="Copy skill JSON definition"
                      >
                        {copiedKey === skill.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span className="text-emerald-400 font-semibold">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy Schema</span>
                          </>
                        )}
                      </button>
                    </div>

                    <p className="text-xs text-stone-300 leading-relaxed">{skill.description}</p>

                    {/* Parameters & Output Schema Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                      <div className="p-3 rounded-lg bg-stone-900/60 border border-stone-800/80">
                        <span className="text-[10px] font-mono text-stone-400 font-bold uppercase tracking-wider block mb-1.5">
                          Parameters &amp; Inputs
                        </span>
                        <ul className="space-y-1 text-xs">
                          {skill.parameters.map((p, idx) => (
                            <li key={idx} className="text-stone-300 font-mono text-[11px]">
                              <span className="text-amber-400 font-semibold">{p.name}</span>:{' '}
                              <span className="text-stone-400">{p.type}</span>{' '}
                              {p.required && <span className="text-rose-400 text-[10px]">*req</span>}
                              <p className="text-stone-400 font-sans text-[11px]">{p.description}</p>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="p-3 rounded-lg bg-stone-900/60 border border-stone-800/80">
                        <span className="text-[10px] font-mono text-stone-400 font-bold uppercase tracking-wider block mb-1.5">
                          Output Return Schema
                        </span>
                        <pre className="text-emerald-300/90 font-mono text-[11px] whitespace-pre-wrap leading-relaxed overflow-x-auto">
                          {skill.outputSchema}
                        </pre>
                      </div>
                    </div>

                    {/* Heuristics & Business Impact */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-1 border-t border-stone-900">
                      <div>
                        <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider font-mono">
                          Edge Heuristics &amp; Bio-Logic:
                        </span>
                        <p className="text-stone-400 text-[11px] mt-0.5">{skill.edgeHeuristics}</p>
                      </div>
                      <div>
                        <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider font-mono">
                          Commercial / Agronomic ROI:
                        </span>
                        <p className="text-stone-400 text-[11px] mt-0.5">{skill.businessImpact}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: SYSTEM INSTRUCTIONS & PROMPTS */}
          {activeTab === 'prompts' && (
            <div className="space-y-5">
              {/* Header Card */}
              <div className="p-4 rounded-xl bg-stone-950 border border-stone-800 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-emerald-400" />
                    <span>Hardened System Prompt: {currentAgent.name}</span>
                  </h3>
                  <p className="text-xs text-stone-400 mt-0.5">
                    Production-grade system instructions with explicit CoT reasoning steps and zero-hallucination guardrails.
                  </p>
                </div>

                <button
                  onClick={() =>
                    handleCopy('systemPrompt', currentAgent.systemInstructions.systemPrompt)
                  }
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors shadow-sm"
                >
                  {copiedKey === 'systemPrompt' ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Copied Prompt</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Full Prompt</span>
                    </>
                  )}
                </button>
              </div>

              {/* Exact System Prompt Code Block */}
              <div className="p-4 rounded-xl bg-stone-950 border border-stone-800 font-mono text-xs text-stone-200">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-stone-800 text-[11px] text-stone-500">
                  <span>SYSTEM_INSTRUCTION_DIRECTIVE</span>
                  <span>Model Target: Gemini 3.8 Flash (Temperature: 0.15)</span>
                </div>
                <pre className="whitespace-pre-wrap text-emerald-300/90 leading-relaxed">
                  {currentAgent.systemInstructions.systemPrompt}
                </pre>
              </div>

              {/* Reasoning Chain Protocol */}
              <div className="p-4 rounded-xl bg-stone-950 border border-stone-800">
                <span className="text-xs font-bold text-amber-400 font-mono uppercase tracking-wider block mb-2">
                  Deterministic Chain-of-Thought (CoT) Reasoning Protocol:
                </span>
                <ol className="list-decimal list-inside space-y-1.5 text-xs text-stone-300">
                  {currentAgent.systemInstructions.reasoningChain.map((step, idx) => (
                    <li key={idx} className="leading-relaxed">
                      <strong className="text-stone-100">Step {idx + 1}:</strong> {step}
                    </li>
                  ))}
                </ol>
              </div>

              {/* Grounding Rules & Output Guardrails Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-stone-950 border border-stone-800">
                  <span className="text-xs font-bold text-cyan-400 font-mono uppercase tracking-wider block mb-2">
                    Zero-Hallucination Grounding Rules:
                  </span>
                  <ul className="space-y-1.5 text-xs text-stone-300 list-disc list-inside">
                    {currentAgent.systemInstructions.groundingRules.map((rule, idx) => (
                      <li key={idx} className="leading-relaxed">
                        {rule}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-stone-950 border border-stone-800">
                  <span className="text-xs font-bold text-rose-400 font-mono uppercase tracking-wider block mb-2">
                    Strict Output Guardrails &amp; Constraints:
                  </span>
                  <ul className="space-y-1.5 text-xs text-stone-300 list-disc list-inside">
                    {currentAgent.systemInstructions.outputGuardrails.map((rail, idx) => (
                      <li key={idx} className="leading-relaxed">
                        {rail}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: INTER-AGENT DATA CONTRACTS */}
          {activeTab === 'contracts' && (
            <div className="space-y-5">
              <div className="p-4 rounded-xl bg-stone-950 border border-stone-800">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Network className="w-4 h-4 text-emerald-400" />
                  <span>Inter-Agent Input/Output Data Contracts: {currentAgent.name}</span>
                </h3>
                <p className="text-xs text-stone-400 mt-1">
                  Enforces strict boundary contracts so downstream optimization agents never receive hallucinated or incomplete data.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Consumes From */}
                <div className="p-4 rounded-xl bg-stone-950 border border-stone-800">
                  <span className="text-xs font-bold text-indigo-400 font-mono uppercase tracking-wider block mb-3">
                    Consumes Inputs From Upstream Agents:
                  </span>
                  {currentAgent.interAgentContracts.consumesFrom.length === 0 ? (
                    <p className="text-xs text-stone-500 italic">
                      Root / Ingestion Agent — Consumes raw hardware inputs (RGB Camera, IoT Telemetry, Barcodes).
                    </p>
                  ) : (
                    <div className="space-y-2.5">
                      {currentAgent.interAgentContracts.consumesFrom.map((c, idx) => (
                        <div key={idx} className="p-2.5 rounded-lg bg-stone-900 border border-stone-800 text-xs">
                          <div className="font-bold text-stone-200 font-mono text-[11px] mb-1">
                            Source: {c.agentId}
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {c.dataFields.map((f, fIdx) => (
                              <span
                                key={fIdx}
                                className="px-1.5 py-0.5 rounded bg-stone-950 border border-stone-700 text-stone-300 font-mono text-[10px]"
                              >
                                {f}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Provides To */}
                <div className="p-4 rounded-xl bg-stone-950 border border-stone-800">
                  <span className="text-xs font-bold text-emerald-400 font-mono uppercase tracking-wider block mb-3">
                    Emits Output Contracts To Downstream Agents:
                  </span>
                  {currentAgent.interAgentContracts.providesTo.length === 0 ? (
                    <p className="text-xs text-stone-500 italic">
                      Terminal / Final Action Agent — Emits actions to external systems (ERP, WMS, Zebra Printer).
                    </p>
                  ) : (
                    <div className="space-y-2.5">
                      {currentAgent.interAgentContracts.providesTo.map((p, idx) => (
                        <div key={idx} className="p-2.5 rounded-lg bg-stone-900 border border-stone-800 text-xs">
                          <div className="font-bold text-stone-200 font-mono text-[11px] mb-1">
                            Destination: {p.agentId}
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {p.dataFields.map((f, fIdx) => (
                              <span
                                key={fIdx}
                                className="px-1.5 py-0.5 rounded bg-emerald-950/60 border border-emerald-800 text-emerald-300 font-mono text-[10px]"
                              >
                                {f}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: SELF-HEALING & RESILIENCE */}
          {activeTab === 'resilience' && (
            <div className="space-y-5">
              <div className="p-4 rounded-xl bg-stone-950 border border-stone-800">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Autonomous Self-Healing &amp; Failure Modes: {currentAgent.name}</span>
                </h3>
                <p className="text-xs text-stone-400 mt-1">
                  How the agent dynamically gracefully degrades, mitigates sensor loss, and prevents production crashes.
                </p>
              </div>

              <div className="space-y-3">
                {currentAgent.failureModes.map((fm, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-stone-950 border border-stone-800 space-y-2 text-xs">
                    <div className="flex items-center gap-2 text-rose-400 font-bold">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span>Failure Condition: {fm.condition}</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                      <div className="p-2.5 rounded-lg bg-stone-900/60 border border-stone-800">
                        <span className="text-[10px] text-stone-500 font-bold uppercase font-mono block mb-1">
                          Symptom Observed
                        </span>
                        <p className="text-stone-300">{fm.symptom}</p>
                      </div>

                      <div className="p-2.5 rounded-lg bg-emerald-950/30 border border-emerald-800/60">
                        <span className="text-[10px] text-emerald-400 font-bold uppercase font-mono block mb-1">
                          Autonomous Mitigation
                        </span>
                        <p className="text-emerald-200">{fm.autonomousMitigation}</p>
                      </div>

                      <div className="p-2.5 rounded-lg bg-purple-950/30 border border-purple-800/60">
                        <span className="text-[10px] text-purple-400 font-bold uppercase font-mono block mb-1">
                          Graceful Fallback State
                        </span>
                        <p className="text-purple-200 font-mono text-[11px]">{fm.fallbackState}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-stone-800 bg-stone-950/80 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-xs text-stone-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Swarm Health: 100% Operational</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-semibold text-xs transition-colors"
          >
            Close Blueprint
          </button>
        </div>
      </div>
    </div>
  );
};
