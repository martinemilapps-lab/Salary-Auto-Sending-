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
}

/**
 * Checks server-side WhatsApp Cloud API configuration safely.
 * Returns booleans indicating existence of required credentials, NEVER secret tokens or values.
 */
export function getWhatsAppConfigStatus(): WhatsAppConfigStatus {
  const token = process.env.WHATSAPP_ACCESS_TOKEN || process.env.WHATSAPP_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const apiVersion = process.env.WHATSAPP_API_VERSION || 'v21.0';

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
  };
}

/**
 * Sends a single WhatsApp message using Meta WhatsApp Business Cloud API.
 * Uses WHATSAPP_ACCESS_TOKEN, WHATSAPP_PHONE_NUMBER_ID, and WHATSAPP_API_VERSION environment variables.
 */
export async function sendWhatsAppMessage(
  recipientPhone: string,
  messageBody: string
): Promise<SendWhatsAppResponse> {
  const token = process.env.WHATSAPP_ACCESS_TOKEN || process.env.WHATSAPP_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const apiVersion = process.env.WHATSAPP_API_VERSION || 'v21.0';

  // Basic validation of input
  if (!recipientPhone || recipientPhone.trim().length < 8) {
    return {
      success: false,
      mode: 'unconfigured',
      error: `Invalid phone number: "${recipientPhone}". A valid E.164 phone number is required.`,
    };
  }

  if (!messageBody || messageBody.trim().length === 0) {
    return {
      success: false,
      mode: 'unconfigured',
      error: 'Message body cannot be empty.',
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
        'WhatsApp API credentials missing. Please set WHATSAPP_ACCESS_TOKEN, WHATSAPP_PHONE_NUMBER_ID, and WHATSAPP_API_VERSION in your environment variables.',
    };
  }

  // Format recipient phone: remove '+' and any whitespace as Meta Cloud API expects digits only (e.g. 201012345678)
  const cleanPhone = recipientPhone.replace(/[\+\s\-\(\)]/g, '').trim();

  const payload: WhatsAppApiPayload = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: cleanPhone,
    type: 'text',
    text: {
      preview_url: false,
      body: messageBody,
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
