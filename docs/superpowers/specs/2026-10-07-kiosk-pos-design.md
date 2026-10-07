# Campus Store Touchscreen POS Kiosk — Design

## Context

IT415 practical exam: build a functional touchscreen self-service POS kiosk for a
campus store. Customers select products, review their order, choose a payment
method, complete payment, and receive a digital receipt. Grading covers both the
working application (against an instructor test checklist) and the development
process (Git/GitHub branching, commits, PRs).

Source requirements: `IT415_Practical_Exam.pdf` (practical exam spec — authoritative).
Visual/UX reference only (not binding): `IT415-Sample-UI.pdf`.

## Goals

- Implement the required 7-step transaction flow correctly and robustly enough to
  pass every instructor test in the exam's checking guide (sections 6 and 7).
- Keep the implementation simple — no unused abstractions, no backend, no
  persistence beyond a single in-memory session.
- Present a distinctive, warm, food-stall-style visual identity (not a generic
  SaaS/dashboard look), per user request.

## Non-goals

- No database, no network calls, no real payment gateway integration.
- No login/auth, sales reports, inventory deduction, discounts, or other optional
  enhancements listed in the exam — none requested by the user.
- No persistence across page reloads (in-memory state is sufficient; the exam
  does not require survival across refresh).

## Tech stack

- **React + Vite** — single-page app, no router (the flow is a strict linear
  wizard, not distinct URLs).
- **Tailwind CSS** for styling.
- **Hardcoded product data** in a local module; all transaction state lives in
  React state in the top-level `App` component (or a reducer if state grows
  unwieldy).
- No backend, no database.

## Visual design

**Palette** (warm, complementary — avoiding generic cream+terracotta SaaS defaults):

| Token | Hex | Use |
|---|---|---|
| `--color-bg` | `#FFF8EC` | Warm ivory background |
| `--color-text` | `#2B1B12` | Roasted-coffee near-black text |
| `--color-primary` | `#E8601C` | Burnt-orange — primary buttons, active step, totals |
| `--color-accent` | `#F4A623` | Golden-yellow — quantity badges, highlights |
| `--color-success` | `#2F6B4F` | Muted leaf-green — success/paid states |
| `--color-error` | `#C23B22` | Deep paprika — insufficient payment / error states |

**Type:**
- Display/headings: **Fraunces** (warm serif, confident weight) — screen titles,
  totals, receipt heading.
- UI/body: **Inter** — buttons, labels, product names, prices (tabular numerals
  for price/quantity alignment).

**Layout principles:**
- Order step: product grid on the left (filterable by category), persistent
  order panel on the right — always visible, not a drawer/modal.
- Step tracker in the header is understated text tabs with an underline on the
  current step (not generic numbered circles) — it's a real sequence, so
  numbering/ordering is earned here.
- Cash payment uses a large physical-calculator-style keypad.
- One bold visual moment: the total/Pay button. Everything else stays quiet.

## Product catalog (hardcoded)

| Product | Category | Price |
|---|---|---|
| Coffee | Drinks | ₱45.00 |
| Soft Drink | Drinks | ₱35.00 |
| Bottled Water | Drinks | ₱20.00 |
| Sandwich | Food | ₱50.00 |
| Cookies | Snacks | ₱25.00 |
| Chocolate | Snacks | ₱25.00 |

Category filter tabs: All / Drinks / Food / Snacks.

## Application state shape

```js
{
  step: 'order' | 'review' | 'payment-method' | 'payment-processing' | 'success' | 'receipt',
  cart: [{ productId, name, unitPrice, quantity }],
  paymentMethod: 'cash' | 'qr' | 'card' | null,
  cashAmountPaid: number | null,
  transaction: {
    id: string,          // e.g. TXN-20261007-104230
    items: [...],        // snapshot of cart at time of payment
    total: number,
    paymentMethod: string,
    amountPaid: number,
    change: number,
    timestamp: Date,
  } | null,
}
```

The `transaction` object is a frozen snapshot taken at the moment payment
succeeds, so Review/back-navigation edits to the live cart never retroactively
change a completed transaction's receipt.

## Screens and behavior

### 1. Order (Item Selection)
- Product grid, large tappable cards, name + price always visible.
- Category filter tabs (All/Drinks/Food/Snacks); filtering only changes what's
  shown, never the cart.
- Tapping a product adds 1 to its cart quantity (or adds it at qty 1 if new).
- Order panel (right side, always visible): line items with name, unit price,
  qty, subtotal, per-item − / + / remove controls, and a running total.
- Quantity can never go below 0; decrementing from 1 removes the item from the
  cart entirely.
