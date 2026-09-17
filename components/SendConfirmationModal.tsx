'use client';

import React from 'react';
import { Send, AlertTriangle, X, ShieldCheck } from 'lucide-react';

interface SendConfirmationModalProps {
  isOpen: boolean;
  totalCount: number;
  mode: 'batch' | 'single' | 'retry';
  employeeName?: string;
  onConfirm: () => void;
  onClose: () => void;
}

export const SendConfirmationModal: React.FC<SendConfirmationModalProps> = ({
  isOpen,
  totalCount,
  mode,
  employeeName,
  onConfirm,
  onClose,
}) => {
  if (!isOpen) return null;

  let title = 'Confirm Batch Salary Notification';
  let description = `Are you sure you want to send personalized WhatsApp salary statements to ${totalCount} employees?`;
  let buttonLabel = `Confirm & Send (${totalCount} Messages)`;

  if (mode === 'single') {
    title = 'Confirm Individual Salary Send';
    description = `Are you sure you want to send the WhatsApp salary statement to ${employeeName || 'this employee'}?`;
    buttonLabel = 'Confirm & Send Message';
  } else if (mode === 'retry') {
    title = 'Confirm Retry Failed Statements';
    description = `Are you sure you want to retry sending WhatsApp statements to the ${totalCount} failed employee records?`;
    buttonLabel = `Retry Failed (${totalCount})`;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fadeIn">
      <div
        className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 relative"
        role="dialog"
        aria-modal="true"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
            <Send className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">{title}</h3>
            <p className="text-xs text-slate-500 font-medium">HR Automation Action</p>
          </div>
        </div>

        <p className="text-sm text-slate-600 leading-relaxed mb-5">
          {description}
        </p>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 mb-6 flex items-start gap-2.5">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-800 font-medium">
            Messages will be dispatched directly to verified WhatsApp phone numbers. Each employee will receive their personalized breakdown.
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold text-sm hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-xl shadow-md shadow-emerald-600/20 transition-all hover:scale-[1.02]"
          >
            <ShieldCheck className="w-4 h-4" />
            {buttonLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
