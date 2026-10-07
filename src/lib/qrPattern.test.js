import { describe, it, expect } from 'vitest';
import { generateQrModules } from './qrPattern';

describe('generateQrModules', () => {
  it('returns a square grid of booleans', () => {
    const grid = generateQrModules('TXN-20261007-104230', 21);
    expect(grid).toHaveLength(21);
    grid.forEach((row) => expect(row).toHaveLength(21));
    grid.forEach((row) => row.forEach((cell) => expect(typeof cell).toBe('boolean')));
  });

  it('is deterministic for the same input', () => {
    const a = generateQrModules('TXN-20261007-104230', 21);
    const b = generateQrModules('TXN-20261007-104230', 21);
    expect(a).toEqual(b);
  });

  it('produces a different pattern for a different reference', () => {
    const a = generateQrModules('TXN-20261007-104230', 21);
    const b = generateQrModules('TXN-20261007-104231', 21);
    expect(a).not.toEqual(b);
  });

  it('always marks the three finder-pattern corners as fully dark', () => {
    const grid = generateQrModules('TXN-20261007-104230', 21);
    // top-left 7x7, top-right 7x7, bottom-left 7x7 finder squares' outer ring
    expect(grid[0][0]).toBe(true);
    expect(grid[0][20]).toBe(true);
    expect(grid[20][0]).toBe(true);
  });
});
