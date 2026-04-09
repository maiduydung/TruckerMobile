export function formatNumber(value: string): string {
  const negative = value.includes('-');
  const num = value.replace(/\D/g, '');
  if (!num) return '';
  return (negative ? '-' : '') + Number(num).toLocaleString('en-US');
}

export function parseNumber(formatted: string): number {
  return Number(formatted.replace(/,/g, '')) || 0;
}
