'use client';

import React, { useState } from 'react';
import { AlertTriangle, XCircle, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';
import { ValidationError } from '@/types/salary';

interface ValidationErrorsProps {
  errors: ValidationError[];
}

export const ValidationErrors: React.FC<ValidationErrorsProps> = ({ errors }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  if (!errors || errors.length === 0) return null;

  const errorCount = errors.filter((e) => e.type === 'error').length;
  const warningCount = errors.filter((e) => e.type === 'warning').length;

  return (
    <div className={`rounded-2xl border mb-6 overflow-hidden transition-all ${
      errorCount > 0 ? 'bg-red-50/70 border-red-200' : 'bg-amber-50/70 border-amber-200'
    }`}>
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="p-5 flex items-center justify-between cursor-pointer select-none"
      >
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
            errorCount > 0 ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'
          }`}>
            {errorCount > 0 ? (
              <XCircle className="w-6 h-6 text-red-600" />
            ) : (
              <AlertTriangle className="w-6 h-6 text-amber-600" />
            )}
          </div>
          <div>
            <h3 className={`font-bold text-base ${errorCount > 0 ? 'text-red-900' : 'text-amber-900'}`}>
              Validation Attention Required
            </h3>
            <p className="text-xs text-slate-600 mt-0.5">
              Found{' '}
              {errorCount > 0 && (
                <span className="font-bold text-red-700">{errorCount} blocking error{errorCount > 1 ? 's' : ''}</span>
              )}
              {errorCount > 0 && warningCount > 0 && ' and '}
              {warningCount > 0 && (
                <span className="font-bold text-amber-700">{warningCount} warning{warningCount > 1 ? 's' : ''}</span>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium hidden sm:inline">
            {isExpanded ? 'Hide Details' : 'Show Details'}
          </span>
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-slate-500" />
          ) : (
            <ChevronDown className="w-5 h-5 text-slate-500" />
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="px-5 pb-5 pt-2 border-t border-slate-200/50">
          <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
            {errors.map((err, index) => (
              <div
                key={index}
                className={`p-3 rounded-xl border text-xs flex items-start gap-3 ${
                  err.type === 'error'
                    ? 'bg-white border-red-200 text-red-900'
                    : 'bg-white border-amber-200 text-amber-900'
                }`}
              >
                <AlertCircle
                  className={`w-4 h-4 shrink-0 mt-0.5 ${
                    err.type === 'error' ? 'text-red-500' : 'text-amber-500'
                  }`}
                />
                <div className="flex-1">
                  <div className="font-semibold flex items-center justify-between">
                    <span>
                      {err.rowIndex > 0 ? `Row ${err.rowIndex}` : 'File Header'}: {err.field}
                    </span>
                    {err.employeeName && (
                      <span className="text-slate-500 font-normal">{err.employeeName} ({err.employeeId})</span>
                    )}
                  </div>
                  <p className="mt-0.5 text-slate-700">{err.message}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
