import { formatNumber, parseNumber } from '../src/utils';

describe('formatNumber', () => {
  test('formats plain digits with commas', () => {
    expect(formatNumber('1000')).toBe('1,000');
  });

  test('formats large numbers', () => {
    expect(formatNumber('1000000')).toBe('1,000,000');
  });

  test('strips non-digit characters before formatting', () => {
    expect(formatNumber('1,234')).toBe('1,234');
  });

  test('returns empty string for empty input', () => {
    expect(formatNumber('')).toBe('');
  });

  test('returns empty string for non-numeric input', () => {
    expect(formatNumber('abc')).toBe('');
  });

  test('handles single digit', () => {
    expect(formatNumber('5')).toBe('5');
  });

  test('handles three digits (no comma needed)', () => {
    expect(formatNumber('999')).toBe('999');
  });

  test('strips letters mixed with digits', () => {
    expect(formatNumber('1a2b3c')).toBe('123');
  });

  test('preserves negative sign', () => {
    expect(formatNumber('-1940')).toBe('-1,940');
  });

  test('formats negative large number', () => {
    expect(formatNumber('-2190000')).toBe('-2,190,000');
  });
});

describe('parseNumber', () => {
  test('parses formatted number', () => {
    expect(parseNumber('1,000')).toBe(1000);
  });

  test('parses large formatted number', () => {
    expect(parseNumber('1,000,000')).toBe(1000000);
  });

  test('parses plain number string', () => {
    expect(parseNumber('500')).toBe(500);
  });

  test('returns 0 for empty string', () => {
    expect(parseNumber('')).toBe(0);
  });

  test('returns 0 for non-numeric string', () => {
    expect(parseNumber('abc')).toBe(0);
  });

  test('handles zero', () => {
    expect(parseNumber('0')).toBe(0);
  });

  test('parses negative formatted number', () => {
    expect(parseNumber('-1,940')).toBe(-1940);
  });
});
