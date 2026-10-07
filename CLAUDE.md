# CLAUDE.md

This file guides Claude Code when working in this repository.

## Project

Touchscreen Point-of-Sale (POS) Kiosk System for the IT415 practical exam —
a campus store self-service kiosk. Full requirements and the approved design
are in `docs/superpowers/specs/2026-10-07-kiosk-pos-design.md`. Read that spec
before making architectural changes.

Exam requirements source: the student was given `IT415_Practical_Exam.pdf`
(authoritative) and `IT415-Sample-UI.pdf` (visual reference only, not binding).

## Stack

- React + Vite (SPA, no router — the flow is a strict linear wizard)
- Tailwind CSS
- No backend, no database — hardcoded product catalog, all transaction state
  in-memory via React state/reducer
- No persistence across page reloads (not required by the exam)

## Required transaction flow

Order (item selection) → Review → Payment Method → Payment Processing →
Payment Successful → Receipt → New Transaction (reset to Order).

This sequence and every validation rule (insufficient cash rejection, exact
payment = ₱0 change, QR/card simulate amountPaid = total with ₱0 change,
unique transaction number per completed transaction, full state reset on New
Transaction) are graded against an instructor checklist — treat them as hard
requirements, not suggestions. Don't simplify away any step in the flow.

## Design identity

Warm, food-stall palette — not a generic SaaS look. Ivory background
(`#FFF8EC`), roasted-coffee text (`#2B1B12`), burnt-orange primary
(`#E8601C`), golden-yellow accent (`#F4A623`), leaf-green success
(`#2F6B4F`), paprika error (`#C23B22`). Fraunces for display/headings, Inter
for UI/body with tabular numerals for prices. Full rationale in the design
spec — don't revert to default Tailwind blues/grays or generic card-kit
styling.

## Working conventions

- YAGNI: this exam explicitly rewards "a simple application that works
  correctly" over a complicated one with incomplete features. Don't add
  optional enhancements (login, inventory deduction, discounts, persistence,
  sales reports, etc.) unless the user asks.
- Don't add a router, state management library, or backend — out of scope per
  the design spec.
- Match the product catalog and transaction-number format defined in the
  design spec exactly; don't invent new products or ID formats mid-build.
- The exam grades Git workflow itself (branches, commits, PRs). Do feature
  work on branches named `feature/<thing>` and merge back to `main` via PR
  rather than committing everything directly to `main`.
- Before touching code for a new chunk of work, check
  `docs/superpowers/specs/` for the current design doc and any implementation
  plan — don't re-derive requirements from scratch or from memory.
