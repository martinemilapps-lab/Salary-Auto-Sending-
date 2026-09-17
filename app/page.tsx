'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { ExcelUpload } from '@/components/ExcelUpload';
import { ValidationErrors } from '@/components/ValidationErrors';
import { EmployeePreviewTable } from '@/components/EmployeePreviewTable';
import { MessagePreviewModal } from '@/components/MessagePreviewModal';
import { SendConfirmationModal } from '@/components/SendConfirmationModal';
import { ProgressTracker } from '@/components/ProgressTracker';
import { ResultsSummary } from '@/components/ResultsSummary';

import { parseExcelFile } from '@/lib/excel-parser';
import {
  EmployeeRecord,
  ValidationError,
  BatchSendSummary,
  SendResultItem,
  RowSendStatus,
} from '@/types/salary';
import { ShieldCheck } from 'lucide-react';

export default function HomePage() {
  const [loadedFileName, setLoadedFileName] = useState<string | undefined>(undefined);
  const [parsedRecords, setParsedRecords] = useState<EmployeeRecord[]>([]);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [isParsing, setIsParsing] = useState<boolean>(false);

  // Sending state & progress tracking
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

  // Preview & Confirmation Modals
  const [previewEmployee, setPreviewEmployee] = useState<EmployeeRecord | null>(null);
  const [confirmationState, setConfirmationState] = useState<{
    isOpen: boolean;
    mode: 'batch' | 'single' | 'retry';
    targetEmployee?: EmployeeRecord;
  }>({
    isOpen: false,
    mode: 'batch',
  });

  // Final Execution Summary
  const [batchSummary, setBatchSummary] = useState<BatchSendSummary | null>(null);
  const [apiMode, setApiMode] = useState<'production' | 'simulation' | 'unconfigured'>('unconfigured');
  const [isConfigured, setIsConfigured] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    async function checkWhatsAppConfig() {
      try {
        const response = await fetch('/api/whatsapp-status');
        if (response.ok) {
          const data = await response.json();
          if (isMounted) {
            const configured = Boolean(data.isConfigured || data.configured);
            setIsConfigured(configured);
            setApiMode(configured ? 'production' : 'unconfigured');
          }
        }
      } catch {
        if (isMounted) {
          setIsConfigured(false);
          setApiMode('unconfigured');
        }
      }
    }
    checkWhatsAppConfig();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleFileSelect = async (file: File) => {
    setIsParsing(true);
    setLoadedFileName(file.name);
    setBatchSummary(null);

    try {
      const result = await parseExcelFile(file);
      // Initialize row sendStatus to 'Ready'
      const initializedRecords: EmployeeRecord[] = result.records.map((r) => ({
        ...r,
        sendStatus: 'Ready' as RowSendStatus,
      }));
      setParsedRecords(initializedRecords);
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

  // Helper to update a single record's send status in real-time
  const updateRecordStatus = (
    id: string,
    status: RowSendStatus,
    errorDetails?: string,
    messageId?: string,
    sentAt?: string
  ) => {
    setParsedRecords((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              sendStatus: status,
              sendErrorDetails: errorDetails,
              messageId,
              sentAt,
            }
          : r
      )
    );
  };

  // Open confirmation for Send All
  const promptBatchSending = () => {
    const validRecords = parsedRecords.filter((r) => r.status !== 'error');
    if (validRecords.length === 0) return;

    setConfirmationState({
      isOpen: true,
      mode: 'batch',
    });
  };

  // Open confirmation for Individual Send
  const promptSingleSending = (employee: EmployeeRecord) => {
    if (employee.status === 'error') return;

    setConfirmationState({
      isOpen: true,
      mode: 'single',
      targetEmployee: employee,
    });
  };

  // Open confirmation for Retry Failed
  const promptRetryFailed = () => {
    const failedRecords = parsedRecords.filter((r) => r.sendStatus === 'Failed');
    if (failedRecords.length === 0) return;

    setConfirmationState({
      isOpen: true,
      mode: 'retry',
    });
  };

  // Execute single employee notification dispatch
  const executeSingleSend = async (employee: EmployeeRecord) => {
    setIsSending(true);
    updateRecordStatus(employee.id, 'Sending');

    try {
      const response = await fetch('/api/send-salary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employee }),
      });

      const data = await response.json();
      if (data.mode) {
        setApiMode(data.mode);
      }

      if (response.ok && data.success) {
        updateRecordStatus(
          employee.id,
          'Sent',
          undefined,
          data.messageId,
          data.sentAt || new Date().toISOString()
        );
      } else {
        updateRecordStatus(
          employee.id,
          'Failed',
          data.error || 'Failed to dispatch WhatsApp notification.'
        );
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Network failure';
      updateRecordStatus(employee.id, 'Failed', errorMsg);
    } finally {
      setIsSending(false);
    }
  };

  // Execute Batch Sending Loop
  const executeBatchSending = async (targetRecords?: EmployeeRecord[]) => {
    // Target either explicitly provided records (e.g. for retry) or all non-error records
    const recordsToProcess =
      targetRecords || parsedRecords.filter((r) => r.status !== 'error');

    if (recordsToProcess.length === 0) return;

    setIsSending(true);
    setBatchSummary(null);

    const total = recordsToProcess.length;
    let successCount = 0;
    let failedCount = 0;
    const sendResults: SendResultItem[] = [];
    let detectedMode: 'production' | 'simulation' | 'unconfigured' = 'unconfigured';
    const startTime = new Date().toISOString();

    setSendProgress({
      total,
      currentCount: 0,
      successCount: 0,
      failedCount: 0,
      currentEmployeeName: recordsToProcess[0]?.employeeName,
    });

    for (let i = 0; i < recordsToProcess.length; i++) {
      const emp = recordsToProcess[i];

      // Update row status to Sending
      updateRecordStatus(emp.id, 'Sending');

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
          const sentAtStr = data.sentAt || new Date().toISOString();
          updateRecordStatus(emp.id, 'Sent', undefined, data.messageId, sentAtStr);

          sendResults.push({
            employeeId: emp.employeeId,
            employeeName: emp.employeeName,
            whatsappNumber: emp.formattedPhone || emp.whatsappNumber,
            netSalary: emp.netSalary,
            currency: emp.currency,
            status: 'success',
            sentAt: sentAtStr,
            messageId: data.messageId,
          });
        } else {
          failedCount++;
          const errDetail = data.error || 'WhatsApp API request failed';
          updateRecordStatus(emp.id, 'Failed', errDetail);

          sendResults.push({
            employeeId: emp.employeeId,
            employeeName: emp.employeeName,
            whatsappNumber: emp.formattedPhone || emp.whatsappNumber,
            netSalary: emp.netSalary,
            currency: emp.currency,
            status: 'failed',
            errorDetails: errDetail,
          });
        }
      } catch (err: unknown) {
        failedCount++;
        const errorMsg = err instanceof Error ? err.message : 'Network Exception';
        updateRecordStatus(emp.id, 'Failed', errorMsg);

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

  // Handle confirmation modal trigger
  const handleConfirmedAction = () => {
    if (confirmationState.mode === 'batch') {
      executeBatchSending();
    } else if (confirmationState.mode === 'single' && confirmationState.targetEmployee) {
      executeSingleSend(confirmationState.targetEmployee);
    } else if (confirmationState.mode === 'retry') {
      const failedRecords = parsedRecords.filter((r) => r.sendStatus === 'Failed');
      executeBatchSending(failedRecords);
    }
  };

  const hasBlockingErrors = validationErrors.some((e) => e.type === 'error');
  const validRecordsCount = parsedRecords.filter((r) => r.status !== 'error').length;
  const failedRecordsCount = parsedRecords.filter((r) => r.sendStatus === 'Failed').length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* Top Business Navigation Header */}
      <Header apiMode={apiMode} isConfigured={isConfigured} />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Hero Section */}
        <div className="mb-10 text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold mb-4 border border-emerald-200">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Meta WhatsApp Cloud API Business Automation
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            HR Salary Sender
          </h1>
          <p className="text-base sm:text-lg text-slate-600 mt-3 font-normal leading-relaxed">
            Upload an Excel payroll file to parse, validate, and send personalized salary statements via WhatsApp.
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
            <ResultsSummary
              summary={batchSummary}
              onReset={handleReset}
              onRetryFailed={promptRetryFailed}
            />
          </div>
        )}

        {/* Step 5: Interactive Employee Preview Table */}
        {loadedFileName && parsedRecords.length > 0 && !isSending && (
          <div className="mt-8">
            <EmployeePreviewTable
              records={parsedRecords}
              onPreviewMessage={(emp) => setPreviewEmployee(emp)}
              onStartBatchSending={promptBatchSending}
              onSendSingleEmployee={promptSingleSending}
              isSending={isSending}
              hasErrors={hasBlockingErrors}
            />
          </div>
        )}
      </main>

      {/* Confirmation Modal */}
      <SendConfirmationModal
        isOpen={confirmationState.isOpen}
        mode={confirmationState.mode}
        totalCount={
          confirmationState.mode === 'single'
            ? 1
            : confirmationState.mode === 'retry'
            ? failedRecordsCount
            : validRecordsCount
        }
        employeeName={confirmationState.targetEmployee?.employeeName}
        onConfirm={handleConfirmedAction}
        onClose={() => setConfirmationState({ isOpen: false, mode: 'batch' })}
      />

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

