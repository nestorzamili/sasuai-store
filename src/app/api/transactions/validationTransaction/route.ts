import { NextResponse, NextRequest } from 'next/server';
import { TransactionProcessingService } from '@/lib/services/transaction-processing.service';

export async function POST(request: NextRequest) {
  const body = await request.json();
  try {
    const product = await TransactionProcessingService.validationTransaction(
      body.cart,
      body.memberId
    );
    return NextResponse.json(product);
  } catch (error) {
    console.log(error);
  }
  // return
}
