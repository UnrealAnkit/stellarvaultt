import { xdr, scValToNative } from '@stellar/stellar-sdk';
import { getRpcServer } from './stellar';
import { VAULT_CONTRACT_ID } from './constants';
import type { ClaimActivity } from '@/types';

// ── Event Polling ──────────────────────────────────────────────────────────────
// Soroban events are polled via the RPC getEvents endpoint.

export interface RawVaultEvent {
  type: string;
  ledger: number;
  ledgerClosedAt: string;
  contractId: string;
  id: string;
  topic: xdr.ScVal[];
  value: xdr.ScVal;
}

let lastProcessedLedger: number | null = null;

export async function fetchClaimEvents(maxCount = 20): Promise<ClaimActivity[]> {
  const server = getRpcServer();

  try {
    const latestLedger = await server.getLatestLedger();
    const startLedger = Math.max(1, latestLedger.sequence - 17_280); // ~1 day of ledgers

    const result = await server.getEvents({
      startLedger,
      filters: [
        {
          type: 'contract',
          contractIds: [VAULT_CONTRACT_ID],
          topics: [['*', '*']], // match all topics
        },
      ],
      limit: maxCount,
    });

    const claims: ClaimActivity[] = [];

    for (const event of result.events) {
      try {
        const topics = event.topic.map((t) => scValToNative(t));
        // Our claim event has topic[0] = "claimed"
        if (String(topics[0]) !== 'claimed') continue;

        const value = scValToNative(event.value);
        // value is (user, reward_amount, total_claims)
        const [userAddr, amount] = Array.isArray(value) ? value : [null, null];

        if (!userAddr) continue;

        claims.push({
          address: String(userAddr),
          timestamp: new Date(event.ledgerClosedAt).getTime(),
          amount: String(amount ?? '0'),
          txHash: event.id,
        });
      } catch {
        // skip malformed events
      }
    }

    lastProcessedLedger = latestLedger.sequence;
    return claims.reverse(); // newest first
  } catch {
    return [];
  }
}

export function getLastProcessedLedger(): number | null {
  return lastProcessedLedger;
}
