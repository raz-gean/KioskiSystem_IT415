import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, act, cleanup } from '@testing-library/react';
import CardPaymentView from './CardPaymentView';

const state = { cart: [{ unitPriceCentavos: 4500, quantity: 2 }] };

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe('simulated card processing', () => {
  it('shows processing and completes once after one second with an ID and timestamp', () => {
    vi.useFakeTimers();
    const dispatch = vi.fn();
    render(<CardPaymentView state={state} dispatch={dispatch} />);
    const button = screen.getByRole('button', { name: /process payment/i });
    fireEvent.click(button);
    expect(dispatch).not.toHaveBeenCalled();
    expect(screen.getByRole('status')).toHaveTextContent('Processing payment…');
    expect(button).toBeDisabled();
    fireEvent.click(button);
    act(() => vi.advanceTimersByTime(999));
    expect(dispatch).not.toHaveBeenCalled();
    act(() => vi.advanceTimersByTime(1));
    expect(dispatch).toHaveBeenCalledTimes(1);
    expect(dispatch).toHaveBeenCalledWith({
      type: 'COMPLETE_SIMULATED_PAYMENT',
      transactionId: expect.stringMatching(/^TXN-\d{8}-\d{6}(-\d{3})?$/),
      timestamp: expect.any(String),
    });
    expect(Number.isNaN(Date.parse(dispatch.mock.calls[0][0].timestamp))).toBe(false);
  });

  it('cancels pending payment when navigating away', () => {
    vi.useFakeTimers();
    const dispatch = vi.fn();
    const { unmount } = render(<CardPaymentView state={state} dispatch={dispatch} />);
    fireEvent.click(screen.getByRole('button', { name: /process payment/i }));
    unmount();
    act(() => vi.advanceTimersByTime(1000));
    expect(dispatch).not.toHaveBeenCalled();
  });
});
