export interface RawExcelRow {
  [key: string]: string | number | undefined | null;
}

export interface EmployeeRecord {
  id: string; // Internal row identifier or Employee ID
  employeeId: string;
  employeeName: string;
  whatsappNumber: string;
  formattedPhone: string;
  salaryMonth: string;
  basicSalary: number;
  bonus: number;
  deductions: number;
  netSalary: number;
  currency: string;
  status: 'valid' | 'warning' | 'error';
  validationErrors: string[];
}

export interface ValidationError {
  rowIndex: number;
  employeeName?: string;
  employeeId?: string;
  field: string;
  message: string;
  type: 'error' | 'warning';
}

export interface ParseResult {
  records: EmployeeRecord[];
  errors: ValidationError[];
  headersFound: string[];
  missingRequiredHeaders: string[];
  totalRows: number;
}

export type SendingStatus = 'pending' | 'sending' | 'success' | 'failed';

export interface SendResultItem {
  employeeId: string;
  employeeName: string;
  whatsappNumber: string;
  netSalary: number;
  currency: string;
  status: SendingStatus;
  sentAt?: string;
  errorDetails?: string;
  messageId?: string;
}

export interface BatchSendSummary {
  total: number;
  successful: number;
  failed: number;
  mode: 'production' | 'simulation';
  startedAt: string;
  completedAt?: string;
  results: SendResultItem[];
}

export interface WhatsAppApiPayload {
  messaging_product: 'whatsapp';
  recipient_type: 'individual';
  to: string;
  type: 'text';
  text: {
    preview_url: boolean;
    body: string;
  };
}
