'use client';

import React from 'react';
import { X, MessageSquare, CheckCheck, Send } from 'lucide-react';
import { EmployeeRecord } from '@/types/salary';
import { generateSalaryMessage } from '@/lib/message-generator';

interface MessagePreviewModalProps {
  employee: EmployeeRecord | null;
  onClose: () => void;
}

export const MessagePreviewModal: React.FC<MessagePreviewModalProps> = ({ employee, onClose }) => {
  if (!employee) return null;

  const messageText = generateSalaryMessage(employee);
  const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-slate-950">
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

        {/* WhatsApp Chat Container Simulator */}
        <div className="p-6 bg-slate-100 min-h-[320px] flex flex-col justify-between">
          <div className="text-center text-xs text-slate-400 mb-4 bg-slate-200/80 px-3 py-1 rounded-full w-fit mx-auto font-medium">
            WhatsApp End-to-End Encrypted Business Message
          </div>

          {/* Chat Message Bubble */}
          <div className="bg-emerald-50 border border-emerald-200/80 rounded-2xl rounded-tr-none p-4 max-w-[88%] ml-auto shadow-sm">
            <pre className="font-sans text-sm text-slate-800 whitespace-pre-wrap leading-relaxed">
              {messageText}
            </pre>
            <div className="flex items-center justify-end gap-1 mt-2 text-[10px] text-emerald-700">
              <span>{currentTime}</span>
              <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
            </div>
          </div>

          {/* Footer note */}
          <div className="mt-6 pt-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
            <span>Template generated from Excel salary row</span>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl text-xs transition-colors"
            >
              Close Preview
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
