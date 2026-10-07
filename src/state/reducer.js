import { products } from '../data/products';
import { sumCartCentavos } from '../lib/money';
import { generateTransactionId } from '../lib/transactionId';

function findProduct(productId) {
  return products.find((product) => product.id === productId);
}

function addItem(cart, productId) {
  const existing = cart.find((line) => line.productId === productId);
  if (existing) {
    return cart.map((line) =>
      line.productId === productId ? { ...line, quantity: line.quantity + 1 } : line
    );
  }
  const product = findProduct(productId);
  return [
    ...cart,
    {
      productId: product.id,
      name: product.name,
      category: product.category,
      unitPriceCentavos: product.unitPriceCentavos,
      quantity: 1,
    },
  ];
}

function incrementItem(cart, productId) {
  return cart.map((line) =>
    line.productId === productId ? { ...line, quantity: line.quantity + 1 } : line
  );
}

function decrementItem(cart, productId) {
  return cart
    .map((line) =>
      line.productId === productId ? { ...line, quantity: line.quantity - 1 } : line
    )
    .filter((line) => line.quantity > 0);
}

function removeItem(cart, productId) {
  return cart.filter((line) => line.productId !== productId);
}

export function appReducer(state, action) {
  switch (action.type) {
    case 'ADD_ITEM':
      return { ...state, cart: addItem(state.cart, action.productId) };

    case 'INCREMENT_ITEM':
      return { ...state, cart: incrementItem(state.cart, action.productId) };

    case 'DECREMENT_ITEM':
      return { ...state, cart: decrementItem(state.cart, action.productId) };

    case 'REMOVE_ITEM':
      return { ...state, cart: removeItem(state.cart, action.productId) };

    case 'GO_TO_STEP':
      return { ...state, step: action.step };

    case 'SELECT_PAYMENT_METHOD':
      return { ...state, paymentMethod: action.method, cashError: null };

    case 'SET_CASH_AMOUNT':
      return { ...state, cashAmountPaidCentavos: action.amountCentavos, cashError: null };

    case 'SUBMIT_CASH_PAYMENT': {
      const totalCentavos = sumCartCentavos(state.cart);
      const amountPaidCentavos = state.cashAmountPaidCentavos;

      if (!Number.isFinite(amountPaidCentavos) || amountPaidCentavos < 0) {
        return { ...state, cashError: 'Please enter a valid payment amount.' };
      }

      if (amountPaidCentavos < totalCentavos) {
        const shortCentavos = totalCentavos - amountPaidCentavos;
        return {
          ...state,
          cashError: `Insufficient payment. Please enter at least ${formatShort(
            totalCentavos
          )}. You are short by ${formatShort(shortCentavos)}.`,
        };
      }

      return completeTransaction(state, {
        paymentMethod: 'cash',
        amountPaidCentavos,
        totalCentavos,
      });
    }

    case 'COMPLETE_SIMULATED_PAYMENT': {
      const totalCentavos = sumCartCentavos(state.cart);
      return completeTransaction(state, {
        paymentMethod: state.paymentMethod,
        amountPaidCentavos: totalCentavos,
        totalCentavos,
      });
    }

    case 'RESET_TRANSACTION':
      return {
        step: 'order',
        cart: [],
        paymentMethod: null,
        cashAmountPaidCentavos: null,
        cashError: null,
        transaction: null,
      };

    default:
      return state;
  }
}

function formatShort(centavos) {
  return `₱${(centavos / 100).toFixed(2)}`;
}

function completeTransaction(state, { paymentMethod, amountPaidCentavos, totalCentavos }) {
  const transaction = {
    id: generateTransactionId(),
    items: state.cart.map((line) => ({
      name: line.name,
      unitPriceCentavos: line.unitPriceCentavos,
      quantity: line.quantity,
      subtotalCentavos: line.unitPriceCentavos * line.quantity,
    })),
    totalCentavos,
    paymentMethod,
    amountPaidCentavos,
    changeCentavos: amountPaidCentavos - totalCentavos,
    timestamp: new Date().toISOString(),
  };

  return {
    ...state,
    transaction,
    cashError: null,
    step: 'success',
  };
}
