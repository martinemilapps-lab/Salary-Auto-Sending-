'use client';

import React from 'react';
import { Send, AlertTriangle, X, ShieldCheck, CalendarDays, CalendarCheck, FileText, Users } from 'lucide-react';
import { StatementType } from '@/types/common';
import { useTranslation } from '@/lib/i18n';

interface SendConfirmationModalProps {
  isOpen: boolean;
  statementType: StatementType;
  totalCount: number;
  templateName: string;
  mode: 'batch' | 'single' | 'retry';
  employeeName?: string;
  onConfirm: () => void;
  onClose: () => void;
}

export const SendConfirmationModal: React.FC<SendConfirmationModalProps> = ({
  isOpen,
  statementType,
  totalCount,
  templateName,
  mode,
  employeeName,
  onConfirm,
  onClose,
}) => {
  const { t } = useTranslation();
  if (!isOpen) return null;

  let title = t.confirmBatchTitle;
  let description = t.confirmBatchDesc;
  let buttonLabel = `${t.btnConfirmSend} (${totalCount})`;

  if (mode === 'single') {
    title = t.confirmSingleTitle;
    description = employeeName
      ? `${t.confirmSingleDesc} (${employeeName})`
      : t.confirmSingleDesc;
    buttonLabel = t.btnConfirmSend;
  } else if (mode === 'retry') {
    title = t.confirmRetryTitle;
    description = t.confirmRetryDesc;
    buttonLabel = `${t.btnConfirmRetry} (${totalCount})`;
  }

  const moduleName = statementType === 'weekly' ? t.weeklyModuleTitle : t.monthlyModuleTitle;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 animate-fadeIn">
      <div
        className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-100 relative"
        role="dialog"
        aria-modal="true"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 end-5 p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3.5 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-700 border border-brand-100 flex items-center justify-center shrink-0 shadow-sm">
            <Send className="w-6 h-6 text-brand-700 -rotate-12 rtl:rotate-180" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">{title}</h3>
            <p className="text-xs text-slate-500 font-medium">Meta WhatsApp Cloud API Dispatch</p>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-5">
          {description}
        </p>

        {/* Explicit Verification Box: Module, Count, Template Name */}
        <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-4 mb-5 space-y-2.5 text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
            <span className="text-slate-500 flex items-center gap-1.5 font-medium">
              {statementType === 'weekly' ? (
                <CalendarDays className="w-4 h-4 text-brand-600" />
              ) : (
                <CalendarCheck className="w-4 h-4 text-brand-600" />
              )}
              {t.confirmModalModule}
            </span>
            <span className="font-extrabold text-slate-900 bg-brand-50 text-brand-800 border border-brand-200/60 px-2.5 py-0.5 rounded-lg">
              {moduleName}
            </span>
          </div>

          <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
            <span className="text-slate-500 flex items-center gap-1.5 font-medium">
              <Users className="w-4 h-4 text-slate-500" />
              {t.confirmModalCount}
            </span>
            <span className="font-extrabold text-slate-900 font-mono text-sm">
              {totalCount} {t.recordsCount}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-500 flex items-center gap-1.5 font-medium">
              <FileText className="w-4 h-4 text-slate-500" />
              {t.confirmModalTemplate}
            </span>
            <span className="font-mono font-bold text-slate-800 bg-white border border-slate-200 px-2 py-0.5 rounded-md text-[11px]">
              {templateName}
            </span>
          </div>
        </div>

        {/* Warning Notice */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3.5 mb-6 flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-[11px] text-amber-800 font-medium leading-relaxed">
            {t.confirmModalNotice}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs sm:text-sm hover:bg-slate-50 transition-colors"
          >
            {t.btnCancel}
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-brand-700 hover:bg-brand-600 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-md shadow-brand-700/25 transition-all hover:scale-[1.02]"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{buttonLabel}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
