import { WhatsAppApiPayload, StatementType, WhatsAppConfigStatus } from '@/types/common';
import { getStatementTemplateConfig, getWhatsAppConfigStatus } from './whatsapp/templates';

export { getWhatsAppConfigStatus };

export interface SendWhatsAppResponse {
  success: boolean;
  mode: 'production' | 'simulation' | 'unconfigured';
  messageId?: string;
  error?: string;
  statusCode?: number;
}

/**
 * Normalizes phone number into digits-only format required by Meta WhatsApp Cloud API.
 * Strips '+', spaces, hyphens, and any non-digit characters.
 */
export function normalizePhoneNumber(phone: string): string {
  return (phone || '').replace(/\D/g, '').trim();
}

/**
 * Shared WhatsApp Sending Engine.
 * Dispatches a template message via Meta WhatsApp Cloud API for either Weekly or Monthly statements.
 *
 * Safety & Confidentiality:
 * Salary amounts, employee personal data, complete messages, access tokens, and financial parameters
 * are strictly NEVER logged to the console or server diagnostics.
 */
export async function sendWhatsAppStatementMessage(
  recipientPhone: string,
  statementType: StatementType,
  parameters: string[]
): Promise<SendWhatsAppResponse> {
  const token = process.env.WHATSAPP_ACCESS_TOKEN || process.env.WHATSAPP_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const apiVersion = process.env.WHATSAPP_API_VERSION || 'v21.0';

  const { name: templateName, languageCode } = getStatementTemplateConfig(statementType);

  // Validate recipient phone
  const cleanPhone = normalizePhoneNumber(recipientPhone);
  if (!cleanPhone || cleanPhone.length < 8) {
    return {
      success: false,
      mode: 'unconfigured',
      error: `Invalid recipient phone number: "${recipientPhone}". A valid international phone number is required.`,
    };
  }

  // Validate parameters count (16 parameters required for both weekly and monthly approved templates)
  if (!parameters || parameters.length !== 16) {
    return {
      success: false,
      mode: 'unconfigured',
      error: `Template "${templateName}" requires exactly 16 body parameters, received ${parameters?.length || 0}.`,
    };
  }

  // Check credentials
  const isConfigured = Boolean(
    token &&
      phoneNumberId &&
      !token.includes('your_meta_system_user') &&
      !token.includes('your_access_token') &&
      !phoneNumberId.includes('your_whatsapp_phone_number_id')
  );

  if (!isConfigured) {
    return {
      success: false,
      mode: 'unconfigured',
      error:
        'WhatsApp API credentials missing. Please set WHATSAPP_ACCESS_TOKEN and WHATSAPP_PHONE_NUMBER_ID in your environment variables.',
    };
  }

  const payload: WhatsAppApiPayload = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: cleanPhone,
    type: 'template',
    template: {
      name: templateName,
      language: {
        code: languageCode,
      },
      components: [
        {
          type: 'body',
          parameters: parameters.map((param) => ({
            type: 'text',
            text: String(param ?? ''),
          })),
        },
      ],
    },
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  try {
    const url = `https://graph.facebook.com/${apiVersion}/${phoneNumberId}/messages`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const errorMessage =
        data?.error?.error_user_msg ||
        data?.error?.message ||
        data?.error?.error_data?.details ||
        `HTTP request failed with status ${response.status}`;

      // Safe logging without financial details
      console.error(
        `[WhatsApp Engine] API Error: status=${response.status}, code=${data?.error?.code || 'N/A'}, statement=${statementType}`
      );

      return {
        success: false,
        mode: 'production',
        statusCode: response.status,
        error: `WhatsApp API Error (${response.status}): ${errorMessage}`,
      };
    }

    const messageId = data?.messages?.[0]?.id || `wmid.OK_${Date.now()}`;
    return {
      success: true,
      mode: 'production',
      messageId,
    };
  } catch (err: unknown) {
    clearTimeout(timeoutId);

    if (err instanceof Error && err.name === 'AbortError') {
      return {
        success: false,
        mode: 'production',
        error: 'WhatsApp API Request Timeout (exceeded 15 seconds).',
      };
    }

    const errorMsg = err instanceof Error ? err.message : 'Unknown network failure';
    return {
      success: false,
      mode: 'production',
      error: `Network Exception: ${errorMsg}`,
    };
  }
}

/**
 * Legacy wrapper for backward compatibility.
 */
export async function sendWhatsAppTemplateMessage(
  recipientPhone: string,
  parameters: string[]
): Promise<SendWhatsAppResponse> {
  // If legacy 6 parameters were passed, wrap or support monthly
  if (parameters.length === 16) {
    return sendWhatsAppStatementMessage(recipientPhone, 'monthly', parameters);
  }

  // Legacy fallback for 6-parameter template if needed
  const token = process.env.WHATSAPP_ACCESS_TOKEN || process.env.WHATSAPP_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const apiVersion = process.env.WHATSAPP_API_VERSION || 'v21.0';
  const templateName = (process.env.WHATSAPP_TEMPLATE_NAME || 'salary_statement').trim();
  const templateLanguageCode = (process.env.WHATSAPP_TEMPLATE_LANGUAGE_CODE || 'ar').trim();

  const cleanPhone = normalizePhoneNumber(recipientPhone);
  if (!cleanPhone || cleanPhone.length < 8) {
    return { success: false, mode: 'unconfigured', error: 'Invalid phone number' };
  }

  const isConfigured = Boolean(
    token && phoneNumberId && !token.includes('your_meta') && !phoneNumberId.includes('your_whatsapp')
  );
  if (!isConfigured) {
    return { success: false, mode: 'unconfigured', error: 'Credentials not configured' };
  }

  try {
    const response = await fetch(`https://graph.facebook.com/${apiVersion}/${phoneNumberId}/messages`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: cleanPhone,
        type: 'template',
        template: {
          name: templateName,
          language: { code: templateLanguageCode },
          components: [{ type: 'body', parameters: parameters.map((p) => ({ type: 'text', text: String(p ?? '') })) }],
        },
      }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      return { success: false, mode: 'production', error: data?.error?.message || 'Meta API error' };
    }
    return { success: true, mode: 'production', messageId: data?.messages?.[0]?.id };
  } catch (err: unknown) {
    return { success: false, mode: 'production', error: err instanceof Error ? err.message : 'Network error' };
  }
}

export async function sendWhatsAppMessage(
  recipientPhone: string,
  parametersOrText: string[] | string
): Promise<SendWhatsAppResponse> {
  if (Array.isArray(parametersOrText)) {
    return sendWhatsAppTemplateMessage(recipientPhone, parametersOrText);
  }
  return {
    success: false,
    mode: 'unconfigured',
    error: 'Free-form text sending is disabled. Use the approved WhatsApp utility template parameters.',
  };
}
