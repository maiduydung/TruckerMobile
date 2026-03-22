export function formatNumber(value: string): string {
  const num = value.replace(/\D/g, '');
  if (!num) return '';
  return Number(num).toLocaleString('en-US');
}

export function parseNumber(formatted: string): number {
  return Number(formatted.replace(/,/g, '')) || 0;
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}
