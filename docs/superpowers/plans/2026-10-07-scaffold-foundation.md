# Kiosk App Scaffold & Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stand up a working React + Vite + Tailwind app with the full
required transaction flow wired end-to-end on hardcoded data, so the three
group members can each branch off this foundation for their own feature
(Order/Cart, Review/Payment, Success/Receipt) without colliding on shared
scaffolding, config, or state-shape decisions.

**Architecture:** Single-page app, no router — a top-level `App` component
holds one state object (cart, current step, payment info, completed
transaction) via `useReducer`, and renders one screen component per step. All
screens share the same state and a shared formatting/money utility. Styling
via Tailwind utility classes using the approved warm palette, wired as custom
theme colors rather than inline hex so every screen references the same
tokens.

**Tech Stack:** React 18, Vite, Tailwind CSS v3, Vitest + React Testing
Library for logic/component tests, no backend, no router, no external state
library.

**Spec:** `docs/superpowers/specs/2026-10-07-kiosk-pos-design.md`

## Global Constraints

- No router — flow is driven entirely by `state.step`, one of: `'order'`,
  `'review'`, `'payment-method'`, `'payment-processing'`, `'success'`,
  `'receipt'`.
- No backend, no database, no localStorage/sessionStorage persistence.
- Product catalog is exactly the 6 items from the spec, with these exact
  names/categories/prices (in PHP pesos, stored as numbers, not strings):
  Coffee (Drinks, 45), Soft Drink (Drinks, 35), Bottled Water (Drinks, 20),
  Sandwich (Food, 50), Cookies (Snacks, 25), Chocolate (Snacks, 25).
- Transaction IDs are timestamp-based: `TXN-YYYYMMDD-HHMMSS` (local time,
  zero-padded), generated at the moment payment succeeds.
- Money values are always computed from integer centavos internally and
  formatted for display as `₱X.XX` — never compare/sum floating point peso
  values directly, to avoid rounding bugs in totals/change.
- Color tokens (from the spec) must be defined once in `tailwind.config.js`
  as named theme colors (`bg`, `ink`, `primary`, `accent`, `success`,
  `error`) and referenced by name in components — no raw hex in component
  files.
- Quantity can never go negative; decrementing from 1 removes the cart line
  entirely.
- This plan builds the full flow on hardcoded data as a working vertical
  slice — it is intentionally the "setup" + "core functionality" stages for
  the project's commit history, not a placeholder shell. Each of the three
  feature branches will later refine/restyle their own screen(s), but the
  app must fully run this 7-step flow after this plan lands on `main`.
- Category filter tabs (All/Drinks/Food/Snacks) from the design spec are
  **out of scope for this plan** — the Order screen built here lists all 6
  products unfiltered. Adding the filter tabs is left to the
  `feature/order-cart` branch, since it's owned entirely within one file
  (`OrderScreen.jsx`) and doesn't block the other two members' branches.

## Review Focus

- **Insufficient cash payment**: entering less than the total must block
  "Pay Now" with an inline message and never create a transaction — a test
  must simulate entering a too-low amount and assert no transaction is
  created and the error text is visible.
- **Exact cash payment**: paying exactly the total must succeed with ₱0.00
  change (not treated as "insufficient" by an off-by-one comparison) — a
  test must cover the boundary value, not just clearly-insufficient and
  clearly-sufficient cases.
- **Empty cart edge case**: "Proceed to Payment" must be disabled/blocked
  when the cart has zero items, so a user can't reach Review or Payment with
  nothing to pay for.
- **Back-navigation state preservation**: going from Review back to Order
  must preserve exact cart contents (same items/quantities), not reset or
  duplicate them — a test must add items, navigate to review, go back, and
  assert the cart is unchanged.
- **New Transaction full reset**: after completing a transaction and
  starting a new one, no trace of the previous cart, payment method, amount
  paid, or transaction record may remain in state — a test must complete one
  full transaction, trigger New Transaction, and assert every relevant state
  field is back to its initial empty value.

---

## File Structure

```
package.json
vite.config.js
tailwind.config.js
postcss.config.js
index.html
src/
  main.jsx
  App.jsx                      # top-level state + step router
  state/
    initialState.js            # initial state shape + constants
    reducer.js                 # appReducer(state, action)
    reducer.test.js
  data/
    products.js                 # hardcoded catalog
  lib/
    money.js                    # centavo-safe money math + peso formatting
    money.test.js
    transactionId.js            # TXN-YYYYMMDD-HHMMSS generator
    transactionId.test.js
  components/
    StepTracker.jsx              # header tabs (Order/Review/Payment/Receipt)
    OrderScreen.jsx               # product grid + cart panel (placeholder-complete)
    ReviewScreen.jsx              # order summary table
    PaymentMethodScreen.jsx       # Cash/QR/Card picker
    PaymentProcessingScreen.jsx   # routes to Cash/QR/Card sub-views
    CashPaymentView.jsx
    QrPaymentView.jsx
    CardPaymentView.jsx
    SuccessScreen.jsx
    ReceiptScreen.jsx
  App.test.jsx                   # end-to-end flow test (happy path)
```

