import { describe, it, expect } from 'vitest';
import { generateTransactionId } from './transactionId';

describe('generateTransactionId', () => {
  it('formats as TXN-YYYYMMDD-HHMMSS from a given date', () => {
    const fixedDate = new Date(2026, 9, 7, 10, 42, 30); // months are 0-indexed: 9 = October
    expect(generateTransactionId(fixedDate)).toBe('TXN-20261007-104230');
  });

  it('zero-pads single-digit month, day, hour, minute, second', () => {
    const fixedDate = new Date(2026, 0, 5, 3, 4, 5); // Jan 5, 03:04:05
    expect(generateTransactionId(fixedDate)).toBe('TXN-20260105-030405');
  });

  it('produces different ids for two different timestamps', () => {
    const a = generateTransactionId(new Date(2026, 9, 7, 10, 42, 30));
    const b = generateTransactionId(new Date(2026, 9, 7, 10, 42, 31));
    expect(a).not.toBe(b);
  });
});
