export function formatShort(n: number, digits = 2): string {
  if (n === null || n === undefined || isNaN(n as any)) return '0.00';
  const neg = n < 0 ? '-' : '';
  const x = Math.abs(n);
  if (x >= 1_000_000_000_000_000) return `${neg}${(x / 1_000_000_000_000_000).toFixed(digits)}Q`;
  if (x >= 1_000_000_000_000) return `${neg}${(x / 1_000_000_000_000).toFixed(digits)}T`;
  if (x >= 1_000_000_000) return `${neg}${(x / 1_000_000_000).toFixed(digits)}B`;
  if (x >= 1_000_000) return `${neg}${(x / 1_000_000).toFixed(digits)}M`;
  if (x >= 1_000) return `${neg}${(x / 1_000).toFixed(digits)}K`;
  return `${neg}${x.toFixed(2)}`;
}
