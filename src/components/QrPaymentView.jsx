import { useMemo } from 'react';
import { formatCentavosAsPesos } from '../lib/money';
import { generateTransactionId } from '../lib/transactionId';
import QrCode from './QrCode';

export default function QrPaymentView({ state, dispatch }) {
  const totalCentavos = state.cart.reduce(
    (sum, line) => sum + line.unitPriceCentavos * line.quantity,
    0
  );

  const qrSeed = useMemo(
    () => `${totalCentavos}-${state.cart.map((line) => line.productId).join(',')}`,
    [totalCentavos, state.cart]
  );

  return (
    <div className="p-6">
      <h1 className="font-display text-2xl">QR Payment</h1>
      <p className="mt-2">Amount to pay: {formatCentavosAsPesos(totalCentavos)}</p>
      <QrCode value={qrSeed} />
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
