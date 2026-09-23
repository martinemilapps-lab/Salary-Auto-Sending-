import { WeeklyEmployeeRecord, WeeklyParseResult } from '@/types/weekly';
import { RawExcelRow, ValidationError } from '@/types/common';
import {
  findMatchingHeader,
  parseCleanNumber,
  readExcelSheetData,
} from './common';
import { validateWeeklyRecords } from '../validation/weekly';

// Flexible alias dictionary for Weekly Payroll spreadsheets
const WEEKLY_HEADER_ALIASES = {
  employeeId: [
    'كود الموظف', 'كود', 'رقم الموظف', 'مسلسل', 'م', 'الرقم التعريفي',
    'employee id', 'emp id', 'employee_id', 'id', 'code', 'staff id', 'emp_id'
  ],
  whatsappNumber: [
    'رقم الهاتف', 'الموبايل', 'رقم الواتساب', 'واتساب', 'الهاتف', 'تليفون', 'رقم التليفون', 'موبايل',
    'whatsapp number', 'whatsapp', 'phone', 'mobile', 'phone number', 'whatsapp_number', 'mobile number', 'contact'
  ],
  // {{1}} الاسم
  employeeName: [
    'الاسم', 'اسم الموظف', 'اسم العامل', 'الموظف', 'العامل',
    'employee name', 'name', 'full name', 'employee', 'staff name', 'emp name'
  ],
  // {{2}} الأسبوع
  week: [
    'الأسبوع', 'الاسبوع', 'أسبوع', 'اسبوع', 'رقم الاسبوع', 'رقم الأسبوع',
    'week', 'payroll week', 'week number', 'week no'
  ],
  // {{3}} الشهر
  month: [
    'الشهر', 'شهر', 'شهر الراتب',
    'month', 'salary month', 'period'
  ],
  // {{4}} تسويات
  settlements: [
    'تسويات', 'تسوية', 'مبلغ تسويات', 'تسويات الراتب',
    'settlements', 'settlement', 'adjustments', 'adjustment'
  ],
  // {{5}} حافز الإنتاج
  productionIncentive: [
    'حافز الإنتاج', 'حافز الانتاج', 'حافز انتاج', 'انتاج', 'الإنتاج',
    'production incentive', 'production', 'productivity incentive'
  ],
  // {{6}} بدل الانتقال
  transportAllowance: [
    'بدل الانتقال', 'بدل انتقال', 'الانتقال', 'انتقال', 'بدل مواصلات', 'مواصلات',
    'transport allowance', 'transport', 'transportation', 'travel allowance'
  ],
  // {{7}} مبلغ السبت
  saturdayAmount: [
    'مبلغ السبت', 'السبت', 'عمل السبت', 'بدل السبت', 'يوم السبت',
    'saturday amount', 'saturday pay', 'saturday'
  ],
  // {{8}} مبلغ فرق السبت
  saturdayDiffAmount: [
    'مبلغ فرق السبت', 'فرق السبت', 'فروق السبت',
    'saturday diff amount', 'saturday difference', 'saturday diff'
  ],
  // {{9}} مبلغ السهرات
  eveningAmount: [
    'مبلغ السهرات', 'السهرات', 'سهرات', 'أجر السهرات', 'سهر',
    'evening amount', 'evening shift', 'night shifts', 'night shift', 'overtime evening'
  ],
  // {{10}} مكافآت
  bonuses: [
    'مكافآت', 'مكافات', 'مكافأة', 'مكافاه', 'المكافآت',
    'bonuses', 'bonus', 'rewards'
  ],
  // {{11}} بدل وجبة
  mealAllowance: [
    'بدل وجبة', 'بدل وجبه', 'وجبة', 'وجبه', 'وجبات', 'بدل الوجبة',
    'meal allowance', 'meal', 'food allowance'
  ],
  // {{12}} حافز كفاءة
  efficiencyIncentive: [
    'حافز كفاءة', 'حافز كفاءه', 'كفاءة', 'كفاءه', 'حافز الكفاءة',
    'efficiency incentive', 'efficiency', 'performance incentive'
  ],
  // {{13}} حافز انتظام
  regularityIncentive: [
    'حافز انتظام', 'انتظام', 'حافز الانتظام', 'مواظبة',
    'regularity incentive', 'regularity', 'attendance incentive'
  ],
  // {{14}} منحة
  grant: [
    'منحة', 'منحه', 'المنحة', 'منح',
    'grant', 'allowance grant', 'special grant'
  ],
  // {{15}} تحت الحساب
  underAccount: [
    'تحت الحساب', 'سلفة أسبوعية', 'خصم تحت الحساب',
    'under account', 'advance deduction', 'on account', 'under_account'
  ],
  // {{16}} الإجمالي
  total: [
    'الإجمالي', 'الاجمالي', 'إجمالي', 'اجمالي', 'المبلغ المستحق', 'الصافي', 'صافي الراتب',
    'total', 'net', 'net amount', 'total salary', 'grand total'
  ],
};

