import { NextResponse } from 'next/server';
import { PRESET_VOICES } from '@/lib/voices';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({
    success: true,
    voices: PRESET_VOICES,
    total: PRESET_VOICES.length,
  });
}
