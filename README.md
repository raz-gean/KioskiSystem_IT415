# Campus Store POS Kiosk

A touchscreen self-service Point-of-Sale kiosk for a campus store, built for
the IT415 (Application Development and Emerging Technologies) practical exam.

Customers tap products to build an order, review it, choose a payment method
(Cash, QR, or Credit/Debit Card), complete payment, and receive a digital
receipt.

## Status

Design complete, implementation not yet started. See
`docs/superpowers/specs/2026-10-07-kiosk-pos-design.md` for the full design
(stack, visual identity, screen-by-screen behavior, state shape).

## Stack

- React + Vite
- Tailwind CSS
- No backend/database — hardcoded product catalog, in-memory transaction state

## Transaction flow

1. **Order** — tap products, adjust quantities, see running total
2. **Review** — confirm the order before paying
3. **Payment Method** — Cash, QR Payment, or Credit/Debit Card
4. **Payment Processing** — validate and complete the selected payment
5. **Payment Successful** — confirmation with a transaction number
6. **Receipt** — itemized digital receipt
7. **New Transaction** — reset and return to Order

## Getting started

```bash
npm install
npm run dev
```

(Scaffolding not yet created — these commands will work once the Vite project
is initialized.)

## Project docs

- `docs/superpowers/specs/` — design specs and implementation plans
- `docs/ai-usage-log.md` — log of AI-assisted prompts/responses and how we
  evaluated/adapted them, kept as development-process evidence
- `documentsActivity/` — exam instructions and the instructor's acceptance
  checklist

## Group contributions

Group of 3 — IT415.

| Member | GitHub |
|---|---|
| raz-gean | https://github.com/raz-gean |
| Eran-Donna | https://github.com/Eran-Donna |
| 2d1e3th | https://github.com/2d1e3th |

Feature work is developed on `feature/<name>` branches per member and merged
into `main` via reviewed pull requests. See commit and PR history on GitHub
for per-member contribution detail.
