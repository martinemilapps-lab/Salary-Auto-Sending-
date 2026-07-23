import { WhatsAppApiPayload } from '@/types/salary';

export interface SendWhatsAppResponse {
  success: boolean;
  mode: 'production' | 'simulation';
  messageId?: string;
  error?: string;
  statusCode?: number;
}

/**
 * Sends a single WhatsApp message using Meta WhatsApp Cloud API (or simulation if credentials missing)
 */
export async function sendWhatsAppMessage(
  recipientPhone: string,
  messageBody: string
): Promise<SendWhatsAppResponse> {
  const token = process.env.WHATSAPP_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  // Check if real credentials are present
  const isProductionConfigured = Boolean(token && phoneNumberId && !token.includes('your_meta_system_user'));

  if (!isProductionConfigured) {
    // Simulation Mode: Artificial 200ms delay to simulate network latency
    await new Promise((resolve) => setTimeout(resolve, 250));

    // Simple validation test for simulation: format must start with + and numbers
    if (!recipientPhone || recipientPhone.length < 10) {
      return {
        success: false,
        mode: 'simulation',
        error: `Simulated Error: Recipient phone "${recipientPhone}" is invalid.`,
      };
    }

    const mockId = `wmid.HBgM${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
    return {
      success: true,
      mode: 'simulation',
      messageId: mockId,
    };
  }

  // Format recipient phone: remove + if Meta API expects E.164 without leading +
  // Meta Cloud API accepts phone number in E.164 format without leading '+' or special chars (e.g. 201012345678)
  const cleanPhone = recipientPhone.replace(/\+/g, '').trim();

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

  try {
    const url = `https://graph.facebook.com/v20.0/${phoneNumberId}/messages`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      const errorMessage = data?.error?.message || data?.error?.error_data?.details || `HTTP error ${response.status}`;
      return {
        success: false,
        mode: 'production',
        statusCode: response.status,
        error: `Meta Cloud API Error: ${errorMessage}`,
      };
    }

    const messageId = data?.messages?.[0]?.id || `wmid.OK`;
    return {
      success: true,
      mode: 'production',
      messageId,
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown network failure';
    return {
      success: false,
      mode: 'production',
      error: `Network Exception: ${errorMsg}`,
    };
  }
}
