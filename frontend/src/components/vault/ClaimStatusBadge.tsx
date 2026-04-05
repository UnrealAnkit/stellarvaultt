import type { TxStatus } from '@/types';

interface ClaimStatusBadgeProps {
  hasClaimed: boolean | undefined;
  txStatus: TxStatus;
  isLoading?: boolean;
}

export function ClaimStatusBadge({ hasClaimed, txStatus, isLoading }: ClaimStatusBadgeProps) {
  if (isLoading) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-vault-border bg-vault-surface px-3 py-1 text-xs text-vault-muted">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-vault-muted" />
        Checking…
      </span>
    );
  }

  if (txStatus === 'preparing' || txStatus === 'pending') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-yellow-500/30 bg-yellow-500/10 px-3 py-1 text-xs text-yellow-400">
        <span className="h-1.5 w-1.5 animate-ping rounded-full bg-yellow-400" />
        {txStatus === 'preparing' ? 'Preparing…' : 'Pending…'}
      </span>
    );
  }

  if (txStatus === 'success' || hasClaimed) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-vault-green/30 bg-vault-green/10 px-3 py-1 text-xs text-vault-green">
        <svg viewBox="0 0 16 16" fill="none" className="h-3 w-3" xmlns="http://www.w3.org/2000/svg">
          <path d="M3 8l3.5 3.5L13 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Claimed
      </span>
    );
  }

  if (txStatus === 'failed') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-vault-red/30 bg-vault-red/10 px-3 py-1 text-xs text-vault-red">
        <svg viewBox="0 0 16 16" fill="none" className="h-3 w-3" xmlns="http://www.w3.org/2000/svg">
          <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
        Failed
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-vault-border bg-vault-surface px-3 py-1 text-xs text-vault-text-dim">
      <span className="h-1.5 w-1.5 rounded-full bg-vault-gold/60" />
      Eligible
    </span>
  );
}
