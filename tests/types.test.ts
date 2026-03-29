import { DRIVERS, PICKUP_LOCATIONS, DELIVERY_LOCATIONS, FIXED_COSTS } from '../src/types';

describe('DRIVERS', () => {
  test('has exactly 3 drivers', () => {
    expect(DRIVERS).toHaveLength(3);
  });

  test('all drivers are non-empty strings', () => {
    DRIVERS.forEach(d => {
      expect(typeof d).toBe('string');
      expect(d.length).toBeGreaterThan(0);
    });
  });

  test('no duplicate drivers', () => {
    expect(new Set(DRIVERS).size).toBe(DRIVERS.length);
  });
});

describe('PICKUP_LOCATIONS', () => {
  test('is not empty', () => {
    expect(PICKUP_LOCATIONS.length).toBeGreaterThan(0);
  });

  test('no duplicates', () => {
    expect(new Set(PICKUP_LOCATIONS).size).toBe(PICKUP_LOCATIONS.length);
  });
});

describe('DELIVERY_LOCATIONS', () => {
  test('is not empty', () => {
    expect(DELIVERY_LOCATIONS.length).toBeGreaterThan(0);
  });

  test('no duplicates', () => {
    expect(new Set(DELIVERY_LOCATIONS).size).toBe(DELIVERY_LOCATIONS.length);
  });
});

describe('FIXED_COSTS', () => {
  test('has 9 cost categories', () => {
    expect(FIXED_COSTS).toHaveLength(9);
  });

  test('each cost has key and label', () => {
    FIXED_COSTS.forEach(c => {
      expect(c).toHaveProperty('key');
      expect(c).toHaveProperty('label');
      expect(typeof c.key).toBe('string');
      expect(typeof c.label).toBe('string');
    });
  });

  test('no duplicate keys', () => {
    const keys = FIXED_COSTS.map(c => c.key);
    expect(new Set(keys).size).toBe(keys.length);
  });

  test('all keys start with cost prefix', () => {
    FIXED_COSTS.forEach(c => {
      expect(c.key).toMatch(/^cost/);
    });
  });
});
