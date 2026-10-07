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
