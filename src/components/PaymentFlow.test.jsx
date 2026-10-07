import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../App';

function reachPaymentMethod() {
  render(<App />);
  fireEvent.click(screen.getByRole('button', { name: /^coffee/i }));
  fireEvent.click(screen.getByRole('button', { name: /^coffee/i }));
  fireEvent.click(screen.getByRole('button', { name: /^sandwich/i }));
  fireEvent.click(screen.getByRole('button', { name: /proceed to payment/i }));
  fireEvent.click(screen.getByRole('button', { name: /continue to payment/i }));
}

describe('payment improvements', () => {
  it('shows the total for all items and quantities when choosing payment', () => {
    reachPaymentMethod();
    expect(screen.getByText(/Amount due: ₱140\.00/)).toBeInTheDocument();
  });

  it('returns from payment selection to review without losing the order', () => {
    reachPaymentMethod();
    fireEvent.click(screen.getByRole('button', { name: /^back$/i }));
    expect(screen.getByRole('heading', { name: /review your order/i })).toBeInTheDocument();
    expect(screen.getByText('₱140.00')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it.each(['Cash', 'QR Payment', 'Credit / Debit Card'])('returns from %s processing to payment selection', (method) => {
    reachPaymentMethod();
    fireEvent.click(screen.getByRole('button', { name: method, exact: true }));
    fireEvent.click(screen.getByRole('button', { name: /^back$/i }));
    expect(screen.getByRole('heading', { name: /how would you like to pay/i })).toBeInTheDocument();
    expect(screen.getByText(/Amount due: ₱140\.00/)).toBeInTheDocument();
  });
});