Rationale: `state/reducer.js` is the single source of truth every screen
reads/dispatches into, so it's isolated and tested on its own before any UI
exists. `lib/money.js` and `lib/transactionId.js` are pure functions, tested
in isolation, and reused across screens (Review, Payment, Receipt all need
money formatting; Success/Receipt need the transaction ID). Each screen
component owns exactly one step of the flow, matching the spec's screen
boundaries — this is also exactly how the three feature branches will later
carve up ownership (Order+Cart = one file; Review+Payment+Processing = four
files; Success+Receipt = two files), so nobody edits another member's file
to finish this plan.

## Interfaces (shared contract every task relies on)

**State shape** (`src/state/initialState.js`):
```js
export const initialState = {
  step: 'order', // 'order' | 'review' | 'payment-method' | 'payment-processing' | 'success' | 'receipt'
  cart: [], // { productId: string, name: string, category: string, unitPriceCentavos: number, quantity: number }[]
  paymentMethod: null, // 'cash' | 'qr' | 'card' | null
  cashAmountPaidCentavos: null, // number | null
  cashError: null, // string | null
  transaction: null, // see shape below, or null
};

// transaction shape, set only on payment success:
// {
//   id: string,                 // "TXN-20261007-104230"
//   items: Array<{ name, unitPriceCentavos, quantity, subtotalCentavos }>,
//   totalCentavos: number,
//   paymentMethod: 'cash' | 'qr' | 'card',
//   amountPaidCentavos: number,
//   changeCentavos: number,
//   timestamp: string, // ISO string
// }
```

**Reducer** (`src/state/reducer.js`):
```js
export function appReducer(state, action) { /* returns new state */ }
// Action types:
// { type: 'ADD_ITEM', productId }
// { type: 'INCREMENT_ITEM', productId }
// { type: 'DECREMENT_ITEM', productId }   // qty 1 -> removes line
// { type: 'REMOVE_ITEM', productId }
// { type: 'GO_TO_STEP', step }
// { type: 'SELECT_PAYMENT_METHOD', method }   // 'cash' | 'qr' | 'card'
// { type: 'SET_CASH_AMOUNT', amountCentavos }
// { type: 'SUBMIT_CASH_PAYMENT' }              // validates, may set cashError or complete
// { type: 'COMPLETE_SIMULATED_PAYMENT' }       // for qr/card: amountPaid=total, change=0
// { type: 'RESET_TRANSACTION' }                // New Transaction
```

**Money utils** (`src/lib/money.js`):
```js
export function pesosToCentavos(pesos: number): number
export function formatCentavosAsPesos(centavos: number): string // "₱175.00"
export function sumCartCentavos(cart: CartLine[]): number
```

**Transaction ID** (`src/lib/transactionId.js`):
```js
export function generateTransactionId(date = new Date()): string // "TXN-20261007-104230"
```

**Products** (`src/data/products.js`):
```js
export const products = [
  { id: 'coffee', name: 'Coffee', category: 'Drinks', unitPriceCentavos: 4500 },
  { id: 'soft-drink', name: 'Soft Drink', category: 'Drinks', unitPriceCentavos: 3500 },
  { id: 'bottled-water', name: 'Bottled Water', category: 'Drinks', unitPriceCentavos: 2000 },
  { id: 'sandwich', name: 'Sandwich', category: 'Food', unitPriceCentavos: 5000 },
  { id: 'cookies', name: 'Cookies', category: 'Snacks', unitPriceCentavos: 2500 },
  { id: 'chocolate', name: 'Chocolate', category: 'Snacks', unitPriceCentavos: 2500 },
];
```

---

## Task 1: Project scaffold (Vite + React + Tailwind + test runner)

**Files:**
- Create: `package.json`, `vite.config.js`, `tailwind.config.js`,
  `postcss.config.js`, `index.html`, `src/main.jsx`, `src/index.css`
- Create: `src/App.jsx` (temporary placeholder, replaced in Task 3)

**Interfaces:**
- Produces: a working `npm run dev` and `npm run test` command; Tailwind
  theme colors named `bg`, `ink`, `primary`, `accent`, `success`, `error`
  available as `bg-bg`, `text-ink`, `bg-primary`, etc.

- [ ] **Step 1: Scaffold Vite React app**

