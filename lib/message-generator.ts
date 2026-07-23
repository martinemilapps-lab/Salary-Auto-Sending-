import { EmployeeRecord } from '@/types/salary';

/**
 * Format a number as clean currency string (e.g. 8,000)
 */
export function formatCurrencyNumber(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  }).format(amount);
}

/**
 * Generate personalized salary message string for WhatsApp sending
 */
export function generateSalaryMessage(employee: EmployeeRecord): string {
  const currencyStr = employee.currency || 'EGP';
  const basicStr = formatCurrencyNumber(employee.basicSalary);
  const bonusStr = formatCurrencyNumber(employee.bonus);
  const deductionsStr = formatCurrencyNumber(employee.deductions);
  const netStr = formatCurrencyNumber(employee.netSalary);

  return (
    `Hello ${employee.employeeName.trim()},\n\n` +
    `Your salary statement for ${employee.salaryMonth.trim()}.\n\n` +
    `Basic Salary: ${basicStr} ${currencyStr}\n` +
    `Bonus: ${bonusStr} ${currencyStr}\n` +
    `Deductions: ${deductionsStr} ${currencyStr}\n` +
    `Net Salary: ${netStr} ${currencyStr}\n\n` +
    `Thank you.`
  );
}
