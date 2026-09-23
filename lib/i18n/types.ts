export type Language = 'ar' | 'en';
export type Direction = 'rtl' | 'ltr';

export interface Translations {
  appName: string;
  appTagline: string;
  metaBadge: string;
  chooseModuleTitle: string;
  chooseModuleDesc: string;
  
  // Modules
  weeklyModuleTitle: string;
  weeklyModuleSub: string;
  weeklyModuleDesc: string;
  weeklyBadge: string;
  openWeeklyBtn: string;

  monthlyModuleTitle: string;
  monthlyModuleSub: string;
  monthlyModuleDesc: string;
  monthlyBadge: string;
  openMonthlyBtn: string;

  backToModules: string;
  switchModule: string;
  currentModule: string;

  // Header
  whatsappEngine: string;
  cloudApiActive: string;
  credentialsMissing: string;
  langToggle: string;

  // Steps
  stepUpload: string;
  stepValidate: string;
  stepReview: string;
  stepSend: string;
  stepResults: string;

  // Upload
  uploadTitle: string;
  uploadDescWeekly: string;
  uploadDescMonthly: string;
  dropzoneTitle: string;
  dropzoneSub: string;
  selectFileBtn: string;
  parsingFile: string;
  downloadWeeklySample: string;
  downloadMonthlySample: string;
  fileLoaded: string;
  recordsParsed: string;
  uploadDifferentFile: string;
  invalidFileFormat: string;

  // Table & Toolbar
  payrollPreviewTitle: string;
  payrollPreviewDesc: string;
  searchPlaceholder: string;
  recordsCount: string;
  filterAll: string;
  filterReady: string;
  filterSent: string;
  filterFailed: string;
  noMatchingRecords: string;

  // Table Columns
  colIndex: string;
  colName: string;
  colPhone: string;
  colStatus: string;
  colActions: string;
  
  // Weekly Table Columns
  colWeek: string;
  colMonth: string;
  colSettlements: string;
  colProduction: string;
  colTransport: string;
  colSaturday: string;
  colSaturdayDiff: string;
  colEvening: string;
  colBonuses: string;
  colMeal: string;
  colEfficiency: string;
  colRegularity: string;
  colGrant: string;
  colUnderAccount: string;
  colTotal: string;

  // Monthly Table Columns
  colPeriod: string;
  colSubWage: string;
  colCompWage: string;
  colMonthlyItem: string;
  colCostOfLiving: string;
  colWorkerIncentive: string;
  colAbsence: string;
  colTax: string;
  colGross: string;
  colNetSalary: string;
  colAdvance: string;
  colHousing: string;
  colRemainingAdvance: string;
  colLeaveBalance: string;
  colCasualBalance: string;

  // Statuses
  statusReady: string;
  statusSending: string;
  statusSent: string;
  statusFailed: string;

  // Actions
  actionSend: string;
  actionRetry: string;
  actionPreview: string;
  actionSendAll: string;
  actionSendingAll: string;

  // Validation
  validationTitle: string;
  blockingErrors: string;
  warnings: string;
  hideDetails: string;
  showDetails: string;
  rowLabel: string;
  fileHeaderLabel: string;

  // Confirmation Modal
  confirmBatchTitle: string;
  confirmBatchDesc: string;
  confirmSingleTitle: string;
  confirmSingleDesc: string;
  confirmRetryTitle: string;
  confirmRetryDesc: string;
  confirmModalModule: string;
  confirmModalCount: string;
  confirmModalTemplate: string;
  confirmModalNotice: string;
  btnCancel: string;
  btnConfirmSend: string;
  btnConfirmRetry: string;

  // Message Preview Modal
  previewModalTitle: string;
  previewModalBadge: string;
  previewModalFooter: string;
  previewModalClose: string;
  previewTemplateNotice: string;

  // Progress Tracker
  sendingInProgress: string;
  sendingTo: string;
  processedOf: string;
  statTotal: string;
  statRemaining: string;
  statCurrent: string;
  statSent: string;
  statFailed: string;

  // Results Summary
  resultsCompletedTitle: string;
  resultsCompletedDesc: string;
  retryOnlyFailed: string;
  exportCsv: string;
  startNewUpload: string;
  statTotalEmp: string;
  statSuccessDeliveries: string;
  statFailedDeliveries: string;
  statSuccessRate: string;
  executionLog: string;
  engineMode: string;
  deliveredBadge: string;
  failedBadge: string;

  // Footer
  footerCopyright: string;
  footerOfficial: string;
  currencyEgp: string;
}
