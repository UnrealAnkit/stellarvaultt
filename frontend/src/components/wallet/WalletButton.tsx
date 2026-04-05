'use client';

import { useWallet } from '@/hooks/useWallet';
import { shortenAddress } from '@/lib/constants';
import { cn } from '@/lib/utils';

export function WalletButton() {
  const { isConnected, address, name, connect, disconnect, isConnecting } = useWallet();

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-2">
        <div className="hidden items-center gap-2 rounded-xl border border-vault-border bg-vault-surface px-3 py-2 sm:flex">
          <span className="h-2 w-2 rounded-full bg-vault-green live-dot" />
          <span className="text-xs font-mono text-vault-text-dim">{name}</span>
          <span className="address-pill text-[11px]">{shortenAddress(address, 5)}</span>
        </div>
        <button
          onClick={disconnect}
          className="rounded-xl border border-vault-border bg-vault-surface px-3 py-2 text-xs text-vault-text-dim transition-colors hover:border-vault-red/50 hover:text-vault-red"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={connect}
      disabled={isConnecting}
      className={cn(
        'btn-gold relative rounded-xl px-5 py-2.5 text-sm font-semibold tracking-wide transition-all',
        isConnecting && 'animate-pulse',
      )}
    >
      <span className="relative z-10">
        {isConnecting ? 'Connecting…' : 'Connect Wallet'}
      </span>
    </button>
  );
}
