import { convertArabicIndicNumerals } from '../excel/common';

/**
 * Format phone number to clean E.164 standard.
 * Auto-converts Egyptian local numbers (01xxxxxxxxx) to +201xxxxxxxxx.
 * Converts any Eastern Arabic / Arabic-Indic digits to ASCII standard digits.
 */
export function formatPhoneNumber(rawPhone: string | number | undefined | null): {
  formatted: string;
  isValid: boolean;
} {
  if (!rawPhone) {
    return { formatted: '', isValid: false };
  }

  let str = convertArabicIndicNumerals(String(rawPhone).trim())
    .replace(/[\s\-\(\)\.\/\\]/g, '');

  // Handle leading 00 as +
  if (str.startsWith('00')) {
    str = '+' + str.slice(2);
  }

  // Handle Egyptian local mobile prefix (010, 011, 012, 015)
  if (/^01[0125]\d{8}$/.test(str)) {
    str = '+20' + str.slice(1);
  }

  // If missing +, add + if it starts with country code digit (e.g. 201...)
  if (!str.startsWith('+') && /^\d{8,15}$/.test(str)) {
    str = '+' + str;
  }

  // E.164 standard regex validation: + followed by 8-15 digits
  const isE164 = /^\+[1-9]\d{7,14}$/.test(str);

  return {
    formatted: str,
    isValid: isE164,
  };
}

/**
 * Clean currency/amount display helper.
 */
export function formatNumberWithCommas(amount: number): string {
  if (isNaN(amount)) return '0';
  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  }).format(amount);
}
