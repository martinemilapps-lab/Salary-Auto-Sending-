'use client';

import React, { useState } from 'react';
import {
  Search,
  Eye,
  AlertCircle,
  CheckCircle,
  Send,
  Users,
  ShieldAlert,
  Loader2,
  XCircle,
  RefreshCw,
} from 'lucide-react';
import { EmployeeRecord, RowSendStatus } from '@/types/salary';
import { formatCurrencyNumber } from '@/lib/message-generator';

interface EmployeePreviewTableProps {
  records: EmployeeRecord[];
  onPreviewMessage: (employee: EmployeeRecord) => void;
  onStartBatchSending: () => void;
  onSendSingleEmployee: (employee: EmployeeRecord) => void;
  isSending: boolean;
  hasErrors: boolean;
}

export const EmployeePreviewTable: React.FC<EmployeePreviewTableProps> = ({
  records,
  onPreviewMessage,
  onStartBatchSending,
  onSendSingleEmployee,
  isSending,
  hasErrors,
}) => {
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
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-8">
      {/* Top Header & Actions Toolbar */}
      <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-600" />
            <h2 className="text-xl font-bold text-slate-900">Employee Payroll Preview</h2>
            <span className="bg-slate-100 text-slate-700 text-xs font-semibold px-2.5 py-0.5 rounded-full">
              {records.length} Records
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Review parsed salary statements before initiating automated WhatsApp notifications.
          </p>
        </div>

        {/* Primary Main Action: Send All */}
        <button
          type="button"
          onClick={onStartBatchSending}
          disabled={isSending || validRecords.length === 0 || hasErrors}
          className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm shadow-md transition-all ${
            isSending || validRecords.length === 0 || hasErrors
              ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
              : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20 hover:scale-[1.02]'
          }`}
        >
          <Send className="w-4 h-4" />
          {isSending ? 'Sending Notifications...' : `Send All (${validRecords.length})`}
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-slate-50/70 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, ID, or phone..."
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              statusFilter === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            All ({records.length})
          </button>
          <button
            onClick={() => setStatusFilter('ready')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              statusFilter === 'ready'
                ? 'bg-emerald-600 text-white'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            Ready ({readyCount})
          </button>
          {sentCount > 0 && (
            <button
              onClick={() => setStatusFilter('sent')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                statusFilter === 'sent'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              Sent ({sentCount})
            </button>
          )}
          {failedCount > 0 && (
            <button
              onClick={() => setStatusFilter('failed')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                statusFilter === 'failed'
                  ? 'bg-red-600 text-white'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              Failed ({failedCount})
            </button>
          )}
        </div>
      </div>

      {/* Table Data */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-600">
          <thead className="bg-slate-100/80 text-slate-700 font-bold uppercase tracking-wider border-b border-slate-200">
            <tr>
              <th className="px-4 py-3.5">#</th>
              <th className="px-4 py-3.5">Employee Name</th>
              <th className="px-4 py-3.5">WhatsApp Number</th>
              <th className="px-4 py-3.5">Salary Month</th>
              <th className="px-4 py-3.5 text-right">Basic</th>
              <th className="px-4 py-3.5 text-right">Bonus</th>
              <th className="px-4 py-3.5 text-right">Deductions</th>
              <th className="px-4 py-3.5 text-right">Net Salary</th>
              <th className="px-4 py-3.5 text-center">Current Status</th>
              <th className="px-4 py-3.5 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredRecords.length === 0 ? (
              <tr>
                <td colSpan={10} className="px-4 py-8 text-center text-slate-400 font-medium">
                  No records match your filter criteria.
                </td>
              </tr>
            ) : (
              filteredRecords.map((employee, idx) => {
                const currentStatus: RowSendStatus = employee.sendStatus || 'Ready';

                return (
                  <tr key={employee.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3 text-slate-400 font-mono">{idx + 1}</td>

                    {/* Employee Name */}
                    <td className="px-4 py-3">
                      <div className="font-bold text-slate-900 text-sm">{employee.employeeName || '—'}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{employee.employeeId}</div>
                    </td>

                    {/* WhatsApp Number */}
                    <td className="px-4 py-3 font-mono font-medium text-slate-800">
                      {employee.formattedPhone || employee.whatsappNumber || '—'}
                    </td>

                    {/* Salary Month */}
                    <td className="px-4 py-3 text-slate-600 font-medium">{employee.salaryMonth}</td>

                    {/* Financial Columns */}
                    <td className="px-4 py-3 text-right font-mono text-slate-700">
                      {formatCurrencyNumber(employee.basicSalary)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-emerald-600 font-medium">
                      +{formatCurrencyNumber(employee.bonus)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-red-500 font-medium">
                      -{formatCurrencyNumber(employee.deductions)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-slate-900 text-sm">
                      {formatCurrencyNumber(employee.netSalary)} {employee.currency}
                    </td>

                    {/* Current Status Badge (Ready, Sending, Sent, Failed) */}
                    <td className="px-4 py-3 text-center">
                      {currentStatus === 'Ready' && (
                        <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-full text-[11px] font-semibold">
                          <CheckCircle className="w-3.5 h-3.5" />
                          Ready
                        </span>
                      )}
                      {currentStatus === 'Sending' && (
                        <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-1 rounded-full text-[11px] font-semibold">
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-600" />
                          Sending
                        </span>
                      )}
                      {currentStatus === 'Sent' && (
                        <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-1 rounded-full text-[11px] font-semibold">
                          <CheckCircle className="w-3.5 h-3.5" />
                          Sent
                        </span>
                      )}
                      {currentStatus === 'Failed' && (
                        <span
                          title={employee.sendErrorDetails || 'Failed to deliver message'}
                          className="inline-flex items-center gap-1 bg-red-50 text-red-700 border border-red-200 px-2.5 py-1 rounded-full text-[11px] font-semibold cursor-help"
                        >
                          <XCircle className="w-3.5 h-3.5 text-red-600" />
                          Failed
                        </span>
                      )}
                    </td>

                    {/* Individual Row Action: Send Button & Preview Button */}
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => onPreviewMessage(employee)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors"
                          title="Preview Message"
                        >
                          <Eye className="w-3.5 h-3.5 text-slate-500" />
                          Preview
                        </button>

                        <button
                          type="button"
                          onClick={() => onSendSingleEmployee(employee)}
                          disabled={isSending || employee.status === 'error'}
                          className={`inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                            isSending || employee.status === 'error'
                              ? 'bg-slate-100 text-slate-300 cursor-not-allowed'
                              : currentStatus === 'Failed'
                              ? 'bg-amber-100 hover:bg-amber-200 text-amber-800'
                              : currentStatus === 'Sent'
                              ? 'bg-blue-50 hover:bg-blue-100 text-blue-700'
                              : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                          }`}
                          title="Send to this employee"
                        >
                          {currentStatus === 'Failed' ? (
                            <>
                              <RefreshCw className="w-3 h-3" />
                              Retry
                            </>
                          ) : (
                            <>
                              <Send className="w-3 h-3" />
                              Send
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

