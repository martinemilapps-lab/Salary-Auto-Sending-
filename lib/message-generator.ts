import { WeeklyEmployeeRecord } from '@/types/weekly';
import { MonthlyEmployeeRecord } from '@/types/monthly';
import { buildWeeklyTemplateParameters } from './whatsapp/weekly-template';
import { buildMonthlyTemplateParameters } from './whatsapp/monthly-template';
import { formatNumberWithCommas } from './validation/common';

export { buildWeeklyTemplateParameters, buildMonthlyTemplateParameters };

export function formatCurrencyNumber(amount: number): string {
  return formatNumberWithCommas(amount);
}

/**
 * Generate formatted text preview representing the approved Weekly Statement template.
 */
export function generateWeeklyMessagePreview(employee: WeeklyEmployeeRecord): string {
  return (
    `*بيان الراتب الأسبوعي*\n` +
    `━━━━━━━━━━━━━━━━━━\n` +
    `👤 *الاسم:* ${employee.employeeName || '—'}\n` +
    `📅 *الأسبوع:* ${employee.week || '—'}\n` +
    `🗓️ *الشهر:* ${employee.month || '—'}\n\n` +
    `➕ *الاستحقاقات والحوافز:*\n` +
    `• حافز الإنتاج: ${formatNumberWithCommas(employee.productionIncentive)} ج.م\n` +
    `• بدل الانتقال: ${formatNumberWithCommas(employee.transportAllowance)} ج.م\n` +
    `• مبلغ السبت: ${formatNumberWithCommas(employee.saturdayAmount)} ج.م\n` +
    `• فرق السبت: ${formatNumberWithCommas(employee.saturdayDiffAmount)} ج.م\n` +
    `• مبلغ السهرات: ${formatNumberWithCommas(employee.eveningAmount)} ج.م\n` +
    `• مكافآت: ${formatNumberWithCommas(employee.bonuses)} ج.م\n` +
    `• بدل وجبة: ${formatNumberWithCommas(employee.mealAllowance)} ج.م\n` +
    `• حافز كفاءة: ${formatNumberWithCommas(employee.efficiencyIncentive)} ج.م\n` +
    `• حافز انتظام: ${formatNumberWithCommas(employee.regularityIncentive)} ج.م\n` +
    `• منحة: ${formatNumberWithCommas(employee.grant)} ج.م\n` +
    `• تسويات: ${formatNumberWithCommas(employee.settlements)} ج.م\n\n` +
    `➖ *الاستقطاعات:*\n` +
    `• تحت الحساب: ${formatNumberWithCommas(employee.underAccount)} ج.م\n\n` +
    `━━━━━━━━━━━━━━━━━━\n` +
    `💰 *الإجمالي المستحق:* ${formatNumberWithCommas(employee.total)} ج.م`
  );
}

/**
 * Generate formatted text preview representing the approved Monthly Statement template.
 */
export function generateMonthlyMessagePreview(employee: MonthlyEmployeeRecord): string {
  return (
    `*بيان مفردات المرتب الشهري*\n` +
    `━━━━━━━━━━━━━━━━━━\n` +
    `👤 *الاسم:* ${employee.employeeName || '—'}\n` +
    `📅 *فترة الراتب:* ${employee.salaryPeriod || '—'}\n\n` +
    `💼 *الأجور والبدلات:*\n` +
    `• أجر الاشتراك: ${formatNumberWithCommas(employee.subscriptionWage)} ج.م\n` +
    `• الأجر الشامل: ${formatNumberWithCommas(employee.comprehensiveWage)} ج.م\n` +
    `• بند الشهر: ${formatNumberWithCommas(employee.monthlyItem)} ج.م\n` +
    `• بدل غلاء المعيشة: ${formatNumberWithCommas(employee.costOfLivingAllowance)} ج.م\n` +
    `• حافز العامل: ${formatNumberWithCommas(employee.workerIncentive)} ج.م\n` +
    `• إجمالي الراتب قبل الاستقطاعات: ${formatNumberWithCommas(employee.grossBeforeDeductions)} ج.م\n\n` +
    `➖ *الاستقطاعات:*\n` +
    `• الغياب: ${formatNumberWithCommas(employee.absence)} ج.م\n` +
    `• الضريبة: ${formatNumberWithCommas(employee.tax)} ج.م\n` +
    `• السلفة: ${formatNumberWithCommas(employee.advance)} ج.م\n` +
    `• السكن: ${formatNumberWithCommas(employee.housing)} ج.م\n` +
    `• باقي السلفة: ${formatNumberWithCommas(employee.remainingAdvance)} ج.م\n\n` +
    `🏖️ *الأرصدة:*\n` +
    `• رصيد الإجازات: ${employee.leaveBalance || '0'}\n` +
    `• رصيد العارضة: ${employee.casualLeaveBalance || '0'}\n\n` +
    `━━━━━━━━━━━━━━━━━━\n` +
    `💵 *صافي الراتب المستحق:* ${formatNumberWithCommas(employee.netSalary)} ج.م`
  );
}

// Legacy backward-compatible preview function
export function generateSalaryMessage(employee: MonthlyEmployeeRecord): string {
  return generateMonthlyMessagePreview(employee);
}

export function buildSalaryTemplateParameters(employee: MonthlyEmployeeRecord): string[] {
  return buildMonthlyTemplateParameters(employee);
}
