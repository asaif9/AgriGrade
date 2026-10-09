import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  MessageSquare,
  Send,
  AlertTriangle,
  CheckCircle2,
  Bell,
  Clock,
  Radio,
  Sparkles,
  X,
  PhoneCall,
  Check,
} from 'lucide-react';
import { INITIAL_OPERATIONAL_ALERTS } from '../utils/mobileFieldAdvisory';
import type { OperationalAlert } from '../types';

interface WhatsAppAlertsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WhatsAppAlertsModal: React.FC<WhatsAppAlertsModalProps> = ({ isOpen, onClose }) => {
  const [alerts, setAlerts] = useState<OperationalAlert[]>(INITIAL_OPERATIONAL_ALERTS);
  const [customTitle, setCustomTitle] = useState<string>('🚨 Batch CRATE-4892 shelf-life warning');
  const [customMsg, setCustomMsg] = useState<string>(
    'Batch CRATE-4892 shelf-life dropped below 48 hours. Auto-discounting by 18% on Zepto/Blinkit storefronts.'
  );
  const [alertType, setAlertType] = useState<'COLD_CHAIN_BREACH' | 'EXPIRY_WARNING' | 'SUPPLIER_RISK' | 'DISPATCH_READY'>('EXPIRY_WARNING');
  const [broadcastSent, setBroadcastSent] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSendBroadcast = () => {
    const newAlert: OperationalAlert = {
      id: `alert-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: alertType,
      severity: alertType === 'COLD_CHAIN_BREACH' ? 'CRITICAL' : alertType === 'EXPIRY_WARNING' ? 'WARNING' : 'SUCCESS',
      title: customTitle,
      message: customMsg,
      batchId: 'CRATE-4892',
      resolved: false,
    };
    setAlerts([newAlert, ...alerts]);
    setBroadcastSent(true);
    setTimeout(() => setBroadcastSent(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-2xl bg-stone-900 border border-stone-800 rounded-3xl shadow-2xl p-5 sm:p-6 max-h-[90vh] overflow-y-auto flex flex-col gap-5"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 font-bold">
                Operational Broadcast Center
              </span>
              <h3 className="text-sm font-black text-white">
                WhatsApp & Mobile Push Dispatch
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

        <p className="text-xs text-stone-400">
          AgriGrade is operational rather than dashboard-only. It automatically pushes critical real-time alerts to dark store managers, logistics drivers, and agronomy scouts via WhatsApp Business API and mobile webhooks.
        </p>

        {/* Live Broadcast Feed */}
        <div className="flex flex-col gap-2.5">
          <span className="text-xs font-mono uppercase tracking-wider text-stone-300 font-bold">
            Recent Broadcast Channel Feed:
          </span>

          <div className="flex flex-col gap-2 max-h-64 overflow-y-auto pr-1">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-3.5 rounded-xl border flex items-start justify-between gap-3 ${
                  alert.severity === 'CRITICAL'
                    ? 'bg-rose-950/30 border-rose-800/80'
                    : alert.severity === 'WARNING'
                    ? 'bg-amber-950/30 border-amber-800/80'
                    : 'bg-emerald-950/30 border-emerald-800/80'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <div className="text-lg shrink-0 mt-0.5">
                    {alert.type === 'COLD_CHAIN_BREACH' ? '🚨' : alert.type === 'EXPIRY_WARNING' ? '⚠️' : alert.type === 'SUPPLIER_RISK' ? '🔴' : '🟢'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">{alert.title}</span>
                      <span className="text-[10px] font-mono text-stone-400">{alert.timestamp}</span>
                    </div>
                    <p className="text-xs text-stone-300 mt-0.5 leading-relaxed">
                      {alert.message}
                    </p>
                  </div>
                </div>

                <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-stone-950 text-stone-300 shrink-0 border border-stone-800">
                  Delivered
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Broadcast Trigger Simulator */}
        <div className="bg-stone-950 p-4 rounded-xl border border-stone-800 flex flex-col gap-3">
          <div className="flex items-center justify-between text-xs font-bold text-stone-200">
            <span>Simulate / Send Operational Alert</span>
            <span className="text-[10px] font-mono text-emerald-400">WhatsApp Webhook Ready</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {[
              {
                type: 'EXPIRY_WARNING',
                label: '⚠️ Shelf Life < 48h',
                title: '🚨 Batch CRATE-4892 shelf-life dropped below 48 hours.',
                msg: 'Batch CRATE-4892 shelf-life dropped below 48 hours. Auto-discounting by 18% on Zepto/Blinkit storefronts.',
              },
              {
                type: 'COLD_CHAIN_BREACH',
                label: '🚨 Reefer Excursion',
                title: '⚠️ Reefer temperature exceeded threshold.',
                msg: 'Reefer Truck KA-04-E-8821 temp exceeded 12°C threshold (currently 14.8°C for 3.2 hours).',
              },
              {
                type: 'DISPATCH_READY',
                label: '🟢 Supplier 95% Grade A',
                title: '🟢 Supplier Nashik Agro Cluster achieved 95% Grade A this week.',
                msg: 'Supplier Nashik Agro Cluster achieved 95% Grade A compliance this week across 42 batches.',
              },
            ].map((preset) => (
              <button
                key={preset.type}
                onClick={() => {
                  setAlertType(preset.type as any);
                  setCustomTitle(preset.title);
                  setCustomMsg(preset.msg);
                }}
                className="px-2.5 py-1 rounded-lg bg-stone-900 hover:bg-stone-850 border border-stone-800 text-stone-300 text-[11px] font-mono transition-colors"
              >
                {preset.label}
              </button>
            ))}
          </div>

          <input
            type="text"
            value={customTitle}
            onChange={(e) => setCustomTitle(e.target.value)}
            placeholder="Alert title..."
            className="w-full bg-stone-900 border border-stone-700 rounded-lg p-2 text-xs text-stone-100 font-semibold focus:outline-none focus:border-emerald-500"
          />

          <textarea
            value={customMsg}
            onChange={(e) => setCustomMsg(e.target.value)}
            rows={2}
            placeholder="Alert message body..."
            className="w-full bg-stone-900 border border-stone-700 rounded-lg p-2 text-xs text-stone-100 focus:outline-none focus:border-emerald-500"
          />

          <button
            onClick={handleSendBroadcast}
            className={`w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
              broadcastSent
                ? 'bg-emerald-950 border border-emerald-600 text-emerald-300'
                : 'bg-emerald-500 hover:bg-emerald-400 text-stone-950 shadow-md'
            }`}
          >
            {broadcastSent ? (
              <>
                <Check className="w-4 h-4" />
                <span>Broadcast Sent to WhatsApp Channels!</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Broadcast Live Alert to Mobile Dispatch</span>
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
