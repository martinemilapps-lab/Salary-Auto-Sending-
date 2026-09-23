export type StatementType = 'weekly' | 'monthly';

export type RowSendStatus = 'Ready' | 'Sending' | 'Sent' | 'Failed';

export type SendingStatus = 'pending' | 'sending' | 'success' | 'failed';

export interface RawExcelRow {
  [key: string]: string | number | undefined | null;
}

export interface ValidationError {
  rowIndex: number;
  employeeName?: string;
  employeeId?: string;
  field: string;
  message: string;
  type: 'error' | 'warning';
}

export interface SendResultItem {
  employeeId: string;
  employeeName: string;
  whatsappNumber: string;
  amount: number;
  currency?: string;
  status: SendingStatus;
  sentAt?: string;
  errorDetails?: string;
  messageId?: string;
}

export interface BatchSendSummary {
  statementType: StatementType;
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

export interface WhatsAppConfigStatus {
  isConfigured: boolean;
  hasAccessToken: boolean;
  hasPhoneNumberId: boolean;
  hasApiVersion: boolean;
  apiVersion: string;
  weeklyTemplateName: string;
  weeklyTemplateLanguageCode: string;
  monthlyTemplateName: string;
  monthlyTemplateLanguageCode: string;
}
