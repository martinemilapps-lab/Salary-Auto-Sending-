'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { ModuleSelector } from '@/components/ModuleSelector';
import { ExcelUpload } from '@/components/ExcelUpload';
import { ValidationErrors } from '@/components/ValidationErrors';
import { EmployeePreviewTable } from '@/components/EmployeePreviewTable';
import { MessagePreviewModal } from '@/components/MessagePreviewModal';
import { SendConfirmationModal } from '@/components/SendConfirmationModal';
import { ProgressTracker } from '@/components/ProgressTracker';
import { ResultsSummary } from '@/components/ResultsSummary';

import { parseWeeklyExcelFile } from '@/lib/excel/weekly-mapper';
import { parseMonthlyExcelFile } from '@/lib/excel/monthly-mapper';
import {
  StatementType,
  ValidationError,
  BatchSendSummary,
  SendResultItem,
  RowSendStatus,
  WhatsAppConfigStatus,
} from '@/types/common';
import { WeeklyEmployeeRecord } from '@/types/weekly';
import { MonthlyEmployeeRecord } from '@/types/monthly';
import { useTranslation } from '@/lib/i18n';
import { CheckCircle2, ChevronRight, ChevronLeft } from 'lucide-react';

export default function HomePage() {
  const { t, direction } = useTranslation();
  const StepArrow = direction === 'rtl' ? ChevronLeft : ChevronRight;

  // Active business module ('weekly' | 'monthly' | null for module selection landing)
  const [activeModule, setActiveModule] = useState<StatementType | null>(null);

  // File parsing states
  const [loadedFileName, setLoadedFileName] = useState<string | undefined>(undefined);
  const [parsedRecords, setParsedRecords] = useState<(WeeklyEmployeeRecord | MonthlyEmployeeRecord)[]>([]);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [isParsing, setIsParsing] = useState<boolean>(false);

  // Sending progress & states
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
  const [previewEmployee, setPreviewEmployee] = useState<WeeklyEmployeeRecord | MonthlyEmployeeRecord | null>(null);
  const [confirmationState, setConfirmationState] = useState<{
    isOpen: boolean;
    mode: 'batch' | 'single' | 'retry';
    targetEmployee?: WeeklyEmployeeRecord | MonthlyEmployeeRecord;
  }>({
    isOpen: false,
    mode: 'batch',
  });

  // Batch Execution Summary
  const [batchSummary, setBatchSummary] = useState<BatchSendSummary | null>(null);
  const [apiMode, setApiMode] = useState<'production' | 'simulation' | 'unconfigured'>('unconfigured');
  const [isConfigured, setIsConfigured] = useState<boolean>(false);
  const [configStatus, setConfigStatus] = useState<WhatsAppConfigStatus | null>(null);

  // Fetch WhatsApp Cloud API status on mount
  useEffect(() => {
    let isMounted = true;
    async function checkWhatsAppConfig() {
      try {
        const response = await fetch('/api/whatsapp-status');
        if (response.ok) {
          const data: WhatsAppConfigStatus = await response.json();
          if (isMounted) {
            setConfigStatus(data);
            setIsConfigured(data.isConfigured);
            setApiMode(data.isConfigured ? 'production' : 'unconfigured');
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

  // Handle switching module or choosing a module
  const handleSelectModule = (mod: StatementType) => {
    setActiveModule(mod);
    // Reset file and records whenever module changes to prevent cross-contamination
    handleReset();
  };

  const handleBackToModules = () => {
    setActiveModule(null);
    handleReset();
  };

  const handleReset = () => {
    setLoadedFileName(undefined);
    setParsedRecords([]);
    setValidationErrors([]);
    setBatchSummary(null);
    setIsSending(false);
    setSendProgress({ total: 0, currentCount: 0, successCount: 0, failedCount: 0 });
  };

  // Handle Excel upload according to active module
  const handleFileSelect = async (file: File) => {
    if (!activeModule) return;
    setIsParsing(true);
    setLoadedFileName(file.name);
    setBatchSummary(null);

    try {
      if (activeModule === 'weekly') {
        const result = await parseWeeklyExcelFile(file);
        setParsedRecords(result.records);
        setValidationErrors(result.errors);
      } else {
        const result = await parseMonthlyExcelFile(file);
        setParsedRecords(result.records);
        setValidationErrors(result.errors);
      }
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

  // Helper to update a record's send status in real-time
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
  const promptSingleSending = (employee: WeeklyEmployeeRecord | MonthlyEmployeeRecord) => {
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

  // Execute single employee dispatch
  const executeSingleSend = async (employee: WeeklyEmployeeRecord | MonthlyEmployeeRecord) => {
    if (!activeModule) return;
    setIsSending(true);
    updateRecordStatus(employee.id, 'Sending');

    try {
      const response = await fetch('/api/send-salary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          statementType: activeModule,
          employee,
        }),
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
          data.error || 'Failed to dispatch WhatsApp statement.'
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
  const executeBatchSending = async (
    targetRecords?: (WeeklyEmployeeRecord | MonthlyEmployeeRecord)[]
  ) => {
    if (!activeModule) return;
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

      updateRecordStatus(emp.id, 'Sending');

      setSendProgress({
        total,
        currentCount: i + 1,
        successCount,
        failedCount,
        currentEmployeeName: emp.employeeName,
      });

      const empAmount =
        activeModule === 'weekly'
          ? (emp as WeeklyEmployeeRecord).total
          : (emp as MonthlyEmployeeRecord).netSalary;

      try {
        const response = await fetch('/api/send-salary', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            statementType: activeModule,
            employee: emp,
          }),
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
            amount: empAmount,
            currency: 'EGP',
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
            amount: empAmount,
            currency: 'EGP',
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
          amount: empAmount,
          currency: 'EGP',
          status: 'failed',
          errorDetails: errorMsg,
        });
      }

      setSendProgress((prev) => ({
        ...prev,
        successCount,
        failedCount,
      }));
    }

    setIsSending(false);

    setBatchSummary({
      statementType: activeModule,
      total,
      successful: successCount,
      failed: failedCount,
      mode: detectedMode,
      startedAt: startTime,
      completedAt: new Date().toISOString(),
      results: sendResults,
    });
  };

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

  const activeTemplateName =
    activeModule === 'weekly'
      ? configStatus?.weeklyTemplateName || 'salary_weekly_statement'
      : configStatus?.monthlyTemplateName || 'salary_monthly_statement';

  // Determine current workflow step
  let currentStep = 1;
  if (batchSummary) {
    currentStep = 5;
  } else if (isSending) {
    currentStep = 4;
  } else if (parsedRecords.length > 0) {
    currentStep = 3;
  } else if (loadedFileName) {
    currentStep = 2;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* Top Application Header */}
      <Header
        apiMode={apiMode}
        isConfigured={isConfigured}
        activeModule={activeModule}
        onBackToModules={handleBackToModules}
        onSwitchModule={handleSelectModule}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {!activeModule ? (
          /* Step 0: Landing Module Selector */
          <ModuleSelector onSelectModule={handleSelectModule} />
        ) : (
          /* Active Module Workflow */
          <div className="animate-fadeIn">
            {/* Workflow Step Tracker Indicator */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-sm mb-8 overflow-x-auto">
              <div className="flex items-center justify-between min-w-[600px] text-xs font-bold">
                {[
                  { step: 1, label: t.stepUpload },
                  { step: 2, label: t.stepValidate },
                  { step: 3, label: t.stepReview },
                  { step: 4, label: t.stepSend },
                  { step: 5, label: t.stepResults },
                ].map((item, index) => {
                  const isCompleted = currentStep > item.step;
                  const isCurrent = currentStep === item.step;

                  return (
                    <React.Fragment key={item.step}>
                      <div
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl transition-colors ${
                          isCurrent
                            ? 'bg-brand-50 text-brand-700 border border-brand-200 font-extrabold'
                            : isCompleted
                            ? 'text-emerald-700'
                            : 'text-slate-400'
                        }`}
                      >
                        <span
                          className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                            isCurrent
                              ? 'bg-brand-600 text-white'
                              : isCompleted
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-200 text-slate-500'
                          }`}
                        >
                          {isCompleted ? '✓' : item.step}
                        </span>
                        <span>{item.label}</span>
                      </div>
                      {index < 4 && (
                        <StepArrow className="w-4 h-4 text-slate-300 shrink-0" />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>

            {/* Step 1: Excel Upload Dropzone & Sample Download */}
            <ExcelUpload
              statementType={activeModule}
              onFileSelect={handleFileSelect}
              isLoading={isParsing}
              loadedFileName={loadedFileName}
              totalRecords={parsedRecords.length}
              onReset={handleReset}
            />

            {/* Step 2: Validation Alerts */}
            {loadedFileName && validationErrors.length > 0 && (
              <div className="mt-6">
                <ValidationErrors errors={validationErrors} />
              </div>
            )}

            {/* Step 3: Progress Tracker */}
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

            {/* Step 4: Results Summary */}
            {!isSending && batchSummary && (
              <div className="mt-6">
                <ResultsSummary
                  summary={batchSummary}
                  onReset={handleReset}
                  onRetryFailed={promptRetryFailed}
                />
              </div>
            )}

            {/* Step 5: Employee Payroll Preview Table */}
            {loadedFileName && parsedRecords.length > 0 && !isSending && (
              <div className="mt-8">
                <EmployeePreviewTable
                  statementType={activeModule}
                  records={parsedRecords}
                  onPreviewMessage={(emp) => setPreviewEmployee(emp)}
                  onStartBatchSending={promptBatchSending}
                  onSendSingleEmployee={promptSingleSending}
                  isSending={isSending}
                  hasErrors={hasBlockingErrors}
                />
              </div>
            )}
          </div>
        )}
      </main>

      {/* Confirmation Modal */}
      {activeModule && (
        <SendConfirmationModal
          isOpen={confirmationState.isOpen}
          mode={confirmationState.mode}
          statementType={activeModule}
          templateName={activeTemplateName}
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
      )}

      {/* Message Preview Modal */}
      {activeModule && (
        <MessagePreviewModal
          statementType={activeModule}
          employee={previewEmployee}
          onClose={() => setPreviewEmployee(null)}
        />
      )}

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 text-xs py-6 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>{t.footerCopyright}</p>
          <p className="text-slate-500">{t.footerOfficial}</p>
        </div>
      </footer>
    </div>
  );
}
