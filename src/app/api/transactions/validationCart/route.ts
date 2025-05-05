import { NextResponse, NextRequest } from 'next/server';
import { TransactionProcessingService } from '@/lib/services/transaction-processing.service';
import { Cart } from '@/lib/types/transaction-process';
export async function POST(request: NextRequest) {
  const body = await request.json();
  try {
    const product = await TransactionProcessingService.validationCart(body);
    return NextResponse.json(product);
  } catch (error) {
    console.log(error);
  }
}
