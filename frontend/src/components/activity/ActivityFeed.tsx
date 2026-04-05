'use client';

import { useClaimEvents, useClaimHistory } from '@/hooks/useVault';
import { formatTokenAmount, shortenAddress } from '@/lib/constants';
import { Skeleton } from '@/components/ui/Skeleton';
import { formatDistanceToNow } from 'date-fns';
import type { ClaimActivity } from '@/types';

function ActivityRow({ item, index }: { item: ClaimActivity; index: number }) {
  const timeAgo = formatDistanceToNow(new Date(item.timestamp), { addSuffix: true });
  return (
    <div
      className="activity-item flex items-center gap-3 rounded-xl border border-vault-border/50 bg-vault-surface/50 px-3 py-2.5"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      {/* Icon */}
      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border border-vault-gold/20 bg-vault-gold/10">
        <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4 text-vault-gold" stroke="currentColor" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 2v12M4 6l4-4 4 4" />
        </svg>
      </div>

      {/* Address + time */}
      <div className="flex-1 min-w-0">
        <p className="truncate font-mono text-xs text-vault-text">
          {shortenAddress(item.address, 6)}
        </p>
        <p className="text-[10px] text-vault-muted">{timeAgo}</p>
      </div>

      {/* Amount */}
      <div className="text-right flex-shrink-0">
        <p className="text-xs font-semibold text-vault-gold">
          +{formatTokenAmount(item.amount)} SRT
        </p>
      </div>
    </div>
  );
}

function AddressRow({ address, index }: { address: string; index: number }) {
  return (
    <div
      className="activity-item flex items-center gap-3 rounded-xl border border-vault-border/50 bg-vault-surface/50 px-3 py-2.5"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border border-vault-green/20 bg-vault-green/10">
        <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4 text-vault-green" stroke="currentColor" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l3.5 3.5L13 5" />
        </svg>
      </div>
      <p className="flex-1 truncate font-mono text-xs text-vault-text">
        {shortenAddress(address, 8)}
      </p>
      <span className="flex-shrink-0 rounded-full border border-vault-green/20 bg-vault-green/10 px-2 py-0.5 text-[10px] text-vault-green">
        Claimed
      </span>
    </div>
  );
}

export function ActivityFeed() {
  const { data: events, isLoading: eventsLoading, dataUpdatedAt } = useClaimEvents();
  const { data: history, isLoading: historyLoading } = useClaimHistory();

  const hasEvents = events && events.length > 0;
  const hasHistory = history && history.length > 0;
  const showEmpty = !eventsLoading && !historyLoading && !hasEvents && !hasHistory;

  return (
    <div className="card-glow rounded-2xl border border-vault-border bg-vault-card p-6">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3
            className="text-lg font-semibold text-vault-text"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Recent Activity
          </h3>
          <p className="text-[11px] text-vault-muted">
            Live reward claim events
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-vault-green live-dot" />
          <span className="text-[10px] uppercase tracking-widest text-vault-green">Live</span>
        </div>
      </div>

      {/* Event-based activity */}
      {eventsLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : hasEvents ? (
        <div className="space-y-2">
          {events!.slice(0, 10).map((item, i) => (
            <ActivityRow key={item.txHash ?? `${item.address}-${i}`} item={item} index={i} />
          ))}
        </div>
      ) : hasHistory ? (
        /* Fallback: on-chain address vec */
        <div className="space-y-2">
          {history!.slice(0, 10).map((addr, i) => (
            <AddressRow key={`${addr}-${i}`} address={addr} index={i} />
          ))}
        </div>
      ) : showEmpty ? (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl border border-vault-border bg-vault-surface">
            <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6 text-vault-muted" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" />
            </svg>
          </div>
          <p className="text-sm text-vault-text-dim">No claims yet</p>
          <p className="mt-1 text-xs text-vault-muted">Be the first to claim!</p>
        </div>
      ) : null}

      {/* Last updated */}
      {dataUpdatedAt > 0 && (
        <p className="mt-3 text-center text-[10px] text-vault-muted">
          Updated {formatDistanceToNow(new Date(dataUpdatedAt), { addSuffix: true })}
        </p>
      )}
    </div>
  );
}