- Empty cart shows an explicit empty state ("Your cart is empty — tap an item
  to start") per the sample's pattern, and disables "Proceed to Payment".
- Brief toast/banner feedback on add ("Product added — <name>").

### 2. Review (Order / Payment Summary)
- Read-only table: product, quantity, unit price, subtotal, total — must match
  Order step's numbers exactly (same cart, just re-rendered as a table).
- **Back** returns to Order step with cart fully preserved (same state, no
  reset).
- **Continue to Payment** moves to Payment Method step.

### 3. Payment Method
- Three large buttons: Cash, QR Payment, Credit/Debit Card.
- Shows amount due prominently.
- Selecting one moves to that method's processing screen.

### 4. Payment Processing

**Cash:**
- Shows total due, amount-paid field, quick-amount buttons (Exact / common
  denominations), on-screen numeric keypad.
- Change = amount paid − total, computed live and displayed.
- "Pay Now" validates: amount paid must be a valid number ≥ total. Blank,
  non-numeric, negative, or insufficient amounts are rejected inline with a
  clear message ("Insufficient payment. Please enter at least ₱X.XX. You are
  short by ₱Y.YY.") and the user stays on the payment screen — no transaction
  is created.
- Exact payment is valid and produces ₱0.00 change.

**QR:**
- Shows amount to pay, a QR placeholder graphic, scan/confirm instructions, and
  a "Confirm Payment" button.
- Confirming simulates success: amountPaid = total, change = ₱0.00.

**Card:**
- Shows amount due and a tap/insert/swipe instruction, a "Process Payment"
  button, and a brief simulated "Processing payment…" state (short timeout,
  e.g. ~1s) before completing.
- amountPaid = total, change = ₱0.00.

All three methods converge on the same success path once validated/simulated.

### 5. Payment Successful
- On success, generate `transaction` snapshot: timestamp-based ID
  (`TXN-YYYYMMDD-HHMMSS`), items, total, method, amount paid, change.
- Display: transaction number, payment method, transaction amount, amount
  paid, change, and a "View Receipt" button.

### 6. Receipt
- Till-style itemized receipt rendered from the `transaction` snapshot:
  transaction #, date, each item (qty × unit price → subtotal), total, payment
  method, amount paid, change, status.
- "New Transaction" button.

### 7. New Transaction
- Resets `cart`, `paymentMethod`, `cashAmountPaid`, and `transaction` to
  initial empty values; sets `step` back to `'order'`.
- No data from the previous transaction is visible afterward (previous
  receipt is gone from view, cart is empty).
- Brief feedback banner ("New transaction started — previous order cleared").

## Error handling / validation summary

- Quantity: clamped at 0 (removes item), never negative, no typing required to
  adjust it.
- Cash payment: reject blank/non-numeric/negative/insufficient amounts with an
  inline, specific message; never auto-complete payment on invalid input.
- Proceeding to Payment with an empty cart is prevented (button disabled).
- All user-facing feedback uses the interface's own direct voice (e.g. "Your
  cart is empty — tap an item to start"), not generic placeholder text.

## Testing approach

Given the exam provides an explicit instructor test checklist (sections 6–7 of
`IT415_Practical_Exam.pdf`), manual verification against that checklist is the
primary acceptance test:
- Startup + selection, multi-product add, quantity increase/decrease, item
  removal, Review screen match, Back-navigation preservation, payment method
  buttons.
- Insufficient cash rejection, successful cash with correct change, exact
  payment ₱0 change.
- QR simulated success, Card simulated success.
- New Transaction full reset.
- Two sequential transactions produce two distinct transaction numbers.

If time permits, lightweight component tests (Vitest + React Testing Library)
for the cart reducer/total math and the cash-validation logic are a reasonable
addition, but are not required by the exam and will not be pursued unless
requested.

## Git / development process

The exam explicitly grades Git/GitHub workflow (branches, commits, PRs, review,
merge). Planned approach:
- Initial scaffold commit on `main`.
- Feature branches per logical unit (e.g. `feature/product-catalog-and-cart`,
  `feature/review-screen`, `feature/payment-flow`, `feature/receipt-and-reset`),
  each merged via PR back to `main`.
- Commit messages describe why, not just what, per the user's existing
  commit-message conventions.

Exact branch granularity may be adjusted during implementation planning.

## Open items resolved during brainstorming

- Product catalog: reuse the sample's 6 items (confirmed).
- Transaction ID format: timestamp-based (confirmed).
- Category filters: included despite small catalog size (confirmed).
- Visual design: fully custom, warm orange/yellow/green palette (confirmed,
  palette approved).
