import { formatCentavosAsPesos } from '../lib/money';

export default function ReviewScreen({ state, dispatch }) {
  const totalCentavos = state.cart.reduce(
    (sum, line) => sum + line.unitPriceCentavos * line.quantity,
    0
  );

  return (
    <div className="mx-auto max-w-2xl p-6">
      <h1 className="font-display text-2xl">Review your order</h1>
      <div className="mt-6 overflow-hidden rounded-xl border border-ink/10 bg-white">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-ink/10 bg-bg/60 text-sm text-ink/60">
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Quantity</th>
              <th className="px-4 py-3">Unit price</th>
              <th className="px-4 py-3">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {state.cart.map((line) => (
              <tr key={line.productId} className="border-b border-ink/5 last:border-0">
                <td className="px-4 py-3">{line.name}</td>
                <td className="px-4 py-3">{line.quantity}</td>
                <td className="px-4 py-3">{formatCentavosAsPesos(line.unitPriceCentavos)}</td>
                <td className="px-4 py-3">
                  {formatCentavosAsPesos(line.unitPriceCentavos * line.quantity)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex items-center justify-between border-t border-ink/10 bg-bg/60 px-4 py-3 font-semibold">
          <span>Total Amount</span>
          <span className="font-display text-lg text-primary">
            {formatCentavosAsPesos(totalCentavos)}
          </span>
        </div>
      </div>

      <div className="mt-6 flex gap-4">
        <button
          type="button"
          onClick={() => dispatch({ type: 'GO_TO_STEP', step: 'order' })}
          className="rounded-lg border border-ink/20 px-6 py-3"
        >
          Back
        </button>
        <button
          type="button"
          onClick={() => dispatch({ type: 'GO_TO_STEP', step: 'payment-method' })}
          className="rounded-lg bg-primary px-6 py-3 font-semibold text-white"
        >
          Continue to Payment
        </button>
      </div>
    </div>
  );
}
