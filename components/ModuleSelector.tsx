'use client';

import React from 'react';
import { CalendarDays, CalendarCheck, ArrowRight, ArrowLeft, ShieldCheck, CheckCircle2, Sparkles, Layers } from 'lucide-react';
import { StatementType } from '@/types/common';
import { useTranslation } from '@/lib/i18n';

interface ModuleSelectorProps {
  onSelectModule: (module: StatementType) => void;
}

export const ModuleSelector: React.FC<ModuleSelectorProps> = ({ onSelectModule }) => {
  const { t, direction } = useTranslation();
  const ArrowIcon = direction === 'rtl' ? ArrowLeft : ArrowRight;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 animate-fadeIn">
      {/* Top Banner / Hero */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-brand-50 text-brand-700 border border-brand-200 rounded-full text-xs font-bold mb-4 shadow-sm">
          <ShieldCheck className="w-4 h-4 text-brand-600" />
          {t.metaBadge}
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
          {t.chooseModuleTitle}
        </h1>
        <p className="text-slate-600 mt-3 text-base sm:text-lg leading-relaxed">
          {t.chooseModuleDesc}
        </p>
      </div>

      {/* Two Distinct Business Module Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Module 1: Weekly Statement */}
        <div className="bg-white rounded-3xl border-2 border-slate-200/90 hover:border-brand-600/70 p-7 sm:p-8 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group relative overflow-hidden">
          {/* Subtle Top Red Bar Indicator on Hover */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-brand-600 to-rose-500 opacity-90" />

          <div>
            {/* Header / Badge */}
            <div className="flex items-center justify-between gap-3 mb-6">
              <div className="w-14 h-14 rounded-2xl bg-brand-50 text-brand-700 border border-brand-100 flex items-center justify-center group-hover:scale-105 group-hover:bg-brand-600 group-hover:text-white transition-all duration-300 shadow-sm">
                <CalendarDays className="w-7 h-7" />
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                {t.weeklyBadge}
              </span>
            </div>

            {/* Title & Subtitle */}
            <h2 className="text-2xl font-bold text-slate-900 group-hover:text-brand-700 transition-colors">
              {t.weeklyModuleTitle}
            </h2>
            <p className="text-xs font-semibold text-slate-400 mt-0.5 tracking-wider uppercase">
              {t.weeklyModuleSub}
            </p>

            <p className="text-sm text-slate-600 mt-4 leading-relaxed font-normal">
              {t.weeklyModuleDesc}
            </p>

            {/* Features preview */}
            <div className="mt-6 pt-5 border-t border-slate-100 space-y-2.5 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-brand-600 shrink-0" />
                <span>مطابقة 16 بنداً للأجور، الحوافز، والبدلات الأسبوعية</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-brand-600 shrink-0" />
                <span>إرسال فردي أو جماعي (إرسال الكل) بقالب أسبوعي معتمد</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-brand-600 shrink-0" />
                <span>تدقيق فوري لأرقام الواتساب ومنع الأخطاء الحسابية</span>
              </div>
            </div>
          </div>

          {/* Action CTA Button */}
          <div className="mt-8 pt-4">
            <button
              type="button"
              onClick={() => onSelectModule('weekly')}
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-slate-900 hover:bg-brand-700 text-white font-bold rounded-2xl text-sm transition-all duration-200 shadow-md group-hover:shadow-brand-700/25"
            >
              <span>{t.openWeeklyBtn}</span>
              <ArrowIcon className="w-4 h-4 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        {/* Module 2: Monthly Statement */}
        <div className="bg-white rounded-3xl border-2 border-slate-200/90 hover:border-brand-600/70 p-7 sm:p-8 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group relative overflow-hidden">
          {/* Subtle Top Red Bar Indicator */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-rose-500 to-brand-700 opacity-90" />

          <div>
            {/* Header / Badge */}
            <div className="flex items-center justify-between gap-3 mb-6">
              <div className="w-14 h-14 rounded-2xl bg-brand-50 text-brand-700 border border-brand-100 flex items-center justify-center group-hover:scale-105 group-hover:bg-brand-600 group-hover:text-white transition-all duration-300 shadow-sm">
                <CalendarCheck className="w-7 h-7" />
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                {t.monthlyBadge}
              </span>
            </div>

            {/* Title & Subtitle */}
            <h2 className="text-2xl font-bold text-slate-900 group-hover:text-brand-700 transition-colors">
              {t.monthlyModuleTitle}
            </h2>
            <p className="text-xs font-semibold text-slate-400 mt-0.5 tracking-wider uppercase">
              {t.monthlyModuleSub}
            </p>

            <p className="text-sm text-slate-600 mt-4 leading-relaxed font-normal">
              {t.monthlyModuleDesc}
            </p>

            {/* Features preview */}
            <div className="mt-6 pt-5 border-t border-slate-100 space-y-2.5 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-brand-600 shrink-0" />
                <span>مطابقة 16 بنداً للأجور الشاملة، الضرائب، السلف، والأرصدة</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-brand-600 shrink-0" />
                <span>إرسال فردي أو جماعي (إرسال الكل) بقالب شهري معتمد</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-brand-600 shrink-0" />
                <span>تدقيق فوري لمفردات المرتب ورصيد الإجازات والعارضة</span>
              </div>
            </div>
          </div>

          {/* Action CTA Button */}
          <div className="mt-8 pt-4">
            <button
              type="button"
              onClick={() => onSelectModule('monthly')}
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-slate-900 hover:bg-brand-700 text-white font-bold rounded-2xl text-sm transition-all duration-200 shadow-md group-hover:shadow-brand-700/25"
            >
              <span>{t.openMonthlyBtn}</span>
              <ArrowIcon className="w-4 h-4 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
