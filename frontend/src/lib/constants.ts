import { Networks } from '@stellar/stellar-sdk';

export const NETWORK = process.env.NEXT_PUBLIC_STELLAR_NETWORK || 'testnet';

export const RPC_URL =
  process.env.NEXT_PUBLIC_STELLAR_RPC_URL ||
  'https://soroban-testnet.stellar.org';

export const NETWORK_PASSPHRASE =
  process.env.NEXT_PUBLIC_STELLAR_NETWORK_PASSPHRASE ||
  Networks.TESTNET;

export const HORIZON_URL =
  process.env.NEXT_PUBLIC_STELLAR_HORIZON_URL ||
  'https://horizon-testnet.stellar.org';

export const TOKEN_CONTRACT_ID =
  process.env.NEXT_PUBLIC_TOKEN_CONTRACT_ID || '';

export const VAULT_CONTRACT_ID =
  process.env.NEXT_PUBLIC_VAULT_CONTRACT_ID || '';

export const POLL_INTERVAL =
  Number(process.env.NEXT_PUBLIC_POLL_INTERVAL_MS) || 8000;

export const STROOPS_PER_TOKEN = 10_000_000; // 7 decimals

export function formatTokenAmount(raw: string | bigint | number): string {
  const num = BigInt(raw.toString());
  const whole = num / BigInt(STROOPS_PER_TOKEN);
  const frac = num % BigInt(STROOPS_PER_TOKEN);
  const fracStr = frac.toString().padStart(7, '0').replace(/0+$/, '');
  if (fracStr === '') return whole.toString();
  return `${whole}.${fracStr}`;
}

export function shortenAddress(addr: string, chars = 6): string {
  if (!addr || addr.length < chars * 2) return addr;
  return `${addr.slice(0, chars)}…${addr.slice(-chars)}`;
}
