import { StatsBar } from './StatsBar';
import { RewardCampaignCard } from './RewardCampaignCard';
import { ContractInfoSection } from './ContractInfoSection';
import { WalletSection } from '@/components/wallet/WalletSection';
import { ActivityFeed } from '@/components/activity/ActivityFeed';

export function Dashboard() {
  return (
    <div className="mx-auto max-w-7xl">
      {/* Hero text */}
      <div className="mb-8 text-center">
        <h1
          className="text-4xl font-bold text-gold-gradient md:text-5xl lg:text-6xl"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Stellar Reward Vault
        </h1>
        <p className="mt-3 text-base text-vault-text-dim md:text-lg">
          Connect your wallet and claim your{' '}
          <span className="text-vault-gold">SRT tokens</span> from the vault.
          <br className="hidden md:block" />
          Powered by Soroban inter-contract calls on the Stellar blockchain.
        </p>
      </div>

      {/* Stats bar */}
      <StatsBar />

      {/* Main grid */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Left column */}
        <div className="flex flex-col gap-4 lg:col-span-2">
          <RewardCampaignCard />
          <ActivityFeed />
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-4">
          <WalletSection />
          <ContractInfoSection />
        </div>
      </div>
    </div>
  );
}
