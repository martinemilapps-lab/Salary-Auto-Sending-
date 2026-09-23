import { Translations } from './types';

export const en: Translations = {
  appName: 'HR Salary Sender',
  appTagline: 'Automated Employee Payroll Statement Dispatcher via WhatsApp Cloud API',
  metaBadge: 'Business Automation via Meta WhatsApp Cloud API',
  chooseModuleTitle: 'Select Payroll Module',
  chooseModuleDesc: 'Choose which payroll statement format to upload, match, and dispatch to your employees.',

  // Modules
  weeklyModuleTitle: 'Weekly Statement',
  weeklyModuleSub: 'إرسال البيان الأسبوعي',
  weeklyModuleDesc: 'Upload weekly payroll sheets, map 16 wage and incentive parameters, and send the approved weekly WhatsApp template.',
  weeklyBadge: 'Weekly Cycle',
  openWeeklyBtn: 'Open Weekly Module',

  monthlyModuleTitle: 'Monthly Statement',
  monthlyModuleSub: 'إرسال البيان الشهري',
  monthlyModuleDesc: 'Upload monthly salary spreadsheets, map 16 subscription, allowance, and leave parameters, and send the approved monthly template.',
  monthlyBadge: 'Monthly Cycle',
  openMonthlyBtn: 'Open Monthly Module',

  backToModules: 'Back to Modules',
  switchModule: 'Switch Module',
  currentModule: 'Active Module',

  // Header
  whatsappEngine: 'WhatsApp Engine:',
  cloudApiActive: 'Cloud API Active',
  credentialsMissing: 'Unconfigured',
  langToggle: 'العربية',

  // Steps
  stepUpload: '1. Upload Excel',
  stepValidate: '2. Validate Data',
  stepReview: '3. Review Employees',
  stepSend: '4. Dispatch',
  stepResults: '5. Results Summary',

  // Upload
  uploadTitle: 'Upload Payroll Spreadsheet',
  uploadDescWeekly: 'Upload your weekly payroll Excel file to parse employee records and match the 16 parameters automatically.',
  uploadDescMonthly: 'Upload your monthly payroll Excel file to parse employee records and match the 16 parameters automatically.',
  dropzoneTitle: 'Drop your Excel file here, or browse your computer',
  dropzoneSub: 'Supports .xlsx and .xls spreadsheets',
  selectFileBtn: 'Select File from Computer',
  parsingFile: 'Parsing & validating spreadsheet...',
  downloadWeeklySample: 'Download Weekly Sample Template',
  downloadMonthlySample: 'Download Monthly Sample Template',
  fileLoaded: 'File Uploaded Successfully',
  recordsParsed: 'Successfully parsed and validated employee records',
  uploadDifferentFile: 'Upload Different File',
  invalidFileFormat: 'Invalid file format. Please upload an Excel spreadsheet (.xlsx or .xls).',

  // Table & Toolbar
  payrollPreviewTitle: 'Payroll Statement Preview',
  payrollPreviewDesc: 'Review parsed salary statements before initiating automated WhatsApp notifications.',
  searchPlaceholder: 'Search by name, ID, or phone number...',
  recordsCount: 'Records',
  filterAll: 'All',
  filterReady: 'Ready',
  filterSent: 'Sent',
  filterFailed: 'Failed',
  noMatchingRecords: 'No records match your filter criteria.',

  // Table Columns
  colIndex: '#',
  colName: 'Employee Name',
  colPhone: 'WhatsApp Number',
  colStatus: 'Status',
  colActions: 'Actions',

  // Weekly Table Columns
  colWeek: 'Week',
  colMonth: 'Month',
  colSettlements: 'Settlements',
  colProduction: 'Production Inc.',
  colTransport: 'Transport',
  colSaturday: 'Saturday Pay',
  colSaturdayDiff: 'Saturday Diff',
  colEvening: 'Night Shifts',
  colBonuses: 'Bonuses',
  colMeal: 'Meal Allowance',
  colEfficiency: 'Efficiency Inc.',
  colRegularity: 'Regularity Inc.',
  colGrant: 'Grant',
  colUnderAccount: 'Under Account',
  colTotal: 'Total Pay',

  // Monthly Table Columns
  colPeriod: 'Salary Period',
  colSubWage: 'Sub. Wage',
  colCompWage: 'Gross Wage',
  colMonthlyItem: 'Monthly Item',
  colCostOfLiving: 'Cost of Living',
  colWorkerIncentive: 'Worker Inc.',
  colAbsence: 'Absence',
  colTax: 'Tax',
  colGross: 'Gross Salary',
  colNetSalary: 'Net Salary',
  colAdvance: 'Advance',
  colHousing: 'Housing',
  colRemainingAdvance: 'Remaining Adv.',
  colLeaveBalance: 'Leave Balance',
  colCasualBalance: 'Casual Balance',

  // Statuses
  statusReady: 'Ready',
  statusSending: 'Sending',
  statusSent: 'Sent',
  statusFailed: 'Failed',

  // Actions
  actionSend: 'Send',
  actionRetry: 'Retry',
  actionPreview: 'Preview',
  actionSendAll: 'Send All',
  actionSendingAll: 'Sending Messages...',

  // Validation
  validationTitle: 'Validation Attention Required',
  blockingErrors: 'blocking error(s)',
  warnings: 'warning(s)',
  hideDetails: 'Hide Details',
  showDetails: 'Show Details',
  rowLabel: 'Row',
  fileHeaderLabel: 'File Header',

  // Confirmation Modal
  confirmBatchTitle: 'Confirm Batch Dispatch',
  confirmBatchDesc: 'Are you sure you want to send personalized WhatsApp statements to all targeted employees?',
  confirmSingleTitle: 'Confirm Individual Send',
  confirmSingleDesc: 'Are you sure you want to send the WhatsApp salary statement to this employee?',
  confirmRetryTitle: 'Confirm Retry Failed',
  confirmRetryDesc: 'Are you sure you want to retry sending statements to the failed employee records?',
  confirmModalModule: 'Active Module:',
  confirmModalCount: 'Target Employee Count:',
  confirmModalTemplate: 'WhatsApp Template:',
  confirmModalNotice: 'Each message will be dispatched independently to the employee’s verified WhatsApp number.',
  btnCancel: 'Cancel',
  btnConfirmSend: 'Confirm & Send All',
  btnConfirmRetry: 'Retry Failed',

  // Message Preview Modal
  previewModalTitle: 'WhatsApp Message Preview',
  previewModalBadge: 'WhatsApp End-to-End Encrypted Business Message',
  previewModalFooter: 'Official Meta utility template mapped with 16 approved parameters',
  previewModalClose: 'Close Preview',
  previewTemplateNotice: 'Exact representation of what the employee will receive on WhatsApp:',

  // Progress Tracker
  sendingInProgress: 'Sending Salary Statements via WhatsApp',
  sendingTo: 'Currently sending to:',
  processedOf: 'Processed',
  statTotal: 'Total',
  statRemaining: 'Remaining',
  statCurrent: 'Sending',
  statSent: 'Sent',
  statFailed: 'Failed',

  // Results Summary
  resultsCompletedTitle: 'Salary Notifications Completed',
  resultsCompletedDesc: 'Execution completed for all target employees via Meta WhatsApp Cloud API.',
  retryOnlyFailed: 'Retry Failed Employees Only',
  exportCsv: 'Export Audit Report (.csv)',
  startNewUpload: 'Start New Upload',
  statTotalEmp: 'Total Employees',
  statSuccessDeliveries: 'Successfully Delivered',
  statFailedDeliveries: 'Failed Deliveries',
  statSuccessRate: 'Success Rate',
  executionLog: 'Execution Details Log',
  engineMode: 'Engine Mode:',
  deliveredBadge: 'Delivered',
  failedBadge: 'Failed',

  // Footer
  footerCopyright: '© 2026 HR Salary Sender — Internal Business Automation System',
  footerOfficial: 'Official Meta WhatsApp Cloud API Endpoint',
  currencyEgp: 'EGP',
};
