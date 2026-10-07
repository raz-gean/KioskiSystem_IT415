import { useState } from 'react';
import { formatCentavosAsPesos, pesosToCentavos, sumCartCentavos } from '../lib/money';
import { generateTransactionId } from '../lib/transactionId';

export default function CashPaymentView({ state, dispatch }) {
  const [input, setInput] = useState('');
  const totalCentavos = sumCartCentavos(state.cart);

  function updateAmount(value) {
    setInput(value);
    const pesos = Number(value);
    dispatch({
      type: 'SET_CASH_AMOUNT',
      amountCentavos: value.trim() === '' ? null : Number.isFinite(pesos) ? pesosToCentavos(pesos) : NaN,
    });
  }

  function enterKey(key) {
    if (key === '.' && input.includes('.')) return;
    if (input.includes('.') && input.split('.')[1].length >= 2) return;
    updateAmount(key === '.' && input === '' ? '0.' : input + key);
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
          step="0.01"
          inputMode="decimal"
          onChange={(event) => updateAmount(event.target.value)}
          className="mt-1 block w-full rounded-lg border border-ink/20 p-3"
        />
      </label>

      <div className="mt-4 flex flex-wrap gap-2" aria-label="Quick payment amounts">
        <button type="button" onClick={() => updateAmount((totalCentavos / 100).toFixed(2))}
          className="min-h-12 rounded-lg bg-accent px-4 font-semibold">Exact</button>
        {[200, 500, 1000].map((amount) => (
          <button key={amount} type="button" onClick={() => updateAmount(String(amount))}
            className="min-h-12 rounded-lg border border-ink/20 bg-white px-4 font-semibold">
            {formatCentavosAsPesos(pesosToCentavos(amount))}
          </button>
        ))}
      </div>
      <div className="mt-4 grid max-w-sm grid-cols-3 gap-2" aria-label="Cash numeric keypad">
        {['7', '8', '9', '4', '5', '6', '1', '2', '3', '.', '0'].map((key) => (
          <button key={key} type="button" onClick={() => enterKey(key)}
            className="min-h-14 rounded-lg border border-ink/20 bg-white text-2xl font-semibold">
            {key}
          </button>
        ))}
        <button type="button" aria-label="Delete last digit" onClick={() => updateAmount(input.slice(0, -1))}
          className="min-h-14 rounded-lg bg-accent text-xl">⌫</button>
        <button type="button" onClick={() => updateAmount('')}
          className="col-span-3 min-h-12 rounded-lg border border-ink/20 font-semibold">Clear</button>
      </div>

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
