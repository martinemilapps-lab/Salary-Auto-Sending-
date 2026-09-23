'use client';

import React, { useState, useRef } from 'react';
import { UploadCloud, FileSpreadsheet, Download, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';
import { StatementType } from '@/types/common';
import { downloadWeeklySampleExcelTemplate, downloadMonthlySampleExcelTemplate } from '@/utils/sample-data';
import { useTranslation } from '@/lib/i18n';

interface ExcelUploadProps {
  statementType: StatementType;
  onFileSelect: (file: File) => void;
  isLoading: boolean;
  loadedFileName?: string;
  totalRecords?: number;
  onReset?: () => void;
}

export const ExcelUpload: React.FC<ExcelUploadProps> = ({
  statementType,
  onFileSelect,
  isLoading,
  loadedFileName,
  totalRecords,
  onReset,
}) => {
  const { t } = useTranslation();
  const [isDragging, setIsDragging] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    setErrorMsg(null);
    const validExtensions = ['.xlsx', '.xls'];
    const fileName = file.name.toLowerCase();
    const isValid = validExtensions.some((ext) => fileName.endsWith(ext));

    if (!isValid) {
      setErrorMsg(t.invalidFileFormat);
      return;
    }

    onFileSelect(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFile(e.target.files[0]);
    }
  };

  const handleDownloadSample = () => {
    if (statementType === 'weekly') {
      downloadWeeklySampleExcelTemplate();
    } else {
      downloadMonthlySampleExcelTemplate();
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-sm">
      {/* Title & Sample Download Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100 mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-700 flex items-center justify-center">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <span>
              {t.uploadTitle} ({statementType === 'weekly' ? t.weeklyModuleTitle : t.monthlyModuleTitle})
            </span>
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            {statementType === 'weekly' ? t.uploadDescWeekly : t.uploadDescMonthly}
          </p>
        </div>

        <button
          type="button"
          onClick={handleDownloadSample}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-semibold rounded-xl transition-colors shrink-0 shadow-sm"
        >
          <Download className="w-4 h-4 text-slate-600" />
          <span>
            {statementType === 'weekly' ? t.downloadWeeklySample : t.downloadMonthlySample}
          </span>
        </button>
      </div>

      {loadedFileName ? (
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <p className="font-bold text-slate-900 text-base">{loadedFileName}</p>
              <p className="text-xs text-slate-500 mt-0.5">
                {t.recordsParsed}: <span className="font-extrabold text-slate-900">{totalRecords}</span> {t.recordsCount}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs sm:text-sm font-semibold rounded-xl transition-colors shadow-sm"
          >
            <RefreshCw className="w-4 h-4 text-slate-500" />
            <span>{t.uploadDifferentFile}</span>
          </button>
        </div>
      ) : (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-3xl p-8 sm:p-10 text-center cursor-pointer transition-all duration-200 ${
            isDragging
              ? 'border-brand-600 bg-brand-50/50 scale-[1.01]'
              : 'border-slate-300 hover:border-brand-500 bg-slate-50/40 hover:bg-slate-50/80'
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleChange}
            accept=".xlsx, .xls"
            className="hidden"
          />

          <div className="w-16 h-16 bg-brand-50 text-brand-700 border border-brand-100 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm group-hover:scale-105 transition-transform">
            <UploadCloud className="w-8 h-8 text-brand-600" />
          </div>

          <h3 className="text-lg font-bold text-slate-800">
            {isLoading ? t.parsingFile : t.dropzoneTitle}
          </h3>

          <p className="text-xs sm:text-sm text-slate-500 mt-1.5">
            {t.dropzoneSub}
          </p>

          <div className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-brand-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md transition-colors">
            {t.selectFileBtn}
          </div>
        </div>
      )}

      {errorMsg && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 text-red-700 text-xs sm:text-sm">
          <AlertCircle className="w-5 h-5 shrink-0 text-red-500" />
          <span>{errorMsg}</span>
        </div>
      )}
    </div>
  );
};
