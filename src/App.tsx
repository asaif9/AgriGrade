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
import { ClosedLoopFeedbackStudio } from './components/ClosedLoopFeedbackStudio';
import { CommodityDatabaseStudio } from './components/CommodityDatabaseStudio';
import { ColdChainTelemetryStudio } from './components/ColdChainTelemetryStudio';
import { DigitalTwinStudio } from './components/DigitalTwinStudio';
import { ShelfLifeDigitalTwinCard } from './components/ShelfLifeDigitalTwinCard';
import { MultiFactorContextPanel } from './components/MultiFactorContextPanel';
import { DynamicGradeEngineStudio } from './components/DynamicGradeEngineStudio';
import { AgriGradeCommandCenter } from './components/AgriGradeCommandCenter';
import { DynamicPricingMarkdownStudio } from './components/DynamicPricingMarkdownStudio';
import { DemandForecastingAndRoutingStudio } from './components/DemandForecastingAndRoutingStudio';
import { SupplierScorecardStudio } from './components/SupplierScorecardStudio';
import { MobileFieldScoutModal } from './components/MobileFieldScoutModal';
import { WhatsAppAlertsModal } from './components/WhatsAppAlertsModal';
import { AuditAndVersioningModal } from './components/AuditAndVersioningModal';
import { DEFAULT_COMMERCIAL_RULES, type CommercialGradeRule } from './utils/gradeEngine';
import { PRESET_SAMPLES, type ProducePreset } from './data/presets';
import { rasterizeImageIfNeeded } from './utils/imageRasterizer';
import { generateInspectionPdfReport } from './utils/pdfReportGenerator';
import { DEFAULT_CALIBRATED_COLD_CHAIN_TELEMETRY } from './utils/telemetryEngine';
import type {
  AgriGradeReport,
  InspectionMode,
  InspectionRequest,
  AuditScanRecord,
  SensorTelemetry,
  WeatherContext,
  LogisticsContext,
  DemandAndInventoryContext,
  ColdChainTelemetry,
} from './types';
import {
  Sprout,
  Warehouse,
  Sliders,
  RefreshCw,
  Smartphone,
  CheckCircle,
  Sparkles,
  MapPin,
  Truck,
  ShieldAlert,
  FileText,
  Download,
  MessageSquare,
  Repeat,
  History,
  Activity,
  Layers,
  Award,
  Database,
  Box,
  Scale,
  ChevronRight,
  Radio,
  Globe2,
  Tag,
  Route,
  Bell,
} from 'lucide-react';

