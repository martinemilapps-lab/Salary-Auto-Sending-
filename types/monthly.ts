import { RowSendStatus, ValidationError } from './common';

export interface MonthlyEmployeeRecord {
  id: string;
  employeeId: string;
  whatsappNumber: string;
  formattedPhone: string;
  status: 'valid' | 'warning' | 'error';
  validationErrors: string[];
  sendStatus?: RowSendStatus;
  sendErrorDetails?: string;
  messageId?: string;
  sentAt?: string;
  currency?: string;

  // 16 Approved Meta WhatsApp Monthly Template Parameters:
  // {{1}} Employee Name / الاسم
  employeeName: string;
  // {{2}} Salary Period / شهر أو فترة الراتب
  salaryPeriod: string;
  // {{3}} أجر الاشتراك
  subscriptionWage: number;
  // {{4}} الأجر الشامل
  comprehensiveWage: number;
  // {{5}} بند الشهر
  monthlyItem: number;
  // {{6}} بدل غلاء المعيشة
  costOfLivingAllowance: number;
  // {{7}} حافز العامل
  workerIncentive: number;
  // {{8}} الغياب
  absence: number;
  // {{9}} الضريبة
  tax: number;
  // {{10}} إجمالي الراتب قبل الاستقطاعات
  grossBeforeDeductions: number;
  // {{11}} صافي الراتب
  netSalary: number;
  // {{12}} السلفة
  advance: number;
  // {{13}} السكن
  housing: number;
  // {{14}} باقي السلفة
  remainingAdvance: number;
  // {{15}} رصيد الإجازات
  leaveBalance: number | string;
  // {{16}} رصيد العارضة
  casualLeaveBalance: number | string;
}

export interface MonthlyParseResult {
  records: MonthlyEmployeeRecord[];
  errors: ValidationError[];
  headersFound: string[];
  missingRequiredHeaders: string[];
  totalRows: number;
}
