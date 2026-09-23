import { WhatsAppConfigStatus, StatementType } from '@/types/common';

export interface TemplateConfig {
  name: string;
  languageCode: string;
}

/**
 * Retrieves the configured Meta WhatsApp template name and language code for a statement type.
 * Priority:
 * - Module specific env var: WHATSAPP_WEEKLY_TEMPLATE_NAME / WHATSAPP_MONTHLY_TEMPLATE_NAME
 * - Legacy fallback env var: WHATSAPP_TEMPLATE_NAME
 * - Safe default template name
 */
export function getStatementTemplateConfig(statementType: StatementType): TemplateConfig {
  const isWeekly = statementType === 'weekly';

  if (isWeekly) {
    const name = (
      process.env.WHATSAPP_WEEKLY_TEMPLATE_NAME ||
      process.env.WHATSAPP_TEMPLATE_NAME ||
      'salary_weekly_statement'
    ).trim();

    const languageCode = (
      process.env.WHATSAPP_WEEKLY_TEMPLATE_LANGUAGE_CODE ||
      process.env.WHATSAPP_TEMPLATE_LANGUAGE_CODE ||
      'ar'
    ).trim();

    return { name, languageCode };
  } else {
    const name = (
      process.env.WHATSAPP_MONTHLY_TEMPLATE_NAME ||
      process.env.WHATSAPP_TEMPLATE_NAME ||
      'salary_monthly_statement'
    ).trim();

    const languageCode = (
      process.env.WHATSAPP_MONTHLY_TEMPLATE_LANGUAGE_CODE ||
      process.env.WHATSAPP_TEMPLATE_LANGUAGE_CODE ||
      'ar'
    ).trim();

    return { name, languageCode };
  }
}

/**
 * Returns safe status check of WhatsApp Cloud API configuration without leaking credentials.
 */
export function getWhatsAppConfigStatus(): WhatsAppConfigStatus {
  const token = process.env.WHATSAPP_ACCESS_TOKEN || process.env.WHATSAPP_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const apiVersion = process.env.WHATSAPP_API_VERSION || 'v21.0';

  const weeklyConfig = getStatementTemplateConfig('weekly');
  const monthlyConfig = getStatementTemplateConfig('monthly');

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
    weeklyTemplateName: weeklyConfig.name,
    weeklyTemplateLanguageCode: weeklyConfig.languageCode,
    monthlyTemplateName: monthlyConfig.name,
    monthlyTemplateLanguageCode: monthlyConfig.languageCode,
  };
}
