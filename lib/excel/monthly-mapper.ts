import { MonthlyEmployeeRecord, MonthlyParseResult } from '@/types/monthly';
import { RawExcelRow, ValidationError } from '@/types/common';
import {
  findMatchingHeader,
  parseCleanNumber,
  readExcelSheetData,
} from './common';
import { validateMonthlyRecords } from '../validation/monthly';

// Flexible alias dictionary for Monthly Payroll spreadsheets
const MONTHLY_HEADER_ALIASES = {
  employeeId: [
    'كود الموظف', 'كود', 'رقم الموظف', 'مسلسل', 'م', 'الرقم التعريفي',
    'employee id', 'emp id', 'employee_id', 'id', 'code', 'staff id', 'emp_id'
  ],
  whatsappNumber: [
    'رقم الهاتف', 'الموبايل', 'رقم الواتساب', 'واتساب', 'الهاتف', 'تليفون', 'رقم التليفون', 'موبايل',
    'whatsapp number', 'whatsapp', 'phone', 'mobile', 'phone number', 'whatsapp_number', 'mobile number', 'contact'
  ],
  // {{1}} Employee Name / الاسم
  employeeName: [
    'الاسم', 'اسم الموظف', 'اسم العامل', 'الموظف', 'العامل',
    'employee name', 'name', 'full name', 'employee', 'staff name', 'emp name'
  ],
  // {{2}} Salary Period / شهر أو فترة الراتب
  salaryPeriod: [
    'شهر أو فترة الراتب', 'شهر او فترة الراتب', 'فترة الراتب', 'شهر الراتب', 'الفترة', 'الشهر',
    'salary period', 'pay period', 'period', 'salary month', 'month'
  ],
  // {{3}} أجر الاشتراك
  subscriptionWage: [
    'أجر الاشتراك', 'اجر الاشتراك', 'أجر اشتراك', 'اجر اشتراك', 'اشتراك التأمين', 'أجر التأمين', 'التأمينات',
    'subscription wage', 'insurance wage', 'social insurance'
  ],
  // {{4}} الأجر الشامل
  comprehensiveWage: [
    'الأجر الشامل', 'الاجر الشامل', 'أجر شامل', 'اجر شامل', 'الراتب الشامل', 'الأساسي الشامل',
    'comprehensive wage', 'gross base wage', 'total wage'
  ],
  // {{5}} بند الشهر
  monthlyItem: [
    'بند الشهر', 'بند شهر', 'البند الشهري', 'بند الشهر الحالي',
    'monthly item', 'monthly allowance', 'month item'
  ],
  // {{6}} بدل غلاء المعيشة
  costOfLivingAllowance: [
    'بدل غلاء المعيشة', 'بدل غلاء معيشة', 'غلاء المعيشة', 'بدل غلاء', 'علاوة غلاء',
    'cost of living allowance', 'cost of living', 'cola'
  ],
  // {{7}} حافز العامل
  workerIncentive: [
    'حافز العامل', 'حافز عامل', 'الحافز', 'حافز', 'حوافز', 'المكافأة التشجيعية',
    'worker incentive', 'incentive', 'worker bonus'
  ],
  // {{8}} الغياب
  absence: [
    'الغياب', 'خصم الغياب', 'غياب', 'ايام الغياب', 'مبلغ الغياب',
    'absence', 'absence deduction', 'absent days penalty'
  ],
  // {{9}} الضريبة
  tax: [
    'الضريبة', 'ضريبة', 'ضريبة كسب العمل', 'ضرائب', 'خصم الضريبة',
    'tax', 'income tax', 'taxes'
  ],
  // {{10}} إجمالي الراتب قبل الاستقطاعات
  grossBeforeDeductions: [
    'إجمالي الراتب قبل الاستقطاعات', 'اجمالي الراتب قبل الاستقطاعات', 'إجمالي قبل الاستقطاعات', 'اجمالي قبل الاستقطاع', 'إجمالي الاستحقاقات', 'اجمالي الاستحقاقات',
    'gross salary before deductions', 'gross before deductions', 'total before deductions', 'gross earnings'
  ],
  // {{11}} صافي الراتب
  netSalary: [
    'صافي الراتب', 'الصافي', 'صافي', 'صافي المرتب', 'المبلغ المستحق',
    'net salary', 'net pay', 'net', 'take home pay'
  ],
  // {{12}} السلفة
  advance: [
    'السلفة', 'سلفة', 'خصم السلفة', 'سلف', 'السلف',
    'advance', 'loan deduction', 'loan'
  ],
  // {{13}} السكن
  housing: [
    'السكن', 'بدل سكن', 'خصم السكن', 'إقامة', 'سكن',
    'housing', 'housing allowance', 'housing deduction'
  ],
  // {{14}} باقي السلفة
  remainingAdvance: [
    'باقي السلفة', 'متبقي السلفة', 'باقي سلفة', 'رصيد السلفة', 'متبقي السلف',
    'remaining advance', 'advance balance', 'loan balance'
  ],
  // {{15}} رصيد الإجازات
  leaveBalance: [
    'رصيد الإجازات', 'رصيد الاجازات', 'إجازات', 'اجازات', 'رصيد اعتيادي', 'سنوي',
    'leave balance', 'annual leave', 'vacation balance'
  ],
  // {{16}} رصيد العارضة
  casualLeaveBalance: [
    'رصيد العارضة', 'رصيد عارضة', 'عارضة', 'عارضه',
    'casual leave balance', 'casual leave', 'casual balance'
  ],
};

