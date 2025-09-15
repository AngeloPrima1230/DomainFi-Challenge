import { NextRequest, NextResponse } from 'next/server';

const GQL = process.env.DOMA_SUBGRAPH_URL || 'https://api-testnet.doma.xyz/graphql';
const API_KEY = process.env.DOMA_API_KEY || process.env.DOMA_API_KEY;

const GET_LISTINGS_BY_OWNER = `
  query GetListingsByOwner($ownedBy: [AddressCAIP10!]!, $skip: Int = 0, $take: Int = 100) {
    names(ownedBy: $ownedBy, skip: $skip, take: $take, sortOrder: DESC) {
      items {
        tokens {
          ownerAddress
          chain { networkId }
          listings {
            price
            currency { symbol decimals }
            orderbook
            offererAddress
            createdAt
            expiresAt
          }
        }
      }
      hasNextPage
    }
  }
`;

const GET_LISTINGS_SINCE = `
  query GetListingsSince($skip: Int = 0, $take: Int = 100, $createdSince: DateTime) {
    listings(skip: $skip, take: $take, createdSince: $createdSince) {
      items {
        price
        currency { symbol decimals }
        orderbook
        offererAddress
        createdAt
        expiresAt
      }
      hasNextPage
    }
  }
`;

const GET_NAMES_COUNT_BY_OWNER = `
  query GetNamesCountByOwner($ownedBy: [AddressCAIP10!]!) {
    names(ownedBy: $ownedBy, take: 1, skip: 0) {
      totalCount
    }
  }
`;

const GET_NAMES_PAGE = `
  query GetNamesPage($skip: Int = 0, $take: Int = 100) {
    names(skip: $skip, take: $take, sortOrder: DESC) {
      items { 
        tokenizedAt 
      }
      hasNextPage
    }
  }
`;

function evmFromCAIP10(addr?: string) {
  if (!addr) return '';
  const parts = addr.split(':');
  return parts[parts.length - 1].toLowerCase();
}

