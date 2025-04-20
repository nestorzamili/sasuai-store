import { NextResponse, NextRequest } from 'next/server';
import { TransactionProcessingService } from '@/lib/services/transaction-processing.service';
export async function POST(request: NextRequest) {
  const body = await request.json();

  try {
    const trx = await TransactionProcessingService.processTransaction(body);
    return NextResponse.json(trx);
  } catch (error) {
    return NextResponse.json(error);
  }
}
