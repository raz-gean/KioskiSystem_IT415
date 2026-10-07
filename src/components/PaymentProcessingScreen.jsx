import CashPaymentView from './CashPaymentView';
import QrPaymentView from './QrPaymentView';
import CardPaymentView from './CardPaymentView';

export default function PaymentProcessingScreen({ state, dispatch }) {
  if (state.paymentMethod === 'cash') return <CashPaymentView state={state} dispatch={dispatch} />;
  if (state.paymentMethod === 'qr') return <QrPaymentView state={state} dispatch={dispatch} />;
  if (state.paymentMethod === 'card') return <CardPaymentView state={state} dispatch={dispatch} />;
  return null;
}
