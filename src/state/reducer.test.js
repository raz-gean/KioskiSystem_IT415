import { describe, it, expect } from 'vitest';
import { appReducer } from './reducer';
import { initialState } from './initialState';
import { generateTransactionId } from '../lib/transactionId';

function cartLine(state, productId) {
  return state.cart.find((line) => line.productId === productId);
}

describe('ADD_ITEM', () => {
  it('adds a new product to the cart at quantity 1', () => {
    const state = appReducer(initialState, { type: 'ADD_ITEM', productId: 'coffee' });
    expect(cartLine(state, 'coffee')).toMatchObject({ productId: 'coffee', quantity: 1 });
  });

  it('increments quantity when the product is already in the cart', () => {
    let state = appReducer(initialState, { type: 'ADD_ITEM', productId: 'coffee' });
    state = appReducer(state, { type: 'ADD_ITEM', productId: 'coffee' });
    expect(cartLine(state, 'coffee').quantity).toBe(2);
  });
});

describe('INCREMENT_ITEM / DECREMENT_ITEM', () => {
  it('increments an existing line quantity', () => {
    let state = appReducer(initialState, { type: 'ADD_ITEM', productId: 'coffee' });
    state = appReducer(state, { type: 'INCREMENT_ITEM', productId: 'coffee' });
    expect(cartLine(state, 'coffee').quantity).toBe(2);
  });

  it('decrements an existing line quantity', () => {
    let state = appReducer(initialState, { type: 'ADD_ITEM', productId: 'coffee' });
    state = appReducer(state, { type: 'INCREMENT_ITEM', productId: 'coffee' });
    state = appReducer(state, { type: 'DECREMENT_ITEM', productId: 'coffee' });
    expect(cartLine(state, 'coffee').quantity).toBe(1);
  });

  it('removes the line entirely when decrementing from quantity 1', () => {
    let state = appReducer(initialState, { type: 'ADD_ITEM', productId: 'coffee' });
    state = appReducer(state, { type: 'DECREMENT_ITEM', productId: 'coffee' });
    expect(cartLine(state, 'coffee')).toBeUndefined();
  });

  it('never produces a negative quantity', () => {
    const state = appReducer(initialState, { type: 'DECREMENT_ITEM', productId: 'coffee' });
    expect(cartLine(state, 'coffee')).toBeUndefined();
    expect(state.cart.every((line) => line.quantity >= 0)).toBe(true);
  });
});

describe('REMOVE_ITEM', () => {
  it('removes the line regardless of quantity', () => {
    let state = appReducer(initialState, { type: 'ADD_ITEM', productId: 'coffee' });
    state = appReducer(state, { type: 'INCREMENT_ITEM', productId: 'coffee' });
    state = appReducer(state, { type: 'REMOVE_ITEM', productId: 'coffee' });
    expect(cartLine(state, 'coffee')).toBeUndefined();
  });
});

describe('GO_TO_STEP', () => {
  it('updates the current step', () => {
    const state = appReducer(initialState, { type: 'GO_TO_STEP', step: 'review' });
    expect(state.step).toBe('review');
  });

  it('preserves cart contents when navigating steps', () => {
    let state = appReducer(initialState, { type: 'ADD_ITEM', productId: 'coffee' });
    state = appReducer(state, { type: 'GO_TO_STEP', step: 'review' });
    state = appReducer(state, { type: 'GO_TO_STEP', step: 'order' });
    expect(cartLine(state, 'coffee').quantity).toBe(1);
  });
});

describe('SELECT_PAYMENT_METHOD', () => {
  it.each(['cash', 'qr', 'card'])('clears stale cash amount and error when selecting %s', (method) => {
    let state = appReducer(initialState, { type: 'ADD_ITEM', productId: 'coffee' });
    state = { ...state, paymentMethod: 'cash', cashAmountPaidCentavos: 20000, cashError: 'Old error' };
    const result = appReducer(state, { type: 'SELECT_PAYMENT_METHOD', method });
    expect(result.cashAmountPaidCentavos).toBeNull();
    expect(result.cashError).toBeNull();
    expect(result.paymentMethod).toBe(method);
    expect(result.cart).toEqual(state.cart);
  });
});

