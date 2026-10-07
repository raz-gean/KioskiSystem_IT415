import { formatCentavosAsPesos, sumCartCentavos } from '../lib/money';

export default function PaymentMethodScreen({ state, dispatch }) {
  const methods = [
    { key: 'cash', label: 'Cash', icon: '💵', tint: 'bg-success/10 text-success' },
    { key: 'qr', label: 'QR Payment', icon: '📱', tint: 'bg-primary/10 text-primary' },
    { key: 'card', label: 'Credit / Debit Card', icon: '💳', tint: 'bg-accent/20 text-ink' },
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
            className="flex flex-col items-center gap-3 rounded-xl border border-ink/10 bg-white p-6 text-center font-semibold shadow-sm transition active:scale-95 active:border-primary"
          >
            <span
              className={`flex h-12 w-12 items-center justify-center rounded-full text-2xl ${method.tint}`}
              aria-hidden="true"
            >
              {method.icon}
            </span>
            {method.label}
          </button>
        ))}
      </div>
      <button
        type="button"
        onClick={() => dispatch({ type: 'GO_TO_STEP', step: 'review' })}
        className="mt-6 rounded-lg border border-ink/20 px-6 py-3"
      >
        Back
      </button>
    </div>
  );
}
