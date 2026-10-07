import { useState } from 'react';
import { formatCentavosAsPesos, pesosToCentavos } from '../lib/money';
import { generateTransactionId } from '../lib/transactionId';

export default function CashPaymentView({ state, dispatch }) {
  const [input, setInput] = useState('');
  const totalCentavos = state.cart.reduce(
    (sum, line) => sum + line.unitPriceCentavos * line.quantity,
    0
  );

  function handleChange(event) {
    const value = event.target.value;
    setInput(value);
    const pesos = Number(value);
    dispatch({
      type: 'SET_CASH_AMOUNT',
      amountCentavos: Number.isFinite(pesos) ? pesosToCentavos(pesos) : NaN,
    });
  }

  const changeCentavos =
    state.cashAmountPaidCentavos != null && state.cashAmountPaidCentavos >= totalCentavos
      ? state.cashAmountPaidCentavos - totalCentavos
      : null;

  return (
    <div className="p-6">
      <h1 className="font-display text-2xl">Cash Payment</h1>
      <p className="mt-2">Total amount: {formatCentavosAsPesos(totalCentavos)}</p>

      <label className="mt-4 block" htmlFor="cash-amount-paid">
        Amount paid
        <input
          id="cash-amount-paid"
          type="number"
          value={input}
          onChange={handleChange}
          className="mt-1 block w-full rounded-lg border border-ink/20 p-3"
        />
      </label>

      {state.cashError && <p className="mt-2 text-error">{state.cashError}</p>}

      {changeCentavos != null && (
        <p className="mt-2 text-success">Change: {formatCentavosAsPesos(changeCentavos)}</p>
      )}

      <button
        type="button"
        onClick={() =>
          dispatch({
            type: 'SUBMIT_CASH_PAYMENT',
            transactionId: generateTransactionId(),
            timestamp: new Date().toISOString(),
          })
        }
        className="mt-6 w-full rounded-lg bg-primary py-3 font-semibold text-white"
      >
        Pay Now
      </button>
    </div>
  );
}
