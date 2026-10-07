import { formatCentavosAsPesos, sumCartCentavos } from '../lib/money';

export default function PaymentMethodScreen({ state, dispatch }) {
  const methods = [
    { key: 'cash', label: 'Cash' },
    { key: 'qr', label: 'QR Payment' },
    { key: 'card', label: 'Credit / Debit Card' },
  ];

  function choose(method) {
    dispatch({ type: 'SELECT_PAYMENT_METHOD', method });
    dispatch({ type: 'GO_TO_STEP', step: 'payment-processing' });
  }

  return (
    <div className="p-6">
      <h1 className="font-display text-2xl">How would you like to pay?</h1>
      <p className="mt-4 font-display text-3xl text-primary">
        Amount due: {formatCentavosAsPesos(sumCartCentavos(state.cart))}
      </p>
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {methods.map((method) => (
          <button
            key={method.key}
            type="button"
            onClick={() => choose(method.key)}
            className="rounded-xl border border-ink/10 bg-white p-6 text-center font-semibold shadow-sm"
          >
            {method.label}
          </button>
        ))}
      </div>
    </div>
  );
}
