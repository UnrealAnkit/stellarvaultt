import { NETWORK } from '@/lib/constants';

export function NetworkBadge() {
  const isTestnet = NETWORK === 'testnet';
  return (
    <div className="hidden items-center gap-1.5 rounded-full border border-vault-border bg-vault-surface px-3 py-1 sm:flex">
      <span
        className={`h-1.5 w-1.5 rounded-full live-dot ${
          isTestnet ? 'bg-vault-gold' : 'bg-vault-green'
        }`}
      />
      <span className="text-[11px] font-medium uppercase tracking-wider text-vault-text-dim">
        {NETWORK}
      </span>
    </div>
  );
}
