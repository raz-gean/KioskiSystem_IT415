import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';

describe('full kiosk transaction flow', () => {
  it('lets a customer order, review, pay by QR, and reset', async () => {
    render(<App />);

    // Order step: add a Coffee
    fireEvent.click(await screen.findByRole('button', { name: /coffee/i }));
    expect(screen.getAllByText(/₱45\.00/).length).toBeGreaterThan(0);

    // Proceed to Review
    fireEvent.click(screen.getByRole('button', { name: /proceed to payment|continue/i }));
    expect(screen.getByRole('heading', { name: /review your order/i })).toBeInTheDocument();

    // Continue to Payment Method
    fireEvent.click(screen.getByRole('button', { name: /continue to payment/i }));
    expect(screen.getByRole('button', { name: /qr payment/i })).toBeInTheDocument();

    // Choose QR, confirm simulated payment
    fireEvent.click(screen.getByRole('button', { name: /qr payment/i }));
    fireEvent.click(screen.getByRole('button', { name: /confirm payment/i }));

    // Payment Successful screen
    expect(await screen.findByText(/payment successful/i)).toBeInTheDocument();
    expect(screen.getByText(/TXN-\d{8}-\d{6}/)).toBeInTheDocument();
    expect(screen.getByText('QR Payment')).toBeInTheDocument();

    // View Receipt
    fireEvent.click(screen.getByRole('button', { name: /view receipt/i }));
    expect(screen.getByText(/coffee/i)).toBeInTheDocument();
    expect(screen.getByText(/Payment method: QR Payment/i)).toBeInTheDocument();
    expect(screen.getByText(/₱0\.00/)).toBeInTheDocument(); // change for QR

    // New Transaction resets to an empty Order screen
    fireEvent.click(screen.getByRole('button', { name: /new transaction/i }));
    expect(screen.getByText(/cart is empty|0 items/i)).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent(
      /new transaction started — previous order cleared/i
    );
  });

  it('rejects insufficient cash and keeps the user on the payment screen', async () => {
    render(<App />);

    fireEvent.click(await screen.findByRole('button', { name: /sandwich/i })); // ₱50.00
    fireEvent.click(screen.getByRole('button', { name: /proceed to payment|continue/i }));
    fireEvent.click(screen.getByRole('button', { name: /continue to payment/i }));
    fireEvent.click(screen.getByRole('button', { name: /^cash$/i }));

    const amountInput = screen.getByLabelText(/amount paid/i);
    fireEvent.change(amountInput, { target: { value: '20' } });
    fireEvent.click(screen.getByRole('button', { name: /pay now/i }));

    expect(screen.getByText(/insufficient payment/i)).toBeInTheDocument();
    expect(screen.queryByText(/payment successful/i)).not.toBeInTheDocument();
  });
});
