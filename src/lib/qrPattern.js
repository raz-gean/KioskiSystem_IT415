function hashString(text) {
  let hash = 2166136261;
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function mulberry32(seed) {
  let a = seed;
  return function next() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const FINDER_SIZE = 7;

function isInFinderZone(row, col, size) {
  const zones = [
    [0, 0],
    [0, size - FINDER_SIZE],
    [size - FINDER_SIZE, 0],
  ];
  return zones.some(
    ([zr, zc]) => row >= zr && row < zr + FINDER_SIZE && col >= zc && col < zc + FINDER_SIZE
  );
}

function finderModule(row, col, zr, zc) {
  const r = row - zr;
  const c = col - zc;
  const onOuterRing = r === 0 || r === 6 || c === 0 || c === 6;
  const onInnerSquare = r >= 2 && r <= 4 && c >= 2 && c <= 4;
  return onOuterRing || onInnerSquare;
}

export function generateQrModules(text, size = 21) {
  const random = mulberry32(hashString(text));
  const grid = [];

  for (let row = 0; row < size; row++) {
    const rowCells = [];
    for (let col = 0; col < size; col++) {
      if (isInFinderZone(row, col, size)) {
        const zones = [
          [0, 0],
          [0, size - FINDER_SIZE],
          [size - FINDER_SIZE, 0],
        ];
        const [zr, zc] = zones.find(
          ([r, c]) => row >= r && row < r + FINDER_SIZE && col >= c && col < c + FINDER_SIZE
        );
        rowCells.push(finderModule(row, col, zr, zc));
      } else {
        rowCells.push(random() > 0.5);
      }
    }
    grid.push(rowCells);
  }

  return grid;
}
