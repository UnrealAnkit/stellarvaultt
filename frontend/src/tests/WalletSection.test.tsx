import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WalletSection } from '@/components/wallet/WalletSection';
import * as useWalletModule from '@/hooks/useWallet';

// Create a wrapper with QueryClientProvider
function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe('WalletSection', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('shows connect prompt when not connected', () => {
    vi.spyOn(useWalletModule, 'useWallet').mockReturnValue({
      isConnected: false,
      address: null,
      name: null,
      icon: null,
      connect: vi.fn(),
      disconnect: vi.fn(),
      isConnecting: false,
      connectError: null,
    });

    render(<WalletSection />, { wrapper: createWrapper() });
    expect(screen.getByText('Connect Your Wallet')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /connect wallet/i })).toBeInTheDocument();
  });

  it('shows loading state while connecting', () => {
    vi.spyOn(useWalletModule, 'useWallet').mockReturnValue({
      isConnected: false,
      address: null,
      name: null,
      icon: null,
      connect: vi.fn(),
      disconnect: vi.fn(),
      isConnecting: true,
      connectError: null,
    });

    render(<WalletSection />, { wrapper: createWrapper() });
    expect(screen.getByText('Opening wallet…')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /opening wallet/i })).toBeDisabled();
  });

  it('shows wallet details when connected', () => {
    const mockAddress = 'GBJ2...7S2X';
    vi.spyOn(useWalletModule, 'useWallet').mockReturnValue({
      isConnected: true,
      address: mockAddress,
      name: 'Freighter',
      icon: 'data:image/svg+xml;base64,mock-icon',
      connect: vi.fn(),
      disconnect: vi.fn(),
      isConnecting: false,
      connectError: null,
    });

    render(<WalletSection />, { wrapper: createWrapper() });
    expect(screen.getByText('Freighter')).toBeInTheDocument();
    expect(screen.getByText(mockAddress)).toBeInTheDocument();
  });
});
