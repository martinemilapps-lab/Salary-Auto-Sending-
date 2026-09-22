export interface RawExcelRow {
  [key: string]: string | number | undefined | null;
}

export type RowSendStatus = 'Ready' | 'Sending' | 'Sent' | 'Failed';

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
  sendStatus?: RowSendStatus;
  sendErrorDetails?: string;
  messageId?: string;
  sentAt?: string;
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
  mode: 'production' | 'simulation' | 'unconfigured';
  startedAt: string;
  completedAt?: string;
  results: SendResultItem[];
}

export interface WhatsAppTemplateParameter {
  type: 'text';
  text: string;
}

export interface WhatsAppTemplateComponent {
  type: 'body';
  parameters: WhatsAppTemplateParameter[];
}

export interface WhatsAppTemplateObject {
  name: string;
  language: {
    code: string;
  };
  components: WhatsAppTemplateComponent[];
}

export interface WhatsAppApiPayload {
  messaging_product: 'whatsapp';
  recipient_type: 'individual';
  to: string;
  type: 'template';
  template: WhatsAppTemplateObject;
}

