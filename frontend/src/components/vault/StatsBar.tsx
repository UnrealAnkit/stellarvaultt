'use client';

import { useCampaignInfo } from '@/hooks/useVault';
import { formatTokenAmount } from '@/lib/constants';
import { Skeleton } from '@/components/ui/Skeleton';

export function StatsBar() {
  const { data: campaign, isLoading } = useCampaignInfo();

  const stats = [
    {
      label: 'Total Claims',
      value: isLoading ? null : String(campaign?.totalClaims ?? 0),
      suffix: '',
    },
    {
      label: 'Reward Per Claim',
      value: isLoading ? null : formatTokenAmount(campaign?.rewardAmount ?? '0'),
      suffix: ' SRT',
    },
    {
      label: 'Campaign Status',
      value: isLoading ? null : (campaign?.isActive ? 'Active' : 'Paused'),
      suffix: '',
      highlight: campaign?.isActive,
    },
    {
      label: 'Network',
      value: 'Testnet',
      suffix: '',
    },
  ];

  return (
    <div className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="rounded-xl border border-vault-border bg-vault-card px-4 py-3"
        >
          <p className="text-[10px] uppercase tracking-widest text-vault-muted">{stat.label}</p>
          {stat.value === null ? (
            <div className="mt-1.5"><Skeleton className="h-5 w-16" /></div>
          ) : (
            <p
              className={`mt-1 text-lg font-bold ${
                'highlight' in stat && stat.highlight === true
                  ? 'text-vault-green'
                  : 'highlight' in stat && stat.highlight === false
                  ? 'text-vault-muted'
                  : 'text-vault-text'
              }`}
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {stat.value}
              {stat.suffix && (
                <span className="text-sm font-normal text-vault-muted">{stat.suffix}</span>
              )}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
