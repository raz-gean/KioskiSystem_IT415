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
});
