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
  const basicStr = `${formatCurrencyNumber(employee.basicSalary)} ${currencyStr}`;
  const bonusStr = `${formatCurrencyNumber(employee.bonus)} ${currencyStr}`;
  const deductionsStr = `${formatCurrencyNumber(employee.deductions)} ${currencyStr}`;
  const netStr = `${formatCurrencyNumber(employee.netSalary)} ${currencyStr}`;

  return (
    `Hello ${employee.employeeName.trim()},\n\n` +
    `Salary Statement\n\n` +
    `Month:\n${employee.salaryMonth.trim()}\n\n` +
    `Basic Salary:\n${basicStr}\n\n` +
    `Bonus:\n${bonusStr}\n\n` +
    `Deductions:\n${deductionsStr}\n\n` +
    `Net Salary:\n${netStr}\n\n` +
    `Thank you.`
  );
}

