export function pesosToCentavos(pesos) {
  return Math.round(pesos * 100);
}

export function formatCentavosAsPesos(centavos) {
  const pesos = centavos / 100;
  return `₱${pesos.toFixed(2)}`;
}

export function sumCartCentavos(cart) {
  return cart.reduce(
    (total, line) => total + line.unitPriceCentavos * line.quantity,
    0
  );
}
