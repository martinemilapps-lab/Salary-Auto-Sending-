'use client';

import React from 'react';
import { CheckCircle2, XCircle, Loader2, Hourglass, Send } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';

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
  const { t } = useTranslation();
  const remaining = Math.max(0, total - currentCount);
  const percentage = total > 0 ? Math.round((currentCount / total) * 100) : 0;

  return (
    <div className="bg-slate-900 border border-slate-800 text-white rounded-3xl p-6 sm:p-7 shadow-xl mb-8 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-brand-900/60 text-brand-400 border border-brand-800/60 flex items-center justify-center shrink-0">
            <Loader2 className="w-6 h-6 animate-spin text-brand-400" />
          </div>
          <div>
            <h3 className="font-extrabold text-base sm:text-lg text-white">
              {t.sendingInProgress}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {t.sendingTo}{' '}
              <span className="font-bold text-brand-300">
                {currentEmployeeName || '...'}
              </span>
            </p>
          </div>
        </div>

        <div className="text-start sm:text-end">
          <div className="text-3xl font-black text-white font-mono">{percentage}%</div>
          <p className="text-xs text-slate-400">
            {t.processedOf} {currentCount} / {total}
          </p>
        </div>
      </div>

      {/* Progress Bar Container */}
      <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden mb-6 p-0.5 border border-slate-700/50">
        <div
          className="bg-gradient-to-r from-brand-600 via-rose-500 to-emerald-400 h-full transition-all duration-300 ease-out rounded-full"
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Metrics Grid (5 Items) */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-4 border-t border-slate-800 text-center">
        <div className="bg-slate-800/60 p-3 rounded-2xl border border-slate-700/60">
          <p className="text-[11px] text-slate-400 uppercase tracking-wider font-bold">{t.statTotal}</p>
          <p className="text-lg font-black text-white font-mono mt-0.5">{total}</p>
        </div>

        <div className="bg-slate-800/60 p-3 rounded-2xl border border-slate-700/60">
          <p className="text-[11px] text-amber-400 uppercase tracking-wider font-bold flex items-center justify-center gap-1">
            <Hourglass className="w-3.5 h-3.5 text-amber-400" />
            <span>{t.statRemaining}</span>
          </p>
          <p className="text-lg font-black text-amber-300 font-mono mt-0.5">{remaining}</p>
        </div>

        <div className="bg-slate-800/60 p-3 rounded-2xl border border-slate-700/60 col-span-2 sm:col-span-1">
          <p className="text-[11px] text-blue-400 uppercase tracking-wider font-bold flex items-center justify-center gap-1">
            <Send className="w-3.5 h-3.5 text-blue-400" />
            <span>{t.statCurrent}</span>
          </p>
          <p className="text-xs font-bold text-blue-300 truncate mt-1 px-1">
            {currentEmployeeName || '...'}
          </p>
        </div>

        <div className="bg-emerald-950/50 border border-emerald-800/50 p-3 rounded-2xl">
          <p className="text-[11px] text-emerald-400 uppercase tracking-wider font-bold flex items-center justify-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{t.statSent}</span>
          </p>
          <p className="text-lg font-black text-emerald-400 font-mono mt-0.5">{successCount}</p>
        </div>

        <div className="bg-red-950/50 border border-red-800/50 p-3 rounded-2xl">
          <p className="text-[11px] text-red-400 uppercase tracking-wider font-bold flex items-center justify-center gap-1">
            <XCircle className="w-3.5 h-3.5" />
            <span>{t.statFailed}</span>
          </p>
          <p className="text-lg font-black text-red-400 font-mono mt-0.5">{failedCount}</p>
        </div>
      </div>
    </div>
  );
};
