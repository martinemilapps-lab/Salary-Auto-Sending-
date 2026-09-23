import { MonthlyEmployeeRecord } from '@/types/monthly';
import { formatNumberWithCommas } from '../validation/common';

/**
 * Builds the 16 approved Meta WhatsApp template parameters for Monthly Statement in exact order:
 * {{1}}  Employee Name / الاسم
 * {{2}}  Salary Period / شهر أو فترة الراتب
 * {{3}}  أجر الاشتراك
 * {{4}}  الأجر الشامل
 * {{5}}  بند الشهر
 * {{6}}  بدل غلاء المعيشة
 * {{7}}  حافز العامل
 * {{8}}  الغياب
 * {{9}}  الضريبة
 * {{10}} إجمالي الراتب قبل الاستقطاعات
 * {{11}} صافي الراتب
 * {{12}} السلفة
 * {{13}} السكن
 * {{14}} باقي السلفة
 * {{15}} رصيد الإجازات
 * {{16}} رصيد العارضة
 */
export function buildMonthlyTemplateParameters(employee: MonthlyEmployeeRecord): string[] {
  const formatLeave = (val: number | string): string => {
    if (typeof val === 'number') {
      return formatNumberWithCommas(val);
    }
    const str = String(val ?? '').trim();
    return str || '0';
  };

  return [
    /* {{1}}  Employee Name / الاسم */
    (employee.employeeName || '').trim(),
    /* {{2}}  Salary Period / شهر أو فترة الراتب */
    (employee.salaryPeriod || '').trim(),
    /* {{3}}  أجر الاشتراك */
    formatNumberWithCommas(employee.subscriptionWage),
    /* {{4}}  الأجر الشامل */
    formatNumberWithCommas(employee.comprehensiveWage),
    /* {{5}}  بند الشهر */
    formatNumberWithCommas(employee.monthlyItem),
    /* {{6}}  بدل غلاء المعيشة */
    formatNumberWithCommas(employee.costOfLivingAllowance),
    /* {{7}}  حافز العامل */
    formatNumberWithCommas(employee.workerIncentive),
    /* {{8}}  الغياب */
    formatNumberWithCommas(employee.absence),
    /* {{9}}  الضريبة */
    formatNumberWithCommas(employee.tax),
    /* {{10}} إجمالي الراتب قبل الاستقطاعات */
    formatNumberWithCommas(employee.grossBeforeDeductions),
    /* {{11}} صافي الراتب */
    formatNumberWithCommas(employee.netSalary),
    /* {{12}} السلفة */
    formatNumberWithCommas(employee.advance),
    /* {{13}} السكن */
    formatNumberWithCommas(employee.housing),
    /* {{14}} باقي السلفة */
    formatNumberWithCommas(employee.remainingAdvance),
    /* {{15}} رصيد الإجازات */
    formatLeave(employee.leaveBalance),
    /* {{16}} رصيد العارضة */
    formatLeave(employee.casualLeaveBalance),
  ];
}
