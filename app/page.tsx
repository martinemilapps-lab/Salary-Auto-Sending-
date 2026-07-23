'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { ExcelUpload } from '@/components/ExcelUpload';
import { ValidationErrors } from '@/components/ValidationErrors';
import { EmployeePreviewTable } from '@/components/EmployeePreviewTable';
import { MessagePreviewModal } from '@/components/MessagePreviewModal';
import { ProgressTracker } from '@/components/ProgressTracker';
import { ResultsSummary } from '@/components/ResultsSummary';

import { parseExcelFile } from '@/lib/excel-parser';
import { EmployeeRecord, ValidationError, BatchSendSummary, SendResultItem } from '@/types/salary';
import { UploadCloud, CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react';

export default function HomePage() {
  const [loadedFileName, setLoadedFileName] = useState<string | undefined>(undefined);
  const [parsedRecords, setParsedRecords] = useState<EmployeeRecord[]>([]);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [isParsing, setIsParsing] = useState<boolean>(false);

  // Sending state
  const [isSending, setIsSending] = useState<boolean>(false);
  const [sendProgress, setSendProgress] = useState<{
    total: number;
    currentCount: number;
    successCount: number;
    failedCount: number;
    currentEmployeeName?: string;
  }>({
    total: 0,
    currentCount: 0,
    successCount: 0,
    failedCount: 0,
  });

  // Preview & Summary
  const [previewEmployee, setPreviewEmployee] = useState<EmployeeRecord | null>(null);
  const [batchSummary, setBatchSummary] = useState<BatchSendSummary | null>(null);
  const [apiMode, setApiMode] = useState<'production' | 'simulation'>('simulation');

  const handleFileSelect = async (file: File) => {
    setIsParsing(true);
    setLoadedFileName(file.name);
    setBatchSummary(null);

    try {
      const result = await parseExcelFile(file);
      setParsedRecords(result.records);
      setValidationErrors(result.errors);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to parse Excel file.';
      setValidationErrors([
        {
          rowIndex: 0,
          field: 'Excel Read Error',
          message: msg,
          type: 'error',
        },
      ]);
    } finally {
      setIsParsing(false);
    }
  };

  const handleReset = () => {
    setLoadedFileName(undefined);
    setParsedRecords([]);
    setValidationErrors([]);
    setBatchSummary(null);
    setIsSending(false);
    setSendProgress({ total: 0, currentCount: 0, successCount: 0, failedCount: 0 });
  };

  // Execute Batch Sending Loop
  const handleStartSending = async () => {
    const validRecords = parsedRecords.filter((r) => r.status === 'valid' || r.status === 'warning');
    if (validRecords.length === 0) return;

    setIsSending(true);
    setBatchSummary(null);

    const total = validRecords.length;
    let successCount = 0;
    let failedCount = 0;
    const sendResults: SendResultItem[] = [];
    let detectedMode: 'production' | 'simulation' = 'simulation';
    const startTime = new Date().toISOString();

    setSendProgress({
      total,
      currentCount: 0,
      successCount: 0,
      failedCount: 0,
      currentEmployeeName: validRecords[0]?.employeeName,
    });

    for (let i = 0; i < validRecords.length; i++) {
      const emp = validRecords[i];

      setSendProgress({
        total,
        currentCount: i + 1,
        successCount,
        failedCount,
        currentEmployeeName: emp.employeeName,
      });

      try {
        const response = await fetch('/api/send-salary', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ employee: emp }),
        });

        const data = await response.json();
        if (data.mode) {
          detectedMode = data.mode;
          setApiMode(data.mode);
        }

        if (response.ok && data.success) {
          successCount++;
          sendResults.push({
            employeeId: emp.employeeId,
            employeeName: emp.employeeName,
            whatsappNumber: emp.formattedPhone || emp.whatsappNumber,
            netSalary: emp.netSalary,
            currency: emp.currency,
            status: 'success',
            sentAt: data.sentAt || new Date().toISOString(),
            messageId: data.messageId,
          });
        } else {
          failedCount++;
          sendResults.push({
            employeeId: emp.employeeId,
            employeeName: emp.employeeName,
            whatsappNumber: emp.formattedPhone || emp.whatsappNumber,
            netSalary: emp.netSalary,
            currency: emp.currency,
            status: 'failed',
            errorDetails: data.error || 'HTTP request failed',
          });
        }
      } catch (err: unknown) {
        failedCount++;
        const errorMsg = err instanceof Error ? err.message : 'Network failure';
        sendResults.push({
          employeeId: emp.employeeId,
          employeeName: emp.employeeName,
          whatsappNumber: emp.formattedPhone || emp.whatsappNumber,
          netSalary: emp.netSalary,
          currency: emp.currency,
          status: 'failed',
          errorDetails: errorMsg,
        });
      }

      // Update live counters
      setSendProgress((prev) => ({
        ...prev,
        successCount,
        failedCount,
      }));
    }

    setIsSending(false);

    // Finalize summary report
    setBatchSummary({
      total,
      successful: successCount,
      failed: failedCount,
      mode: detectedMode,
      startedAt: startTime,
      completedAt: new Date().toISOString(),
      results: sendResults,
    });
  };

  const hasBlockingErrors = validationErrors.some((e) => e.type === 'error');

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* Top Business Navigation Header */}
      <Header apiMode={apiMode} />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Hero Section */}
        <div className="mb-10 text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold mb-4 border border-emerald-200">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Meta WhatsApp Cloud API Integration
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            HR Salary Sender
          </h1>
          <p className="text-base sm:text-lg text-slate-600 mt-3 font-normal leading-relaxed">
            Upload an Excel file and send salary notifications via WhatsApp.
          </p>

          {/* Initial Disabled CTA when no file loaded */}
          {!loadedFileName && (
            <div className="mt-6 inline-flex items-center gap-3">
              <button
                type="button"
                disabled={true}
                className="px-6 py-3 bg-slate-200 text-slate-400 font-bold rounded-xl text-sm cursor-not-allowed shadow-none border border-slate-300"
              >
                Upload Excel
              </button>
            </div>
          )}
        </div>

        {/* Step 1: Excel Upload Dropzone & Sample Template */}
        <ExcelUpload
          onFileSelect={handleFileSelect}
          isLoading={isParsing}
          loadedFileName={loadedFileName}
          totalRecords={parsedRecords.length}
          onReset={handleReset}
        />

        {/* Step 2: Validation Error Alerts */}
        {loadedFileName && validationErrors.length > 0 && (
          <div className="mt-6">
            <ValidationErrors errors={validationErrors} />
          </div>
        )}

        {/* Step 3: Active Progress Tracker */}
        {isSending && (
          <div className="mt-6">
            <ProgressTracker
              total={sendProgress.total}
              currentCount={sendProgress.currentCount}
              successCount={sendProgress.successCount}
              failedCount={sendProgress.failedCount}
              currentEmployeeName={sendProgress.currentEmployeeName}
            />
          </div>
        )}

        {/* Step 4: Results Summary & CSV Audit Download */}
        {!isSending && batchSummary && (
          <div className="mt-6">
            <ResultsSummary summary={batchSummary} onReset={handleReset} />
          </div>
        )}

        {/* Step 5: Interactive Employee Preview Table */}
        {loadedFileName && parsedRecords.length > 0 && !isSending && !batchSummary && (
          <div className="mt-8">
            <EmployeePreviewTable
              records={parsedRecords}
              onPreviewMessage={(emp) => setPreviewEmployee(emp)}
              onStartSending={handleStartSending}
              isSending={isSending}
              hasErrors={hasBlockingErrors}
            />
          </div>
        )}
      </main>

      {/* Message Preview Modal */}
      <MessagePreviewModal
        employee={previewEmployee}
        onClose={() => setPreviewEmployee(null)}
      />

      {/* Clean Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 text-xs py-6 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© 2026 HR Salary Sender — Internal Business Automation System</p>
          <p className="text-slate-500">Official Meta WhatsApp Cloud API Endpoint</p>
        </div>
      </footer>
    </div>
  );
}
