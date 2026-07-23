import { EmployeeRecord, ValidationError } from '@/types/salary';

/**
 * Format phone number to clean E.164 standard.
 * Auto-converts Egyptian local numbers (01xxxxxxxxx) to +201xxxxxxxxx
 */
export function formatPhoneNumber(rawPhone: string | number): { formatted: string; isValid: boolean } {
  if (!rawPhone) {
    return { formatted: '', isValid: false };
  }

  let str = String(rawPhone).trim().replace(/[\s\-\(\)\.]/g, '');

  // Handle leading 00 as +
  if (str.startsWith('00')) {
    str = '+' + str.slice(2);
  }

  // Handle Egyptian local mobile prefix (010, 011, 012, 015)
  if (/^01[0125]\d{8}$/.test(str)) {
    str = '+20' + str.slice(1);
  }

  // If missing +, add + if it starts with country code digit
  if (!str.startsWith('+') && /^\d{8,15}$/.test(str)) {
    str = '+' + str;
  }

  // E.164 standard regex validation: + followed by 8-15 digits
  const isE164 = /^\+[1-9]\d{7,14}$/.test(str);

  return {
    formatted: str,
    isValid: isE164,
  };
}

/**
 * Validates a list of parsed employee records
 */
export function validateEmployeeRecords(records: EmployeeRecord[]): {
  validatedRecords: EmployeeRecord[];
  allErrors: ValidationError[];
} {
  const allErrors: ValidationError[] = [];
  const seenIds = new Map<string, number>();
  const seenPhones = new Map<string, number>();

  const validatedRecords = records.map((record, index) => {
    const rowNum = index + 1;
    const errors: string[] = [];
    let status: 'valid' | 'warning' | 'error' = 'valid';

    // 1. Employee Name Check
    if (!record.employeeName || record.employeeName.trim() === '') {
      errors.push('Employee name is missing.');
      allErrors.push({
        rowIndex: rowNum,
        employeeId: record.employeeId,
        field: 'Employee Name',
        message: 'Name is required',
        type: 'error',
      });
      status = 'error';
    }

    // 2. Phone Number Check
    const { formatted, isValid } = formatPhoneNumber(record.whatsappNumber);
    record.formattedPhone = formatted;

    if (!record.whatsappNumber) {
      errors.push('WhatsApp number is missing.');
      allErrors.push({
        rowIndex: rowNum,
        employeeName: record.employeeName,
        employeeId: record.employeeId,
        field: 'WhatsApp Number',
        message: 'Phone number is required',
        type: 'error',
      });
      status = 'error';
    } else if (!isValid) {
      errors.push(`Invalid phone number format: "${record.whatsappNumber}". Must be E.164 international format (e.g. +201012345678).`);
      allErrors.push({
        rowIndex: rowNum,
        employeeName: record.employeeName,
        employeeId: record.employeeId,
        field: 'WhatsApp Number',
        message: `Invalid format: ${record.whatsappNumber}`,
        type: 'error',
      });
      status = 'error';
    }

    // 3. Numeric Checks
    if (isNaN(record.basicSalary) || record.basicSalary < 0) {
      errors.push('Basic Salary must be a non-negative number.');
      allErrors.push({
        rowIndex: rowNum,
        employeeName: record.employeeName,
        employeeId: record.employeeId,
        field: 'Basic Salary',
        message: 'Invalid basic salary amount',
        type: 'error',
      });
      status = 'error';
    }

    if (isNaN(record.bonus) || record.bonus < 0) {
      errors.push('Bonus must be a non-negative number.');
      allErrors.push({
        rowIndex: rowNum,
        employeeName: record.employeeName,
        employeeId: record.employeeId,
        field: 'Bonus',
        message: 'Invalid bonus amount',
        type: 'error',
      });
      status = 'error';
    }

    if (isNaN(record.deductions) || record.deductions < 0) {
      errors.push('Deductions must be a non-negative number.');
      allErrors.push({
        rowIndex: rowNum,
        employeeName: record.employeeName,
        employeeId: record.employeeId,
        field: 'Deductions',
        message: 'Invalid deductions amount',
        type: 'error',
      });
      status = 'error';
    }

    if (isNaN(record.netSalary) || record.netSalary <= 0) {
      errors.push('Net Salary must be greater than zero.');
      allErrors.push({
        rowIndex: rowNum,
        employeeName: record.employeeName,
        employeeId: record.employeeId,
        field: 'Net Salary',
        message: 'Net Salary must be > 0',
        type: 'error',
      });
      status = 'error';
    }

    // 4. Mathematical Consistency Check (Basic + Bonus - Deductions == Net)
    if (!isNaN(record.basicSalary) && !isNaN(record.bonus) && !isNaN(record.deductions) && !isNaN(record.netSalary)) {
      const expectedNet = record.basicSalary + record.bonus - record.deductions;
      const difference = Math.abs(record.netSalary - expectedNet);
      if (difference > 0.5) {
        const warnMsg = `Net Salary (${record.netSalary}) does not equal Basic (${record.basicSalary}) + Bonus (${record.bonus}) - Deductions (${record.deductions}) [Expected: ${expectedNet}].`;
        errors.push(warnMsg);
        allErrors.push({
          rowIndex: rowNum,
          employeeName: record.employeeName,
          employeeId: record.employeeId,
          field: 'Net Salary',
          message: warnMsg,
          type: 'warning',
        });
        if (status !== 'error') {
          status = 'warning';
        }
      }
    }

    // 5. Duplicate ID / Duplicate Phone Tracking
    if (record.employeeId) {
      if (seenIds.has(record.employeeId)) {
        const prevRow = seenIds.get(record.employeeId)!;
        const msg = `Duplicate Employee ID "${record.employeeId}" (already on row ${prevRow}).`;
        errors.push(msg);
        allErrors.push({
          rowIndex: rowNum,
          employeeName: record.employeeName,
          employeeId: record.employeeId,
          field: 'Employee ID',
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
        const msg = `Duplicate WhatsApp number "${formatted}" (already assigned to row ${prevRow}).`;
        errors.push(msg);
        allErrors.push({
          rowIndex: rowNum,
          employeeName: record.employeeName,
          employeeId: record.employeeId,
          field: 'WhatsApp Number',
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

  return {
    validatedRecords,
    allErrors,
  };
}
