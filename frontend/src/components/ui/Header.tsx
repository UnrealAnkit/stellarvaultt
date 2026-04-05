'use client';

import { WalletButton } from '@/components/wallet/WalletButton';
import { NetworkBadge } from '@/components/ui/NetworkBadge';

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-vault-border bg-vault-black/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-6 lg:px-8">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-vault-gold/10 border border-vault-gold/30">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
                stroke="#c9a84c"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div>
            <span
              className="text-lg font-semibold leading-none text-gold-gradient"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Reward Vault
            </span>
            <p className="text-[10px] text-vault-text-dim tracking-widest uppercase leading-none mt-0.5">
              Stellar Journey · Green Belt
            </p>
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-3">
          <NetworkBadge />
          <WalletButton />
        </div>
      </div>
    </header>
  );
}
