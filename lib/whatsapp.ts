import { WhatsAppApiPayload } from '@/types/salary';

export interface SendWhatsAppResponse {
  success: boolean;
  mode: 'production' | 'simulation' | 'unconfigured';
  messageId?: string;
  error?: string;
  statusCode?: number;
}

export interface WhatsAppConfigStatus {
  isConfigured: boolean;
  hasAccessToken: boolean;
  hasPhoneNumberId: boolean;
  hasApiVersion: boolean;
  apiVersion: string;
  templateName: string;
  templateLanguageCode: string;
}

/**
 * Normalizes phone number into digits-only format required by Meta WhatsApp Cloud API.
 * Strips '+', spaces, hyphens, and any non-digit characters.
 */
export function normalizePhoneNumber(phone: string): string {
  return phone.replace(/\D/g, '').trim();
}

/**
 * Checks server-side WhatsApp Cloud API configuration safely.
 * Returns booleans indicating existence of required credentials, NEVER secret tokens or values.
 */
export function getWhatsAppConfigStatus(): WhatsAppConfigStatus {
  const token = process.env.WHATSAPP_ACCESS_TOKEN || process.env.WHATSAPP_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const apiVersion = process.env.WHATSAPP_API_VERSION || 'v21.0';
  const templateName = (process.env.WHATSAPP_TEMPLATE_NAME || 'salary_statement').trim();
  const templateLanguageCode = (process.env.WHATSAPP_TEMPLATE_LANGUAGE_CODE || 'en').trim();

  const hasAccessToken = Boolean(
    token &&
      token.trim().length > 0 &&
      !token.includes('your_meta_system_user') &&
      !token.includes('your_access_token')
  );

  const hasPhoneNumberId = Boolean(
    phoneNumberId &&
      phoneNumberId.trim().length > 0 &&
      !phoneNumberId.includes('your_whatsapp_phone_number_id')
  );

  const hasApiVersion = Boolean(
    process.env.WHATSAPP_API_VERSION && process.env.WHATSAPP_API_VERSION.trim().length > 0
  );

  const isConfigured = hasAccessToken && hasPhoneNumberId;

  return {
    isConfigured,
    hasAccessToken,
    hasPhoneNumberId,
    hasApiVersion,
    apiVersion,
    templateName,
    templateLanguageCode,
  };
}

/**
 * Sends a WhatsApp salary statement using the approved Meta Utility Template.
 * Outgoing payload structure:
 * {
 *   "messaging_product": "whatsapp",
 *   "recipient_type": "individual",
 *   "to": "RECIPIENT_PHONE",
 *   "type": "template",
 *   "template": {
 *     "name": "salary_statement",
 *     "language": { "code": "EXACT_TEMPLATE_LANGUAGE_CODE" },
 *     "components": [
 *       {
 *         "type": "body",
 *         "parameters": [
 *           { "type": "text", "text": "EMPLOYEE_NAME" },
 *           { "type": "text", "text": "SALARY_MONTH" },
 *           { "type": "text", "text": "BASIC_SALARY" },
 *           { "type": "text", "text": "BONUS" },
 *           { "type": "text", "text": "DEDUCTIONS" },
 *           { "type": "text", "text": "NET_SALARY" }
 *         ]
 *       }
 *     ]
 *   }
 * }
 *
 * Confidentiality: Salary amounts, complete messages, access tokens, and financial parameters
 * are strictly NEVER logged to the console or server diagnostics.
 */
export async function sendWhatsAppTemplateMessage(
  recipientPhone: string,
  parameters: string[]
): Promise<SendWhatsAppResponse> {
  const token = process.env.WHATSAPP_ACCESS_TOKEN || process.env.WHATSAPP_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const apiVersion = process.env.WHATSAPP_API_VERSION || 'v21.0';
  const templateName = (process.env.WHATSAPP_TEMPLATE_NAME || 'salary_statement').trim();
  const templateLanguageCode = (process.env.WHATSAPP_TEMPLATE_LANGUAGE_CODE || 'en').trim();

  // Basic validation of recipient phone
  const cleanPhone = normalizePhoneNumber(recipientPhone);
  if (!cleanPhone || cleanPhone.length < 8) {
    return {
      success: false,
      mode: 'unconfigured',
      error: `Invalid phone number: "${recipientPhone}". A valid international phone number is required.`,
    };
  }

  // Validate exact 6 template parameters
  if (!parameters || parameters.length !== 6) {
    return {
      success: false,
      mode: 'unconfigured',
      error: `Template "${templateName}" requires exactly 6 body parameters, received ${parameters?.length || 0}.`,
    };
  }

  // Check if API credentials exist
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
        code: templateLanguageCode,
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

  // Configure timeout controller (15s timeout)
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  try {
    const url = `https://graph.facebook.com/${apiVersion}/${phoneNumberId}/messages`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
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
 * Backward compatibility wrapper for sendWhatsAppMessage.
 */
export async function sendWhatsAppMessage(
  recipientPhone: string,
  parametersOrText: string[] | string
): Promise<SendWhatsAppResponse> {
  if (Array.isArray(parametersOrText)) {
    return sendWhatsAppTemplateMessage(recipientPhone, parametersOrText);
  }
  // If a raw string was supplied, wrap it or return error because templates are required
  return {
    success: false,
    mode: 'unconfigured',
    error: 'Free-form text sending is disabled. Use the approved salary_statement template parameters.',
  };
}

