import { NextResponse } from 'next/server';

const CG_URL = 'https://api.coingecko.com/api/v3/simple/price';

export async function GET(req: Request) {
	try {
		const { searchParams } = new URL(req.url);
		const ids = searchParams.get('ids') || 'ethereum,usd-coin';
		const vs = searchParams.get('vs') || 'usd';

		const url = `${CG_URL}?ids=${encodeURIComponent(ids)}&vs_currencies=${encodeURIComponent(vs)}`;

		const key =
			process.env.COINGECKO_API_KEY ||
			process.env.NEXT_PUBLIC_COINGECKO_API_KEY ||
			process.env.CG_API_KEY;

		const headers: Record<string, string> = {};
		if (key) {
			headers['x-cg-pro-api-key'] = key;
			headers['x-cg-demo-api-key'] = key;
		}

		const r = await fetch(url, { headers, cache: 'no-store' });
		if (!r.ok) {
			const body = await r.text().catch(() => '');
			return NextResponse.json({ error: `Upstream ${r.status}: ${body}` }, { status: 502 });
		}
		const data = await r.json();
		return NextResponse.json(data, { headers: { 'Cache-Control': 's-maxage=60' } });
	} catch (e: any) {
		return NextResponse.json({ error: e?.message || 'Unknown error' }, { status: 500 });
	}
}
