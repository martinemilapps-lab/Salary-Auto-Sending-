'use client';

import React from 'react';
import { Send, ShieldCheck, FileSpreadsheet } from 'lucide-react';

interface HeaderProps {
  apiMode?: 'production' | 'simulation';
}

export const Header: React.FC<HeaderProps> = ({ apiMode = 'simulation' }) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-40 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo & Name */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Send className="w-5 h-5 text-slate-950" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="font-bold text-lg tracking-tight text-white">HR Salary Sender</h1>
              <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-medium">
                v1.0
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">Automated Employee Salary WhatsApp Dispatcher</p>
          </div>
        </div>

        {/* API Status Badge & Template Quick Button */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 bg-slate-800/80 border border-slate-700 px-3 py-1.5 rounded-lg text-xs">
            <ShieldCheck className={`w-4 h-4 ${apiMode === 'production' ? 'text-emerald-400' : 'text-amber-400'}`} />
            <span className="text-slate-300 font-medium hidden md:inline">WhatsApp Engine:</span>
            <span className={`font-semibold ${apiMode === 'production' ? 'text-emerald-400' : 'text-amber-400'}`}>
              {apiMode === 'production' ? 'Cloud API Active' : 'Simulation Mode'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
