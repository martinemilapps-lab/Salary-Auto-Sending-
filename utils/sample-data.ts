import * as XLSX from 'xlsx';

export interface SampleEmployeeData {
  'Employee ID': string;
  'Employee Name': string;
  'WhatsApp Number': string;
  'Salary Month': string;
  'Basic Salary': number;
  'Bonus': number;
  'Deductions': number;
  'Net Salary': number;
}

export const SAMPLE_EMPLOYEES: SampleEmployeeData[] = [
  {
    'Employee ID': 'EMP-1001',
    'Employee Name': 'Ahmed Hassan',
    'WhatsApp Number': '+201012345678',
    'Salary Month': 'July 2026',
    'Basic Salary': 8000,
    'Bonus': 500,
    'Deductions': 300,
    'Net Salary': 8200,
  },
  {
    'Employee ID': 'EMP-1002',
    'Employee Name': 'Mariam Omar',
    'WhatsApp Number': '+201198765432',
    'Salary Month': 'July 2026',
    'Basic Salary': 12000,
    'Bonus': 1500,
    'Deductions': 600,
    'Net Salary': 12900,
  },
  {
    'Employee ID': 'EMP-1003',
    'Employee Name': 'Khaled Mostafa',
    'WhatsApp Number': '+201255554433',
    'Salary Month': 'July 2026',
    'Basic Salary': 9500,
    'Bonus': 800,
    'Deductions': 400,
    'Net Salary': 9900,
  },
  {
    'Employee ID': 'EMP-1004',
    'Employee Name': 'Nour El-Din',
    'WhatsApp Number': '+201500001122',
    'Salary Month': 'July 2026',
    'Basic Salary': 15000,
    'Bonus': 2000,
    'Deductions': 1000,
    'Net Salary': 16000,
  },
  {
    'Employee ID': 'EMP-1005',
    'Employee Name': 'Sara Ibrahim',
    'WhatsApp Number': '+201077778899',
    'Salary Month': 'July 2026',
    'Basic Salary': 7500,
    'Bonus': 300,
    'Deductions': 200,
    'Net Salary': 7600,
  },
];

/**
 * Downloads a sample pre-formatted Excel template file
 */
export function downloadSampleExcelTemplate(): void {
  const worksheet = XLSX.utils.json_to_sheet(SAMPLE_EMPLOYEES);

  // Set column widths for readability
  worksheet['!cols'] = [
    { wch: 15 }, // Employee ID
    { wch: 22 }, // Employee Name
    { wch: 20 }, // WhatsApp Number
    { wch: 15 }, // Salary Month
    { wch: 15 }, // Basic Salary
    { wch: 12 }, // Bonus
    { wch: 12 }, // Deductions
    { wch: 15 }, // Net Salary
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Salary Sheet');

  XLSX.writeFile(workbook, 'HR_Salary_Template_July_2026.xlsx');
}
