import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ClaimStatusBadge } from '@/components/vault/ClaimStatusBadge';

describe('ClaimStatusBadge', () => {
  it('shows loading state when isLoading is true', () => {
    render(
      <ClaimStatusBadge hasClaimed={undefined} txStatus="idle" isLoading={true} />,
    );
    expect(screen.getByText('Checking…')).toBeInTheDocument();
  });

  it('shows Claimed when hasClaimed is true and status is idle', () => {
    render(<ClaimStatusBadge hasClaimed={true} txStatus="idle" />);
    expect(screen.getByText('Claimed')).toBeInTheDocument();
  });

  it('shows Claimed when txStatus is success', () => {
    render(<ClaimStatusBadge hasClaimed={false} txStatus="success" />);
    expect(screen.getByText('Claimed')).toBeInTheDocument();
  });

  it('shows Eligible when not claimed and idle', () => {
    render(<ClaimStatusBadge hasClaimed={false} txStatus="idle" />);
    expect(screen.getByText('Eligible')).toBeInTheDocument();
  });

  it('shows Preparing when txStatus is preparing', () => {
    render(<ClaimStatusBadge hasClaimed={false} txStatus="preparing" />);
    expect(screen.getByText('Preparing…')).toBeInTheDocument();
  });

  it('shows Pending when txStatus is pending', () => {
    render(<ClaimStatusBadge hasClaimed={false} txStatus="pending" />);
    expect(screen.getByText('Pending…')).toBeInTheDocument();
  });

  it('shows Failed when txStatus is failed', () => {
    render(<ClaimStatusBadge hasClaimed={false} txStatus="failed" />);
    expect(screen.getByText('Failed')).toBeInTheDocument();
  });
});
