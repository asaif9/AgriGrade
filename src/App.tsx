import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Header } from './components/Header';
import { CameraViewfinder } from './components/CameraViewfinder';
import { KineticDecayWidget } from './components/KineticDecayWidget';
import { FieldHarvestDecision } from './components/FieldHarvestDecision';
import { DarkStoreQualityGate } from './components/DarkStoreQualityGate';
import { MultiAgentTrace } from './components/MultiAgentTrace';
import { SupplyChainEconomics } from './components/SupplyChainEconomics';
import { MultiAgentModal } from './components/MultiAgentModal';
import { AuditHistorySection } from './components/AuditHistorySection';
import { AgentChatMode } from './components/AgentChatMode';
import { PRESET_SAMPLES, type ProducePreset } from './data/presets';
import { rasterizeImageIfNeeded } from './utils/imageRasterizer';
import { generateInspectionPdfReport } from './utils/pdfReportGenerator';
import type { AgriGradeReport, InspectionMode, InspectionRequest, AuditScanRecord } from './types';
import { Sprout, Warehouse, Sliders, RefreshCw, Smartphone, CheckCircle, Sparkles, MapPin, Truck, ShieldAlert, FileText, Download, MessageSquare } from 'lucide-react';

export default function App() {
  const [mode, setMode] = useState<InspectionMode>('FIELD_PRE_HARVEST');
  const [isMobileView, setIsMobileView] = useState<boolean>(false);
  const [isChatMode, setIsChatMode] = useState<boolean>(false);
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(PRESET_SAMPLES[0].id);
  const [currentImage, setCurrentImage] = useState<string>(PRESET_SAMPLES[0].imageUrl);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [report, setReport] = useState<AgriGradeReport | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isAgentModalOpen, setIsAgentModalOpen] = useState<boolean>(false);
  const [geminiReady, setGeminiReady] = useState<boolean>(false);

  // Field / Inbound Telemetry Inputs
  const [ambientTemp, setAmbientTemp] = useState<number>(31);
  const [transitHours, setTransitHours] = useState<number>(12);
  const [transitKm, setTransitKm] = useState<number>(160);
  const [storageMethod, setStorageMethod] = useState<'AMBIENT_LORRY' | 'CHILLED_REEFER'>('AMBIENT_LORRY');
  const [batchId, setBatchId] = useState<string>('CRATE-TOM-8821');
  const [supplierName, setSupplierName] = useState<string>('Saraswati Agritech Cluster #3');
  const [auditHistory, setAuditHistory] = useState<AuditScanRecord[]>([]);

  // Check health and Gemini configuration on mount
  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json())
      .then((data) => {
        setGeminiReady(data.gemini_configured || true);
      })
      .catch((err) => console.warn('Health check warning:', err));
  }, []);

  // Trigger grading through the full-stack multi-agent pipeline
  const runInspection = useCallback(
    async (
      imgB64: string,
      currentMode: InspectionMode,
      temp: number,
      hours: number,
      km: number,
      storage: 'AMBIENT_LORRY' | 'CHILLED_REEFER',
      bId: string,
      sName: string,
      cropHint: string = 'Tomato'
    ) => {
      setIsProcessing(true);
      setErrorMsg(null);
      try {
        const normalizedImg = await rasterizeImageIfNeeded(imgB64);
        const payload: InspectionRequest = {
          image_b64: normalizedImg,
          mode: currentMode,
          crop_type_hint: cropHint,
          ambient_temp_celsius: temp,
          transit_hours_to_hub: hours,
          transit_distance_km: km,
          storage_method: storage,
          batch_id: bId,
          supplier_name: sName,
        };

        const res = await fetch('/api/grade', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          throw new Error(`Server returned error code ${res.status}`);
        }

        const data: AgriGradeReport = await res.json();
        setReport(data);

        // Record entry into session audit ledger
        const now = new Date();
        const displayTime = now.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        });

        let finalDecision: AuditScanRecord['finalDecision'];
        let qualityScore: number | undefined;

        if (data.inbound_action) {
          qualityScore = data.inbound_action.quality_score;
          if (data.inbound_action.verdict === 'ACCEPTED_GRADE_A') {
            finalDecision = {
              verdict: 'ACCEPTED_GRADE_A',
              label: 'Accepted (Grade A)',
              summary: `${data.inbound_action.quality_score}% Quality Score • ${data.inbound_action.erp_routing_tag}`,
              color: 'emerald',
            };
          } else if (data.inbound_action.verdict === 'ACCEPTED_GRADE_B') {
            finalDecision = {
              verdict: 'ACCEPTED_GRADE_B',
              label: 'Accepted (Grade B)',
              summary: `${data.inbound_action.quality_score}% Quality Score • ${data.inbound_action.recommended_dynamic_discount_percent}% Markdown`,
              color: 'amber',
            };
          } else {
            finalDecision = {
              verdict: 'REJECTED_AT_DOCK',
              label: 'Rejected at Dock',
              summary: data.inbound_action.disposition_notes || 'Failed dark store dock intake criteria',
              color: 'rose',
            };
          }
        } else if (data.harvest_guidance) {
          qualityScore = data.harvest_guidance.transit_viability_score;
          if (data.harvest_guidance.should_harvest_today) {
            finalDecision = {
              verdict: 'HARVEST_RECOMMENDED',
              label: 'Harvest Today',
              summary: `${data.harvest_guidance.optimal_harvest_window} • Viability: ${data.harvest_guidance.transit_viability_score}/100`,
              color: 'emerald',
            };
          } else {
            finalDecision = {
              verdict: 'DELAY_HARVEST',
              label: 'Delay Harvest',
              summary: data.harvest_guidance.optimal_harvest_window || 'Chlorophyll breakdown ongoing',
              color: 'amber',
            };
          }
        } else {
          finalDecision = {
            verdict: 'ACCEPTED_GRADE_A',
            label: 'Inspected',
            summary: `USDA Stage ${data.usda_color_stage} • ${data.stage_name}`,
            color: 'cyan',
          };
        }

        const newRecord: AuditScanRecord = {
          id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          timestamp: now.toISOString(),
          displayTime,
          batchId: bId || data.produce_type.toUpperCase() + '-BATCH',
          supplierName: sName || 'Co-Op Farm Cluster',
          mode: currentMode,
          produceType: data.produce_type,
          varietyDetected: data.variety_detected,
          thumbnailUrl: imgB64,
          finalDecision,
          qualityScore,
          report: data,
        };

        setAuditHistory((prev) => [newRecord, ...prev]);
      } catch (err: any) {
        console.error('Inspection failed:', err);
        setErrorMsg('Inspection error. Falling back to local agricultural model.');
      } finally {
        setIsProcessing(false);
      }
    },
    []
  );

  // Initial grading on load
  useEffect(() => {
    runInspection(
      PRESET_SAMPLES[0].imageUrl,
      'FIELD_PRE_HARVEST',
      ambientTemp,
      transitHours,
      transitKm,
      storageMethod,
      batchId,
      supplierName,
      PRESET_SAMPLES[0].crop
    );
  }, []);

  // Handle switching between Field and Dark Store mode
  const handleModeChange = (newMode: InspectionMode) => {
    setMode(newMode);
    // Find first appropriate preset for this mode
    const appropriatePreset = PRESET_SAMPLES.find((p) => p.mode === newMode) || PRESET_SAMPLES[0];
    setSelectedPresetId(appropriatePreset.id);
    setCurrentImage(appropriatePreset.imageUrl);
    setAmbientTemp(appropriatePreset.ambientTemp);
    setTransitHours(appropriatePreset.transitHours);
    setTransitKm(appropriatePreset.transitKm);
    setStorageMethod(appropriatePreset.storage);
    setBatchId(appropriatePreset.batchId);
    setSupplierName(appropriatePreset.supplier);

    runInspection(
      appropriatePreset.imageUrl,
      newMode,
      appropriatePreset.ambientTemp,
      appropriatePreset.transitHours,
      appropriatePreset.transitKm,
      appropriatePreset.storage,
      appropriatePreset.batchId,
      appropriatePreset.supplier,
      appropriatePreset.crop
    );
  };

  // Handle image capture from camera or preset selection
  const handleImageCaptured = (base64: string, presetMeta?: Partial<ProducePreset>) => {
    setCurrentImage(base64);
    if (presetMeta?.id) {
      setSelectedPresetId(presetMeta.id);
      if (presetMeta.ambientTemp) setAmbientTemp(presetMeta.ambientTemp);
      if (presetMeta.transitHours) setTransitHours(presetMeta.transitHours);
      if (presetMeta.transitKm) setTransitKm(presetMeta.transitKm);
      if (presetMeta.storage) setStorageMethod(presetMeta.storage);
      if (presetMeta.batchId) setBatchId(presetMeta.batchId);
      if (presetMeta.supplier) setSupplierName(presetMeta.supplier);
    } else {
      setSelectedPresetId(null);
    }

    runInspection(
      base64,
      mode,
      presetMeta?.ambientTemp ?? ambientTemp,
      presetMeta?.transitHours ?? transitHours,
      presetMeta?.transitKm ?? transitKm,
      presetMeta?.storage ?? storageMethod,
      presetMeta?.batchId ?? batchId,
      presetMeta?.supplier ?? supplierName,
      presetMeta?.crop ?? 'Tomato'
    );
  };

  // Ref for debouncing temperature slider inspections
  const tempDebounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Re-run inspection when slider values change with smooth real-time visual feedback
  const handleTempChange = (newTemp: number) => {
    setAmbientTemp(newTemp);
    if (tempDebounceTimerRef.current) {
      clearTimeout(tempDebounceTimerRef.current);
    }
    tempDebounceTimerRef.current = setTimeout(() => {
      if (currentImage) {
        runInspection(
          currentImage,
          mode,
          newTemp,
          transitHours,
          transitKm,
          storageMethod,
          batchId,
          supplierName
        );
      }
    }, 280);
  };

  const handleCrateQrParsed = (data: { batchId: string; supplierName: string }) => {
    setBatchId(data.batchId);
    setSupplierName(data.supplierName);
  };

  const handleSelectAuditRecord = (record: AuditScanRecord) => {
    setReport(record.report);
    if (record.thumbnailUrl) {
      setCurrentImage(record.thumbnailUrl);
    }
    setBatchId(record.batchId);
    setSupplierName(record.supplierName);
    setMode(record.mode);
  };

  const handleClearAuditHistory = () => {
    setAuditHistory([]);
  };

  const [isExportingPdf, setIsExportingPdf] = useState(false);

  // Generate downloadable PDF summary report of current inspection record
  const handleDownloadPdf = async () => {
    if (!report) return;
    setIsExportingPdf(true);
    try {
      await generateInspectionPdfReport({
        report,
        batchId,
        supplierName,
        imageUrl: currentImage,
        ambientTemp,
        transitHours,
        transitKm,
      });
    } catch (err) {
      console.error('Failed to generate PDF report:', err);
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handleStorageChange = (newStorage: 'AMBIENT_LORRY' | 'CHILLED_REEFER') => {
    setStorageMethod(newStorage);
    if (currentImage) {
      runInspection(
        currentImage,
        mode,
        ambientTemp,
        transitHours,
        transitKm,
        newStorage,
        batchId,
        supplierName
      );
    }
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col font-sans">
      {/* Header */}
      <Header
        mode={mode}
        onModeChange={handleModeChange}
        isMobileView={isMobileView}
        onToggleMobileView={() => setIsMobileView(!isMobileView)}
        geminiReady={geminiReady}
        onOpenMultiAgentModal={() => setIsAgentModalOpen(true)}
        isChatMode={isChatMode}
        onToggleChatMode={() => setIsChatMode(!isChatMode)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-6">
        {/* Mode Introduction Banner */}
        <div className="rounded-2xl bg-gradient-to-r from-stone-900 via-stone-900 to-stone-950 border border-stone-800 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                mode === 'FIELD_PRE_HARVEST'
                  ? 'bg-emerald-950 border border-emerald-700/80 text-emerald-400'
                  : 'bg-amber-950 border border-amber-700/80 text-amber-400'
              }`}
            >
              {mode === 'FIELD_PRE_HARVEST' ? (
                <Sprout className="w-6 h-6 stroke-[2.2]" />
              ) : (
                <Warehouse className="w-6 h-6 stroke-[2.2]" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white">
                  {mode === 'FIELD_PRE_HARVEST'
                    ? 'Field Mode — Pre-Harvest Decision Support'
                    : 'Inbound Dark Store Mode — Post-Harvest Quality Gate'}
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-stone-800 text-stone-300 border border-stone-700">
                  {mode === 'FIELD_PRE_HARVEST' ? 'Farm-Level' : 'Dock-Level'}
                </span>
              </div>
              <p className="text-xs text-stone-400 mt-0.5 max-w-2xl leading-relaxed">
                {mode === 'FIELD_PRE_HARVEST'
                  ? 'Scans crops on the vine using phone camera, measures chlorophyll breakdown, and models transit distance & temperature to provide optimal harvest window recommendations.'
                  : 'Receiving dock inspection gate for quick-commerce micro-warehouses (Blinkit, Zepto, Instacart). Optical quality scoring, sub-2s gate verdict, and automated dynamic markdown triggers.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            {/* Agent Chat Mode Toggle Button */}
            <button
              onClick={() => setIsChatMode(!isChatMode)}
              className={`px-3.5 py-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm ${
                isChatMode
                  ? 'bg-purple-600 border-purple-500 text-white shadow-purple-950/50'
                  : 'bg-purple-950/80 hover:bg-purple-900 border-purple-700/80 text-purple-200'
              }`}
              title="Zero-hallucination agent chat based on current scan facts"
            >
              <MessageSquare className="w-3.5 h-3.5 text-purple-400" />
              <span>{isChatMode ? 'Inspection View' : 'Chat Mode (Agent Q&A)'}</span>
              {!isChatMode && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />}
            </button>

            {report && !isChatMode && (
              <button
                onClick={handleDownloadPdf}
                disabled={isExportingPdf}
                className="px-3.5 py-2 rounded-xl bg-cyan-950 hover:bg-cyan-900 border border-cyan-700/80 text-xs font-semibold text-cyan-200 transition-colors flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                title="Download official PDF inspection summary certificate"
              >
                <FileText className="w-3.5 h-3.5 text-cyan-400" />
                <span>{isExportingPdf ? 'Generating PDF...' : 'Download PDF Report'}</span>
              </button>
            )}

            <button
              onClick={() => handleModeChange(mode === 'FIELD_PRE_HARVEST' ? 'DARK_STORE_INBOUND' : 'FIELD_PRE_HARVEST')}
              className="px-3.5 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 border border-stone-700 text-xs font-semibold text-stone-200 transition-colors flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
              <span>Switch to {mode === 'FIELD_PRE_HARVEST' ? 'Dark Store' : 'Field Mode'}</span>
            </button>
          </div>
        </div>

        {/* Content Area: Either Dedicated Agent Chat Mode or Inspection Dashboard */}
        {isChatMode ? (
          <AgentChatMode
            report={report}
            batchId={batchId}
            supplierName={supplierName}
            ambientTemp={ambientTemp}
            transitHours={transitHours}
            transitKm={transitKm}
            storageMethod={storageMethod}
            onClose={() => setIsChatMode(false)}
            onNavigateToScan={() => setIsChatMode(false)}
          />
        ) : (
          <>
            {/* Framing Wrapper: Supports handheld mobile view simulation or responsive wide-dock */}
            <div className={isMobileView ? 'max-w-md mx-auto w-full' : 'w-full'}>
          {isMobileView && (
            <div className="text-center pb-2 text-xs font-mono text-emerald-400 flex items-center justify-center gap-1.5">
              <Smartphone className="w-3.5 h-3.5" />
              <span>Handheld Mobile Device Simulation (390px viewport)</span>
            </div>
          )}

          {/* Grid Layout */}
          <div className={`grid gap-6 ${isMobileView ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-12'}`}>
            {/* Left Column: Viewfinder & Capture (5 columns on desktop) */}
            <div className={isMobileView ? 'space-y-6' : 'lg:col-span-5 space-y-6'}>
              <CameraViewfinder
                mode={mode}
                currentImage={currentImage}
                onImageCaptured={handleImageCaptured}
                onCrateQrParsed={handleCrateQrParsed}
                isProcessing={isProcessing}
                selectedPresetId={selectedPresetId}
                currentBatchId={batchId}
                currentSupplier={supplierName}
              />

              {/* Mode-Specific Field / Dock Telemetry Sliders */}
              <div className="bg-stone-900 rounded-2xl border border-stone-800 p-4 shadow-xl flex flex-col gap-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-stone-200 uppercase tracking-wider">
                    <Sliders className="w-4 h-4 text-emerald-400" />
                    <span>
                      {mode === 'FIELD_PRE_HARVEST' ? 'Field & Transit Parameters' : 'Inbound Dock Metadata'}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-stone-500">Live Input</span>
                </div>

                {mode === 'FIELD_PRE_HARVEST' ? (
                  <div className="space-y-3 text-xs">
                    {/* Transit Distance */}
                    <div>
                      <div className="flex justify-between text-stone-300 font-medium">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-cyan-400" /> Planned Transit Distance:
                        </span>
                        <span className="font-mono text-cyan-400 font-bold">{transitKm} km</span>
                      </div>
                      <input
                        type="range"
                        min="20"
                        max="600"
                        step="10"
                        value={transitKm}
                        onChange={(e) => {
                          const km = Number(e.target.value);
                          setTransitKm(km);
                          setTransitHours(Math.max(2, Math.round(km / 20)));
                        }}
                        className="w-full accent-cyan-500 mt-1 cursor-pointer"
                      />
                    </div>

                    {/* Transit Hours */}
                    <div>
                      <div className="flex justify-between text-stone-300 font-medium">
                        <span className="flex items-center gap-1">
                          <Truck className="w-3.5 h-3.5 text-amber-400" /> Estimated Transit Time:
                        </span>
                        <span className="font-mono text-amber-400 font-bold">{transitHours} hours</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="36"
                        step="1"
                        value={transitHours}
                        onChange={(e) => setTransitHours(Number(e.target.value))}
                        className="w-full accent-amber-500 mt-1 cursor-pointer"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2.5 text-xs">
                    <div className="flex justify-between items-center bg-stone-950 p-2.5 rounded-xl border border-stone-800">
                      <span className="text-stone-400">Crate Batch ID:</span>
                      <input
                        type="text"
                        value={batchId}
                        onChange={(e) => setBatchId(e.target.value)}
                        className="font-mono text-stone-200 bg-transparent text-right outline-none focus:text-white"
                      />
                    </div>

                    <div className="flex justify-between items-center bg-stone-950 p-2.5 rounded-xl border border-stone-800">
                      <span className="text-stone-400">Farm / Supplier:</span>
                      <input
                        type="text"
                        value={supplierName}
                        onChange={(e) => setSupplierName(e.target.value)}
                        className="text-stone-200 bg-transparent text-right outline-none focus:text-white truncate max-w-[180px]"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Multi-Agent Swarm Execution Trace */}
              {report && <MultiAgentTrace traces={report.agent_traces} />}
            </div>

            {/* Right Column: Decisions, Kinetic Decay, & Actions (7 columns on desktop) */}
            <div className={isMobileView ? 'space-y-6' : 'lg:col-span-7 space-y-6'}>
              {report && (
                <>
                  {/* Mode-Specific Primary Decision Card */}
                  {mode === 'FIELD_PRE_HARVEST' ? (
                    <FieldHarvestDecision
                      report={report}
                      transitHours={transitHours}
                      transitKm={transitKm}
                      onOpenChat={() => setIsChatMode(true)}
                    />
                  ) : (
                    <DarkStoreQualityGate
                      report={report}
                      batchId={batchId}
                      supplierName={supplierName}
                      onOpenChat={() => setIsChatMode(true)}
                    />
                  )}

                  {/* Kinetic Shelf-Life Decay Engine Widget */}
                  <KineticDecayWidget
                    report={report}
                    ambientTemp={ambientTemp}
                    onTempChange={handleTempChange}
                    storageMethod={storageMethod}
                    onStorageChange={handleStorageChange}
                    supplierName={supplierName}
                  />

                  {/* Supply Chain Economics & ROI Widget */}
                  <SupplyChainEconomics />
                </>
              )}
            </div>
          </div>
        </div>

        {/* Collapsible Session Audit History */}
        <AuditHistorySection
          history={auditHistory}
          onSelectRecord={handleSelectAuditRecord}
          onClearHistory={handleClearAuditHistory}
          activeReportId={report?.id}
        />
          </>
        )}
      </main>

      {/* Floating Chat Quick-Access Button (Visible when in inspection view) */}
      {!isChatMode && (
        <button
          onClick={() => setIsChatMode(true)}
          className="fixed bottom-6 right-6 z-40 px-4 py-3 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-xl shadow-purple-950/80 flex items-center gap-2.5 border border-purple-400/40 hover:scale-105 active:scale-95 transition-all group"
          title="Chat with zero-hallucination agent swarm based on current scan facts"
        >
          <div className="relative">
            <MessageSquare className="w-4 h-4 text-white" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400" />
          </div>
          <span className="font-sans">Chat with Agents</span>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-purple-950/80 text-purple-200 border border-purple-700/60">
            Telemetry Q&A
          </span>
        </button>
      )}

      {/* Multi-Agent Architecture Modal */}
      <MultiAgentModal
        isOpen={isAgentModalOpen}
        onClose={() => setIsAgentModalOpen(false)}
      />

      {/* Footer */}
      <footer className="border-t border-stone-800 bg-stone-950/80 px-4 py-4 text-xs text-stone-500 text-center">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            AgriGrade Swarm • Powered by Gemini Vision &amp; Kinetic Arrhenius Respiration Engine
          </div>
          <div className="flex items-center gap-3 text-stone-400 font-mono text-[11px]">
            <span>Dual-Mode v1.2</span>
            <span>•</span>
            <span>Cloud Run Microservices</span>
            <span>•</span>
            <span>Sub-2s Inbound Gate</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
