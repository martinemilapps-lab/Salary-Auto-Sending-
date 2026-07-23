'use client';

import React from 'react';
import { Send, CheckCircle2, XCircle, Loader2 } from 'lucide-react';

interface ProgressTrackerProps {
  total: number;
  currentCount: number;
  successCount: number;
  failedCount: number;
  currentEmployeeName?: string;
}

export const ProgressTracker: React.FC<ProgressTrackerProps> = ({
  total,
  currentCount,
  successCount,
  failedCount,
  currentEmployeeName,
}) => {
  const percentage = total > 0 ? Math.round((currentCount / total) * 100) : 0;

  return (
    <div className="bg-slate-900 border border-slate-800 text-white rounded-2xl p-6 shadow-xl mb-8 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <Loader2 className="w-5 h-5 animate-spin" />
          </div>
          <div>
            <h3 className="font-bold text-base text-white">Sending Salary Statements via WhatsApp</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Currently processing:{' '}
              <span className="font-semibold text-emerald-400">
                {currentEmployeeName || 'Preparing batch...'}
              </span>
            </p>
          </div>
        </div>

        <div className="text-right">
          <div className="text-2xl font-black text-white font-mono">{percentage}%</div>
          <p className="text-xs text-slate-400">
            {currentCount} of {total} Processed
          </p>
        </div>
      </div>

      {/* Progress Bar Container */}
      <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden mb-5">
        <div
          className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full transition-all duration-300 ease-out rounded-full"
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-800 text-center">
        <div className="bg-slate-800/50 p-3 rounded-xl">
          <p className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Total Batch</p>
          <p className="text-lg font-bold text-white font-mono mt-0.5">{total}</p>
        </div>
        <div className="bg-emerald-950/40 border border-emerald-800/40 p-3 rounded-xl">
          <p className="text-[11px] text-emerald-400 uppercase tracking-wider font-semibold flex items-center justify-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Delivered
          </p>
          <p className="text-lg font-bold text-emerald-400 font-mono mt-0.5">{successCount}</p>
        </div>
        <div className="bg-red-950/40 border border-red-800/40 p-3 rounded-xl">
          <p className="text-[11px] text-red-400 uppercase tracking-wider font-semibold flex items-center justify-center gap-1">
            <XCircle className="w-3.5 h-3.5" /> Failed
          </p>
          <p className="text-lg font-bold text-red-400 font-mono mt-0.5">{failedCount}</p>
        </div>
      </div>
    </div>
  );
};
