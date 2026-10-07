import { describe, it, expect } from 'vitest';
import { pesosToCentavos, formatCentavosAsPesos, sumCartCentavos } from './money';

describe('pesosToCentavos', () => {
  it('converts whole pesos to centavos', () => {
    expect(pesosToCentavos(175)).toBe(17500);
  });

  it('converts fractional pesos to centavos without float drift', () => {
    expect(pesosToCentavos(45.5)).toBe(4550);
  });
});

describe('formatCentavosAsPesos', () => {
  it('formats whole centavos with two decimal places and peso sign', () => {
    expect(formatCentavosAsPesos(17500)).toBe('₱175.00');
  });

  it('formats zero as ₱0.00', () => {
    expect(formatCentavosAsPesos(0)).toBe('₱0.00');
  });

  it('pads single-digit centavos', () => {
    expect(formatCentavosAsPesos(4505)).toBe('₱45.05');
  });
});

describe('sumCartCentavos', () => {
  it('sums quantity times unit price across all lines', () => {
    const cart = [
      { unitPriceCentavos: 4500, quantity: 2 },
      { unitPriceCentavos: 5000, quantity: 1 },
      { unitPriceCentavos: 3500, quantity: 1 },
    ];
    expect(sumCartCentavos(cart)).toBe(17500);
  });

  it('returns 0 for an empty cart', () => {
    expect(sumCartCentavos([])).toBe(0);
  });
});
