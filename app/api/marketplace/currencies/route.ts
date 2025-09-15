import { NextRequest, NextResponse } from 'next/server';

const DOMA_API_URL = process.env.NEXT_PUBLIC_DOMA_API_URL || 'https://api-testnet.doma.xyz';
const API_KEY = process.env.NEXT_PUBLIC_DOMA_API_KEY || 'v1.8f6347c32950c1bfaedc4b29676fcaa14a6586ed8586338b24fdfc6c69df8b02';

// GET /api/marketplace/currencies - Get supported currencies for a chain and contract
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const chainId = searchParams.get('chainId');
    const contractAddress = searchParams.get('contractAddress');
    const orderbook = searchParams.get('orderbook') || 'DOMA';

    if (!chainId || !contractAddress) {
      return NextResponse.json(
        { success: false, error: 'Missing chainId or contractAddress' },
        { status: 400 }
      );
    }

    const response = await fetch(
      `${DOMA_API_URL}/v1/orderbook/currencies/${chainId}/${contractAddress}/${orderbook}`,
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

    return NextResponse.json({
      success: true,
      data: data.currencies || [],
    });

  } catch (error: any) {
    console.error('Error fetching supported currencies:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
