import { WeeklyEmployeeRecord } from '@/types/weekly';
import { ValidationError } from '@/types/common';
import { formatPhoneNumber } from './common';

export function validateWeeklyRecords(records: WeeklyEmployeeRecord[]): {
  validatedRecords: WeeklyEmployeeRecord[];
  allErrors: ValidationError[];
} {
  const allErrors: ValidationError[] = [];
  const seenIds = new Map<string, number>();
  const seenPhones = new Map<string, number>();

  const validatedRecords = records.map((record, index) => {
    const rowNum = index + 1;
    const errors: string[] = [];
    let status: 'valid' | 'warning' | 'error' = 'valid';

    // 1. Employee Name
    if (!record.employeeName || record.employeeName.trim() === '') {
      errors.push('Employee name is missing / اسم الموظف مطلوب');
      allErrors.push({
        rowIndex: rowNum,
        employeeId: record.employeeId,
        field: 'الاسم (Employee Name)',
        message: 'Name is required / اسم الموظف مطلوب',
        type: 'error',
      });
      status = 'error';
    }

    // 2. WhatsApp Phone Number
    const { formatted, isValid } = formatPhoneNumber(record.whatsappNumber);
    record.formattedPhone = formatted;

    if (!record.whatsappNumber || String(record.whatsappNumber).trim() === '') {
      errors.push('WhatsApp number is missing / رقم الهاتف مطلوب');
      allErrors.push({
        rowIndex: rowNum,
        employeeName: record.employeeName,
        employeeId: record.employeeId,
        field: 'رقم الهاتف (Phone Number)',
        message: 'Phone number is required / رقم الهاتف مطلوب',
        type: 'error',
      });
      status = 'error';
    } else if (!isValid) {
      errors.push(`Invalid phone format: "${record.whatsappNumber}" / رقم الهاتف غير صالح`);
      allErrors.push({
        rowIndex: rowNum,
        employeeName: record.employeeName,
        employeeId: record.employeeId,
        field: 'رقم الهاتف (Phone Number)',
        message: `Invalid format: ${record.whatsappNumber} (requires international e.g. +201012345678)`,
        type: 'error',
      });
      status = 'error';
    }

    // 3. Numeric verification
    if (isNaN(record.total) || record.total < 0) {
      errors.push('Total amount must be greater than or equal to zero / يجب أن يكون الإجمالي صفراً أو أكثر');
      allErrors.push({
        rowIndex: rowNum,
        employeeName: record.employeeName,
        employeeId: record.employeeId,
        field: 'الإجمالي (Total)',
        message: 'Invalid total amount',
        type: 'warning',
      });
      if (status !== 'error') status = 'warning';
    }

    // 4. Duplicate ID and Duplicate Phone Tracking
    if (record.employeeId && record.employeeId !== `EMP-${rowNum + 1000}`) {
      if (seenIds.has(record.employeeId)) {
        const prevRow = seenIds.get(record.employeeId)!;
        const msg = `Duplicate Employee ID "${record.employeeId}" (also on row ${prevRow}) / كود موظف مكرر`;
        errors.push(msg);
        allErrors.push({
          rowIndex: rowNum,
          employeeName: record.employeeName,
          employeeId: record.employeeId,
          field: 'كود الموظف (Employee ID)',
          message: msg,
          type: 'warning',
        });
        if (status !== 'error') status = 'warning';
      } else {
        seenIds.set(record.employeeId, rowNum);
      }
    }

    if (formatted) {
      if (seenPhones.has(formatted)) {
        const prevRow = seenPhones.get(formatted)!;
        const msg = `Duplicate WhatsApp number "${formatted}" (also on row ${prevRow}) / رقم هاتف مكرر`;
        errors.push(msg);
        allErrors.push({
          rowIndex: rowNum,
          employeeName: record.employeeName,
          employeeId: record.employeeId,
          field: 'رقم الهاتف (Phone Number)',
          message: msg,
          type: 'warning',
        });
        if (status !== 'error') status = 'warning';
      } else {
        seenPhones.set(formatted, rowNum);
      }
    }

    return {
      ...record,
      status,
      validationErrors: errors,
    };
  });

  return { validatedRecords, allErrors };
}
