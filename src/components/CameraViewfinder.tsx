import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  Camera,
  RefreshCw,
  Upload,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Eye,
  Image as ImageIcon,
  Crosshair,
  QrCode,
  ScanLine,
  Tag,
  Building2,
  Check,
  CheckCircle,
  Zap,
} from 'lucide-react';
import { PRESET_SAMPLES, type ProducePreset } from '../data/presets';
import { parseCrateQrData, scanCanvasForQr, SAMPLE_CRATE_QRS, type ParsedCrateQr } from '../utils/qrScanner';
import type { InspectionMode } from '../types';

interface CameraViewfinderProps {
  mode: InspectionMode;
  currentImage: string | null;
  onImageCaptured: (base64: string, presetMeta?: Partial<ProducePreset>) => void;
  onCrateQrParsed?: (data: ParsedCrateQr) => void;
  isProcessing: boolean;
  selectedPresetId: string | null;
  currentBatchId?: string;
  currentSupplier?: string;
}

export const CameraViewfinder: React.FC<CameraViewfinderProps> = ({
  mode,
  currentImage,
  onImageCaptured,
  onCrateQrParsed,
  isProcessing,
  selectedPresetId,
  currentBatchId,
  currentSupplier,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const qrCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [sharpnessScore, setSharpnessScore] = useState<number>(138); // Simulated Laplacian variance

  // Viewfinder Overlay Mode: Produce Grading vs QR Crate Scanner
  const [viewfinderFocus, setViewfinderFocus] = useState<'PRODUCE' | 'QR_CODE'>(
    mode === 'DARK_STORE_INBOUND' ? 'PRODUCE' : 'PRODUCE'
  );

  // QR Scanning Telemetry State
  const [lastDetectedQr, setLastDetectedQr] = useState<ParsedCrateQr | null>(null);
  const [qrJustScanned, setQrJustScanned] = useState<boolean>(false);
  const [laserY, setLaserY] = useState<number>(15);

  // Animated laser scan effect in QR mode
  useEffect(() => {
    if (viewfinderFocus !== 'QR_CODE') return;
    const interval = setInterval(() => {
      setLaserY((prev) => (prev >= 85 ? 15 : prev + 7));
    }, 120);
    return () => clearInterval(interval);
  }, [viewfinderFocus]);

  // Filter presets based on current mode
  const relevantPresets = PRESET_SAMPLES.filter(
    (p) => p.mode === mode || (mode === 'FIELD_PRE_HARVEST' && p.crop === 'Tomato')
  );

  // Start live webcam
  const startCamera = async () => {
    setCameraError(null);
    try {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setIsCameraActive(true);
      }
    } catch (err: any) {
      console.warn('Camera access notice:', err);
      setCameraError('Camera access not active. Use presets or upload a crate/produce photo below.');
      setIsCameraActive(false);
    }
  };

  // Stop camera
  const stopCamera = useCallback(() => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  }, []);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  // Handle successful QR detection
  const handleQrDetected = useCallback(
    (parsed: ParsedCrateQr) => {
      setLastDetectedQr(parsed);
      setQrJustScanned(true);
      if (onCrateQrParsed) {
        onCrateQrParsed(parsed);
      }
      setTimeout(() => {
        setQrJustScanned(false);
      }, 3500);
    },
    [onCrateQrParsed]
  );

  // Live video frame scanning for QR codes when in QR_CODE focus mode
  useEffect(() => {
    if (!isCameraActive || viewfinderFocus !== 'QR_CODE') return;

    const interval = setInterval(() => {
      if (!videoRef.current || !qrCanvasRef.current) return;
      const video = videoRef.current;
      if (video.readyState < 2) return;

      const canvas = qrCanvasRef.current;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) return;

      // Sample a scaled down frame for fast decoding
      canvas.width = 480;
      canvas.height = 360;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const parsed = scanCanvasForQr(canvas);
      if (parsed) {
        handleQrDetected(parsed);
      }
    }, 280);

    return () => clearInterval(interval);
  }, [isCameraActive, viewfinderFocus, handleQrDetected]);

  // Capture frame from active camera stream
  const captureFrame = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Check if this frame also contains a QR code
      const parsedQr = scanCanvasForQr(canvas);
      if (parsedQr) {
        handleQrDetected(parsedQr);
      }

      const b64 = canvas.toDataURL('image/jpeg', 0.9);
      stopCamera();
      onImageCaptured(b64);
    }
  };

  // File upload handler - checks for both image grading and QR code data
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const b64 = event.target?.result as string;
      if (b64) {
        stopCamera();

        // Check if uploaded image contains a crate QR code
        const tempImg = new Image();
        tempImg.crossOrigin = 'anonymous';
        tempImg.onload = () => {
          const testCanvas = document.createElement('canvas');
          testCanvas.width = tempImg.width;
          testCanvas.height = tempImg.height;
          const testCtx = testCanvas.getContext('2d', { willReadFrequently: true });
          if (testCtx) {
            testCtx.drawImage(tempImg, 0, 0);
            const parsed = scanCanvasForQr(testCanvas);
            if (parsed) {
              handleQrDetected(parsed);
            }
          }
        };
        tempImg.src = b64;

        onImageCaptured(b64);
      }
    };
    reader.readAsDataURL(file);
  };

  // Switch camera facing
  const toggleFacingMode = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
    if (isCameraActive) {
      setTimeout(() => startCamera(), 100);
    }
  };

  // Simulate scanning a specific crate QR preset label
  const simulateScanQrSample = (sample: (typeof SAMPLE_CRATE_QRS)[0]) => {
    const parsed = parseCrateQrData(sample.payload);
    handleQrDetected(parsed);
  };

  return (
    <div className="bg-stone-900 rounded-2xl border border-stone-800 p-4 shadow-xl flex flex-col gap-4">
      {/* Viewfinder Header with Mode Toggles */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-2">
          <div
            className={`w-2.5 h-2.5 rounded-full ${
              isCameraActive ? 'bg-emerald-400 animate-ping' : 'bg-stone-500'
            }`}
          />
          <h2 className="text-sm font-semibold text-stone-200">
            {mode === 'FIELD_PRE_HARVEST' ? 'Vine-Level Optical Viewfinder' : 'Receiving Dock Optical Gate'}
          </h2>
        </div>

        {/* Reticle Focus Selector: Produce Optical Reticle vs Crate QR Scanner */}
        <div className="flex items-center bg-stone-950 p-1 rounded-xl border border-stone-800 self-start sm:self-auto">
          <button
            onClick={() => setViewfinderFocus('PRODUCE')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              viewfinderFocus === 'PRODUCE'
                ? 'bg-stone-800 text-emerald-400 shadow-sm'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Crosshair className="w-3.5 h-3.5" />
            <span>Produce Reticle</span>
          </button>

          <button
            onClick={() => setViewfinderFocus('QR_CODE')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              viewfinderFocus === 'QR_CODE'
                ? 'bg-cyan-950 border border-cyan-700 text-cyan-300 shadow-sm'
                : 'text-stone-400 hover:text-cyan-300'
            }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>Crate QR Scanner</span>
            {viewfinderFocus === 'QR_CODE' && (
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
            )}
          </button>
        </div>
      </div>

      {/* Main Viewfinder Screen */}
      <div className="relative w-full aspect-[4/3] sm:aspect-[16/10] bg-stone-950 rounded-xl overflow-hidden border border-stone-800 flex items-center justify-center group">
        {/* Hidden video and canvases */}
        <video
          ref={videoRef}
          className={`w-full h-full object-cover ${isCameraActive ? 'block' : 'hidden'}`}
          playsInline
          muted
        />
        <canvas ref={canvasRef} className="hidden" />
        <canvas ref={qrCanvasRef} className="hidden" />

        {/* Display Captured Image if not live */}
        {!isCameraActive && currentImage && (
          <img
            src={currentImage}
            alt="Inspected crop specimen"
            className="w-full h-full object-contain bg-stone-950/80"
          />
        )}

        {/* Empty state when no camera & no image */}
        {!isCameraActive && !currentImage && (
          <div className="text-center p-6 flex flex-col items-center gap-3 text-stone-400">
            <div className="w-14 h-14 rounded-2xl bg-stone-900 border border-stone-800 flex items-center justify-center text-stone-400">
              <Camera className="w-7 h-7" />
            </div>
            <div>
              <p className="text-sm font-medium text-stone-200">No active video feed</p>
              <p className="text-xs text-stone-500 max-w-xs mt-1">
                Start camera for live edge inspection, scan crate QR tags, or select a verified specimen preset.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2 mt-2">
              <button
                onClick={startCamera}
                className="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-2 shadow-md transition-colors"
              >
                <Camera className="w-4 h-4" />
                <span>Launch Camera</span>
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-3.5 py-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 text-xs font-medium flex items-center gap-2 transition-colors"
              >
                <Upload className="w-4 h-4" />
                <span>Upload Photo / QR</span>
              </button>
            </div>
          </div>
        )}

        {/* QR Code Scanner Overlay HUD (When QR_CODE focus is active) */}
        {viewfinderFocus === 'QR_CODE' && (
          <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center z-10">
            {/* Square Target Brackets */}
            <div
              className={`relative w-56 h-56 sm:w-64 sm:h-64 border-2 transition-all rounded-2xl flex items-center justify-center ${
                qrJustScanned
                  ? 'border-emerald-400 shadow-[0_0_25px_rgba(52,211,153,0.4)] bg-emerald-950/20'
                  : 'border-cyan-400/70 shadow-[0_0_15px_rgba(34,211,238,0.2)] bg-cyan-950/10'
              }`}
            >
              {/* Corner Accents */}
              <div className="absolute -top-1.5 -left-1.5 w-6 h-6 border-t-4 border-l-4 border-cyan-300 rounded-tl" />
              <div className="absolute -top-1.5 -right-1.5 w-6 h-6 border-t-4 border-r-4 border-cyan-300 rounded-tr" />
              <div className="absolute -bottom-1.5 -left-1.5 w-6 h-6 border-b-4 border-l-4 border-cyan-300 rounded-bl" />
              <div className="absolute -bottom-1.5 -right-1.5 w-6 h-6 border-b-4 border-r-4 border-cyan-300 rounded-br" />

              {/* Animated Laser Scanning Beam */}
              {!qrJustScanned && (
                <div
                  className="absolute left-2 right-2 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_8px_#22d3ee] transition-all duration-100"
                  style={{ top: `${laserY}%` }}
                />
              )}

              {/* Center Hologram Icon */}
              <div className="text-center flex flex-col items-center gap-1.5">
                {qrJustScanned ? (
                  <CheckCircle2 className="w-12 h-12 text-emerald-400 animate-bounce stroke-[2.5]" />
                ) : (
                  <QrCode className="w-10 h-10 text-cyan-400/80 stroke-1" />
                )}
                <span className="text-[11px] font-mono font-bold tracking-wider px-2 py-0.5 rounded bg-stone-950/90 text-cyan-300 border border-cyan-800">
                  {qrJustScanned ? 'CRATE QR DECODED' : 'CRATE QR CODE SCANNER'}
                </span>
              </div>

              {/* Bottom Instructions Badge */}
              <div className="absolute -bottom-9 px-3 py-1 bg-stone-950/90 backdrop-blur-md rounded-lg border border-cyan-700/60 text-[10px] font-mono text-cyan-200 tracking-wider shadow-lg flex items-center gap-1.5">
                <ScanLine className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                <span>ALIGN CRATE SHIPPING LABEL IN BOX</span>
              </div>
            </div>

            {/* Top QR Scanner Header Badge */}
            <div className="absolute top-3 left-3 right-3 flex items-center justify-between text-[11px] font-mono">
              <div className="px-2.5 py-1 rounded-lg bg-cyan-950/90 backdrop-blur-sm border border-cyan-700 text-cyan-300 flex items-center gap-1.5 shadow-md">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                <span>BARCODE / QR OCR ENGINE: ACTIVE</span>
              </div>
              <div className="px-2.5 py-1 rounded-lg bg-stone-950/90 backdrop-blur-sm border border-stone-800 text-stone-300">
                WMS AUTO-SYNC
              </div>
            </div>
          </div>
        )}

        {/* Optical Produce Reticle (When PRODUCE focus is active) */}
        {viewfinderFocus === 'PRODUCE' && (isCameraActive || currentImage) && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            {/* Elliptical Produce Reticle */}
            <div className="relative w-64 h-64 sm:w-72 sm:h-72 border-2 border-emerald-400/40 rounded-full flex items-center justify-center">
              {/* Corner tick marks */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1.5 w-3 h-1 bg-emerald-400" />
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1.5 w-3 h-1 bg-emerald-400" />
              <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1.5 w-1 h-3 bg-emerald-400" />
              <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1.5 w-1 h-3 bg-emerald-400" />

              {/* Center crosshair */}
              <Crosshair className="w-6 h-6 text-emerald-400/50 stroke-1" />

              {/* Guidance HUD tag */}
              <div className="absolute -bottom-8 px-2.5 py-1 bg-stone-900/85 backdrop-blur-md rounded-md border border-stone-700 text-[10px] font-mono text-emerald-300 tracking-wider">
                {mode === 'FIELD_PRE_HARVEST' ? 'ALIGN VINE CLUSTER' : 'ALIGN CRATE SPECIMEN'}
              </div>
            </div>

            {/* Top HUD Telemetry */}
            <div className="absolute top-3 left-3 right-3 flex items-center justify-between text-[11px] font-mono">
              <div className="px-2 py-1 rounded bg-stone-950/80 backdrop-blur-sm border border-stone-800 text-stone-300 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>SPECTROMETRY: ACTIVE</span>
              </div>
              <div className="px-2 py-1 rounded bg-stone-950/80 backdrop-blur-sm border border-stone-800 text-stone-400">
                MODE: {mode === 'FIELD_PRE_HARVEST' ? 'FIELD_DECISION' : 'DOCK_GATE'}
              </div>
            </div>

            {/* Bottom HUD Guidelines */}
            <div className="absolute bottom-3 left-3 text-[11px] font-mono text-stone-400 bg-stone-950/70 px-2 py-1 rounded border border-stone-800/80">
              ISO: 100 • RES: 1080p • AUTO-EXPOSURE
            </div>
          </div>
        )}

        {/* Real-time Decoded QR Success Banner */}
        {lastDetectedQr && qrJustScanned && (
          <div className="absolute top-12 inset-x-3 bg-emerald-950/95 border border-emerald-500 rounded-xl p-3 shadow-2xl backdrop-blur-md z-20 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500 text-stone-950 flex items-center justify-center shrink-0">
                  <Check className="w-5 h-5 stroke-[3]" />
                </div>
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-wider text-emerald-300 font-bold">
                    Crate Label Auto-Parsed
                  </div>
                  <div className="text-xs font-bold text-white flex items-center gap-2">
                    <span>{lastDetectedQr.batchId}</span>
                    <span className="text-stone-400 font-normal">•</span>
                    <span className="text-emerald-200 font-medium truncate max-w-[160px] sm:max-w-none">
                      {lastDetectedQr.supplierName}
                    </span>
                  </div>
                </div>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-900/80 text-emerald-200 border border-emerald-700">
                WMS Updated
              </span>
            </div>
          </div>
        )}

        {/* In-processing spinner overlay */}
        {isProcessing && (
          <div className="absolute inset-0 bg-stone-950/80 backdrop-blur-sm flex flex-col items-center justify-center gap-3 z-10">
            <div className="relative">
              <RefreshCw className="w-10 h-10 text-emerald-400 animate-spin" />
              <Sparkles className="w-4 h-4 text-lime-300 absolute -top-1 -right-1 animate-pulse" />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-white">Multi-Agent Swarm Inspecting...</p>
              <p className="text-xs text-stone-400 mt-0.5 font-mono">
                Running Optical Phenotyping + Kinetic Decay Respiration Engine
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept="image/*"
        className="hidden"
      />

      {/* Active Crate Metadata Display */}
      {(currentBatchId || currentSupplier) && (
        <div className="px-3 py-2 rounded-xl bg-stone-950/70 border border-stone-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 min-w-0">
            <Tag className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span className="text-stone-400">Current Crate:</span>
            <span className="font-mono text-stone-200 font-bold truncate">
              {currentBatchId || 'UNTAGGED'}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-stone-400 truncate max-w-[180px] sm:max-w-[240px]">
            <Building2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="truncate">{currentSupplier || 'Standard Co-Op'}</span>
          </div>
        </div>
      )}

      {/* Camera Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-stone-800">
        <div className="flex items-center gap-2">
          {isCameraActive ? (
            <>
              <button
                onClick={captureFrame}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-950/50 transition-colors"
              >
                <Camera className="w-4 h-4 stroke-[2.5]" />
                <span>Capture & Grade</span>
              </button>
              <button
                onClick={toggleFacingMode}
                className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 border border-stone-700 text-xs"
                title="Switch Camera"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <button
                onClick={stopCamera}
                className="px-3 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 border border-stone-700 text-xs font-medium"
              >
                Stop Feed
              </button>
            </>
          ) : (
            <>
              <button
                onClick={startCamera}
                className="px-3.5 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 text-xs font-medium flex items-center gap-1.5 transition-colors"
              >
                <Camera className="w-4 h-4 text-emerald-400" />
                <span>Live Camera</span>
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-3.5 py-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 text-xs font-medium flex items-center gap-1.5 transition-colors"
              >
                <Upload className="w-4 h-4 text-lime-400" />
                <span>Upload Photo / QR</span>
              </button>
            </>
          )}
        </div>

        {cameraError && (
          <p className="text-[11px] text-amber-400/90 w-full sm:w-auto">
            {cameraError}
          </p>
        )}
      </div>

      {/* Crate Label QR Simulation & Quick-Scan Bar */}
      <div className="p-3 rounded-xl bg-stone-950/60 border border-cyan-900/40 flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-cyan-300 flex items-center gap-1.5">
            <QrCode className="w-3.5 h-3.5 text-cyan-400" />
            Quick-Scan Crate QR Labels (WMS Intake)
          </span>
          <span className="text-[10px] font-mono text-stone-400">One-tap parse</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {SAMPLE_CRATE_QRS.map((sample) => (
            <button
              key={sample.id}
              onClick={() => simulateScanQrSample(sample)}
              className="p-2 rounded-lg bg-stone-900/80 hover:bg-stone-800/90 border border-stone-800 hover:border-cyan-600/70 text-left transition-all flex items-center gap-2"
            >
              <div className="w-7 h-7 rounded-md bg-cyan-950/90 border border-cyan-800 text-cyan-400 flex items-center justify-center shrink-0">
                <QrCode className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[11px] font-bold text-stone-200 truncate">{sample.batchId}</div>
                <div className="text-[10px] text-stone-400 truncate">{sample.supplierName}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Preset Specimens Library for Immediate Testing */}
      <div className="flex flex-col gap-2 pt-1">
        <div className="flex items-center justify-between text-xs text-stone-400">
          <span className="font-semibold text-stone-300 flex items-center gap-1.5">
            <ImageIcon className="w-3.5 h-3.5 text-emerald-400" />
            Verified Specimen Presets ({relevantPresets.length})
          </span>
          <span className="text-[11px] text-stone-500">Click to instantly test ag-engine</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {relevantPresets.map((preset) => {
            const isSelected = selectedPresetId === preset.id;
            return (
              <button
                key={preset.id}
                onClick={() => {
                  stopCamera();
                  onImageCaptured(preset.imageUrl, preset);
                }}
                className={`p-2 rounded-xl border text-left flex items-start gap-2.5 transition-all ${
                  isSelected
                    ? 'bg-emerald-950/40 border-emerald-500 shadow-md shadow-emerald-950/40'
                    : 'bg-stone-950/60 border-stone-800/80 hover:border-stone-700 hover:bg-stone-900/60'
                }`}
              >
                <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-stone-800 bg-stone-900">
                  <img src={preset.imageUrl} alt={preset.name} className="w-full h-full object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-semibold text-stone-200 truncate">{preset.name}</div>
                  <div className="text-[10px] text-stone-400 truncate">{preset.stageName}</div>
                  <div className="text-[9px] text-emerald-400 font-mono mt-0.5">
                    {preset.ambientTemp}°C • {preset.transitHours}h transit
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
