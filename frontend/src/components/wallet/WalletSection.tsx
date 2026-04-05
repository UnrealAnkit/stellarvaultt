'use client';

import { useWallet } from '@/hooks/useWallet';
import { useTokenBalance } from '@/hooks/useVault';
import { formatTokenAmount } from '@/lib/constants';
import { Skeleton } from '@/components/ui/Skeleton';
import { cn } from '@/lib/utils';

export function WalletSection() {
  const { isConnected, address, name, connect, isConnecting, connectError } = useWallet();
  const { data: balance, isLoading: balanceLoading } = useTokenBalance(address);

  if (!isConnected) {
    return (
      <div className="card-glow relative overflow-hidden rounded-2xl border border-vault-border bg-vault-card p-6 text-center">
        <div className="mb-4 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-vault-border bg-vault-surface">
            <svg viewBox="0 0 24 24" fill="none" className="h-8 w-8 text-vault-muted" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18-3a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m18 0V9" />
            </svg>
          </div>
        </div>
        <h3 className="mb-1 text-lg font-semibold text-vault-text" style={{ fontFamily: 'var(--font-display)' }}>
          Connect Your Wallet
        </h3>
        <p className="mb-5 text-sm text-vault-text-dim">
          Connect a Stellar wallet to check eligibility and claim your reward tokens.
        </p>

        {connectError && (
          <div className="mb-4 rounded-lg border border-vault-red/30 bg-vault-red/10 px-4 py-2.5 text-xs text-vault-red">
            {connectError}
          </div>
        )}

        <button
          onClick={connect}
          disabled={isConnecting}
          className={cn(
            'btn-gold w-full rounded-xl py-3 text-sm font-semibold',
            isConnecting && 'animate-pulse',
          )}
        >
          <span className="relative z-10">
            {isConnecting ? 'Opening wallet…' : 'Connect Wallet'}
          </span>
        </button>

        <p className="mt-3 text-[11px] text-vault-muted">
          Supports Freighter, Albedo, xBull, and more
        </p>
      </div>
    );
  }

  return (
    <div className="card-glow relative overflow-hidden rounded-2xl border border-vault-border bg-vault-card p-6">
      {/* Connected indicator */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-vault-green live-dot" />
          <span className="text-xs font-medium uppercase tracking-widest text-vault-green">
            Connected
          </span>
        </div>
        {name && (
          <span className="text-xs text-vault-text-dim">{name}</span>
        )}
      </div>

      {/* Address */}
      <div className="mb-4 rounded-xl border border-vault-border bg-vault-surface px-4 py-3">
        <p className="mb-1 text-[10px] uppercase tracking-widest text-vault-muted">
          Wallet Address
        </p>
        <p className="break-all font-mono text-xs text-vault-gold/90 leading-relaxed">
          {address}
        </p>
      </div>

      {/* SRT Balance */}
      <div className="rounded-xl border border-vault-gold/20 bg-vault-gold/5 px-4 py-3">
        <p className="mb-1 text-[10px] uppercase tracking-widest text-vault-muted">
          SRT Balance
        </p>
        {balanceLoading ? (
          <Skeleton className="h-7 w-32" />
        ) : (
          <div className="flex items-baseline gap-2">
            <span
              className="text-2xl font-bold text-gold-gradient"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {formatTokenAmount(balance ?? '0')}
            </span>
            <span className="text-xs text-vault-muted">SRT</span>
          </div>
        )}
      </div>
    </div>
  );
}
