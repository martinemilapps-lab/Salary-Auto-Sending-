'use client';

import React, { useState, useRef } from 'react';
import { UploadCloud, FileSpreadsheet, Download, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';
import { downloadSampleExcelTemplate } from '@/utils/sample-data';

interface ExcelUploadProps {
  onFileSelect: (file: File) => void;
  isLoading: boolean;
  loadedFileName?: string;
  totalRecords?: number;
  onReset?: () => void;
}

export const ExcelUpload: React.FC<ExcelUploadProps> = ({
  onFileSelect,
  isLoading,
  loadedFileName,
  totalRecords,
  onReset,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    setErrorMsg(null);
    const validExtensions = ['.xlsx', '.xls'];
    const fileName = file.name.toLowerCase();
    const isValid = validExtensions.some((ext) => fileName.endsWith(ext));

    if (!isValid) {
      setErrorMsg('Invalid file format. Please upload an Excel spreadsheet (.xlsx or .xls).');
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

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100 mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
            Upload Salary Spreadsheet
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Upload your monthly employee salary Excel file to parse records and generate WhatsApp statements.
          </p>
        </div>

        <button
          type="button"
          onClick={downloadSampleExcelTemplate}
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-xl transition-colors shrink-0"
        >
          <Download className="w-4 h-4 text-slate-600" />
          Download Sample Template
        </button>
      </div>

      {loadedFileName ? (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <p className="font-semibold text-slate-900 text-base">{loadedFileName}</p>
              <p className="text-xs text-slate-500 mt-0.5">
                Successfully parsed <span className="font-bold text-slate-800">{totalRecords}</span> employee records
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 text-sm font-medium rounded-xl transition-colors"
          >
            <RefreshCw className="w-4 h-4 text-slate-500" />
            Upload Different File
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
          className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
            isDragging
              ? 'border-emerald-500 bg-emerald-50/50'
              : 'border-slate-300 hover:border-slate-400 bg-slate-50/50 hover:bg-slate-50'
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleChange}
            accept=".xlsx, .xls"
            className="hidden"
          />

          <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <UploadCloud className="w-7 h-7 text-emerald-600" />
          </div>

          <h3 className="text-lg font-bold text-slate-800">
            {isLoading ? 'Parsing Spreadsheet...' : 'Drop your Excel file here, or browse'}
          </h3>

          <p className="text-sm text-slate-500 mt-1">Supports .xlsx and .xls spreadsheets</p>

          <div className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white text-sm font-semibold rounded-xl shadow-sm hover:bg-slate-800 transition-colors">
            Select File from Computer
          </div>
        </div>
      )}

      {errorMsg && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0 text-red-500" />
          <span>{errorMsg}</span>
        </div>
      )}
    </div>
  );
};
