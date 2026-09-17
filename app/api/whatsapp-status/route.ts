import { NextResponse } from 'next/server';
import { getWhatsAppConfigStatus } from '@/lib/whatsapp';

export const dynamic = 'force-dynamic';

export async function GET() {
  const status = getWhatsAppConfigStatus();
  return NextResponse.json(status);
}
