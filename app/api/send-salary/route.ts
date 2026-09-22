import { NextRequest, NextResponse } from 'next/server';
import { EmployeeRecord } from '@/types/salary';
import { buildSalaryTemplateParameters } from '@/lib/message-generator';
import { sendWhatsAppTemplateMessage, getWhatsAppConfigStatus } from '@/lib/whatsapp';

export const dynamic = 'force-dynamic';

export async function GET() {
  const status = getWhatsAppConfigStatus();
  return NextResponse.json(status);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { employee } = body as { employee: EmployeeRecord };

    if (!employee || !employee.employeeName || !employee.formattedPhone) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required employee details (name or formatted phone).',
        },
        { status: 400 }
      );
    }

    // Build the 6 approved Meta WhatsApp template parameters in exact order:
    // {{1}} Employee Name
    // {{2}} Salary Month
    // {{3}} Basic Salary
    // {{4}} Bonus
    // {{5}} Deductions
    // {{6}} Net Salary
    const parameters = buildSalaryTemplateParameters(employee);

    // Dispatch via WhatsApp Cloud API using the approved salary_statement template
    const result = await sendWhatsAppTemplateMessage(employee.formattedPhone, parameters);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          mode: result.mode,
          error: result.error || 'Failed to send WhatsApp message.',
        },
        { status: result.mode === 'unconfigured' ? 400 : 500 }
      );
    }

    return NextResponse.json({
      success: true,
      mode: result.mode,
      messageId: result.messageId,
      sentAt: new Date().toISOString(),
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json(
      {
        success: false,
        error: errorMsg,
      },
      { status: 500 }
    );
  }
}
