import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TxStatusPanel } from '@/components/vault/TxStatusPanel';

describe('TxStatusPanel', () => {
  it('renders nothing when status is idle', () => {
    const { container } = render(
      <TxStatusPanel
        txState={{ status: 'idle', hash: null, error: null }}
        onReset={vi.fn()}
      />,
    );
    expect(container.firstChild).toBeNull();
  });

  it('shows preparing message', () => {
    render(
      <TxStatusPanel
        txState={{ status: 'preparing', hash: null, error: null }}
        onReset={vi.fn()}
      />,
    );
    expect(screen.getByText('Preparing Transaction')).toBeInTheDocument();
  });

  it('shows pending message', () => {
    render(
      <TxStatusPanel
        txState={{ status: 'pending', hash: null, error: null }}
        onReset={vi.fn()}
      />,
    );
    expect(screen.getByText('Transaction Submitted')).toBeInTheDocument();
  });

  it('shows success message with hash', () => {
    render(
      <TxStatusPanel
        txState={{ status: 'success', hash: 'abc123def456789012345678901234567890', error: null }}
        onReset={vi.fn()}
      />,
    );
    expect(screen.getByText('Reward Claimed!')).toBeInTheDocument();
    expect(screen.getByText('View ↗')).toBeInTheDocument();
  });

  it('shows error message when failed', () => {
    render(
      <TxStatusPanel
        txState={{ status: 'failed', hash: null, error: 'You have already claimed your reward.' }}
        onReset={vi.fn()}
      />,
    );
    expect(screen.getByText('Transaction Failed')).toBeInTheDocument();
    expect(screen.getByText('You have already claimed your reward.')).toBeInTheDocument();
  });

  it('calls onReset when Dismiss is clicked after success', () => {
    const onReset = vi.fn();
    render(
      <TxStatusPanel
        txState={{ status: 'success', hash: 'abc123def456789012345678901234567890', error: null }}
        onReset={onReset}
      />,
    );
    fireEvent.click(screen.getByText('Dismiss'));
    expect(onReset).toHaveBeenCalledOnce();
  });

  it('calls onReset when Dismiss is clicked after failure', () => {
    const onReset = vi.fn();
    render(
      <TxStatusPanel
        txState={{ status: 'failed', hash: null, error: 'Transaction failed' }}
        onReset={onReset}
      />,
    );
    fireEvent.click(screen.getByText('Dismiss'));
    expect(onReset).toHaveBeenCalledOnce();
  });
});
