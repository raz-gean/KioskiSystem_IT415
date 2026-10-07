import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { useReducer } from 'react';
import { appReducer } from '../state/reducer';
import { initialState } from '../state/initialState';
import OrderScreen from './OrderScreen';

function Harness() {
  const [state, dispatch] = useReducer(appReducer, initialState);
  return <OrderScreen state={state} dispatch={dispatch} />;
}

describe('OrderScreen category filters', () => {
  it('shows all products by default', () => {
    render(<Harness />);
    expect(screen.getByRole('button', { name: /brewed coffee/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /buko pie/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /chicken adobo/i })).toBeInTheDocument();
  });

  it('filters to only the selected category', () => {
    render(<Harness />);
    fireEvent.click(screen.getByRole('button', { name: /^pies$/i }));
    expect(screen.getByRole('button', { name: /buko pie/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /brewed coffee/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /chicken adobo/i })).not.toBeInTheDocument();
  });

  it('returns to showing all products when "All" is selected again', () => {
    render(<Harness />);
    fireEvent.click(screen.getByRole('button', { name: /^coffee$/i }));
    expect(screen.queryByRole('button', { name: /buko pie/i })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /^all$/i }));
    expect(screen.getByRole('button', { name: /buko pie/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /brewed coffee/i })).toBeInTheDocument();
  });
});
