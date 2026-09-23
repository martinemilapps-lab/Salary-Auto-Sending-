import * as XLSX from 'xlsx';
import { RawExcelRow } from '@/types/common';

/**
 * Normalizes text for resilient header matching.
 * Converts Arabic variants (أ, إ, آ -> ا, ة -> ه, ى -> ي), strips punctuation, and collapses spaces.
 */
export function normalizeHeaderString(str: string): string {
  if (!str) return '';
  return String(str)
    .trim()
    .toLowerCase()
    .replace(/[أإآ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .replace(/[\u064B-\u065F]/g, '') // remove Arabic tashkeel/diacritics
    .replace(/[_\-\.\:\(\)\[\]\/\\\|\,\+]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Converts Eastern Arabic numerals (٠-٩) and Persian numerals to Western digits (0-9).
 */
export function convertArabicIndicNumerals(str: string): string {
  const arabicIndicMap: Record<string, string> = {
    '٠': '0', '١': '1', '٢': '2', '٣': '3', '٤': '4',
    '٥': '5', '٦': '6', '٧': '7', '٨': '8', '٩': '9',
    '۰': '0', '۱': '1', '۲': '2', '۳': '3', '۴': '4',
    '۵': '5', '۶': '6', '۷': '7', '۸': '8', '۹': '9',
  };
  return str.replace(/[٠-٩۰-۹]/g, (char) => arabicIndicMap[char] || char);
}

/**
 * Parses numeric values safely from Excel cell data.
 * Strips currency symbols, commas, spaces, and parses float cleanly.
 */
export function parseCleanNumber(val: unknown): number {
  if (typeof val === 'number') {
    return isNaN(val) ? 0 : val;
  }
  if (val === undefined || val === null || val === '') {
    return 0;
  }
  const str = convertArabicIndicNumerals(String(val).trim());
  const cleaned = str.replace(/[^0-9\.\-]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : Math.round(parsed * 100) / 100;
}

/**
 * Checks if an entire Excel row is empty or only whitespace.
 */
export function isRowEmpty(row: RawExcelRow): boolean {
  if (!row || typeof row !== 'object') return true;
  return Object.values(row).every(
    (v) => v === undefined || v === null || String(v).trim() === ''
  );
}

/**
 * Finds the matching original column header among row headers given an array of aliases.
 */
export function findMatchingHeader(rowHeaders: string[], aliases: string[]): string | undefined {
  const normalizedRowHeaders = rowHeaders.map((h) => ({
    original: h,
    normalized: normalizeHeaderString(h),
  }));

  const normalizedAliases = aliases.map(normalizeHeaderString);

  // Exact match first
  for (const alias of normalizedAliases) {
    const match = normalizedRowHeaders.find((h) => h.normalized === alias);
    if (match) {
      return match.original;
    }
  }

  // Substring match fallback
  for (const alias of normalizedAliases) {
    const match = normalizedRowHeaders.find((h) => h.normalized.includes(alias) || alias.includes(h.normalized));
    if (match) {
      return match.original;
    }
  }

  return undefined;
}

/**
 * Reads workbook from File or ArrayBuffer and returns the raw rows and extracted unique headers.
 */
export async function readExcelSheetData(file: File): Promise<{
  rawRows: RawExcelRow[];
  rawHeaders: string[];
}> {
  const data = await file.arrayBuffer();
  const workbook = XLSX.read(data, { type: 'array' });

  if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
    throw new Error('The uploaded Excel file contains no worksheets.');
  }

  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];

  // Read json rows with header line
  const allRows = XLSX.utils.sheet_to_json<RawExcelRow>(worksheet, { defval: '' });

  // Filter out completely blank rows
  const rawRows = allRows.filter((row) => !isRowEmpty(row));

  // Extract all unique header names
  const rawHeaders = Array.from(
    new Set(rawRows.flatMap((row) => Object.keys(row)))
  );

  return { rawRows, rawHeaders };
}