Run:
```bash
npm create vite@latest . -- --template react
```
When prompted about the non-empty directory, confirm proceeding (existing
`.git`, `CLAUDE.md`, `README.md`, `docs/`, `documentsActivity/`,
`.gitignore` are not Vite files and won't be touched/overwritten).

- [ ] **Step 2: Install Tailwind CSS v3 and test tooling**

Run:
```bash
npm install
npm install -D tailwindcss@^3 postcss autoprefixer
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom
npx tailwindcss init -p
```

- [ ] **Step 3: Configure Tailwind content paths and theme colors**

Replace the generated `tailwind.config.js` with:

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#FFF8EC',
        ink: '#2B1B12',
        primary: '#E8601C',
        accent: '#F4A623',
        success: '#2F6B4F',
        error: '#C23B22',
      },
      fontFamily: {
        display: ['Fraunces', 'serif'],
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
```

- [ ] **Step 4: Wire Tailwind into the global stylesheet**

Replace `src/index.css` with:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  @apply bg-bg text-ink font-sans;
}
```

- [ ] **Step 5: Configure Vitest in `vite.config.js`**

```js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: './src/setupTests.js',
    globals: true,
  },
});
```

Create `src/setupTests.js`:

```js
import '@testing-library/jest-dom';
```

- [ ] **Step 6: Add test script to `package.json`**

Ensure `"scripts"` includes:
```json
"dev": "vite",
"build": "vite build",
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 7: Verify dev server and test runner both start cleanly**

Run: `npm run test`
Expected: "No test files found" or passes with 0 tests (no test files yet) —
exit code 0, no config errors.

Run: `npm run build`
Expected: build succeeds, no Tailwind/PostCSS errors.

- [ ] **Step 8: Commit**

```bash
git add package.json package-lock.json vite.config.js tailwind.config.js postcss.config.js index.html src/ .gitignore
git commit -m "Scaffold Vite + React + Tailwind + Vitest project setup"
```

---

## Task 2: Money and transaction ID utilities (pure logic, TDD)

**Files:**
- Create: `src/lib/money.js`
- Create: `src/lib/money.test.js`
- Create: `src/lib/transactionId.js`
- Create: `src/lib/transactionId.test.js`

**Interfaces:**
- Consumes: nothing (pure functions, no dependencies on app state)
- Produces: `pesosToCentavos`, `formatCentavosAsPesos`, `sumCartCentavos`,
  `generateTransactionId` — used by Task 3's reducer and later by every
  screen component.

- [ ] **Step 1: Write failing tests for money utilities**

Create `src/lib/money.test.js`:

```js
import { describe, it, expect } from 'vitest';
import { pesosToCentavos, formatCentavosAsPesos, sumCartCentavos } from './money';

describe('pesosToCentavos', () => {
  it('converts whole pesos to centavos', () => {
    expect(pesosToCentavos(175)).toBe(17500);
  });

  it('converts fractional pesos to centavos without float drift', () => {
    expect(pesosToCentavos(45.5)).toBe(4550);
  });
});

describe('formatCentavosAsPesos', () => {
  it('formats whole centavos with two decimal places and peso sign', () => {
    expect(formatCentavosAsPesos(17500)).toBe('₱175.00');
  });

  it('formats zero as ₱0.00', () => {
    expect(formatCentavosAsPesos(0)).toBe('₱0.00');
  });

  it('pads single-digit centavos', () => {
    expect(formatCentavosAsPesos(4505)).toBe('₱45.05');
  });
});

describe('sumCartCentavos', () => {
  it('sums quantity times unit price across all lines', () => {
    const cart = [
      { unitPriceCentavos: 4500, quantity: 2 },
      { unitPriceCentavos: 5000, quantity: 1 },
      { unitPriceCentavos: 3500, quantity: 1 },
    ];
    expect(sumCartCentavos(cart)).toBe(17500);
  });

  it('returns 0 for an empty cart', () => {
    expect(sumCartCentavos([])).toBe(0);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm run test -- money`
Expected: FAIL — `money.js` does not exist / exports not found.

- [ ] **Step 3: Implement money utilities**

Create `src/lib/money.js`:

```js
export function pesosToCentavos(pesos) {
  return Math.round(pesos * 100);
}

export function formatCentavosAsPesos(centavos) {
  const pesos = centavos / 100;
  return `₱${pesos.toFixed(2)}`;
}

export function sumCartCentavos(cart) {
  return cart.reduce(
    (total, line) => total + line.unitPriceCentavos * line.quantity,
    0
  );
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm run test -- money`
Expected: PASS, all 6 assertions green.

- [ ] **Step 5: Write failing test for transaction ID generator**

Create `src/lib/transactionId.test.js`:

```js
import { describe, it, expect } from 'vitest';
import { generateTransactionId } from './transactionId';

describe('generateTransactionId', () => {
  it('formats as TXN-YYYYMMDD-HHMMSS from a given date', () => {
    const fixedDate = new Date(2026, 9, 7, 10, 42, 30); // months are 0-indexed: 9 = October
    expect(generateTransactionId(fixedDate)).toBe('TXN-20261007-104230');
  });

  it('zero-pads single-digit month, day, hour, minute, second', () => {
    const fixedDate = new Date(2026, 0, 5, 3, 4, 5); // Jan 5, 03:04:05
    expect(generateTransactionId(fixedDate)).toBe('TXN-20260105-030405');
  });

  it('produces different ids for two different timestamps', () => {
    const a = generateTransactionId(new Date(2026, 9, 7, 10, 42, 30));
    const b = generateTransactionId(new Date(2026, 9, 7, 10, 42, 31));
    expect(a).not.toBe(b);
  });
});
```

- [ ] **Step 6: Run test to verify it fails**

Run: `npm run test -- transactionId`
Expected: FAIL — `transactionId.js` does not exist.

- [ ] **Step 7: Implement transaction ID generator**

Create `src/lib/transactionId.js`:

```js
function pad(number, length = 2) {
  return String(number).padStart(length, '0');
}

export function generateTransactionId(date = new Date()) {
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  const seconds = pad(date.getSeconds());
  return `TXN-${year}${month}${day}-${hours}${minutes}${seconds}`;
}
```

- [ ] **Step 8: Run tests to verify they pass**

Run: `npm run test -- transactionId`
Expected: PASS, all 3 assertions green.

- [ ] **Step 9: Commit**

```bash
git add src/lib/money.js src/lib/money.test.js src/lib/transactionId.js src/lib/transactionId.test.js
git commit -m "Add centavo-safe money math and transaction ID utilities"
```

---

## Task 3: Product catalog and app state reducer (TDD)

**Files:**
- Create: `src/data/products.js`
- Create: `src/state/initialState.js`
- Create: `src/state/reducer.js`
- Create: `src/state/reducer.test.js`

**Interfaces:**
- Consumes: `sumCartCentavos` from `src/lib/money.js`,
  `generateTransactionId` from `src/lib/transactionId.js`, `products` from
  `src/data/products.js`.
- Produces: `appReducer(state, action)` and `initialState` exactly as
  specified in the plan's Interfaces section above — Task 4 (UI) dispatches
  these action types and reads this state shape directly.

- [ ] **Step 1: Create the hardcoded product catalog**

Create `src/data/products.js`:

```js
export const products = [
  { id: 'coffee', name: 'Coffee', category: 'Drinks', unitPriceCentavos: 4500 },
  { id: 'soft-drink', name: 'Soft Drink', category: 'Drinks', unitPriceCentavos: 3500 },
  { id: 'bottled-water', name: 'Bottled Water', category: 'Drinks', unitPriceCentavos: 2000 },
  { id: 'sandwich', name: 'Sandwich', category: 'Food', unitPriceCentavos: 5000 },
  { id: 'cookies', name: 'Cookies', category: 'Snacks', unitPriceCentavos: 2500 },
  { id: 'chocolate', name: 'Chocolate', category: 'Snacks', unitPriceCentavos: 2500 },
];
```

- [ ] **Step 2: Create the initial state module**

Create `src/state/initialState.js`:

```js
export const initialState = {
  step: 'order',
  cart: [],
  paymentMethod: null,
  cashAmountPaidCentavos: null,
  cashError: null,
  transaction: null,
};
```

- [ ] **Step 3: Write failing tests for cart actions**

Create `src/state/reducer.test.js`:

```js
import { describe, it, expect } from 'vitest';
import { appReducer } from './reducer';
import { initialState } from './initialState';

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
```

- [ ] **Step 4: Run tests to verify they fail**

Run: `npm run test -- reducer`
Expected: FAIL — `reducer.js` does not exist.

- [ ] **Step 5: Implement cart and navigation actions**

Create `src/state/reducer.js`:

```js
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
```

- [ ] **Step 6: Run tests to verify they pass**

Run: `npm run test -- reducer`
Expected: PASS, all cart/navigation assertions green.

- [ ] **Step 7: Write failing tests for payment actions**

Append to `src/state/reducer.test.js`:

```js
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
    expect(state.step).toBe('payment-method'); // unchanged, stays off success
  });

  it('accepts an exact payment with ₱0.00 change', () => {
    let state = stateWithCoffeeAndMethod();
    state = appReducer(state, { type: 'SET_CASH_AMOUNT', amountCentavos: 4500 });
    state = appReducer(state, { type: 'SUBMIT_CASH_PAYMENT' });
    expect(state.transaction).not.toBeNull();
    expect(state.transaction.changeCentavos).toBe(0);
    expect(state.step).toBe('success');
  });

  it('accepts a payment above the total and computes correct change', () => {
    let state = stateWithCoffeeAndMethod();
    state = appReducer(state, { type: 'SET_CASH_AMOUNT', amountCentavos: 20000 });
    state = appReducer(state, { type: 'SUBMIT_CASH_PAYMENT' });
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
    let state = appReducer(initialState, { type: 'ADD_ITEM', productId: 'sandwich' }); // 5000
    state = appReducer(state, { type: 'SELECT_PAYMENT_METHOD', method: 'qr' });
    state = appReducer(state, { type: 'COMPLETE_SIMULATED_PAYMENT' });
    expect(state.transaction.amountPaidCentavos).toBe(5000);
    expect(state.transaction.changeCentavos).toBe(0);
    expect(state.transaction.paymentMethod).toBe('qr');
  });

  it('sets amountPaid equal to total and change to 0 for card', () => {
    let state = appReducer(initialState, { type: 'ADD_ITEM', productId: 'sandwich' });
    state = appReducer(state, { type: 'SELECT_PAYMENT_METHOD', method: 'card' });
    state = appReducer(state, { type: 'COMPLETE_SIMULATED_PAYMENT' });
    expect(state.transaction.changeCentavos).toBe(0);
    expect(state.transaction.paymentMethod).toBe('card');
  });
});

describe('RESET_TRANSACTION', () => {
  it('clears cart, payment method, cash amount, and transaction back to initial state', () => {
    let state = appReducer(initialState, { type: 'ADD_ITEM', productId: 'coffee' });
    state = appReducer(state, { type: 'SELECT_PAYMENT_METHOD', method: 'qr' });
    state = appReducer(state, { type: 'COMPLETE_SIMULATED_PAYMENT' });
    state = appReducer(state, { type: 'RESET_TRANSACTION' });
    expect(state).toEqual(initialState);
  });
});

describe('two sequential transactions', () => {
  it('produce distinct transaction ids', () => {
    let stateA = appReducer(initialState, { type: 'ADD_ITEM', productId: 'coffee' });
    stateA = appReducer(stateA, { type: 'SELECT_PAYMENT_METHOD', method: 'qr' });
    stateA = appReducer(stateA, { type: 'COMPLETE_SIMULATED_PAYMENT' });

    let stateB = appReducer(initialState, { type: 'ADD_ITEM', productId: 'sandwich' });
    stateB = appReducer(stateB, { type: 'SELECT_PAYMENT_METHOD', method: 'card' });
    stateB = appReducer(stateB, { type: 'COMPLETE_SIMULATED_PAYMENT' });

    expect(stateA.transaction.id).not.toBe(stateB.transaction.id);
  });
});
```

Note: the "unchanged, stays off success" assertion expects `state.step` to
remain whatever it was before submission (the reducer never changes `step`
on a rejected cash payment) — adjust the literal expected value if your
`GO_TO_STEP` sequencing in the real UI puts the user on
`'payment-processing'` instead of `'payment-method'` at submit time; the
important behavior under test is that `step` does *not* become `'success'`.

- [ ] **Step 8: Run tests to verify they fail**

Run: `npm run test -- reducer`
Expected: FAIL on the new payment-related test blocks (SUBMIT_CASH_PAYMENT,
COMPLETE_SIMULATED_PAYMENT, RESET_TRANSACTION, two sequential transactions)
— cart/navigation tests from Step 6 still pass.

- [ ] **Step 9: Re-run and confirm all reducer tests pass**

Run: `npm run test -- reducer`
Expected: PASS — implementation from Step 5 already covers these actions;
this step exists to confirm no regressions once the full test file is in
place.

- [ ] **Step 10: Commit**

```bash
git add src/data/products.js src/state/initialState.js src/state/reducer.js src/state/reducer.test.js
git commit -m "Add product catalog and app state reducer with full payment logic"
```

---

## Task 4: Screen components wired to the reducer

**Files:**
- Create: `src/components/StepTracker.jsx`
- Create: `src/components/OrderScreen.jsx`
- Create: `src/components/ReviewScreen.jsx`
- Create: `src/components/PaymentMethodScreen.jsx`
- Create: `src/components/PaymentProcessingScreen.jsx`
- Create: `src/components/CashPaymentView.jsx`
- Create: `src/components/QrPaymentView.jsx`
- Create: `src/components/CardPaymentView.jsx`
- Create: `src/components/SuccessScreen.jsx`
- Create: `src/components/ReceiptScreen.jsx`
- Modify: `src/App.jsx` (replace Task 1's placeholder with the real wiring)
- Create: `src/App.test.jsx`

**Interfaces:**
- Consumes: `appReducer`/`initialState` from Task 3, `products` from Task 3,
  `formatCentavosAsPesos` from Task 2.
- Produces: a fully running app satisfying the spec's 7-step flow — this is
  the last task in this plan; nothing downstream in this plan consumes it,
  but the three feature branches will each extend one or more of these
  files.

- [ ] **Step 1: Write the end-to-end happy-path test first**

Create `src/App.test.jsx`:

```jsx
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';

describe('full kiosk transaction flow', () => {
  it('lets a customer order, review, pay by QR, and reset', async () => {
    render(<App />);

    // Order step: add a Coffee
    fireEvent.click(await screen.findByRole('button', { name: /coffee/i }));
    expect(screen.getByText(/₱45\.00/)).toBeInTheDocument();

    // Proceed to Review
    fireEvent.click(screen.getByRole('button', { name: /proceed to payment|continue/i }));
    expect(screen.getByText(/review/i)).toBeInTheDocument();

    // Continue to Payment Method
    fireEvent.click(screen.getByRole('button', { name: /continue to payment/i }));
    expect(screen.getByRole('button', { name: /qr payment/i })).toBeInTheDocument();

    // Choose QR, confirm simulated payment
    fireEvent.click(screen.getByRole('button', { name: /qr payment/i }));
    fireEvent.click(screen.getByRole('button', { name: /confirm payment/i }));

    // Payment Successful screen
    expect(await screen.findByText(/payment successful/i)).toBeInTheDocument();
    expect(screen.getByText(/TXN-\d{8}-\d{6}/)).toBeInTheDocument();

    // View Receipt
    fireEvent.click(screen.getByRole('button', { name: /view receipt/i }));
    expect(screen.getByText(/coffee/i)).toBeInTheDocument();
    expect(screen.getByText(/₱0\.00/)).toBeInTheDocument(); // change for QR

    // New Transaction resets to an empty Order screen
    fireEvent.click(screen.getByRole('button', { name: /new transaction/i }));
    expect(screen.getByText(/cart is empty|0 items/i)).toBeInTheDocument();
  });

  it('rejects insufficient cash and keeps the user on the payment screen', async () => {
    render(<App />);

    fireEvent.click(await screen.findByRole('button', { name: /sandwich/i })); // ₱50.00
    fireEvent.click(screen.getByRole('button', { name: /proceed to payment|continue/i }));
    fireEvent.click(screen.getByRole('button', { name: /continue to payment/i }));
    fireEvent.click(screen.getByRole('button', { name: /^cash$/i }));

    const amountInput = screen.getByLabelText(/amount paid/i);
    fireEvent.change(amountInput, { target: { value: '20' } });
    fireEvent.click(screen.getByRole('button', { name: /pay now/i }));

    expect(screen.getByText(/insufficient payment/i)).toBeInTheDocument();
    expect(screen.queryByText(/payment successful/i)).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm run test -- App`
Expected: FAIL — components referenced by role/text don't exist yet.

- [ ] **Step 3: Build the step tracker**

Create `src/components/StepTracker.jsx`:

```jsx
const STEPS = [
  { key: 'order', label: 'Order' },
  { key: 'review', label: 'Review' },
  { key: 'payment', label: 'Payment' },
  { key: 'receipt', label: 'Receipt' },
];

function stepGroup(step) {
  if (step === 'order') return 'order';
  if (step === 'review') return 'review';
  if (step === 'payment-method' || step === 'payment-processing' || step === 'success') return 'payment';
  if (step === 'receipt') return 'receipt';
  return 'order';
}

export default function StepTracker({ currentStep }) {
  const activeGroup = stepGroup(currentStep);
  return (
    <header className="flex items-center gap-6 border-b border-ink/10 px-6 py-4">
      <span className="font-display text-xl font-semibold">Campus Store</span>
      <nav className="flex gap-4 text-sm">
        {STEPS.map(({ key, label }) => (
          <span
            key={key}
            className={
              key === activeGroup
                ? 'border-b-2 border-primary pb-1 font-semibold text-primary'
                : 'pb-1 text-ink/50'
            }
          >
            {label}
          </span>
        ))}
      </nav>
    </header>
  );
}
```

- [ ] **Step 4: Build the Order screen**

Create `src/components/OrderScreen.jsx`:

```jsx
import { products } from '../data/products';
import { formatCentavosAsPesos } from '../lib/money';

export default function OrderScreen({ state, dispatch }) {
  const totalCentavos = state.cart.reduce(
    (sum, line) => sum + line.unitPriceCentavos * line.quantity,
    0
  );

  return (
    <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-[2fr_1fr]">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {products.map((product) => (
          <button
            key={product.id}
            type="button"
            onClick={() => dispatch({ type: 'ADD_ITEM', productId: product.id })}
            className="rounded-xl border border-ink/10 bg-white p-4 text-left shadow-sm"
          >
            <div className="font-display text-lg">{product.name}</div>
            <div className="text-primary">{formatCentavosAsPesos(product.unitPriceCentavos)}</div>
          </button>
        ))}
      </div>

      <div className="rounded-xl border border-ink/10 bg-white p-4">
        <h2 className="font-display text-lg">Your Order</h2>
        {state.cart.length === 0 ? (
          <p className="mt-4 text-ink/60">Your cart is empty — tap an item to start.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {state.cart.map((line) => (
              <li key={line.productId} className="flex items-center justify-between">
                <div>
                  <div>{line.name}</div>
                  <div className="text-sm text-ink/60">
                    {formatCentavosAsPesos(line.unitPriceCentavos)} each
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    aria-label={`Decrease ${line.name} quantity`}
                    onClick={() => dispatch({ type: 'DECREMENT_ITEM', productId: line.productId })}
                    className="h-8 w-8 rounded-full bg-bg"
                  >
                    −
                  </button>
                  <span>{line.quantity}</span>
                  <button
                    type="button"
                    aria-label={`Increase ${line.name} quantity`}
                    onClick={() => dispatch({ type: 'INCREMENT_ITEM', productId: line.productId })}
                    className="h-8 w-8 rounded-full bg-accent"
                  >
                    +
                  </button>
                  <button
                    type="button"
                    aria-label={`Remove ${line.name}`}
                    onClick={() => dispatch({ type: 'REMOVE_ITEM', productId: line.productId })}
                    className="text-error"
                  >
                    ✕
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-6 flex items-center justify-between font-semibold">
          <span>Total</span>
          <span>{formatCentavosAsPesos(totalCentavos)}</span>
        </div>

        <button
          type="button"
          disabled={state.cart.length === 0}
          onClick={() => dispatch({ type: 'GO_TO_STEP', step: 'review' })}
          className="mt-4 w-full rounded-lg bg-primary py-3 font-semibold text-white disabled:opacity-40"
        >
          Proceed to Payment
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Build the Review screen**

Create `src/components/ReviewScreen.jsx`:

```jsx
import { formatCentavosAsPesos } from '../lib/money';

export default function ReviewScreen({ state, dispatch }) {
  const totalCentavos = state.cart.reduce(
    (sum, line) => sum + line.unitPriceCentavos * line.quantity,
    0
  );

  return (
    <div className="p-6">
      <h1 className="font-display text-2xl">Review your order</h1>
      <table className="mt-6 w-full text-left">
        <thead>
          <tr className="border-b border-ink/10 text-sm text-ink/60">
            <th className="py-2">Product</th>
            <th>Quantity</th>
            <th>Unit price</th>
            <th>Subtotal</th>
          </tr>
        </thead>
        <tbody>
          {state.cart.map((line) => (
            <tr key={line.productId} className="border-b border-ink/5">
              <td className="py-2">{line.name}</td>
              <td>{line.quantity}</td>
              <td>{formatCentavosAsPesos(line.unitPriceCentavos)}</td>
              <td>{formatCentavosAsPesos(line.unitPriceCentavos * line.quantity)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-4 flex items-center justify-between font-semibold">
        <span>Total Amount</span>
        <span>{formatCentavosAsPesos(totalCentavos)}</span>
      </div>

      <div className="mt-6 flex gap-4">
        <button
          type="button"
          onClick={() => dispatch({ type: 'GO_TO_STEP', step: 'order' })}
          className="rounded-lg border border-ink/20 px-6 py-3"
        >
          Back
        </button>
        <button
          type="button"
          onClick={() => dispatch({ type: 'GO_TO_STEP', step: 'payment-method' })}
          className="rounded-lg bg-primary px-6 py-3 font-semibold text-white"
        >
          Continue to Payment
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 6: Build the Payment Method screen**

Create `src/components/PaymentMethodScreen.jsx`:

```jsx
export default function PaymentMethodScreen({ dispatch }) {
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
```

- [ ] **Step 7: Build the Cash/QR/Card payment views and the routing screen**

Create `src/components/CashPaymentView.jsx`:

```jsx
import { useState } from 'react';
import { formatCentavosAsPesos, pesosToCentavos } from '../lib/money';

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

      <label className="mt-4 block">
        Amount paid
        <input
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
        onClick={() => dispatch({ type: 'SUBMIT_CASH_PAYMENT' })}
        className="mt-6 w-full rounded-lg bg-primary py-3 font-semibold text-white"
      >
        Pay Now
      </button>
    </div>
  );
}
```

Create `src/components/QrPaymentView.jsx`:

```jsx
import { formatCentavosAsPesos } from '../lib/money';

export default function QrPaymentView({ state, dispatch }) {
  const totalCentavos = state.cart.reduce(
    (sum, line) => sum + line.unitPriceCentavos * line.quantity,
    0
  );

  return (
    <div className="p-6">
      <h1 className="font-display text-2xl">QR Payment</h1>
      <p className="mt-2">Amount to pay: {formatCentavosAsPesos(totalCentavos)}</p>
      <div className="mt-4 h-48 w-48 border border-dashed border-ink/30" aria-hidden="true" />
      <p className="mt-4 text-sm text-ink/60">
        Scan the QR code using your supported payment application, then confirm below.
      </p>
      <button
        type="button"
        onClick={() => dispatch({ type: 'COMPLETE_SIMULATED_PAYMENT' })}
        className="mt-6 rounded-lg bg-primary px-6 py-3 font-semibold text-white"
      >
        Confirm Payment
      </button>
    </div>
  );
}
```

Create `src/components/CardPaymentView.jsx`:

```jsx
import { formatCentavosAsPesos } from '../lib/money';

export default function CardPaymentView({ state, dispatch }) {
  const totalCentavos = state.cart.reduce(
    (sum, line) => sum + line.unitPriceCentavos * line.quantity,
    0
  );

  return (
    <div className="p-6">
      <h1 className="font-display text-2xl">Credit / Debit Card</h1>
      <p className="mt-2">Amount due: {formatCentavosAsPesos(totalCentavos)}</p>
      <p className="mt-4 text-sm text-ink/60">Please tap, insert, or swipe your card.</p>
      <button
        type="button"
        onClick={() => dispatch({ type: 'COMPLETE_SIMULATED_PAYMENT' })}
        className="mt-6 rounded-lg bg-primary px-6 py-3 font-semibold text-white"
      >
        Process Payment
      </button>
    </div>
  );
}
```

Create `src/components/PaymentProcessingScreen.jsx`:

```jsx
import CashPaymentView from './CashPaymentView';
import QrPaymentView from './QrPaymentView';
import CardPaymentView from './CardPaymentView';

export default function PaymentProcessingScreen({ state, dispatch }) {
  if (state.paymentMethod === 'cash') return <CashPaymentView state={state} dispatch={dispatch} />;
  if (state.paymentMethod === 'qr') return <QrPaymentView state={state} dispatch={dispatch} />;
  if (state.paymentMethod === 'card') return <CardPaymentView state={state} dispatch={dispatch} />;
  return null;
}
```

- [ ] **Step 8: Build the Success and Receipt screens**

Create `src/components/SuccessScreen.jsx`:

```jsx
import { formatCentavosAsPesos } from '../lib/money';

export default function SuccessScreen({ state, dispatch }) {
  const { transaction } = state;
  return (
    <div className="p-6 text-center">
      <h1 className="font-display text-2xl text-success">Payment Successful</h1>
      <p className="mt-2">Transaction completed successfully. Thank you!</p>

      <dl className="mx-auto mt-6 max-w-sm text-left">
        <div className="flex justify-between border-b border-ink/10 py-2">
          <dt>Transaction No.</dt>
          <dd>{transaction.id}</dd>
        </div>
        <div className="flex justify-between border-b border-ink/10 py-2">
          <dt>Payment method</dt>
          <dd className="capitalize">{transaction.paymentMethod}</dd>
        </div>
        <div className="flex justify-between border-b border-ink/10 py-2">
          <dt>Transaction amount</dt>
          <dd>{formatCentavosAsPesos(transaction.totalCentavos)}</dd>
        </div>
        <div className="flex justify-between border-b border-ink/10 py-2">
          <dt>Amount paid</dt>
          <dd>{formatCentavosAsPesos(transaction.amountPaidCentavos)}</dd>
        </div>
        <div className="flex justify-between py-2">
          <dt>Change</dt>
          <dd>{formatCentavosAsPesos(transaction.changeCentavos)}</dd>
        </div>
      </dl>

      <button
        type="button"
        onClick={() => dispatch({ type: 'GO_TO_STEP', step: 'receipt' })}
        className="mt-6 rounded-lg bg-primary px-6 py-3 font-semibold text-white"
      >
        View Receipt
      </button>
    </div>
  );
}
```

Create `src/components/ReceiptScreen.jsx`:

```jsx
import { formatCentavosAsPesos } from '../lib/money';

export default function ReceiptScreen({ state, dispatch }) {
  const { transaction } = state;
  const date = new Date(transaction.timestamp);

  return (
    <div className="p-6">
      <div className="mx-auto max-w-sm border border-ink/10 bg-white p-6 font-mono text-sm">
        <h1 className="text-center font-display text-lg">CAMPUS STORE POS</h1>
        <p className="text-center text-xs text-ink/60">Official Digital Receipt</p>
        <hr className="my-3 border-dashed border-ink/30" />
        <p>Transaction No. {transaction.id}</p>
        <p>Date {date.toLocaleString()}</p>
        <hr className="my-3 border-dashed border-ink/30" />
        {transaction.items.map((item) => (
          <div key={item.name} className="mb-2 flex justify-between">
            <span>
              {item.name}
              <br />
              {item.quantity} × {formatCentavosAsPesos(item.unitPriceCentavos)}
            </span>
            <span>{formatCentavosAsPesos(item.subtotalCentavos)}</span>
          </div>
        ))}
        <hr className="my-3 border-dashed border-ink/30" />
        <div className="flex justify-between font-semibold">
          <span>TOTAL</span>
          <span>{formatCentavosAsPesos(transaction.totalCentavos)}</span>
        </div>
        <p className="mt-2">Payment method: {transaction.paymentMethod}</p>
        <p>Amount paid: {formatCentavosAsPesos(transaction.amountPaidCentavos)}</p>
        <p>Change: {formatCentavosAsPesos(transaction.changeCentavos)}</p>
        <p>Status: Payment Successful</p>
      </div>

      <button
        type="button"
        onClick={() => dispatch({ type: 'RESET_TRANSACTION' })}
        className="mx-auto mt-6 block rounded-lg bg-primary px-6 py-3 font-semibold text-white"
      >
        New Transaction
      </button>
    </div>
  );
}
```

- [ ] **Step 9: Wire everything together in `App.jsx`**

Replace `src/App.jsx`:

```jsx
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
```

- [ ] **Step 10: Run the App test to verify it passes**

Run: `npm run test -- App`
Expected: PASS for both the happy-path QR flow and the insufficient-cash
rejection test. If a `getByRole`/`getByLabelText` query fails to match,
adjust the JSX's visible text/aria-label (not the test) so real users would
see the same label the test is asserting on.

- [ ] **Step 11: Run the full test suite**

Run: `npm run test`
Expected: PASS — all money, transactionId, reducer, and App tests green.

- [ ] **Step 12: Manually verify the dev build**

Run: `npm run dev`, open the printed local URL in a browser, and walk through
all three payment methods (cash with an insufficient amount, cash with exact
amount, QR, card) plus New Transaction, confirming visually that the warm
palette is applied and no console errors appear. Stop the dev server
afterward.

- [ ] **Step 13: Commit**

```bash
git add src/components/ src/App.jsx src/App.test.jsx
git commit -m "Wire full 7-step kiosk transaction flow end-to-end"
```

---

## Final verification (push to main)

- [ ] **Step 1: Run the complete test suite one more time**

Run: `npm run test`
Expected: all tests pass, 0 failures.

- [ ] **Step 2: Run a production build**

Run: `npm run build`
Expected: succeeds with no errors.

- [ ] **Step 3: Push to main**

Since branch protection on `main` requires a PR + 1 approval for
collaborators, but admins (the repo owner) can bypass per the configured
`enforce_admins: false` setting, the scaffold can be pushed directly to
`main` as the shared foundation — confirm this is still the desired approach
before pushing (vs. opening a PR for symmetry with the rest of the project).

```bash
git push origin main
```

- [ ] **Step 4: Verify on GitHub**

Open `https://github.com/raz-gean/KioskiSystem_IT415` and confirm the commit
history shows the four commits from this plan (scaffold, utilities, state,
screens) and that `main` reflects them.
