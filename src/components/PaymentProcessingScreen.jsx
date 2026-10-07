import CashPaymentView from './CashPaymentView';
import QrPaymentView from './QrPaymentView';
import CardPaymentView from './CardPaymentView';

export default function PaymentProcessingScreen({ state, dispatch }) {
  return (
    <>
      {state.paymentMethod === 'cash' && <CashPaymentView state={state} dispatch={dispatch} />}
      {state.paymentMethod === 'qr' && <QrPaymentView state={state} dispatch={dispatch} />}
      {state.paymentMethod === 'card' && <CardPaymentView state={state} dispatch={dispatch} />}
      <button
        type="button"
        onClick={() => dispatch({ type: 'GO_TO_STEP', step: 'payment-method' })}
        className="mx-6 mb-6 rounded-lg border border-ink/20 px-6 py-3"
      >
        Back
      </button>
    </>
  );
}
