'use client';

import { useEffect, useState, useCallback } from 'react';

type PriceMap = Record<string, number>; // symbol -> USD rate

export function useTokenPrices() {
  const [prices, setPrices] = useState<PriceMap>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPrices = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(
        'https://api.coingecko.com/api/v3/simple/price?ids=ethereum,usd-coin&vs_currencies=usd',
        { cache: 'no-store' }
      );
      if (!res.ok) throw new Error(`Price fetch failed: ${res.status}`);
      const data = await res.json();
      const next: PriceMap = {
        ETH: data?.ethereum?.usd ?? 0,
        USDC: data?.['usd-coin']?.usd ?? 1,
        USD: 1,
      };
      setPrices(next);
    } catch (e: any) {
      setError(e?.message || 'Failed to fetch prices');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPrices();
    const id = setInterval(fetchPrices, 60_000);
    return () => clearInterval(id);
  }, [fetchPrices]);

  const getUsdRate = (symbol?: string) => {
    if (!symbol) return 0;
    return prices[symbol.toUpperCase()] ?? 0;
  };

  return { getUsdRate, prices, loading, error, refresh: fetchPrices };
}