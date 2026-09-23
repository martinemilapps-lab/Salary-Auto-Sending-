export * from './common';
export * from './weekly';
export * from './monthly';

import { MonthlyEmployeeRecord } from './monthly';

// Legacy compatibility aliases
export type EmployeeRecord = MonthlyEmployeeRecord;
export type ParseResult = import('./monthly').MonthlyParseResult;
