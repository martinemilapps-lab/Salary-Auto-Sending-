import { NextRequest, NextResponse } from 'next/server';
import { EmployeeRecord } from '@/types/salary';
import { generateSalaryMessage } from '@/lib/message-generator';
import { sendWhatsAppMessage, getWhatsAppConfigStatus } from '@/lib/whatsapp';

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

    // Generate personalized salary text
    const messageText = generateSalaryMessage(employee);

    // Dispatch via WhatsApp Cloud API
    const result = await sendWhatsAppMessage(employee.formattedPhone, messageText);

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
