'use client';

import { cn } from '@/lib/utils';
import type { TxState } from '@/types';
import { HORIZON_URL } from '@/lib/constants';

interface TxStatusPanelProps {
  txState: TxState;
  onReset: () => void;
}

const STATUS_CONFIG = {
  idle: null,
  preparing: {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 animate-spin" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
      </svg>
    ),
    color: 'border-yellow-500/30 bg-yellow-500/5',
    titleColor: 'text-yellow-400',
    title: 'Preparing Transaction',
    subtitle: 'Building and simulating your claim transaction…',
  },
  pending: {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 animate-spin" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
      </svg>
    ),
    color: 'border-blue-500/30 bg-blue-500/5',
    titleColor: 'text-blue-400',
    title: 'Transaction Submitted',
    subtitle: 'Waiting for Stellar network confirmation…',
  },
  success: {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    color: 'border-vault-green/30 bg-vault-green/5',
    titleColor: 'text-vault-green',
    title: 'Reward Claimed!',
    subtitle: 'Your SRT tokens have been transferred to your wallet.',
  },
  failed: {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
      </svg>
    ),
    color: 'border-vault-red/30 bg-vault-red/5',
    titleColor: 'text-vault-red',
    title: 'Transaction Failed',
    subtitle: '',
  },
} as const;

export function TxStatusPanel({ txState, onReset }: TxStatusPanelProps) {
  if (txState.status === 'idle') return null;

  const config = STATUS_CONFIG[txState.status];
  if (!config) return null;

  return (
    <div
      className={cn(
        'animate-scale-in rounded-2xl border p-4',
        config.color,
      )}
    >
      <div className="flex items-start gap-3">
        <div className={cn('mt-0.5 flex-shrink-0', config.titleColor)}>
          {config.icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className={cn('text-sm font-semibold', config.titleColor)}>
            {config.title}
          </p>
          <p className="mt-0.5 text-xs text-vault-text-dim">
            {txState.status === 'failed' ? txState.error : config.subtitle}
          </p>

          {/* TX Hash */}
          {txState.hash && (
            <div className="mt-2 flex items-center gap-2">
              <span className="font-mono text-[11px] text-vault-muted truncate">
                {txState.hash.slice(0, 20)}…{txState.hash.slice(-8)}
              </span>
              <a
                href={`${HORIZON_URL}/transactions/${txState.hash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-shrink-0 text-[11px] text-vault-gold underline underline-offset-2 hover:text-vault-gold-light"
              >
                View ↗
              </a>
            </div>
          )}
        </div>

        {/* Reset button */}
        {(txState.status === 'success' || txState.status === 'failed') && (
          <button
            onClick={onReset}
            className="flex-shrink-0 rounded-lg border border-vault-border bg-vault-surface px-2 py-1 text-[11px] text-vault-text-dim transition-colors hover:border-vault-border/70"
          >
            Dismiss
          </button>
        )}
      </div>
    </div>
  );
}