async function gql<T>(query: string, variables?: any): Promise<T> {
  const r = await fetch(GQL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(API_KEY ? { 'API-Key': API_KEY as string } : {}),
    },
    body: JSON.stringify({ query, variables }),
    cache: 'no-store',
  });
  if (!r.ok) {
    const body = await r.text().catch(() => '');
    throw new Error(`Subgraph ${r.status}: ${body || 'Bad response'}`);
  }
  const j = await r.json().catch(() => ({}));
  if ((j as any).errors?.length) throw new Error((j as any).errors[0].message);
  return (j as any).data;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const ownerRaw = (searchParams.get('owner') || '').trim();
    if (ownerRaw && !/^0x[a-fA-F0-9]{40}$/.test(ownerRaw)) {
      return NextResponse.json({ error: 'Invalid owner address' }, { status: 400 });
    }
    const ownerEvm = ownerRaw.toLowerCase();

    // when no owner, default to last 1 hour (can be overridden via ?since=...)
    const sinceParam = (searchParams.get('since') || '').trim();
    let sinceMs = 0;
    if (!ownerEvm) {
      if (sinceParam) {
        const n = Number(sinceParam);
        const parsed = Number.isFinite(n) && n > 0 ? (n > 1e12 ? n : n * 1000) : Date.parse(sinceParam);
        sinceMs = Number.isFinite(parsed) ? parsed : Date.now() - 3_600_000;
      } else {
        sinceMs = Date.now() - 3_600_000;
      }
    }

    // USD rates
    const pricesRes = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=ethereum,usd-coin&vs_currencies=usd',
      { cache: 'no-store' }
    );
    const prices = await pricesRes.json();
    const usdRate: Record<string, number> = {
      ETH: prices?.ethereum?.usd ?? 0,
      USDC: prices?.['usd-coin']?.usd ?? 1,
      USD: 1,
    };

    let listed = 0, active = 0, totalUsd = 0, tokenizedDomains = 0;

    if (ownerEvm) {
      // Owner path: fetch owner's tokens and their listings
      const ownedBy = [`eip155:97476:${ownerEvm}`];
      let nSkip = 0, nTake = 100, nHasNext = true;
      let ctLoop = 0;
      while (nHasNext) {
        console.log(++ctLoop)
        const data = await gql<{
          names: {
            items: Array<{
              tokens: Array<{
                ownerAddress: string;
                chain?: { networkId?: string };
                listings?: Array<{
                  price: string;
                  currency?: { symbol?: string; decimals?: number };
                  orderbook?: string;
                  offererAddress?: string;
                  createdAt?: string;
                  expiresAt?: string;
                }>;
              }>;
            }>;
            hasNextPage: boolean;
          };
        }>(GET_LISTINGS_BY_OWNER, { ownedBy, skip: nSkip, take: nTake });

        const nameItems = data?.names?.items || [];
        for (const name of nameItems) {
          for (const tok of (name.tokens || [])) {
            const ls = tok.listings || [];
            for (const l of ls) {
              if (l.orderbook !== 'DOMA') continue;

              listed++;
              const isActive = l.expiresAt ? (new Date(l.expiresAt).getTime() > Date.now()) : false;
              if (isActive) active++;

              const sym = l.currency?.symbol?.toUpperCase?.() || 'ETH';
              const dec = typeof l.currency?.decimals === 'number' ? l.currency.decimals : 18;
              let native = 0;
              try { native = Number(BigInt(l.price)) / 10 ** dec; } catch {}
              totalUsd += native * (usdRate[sym] || 0);
            }
          }
        }

        nHasNext = data?.names?.hasNextPage ?? false;
        nSkip += nTake;
      }

      // Owner tokenized count
      const byOwner = await gql<{ names: { totalCount: number } }>(GET_NAMES_COUNT_BY_OWNER, { ownedBy });
      tokenizedDomains = byOwner?.names?.totalCount ?? 0;

    } else {
      // No owner path: fetch listings since last 1h, names with client-side filtering
      const createdSince = sinceMs ? new Date(sinceMs).toISOString() : undefined;

      // Fetch listings since timestamp
      let lSkip = 0, lTake = 100, lHasNext = true;
      while (lHasNext) {
        const lData = await gql<{ listings: { items: any[]; hasNextPage: boolean } }>(
          GET_LISTINGS_SINCE, 
          { skip: lSkip, take: lTake, createdSince }
        );
        const items = lData.listings.items || [];

        for (const l of items) {
          if (l.orderbook !== 'DOMA') continue;

          listed++;
          const isActive = new Date(l.expiresAt).getTime() > Date.now();
          if (isActive) active++;

          const sym = l.currency?.symbol?.toUpperCase?.() || 'ETH';
          const dec = typeof l.currency?.decimals === 'number' ? l.currency.decimals : 18;
          let native = 0;
          try { native = Number(BigInt(l.price)) / 10 ** dec; } catch {}
          totalUsd += native * (usdRate[sym] || 0);
        }

        lHasNext = lData.listings.hasNextPage;
        lSkip += lTake;
      }

      // Fetch names and filter by tokenizedAt client-side (since tokenizedSince doesn't exist)
      let nSkip = 0, nTake = 100, nHasNext = true;
      while (nHasNext) {
        const nData = await gql<{ names: { items: Array<{ tokenizedAt: string }>; hasNextPage: boolean } }>(
          GET_NAMES_PAGE,
          { skip: nSkip, take: nTake }
        );
        const nItems = nData?.names?.items || [];
        
        // Filter by tokenizedAt client-side
        for (const item of nItems) {
          const tokenizedAt = item?.tokenizedAt ? new Date(item.tokenizedAt).getTime() : 0;
          if (tokenizedAt >= sinceMs) {
            tokenizedDomains++;
          } else {
            // Since we're sorted DESC, once we hit older items, stop
            nHasNext = false;
            break;
          }
        }

        if (nHasNext) {
          nHasNext = nData?.names?.hasNextPage ?? false;
          nSkip += nTake;
        }
      }
    }

    const maxAge = 60; // rolling 1h or owner-scoped → short cache

    return NextResponse.json({
      active: active,
      listed: listed,
      totalVolumeUsd: totalUsd,
      tokenizedDomains,
    }, { headers: { 'Cache-Control': `public, s-maxage=${maxAge}, stale-while-revalidate=60` }, status: 200 });
  } catch (err: any) {
    console.error('market-stats error:', err?.message || err);
    return NextResponse.json({
      active: 0,
      listed: 0,
      totalVolumeUsd: 0,
      tokenizedDomains: 0,
      error: err?.message || 'Unknown error',
    }, { status: 200 });
  }
}