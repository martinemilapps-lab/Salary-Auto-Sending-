import { WeeklyEmployeeRecord } from '@/types/weekly';
import { formatNumberWithCommas } from '../validation/common';

/**
 * Builds the 16 approved Meta WhatsApp template parameters for Weekly Statement in exact order:
 * {{1}}  الاسم
 * {{2}}  الأسبوع
 * {{3}}  الشهر
 * {{4}}  تسويات
 * {{5}}  حافز الإنتاج
 * {{6}}  بدل الانتقال
 * {{7}}  مبلغ السبت
 * {{8}}  مبلغ فرق السبت
 * {{9}}  مبلغ السهرات
 * {{10}} مكافآت
 * {{11}} بدل وجبة
 * {{12}} حافز كفاءة
 * {{13}} حافز انتظام
 * {{14}} منحة
 * {{15}} تحت الحساب
 * {{16}} الإجمالي
 */
export function buildWeeklyTemplateParameters(employee: WeeklyEmployeeRecord): string[] {
  return [
    /* {{1}}  الاسم */
    (employee.employeeName || '').trim(),
    /* {{2}}  الأسبوع */
    (employee.week || '').trim(),
    /* {{3}}  الشهر */
    (employee.month || '').trim(),
    /* {{4}}  تسويات */
    formatNumberWithCommas(employee.settlements),
    /* {{5}}  حافز الإنتاج */
    formatNumberWithCommas(employee.productionIncentive),
    /* {{6}}  بدل الانتقال */
    formatNumberWithCommas(employee.transportAllowance),
    /* {{7}}  مبلغ السبت */
    formatNumberWithCommas(employee.saturdayAmount),
    /* {{8}}  مبلغ فرق السبت */
    formatNumberWithCommas(employee.saturdayDiffAmount),
    /* {{9}}  مبلغ السهرات */
    formatNumberWithCommas(employee.eveningAmount),
    /* {{10}} مكافآت */
    formatNumberWithCommas(employee.bonuses),
    /* {{11}} بدل وجبة */
    formatNumberWithCommas(employee.mealAllowance),
    /* {{12}} حافز كفاءة */
    formatNumberWithCommas(employee.efficiencyIncentive),
    /* {{13}} حافز انتظام */
    formatNumberWithCommas(employee.regularityIncentive),
    /* {{14}} منحة */
    formatNumberWithCommas(employee.grant),
    /* {{15}} تحت الحساب */
    formatNumberWithCommas(employee.underAccount),
    /* {{16}} الإجمالي */
    formatNumberWithCommas(employee.total),
  ];
}
