import * as XLSX from 'xlsx';
import { EmployeeRecord, ParseResult, RawExcelRow, ValidationError } from '@/types/salary';
import { validateEmployeeRecords } from './validator';

// Flexible column name alias matching dictionaries
const HEADER_ALIASES = {
  employeeId: ['employee id', 'emp id', 'employee_id', 'id', 'code', 'staff id', 'emp_id'],
  employeeName: ['employee name', 'name', 'full name', 'employee', 'staff name', 'emp name', 'name of employee'],
  whatsappNumber: ['whatsapp number', 'whatsapp', 'phone', 'mobile', 'phone number', 'whatsapp_number', 'mobile number', 'contact'],
  salaryMonth: ['salary month', 'month', 'pay period', 'period', 'salary_month', 'date'],
  basicSalary: ['basic salary', 'basic', 'base salary', 'basic_salary', 'base pay', 'basic pay'],
  bonus: ['bonus', 'incentive', 'allowance', 'overtime', 'bonuses'],
  deductions: ['deductions', 'deduction', 'tax', 'penalties', 'total deductions'],
  netSalary: ['net salary', 'net', 'net pay', 'total salary', 'net_salary', 'take home'],
  currency: ['currency', 'curr'],
};

function findMatchingHeader(rowHeaders: string[], aliases: string[]): string | undefined {
  const normalizedRowHeaders = rowHeaders.map((h) => ({
    original: h,
    normalized: String(h).trim().toLowerCase().replace(/[\_\-\s]+/g, ' '),
  }));

  for (const alias of aliases) {
    const match = normalizedRowHeaders.find((h) => h.normalized === alias || h.normalized.includes(alias));
    if (match) {
      return match.original;
    }
  }
  return undefined;
}

/**
 * Parses an uploaded Excel file (.xlsx, .xls) and validates records
 */
export async function parseExcelFile(file: File): Promise<ParseResult> {
  const data = await file.arrayBuffer();
  const workbook = XLSX.read(data, { type: 'array' });

  if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
    throw new Error('The uploaded Excel file contains no worksheets.');
  }

  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];

  // Read json rows with header line
  const rawRows = XLSX.utils.sheet_to_json<RawExcelRow>(worksheet, { defval: '' });

  if (!rawRows || rawRows.length === 0) {
    return {
      records: [],
      errors: [
        {
          rowIndex: 0,
          field: 'Spreadsheet',
          message: 'The uploaded worksheet is completely empty.',
          type: 'error',
        },
      ],
      headersFound: [],
      missingRequiredHeaders: [],
      totalRows: 0,
    };
  }

  // Extract all unique header names present in raw rows
  const rawHeaders = Array.from(
    new Set(rawRows.flatMap((row) => Object.keys(row)))
  );

  // Map header aliases
  const matchedHeaders = {
    employeeId: findMatchingHeader(rawHeaders, HEADER_ALIASES.employeeId),
    employeeName: findMatchingHeader(rawHeaders, HEADER_ALIASES.employeeName),
    whatsappNumber: findMatchingHeader(rawHeaders, HEADER_ALIASES.whatsappNumber),
    salaryMonth: findMatchingHeader(rawHeaders, HEADER_ALIASES.salaryMonth),
    basicSalary: findMatchingHeader(rawHeaders, HEADER_ALIASES.basicSalary),
    bonus: findMatchingHeader(rawHeaders, HEADER_ALIASES.bonus),
    deductions: findMatchingHeader(rawHeaders, HEADER_ALIASES.deductions),
    netSalary: findMatchingHeader(rawHeaders, HEADER_ALIASES.netSalary),
    currency: findMatchingHeader(rawHeaders, HEADER_ALIASES.currency),
  };

  const missingRequiredHeaders: string[] = [];
  if (!matchedHeaders.employeeName) missingRequiredHeaders.push('Employee Name');
  if (!matchedHeaders.whatsappNumber) missingRequiredHeaders.push('WhatsApp Number');
  if (!matchedHeaders.netSalary) missingRequiredHeaders.push('Net Salary');

  const currentMonthFallback = new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' });

  const parsedRecords: EmployeeRecord[] = rawRows.map((row, idx) => {
    const rawName = matchedHeaders.employeeName ? String(row[matchedHeaders.employeeName] || '') : '';
    const rawPhone = matchedHeaders.whatsappNumber ? String(row[matchedHeaders.whatsappNumber] || '') : '';
    const rawId = matchedHeaders.employeeId ? String(row[matchedHeaders.employeeId] || `EMP-${idx + 1001}`) : `EMP-${idx + 1001}`;
    const rawMonth = matchedHeaders.salaryMonth ? String(row[matchedHeaders.salaryMonth] || currentMonthFallback) : currentMonthFallback;

    const parseNum = (val: unknown): number => {
      if (typeof val === 'number') return val;
      if (!val) return 0;
      const cleaned = String(val).replace(/[^0-9\.\-]/g, '');
      const parsed = parseFloat(cleaned);
      return isNaN(parsed) ? 0 : parsed;
    };

    const basicSalary = matchedHeaders.basicSalary ? parseNum(row[matchedHeaders.basicSalary]) : 0;
    const bonus = matchedHeaders.bonus ? parseNum(row[matchedHeaders.bonus]) : 0;
    const deductions = matchedHeaders.deductions ? parseNum(row[matchedHeaders.deductions]) : 0;
    
    let netSalary = 0;
    if (matchedHeaders.netSalary && row[matchedHeaders.netSalary] !== undefined && row[matchedHeaders.netSalary] !== '') {
      netSalary = parseNum(row[matchedHeaders.netSalary]);
    } else {
      netSalary = basicSalary + bonus - deductions;
    }

    const currency = matchedHeaders.currency && row[matchedHeaders.currency] ? String(row[matchedHeaders.currency]).toUpperCase() : 'EGP';

    return {
      id: `row-${idx + 1}`,
      employeeId: rawId.trim(),
      employeeName: rawName.trim(),
      whatsappNumber: rawPhone.trim(),
      formattedPhone: '',
      salaryMonth: rawMonth.trim() || currentMonthFallback,
      basicSalary,
      bonus,
      deductions,
      netSalary,
      currency,
      status: 'valid',
      validationErrors: [],
    };
  });

  // Run validation engine
  const { validatedRecords, allErrors } = validateEmployeeRecords(parsedRecords);

  // Append missing headers error if any
  const headerValidationErrors: ValidationError[] = missingRequiredHeaders.map((hdr) => ({
    rowIndex: 0,
    field: 'Header Mapping',
    message: `Required column "${hdr}" was not found in the Excel file. Please ensure your file includes columns for Employee Name, WhatsApp Number, and Net Salary.`,
    type: 'error',
  }));

  return {
    records: validatedRecords,
    errors: [...headerValidationErrors, ...allErrors],
    headersFound: rawHeaders,
    missingRequiredHeaders,
    totalRows: parsedRecords.length,
  };
}
