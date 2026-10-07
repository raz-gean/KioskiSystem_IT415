import { formatCentavosAsPesos } from '../lib/money';
import { generateTransactionId } from '../lib/transactionId';

export default function CardPaymentView({ state, dispatch }) {
  const totalCentavos = state.cart.reduce(
    (sum, line) => sum + line.unitPriceCentavos * line.quantity,
    0
  );

  return (
    <div className="p-6">
      <h1 className="font-display text-2xl">Credit / Debit Card</h1>
      <p className="mt-2">Amount due: {formatCentavosAsPesos(totalCentavos)}</p>
      <p className="mt-4 text-sm text-ink/60">Please tap, insert, or swipe your card.</p>
      <button
        type="button"
        onClick={() =>
          dispatch({
            type: 'COMPLETE_SIMULATED_PAYMENT',
            transactionId: generateTransactionId(),
            timestamp: new Date().toISOString(),
          })
        }
        className="mt-6 rounded-lg bg-primary px-6 py-3 font-semibold text-white"
      >
        Process Payment
      </button>
    </div>
  );
}
