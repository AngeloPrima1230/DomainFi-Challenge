import { NextRequest, NextResponse } from 'next/server';

const DOMA_API_URL = process.env.NEXT_PUBLIC_DOMA_API_URL || 'https://api-testnet.doma.xyz';
const API_KEY = process.env.NEXT_PUBLIC_DOMA_API_KEY || 'v1.8f6347c32950c1bfaedc4b29676fcaa14a6586ed8586338b24fdfc6c69df8b02';

// GET /api/marketplace/listings - Fetch marketplace listings
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const skip = parseInt(searchParams.get('skip') || '0');
    const take = parseInt(searchParams.get('take') || '100');
    const orderbook = searchParams.get('orderbook') || 'DOMA';

    const response = await fetch(`${DOMA_API_URL}/graphql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'API-Key': API_KEY,
      },
      body: JSON.stringify({
        query: `
          query GetListings($skip: Int = 0, $take: Int = 100) {
            listings(skip: $skip, take: $take) {
              items {
                id
                externalId
                price
                currency {
                  symbol
                  decimals
                }
                offererAddress
                orderbook
                tokenId
                expiresAt
                createdAt
                updatedAt
              }
              totalCount
              hasNextPage
            }
          }
        `,
        variables: { skip, take }
      }),
    });

    if (!response.ok) {
      throw new Error(`Doma API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.errors) {
      throw new Error(data.errors[0].message);
    }

    return NextResponse.json({
      success: true,
      data: data.data.listings,
    });

  } catch (error: any) {
    console.error('Error fetching listings:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST /api/marketplace/listings - Create a new listing
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderbook, chainId, parameters, signature } = body;

    if (!orderbook || !chainId || !parameters || !signature) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const response = await fetch(`${DOMA_API_URL}/v1/orderbook/listing`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'API-Key': API_KEY,
      },
      body: JSON.stringify({
        orderbook,
        chainId,
        parameters,
        signature,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Doma API error: ${response.status}`);
    }

    const data = await response.json();

    return NextResponse.json({
      success: true,
      data: {
        orderId: data.orderId,
      },
    });

  } catch (error: any) {
    console.error('Error creating listing:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}