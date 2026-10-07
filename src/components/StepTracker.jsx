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
      <span className="flex items-center gap-2 font-display text-xl font-semibold">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-sm text-white">
          SB
        </span>
        SizzlingBites
      </span>
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
