import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  return NextResponse.json({
    success: true,
    name: 'Sasuai API',
    version: '1.0.0',
    status: 'healthy',
    timestamp: new Date().toISOString(),
  });
}
