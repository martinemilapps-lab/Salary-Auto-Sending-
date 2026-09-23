import { NextRequest, NextResponse } from 'next/server';
import { StatementType } from '@/types/common';
import { WeeklyEmployeeRecord } from '@/types/weekly';
import { MonthlyEmployeeRecord } from '@/types/monthly';
import { buildWeeklyTemplateParameters, buildMonthlyTemplateParameters } from '@/lib/message-generator';
import { sendWhatsAppStatementMessage, getWhatsAppConfigStatus } from '@/lib/whatsapp';

export const dynamic = 'force-dynamic';

export async function GET() {
  const status = getWhatsAppConfigStatus();
  return NextResponse.json(status);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const statementType: StatementType = body.statementType === 'weekly' ? 'weekly' : 'monthly';
    const employee = body.employee as WeeklyEmployeeRecord | MonthlyEmployeeRecord;

    const recipientPhone = employee?.formattedPhone || employee?.whatsappNumber;

    if (!employee || !employee.employeeName || !recipientPhone) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required employee details (name or valid phone number).',
        },
        { status: 400 }
      );
    }

    // Select the correct template parameter mapper based on statementType
    let parameters: string[];
    if (statementType === 'weekly') {
      parameters = buildWeeklyTemplateParameters(employee as WeeklyEmployeeRecord);
    } else {
      parameters = buildMonthlyTemplateParameters(employee as MonthlyEmployeeRecord);
    }

    // Dispatch via shared WhatsApp sending engine
    const result = await sendWhatsAppStatementMessage(recipientPhone, statementType, parameters);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          mode: result.mode,
          error: result.error || 'Failed to send WhatsApp statement.',
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