export async function parseWeeklyExcelFile(file: File): Promise<WeeklyParseResult> {
  const { rawRows, rawHeaders } = await readExcelSheetData(file);

  if (rawRows.length === 0) {
    return {
      records: [],
      errors: [
        {
          rowIndex: 0,
          field: 'Spreadsheet / الملف',
          message: 'The uploaded Excel file contains no data rows / الملف لا يحتوي على بيانات',
          type: 'error',
        },
      ],
      headersFound: [],
      missingRequiredHeaders: [],
      totalRows: 0,
    };
  }

  // Header matching
  const matched = {
    employeeId: findMatchingHeader(rawHeaders, WEEKLY_HEADER_ALIASES.employeeId),
    whatsappNumber: findMatchingHeader(rawHeaders, WEEKLY_HEADER_ALIASES.whatsappNumber),
    employeeName: findMatchingHeader(rawHeaders, WEEKLY_HEADER_ALIASES.employeeName),
    week: findMatchingHeader(rawHeaders, WEEKLY_HEADER_ALIASES.week),
    month: findMatchingHeader(rawHeaders, WEEKLY_HEADER_ALIASES.month),
    settlements: findMatchingHeader(rawHeaders, WEEKLY_HEADER_ALIASES.settlements),
    productionIncentive: findMatchingHeader(rawHeaders, WEEKLY_HEADER_ALIASES.productionIncentive),
    transportAllowance: findMatchingHeader(rawHeaders, WEEKLY_HEADER_ALIASES.transportAllowance),
    saturdayAmount: findMatchingHeader(rawHeaders, WEEKLY_HEADER_ALIASES.saturdayAmount),
    saturdayDiffAmount: findMatchingHeader(rawHeaders, WEEKLY_HEADER_ALIASES.saturdayDiffAmount),
    eveningAmount: findMatchingHeader(rawHeaders, WEEKLY_HEADER_ALIASES.eveningAmount),
    bonuses: findMatchingHeader(rawHeaders, WEEKLY_HEADER_ALIASES.bonuses),
    mealAllowance: findMatchingHeader(rawHeaders, WEEKLY_HEADER_ALIASES.mealAllowance),
    efficiencyIncentive: findMatchingHeader(rawHeaders, WEEKLY_HEADER_ALIASES.efficiencyIncentive),
    regularityIncentive: findMatchingHeader(rawHeaders, WEEKLY_HEADER_ALIASES.regularityIncentive),
    grant: findMatchingHeader(rawHeaders, WEEKLY_HEADER_ALIASES.grant),
    underAccount: findMatchingHeader(rawHeaders, WEEKLY_HEADER_ALIASES.underAccount),
    total: findMatchingHeader(rawHeaders, WEEKLY_HEADER_ALIASES.total),
  };

  const missingRequiredHeaders: string[] = [];
  if (!matched.employeeName) missingRequiredHeaders.push('الاسم (Employee Name)');
  if (!matched.whatsappNumber) missingRequiredHeaders.push('رقم الهاتف (WhatsApp Number)');

  const defaultMonth = new Intl.DateTimeFormat('ar-EG', { month: 'long', year: 'numeric' }).format(new Date());

  const parsedRecords: WeeklyEmployeeRecord[] = rawRows.map((row, idx) => {
    const rawName = matched.employeeName ? String(row[matched.employeeName] || '') : '';
    const rawPhone = matched.whatsappNumber ? String(row[matched.whatsappNumber] || '') : '';
    const rawId = matched.employeeId ? String(row[matched.employeeId] || `EMP-${idx + 1001}`) : `EMP-${idx + 1001}`;
    const rawWeek = matched.week ? String(row[matched.week] || `الأسبوع ${Math.ceil((idx + 1) / 50)}`) : 'الأسبوع الحالي';
    const rawMonth = matched.month ? String(row[matched.month] || defaultMonth) : defaultMonth;

    const settlements = matched.settlements ? parseCleanNumber(row[matched.settlements]) : 0;
    const productionIncentive = matched.productionIncentive ? parseCleanNumber(row[matched.productionIncentive]) : 0;
    const transportAllowance = matched.transportAllowance ? parseCleanNumber(row[matched.transportAllowance]) : 0;
    const saturdayAmount = matched.saturdayAmount ? parseCleanNumber(row[matched.saturdayAmount]) : 0;
    const saturdayDiffAmount = matched.saturdayDiffAmount ? parseCleanNumber(row[matched.saturdayDiffAmount]) : 0;
    const eveningAmount = matched.eveningAmount ? parseCleanNumber(row[matched.eveningAmount]) : 0;
    const bonuses = matched.bonuses ? parseCleanNumber(row[matched.bonuses]) : 0;
    const mealAllowance = matched.mealAllowance ? parseCleanNumber(row[matched.mealAllowance]) : 0;
    const efficiencyIncentive = matched.efficiencyIncentive ? parseCleanNumber(row[matched.efficiencyIncentive]) : 0;
    const regularityIncentive = matched.regularityIncentive ? parseCleanNumber(row[matched.regularityIncentive]) : 0;
    const grant = matched.grant ? parseCleanNumber(row[matched.grant]) : 0;
    const underAccount = matched.underAccount ? parseCleanNumber(row[matched.underAccount]) : 0;

    let total = 0;
    if (matched.total && row[matched.total] !== undefined && row[matched.total] !== '') {
      total = parseCleanNumber(row[matched.total]);
    } else {
      total =
        settlements +
        productionIncentive +
        transportAllowance +
        saturdayAmount +
        saturdayDiffAmount +
        eveningAmount +
        bonuses +
        mealAllowance +
        efficiencyIncentive +
        regularityIncentive +
        grant -
        underAccount;
    }

    return {
      id: `weekly-${idx + 1}`,
      employeeId: rawId.trim(),
      whatsappNumber: rawPhone.trim(),
      formattedPhone: '',
      status: 'valid',
      validationErrors: [],
      sendStatus: 'Ready',
      employeeName: rawName.trim(),
      week: rawWeek.trim(),
      month: rawMonth.trim(),
      settlements,
      productionIncentive,
      transportAllowance,
      saturdayAmount,
      saturdayDiffAmount,
      eveningAmount,
      bonuses,
      mealAllowance,
      efficiencyIncentive,
      regularityIncentive,
      grant,
      underAccount,
      total,
    };
  });

  const { validatedRecords, allErrors } = validateWeeklyRecords(parsedRecords);

  const headerValidationErrors: ValidationError[] = missingRequiredHeaders.map((hdr) => ({
    rowIndex: 0,
    field: 'Header Mapping',
    message: `Required column "${hdr}" not found. Please ensure your Weekly spreadsheet includes this column.`,
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