export async function parseMonthlyExcelFile(file: File): Promise<MonthlyParseResult> {
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
    employeeId: findMatchingHeader(rawHeaders, MONTHLY_HEADER_ALIASES.employeeId),
    whatsappNumber: findMatchingHeader(rawHeaders, MONTHLY_HEADER_ALIASES.whatsappNumber),
    employeeName: findMatchingHeader(rawHeaders, MONTHLY_HEADER_ALIASES.employeeName),
    salaryPeriod: findMatchingHeader(rawHeaders, MONTHLY_HEADER_ALIASES.salaryPeriod),
    subscriptionWage: findMatchingHeader(rawHeaders, MONTHLY_HEADER_ALIASES.subscriptionWage),
    comprehensiveWage: findMatchingHeader(rawHeaders, MONTHLY_HEADER_ALIASES.comprehensiveWage),
    monthlyItem: findMatchingHeader(rawHeaders, MONTHLY_HEADER_ALIASES.monthlyItem),
    costOfLivingAllowance: findMatchingHeader(rawHeaders, MONTHLY_HEADER_ALIASES.costOfLivingAllowance),
    workerIncentive: findMatchingHeader(rawHeaders, MONTHLY_HEADER_ALIASES.workerIncentive),
    absence: findMatchingHeader(rawHeaders, MONTHLY_HEADER_ALIASES.absence),
    tax: findMatchingHeader(rawHeaders, MONTHLY_HEADER_ALIASES.tax),
    grossBeforeDeductions: findMatchingHeader(rawHeaders, MONTHLY_HEADER_ALIASES.grossBeforeDeductions),
    netSalary: findMatchingHeader(rawHeaders, MONTHLY_HEADER_ALIASES.netSalary),
    advance: findMatchingHeader(rawHeaders, MONTHLY_HEADER_ALIASES.advance),
    housing: findMatchingHeader(rawHeaders, MONTHLY_HEADER_ALIASES.housing),
    remainingAdvance: findMatchingHeader(rawHeaders, MONTHLY_HEADER_ALIASES.remainingAdvance),
    leaveBalance: findMatchingHeader(rawHeaders, MONTHLY_HEADER_ALIASES.leaveBalance),
    casualLeaveBalance: findMatchingHeader(rawHeaders, MONTHLY_HEADER_ALIASES.casualLeaveBalance),
  };

  const missingRequiredHeaders: string[] = [];
  if (!matched.employeeName) missingRequiredHeaders.push('الاسم (Employee Name)');
  if (!matched.whatsappNumber) missingRequiredHeaders.push('رقم الهاتف (WhatsApp Number)');

  const defaultPeriod = new Intl.DateTimeFormat('ar-EG', { month: 'long', year: 'numeric' }).format(new Date());

  const parsedRecords: MonthlyEmployeeRecord[] = rawRows.map((row, idx) => {
    const rawName = matched.employeeName ? String(row[matched.employeeName] || '') : '';
    const rawPhone = matched.whatsappNumber ? String(row[matched.whatsappNumber] || '') : '';
    const rawId = matched.employeeId ? String(row[matched.employeeId] || `EMP-${idx + 1001}`) : `EMP-${idx + 1001}`;
    const rawPeriod = matched.salaryPeriod ? String(row[matched.salaryPeriod] || defaultPeriod) : defaultPeriod;

    const subscriptionWage = matched.subscriptionWage ? parseCleanNumber(row[matched.subscriptionWage]) : 0;
    const comprehensiveWage = matched.comprehensiveWage ? parseCleanNumber(row[matched.comprehensiveWage]) : 0;
    const monthlyItem = matched.monthlyItem ? parseCleanNumber(row[matched.monthlyItem]) : 0;
    const costOfLivingAllowance = matched.costOfLivingAllowance ? parseCleanNumber(row[matched.costOfLivingAllowance]) : 0;
    const workerIncentive = matched.workerIncentive ? parseCleanNumber(row[matched.workerIncentive]) : 0;
    const absence = matched.absence ? parseCleanNumber(row[matched.absence]) : 0;
    const tax = matched.tax ? parseCleanNumber(row[matched.tax]) : 0;
    const advance = matched.advance ? parseCleanNumber(row[matched.advance]) : 0;
    const housing = matched.housing ? parseCleanNumber(row[matched.housing]) : 0;
    const remainingAdvance = matched.remainingAdvance ? parseCleanNumber(row[matched.remainingAdvance]) : 0;

    // Leave balances can be numbers or strings
    const leaveRaw = matched.leaveBalance ? row[matched.leaveBalance] : '0';
    const leaveBalance = typeof leaveRaw === 'number' ? leaveRaw : String(leaveRaw ?? '0').trim();

    const casualRaw = matched.casualLeaveBalance ? row[matched.casualLeaveBalance] : '0';
    const casualLeaveBalance = typeof casualRaw === 'number' ? casualRaw : String(casualRaw ?? '0').trim();

    let grossBeforeDeductions = 0;
    if (matched.grossBeforeDeductions && row[matched.grossBeforeDeductions] !== undefined && row[matched.grossBeforeDeductions] !== '') {
      grossBeforeDeductions = parseCleanNumber(row[matched.grossBeforeDeductions]);
    } else {
      grossBeforeDeductions = comprehensiveWage + monthlyItem + costOfLivingAllowance + workerIncentive;
    }

    let netSalary = 0;
    if (matched.netSalary && row[matched.netSalary] !== undefined && row[matched.netSalary] !== '') {
      netSalary = parseCleanNumber(row[matched.netSalary]);
    } else {
      netSalary = grossBeforeDeductions - (absence + tax + advance + housing);
    }

    return {
      id: `monthly-${idx + 1}`,
      employeeId: rawId.trim(),
      whatsappNumber: rawPhone.trim(),
      formattedPhone: '',
      status: 'valid',
      validationErrors: [],
      sendStatus: 'Ready',
      currency: 'EGP',
      employeeName: rawName.trim(),
      salaryPeriod: rawPeriod.trim(),
      subscriptionWage,
      comprehensiveWage,
      monthlyItem,
      costOfLivingAllowance,
      workerIncentive,
      absence,
      tax,
      grossBeforeDeductions,
      netSalary,
      advance,
      housing,
      remainingAdvance,
      leaveBalance,
      casualLeaveBalance,
    };
  });

  const { validatedRecords, allErrors } = validateMonthlyRecords(parsedRecords);

  const headerValidationErrors: ValidationError[] = missingRequiredHeaders.map((hdr) => ({
    rowIndex: 0,
    field: 'Header Mapping',
    message: `Required column "${hdr}" not found. Please ensure your Monthly spreadsheet includes this column.`,
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
