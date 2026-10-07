import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../App';

function reachCash() {
  render(<App />);
  fireEvent.click(screen.getByRole('button', { name: /^coffee/i }));
  fireEvent.click(screen.getByRole('button', { name: /proceed to payment/i }));
  fireEvent.click(screen.getByRole('button', { name: /continue to payment/i }));
  fireEvent.click(screen.getByRole('button', { name: /^cash$/i }));
}

describe('cash keypad', () => {
  it('enters decimal amounts, ignores a second decimal, and deletes a digit', () => {
    reachCash();
    for (const key of ['5', '0', '.', '.', '5', '9']) {
      fireEvent.click(screen.getByRole('button', { name: key, exact: true }));
    }
    fireEvent.click(screen.getByRole('button', { name: /delete last digit/i }));
    expect(screen.getByLabelText(/amount paid/i)).toHaveValue(50.5);
    expect(screen.getByText('Change: ₱5.50')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /pay now/i }));
    expect(screen.getByRole('heading', { name: /payment successful/i })).toBeInTheDocument();
  });

  it.each([200, 500, 1000])('sets ₱%s as the amount and computes change', (amount) => {
    reachCash();
    fireEvent.click(screen.getByRole('button', { name: `₱${amount}.00`, exact: true }));
    expect(screen.getByLabelText(/amount paid/i)).toHaveValue(amount);
    expect(screen.getByText(`Change: ₱${(amount - 45).toFixed(2)}`)).toBeInTheDocument();
  });

  it('accepts Exact with zero change', () => {
    reachCash();
    fireEvent.click(screen.getByRole('button', { name: /^exact$/i }));
    expect(screen.getByLabelText(/amount paid/i)).toHaveValue(45);
    expect(screen.getByText('Change: ₱0.00')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /pay now/i }));
    expect(screen.getByRole('heading', { name: /payment successful/i })).toBeInTheDocument();
  });

  it('clears the amount and rejects payment until a new amount is entered', () => {
    reachCash();
    fireEvent.click(screen.getByRole('button', { name: /^exact$/i }));
    fireEvent.click(screen.getByRole('button', { name: /^clear$/i }));
    expect(screen.getByLabelText(/amount paid/i)).toHaveValue(null);
    fireEvent.click(screen.getByRole('button', { name: /pay now/i }));
    expect(screen.getByText(/please enter a valid payment amount/i)).toBeInTheDocument();
  });
});