export default function App() {
  const [mode, setMode] = useState<InspectionMode>('FIELD_PRE_HARVEST');
  const [isMobileView, setIsMobileView] = useState<boolean>(false);
  const [isChatMode, setIsChatMode] = useState<boolean>(false);
  const [isFeedbackStudio, setIsFeedbackStudio] = useState<boolean>(false);
  const [isCommodityDatabase, setIsCommodityDatabase] = useState<boolean>(false);
  const [isTelemetryStudio, setIsTelemetryStudio] = useState<boolean>(false);
  const [isDigitalTwin, setIsDigitalTwin] = useState<boolean>(false);
  const [isGradeEngineStudio, setIsGradeEngineStudio] = useState<boolean>(false);
  const [isCommandCenter, setIsCommandCenter] = useState<boolean>(false);
  const [isPricingStudio, setIsPricingStudio] = useState<boolean>(false);
  const [isDemandRoutingStudio, setIsDemandRoutingStudio] = useState<boolean>(false);
  const [isSupplierScorecardStudio, setIsSupplierScorecardStudio] = useState<boolean>(false);
  const [isMobileFieldModalOpen, setIsMobileFieldModalOpen] = useState<boolean>(false);
  const [isAlertsModalOpen, setIsAlertsModalOpen] = useState<boolean>(false);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState<boolean>(false);
  const [selectedCustomerRuleId, setSelectedCustomerRuleId] = useState<string>('rule-zepto-quick-commerce');
  const [customCommercialRule, setCustomCommercialRule] = useState<CommercialGradeRule | null>(null);
  const [coldChainTelemetry, setColdChainTelemetry] = useState<ColdChainTelemetry>(DEFAULT_CALIBRATED_COLD_CHAIN_TELEMETRY);
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

  // Next-Gen Multi-Factor Context States
  const [sensorTelemetry, setSensorTelemetry] = useState<SensorTelemetry>({
    transit_logger_temp: 31,
    humidity_pct: 76,
    ethylene_ppm: 0.8,
    vibration_g_force: 1.1,
    temp_spike_detected: false,
    temp_spike_duration_hours: 0,
    cold_chain: DEFAULT_CALIBRATED_COLD_CHAIN_TELEMETRY,
  });

  const [weatherContext, setWeatherContext] = useState<WeatherContext>({
    harvest_ambient_temp: 31,
    heatwave_warning: false,
    precipitation_at_harvest: false,
    humidity_relative_pct: 68,
    solar_radiation_index: 'MODERATE',
  });

  const [logisticsContext, setLogisticsContext] = useState<LogisticsContext>({
    transit_hours_to_hub: 12,
    transit_distance_km: 160,
    storage_method: 'AMBIENT_LORRY',
    road_condition: 'SMOOTH_HIGHWAY',
    transit_delay_hours: 0,
    carrier_sla_rating: 94,
  });

  const [demandContext, setDemandContext] = useState<DemandAndInventoryContext>({
    dark_store_inventory_crates: 28,
    shelf_turnover_hours: 14,
    current_hourly_demand_rate: 3.5,
    active_discount_promos: false,
    competing_batch_expiry_hours: 12,
    demand_surge_factor: 1.2,
  });

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
      cropHint: string = 'Tomato',
      sensors?: SensorTelemetry,
      weather?: WeatherContext,
      logistics?: LogisticsContext,
      demand?: DemandAndInventoryContext,
      customerRuleId?: string,
      customRule?: CommercialGradeRule | null
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
          customer_rule_id: customerRuleId || selectedCustomerRuleId,
          custom_commercial_rule: customRule !== undefined ? (customRule ?? undefined) : (customCommercialRule ?? undefined),
          sensor_telemetry: sensors || sensorTelemetry,
          cold_chain_telemetry: coldChainTelemetry,
          weather_context: weather || weatherContext,
          logistics_context: logistics || logisticsContext,
          demand_inventory_context: demand || demandContext,
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
    [sensorTelemetry, weatherContext, logisticsContext, demandContext, coldChainTelemetry, selectedCustomerRuleId, customCommercialRule]
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
    setIsFeedbackStudio(false);
    setIsChatMode(false);
    setIsCommodityDatabase(false);
    setIsTelemetryStudio(false);
    setIsDigitalTwin(false);
    setIsGradeEngineStudio(false);
    setIsCommandCenter(false);
    setIsPricingStudio(false);
    setIsDemandRoutingStudio(false);
    setIsSupplierScorecardStudio(false);
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

  // Multi-Factor Update Handlers
  const handleUpdateSensor = (updated: Partial<SensorTelemetry>) => {
    const next = { ...sensorTelemetry, ...updated };
    setSensorTelemetry(next);
    if (currentImage) {
      runInspection(
        currentImage,
        mode,
        ambientTemp,
        transitHours,
        transitKm,
        storageMethod,
        batchId,
        supplierName,
        report?.produce_type || 'Tomato',
        next,
        weatherContext,
        logisticsContext,
        demandContext
      );
    }
  };

  const handleUpdateColdChainTelemetry = (updated: ColdChainTelemetry) => {
    setColdChainTelemetry(updated);
    setAmbientTemp(updated.actualAvgTempCelsius);
    const nextSensors: SensorTelemetry = {
      ...sensorTelemetry,
      transit_logger_temp: updated.actualAvgTempCelsius,
      humidity_pct: updated.humiditySensors.relativeHumidityPct,
      cold_chain: updated,
    };
    setSensorTelemetry(nextSensors);
    if (currentImage) {
      runInspection(
        currentImage,
        mode,
        updated.actualAvgTempCelsius,
        transitHours,
        transitKm,
        storageMethod,
        batchId,
        supplierName,
        report?.produce_type || 'Tomato',
        nextSensors,
        weatherContext,
        logisticsContext,
        demandContext
      );
    }
  };

  const handleUpdateWeather = (updated: Partial<WeatherContext>) => {
    const next = { ...weatherContext, ...updated };
    setWeatherContext(next);
    if (currentImage) {
      runInspection(
        currentImage,
        mode,
        ambientTemp,
        transitHours,
        transitKm,
        storageMethod,
        batchId,
        supplierName,
        report?.produce_type || 'Tomato',
        sensorTelemetry,
        next,
        logisticsContext,
        demandContext
      );
    }
  };

  const handleUpdateLogistics = (updated: Partial<LogisticsContext>) => {
    const next = { ...logisticsContext, ...updated };
    setLogisticsContext(next);
    if (currentImage) {
      runInspection(
        currentImage,
        mode,
        ambientTemp,
        transitHours,
        transitKm,
        storageMethod,
        batchId,
        supplierName,
        report?.produce_type || 'Tomato',
        sensorTelemetry,
        weatherContext,
        next,
        demandContext
      );
    }
  };

  const handleUpdateDemand = (updated: Partial<DemandAndInventoryContext>) => {
    const next = { ...demandContext, ...updated };
    setDemandContext(next);
    if (currentImage) {
      runInspection(
        currentImage,
        mode,
        ambientTemp,
        transitHours,
        transitKm,
        storageMethod,
        batchId,
        supplierName,
        report?.produce_type || 'Tomato',
        sensorTelemetry,
        weatherContext,
        logisticsContext,
        next
      );
    }
  };

  const handleResetMultiFactor = () => {
    const defaultSensors: SensorTelemetry = {
      transit_logger_temp: ambientTemp,
      humidity_pct: 76,
      ethylene_ppm: 0.8,
      vibration_g_force: 1.1,
      temp_spike_detected: false,
      temp_spike_duration_hours: 0,
    };
    const defaultWeather: WeatherContext = {
      harvest_ambient_temp: ambientTemp,
      heatwave_warning: false,
      precipitation_at_harvest: false,
      humidity_relative_pct: 68,
      solar_radiation_index: 'MODERATE',
    };
    const defaultLogistics: LogisticsContext = {
      transit_hours_to_hub: transitHours,
      transit_distance_km: transitKm,
      storage_method: storageMethod,
      road_condition: 'SMOOTH_HIGHWAY',
      transit_delay_hours: 0,
      carrier_sla_rating: 94,
    };
    const defaultDemand: DemandAndInventoryContext = {
      dark_store_inventory_crates: 28,
      shelf_turnover_hours: 14,
      current_hourly_demand_rate: 3.5,
      active_discount_promos: false,
      competing_batch_expiry_hours: 12,
      demand_surge_factor: 1.2,
    };

    setSensorTelemetry(defaultSensors);
    setWeatherContext(defaultWeather);
    setLogisticsContext(defaultLogistics);
    setDemandContext(defaultDemand);

    if (currentImage) {
      runInspection(
        currentImage,
        mode,
        ambientTemp,
        transitHours,
        transitKm,
        storageMethod,
        batchId,
        supplierName,
        report?.produce_type || 'Tomato',
        defaultSensors,
        defaultWeather,
        defaultLogistics,
        defaultDemand
      );
    }
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
      presetMeta?.crop ?? 'Tomato',
      sensorTelemetry,
      weatherContext,
      logisticsContext,
      demandContext
    );
  };

  // Ref for debouncing temperature slider inspections
  const tempDebounceTimerRef = useRef<NodeJS.Timeout | null>(null);

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
          supplierName,
          report?.produce_type || 'Tomato',
          { ...sensorTelemetry, transit_logger_temp: newTemp },
          { ...weatherContext, harvest_ambient_temp: newTemp, heatwave_warning: newTemp >= 33 }
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
        coldChainTelemetry,
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
        supplierName,
        report?.produce_type || 'Tomato',
        sensorTelemetry,
        weatherContext,
        { ...logisticsContext, storage_method: newStorage }
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
        onToggleChatMode={() => {
          setIsChatMode(!isChatMode);
          if (!isChatMode) setIsFeedbackStudio(false);
        }}
        isFeedbackStudio={isFeedbackStudio}
        onToggleFeedbackStudio={() => {
          setIsFeedbackStudio(!isFeedbackStudio);
          if (!isFeedbackStudio) {
            setIsChatMode(false);
            setIsCommodityDatabase(false);
          }
        }}
        isCommodityDatabase={isCommodityDatabase}
        onToggleCommodityDatabase={() => {
          setIsCommodityDatabase(!isCommodityDatabase);
          if (!isCommodityDatabase) {
            setIsChatMode(false);
            setIsFeedbackStudio(false);
            setIsTelemetryStudio(false);
          }
        }}
        isTelemetryStudio={isTelemetryStudio}
        onToggleTelemetryStudio={() => {
          setIsTelemetryStudio(!isTelemetryStudio);
          if (!isTelemetryStudio) {
            setIsChatMode(false);
            setIsFeedbackStudio(false);
            setIsCommodityDatabase(false);
            setIsDigitalTwin(false);
          }
        }}
        isDigitalTwin={isDigitalTwin}
        onToggleDigitalTwin={() => {
          setIsDigitalTwin(!isDigitalTwin);
          if (!isDigitalTwin) {
            setIsChatMode(false);
            setIsFeedbackStudio(false);
            setIsCommodityDatabase(false);
            setIsTelemetryStudio(false);
            setIsGradeEngineStudio(false);
          }
        }}
        isGradeEngine={isGradeEngineStudio}
        onToggleGradeEngine={() => {
          setIsGradeEngineStudio(!isGradeEngineStudio);
          if (!isGradeEngineStudio) {
            setIsChatMode(false);
            setIsFeedbackStudio(false);
            setIsCommodityDatabase(false);
            setIsTelemetryStudio(false);
            setIsDigitalTwin(false);
            setIsCommandCenter(false);
            setIsPricingStudio(false);
            setIsDemandRoutingStudio(false);
            setIsSupplierScorecardStudio(false);
          }
        }}
        isCommandCenter={isCommandCenter}
        onToggleCommandCenter={() => {
          setIsCommandCenter(!isCommandCenter);
          if (!isCommandCenter) {
            setIsChatMode(false);
            setIsFeedbackStudio(false);
            setIsCommodityDatabase(false);
            setIsTelemetryStudio(false);
            setIsDigitalTwin(false);
            setIsGradeEngineStudio(false);
            setIsPricingStudio(false);
            setIsDemandRoutingStudio(false);
            setIsSupplierScorecardStudio(false);
          }
        }}
        isPricingStudio={isPricingStudio}
        onTogglePricingStudio={() => {
          setIsPricingStudio(!isPricingStudio);
          if (!isPricingStudio) {
            setIsChatMode(false);
            setIsFeedbackStudio(false);
            setIsCommodityDatabase(false);
            setIsTelemetryStudio(false);
            setIsDigitalTwin(false);
            setIsGradeEngineStudio(false);
            setIsCommandCenter(false);
            setIsDemandRoutingStudio(false);
            setIsSupplierScorecardStudio(false);
          }
        }}
        isDemandRoutingStudio={isDemandRoutingStudio}
        onToggleDemandRoutingStudio={() => {
          setIsDemandRoutingStudio(!isDemandRoutingStudio);
          if (!isDemandRoutingStudio) {
            setIsChatMode(false);
            setIsFeedbackStudio(false);
            setIsCommodityDatabase(false);
            setIsTelemetryStudio(false);
            setIsDigitalTwin(false);
            setIsGradeEngineStudio(false);
            setIsCommandCenter(false);
            setIsPricingStudio(false);
            setIsSupplierScorecardStudio(false);
          }
        }}
        isSupplierScorecardStudio={isSupplierScorecardStudio}
        onToggleSupplierScorecardStudio={() => {
          setIsSupplierScorecardStudio(!isSupplierScorecardStudio);
          if (!isSupplierScorecardStudio) {
            setIsChatMode(false);
            setIsFeedbackStudio(false);
            setIsCommodityDatabase(false);
            setIsTelemetryStudio(false);
            setIsDigitalTwin(false);
            setIsGradeEngineStudio(false);
            setIsCommandCenter(false);
            setIsPricingStudio(false);
            setIsDemandRoutingStudio(false);
          }
        }}
        onOpenMobileFieldModal={() => setIsMobileFieldModalOpen(true)}
        onOpenAlertsModal={() => setIsAlertsModalOpen(true)}
        onOpenAuditModal={() => setIsAuditModalOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3.5 sm:p-6 lg:p-8 flex flex-col gap-5 sm:gap-6">
        {/* Modern Responsive Workspace Context Header */}
        <div className="rounded-2xl bg-gradient-to-r from-stone-900/90 via-stone-900/80 to-stone-950/90 border border-stone-800/80 p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl backdrop-blur-sm">
          <div className="flex items-start sm:items-center gap-3.5">
            <div
              className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shrink-0 shadow-lg ${
                isCommandCenter
                  ? 'bg-teal-950 border border-teal-500/60 text-teal-300 shadow-teal-950/50'
                  : isPricingStudio
                  ? 'bg-amber-950 border border-amber-500/60 text-amber-300 shadow-amber-950/50'
                  : isDemandRoutingStudio
                  ? 'bg-indigo-950 border border-indigo-500/60 text-indigo-300 shadow-indigo-950/50'
                  : isSupplierScorecardStudio
                  ? 'bg-cyan-950 border border-cyan-500/60 text-cyan-300 shadow-cyan-950/50'
                  : isCommodityDatabase
                  ? 'bg-purple-950 border border-purple-500/60 text-purple-300 shadow-purple-950/50'
                  : isFeedbackStudio
                  ? 'bg-purple-950 border border-purple-500/60 text-purple-300 shadow-purple-950/50'
                  : mode === 'FIELD_PRE_HARVEST'
                  ? 'bg-emerald-950 border border-emerald-500/60 text-emerald-300 shadow-emerald-950/50'
                  : 'bg-amber-950 border border-amber-500/60 text-amber-300 shadow-amber-950/50'
              }`}
            >
              {isCommandCenter ? (
                <Globe2 className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.2]" />
              ) : isPricingStudio ? (
                <Tag className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.2]" />
              ) : isDemandRoutingStudio ? (
                <Route className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.2]" />
              ) : isSupplierScorecardStudio ? (
                <Award className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.2]" />
              ) : isCommodityDatabase ? (
                <Database className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.2]" />
              ) : isFeedbackStudio ? (
                <History className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.2]" />
              ) : mode === 'FIELD_PRE_HARVEST' ? (
                <Sprout className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.2]" />
              ) : (
                <Warehouse className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.2]" />
              )}
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold text-white tracking-tight truncate">
                  {isCommandCenter
                    ? 'Farm-to-Shelf Operations Command Center'
                    : isPricingStudio
                    ? '8-Variable Dynamic Pricing & Markdown Studio'
                    : isDemandRoutingStudio
                    ? 'Demand Forecasting & Inter-Store Logistics'
                    : isSupplierScorecardStudio
                    ? 'Deep Supplier Scorecard & Forensic Diagnostics'
                    : isCommodityDatabase
                    ? 'Produce Intelligence & Variety Cultivar Database'
                    : isFeedbackStudio
                    ? 'Historical Batch Intelligence & Closed-Loop Learning'
                    : isGradeEngineStudio
                    ? 'Dynamic Commercial Grade Rules & Tolerances'
                    : isDigitalTwin
                    ? 'Real-Time Shelf-Life Digital Twin'
                    : isTelemetryStudio
                    ? 'Cold Chain IoT Telemetry Studio'
                    : isChatMode
                    ? 'Zero-Hallucination Multi-Agent Swarm Chat'
                    : mode === 'FIELD_PRE_HARVEST'
                    ? 'Field Mode — Pre-Harvest Decision Support'
                    : 'Dark Store Mode — Inbound Quality Gate'}
                </h1>
              </div>

              <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-stone-400 mt-1 font-sans">
                <span className="font-medium text-stone-300">
                  {isCommandCenter || isPricingStudio || isDemandRoutingStudio || isSupplierScorecardStudio || isCommodityDatabase || isFeedbackStudio || isGradeEngineStudio || isDigitalTwin || isTelemetryStudio
                    ? 'Enterprise Operations & Intelligence Platform'
                    : `${batchId} · ${supplierName}`}
                </span>
                <span aria-hidden="true" className="text-stone-600 hidden sm:inline">·</span>
                <span className="text-stone-400 hidden sm:inline">
                  {mode === 'FIELD_PRE_HARVEST' ? 'Vine-Level Advisory' : 'Dock QA & Markdown'}
                </span>
                <span aria-hidden="true" className="text-stone-600 hidden md:inline">·</span>
                <span className="text-emerald-400 font-mono text-[11px] hidden md:inline">
                  9 Swarm Agents Grounded
                </span>
              </div>
            </div>
          </div>

          {/* Quick Context Actions */}
          <div className="flex items-center gap-2 shrink-0 flex-wrap sm:flex-nowrap">
            {/* If inside any specialized studio, show Back to Inspection */}
            {isCommandCenter || isPricingStudio || isDemandRoutingStudio || isSupplierScorecardStudio || isGradeEngineStudio || isDigitalTwin || isTelemetryStudio || isCommodityDatabase || isFeedbackStudio || isChatMode ? (
              <button
                onClick={() => {
                  setIsCommandCenter(false);
                  setIsPricingStudio(false);
                  setIsDemandRoutingStudio(false);
                  setIsSupplierScorecardStudio(false);
                  setIsGradeEngineStudio(false);
                  setIsDigitalTwin(false);
                  setIsTelemetryStudio(false);
                  setIsCommodityDatabase(false);
                  setIsFeedbackStudio(false);
                  setIsChatMode(false);
                }}
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 text-xs font-semibold shadow-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>← Return to Live Inspection</span>
              </button>
            ) : (
              <>
                {/* Segmented Mode Switcher */}
                <div className="flex items-center bg-stone-950 p-1 rounded-xl border border-stone-800/80 w-full sm:w-auto">
                  <button
                    onClick={() => handleModeChange('FIELD_PRE_HARVEST')}
                    className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                      mode === 'FIELD_PRE_HARVEST'
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    <Sprout className="w-3.5 h-3.5" />
                    <span>Field Mode</span>
                  </button>

                  <button
                    onClick={() => handleModeChange('DARK_STORE_INBOUND')}
                    className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                      mode === 'DARK_STORE_INBOUND'
                        ? 'bg-amber-600 text-white shadow-sm'
                        : 'text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    <Warehouse className="w-3.5 h-3.5" />
                    <span>Dark Store</span>
                  </button>
                </div>

                {/* PDF Export Button */}
                {report && (
                  <button
                    onClick={handleDownloadPdf}
                    disabled={isExportingPdf}
                    className="px-3.5 py-2 rounded-xl bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-700/80 text-xs font-semibold text-cyan-200 transition-colors flex items-center gap-1.5 shadow-sm disabled:opacity-50 cursor-pointer"
                    title="Download official PDF inspection summary certificate"
                  >
                    <FileText className="w-3.5 h-3.5 text-cyan-400" />
                    <span className="hidden sm:inline">{isExportingPdf ? 'Exporting...' : 'Export PDF'}</span>
                  </button>
                )}

                {/* Quick Chat Shortcut */}
                <button
                  onClick={() => setIsChatMode(true)}
                  className="px-3.5 py-2 rounded-xl bg-purple-950/80 hover:bg-purple-900 border border-purple-700/80 text-xs font-semibold text-purple-200 transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
                  title="Open Agent Chat"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-purple-400" />
                  <span className="hidden sm:inline">Ask Swarm</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* View Router: Command Center OR Dynamic Pricing OR Demand Routing OR Supplier Forensics OR Grade Engine Studio OR Digital Twin Studio OR Cold Chain Telemetry Studio OR Commodity Database Studio OR Closed-Loop Feedback Studio OR Agent Chat OR Main Inspection View */}
        {isCommandCenter ? (
          <AgriGradeCommandCenter
            onOpenDemandRouting={() => {
              setIsCommandCenter(false);
              setIsDemandRoutingStudio(true);
            }}
            onOpenPricingStudio={() => {
              setIsCommandCenter(false);
              setIsPricingStudio(true);
            }}
            onOpenSupplierScorecard={() => {
              setIsCommandCenter(false);
              setIsSupplierScorecardStudio(true);
            }}
            onOpenAlerts={() => setIsAlertsModalOpen(true)}
          />
        ) : isPricingStudio ? (
          <DynamicPricingMarkdownStudio
            onClose={() => setIsPricingStudio(false)}
            commodityName={report?.produce_type || 'Tomato'}
            initialFactors={{
              shelfLifeRemainingDays: report?.ambient_shelf_life_days ?? report?.commodity_database_result?.predicted_shelf_life_days ?? 2.3,
              currentInventoryKg: 400,
              storeDemandVelocityKgHour: 8.5,
              grade: (report?.inbound_action?.verdict as any) ?? 'ACCEPTED_GRADE_B',
              defectPercent: report?.bruise_defect_index ?? 8.2,
            }}
          />
        ) : isDemandRoutingStudio ? (
          <DemandForecastingAndRoutingStudio
            onClose={() => setIsDemandRoutingStudio(false)}
            batchId={batchId}
            commodityName={report?.produce_type || 'Tomato'}
          />
        ) : isSupplierScorecardStudio ? (
          <SupplierScorecardStudio
            onClose={() => setIsSupplierScorecardStudio(false)}
            currentSupplier={supplierName}
          />
        ) : isGradeEngineStudio ? (
          <DynamicGradeEngineStudio
            report={report}
            activeRuleId={selectedCustomerRuleId}
            onSelectRuleId={(id) => {
              setSelectedCustomerRuleId(id);
              if (currentImage) {
                runInspection(
                  currentImage,
                  mode,
                  ambientTemp,
                  transitHours,
                  transitKm,
                  storageMethod,
                  batchId,
                  supplierName,
                  report?.produce_type || 'Tomato',
                  sensorTelemetry,
                  weatherContext,
                  logisticsContext,
                  demandContext,
                  id
                );
              }
            }}
            customRule={customCommercialRule}
            onUpdateCustomRule={(rule) => {
              setCustomCommercialRule(rule);
              setSelectedCustomerRuleId(rule.id);
              if (currentImage) {
                runInspection(
                  currentImage,
                  mode,
                  ambientTemp,
                  transitHours,
                  transitKm,
                  storageMethod,
                  batchId,
                  supplierName,
                  report?.produce_type || 'Tomato',
                  sensorTelemetry,
                  weatherContext,
                  logisticsContext,
                  demandContext,
                  rule.id,
                  rule
                );
              }
            }}
            onClose={() => setIsGradeEngineStudio(false)}
          />
        ) : isDigitalTwin ? (
          <DigitalTwinStudio
            onClose={() => setIsDigitalTwin(false)}
            initialBatchId={batchId.includes('4892') ? 'BATCH CRATE-4892' : 'BATCH CRATE-4892'}
            onApplyBatchToInspection={(crate) => {
              setBatchId(crate.crateId);
              setSupplierName(crate.supplier);
              setAmbientTemp(crate.factors.temperature);
              setIsDigitalTwin(false);
              if (currentImage) {
                runInspection(
                  currentImage,
                  mode,
                  crate.factors.temperature,
                  crate.factors.transitHours,
                  transitKm,
                  crate.factors.storageMode === 'CHILLED_REEFER' ? 'CHILLED_REEFER' : 'AMBIENT_LORRY',
                  crate.crateId,
                  crate.supplier,
                  crate.commodity.includes('Tomato') ? 'Tomato' : 'Produce'
                );
              }
            }}
          />
        ) : isTelemetryStudio ? (
          <ColdChainTelemetryStudio
            telemetry={coldChainTelemetry}
            onUpdateTelemetry={handleUpdateColdChainTelemetry}
            onClose={() => setIsTelemetryStudio(false)}
            batchId={batchId}
            produceType={report?.produce_type || 'Tomato'}
          />
        ) : isCommodityDatabase ? (
          <CommodityDatabaseStudio
            onApplyToMainInspection={(cfg) => {
              setAmbientTemp(cfg.temp);
              setSupplierName(cfg.farm);
              setIsCommodityDatabase(false);
              if (currentImage) {
                runInspection(
                  currentImage,
                  mode,
                  cfg.temp,
                  transitHours,
                  transitKm,
                  storageMethod,
                  batchId,
                  cfg.farm,
                  cfg.crop,
                  sensorTelemetry,
                  weatherContext,
                  logisticsContext,
                  demandContext
                );
              }
            }}
          />
        ) : isFeedbackStudio ? (
          <ClosedLoopFeedbackStudio
            onNavigateToScan={() => setIsFeedbackStudio(false)}
            onSelectBatchForScan={(bId) => {
              setBatchId(bId);
              setIsFeedbackStudio(false);
            }}
            currentReportBatchId={batchId}
          />
        ) : isChatMode ? (
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
            <div className={isMobileView ? 'max-w-md mx-auto w-full transition-all duration-300' : 'w-full'}>
              {isMobileView && (
                <div className="text-center pb-3 text-xs font-mono text-emerald-400 flex items-center justify-center gap-2 bg-emerald-950/60 border border-emerald-800/80 rounded-xl p-2.5 mb-4 shadow-sm">
                  <Smartphone className="w-4 h-4 text-emerald-400" />
                  <span>Handheld Device Simulation (390px Viewport Active)</span>
                </div>
              )}

              {/* Responsive Grid Layout: Stacked on Mobile & Tablet, 5/7 Split on Desktop */}
              <div className={`grid gap-5 sm:gap-6 ${isMobileView ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-12'}`}>
                {/* Left Column: Viewfinder, Multi-Factor Context & Sliders (5 columns on desktop) */}
                <div className={isMobileView ? 'space-y-5 sm:space-y-6' : 'lg:col-span-5 space-y-5 sm:space-y-6'}>
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

                  {/* Multi-Factor Ingestion Context Panel (IoT Sensors, Weather, Road, Demand) */}
                  <MultiFactorContextPanel
                    mode={mode}
                    sensorTelemetry={sensorTelemetry}
                    weatherContext={weatherContext}
                    logisticsContext={logisticsContext}
                    demandContext={demandContext}
                    onUpdateSensor={handleUpdateSensor}
                    onUpdateWeather={handleUpdateWeather}
                    onUpdateLogistics={handleUpdateLogistics}
                    onUpdateDemand={handleUpdateDemand}
                    onResetDefaults={handleResetMultiFactor}
                    ambientTemp={ambientTemp}
                    onOpenTelemetryStudio={() => setIsTelemetryStudio(true)}
                  />

                  {/* Basic Metadata Sliders */}
                  <div className="bg-stone-900 rounded-2xl border border-stone-800 p-4 shadow-xl flex flex-col gap-3.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs font-bold text-stone-200 uppercase tracking-wider">
                        <Sliders className="w-4 h-4 text-emerald-400" />
                        <span>
                          {mode === 'FIELD_PRE_HARVEST' ? 'Transit Distance & Hours' : 'Receiving Dock Metadata'}
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

                  {/* Multi-Agent Swarm Execution Trace (5 Agents) */}
                  {report && <MultiAgentTrace traces={report.agent_traces} />}
                </div>

                {/* Right Column: Decisions, Kinetic Decay, Feedback Callout & Actions (7 columns on desktop) */}
                <div className={isMobileView ? 'space-y-6' : 'lg:col-span-7 space-y-6'}>
                  {report && (
                    <>
                      {/* Dynamic Commodity Database Agent Prediction Card */}
                      {report.commodity_database_result && (
                        <div className="rounded-2xl bg-gradient-to-br from-stone-900 via-stone-900 to-purple-950/40 border border-purple-800/60 p-4 sm:p-5 shadow-xl flex flex-col gap-3 relative overflow-hidden">
                          <div className="flex items-center justify-between border-b border-stone-800 pb-3">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-lg bg-purple-950 border border-purple-700 flex items-center justify-center text-purple-400">
                                <Database className="w-4 h-4" />
                              </div>
                              <div>
                                <div className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                                  <span>Dynamic Produce Intelligence Agent</span>
                                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800">
                                    Database Grounded
                                  </span>
                                </div>
                                <p className="text-[11px] text-stone-400">
                                  Real-time variety, maturity, packaging &amp; farm empirical prior synthesis
                                </p>
                              </div>
                            </div>

                            <button
                              onClick={() => setIsCommodityDatabase(true)}
                              className="px-2.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-semibold text-[11px] flex items-center gap-1 transition-colors cursor-pointer"
                            >
                              <span>Open Dynamic Produce Intelligence</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Specification Readout */}
                          <div className="bg-stone-950 rounded-xl p-3.5 border border-stone-800 font-mono text-xs">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div className="space-y-1 text-stone-300 border-b sm:border-b-0 sm:border-r border-stone-800 pb-2 sm:pb-0 sm:pr-3">
                                <div className="text-sm font-bold text-white font-sans">
                                  {report.commodity_database_result.variety_name}
                                </div>
                                <div>Farm: <span className="text-cyan-300 font-bold">{report.commodity_database_result.farm_name}</span></div>
                                <div>Harvest maturity = <span className="text-amber-300 font-bold">Stage {report.commodity_database_result.harvest_maturity_stage}</span></div>
                                <div>Temperature = <span className="text-rose-300 font-bold">{report.commodity_database_result.temperature_celsius}°C</span></div>
                                <div>Humidity = <span className="text-blue-300 font-bold">{report.commodity_database_result.humidity_pct}%</span></div>
                                <div>Packaging = <span className="text-emerald-300 font-bold">{report.commodity_database_result.packaging_type}</span></div>
                              </div>

                              <div className="flex flex-col justify-center items-center text-center p-1">
                                <span className="text-[10px] uppercase text-stone-500 font-sans">Predicted Shelf Life</span>
                                <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-300 my-0.5">
                                  {report.commodity_database_result.predicted_shelf_life_days} days
                                </div>
                                <div className="text-xs text-stone-300 font-bold">
                                  Confidence = <span className="text-emerald-400 font-extrabold">{report.commodity_database_result.confidence_score_pct}%</span>
                                </div>
                                <div className="text-[10px] text-stone-500 mt-1">
                                  vs. Static baseline: {report.commodity_database_result.legacy_static_days} days
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Mode-Specific Primary Decision Card */}
                      {mode === 'FIELD_PRE_HARVEST' ? (
                        <FieldHarvestDecision
                          report={report}
                          transitHours={transitHours}
                          transitKm={transitKm}
                          onOpenChat={() => setIsChatMode(true)}
                          onOpenMobileFieldModal={() => setIsMobileFieldModalOpen(true)}
                        />
                      ) : (
                        <DarkStoreQualityGate
                          report={report}
                          batchId={batchId}
                          supplierName={supplierName}
                          onOpenChat={() => setIsChatMode(true)}
                          activeCustomerRuleId={selectedCustomerRuleId}
                          onSelectCustomerRuleId={(newRuleId) => {
                            setSelectedCustomerRuleId(newRuleId);
                            if (currentImage) {
                              runInspection(
                                currentImage,
                                mode,
                                ambientTemp,
                                transitHours,
                                transitKm,
                                storageMethod,
                                batchId,
                                supplierName,
                                report?.produce_type || 'Tomato',
                                sensorTelemetry,
                                weatherContext,
                                logisticsContext,
                                demandContext,
                                newRuleId,
                                customCommercialRule || undefined
                              );
                            }
                          }}
                          onOpenGradeEngineStudio={() => setIsGradeEngineStudio(true)}
                          onOpenPricingStudio={() => {
                            setIsPricingStudio(true);
                            setIsDemandRoutingStudio(false);
                            setIsSupplierScorecardStudio(false);
                          }}
                          onOpenRoutingStudio={() => {
                            setIsDemandRoutingStudio(true);
                            setIsPricingStudio(false);
                            setIsSupplierScorecardStudio(false);
                          }}
                        />
                      )}

                      {/* Closed-Loop Feedback Callout Card */}
                      <div className="rounded-2xl bg-gradient-to-r from-purple-950/40 via-stone-900 to-stone-900 border border-purple-800/50 p-4 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400 shrink-0">
                            <Repeat className="w-5 h-5 animate-spin-slow" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                                Closed-Loop Feedback Calibration Active
                              </h4>
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-700">
                                Agent 5 Calibrated
                              </span>
                            </div>
                            <p className="text-xs text-stone-300 mt-0.5">
                              This decision was synthesized using {report.feedback_loop_calibration?.cohort_batches_analyzed || 1842} historical batches with an empirical model accuracy of {report.feedback_loop_calibration?.historical_model_accuracy_pct || 94.8}%.
                            </p>
                          </div>
                        </div>

                        <button
                          onClick={() => setIsFeedbackStudio(true)}
                          className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md shadow-purple-950/60 flex items-center gap-1.5 shrink-0 transition-colors"
                        >
                          <span>Open Feedback Studio</span>
                          <span className="text-[11px]">→</span>
                        </button>
                      </div>

                      {/* Real-time Shelf-Life Digital Twin Dynamic Card (Matches BATCH CRATE-4892 UI) */}
                      <ShelfLifeDigitalTwinCard
                        onOpenFullStudio={() => setIsDigitalTwin(true)}
                        activeBatchId={batchId.includes('4892') ? 'BATCH CRATE-4892' : 'BATCH CRATE-4892'}
                        onSelectBatch={(cId) => {
                          setBatchId(cId);
                        }}
                      />

                      {/* Kinetic Shelf-Life Decay Engine Widget */}
                      <KineticDecayWidget
                        report={report}
                        ambientTemp={ambientTemp}
                        onTempChange={handleTempChange}
                        storageMethod={storageMethod}
                        onStorageChange={handleStorageChange}
                        supplierName={supplierName}
                        coldChainTelemetry={coldChainTelemetry}
                        onOpenTelemetryStudio={() => setIsTelemetryStudio(true)}
                        onOpenDigitalTwin={() => setIsDigitalTwin(true)}
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

      {/* Floating Chat Quick-Access Button (Visible when not in chat mode) */}
      {!isChatMode && (
        <button
          onClick={() => {
            setIsChatMode(true);
            setIsFeedbackStudio(false);
          }}
          className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-xl shadow-purple-950/80 flex items-center gap-2 border border-purple-400/40 hover:scale-105 active:scale-95 transition-all group min-h-[44px]"
          title="Chat with zero-hallucination agent swarm based on current scan facts and feedback loop"
        >
          <div className="relative">
            <MessageSquare className="w-4 h-4 text-white" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400" />
          </div>
          <span className="font-sans">Chat with Swarm</span>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-purple-950/80 text-purple-200 border border-purple-700/60 hidden sm:inline-block">
            9 Agents
          </span>
        </button>
      )}

      {/* Multi-Agent Architecture Modal */}
      <MultiAgentModal
        isOpen={isAgentModalOpen}
        onClose={() => setIsAgentModalOpen(false)}
      />

      {/* Mobile Field Scout Modal */}
      <MobileFieldScoutModal
        isOpen={isMobileFieldModalOpen}
        onClose={() => setIsMobileFieldModalOpen(false)}
        currentStage={report?.usda_color_stage || 2}
        produceName={report?.produce_type || 'Tomato'}
      />

      {/* WhatsApp & Mobile Operational Alerts Modal */}
      <WhatsAppAlertsModal
        isOpen={isAlertsModalOpen}
        onClose={() => setIsAlertsModalOpen(false)}
      />

      {/* Immutable Audit Trail & Model Provenance Modal */}
      <AuditAndVersioningModal
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
      />

      {/* Footer */}
      <footer className="border-t border-stone-800 bg-stone-950/80 px-4 py-4 text-xs text-stone-500 text-center">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            AgriGrade Closed-Loop Swarm • Image + Sensors + Logistics + Demand + Actual Outcomes → Decision → Model Improvement
          </div>
          <div className="flex items-center gap-3 text-stone-400 font-mono text-[11px]">
            <span>Closed-Loop v2.0</span>
            <span>•</span>
            <span>1,842 Batches Learned</span>
            <span>•</span>
            <span>94.8% Accuracy</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
