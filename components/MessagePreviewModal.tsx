'use client';

import React from 'react';
import { X, MessageSquare, CheckCheck } from 'lucide-react';
import { StatementType } from '@/types/common';
import { WeeklyEmployeeRecord } from '@/types/weekly';
import { MonthlyEmployeeRecord } from '@/types/monthly';
import { generateWeeklyMessagePreview, generateMonthlyMessagePreview } from '@/lib/message-generator';
import { useTranslation } from '@/lib/i18n';

interface MessagePreviewModalProps {
  statementType: StatementType;
  employee: WeeklyEmployeeRecord | MonthlyEmployeeRecord | null;
  onClose: () => void;
}

export const MessagePreviewModal: React.FC<MessagePreviewModalProps> = ({
  statementType,
  employee,
  onClose,
}) => {
  const { t } = useTranslation();
  if (!employee) return null;

  const previewText =
    statementType === 'weekly'
      ? generateWeeklyMessagePreview(employee as WeeklyEmployeeRecord)
      : generateMonthlyMessagePreview(employee as MonthlyEmployeeRecord);

  const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200">
        {/* Modal Top Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-brand-700 text-white flex items-center justify-center shadow-md">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">{employee.employeeName}</h3>
              <p className="text-xs text-slate-300">
                {employee.formattedPhone || employee.whatsappNumber} • {employee.employeeId}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* WhatsApp Chat Simulator */}
        <div className="p-6 bg-slate-100 min-h-[360px] flex flex-col justify-between">
          <div className="text-center text-[11px] text-slate-500 mb-4 bg-slate-200/80 px-3 py-1 rounded-full w-fit mx-auto font-medium">
            {t.previewModalBadge}
          </div>

          {/* WhatsApp Chat Message Bubble */}
          <div className="bg-emerald-50 border border-emerald-200/90 rounded-2xl rounded-tr-none rtl:rounded-tr-2xl rtl:rounded-tl-none p-4 max-w-[92%] ms-auto shadow-sm">
            <div className="text-xs font-semibold text-emerald-800 mb-1 border-b border-emerald-200/60 pb-1 flex items-center justify-between">
              <span>{statementType === 'weekly' ? t.weeklyModuleTitle : t.monthlyModuleTitle}</span>
              <span className="text-[10px] text-slate-500 font-mono">16 Parameters</span>
            </div>
            <pre className="font-sans text-xs sm:text-sm text-slate-800 whitespace-pre-wrap leading-relaxed select-text">
              {previewText}
            </pre>
            <div className="flex items-center justify-end gap-1 mt-2 text-[10px] text-emerald-700">
              <span>{currentTime}</span>
              <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
            </div>
          </div>

          {/* Footer note */}
          <div className="mt-6 pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
            <span className="text-[11px]">{t.previewModalFooter}</span>
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition-colors shadow-sm"
            >
              {t.previewModalClose}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
