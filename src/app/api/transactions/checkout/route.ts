import { NextResponse, NextRequest } from 'next/server';
import { TransactionProcessingService } from '@/lib/services/transaction-processing.service';
import { errorHandling } from '@/lib/common/response-formatter';
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const trx = await TransactionProcessingService.processTransaction(body);

    return NextResponse.json({
      success: true,
      data: trx,
    });
  } catch (error) {
    console.error('Error processing transaction:', error);
    return errorHandling();
  }
}
