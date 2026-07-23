'use client';

import React from 'react';
import { CheckCircle2, XCircle, Download, RotateCcw, ShieldCheck, FileSpreadsheet } from 'lucide-react';
import { BatchSendSummary } from '@/types/salary';

interface ResultsSummaryProps {
  summary: BatchSendSummary;
  onReset: () => void;
}

export const ResultsSummary: React.FC<ResultsSummaryProps> = ({ summary, onReset }) => {
  const handleDownloadCsv = () => {
    const headers = ['Employee ID', 'Employee Name', 'WhatsApp Number', 'Net Salary', 'Currency', 'Status', 'Timestamp', 'Message ID / Error'];
    
    const csvRows = summary.results.map((r) => [
      `"${r.employeeId}"`,
      `"${r.employeeName.replace(/"/g, '""')}"`,
      `"${r.whatsappNumber}"`,
      r.netSalary,
      `"${r.currency}"`,
      `"${r.status}"`,
      `"${r.sentAt || ''}"`,
      `"${(r.messageId || r.errorDetails || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...csvRows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Salary_Dispatch_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const successRate = summary.total > 0 ? Math.round((summary.successful / summary.total) * 100) : 0;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm mb-8 animate-fadeIn">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-6 h-6 text-emerald-600" />
            <h2 className="text-xl font-bold text-slate-900">Salary Dispatch Completed</h2>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            All employee salary statements have been processed. Review the execution summary below.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleDownloadCsv}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm rounded-xl transition-colors shadow-sm"
          >
            <Download className="w-4 h-4" />
            Export Audit Report (.csv)
          </button>

          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm rounded-xl transition-colors"
          >
            <RotateCcw className="w-4 h-4 text-slate-600" />
            Start New Upload
          </button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Processed</p>
          <p className="text-2xl font-black text-slate-900 font-mono mt-1">{summary.total}</p>
        </div>

        <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl">
          <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wider flex items-center justify-between">
            <span>Successfully Delivered</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </p>
          <p className="text-2xl font-black text-emerald-700 font-mono mt-1">{summary.successful}</p>
        </div>

        <div className="p-4 bg-red-50/70 border border-red-200 rounded-xl">
          <p className="text-xs font-semibold text-red-700 uppercase tracking-wider flex items-center justify-between">
            <span>Failed Deliveries</span>
            <XCircle className="w-4 h-4 text-red-600" />
          </p>
          <p className="text-2xl font-black text-red-700 font-mono mt-1">{summary.failed}</p>
        </div>

        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Delivery Success Rate</p>
          <p className="text-2xl font-black text-slate-900 font-mono mt-1">{successRate}%</p>
        </div>
      </div>

      {/* Execution Results Log Table */}
      <div className="border border-slate-200 rounded-xl overflow-hidden">
        <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 font-bold text-xs text-slate-700 uppercase tracking-wider flex items-center justify-between">
          <span>Execution Details Log</span>
          <span className="text-[11px] font-medium text-slate-500">
            Engine Mode: <span className="font-semibold text-slate-800 uppercase">{summary.mode}</span>
          </span>
        </div>

        <div className="max-h-64 overflow-y-auto divide-y divide-slate-100 text-xs">
          {summary.results.map((res, index) => (
            <div key={index} className="p-3.5 flex items-center justify-between hover:bg-slate-50/50">
              <div className="flex items-center gap-3">
                {res.status === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-600 shrink-0" />
                )}
                <div>
                  <p className="font-bold text-slate-900 text-sm">{res.employeeName}</p>
                  <p className="text-[11px] text-slate-500 font-mono">
                    {res.whatsappNumber} • {res.employeeId}
                  </p>
                </div>
              </div>

              <div className="text-right font-mono">
                {res.status === 'success' ? (
                  <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded text-[11px] font-medium">
                    Delivered ({res.messageId || 'OK'})
                  </span>
                ) : (
                  <span className="text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded text-[11px] font-medium">
                    {res.errorDetails || 'Delivery Failed'}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