describe('SUBMIT_CASH_PAYMENT', () => {
  function stateWithCoffeeAndMethod() {
    let state = appReducer(initialState, { type: 'ADD_ITEM', productId: 'coffee' }); // 4500
    state = appReducer(state, { type: 'SELECT_PAYMENT_METHOD', method: 'cash' });
    return state;
  }

  it('rejects an amount below the total and sets a clear cashError', () => {
    let state = stateWithCoffeeAndMethod();
    state = appReducer(state, { type: 'SET_CASH_AMOUNT', amountCentavos: 1000 });
    state = appReducer(state, { type: 'SUBMIT_CASH_PAYMENT' });
    expect(state.transaction).toBeNull();
    expect(state.cashError).toMatch(/insufficient/i);
    expect(state.step).not.toBe('success');
  });

  it('accepts an exact payment with ₱0.00 change', () => {
    let state = stateWithCoffeeAndMethod();
    state = appReducer(state, { type: 'SET_CASH_AMOUNT', amountCentavos: 4500 });
    state = appReducer(state, {
      type: 'SUBMIT_CASH_PAYMENT',
      transactionId: 'TXN-TEST-1',
      timestamp: '2026-10-07T00:00:00.000Z',
    });
    expect(state.transaction).not.toBeNull();
    expect(state.transaction.changeCentavos).toBe(0);
    expect(state.step).toBe('success');
  });

  it('accepts a payment above the total and computes correct change', () => {
    let state = stateWithCoffeeAndMethod();
    state = appReducer(state, { type: 'SET_CASH_AMOUNT', amountCentavos: 20000 });
    state = appReducer(state, {
      type: 'SUBMIT_CASH_PAYMENT',
      transactionId: 'TXN-TEST-2',
      timestamp: '2026-10-07T00:00:00.000Z',
    });
    expect(state.transaction.changeCentavos).toBe(15500);
  });

  it('rejects a negative amount', () => {
    let state = stateWithCoffeeAndMethod();
    state = appReducer(state, { type: 'SET_CASH_AMOUNT', amountCentavos: -100 });
    state = appReducer(state, { type: 'SUBMIT_CASH_PAYMENT' });
    expect(state.transaction).toBeNull();
    expect(state.cashError).toBeTruthy();
  });
});

describe('COMPLETE_SIMULATED_PAYMENT', () => {
  it('sets amountPaid equal to total and change to 0 for QR', () => {
    let state = appReducer(initialState, { type: 'ADD_ITEM', productId: 'pancit-canton' }); // 7500
    state = appReducer(state, { type: 'SELECT_PAYMENT_METHOD', method: 'qr' });
    state = appReducer(state, {
      type: 'COMPLETE_SIMULATED_PAYMENT',
      transactionId: 'TXN-TEST-3',
      timestamp: '2026-10-07T00:00:00.000Z',
    });
    expect(state.transaction.amountPaidCentavos).toBe(7500);
    expect(state.transaction.changeCentavos).toBe(0);
    expect(state.transaction.paymentMethod).toBe('qr');
  });

  it('sets amountPaid equal to total and change to 0 for card', () => {
    let state = appReducer(initialState, { type: 'ADD_ITEM', productId: 'pancit-canton' });
    state = appReducer(state, { type: 'SELECT_PAYMENT_METHOD', method: 'card' });
    state = appReducer(state, {
      type: 'COMPLETE_SIMULATED_PAYMENT',
      transactionId: 'TXN-TEST-4',
      timestamp: '2026-10-07T00:00:00.000Z',
    });
    expect(state.transaction.changeCentavos).toBe(0);
    expect(state.transaction.paymentMethod).toBe('card');
  });
});

describe('RESET_TRANSACTION', () => {
  it('clears cart, payment method, cash amount, and transaction back to initial state', () => {
    let state = appReducer(initialState, { type: 'ADD_ITEM', productId: 'coffee' });
    state = appReducer(state, { type: 'SELECT_PAYMENT_METHOD', method: 'qr' });
    state = appReducer(state, {
      type: 'COMPLETE_SIMULATED_PAYMENT',
      transactionId: 'TXN-TEST-5',
      timestamp: '2026-10-07T00:00:00.000Z',
    });
    state = appReducer(state, { type: 'RESET_TRANSACTION' });
    expect(state).toEqual(initialState);
  });
});

describe('reducer purity under double-invocation (React StrictMode)', () => {
  it('produces the same transaction id when the same action is applied twice to the same state', () => {
    let state = appReducer(initialState, { type: 'ADD_ITEM', productId: 'coffee' });
    state = appReducer(state, { type: 'SELECT_PAYMENT_METHOD', method: 'qr' });

    const action = {
      type: 'COMPLETE_SIMULATED_PAYMENT',
      transactionId: 'TXN-TEST-6',
      timestamp: '2026-10-07T00:00:00.000Z',
    };
    const resultA = appReducer(state, action);
    const resultB = appReducer(state, action);

    expect(resultB.transaction.id).toBe(resultA.transaction.id);
  });
});

describe('two sequential transactions', () => {
  it('produce distinct transaction ids', () => {
    let stateA = appReducer(initialState, { type: 'ADD_ITEM', productId: 'coffee' });
    stateA = appReducer(stateA, { type: 'SELECT_PAYMENT_METHOD', method: 'qr' });
    stateA = appReducer(stateA, {
      type: 'COMPLETE_SIMULATED_PAYMENT',
      transactionId: generateTransactionId(),
      timestamp: new Date().toISOString(),
    });

    let stateB = appReducer(initialState, { type: 'ADD_ITEM', productId: 'pancit-canton' });
    stateB = appReducer(stateB, { type: 'SELECT_PAYMENT_METHOD', method: 'card' });
    stateB = appReducer(stateB, {
      type: 'COMPLETE_SIMULATED_PAYMENT',
      transactionId: generateTransactionId(),
      timestamp: new Date().toISOString(),
    });

    expect(stateA.transaction.id).not.toBe(stateB.transaction.id);
  });
});
