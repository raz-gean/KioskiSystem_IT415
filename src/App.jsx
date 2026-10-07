import { useEffect, useReducer, useState } from 'react';
import { appReducer } from './state/reducer';
import { initialState } from './state/initialState';
import StepTracker from './components/StepTracker';
import OrderScreen from './components/OrderScreen';
import ReviewScreen from './components/ReviewScreen';
import PaymentMethodScreen from './components/PaymentMethodScreen';
import PaymentProcessingScreen from './components/PaymentProcessingScreen';
import SuccessScreen from './components/SuccessScreen';
import ReceiptScreen from './components/ReceiptScreen';

export default function App() {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const [showResetMessage, setShowResetMessage] = useState(false);

  useEffect(() => {
    if (!showResetMessage) return undefined;

    const timeoutId = window.setTimeout(() => setShowResetMessage(false), 2500);
    return () => window.clearTimeout(timeoutId);
  }, [showResetMessage]);

  function handleDispatch(action) {
    dispatch(action);
    if (action.type === 'RESET_TRANSACTION') setShowResetMessage(true);
  }

  return (
    <div className="min-h-screen bg-bg text-ink">
      <StepTracker currentStep={state.step} />
      {showResetMessage && (
        <p role="status" className="mx-auto mt-4 max-w-2xl rounded-lg bg-success/10 px-4 py-3 text-center text-success">
          New transaction started — previous order cleared
        </p>
      )}
      {state.step === 'order' && <OrderScreen state={state} dispatch={dispatch} />}
      {state.step === 'review' && <ReviewScreen state={state} dispatch={dispatch} />}
      {state.step === 'payment-method' && <PaymentMethodScreen state={state} dispatch={dispatch} />}
      {state.step === 'payment-processing' && (
        <PaymentProcessingScreen state={state} dispatch={dispatch} />
      )}
      {state.step === 'success' && <SuccessScreen state={state} dispatch={dispatch} />}
      {state.step === 'receipt' && <ReceiptScreen state={state} dispatch={handleDispatch} />}
    </div>
  );
}
