import {
  Contract,
  rpc,
  TransactionBuilder,
  BASE_FEE,
  xdr,
  scValToNative,
  nativeToScVal,
} from '@stellar/stellar-sdk';
import {
  RPC_URL,
  NETWORK_PASSPHRASE,
  TOKEN_CONTRACT_ID,
  VAULT_CONTRACT_ID,
} from './constants';
import type { CampaignInfo, AppErrorInfo } from '@/types';

// ── RPC Client ────────────────────────────────────────────────────────────────

export function getRpcServer(): rpc.Server {
  return new rpc.Server(RPC_URL, { allowHttp: RPC_URL.startsWith('http://') });
}

// ── Contract Helpers ──────────────────────────────────────────────────────────

export async function buildContractCall(
  contractId: string,
  method: string,
  args: xdr.ScVal[],
  sourceAddress: string,
): Promise<string> {
  const server = getRpcServer();
  const contract = new Contract(contractId);
  const account = await server.getAccount(sourceAddress);

  const tx = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(contract.call(method, ...args))
    .setTimeout(300)
    .build();

  const simResult = await server.simulateTransaction(tx);
  if (rpc.Api.isSimulationError(simResult)) {
    throw parseContractError(simResult.error);
  }

  const preparedTx = rpc.assembleTransaction(tx, simResult).build();
  return preparedTx.toXDR();
}

// ── Submit & Poll ─────────────────────────────────────────────────────────────

export async function submitAndPoll(signedXdr: string): Promise<string> {
  const server = getRpcServer();
  const sendResult = await server.sendTransaction(
    TransactionBuilder.fromXDR(signedXdr, NETWORK_PASSPHRASE),
  );

  if (sendResult.status === 'ERROR') {
    throw parseContractError(JSON.stringify(sendResult.errorResult));
  }

  const hash = sendResult.hash;
  let attempts = 0;
  const maxAttempts = 30;

  while (attempts < maxAttempts) {
    await sleep(2000);
    const result = await server.getTransaction(hash);
    if (result.status === rpc.Api.GetTransactionStatus.SUCCESS) {
      return hash;
    }
    if (result.status === rpc.Api.GetTransactionStatus.FAILED) {
      throw parseContractError(JSON.stringify(result));
    }
    attempts++;
  }

  throw { code: 'TX_FAILED', message: 'Transaction timed out' } as AppErrorInfo;
}

// ── Read-only Contract Calls ──────────────────────────────────────────────────

async function simulateReadOnly(
  contractId: string,
  method: string,
  args: xdr.ScVal[],
  sourceAddress?: string,
): Promise<xdr.ScVal | null> {
  const server = getRpcServer();
  // Use a known funded account (vault-admin) as dummy for reads if none provided
  const dummySource =
    sourceAddress || 'GDONOITLATIGUGOY2LE34HA7G5HSGTH2ELDUM3VZX7PDD2FLV6QOTTTJ';

  const account = await server.getAccount(dummySource);
  const contract = new Contract(contractId);
  const tx = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(contract.call(method, ...args))
    .setTimeout(30)
    .build();

  const simResult = await server.simulateTransaction(tx);
  if (rpc.Api.isSimulationError(simResult)) {
    return null;
  }
  const successSim = simResult as rpc.Api.SimulateTransactionSuccessResponse;
  return successSim.result?.retval ?? null;
}

// ── Token Contract Reads ──────────────────────────────────────────────────────

export async function getTokenBalance(userAddress: string): Promise<string> {
  try {
    const scAddr = nativeToScVal(userAddress, { type: 'address' });
    const result = await simulateReadOnly(TOKEN_CONTRACT_ID, 'balance', [scAddr], userAddress);
    if (!result) return '0';
    return scValToNative(result).toString();
  } catch {
    return '0';
  }
}

// ── Vault Contract Reads ──────────────────────────────────────────────────────

export async function getHasClaimed(userAddress: string): Promise<boolean> {
  try {
    const scAddr = nativeToScVal(userAddress, { type: 'address' });
    const result = await simulateReadOnly(VAULT_CONTRACT_ID, 'has_claimed', [scAddr], userAddress);
    if (!result) return false;
    return scValToNative(result) as boolean;
  } catch {
    return false;
  }
}

export async function getCampaignInfo(): Promise<CampaignInfo | null> {
  try {
    // Use Stellar's well-known testnet account as dummy for reads
    const result = await simulateReadOnly(
      VAULT_CONTRACT_ID,
      'get_campaign_info',
      [],
    );
    if (!result) return null;
    const native = scValToNative(result) as Record<string, unknown>;
    return {
      name: String(native.name ?? ''),
      admin: String(native.admin ?? ''),
      tokenContract: String(native.token_contract ?? ''),
      rewardAmount: String(native.reward_amount ?? '0'),
      totalClaims: Number(native.total_claims ?? 0),
      isActive: Boolean(native.is_active ?? false),
    };
  } catch {
    return null;
  }
}

export async function getClaimHistory(): Promise<string[]> {
  try {
    const result = await simulateReadOnly(VAULT_CONTRACT_ID, 'get_claim_history', []);
    if (!result) return [];
    const native = scValToNative(result) as string[];
    return native.map(String);
  } catch {
    return [];
  }
}

export async function getTotalClaims(): Promise<number> {
  try {
    const result = await simulateReadOnly(VAULT_CONTRACT_ID, 'get_total_claims', []);
    if (!result) return 0;
    return Number(scValToNative(result));
  } catch {
    return 0;
  }
}

// ── Claim Transaction ─────────────────────────────────────────────────────────

export async function buildClaimTx(userAddress: string): Promise<string> {
  const scAddr = nativeToScVal(userAddress, { type: 'address' });
  return buildContractCall(VAULT_CONTRACT_ID, 'claim', [scAddr], userAddress);
}

// ── Error Parsing ─────────────────────────────────────────────────────────────

export function parseContractError(raw: string): AppErrorInfo {
  const s = (raw ?? '').toLowerCase();

  if (s.includes('already claimed') || s.includes('already_claimed')) {
    return { code: 'ALREADY_CLAIMED', message: 'You have already claimed your reward.' };
  }
  if (s.includes('campaign is not active') || s.includes('campaign_inactive')) {
    return { code: 'CAMPAIGN_INACTIVE', message: 'The campaign is not currently active.' };
  }
  if (s.includes('not initialized')) {
    return { code: 'CONTRACT_NOT_INITIALIZED', message: 'Contract not yet initialized.' };
  }
  if (s.includes('user declined') || s.includes('rejected') || s.includes('cancel')) {
    return { code: 'USER_REJECTED', message: 'Transaction was rejected.' };
  }
  if (s.includes('network') || s.includes('fetch')) {
    return { code: 'NETWORK_ERROR', message: 'Network error. Please try again.' };
  }

  return { code: 'UNKNOWN', message: 'An unexpected error occurred.', detail: raw };
}

// ── Utils ─────────────────────────────────────────────────────────────────────

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
