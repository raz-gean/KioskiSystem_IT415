import { useReducer } from 'react';
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

  return (
    <div className="min-h-screen bg-bg text-ink">
      <StepTracker currentStep={state.step} />
      {state.step === 'order' && <OrderScreen state={state} dispatch={dispatch} />}
      {state.step === 'review' && <ReviewScreen state={state} dispatch={dispatch} />}
      {state.step === 'payment-method' && <PaymentMethodScreen dispatch={dispatch} />}
      {state.step === 'payment-processing' && (
        <PaymentProcessingScreen state={state} dispatch={dispatch} />
      )}
      {state.step === 'success' && <SuccessScreen state={state} dispatch={dispatch} />}
      {state.step === 'receipt' && <ReceiptScreen state={state} dispatch={dispatch} />}
    </div>
  );
}
