'use client';

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from 'react';
import {
  connectWallet as connectWalletLib,
  disconnectWallet as disconnectWalletLib,
} from '@/lib/wallet';
import type { WalletState } from '@/types';

interface WalletContextValue extends WalletState {
  connect: () => Promise<void>;
  disconnect: () => void;
  isConnecting: boolean;
  connectError: string | null;
}

const WalletContext = createContext<WalletContextValue | null>(null);

const STORAGE_KEY = 'srv_wallet';

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [walletState, setWalletState] = useState<WalletState>({
    isConnected: false,
    address: null,
    name: null,
    icon: null,
  });
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectError, setConnectError] = useState<string | null>(null);

  // Restore from sessionStorage
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as WalletState;
        if (parsed.address) setWalletState({ ...parsed, isConnected: true });
      }
    } catch {
      // ignore
    }
  }, []);

  const connect = useCallback(async () => {
    setIsConnecting(true);
    setConnectError(null);
    try {
      const { address, name, icon } = await connectWalletLib();
      const state: WalletState = { isConnected: true, address, name, icon };
      setWalletState(state);
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'message' in err
          ? String((err as { message: string }).message)
          : 'Failed to connect wallet';
      setConnectError(msg);
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    disconnectWalletLib();
    setWalletState({ isConnected: false, address: null, name: null, icon: null });
    sessionStorage.removeItem(STORAGE_KEY);
  }, []);

  return (
    <WalletContext.Provider
      value={{ ...walletState, connect, disconnect, isConnecting, connectError }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet(): WalletContextValue {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error('useWallet must be used within WalletProvider');
  return ctx;
}
