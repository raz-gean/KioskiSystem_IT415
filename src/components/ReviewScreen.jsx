import { formatCentavosAsPesos } from '../lib/money';

export default function ReviewScreen({ state, dispatch }) {
  const totalCentavos = state.cart.reduce(
    (sum, line) => sum + line.unitPriceCentavos * line.quantity,
    0
  );

  return (
    <div className="p-6">
      <h1 className="font-display text-2xl">Review your order</h1>
      <table className="mt-6 w-full text-left">
        <thead>
          <tr className="border-b border-ink/10 text-sm text-ink/60">
            <th className="py-2">Product</th>
            <th>Quantity</th>
            <th>Unit price</th>
            <th>Subtotal</th>
          </tr>
        </thead>
        <tbody>
          {state.cart.map((line) => (
            <tr key={line.productId} className="border-b border-ink/5">
              <td className="py-2">{line.name}</td>
              <td>{line.quantity}</td>
              <td>{formatCentavosAsPesos(line.unitPriceCentavos)}</td>
              <td>{formatCentavosAsPesos(line.unitPriceCentavos * line.quantity)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-4 flex items-center justify-between font-semibold">
        <span>Total Amount</span>
        <span>{formatCentavosAsPesos(totalCentavos)}</span>
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
