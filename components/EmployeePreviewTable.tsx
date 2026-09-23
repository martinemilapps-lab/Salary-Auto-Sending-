'use client';

import React, { useState } from 'react';
import {
  Search,
  Eye,
  Send,
  Users,
  Loader2,
  CheckCircle,
  XCircle,
  RefreshCw,
} from 'lucide-react';
import { StatementType, RowSendStatus } from '@/types/common';
import { WeeklyEmployeeRecord } from '@/types/weekly';
import { MonthlyEmployeeRecord } from '@/types/monthly';
import { formatNumberWithCommas } from '@/lib/validation/common';
import { useTranslation } from '@/lib/i18n';

interface EmployeePreviewTableProps {
  statementType: StatementType;
  records: (WeeklyEmployeeRecord | MonthlyEmployeeRecord)[];
  onPreviewMessage: (employee: WeeklyEmployeeRecord | MonthlyEmployeeRecord) => void;
  onStartBatchSending: () => void;
  onSendSingleEmployee: (employee: WeeklyEmployeeRecord | MonthlyEmployeeRecord) => void;
  isSending: boolean;
  hasErrors: boolean;
}

export const EmployeePreviewTable: React.FC<EmployeePreviewTableProps> = ({
  statementType,
  records,
  onPreviewMessage,
  onStartBatchSending,
  onSendSingleEmployee,
  isSending,
  hasErrors,
}) => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'ready' | 'sent' | 'failed'>('all');

  const filteredRecords = records.filter((rec) => {
    const matchesSearch =
      rec.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rec.employeeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rec.whatsappNumber.includes(searchQuery);

    if (!matchesSearch) return false;

    if (statusFilter === 'all') return true;
    if (statusFilter === 'ready') return !rec.sendStatus || rec.sendStatus === 'Ready';
    if (statusFilter === 'sent') return rec.sendStatus === 'Sent';
    if (statusFilter === 'failed') return rec.sendStatus === 'Failed';
    return true;
  });

  const validRecords = records.filter((r) => r.status !== 'error');
  const sentCount = records.filter((r) => r.sendStatus === 'Sent').length;
  const failedCount = records.filter((r) => r.sendStatus === 'Failed').length;
  const readyCount = records.filter((r) => !r.sendStatus || r.sendStatus === 'Ready').length;

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden mb-8">
      {/* Top Header & Actions Toolbar */}
      <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-700 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">
              {t.payrollPreviewTitle} (
              {statementType === 'weekly' ? t.weeklyModuleTitle : t.monthlyModuleTitle}
              )
            </h2>
            <span className="bg-slate-100 text-slate-700 text-xs font-bold px-2.5 py-0.5 rounded-full">
              {records.length} {t.recordsCount}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {t.payrollPreviewDesc}
          </p>
        </div>

        {/* Primary Dominant Action: Send All */}
        <button
          type="button"
          onClick={onStartBatchSending}
          disabled={isSending || validRecords.length === 0 || hasErrors}
          className={`inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm shadow-md transition-all ${
            isSending || validRecords.length === 0 || hasErrors
              ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
              : 'bg-brand-700 hover:bg-brand-600 text-white shadow-brand-700/25 hover:scale-[1.02]'
          }`}
        >
          {isSending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>{t.actionSendingAll}</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span>
                {t.actionSendAll} ({validRecords.length})
              </span>
            </>
          )}
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-slate-50/70 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute start-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.searchPlaceholder}
            className="w-full ps-9 pe-4 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-transparent"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              statusFilter === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            {t.filterAll} ({records.length})
          </button>
          <button
            onClick={() => setStatusFilter('ready')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              statusFilter === 'ready'
                ? 'bg-brand-700 text-white'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            {t.filterReady} ({readyCount})
          </button>
          {sentCount > 0 && (
            <button
              onClick={() => setStatusFilter('sent')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                statusFilter === 'sent'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {t.filterSent} ({sentCount})
            </button>
          )}
          {failedCount > 0 && (
            <button
              onClick={() => setStatusFilter('failed')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                statusFilter === 'failed'
                  ? 'bg-red-600 text-white'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {t.filterFailed} ({failedCount})
            </button>
          )}
        </div>
      </div>

      {/* Responsive Table Data */}
      <div className="overflow-x-auto">
        <table className="w-full text-start text-xs text-slate-600">
          <thead className="bg-slate-100/90 text-slate-700 font-bold uppercase tracking-wider border-b border-slate-200">
            <tr>
              <th className="px-3.5 py-3.5">{t.colIndex}</th>
              <th className="px-3.5 py-3.5">{t.colName}</th>
              <th className="px-3.5 py-3.5">{t.colPhone}</th>

              {statementType === 'weekly' ? (
                <>
                  <th className="px-3 py-3.5">{t.colWeek}</th>
                  <th className="px-3 py-3.5">{t.colMonth}</th>
                  <th className="px-3 py-3.5 text-right rtl:text-left">{t.colSettlements}</th>
                  <th className="px-3 py-3.5 text-right rtl:text-left">{t.colProduction}</th>
                  <th className="px-3 py-3.5 text-right rtl:text-left">{t.colTransport}</th>
                  <th className="px-3 py-3.5 text-right rtl:text-left">{t.colSaturday}</th>
                  <th className="px-3 py-3.5 text-right rtl:text-left">{t.colSaturdayDiff}</th>
                  <th className="px-3 py-3.5 text-right rtl:text-left">{t.colEvening}</th>
                  <th className="px-3 py-3.5 text-right rtl:text-left">{t.colBonuses}</th>
                  <th className="px-3 py-3.5 text-right rtl:text-left">{t.colMeal}</th>
                  <th className="px-3 py-3.5 text-right rtl:text-left">{t.colEfficiency}</th>
                  <th className="px-3 py-3.5 text-right rtl:text-left">{t.colRegularity}</th>
                  <th className="px-3 py-3.5 text-right rtl:text-left">{t.colGrant}</th>
                  <th className="px-3 py-3.5 text-right rtl:text-left text-red-600">{t.colUnderAccount}</th>
                  <th className="px-3.5 py-3.5 text-right rtl:text-left font-black text-brand-700">{t.colTotal}</th>
                </>
              ) : (
                <>
                  <th className="px-3 py-3.5">{t.colPeriod}</th>
                  <th className="px-3 py-3.5 text-right rtl:text-left">{t.colSubWage}</th>
                  <th className="px-3 py-3.5 text-right rtl:text-left">{t.colCompWage}</th>
                  <th className="px-3 py-3.5 text-right rtl:text-left">{t.colMonthlyItem}</th>
                  <th className="px-3 py-3.5 text-right rtl:text-left">{t.colCostOfLiving}</th>
                  <th className="px-3 py-3.5 text-right rtl:text-left">{t.colWorkerIncentive}</th>
                  <th className="px-3 py-3.5 text-right rtl:text-left text-red-600">{t.colAbsence}</th>
                  <th className="px-3 py-3.5 text-right rtl:text-left text-red-600">{t.colTax}</th>
                  <th className="px-3 py-3.5 text-right rtl:text-left">{t.colGross}</th>
                  <th className="px-3.5 py-3.5 text-right rtl:text-left font-black text-brand-700">{t.colNetSalary}</th>
                  <th className="px-3 py-3.5 text-right rtl:text-left text-red-600">{t.colAdvance}</th>
                  <th className="px-3 py-3.5 text-right rtl:text-left">{t.colHousing}</th>
                  <th className="px-3 py-3.5 text-right rtl:text-left">{t.colRemainingAdvance}</th>
                  <th className="px-3 py-3.5 text-center">{t.colLeaveBalance}</th>
                  <th className="px-3 py-3.5 text-center">{t.colCasualBalance}</th>
                </>
              )}

              <th className="px-3.5 py-3.5 text-center">{t.colStatus}</th>
              <th className="px-3.5 py-3.5 text-center">{t.colActions}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredRecords.length === 0 ? (
              <tr>
                <td colSpan={20} className="px-4 py-8 text-center text-slate-400 font-medium">
                  {t.noMatchingRecords}
                </td>
              </tr>
            ) : (
              filteredRecords.map((emp, idx) => {
                const currentStatus: RowSendStatus = emp.sendStatus || 'Ready';

                return (
                  <tr key={emp.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-3.5 py-3 text-slate-400 font-mono text-center">{idx + 1}</td>

                    {/* Employee Name */}
                    <td className="px-3.5 py-3">
                      <div className="font-bold text-slate-900 text-xs sm:text-sm">
                        {emp.employeeName || '—'}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">{emp.employeeId}</div>
                    </td>

                    {/* Phone Number */}
                    <td className="px-3.5 py-3 font-mono font-medium text-slate-800 text-[11px] whitespace-nowrap">
                      {emp.formattedPhone || emp.whatsappNumber || '—'}
                    </td>

                    {/* Weekly Columns */}
                    {statementType === 'weekly' && (() => {
                      const w = emp as WeeklyEmployeeRecord;
                      return (
                        <>
                          <td className="px-3 py-3 whitespace-nowrap">{w.week}</td>
                          <td className="px-3 py-3 whitespace-nowrap">{w.month}</td>
                          <td className="px-3 py-3 text-right rtl:text-left font-mono">{formatNumberWithCommas(w.settlements)}</td>
                          <td className="px-3 py-3 text-right rtl:text-left font-mono text-emerald-700">{formatNumberWithCommas(w.productionIncentive)}</td>
                          <td className="px-3 py-3 text-right rtl:text-left font-mono">{formatNumberWithCommas(w.transportAllowance)}</td>
                          <td className="px-3 py-3 text-right rtl:text-left font-mono">{formatNumberWithCommas(w.saturdayAmount)}</td>
                          <td className="px-3 py-3 text-right rtl:text-left font-mono">{formatNumberWithCommas(w.saturdayDiffAmount)}</td>
                          <td className="px-3 py-3 text-right rtl:text-left font-mono">{formatNumberWithCommas(w.eveningAmount)}</td>
                          <td className="px-3 py-3 text-right rtl:text-left font-mono text-emerald-700">{formatNumberWithCommas(w.bonuses)}</td>
                          <td className="px-3 py-3 text-right rtl:text-left font-mono">{formatNumberWithCommas(w.mealAllowance)}</td>
                          <td className="px-3 py-3 text-right rtl:text-left font-mono">{formatNumberWithCommas(w.efficiencyIncentive)}</td>
                          <td className="px-3 py-3 text-right rtl:text-left font-mono">{formatNumberWithCommas(w.regularityIncentive)}</td>
                          <td className="px-3 py-3 text-right rtl:text-left font-mono text-emerald-700">{formatNumberWithCommas(w.grant)}</td>
                          <td className="px-3 py-3 text-right rtl:text-left font-mono text-red-600 font-medium">-{formatNumberWithCommas(w.underAccount)}</td>
                          <td className="px-3.5 py-3 text-right rtl:text-left font-mono font-black text-brand-700 text-xs sm:text-sm whitespace-nowrap">
                            {formatNumberWithCommas(w.total)} {t.currencyEgp}
                          </td>
                        </>
                      );
                    })()}

                    {/* Monthly Columns */}
                    {statementType === 'monthly' && (() => {
                      const m = emp as MonthlyEmployeeRecord;
                      return (
                        <>
                          <td className="px-3 py-3 whitespace-nowrap">{m.salaryPeriod}</td>
                          <td className="px-3 py-3 text-right rtl:text-left font-mono">{formatNumberWithCommas(m.subscriptionWage)}</td>
                          <td className="px-3 py-3 text-right rtl:text-left font-mono">{formatNumberWithCommas(m.comprehensiveWage)}</td>
                          <td className="px-3 py-3 text-right rtl:text-left font-mono">{formatNumberWithCommas(m.monthlyItem)}</td>
                          <td className="px-3 py-3 text-right rtl:text-left font-mono">{formatNumberWithCommas(m.costOfLivingAllowance)}</td>
                          <td className="px-3 py-3 text-right rtl:text-left font-mono text-emerald-700">{formatNumberWithCommas(m.workerIncentive)}</td>
                          <td className="px-3 py-3 text-right rtl:text-left font-mono text-red-600 font-medium">-{formatNumberWithCommas(m.absence)}</td>
                          <td className="px-3 py-3 text-right rtl:text-left font-mono text-red-600 font-medium">-{formatNumberWithCommas(m.tax)}</td>
                          <td className="px-3 py-3 text-right rtl:text-left font-mono font-semibold">{formatNumberWithCommas(m.grossBeforeDeductions)}</td>
                          <td className="px-3.5 py-3 text-right rtl:text-left font-mono font-black text-brand-700 text-xs sm:text-sm whitespace-nowrap">
                            {formatNumberWithCommas(m.netSalary)} {t.currencyEgp}
                          </td>
                          <td className="px-3 py-3 text-right rtl:text-left font-mono text-red-600 font-medium">-{formatNumberWithCommas(m.advance)}</td>
                          <td className="px-3 py-3 text-right rtl:text-left font-mono">{formatNumberWithCommas(m.housing)}</td>
                          <td className="px-3 py-3 text-right rtl:text-left font-mono">{formatNumberWithCommas(m.remainingAdvance)}</td>
                          <td className="px-3 py-3 text-center font-mono">{String(m.leaveBalance ?? '0')}</td>
                          <td className="px-3 py-3 text-center font-mono">{String(m.casualLeaveBalance ?? '0')}</td>
                        </>
                      );
                    })()}

                    {/* Status Badge */}
                    <td className="px-3.5 py-3 text-center whitespace-nowrap">
                      {currentStatus === 'Ready' && (
                        <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 border border-slate-200 px-2.5 py-1 rounded-full text-[11px] font-bold">
                          <CheckCircle className="w-3.5 h-3.5 text-slate-500" />
                          {t.statusReady}
                        </span>
                      )}
                      {currentStatus === 'Sending' && (
                        <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-1 rounded-full text-[11px] font-bold">
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-600" />
                          {t.statusSending}
                        </span>
                      )}
                      {currentStatus === 'Sent' && (
                        <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-full text-[11px] font-bold">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                          {t.statusSent}
                        </span>
                      )}
                      {currentStatus === 'Failed' && (
                        <span
                          title={emp.sendErrorDetails || 'Failed to dispatch WhatsApp message'}
                          className="inline-flex items-center gap-1 bg-red-50 text-red-700 border border-red-200 px-2.5 py-1 rounded-full text-[11px] font-bold cursor-help"
                        >
                          <XCircle className="w-3.5 h-3.5 text-red-600" />
                          {t.statusFailed}
                        </span>
                      )}
                    </td>

                    {/* Actions: Preview & Send */}
                    <td className="px-3.5 py-3 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => onPreviewMessage(emp)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors"
                          title={t.actionPreview}
                        >
                          <Eye className="w-3.5 h-3.5 text-slate-500" />
                          <span>{t.actionPreview}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => onSendSingleEmployee(emp)}
                          disabled={isSending || emp.status === 'error'}
                          className={`inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                            isSending || emp.status === 'error'
                              ? 'bg-slate-100 text-slate-300 cursor-not-allowed'
                              : currentStatus === 'Failed'
                              ? 'bg-amber-100 hover:bg-amber-200 text-amber-800'
                              : currentStatus === 'Sent'
                              ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700'
                              : 'bg-brand-700 hover:bg-brand-600 text-white shadow-sm'
                          }`}
                          title={t.actionSend}
                        >
                          {currentStatus === 'Failed' ? (
                            <>
                              <RefreshCw className="w-3 h-3" />
                              <span>{t.actionRetry}</span>
                            </>
                          ) : (
                            <>
                              <Send className="w-3 h-3" />
                              <span>{t.actionSend}</span>
                            </>
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
