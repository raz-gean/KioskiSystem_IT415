import { useState } from 'react';
import { products } from '../data/products';
import { formatCentavosAsPesos } from '../lib/money';

const CATEGORIES = ['All', 'Coffee', 'Soft Drinks', 'Cakes', 'Pies', 'Filipino Dishes'];

export default function OrderScreen({ state, dispatch }) {
  const [activeCategory, setActiveCategory] = useState('All');

  const totalCentavos = state.cart.reduce(
    (sum, line) => sum + line.unitPriceCentavos * line.quantity,
    0
  );

  const visibleProducts =
    activeCategory === 'All'
      ? products
      : products.filter((product) => product.category === activeCategory);

  return (
    <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-[2fr_1fr]">
      <div>
        <div className="mb-4 flex flex-wrap gap-2" role="group" aria-label="Filter by category">
          {CATEGORIES.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => setActiveCategory(category)}
              aria-pressed={activeCategory === category}
              className={
                activeCategory === category
                  ? 'rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white'
                  : 'rounded-full border border-ink/10 bg-white px-4 py-2 text-sm font-semibold text-ink/70'
              }
            >
              {category}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {visibleProducts.map((product) => (
            <button
              key={product.id}
              type="button"
              onClick={() => dispatch({ type: 'ADD_ITEM', productId: product.id })}
              className="group rounded-xl border border-ink/10 bg-white p-4 text-left shadow-sm transition active:scale-95 active:border-primary"
            >
              <div
                className="flex h-14 w-14 items-center justify-center rounded-lg bg-accent/20 text-2xl"
                aria-hidden="true"
              >
                {product.icon}
              </div>
              <div className="mt-3 font-display text-lg">{product.name}</div>
              <div className="text-primary">{formatCentavosAsPesos(product.unitPriceCentavos)}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-ink/10 bg-white p-4">
        <h2 className="font-display text-lg">Your Order</h2>
        {state.cart.length === 0 ? (
          <p className="mt-4 text-ink/60">Your cart is empty — tap an item to start.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {state.cart.map((line) => (
              <li key={line.productId} className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <div className="truncate">{line.name}</div>
                  <div className="text-sm text-ink/60">
                    {formatCentavosAsPesos(line.unitPriceCentavos)} each
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <button
                    type="button"
                    aria-label={`Decrease ${line.name} quantity`}
                    onClick={() => dispatch({ type: 'DECREMENT_ITEM', productId: line.productId })}
                    className="h-8 w-8 rounded-full bg-bg font-semibold"
                  >
                    −
                  </button>
                  <span className="min-w-6 rounded-full bg-ink/5 px-2 text-center text-sm font-semibold">
                    {line.quantity}
                  </span>
                  <button
                    type="button"
                    aria-label={`Increase ${line.name} quantity`}
                    onClick={() => dispatch({ type: 'INCREMENT_ITEM', productId: line.productId })}
                    className="h-8 w-8 rounded-full bg-accent font-semibold"
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
          <span className="font-display text-xl text-primary">
            {formatCentavosAsPesos(totalCentavos)}
          </span>
        </div>

        <button
          type="button"
          disabled={state.cart.length === 0}
          onClick={() => dispatch({ type: 'GO_TO_STEP', step: 'review' })}
          className="mt-4 w-full rounded-lg bg-primary py-3 font-semibold text-white transition active:scale-[0.98] disabled:opacity-40 disabled:active:scale-100"
        >
          Proceed to Payment
        </button>
      </div>
    </div>
  );
}
