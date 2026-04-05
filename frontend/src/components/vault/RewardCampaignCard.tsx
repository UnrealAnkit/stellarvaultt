'use client';

import { useCampaignInfo, useHasClaimed, useClaimReward } from '@/hooks/useVault';
import { useWallet } from '@/hooks/useWallet';
import { formatTokenAmount, TOKEN_CONTRACT_ID, VAULT_CONTRACT_ID, shortenAddress } from '@/lib/constants';
import { ClaimStatusBadge } from './ClaimStatusBadge';
import { TxStatusPanel } from './TxStatusPanel';
import { Skeleton } from '@/components/ui/Skeleton';
import { cn } from '@/lib/utils';

export function RewardCampaignCard() {
  const { isConnected, address } = useWallet();
  const { data: campaign, isLoading: campaignLoading } = useCampaignInfo();
  const { data: hasClaimed, isLoading: claimLoading } = useHasClaimed(address);
  const { claim, txState, reset, isLoading: claiming } = useClaimReward(address);

  const canClaim =
    isConnected &&
    !hasClaimed &&
    campaign?.isActive &&
    !claiming &&
    txState.status !== 'success';

  const contractsMissing = !TOKEN_CONTRACT_ID || !VAULT_CONTRACT_ID;

  return (
    <div className="card-glow-gold relative overflow-hidden rounded-2xl border border-vault-gold/20 bg-vault-card">
      {/* Top accent line */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-vault-gold/50 to-transparent" />

      <div className="p-6">
        {/* Header */}
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              {campaignLoading ? (
                <Skeleton className="h-4 w-20" />
              ) : (
                campaign?.isActive && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-vault-green/30 bg-vault-green/10 px-2 py-0.5 text-[11px] font-medium text-vault-green">
                    <span className="h-1.5 w-1.5 rounded-full bg-vault-green live-dot" />
                    Active
                  </span>
                )
              )}
              <ClaimStatusBadge
                hasClaimed={hasClaimed}
                txStatus={txState.status}
                isLoading={claimLoading && isConnected}
              />
            </div>
            <h2
              className="text-2xl font-bold text-vault-text"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {campaignLoading ? (
                <Skeleton className="h-7 w-48" />
              ) : (
                campaign?.name ?? 'Reward Campaign'
              )}
            </h2>
          </div>
        </div>

        {/* Reward amount */}
        <div className="mb-5 rounded-xl border border-vault-gold/10 bg-gradient-to-br from-vault-gold/5 to-transparent p-4">
          <p className="mb-1 text-[11px] uppercase tracking-widest text-vault-muted">
            Reward Per Wallet
          </p>
          {campaignLoading ? (
            <Skeleton className="h-10 w-36" />
          ) : (
            <div className="flex items-baseline gap-2">
              <span
                className="text-4xl font-bold text-gold-gradient"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                {formatTokenAmount(campaign?.rewardAmount ?? '0')}
              </span>
              <span className="text-sm font-medium text-vault-muted">SRT</span>
            </div>
          )}
          <p className="mt-1 text-[11px] text-vault-muted">
            Stellar Reward Token · 7 decimal places
          </p>
        </div>

        {/* Stats row */}
        <div className="mb-5 grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-vault-border bg-vault-surface px-4 py-3">
            <p className="text-[10px] uppercase tracking-widest text-vault-muted">Total Claims</p>
            {campaignLoading ? (
              <div className="mt-1"><Skeleton className="h-6 w-16" /></div>
            ) : (
              <p className="mt-1 text-xl font-bold text-vault-text font-mono">
                {campaign?.totalClaims ?? 0}
              </p>
            )}
          </div>
          <div className="rounded-xl border border-vault-border bg-vault-surface px-4 py-3">
            <p className="text-[10px] uppercase tracking-widest text-vault-muted">Status</p>
            <div className={cn(
              'mt-1 text-xl font-bold',
              campaign?.isActive ? 'text-vault-green' : 'text-vault-muted'
            )}>
              {campaignLoading ? <Skeleton className="h-6 w-16" /> : (campaign?.isActive ? 'Open' : 'Paused')}
            </div>
          </div>
        </div>

        {/* Contract addresses */}
        {!contractsMissing && (
          <div className="mb-5 space-y-1.5">
            <div className="flex items-center justify-between rounded-lg border border-vault-border/50 bg-vault-surface/50 px-3 py-2">
              <span className="text-[10px] uppercase tracking-wider text-vault-muted">Vault</span>
              <span className="font-mono text-[11px] text-vault-text-dim">{shortenAddress(VAULT_CONTRACT_ID, 8)}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-vault-border/50 bg-vault-surface/50 px-3 py-2">
              <span className="text-[10px] uppercase tracking-wider text-vault-muted">Token</span>
              <span className="font-mono text-[11px] text-vault-text-dim">{shortenAddress(TOKEN_CONTRACT_ID, 8)}</span>
            </div>
          </div>
        )}

        {/* Contracts not configured warning */}
        {contractsMissing && (
          <div className="mb-5 rounded-xl border border-yellow-500/30 bg-yellow-500/5 px-4 py-3">
            <p className="text-xs font-medium text-yellow-400">⚠ Contracts Not Configured</p>
            <p className="mt-0.5 text-[11px] text-vault-text-dim">
              Set <code className="font-mono">NEXT_PUBLIC_TOKEN_CONTRACT_ID</code> and{' '}
              <code className="font-mono">NEXT_PUBLIC_VAULT_CONTRACT_ID</code> in your{' '}
              <code className="font-mono">.env.local</code> file.
            </p>
          </div>
        )}

        {/* TX Status Panel */}
        {txState.status !== 'idle' && (
          <div className="mb-4">
            <TxStatusPanel txState={txState} onReset={reset} />
          </div>
        )}

        {/* Already claimed message */}
        {hasClaimed && txState.status === 'idle' && (
          <div className="mb-4 rounded-xl border border-vault-green/20 bg-vault-green/5 px-4 py-3 text-center">
            <p className="text-sm font-medium text-vault-green">✓ You&apos;ve already claimed your reward</p>
            <p className="mt-0.5 text-xs text-vault-text-dim">
              Each wallet can only claim once. Thank you for participating!
            </p>
          </div>
        )}

        {/* Claim button */}
        {!hasClaimed && txState.status !== 'success' && (
          <>
            {!isConnected ? (
              <div className="rounded-xl border border-vault-border bg-vault-surface/50 py-3 text-center text-sm text-vault-text-dim">
                Connect wallet to claim
              </div>
            ) : (
              <button
                onClick={() => claim()}
                disabled={!canClaim || contractsMissing}
                className={cn(
                  'btn-gold w-full rounded-xl py-3.5 text-sm font-bold tracking-wide',
                  (claiming || txState.status === 'preparing' || txState.status === 'pending') &&
                    'animate-pulse',
                )}
              >
                <span className="relative z-10">
                  {txState.status === 'preparing'
                    ? 'Preparing…'
                    : txState.status === 'pending'
                    ? 'Confirming…'
                    : 'Claim Reward'}
                </span>
              </button>
            )}
          </>
        )}

        {/* Inter-contract info badge */}
        <div className="mt-4 flex items-center gap-2 rounded-lg border border-vault-border/40 bg-vault-surface/30 px-3 py-2">
          <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5 flex-shrink-0 text-vault-gold/60" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" d="M2 8h3m6 0h3M5 8a3 3 0 106 0 3 3 0 00-6 0z" />
          </svg>
          <p className="text-[10px] text-vault-muted">
            Vault triggers inter-contract call → Token contract transfers SRT to your wallet
          </p>
        </div>
      </div>
    </div>
  );
}
