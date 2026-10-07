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
  const activeIndex = STEPS.findIndex((step) => step.key === activeGroup);

  return (
    <header className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-ink/10 bg-white px-4 py-3 sm:gap-6 sm:px-6 sm:py-4">
      <span className="flex items-center gap-2 font-display text-lg font-semibold sm:text-xl">
        <img
          src="/imgs/Logo.jpg"
          alt="SizzleBites logo"
          className="h-8 w-8 shrink-0 rounded-lg object-cover"
        />
        <span className="hidden sm:inline">SizzleBites</span>
      </span>
      <nav className="flex flex-wrap gap-3 text-xs sm:gap-4 sm:text-sm">
        {STEPS.map(({ key, label }, index) => {
          const isDone = index < activeIndex;
          const isActive = key === activeGroup;
          return (
            <span
              key={key}
              className={
                isActive
                  ? 'whitespace-nowrap border-b-2 border-primary pb-1 font-semibold text-primary'
                  : isDone
                    ? 'whitespace-nowrap pb-1 text-success'
                    : 'whitespace-nowrap pb-1 text-ink/50'
              }
            >
              {isDone && <span aria-hidden="true">✓ </span>}
              {label}
            </span>
          );
        })}
      </nav>
    </header>
  );
}
