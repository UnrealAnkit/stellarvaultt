import { TOKEN_CONTRACT_ID, VAULT_CONTRACT_ID, NETWORK, RPC_URL, HORIZON_URL } from '@/lib/constants';

const InfoRow = ({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) => (
  <div className="flex items-start justify-between gap-4 border-b border-vault-border/50 pb-3 last:border-b-0 last:pb-0">
    <span className="flex-shrink-0 text-[11px] uppercase tracking-wider text-vault-muted">{label}</span>
    <span className={`text-right text-[11px] text-vault-text-dim break-all ${mono ? 'font-mono' : ''}`}>
      {value || '—'}
    </span>
  </div>
);

export function ContractInfoSection() {
  return (
    <div className="card-glow rounded-2xl border border-vault-border bg-vault-card p-6">
      <h3
        className="mb-4 text-lg font-semibold text-vault-text"
        style={{ fontFamily: 'var(--font-display)' }}
      >
        Contract Info
      </h3>

      <div className="space-y-3">
        <InfoRow label="Network" value={NETWORK.toUpperCase()} />
        <InfoRow label="Token Contract" value={TOKEN_CONTRACT_ID || 'Not set'} mono />
        <InfoRow label="Vault Contract" value={VAULT_CONTRACT_ID || 'Not set'} mono />
        <InfoRow label="RPC URL" value={RPC_URL} />
      </div>

      {/* Links */}
      <div className="mt-4 flex flex-wrap gap-2">
        <a
          href={`${HORIZON_URL}`}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-lg border border-vault-border bg-vault-surface px-3 py-1.5 text-[11px] text-vault-text-dim transition-colors hover:border-vault-gold/30 hover:text-vault-gold"
        >
          Horizon ↗
        </a>
        {VAULT_CONTRACT_ID && (
          <a
            href={`https://stellar.expert/explorer/testnet/contract/${VAULT_CONTRACT_ID}`}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg border border-vault-border bg-vault-surface px-3 py-1.5 text-[11px] text-vault-text-dim transition-colors hover:border-vault-gold/30 hover:text-vault-gold"
          >
            View Vault ↗
          </a>
        )}
        {TOKEN_CONTRACT_ID && (
          <a
            href={`https://stellar.expert/explorer/testnet/contract/${TOKEN_CONTRACT_ID}`}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg border border-vault-border bg-vault-surface px-3 py-1.5 text-[11px] text-vault-text-dim transition-colors hover:border-vault-gold/30 hover:text-vault-gold"
          >
            View Token ↗
          </a>
        )}
      </div>

      {/* Architecture note */}
      <div className="mt-4 rounded-xl border border-vault-border/50 bg-vault-surface/50 p-3">
        <p className="text-[10px] uppercase tracking-wider text-vault-muted mb-1.5">Architecture</p>
        <div className="flex items-center gap-2 text-[11px] text-vault-text-dim">
          <span className="rounded border border-vault-border px-1.5 py-0.5 font-mono">User</span>
          <span className="text-vault-muted">→</span>
          <span className="rounded border border-vault-gold/30 px-1.5 py-0.5 font-mono text-vault-gold/80">Vault</span>
          <span className="text-vault-muted">→</span>
          <span className="rounded border border-vault-border px-1.5 py-0.5 font-mono">Token</span>
          <span className="text-vault-muted">→</span>
          <span className="rounded border border-vault-border px-1.5 py-0.5 font-mono">User</span>
        </div>
        <p className="mt-1.5 text-[10px] text-vault-muted">
          Inter-contract call: vault.claim() → token.transfer_from()
        </p>
      </div>
    </div>
  );
}
