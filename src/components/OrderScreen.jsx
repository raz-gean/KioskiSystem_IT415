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
