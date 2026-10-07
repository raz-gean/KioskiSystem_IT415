import { formatCentavosAsPesos } from '../lib/money';
import { getPaymentMethodLabel } from '../lib/paymentMethodLabel';

export default function ReceiptScreen({ state, dispatch }) {
  const { transaction } = state;
  const date = new Date(transaction.timestamp);

  return (
    <div className="p-6">
      <div className="mx-auto max-w-sm border border-ink/10 bg-white p-6 font-mono text-sm">
        <img src="/imgs/Logo.jpg" alt="SizzleBites logo" className="mx-auto h-16 w-16 rounded-full object-cover" />
        <h1 className="mt-2 text-center font-display text-lg">SIZZLEBITES POS</h1>
        <p className="text-center text-xs text-ink/60">Official Digital Receipt</p>
        <hr className="my-3 border-dashed border-ink/30" />
        <p>Transaction No. {transaction.id}</p>
        <p>Date {date.toLocaleString()}</p>
        <hr className="my-3 border-dashed border-ink/30" />
        {transaction.items.map((item, index) => (
          <div key={`${item.name}-${index}`} className="mb-2 flex justify-between">
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
        <p className="mt-2">Payment method: {getPaymentMethodLabel(transaction.paymentMethod)}</p>
        <p>Amount paid: {formatCentavosAsPesos(transaction.amountPaidCentavos)}</p>
        <p>Change: {formatCentavosAsPesos(transaction.changeCentavos)}</p>
        <p>Status: Payment Successful</p>
      </div>

      <div className="mx-auto mt-6 flex max-w-sm gap-4">
        <button
          type="button"
          onClick={() => window.print()}
          className="flex-1 rounded-lg border border-ink/20 py-3 font-semibold"
        >
          Print Receipt
        </button>
        <button
          type="button"
          onClick={() => dispatch({ type: 'RESET_TRANSACTION' })}
          className="flex-1 rounded-lg bg-primary py-3 font-semibold text-white"
        >
          New Transaction
        </button>
      </div>
    </div>
  );
}
