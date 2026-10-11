import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Printer,
  QrCode,
  Barcode,
  Copy,
  Check,
  X,
  Tag,
  Warehouse,
  Clock,
  Sparkles,
} from 'lucide-react';
import type { ThermalLabelData, AgriGradeReport } from '../types';

interface ThermalLabelModalProps {
  isOpen: boolean;
  onClose: () => void;
  report?: AgriGradeReport | null;
  batchId?: string;
  supplierName?: string;
}

export const ThermalLabelModal: React.FC<ThermalLabelModalProps> = ({
  isOpen,
  onClose,
  report,
  batchId = 'CRATE-TOM-8821',
  supplierName = 'Saraswati Agritech Cluster #3',
}) => {
  const [copied, setCopied] = useState(false);
  const [labelFormat, setLabelFormat] = useState<'4x3' | '2x1'>('4x3');

  if (!isOpen) return null;

  const commodity = report?.produce_type || 'Tomato';
  const variety = report?.variety_detected || 'Roma';
  const verdict = report?.inbound_action?.verdict || 'ACCEPTED_GRADE_A';
  const grade = verdict === 'ACCEPTED_GRADE_B' ? 'GRADE B' : verdict === 'REJECTED_AT_DOCK' ? 'REJECT' : 'GRADE A';
  const markdown = report?.inbound_action?.recommended_dynamic_discount_percent || 0;
  const erpTag = report?.inbound_action?.erp_routing_tag || 'PREMIUM_RETAIL_BIN';
  const shelfLifeDays = report?.ambient_shelf_life_days || 4.2;

  const now = new Date();
  const arrivalDate = now.toLocaleDateString();
  const expiry = new Date(now.getTime() + shelfLifeDays * 24 * 60 * 60 * 1000);
  const expiryDate = expiry.toLocaleDateString();
  const expiryTime = expiry.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const barcodeNumber = `8901428${Date.now().toString().slice(-5)}`;

  const tsplCode = `SIZE 4, 3
GAP 0.12, 0
SPEED 4
DENSITY 8
DIRECTION 1
CLS
TEXT 30,30,"3",0,1,1,"AGRIGRADE QUALITY GATE"
TEXT 30,70,"2",0,1,1,"BATCH: ${batchId}"
TEXT 30,100,"2",0,1,1,"COMMODITY: ${commodity} (${variety})"
TEXT 30,130,"2",0,1,1,"SUPPLIER: ${supplierName}"
TEXT 30,170,"4",0,1,1,"[${grade}] ${markdown > 0 ? `MARKDOWN: ${markdown}%` : ''}"
TEXT 30,220,"2",0,1,1,"EXPIRY: ${expiryDate} ${expiryTime}"
TEXT 30,250,"2",0,1,1,"ERP ROUTE: ${erpTag}"
BARCODE 30,290,"128",60,1,0,2,2,"${barcodeNumber}"
QRCODE 460,70,L,5,A,0,"M:AGR|B:${batchId}|G:${grade}|E:${expiryDate}"
PRINT 1
`;

  const handleCopyTSPL = () => {
    navigator.clipboard.writeText(tsplCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/85 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="w-full max-w-2xl bg-stone-900 border border-stone-800 rounded-3xl shadow-2xl p-5 sm:p-6 max-h-[92vh] overflow-y-auto flex flex-col gap-5 text-stone-100"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-950 border border-emerald-600/50 flex items-center justify-center text-emerald-300">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
                <span>Thermal Crate Barcode & Sticker Generator</span>
                <span className="text-[10px] font-mono uppercase bg-stone-800 text-emerald-400 px-2 py-0.5 rounded border border-stone-700">
                  Zebra / TSPL Standard
                </span>
              </h2>
              <p className="text-xs text-stone-400">
                Direct thermal print layout for warehouse intake crates & RFID bins
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Format Selector */}
        <div className="flex items-center justify-between bg-stone-950 p-2.5 rounded-xl border border-stone-800 text-xs">
          <span className="text-stone-400">Label Size Format:</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setLabelFormat('4x3')}
              className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                labelFormat === '4x3'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
              }`}
            >
              4" × 3" Large Crate Label
            </button>
            <button
              onClick={() => setLabelFormat('2x1')}
              className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                labelFormat === '2x1'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
              }`}
            >
              2" × 1" Shelf Tag
            </button>
          </div>
        </div>

        {/* Physical Thermal Sticker Preview */}
        <div className="flex justify-center p-4 bg-stone-950 rounded-2xl border border-stone-800">
          <div
            className={`bg-white text-black p-4 font-mono shadow-xl rounded-md border-2 border-dashed border-stone-400 flex flex-col justify-between ${
              labelFormat === '4x3' ? 'w-96 min-h-[300px]' : 'w-72 min-h-[170px]'
            }`}
          >
            {/* Top row */}
            <div className="border-b-2 border-black pb-2 flex items-start justify-between">
              <div>
                <div className="font-extrabold text-sm tracking-tight flex items-center gap-1">
                  <span>AGRIGRADE DOCK QA</span>
                </div>
                <div className="text-[11px] font-bold mt-0.5">{batchId}</div>
                <div className="text-[10px] text-gray-700">{commodity} · {variety}</div>
              </div>

              {/* QR Mock */}
              <div className="w-14 h-14 border border-black p-1 flex flex-col items-center justify-center bg-gray-100">
                <QrCode className="w-10 h-10 text-black stroke-[1.5]" />
              </div>
            </div>

            {/* Middle Grade Badge */}
            <div className="py-2.5 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-gray-600 uppercase block">Certified Quality</span>
                <span
                  className={`text-lg font-black tracking-wider ${
                    grade === 'GRADE A'
                      ? 'text-emerald-800'
                      : grade === 'GRADE B'
                      ? 'text-amber-800'
                      : 'text-rose-800'
                  }`}
                >
                  [{grade}]
                </span>
                {markdown > 0 && (
                  <span className="text-[11px] font-bold block text-red-700">
                    MARKDOWN: {markdown}% OFF
                  </span>
                )}
              </div>

              <div className="text-right">
                <span className="text-[10px] text-gray-600 uppercase block">Sell-By Expiry</span>
                <span className="text-xs font-bold text-black">{expiryDate}</span>
                <span className="text-[10px] text-gray-700">{expiryTime}</span>
              </div>
            </div>

            {/* Logistics & ERP Routing */}
            <div className="border-t border-black pt-2 text-[10px] text-gray-800 flex justify-between">
              <div>
                <span className="font-semibold">SUPP:</span> {supplierName.slice(0, 22)}
              </div>
              <div className="font-bold text-right">
                <span>{erpTag}</span>
              </div>
            </div>

            {/* Barcode line */}
            <div className="mt-2 text-center pt-1 border-t border-dashed border-gray-400">
              <div className="flex justify-center items-center gap-0.5 h-7">
                {[3, 1, 2, 4, 1, 3, 2, 1, 4, 2, 3, 1, 2, 4, 1, 3, 2, 4, 1, 2, 3, 4, 1, 2, 3, 1, 4, 2].map(
                  (w, i) => (
                    <div
                      key={i}
                      className="bg-black h-full"
                      style={{ width: `${w * 1.5}px` }}
                    />
                  )
                )}
              </div>
              <div className="text-[10px] tracking-widest font-mono text-gray-800 mt-0.5">
                *{barcodeNumber}*
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-stone-800 text-xs">
          <button
            onClick={handleCopyTSPL}
            className="px-3.5 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 border border-stone-700 font-medium transition-colors flex items-center gap-1.5"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'TSPL Copied!' : 'Copy TSPL Printer Code'}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 border border-stone-700 font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-stone-950 font-bold transition-colors flex items-center gap-1.5 shadow-md shadow-emerald-950/40"
            >
              <Printer className="w-4 h-4" />
              <span>Print Thermal Sticker</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
