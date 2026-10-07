import { formatCentavosAsPesos } from '../lib/money';
import { generateTransactionId } from '../lib/transactionId';

export default function QrPaymentView({ state, dispatch }) {
  const totalCentavos = state.cart.reduce(
    (sum, line) => sum + line.unitPriceCentavos * line.quantity,
    0
  );

  return (
    <div className="p-6">
      <h1 className="font-display text-2xl">QR Payment</h1>
      <p className="mt-2">Amount to pay: {formatCentavosAsPesos(totalCentavos)}</p>
      <div className="mt-4 h-48 w-48 border border-dashed border-ink/30" aria-hidden="true" />
      <p className="mt-4 text-sm text-ink/60">
        Scan the QR code using your supported payment application, then confirm below.
      </p>
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
        Confirm Payment
      </button>
    </div>
  );
}
