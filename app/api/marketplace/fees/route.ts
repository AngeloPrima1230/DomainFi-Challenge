import { NextRequest, NextResponse } from 'next/server';

const DOMA_API_URL = process.env.NEXT_PUBLIC_DOMA_API_URL || 'https://api-testnet.doma.xyz';
const API_KEY = process.env.NEXT_PUBLIC_DOMA_API_KEY || 'v1.8f6347c32950c1bfaedc4b29676fcaa14a6586ed8586338b24fdfc6c69df8b02';

// GET /api/marketplace/fees - Get marketplace fees for a specific orderbook and chain
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orderbook = searchParams.get('orderbook') || 'DOMA';
    const chainId = searchParams.get('chainId');
    const contractAddress = searchParams.get('contractAddress');

    if (!chainId || !contractAddress) {
      return NextResponse.json(
        { success: false, error: 'Missing chainId or contractAddress' },
        { status: 400 }
      );
    }

    const response = await fetch(
      `${DOMA_API_URL}/v1/orderbook/fee/${orderbook}/${chainId}/${contractAddress}`,
      {
        headers: {
          'API-Key': API_KEY,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Doma API error: ${response.status}`);
    }

    const data = await response.json();

    // Add Doma protocol fee information
    const fees = {
      marketplaceFees: data.marketplaceFees || [],
      protocolFee: {
        percentage: 0.5, // 0.5% Doma protocol fee
        receiver: '0x2E7cC63800e77BB8c662c45Ef33D1cCc23861532',
      },
    };

    return NextResponse.json({
      success: true,
      data: fees,
    });

  } catch (error: any) {
    console.error('Error fetching marketplace fees:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
