import { useEffect, useRef, useState } from 'react';
import { formatCentavosAsPesos, sumCartCentavos } from '../lib/money';
import { generateTransactionId } from '../lib/transactionId';

export default function CardPaymentView({ state, dispatch }) {
  const totalCentavos = sumCartCentavos(state.cart);
  const [processing, setProcessing] = useState(false);
  const timer = useRef(null);

  useEffect(() => () => clearTimeout(timer.current), []);

  function processPayment() {
    if (timer.current !== null) return;
    setProcessing(true);
    timer.current = setTimeout(() => {
      dispatch({
        type: 'COMPLETE_SIMULATED_PAYMENT',
        transactionId: generateTransactionId(),
        timestamp: new Date().toISOString(),
      });
    }, 1000);
  }

  return (
    <div className="p-6">
      <h1 className="font-display text-2xl">Credit / Debit Card</h1>
      <p className="mt-2">Amount due: {formatCentavosAsPesos(totalCentavos)}</p>
      <p className="mt-4 text-sm text-ink/60">Please tap, insert, or swipe your card.</p>
      <button
        type="button"
        onClick={processPayment}
        disabled={processing}
        className="mt-6 rounded-lg bg-primary px-6 py-3 font-semibold text-white disabled:opacity-50"
      >
        Process Payment
      </button>
      {processing && <p role="status" className="mt-4 text-primary">Processing payment…</p>}
    </div>
  );
}
