import { describe, expect, it } from 'vitest';
import { getPaymentMethodLabel } from './paymentMethodLabel';

describe('getPaymentMethodLabel', () => {
  it.each([
    ['cash', 'Cash'],
    ['qr', 'QR Payment'],
    ['card', 'Credit / Debit Card'],
  ])('labels %s as %s', (method, label) => {
    expect(getPaymentMethodLabel(method)).toBe(label);
  });
});
