export * from './validation/common';
export * from './validation/weekly';
export * from './validation/monthly';

import { validateMonthlyRecords } from './validation/monthly';
import { MonthlyEmployeeRecord } from '@/types/monthly';

// Legacy alias
export const validateEmployeeRecords = (records: MonthlyEmployeeRecord[]) => validateMonthlyRecords(records);
