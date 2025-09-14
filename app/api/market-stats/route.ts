import { NextResponse } from 'next/server';

const GQL = process.env.NEXT_PUBLIC_DOMA_SUBGRAPH_URL || 'https://api-testnet.doma.xyz/graphql';
const API_KEY = process.env.NEXT_PUBLIC_DOMA_API_KEY || process.env.DOMA_API_KEY;

const GET_LISTINGS_PAGE = `
  query GetListings($skip: Int = 0, $take: Int = 200) {
    listings(skip: $skip, take: $take) {
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

const GET_NAMES_COUNT = `
  query { names(skip: 0, take: 1) { totalCount } }
`;

const GET_NAMES_PAGE = `
  query GetNamesPage($skip: Int = 0, $take: Int = 100) {
    names(skip: $skip, take: $take, sortOrder: DESC) {
      items { name tokenizedAt }
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

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const ownerRaw = (searchParams.get('owner') || '').trim();
    if (ownerRaw && !/^0x[a-fA-F0-9]{40}$/.test(ownerRaw)) {
      return NextResponse.json({ error: 'Invalid owner address' }, { status: 400 });
    }
    const ownerEvm = ownerRaw.toLowerCase();
    const limitParam = parseInt(searchParams.get('limit') || '0', 10);
    const limit = Number.isFinite(limitParam) && limitParam > 0 ? Math.min(limitParam, 1000) : 0;

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

    // Coordinated paging over listings and (optional) recent names in one loop
    let listed = 0, active = 0, totalUsd = 0;
    let tokenizedDomains = 0;

    let lSkip = 0, lTake = 100, lHasNext = true;
    let nSkip = 0, nTake = 100, nHasNext = !ownerEvm && !!sinceMs;

    while (lHasNext || nHasNext) {
      const [lData, nData] = await Promise.all([
        lHasNext
          ? gql<{ listings: { items: any[]; hasNextPage: boolean } }>(GET_LISTINGS_PAGE, { skip: lSkip, take: lTake })
          : Promise.resolve(null as any),
        nHasNext
          ? gql<{ names: { items: Array<{ tokenizedAt: string }>; hasNextPage: boolean } }>(GET_NAMES_PAGE, { skip: nSkip, take: nTake })
          : Promise.resolve(null as any),
      ]);

      // Listings page
      if (lData) {
        const items = lData.listings.items || [];
        let pageHasRecent = false;

        for (const l of items) {
          if (l.orderbook !== 'DOMA') continue;

          if (ownerEvm) {
            const lEvm = evmFromCAIP10(l.offererAddress);
            if (lEvm !== ownerEvm) continue;
          } else if (sinceMs) {
            const createdAtMs = new Date(l.createdAt).getTime();
            if (createdAtMs < sinceMs) continue;
            pageHasRecent = true;
          }

          listed++;
          const isActive = new Date(l.expiresAt).getTime() > Date.now();
          if (isActive) active++;

          const sym = l.currency?.symbol?.toUpperCase?.() || 'ETH';
          const dec = typeof l.currency?.decimals === 'number' ? l.currency.decimals : 18;
          let native = 0;
          try { native = Number(BigInt(l.price)) / 10 ** dec; } catch {}
          totalUsd += native * (usdRate[sym] || 0);

          if (!ownerEvm && limit > 0 && listed >= limit) break;
        }

        if (!ownerEvm && limit > 0 && listed >= limit) {
          lHasNext = false;
        } else {
          lHasNext = lData.listings.hasNextPage;
          lSkip += lTake;
          if (!ownerEvm && sinceMs && !pageHasRecent) lHasNext = false; // early stop on time window
        }
      }

      // Names page (only for last-1h path when no owner)
      if (nData) {
        const nItems = nData?.names?.items || [];
        let pageHasRecent = false;

        for (const it of nItems) {
          const t = it?.tokenizedAt ? new Date(it.tokenizedAt).getTime() : 0;
          if (t >= sinceMs) {
            tokenizedDomains++;
            pageHasRecent = true;
          } else {
            // sorted DESC; older reached
            nHasNext = false;
            break;
          }
        }

        if (nHasNext) {
          nHasNext = nData?.names?.hasNextPage ?? false;
          nSkip += nTake;
          if (!pageHasRecent) nHasNext = false;
        }
      }

      if (!lHasNext && !nHasNext) break;
    }

    // Owner tokenized count: single query
    // if (ownerEvm) {
    //   const ownedBy = [`eip155:97476:${ownerEvm}`];
    //   const byOwner = await gql<{ names: { totalCount: number } }>(GET_NAMES_COUNT_BY_OWNER, { ownedBy });
    //   tokenizedDomains = byOwner?.names?.totalCount ?? 0;
    // }

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
