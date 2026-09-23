export * from './excel/common';
export * from './excel/weekly-mapper';
export * from './excel/monthly-mapper';

import { parseMonthlyExcelFile } from './excel/monthly-mapper';

// Legacy compatibility function
export const parseExcelFile = (file: File) => parseMonthlyExcelFile(file);
