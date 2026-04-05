import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
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
  });

  it('shows connect error when present', () => {
    vi.spyOn(useWalletModule, 'useWallet').mockReturnValue({
      isConnected: false,
      address: null,
      name: null,
      icon: null,
      connect: vi.fn(),
      disconnect: vi.fn(),
      isConnecting: false,
      connectError: 'Wallet not found',
    });

    render(<WalletSection />, { wrapper: createWrapper() });
    expect(screen.getByText('Wallet not found')).toBeInTheDocument();
  });

  it('shows wallet address when connected', () => {
    const testAddress = 'GAAZI4TCR3TY5OJHCTJC2A4QSY6CJWJH5IAJTGKIN2ER7LBNVKOCCWN';
    vi.spyOn(useWalletModule, 'useWallet').mockReturnValue({
      isConnected: true,
      address: testAddress,
      name: 'Freighter',
      icon: null,
      connect: vi.fn(),
      disconnect: vi.fn(),
      isConnecting: false,
      connectError: null,
    });

    render(<WalletSection />, { wrapper: createWrapper() });
    expect(screen.getByText(testAddress)).toBeInTheDocument();
    expect(screen.getByText('Wallet Address')).toBeInTheDocument();
  });

  it('calls connect when button is clicked', async () => {
    const connect = vi.fn();
    vi.spyOn(useWalletModule, 'useWallet').mockReturnValue({
      isConnected: false,
      address: null,
      name: null,
      icon: null,
      connect,
      disconnect: vi.fn(),
      isConnecting: false,
      connectError: null,
    });

    render(<WalletSection />, { wrapper: createWrapper() });
    fireEvent.click(screen.getByRole('button', { name: /connect wallet/i }));
    await waitFor(() => expect(connect).toHaveBeenCalledOnce());
  });
});
