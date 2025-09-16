import { NextRequest, NextResponse } from 'next/server';

const DOMA_API_URL = process.env.NEXT_PUBLIC_DOMA_API_URL || 'https://api-testnet.doma.xyz';
const API_KEY = process.env.NEXT_PUBLIC_DOMA_API_KEY || 'v1.8f6347c32950c1bfaedc4b29676fcaa14a6586ed8586338b24fdfc6c69df8b02';

// GET /api/marketplace/fees - Get marketplace fees for a specific orderbook and chain
export async function GET(request: NextRequest) {
  try {
    // Return hardcoded fees from Doma documentation since we don't have actual token contract addresses
    const fees = {
      protocolFee: 0.5, // 0.5% Doma protocol fee
      protocolFeeReceiver: '0x2E7cC63800e77BB8c662c45Ef33D1cCc23861532',
      royaltyFee: 0, // Will be calculated per token using royaltyInfo
      totalFee: 0.5,
      note: 'Fees calculated from Doma documentation. Use @doma-protocol/orderbook-sdk for automatic fee calculation.'
    };

    return NextResponse.json(fees);

  } catch (error: any) {
    console.error('Error fetching marketplace fees:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
