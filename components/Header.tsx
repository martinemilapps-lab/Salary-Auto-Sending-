'use client';

import React from 'react';
import { Send, ShieldCheck, Key, Globe, ArrowLeft, ArrowRight, LayoutGrid, CalendarDays, CalendarCheck } from 'lucide-react';
import { StatementType } from '@/types/common';
import { useTranslation } from '@/lib/i18n';

interface HeaderProps {
  apiMode?: 'production' | 'simulation' | 'unconfigured';
  isConfigured?: boolean;
  activeModule?: StatementType | null;
  onBackToModules?: () => void;
  onSwitchModule?: (mod: StatementType) => void;
}

export const Header: React.FC<HeaderProps> = ({
  apiMode = 'unconfigured',
  isConfigured,
  activeModule,
  onBackToModules,
  onSwitchModule,
}) => {
  const { t, language, toggleLanguage, direction } = useTranslation();
  const active = isConfigured !== undefined ? isConfigured : apiMode === 'production';
  const BackArrow = direction === 'rtl' ? ArrowRight : ArrowLeft;

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-40 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo & Product Name */}
        <div className="flex items-center space-x-3 rtl:space-x-reverse">
          <button
            type="button"
            onClick={onBackToModules}
            className="flex items-center space-x-3 rtl:space-x-reverse text-left rtl:text-right group focus:outline-none"
            title={activeModule ? t.backToModules : t.appName}
          >
            <div className="w-10 h-10 rounded-xl bg-brand-700 hover:bg-brand-600 text-white flex items-center justify-center shadow-md shadow-brand-900/30 transition-transform group-hover:scale-105 shrink-0">
              <Send className="w-5 h-5 -rotate-12 rtl:rotate-180" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base sm:text-lg tracking-tight text-white group-hover:text-brand-300 transition-colors">
                  {t.appName}
                </span>
                <span className="text-[11px] bg-slate-800 text-slate-300 border border-slate-700 px-2 py-0.5 rounded-md font-semibold">
                  v2.0
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden md:block">
                {t.appTagline}
              </p>
            </div>
          </button>

          {/* Active Module Indicator & Quick Switcher */}
          {activeModule && (
            <div className="hidden sm:flex items-center gap-2 ms-4 ps-4 border-s border-slate-700">
              <span className="text-xs text-slate-400">{t.currentModule}:</span>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-brand-950/80 text-brand-300 border border-brand-800/80 shadow-inner">
                {activeModule === 'weekly' ? (
                  <CalendarDays className="w-3.5 h-3.5 text-brand-400" />
                ) : (
                  <CalendarCheck className="w-3.5 h-3.5 text-brand-400" />
                )}
                <span>
                  {activeModule === 'weekly' ? t.weeklyModuleTitle : t.monthlyModuleTitle}
                </span>
              </div>

              {onBackToModules && (
                <button
                  type="button"
                  onClick={onBackToModules}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                  title={t.switchModule}
                >
                  <LayoutGrid className="w-3.5 h-3.5 text-slate-400" />
                  <span className="hidden lg:inline">{t.switchModule}</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Right Action Controls: Language Toggle & API Status Badge */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Language Switcher */}
          <button
            type="button"
            onClick={toggleLanguage}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700/90 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95"
            title="Switch Language / تبديل اللغة"
          >
            <Globe className="w-3.5 h-3.5 text-slate-400" />
            <span>{language === 'ar' ? 'English' : 'العربية'}</span>
          </button>

          {/* WhatsApp API Status Badge */}
          <div className="flex items-center gap-1.5 bg-slate-800/90 border border-slate-700 px-3 py-1.5 rounded-xl text-xs">
            {active ? (
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <Key className="w-4 h-4 text-amber-400 shrink-0" />
            )}
            <span className="text-slate-400 font-medium hidden md:inline">
              {t.whatsappEngine}
            </span>
            <span
              className={`font-bold ${
                active ? 'text-emerald-400' : 'text-amber-400'
              }`}
            >
              {active ? t.cloudApiActive : t.credentialsMissing}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
