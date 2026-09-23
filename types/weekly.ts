import { RowSendStatus, ValidationError } from './common';

export interface WeeklyEmployeeRecord {
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

  // 16 Approved Meta WhatsApp Weekly Template Parameters:
  // {{1}} الاسم
  employeeName: string;
  // {{2}} الأسبوع
  week: string;
  // {{3}} الشهر
  month: string;
  // {{4}} تسويات
  settlements: number;
  // {{5}} حافز الإنتاج
  productionIncentive: number;
  // {{6}} بدل الانتقال
  transportAllowance: number;
  // {{7}} مبلغ السبت
  saturdayAmount: number;
  // {{8}} مبلغ فرق السبت
  saturdayDiffAmount: number;
  // {{9}} مبلغ السهرات
  eveningAmount: number;
  // {{10}} مكافآت
  bonuses: number;
  // {{11}} بدل وجبة
  mealAllowance: number;
  // {{12}} حافز كفاءة
  efficiencyIncentive: number;
  // {{13}} حافز انتظام
  regularityIncentive: number;
  // {{14}} منحة
  grant: number;
  // {{15}} تحت الحساب
  underAccount: number;
  // {{16}} الإجمالي
  total: number;
}

export interface WeeklyParseResult {
  records: WeeklyEmployeeRecord[];
  errors: ValidationError[];
  headersFound: string[];
  missingRequiredHeaders: string[];
  totalRows: number;
}
