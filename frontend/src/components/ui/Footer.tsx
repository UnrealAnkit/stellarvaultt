import { VAULT_CONTRACT_ID, TOKEN_CONTRACT_ID, NETWORK } from '@/lib/constants';
import { shortenAddress } from '@/lib/constants';

export function Footer() {
  return (
    <footer className="mt-16 border-t border-vault-border bg-vault-black/60 px-4 py-8 md:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col items-center gap-4 text-center md:flex-row md:justify-between md:text-left">
          <div>
            <p
              className="text-sm font-medium text-vault-gold"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Stellar Reward Vault
            </p>
            <p className="mt-0.5 text-xs text-vault-text-dim">
              Green Belt Submission · Stellar Journey to Mastery
            </p>
          </div>

          <div className="flex flex-col gap-1 text-xs text-vault-text-dim font-mono">
            <span>
              <span className="text-vault-muted">Token: </span>
              <span className="text-vault-gold/70">
                {TOKEN_CONTRACT_ID ? shortenAddress(TOKEN_CONTRACT_ID, 8) : 'Not deployed'}
              </span>
            </span>
            <span>
              <span className="text-vault-muted">Vault: </span>
              <span className="text-vault-gold/70">
                {VAULT_CONTRACT_ID ? shortenAddress(VAULT_CONTRACT_ID, 8) : 'Not deployed'}
              </span>
            </span>
            <span>
              <span className="text-vault-muted">Network: </span>
              <span className="text-vault-green capitalize">{NETWORK}</span>
            </span>
          </div>
        </div>

        <div className="mt-6 border-t border-vault-border/50 pt-4 text-center text-[11px] text-vault-muted">
          Built on Stellar · Powered by Soroban Smart Contracts
        </div>
      </div>
    </footer>
  );
}
