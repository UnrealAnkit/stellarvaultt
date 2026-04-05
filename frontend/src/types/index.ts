// Wallet & Connection
export interface WalletState {
  isConnected: boolean;
  address: string | null;
  name: string | null;
  icon: string | null;
}

// Transaction States
export type TxStatus = 'idle' | 'preparing' | 'pending' | 'success' | 'failed';

export interface TxState {
  status: TxStatus;
  hash: string | null;
  error: string | null;
}

// Campaign Info
export interface CampaignInfo {
  name: string;
  admin: string;
  tokenContract: string;
  rewardAmount: string; // raw i128 as string
  totalClaims: number;
  isActive: boolean;
}

// Claim Activity
export interface ClaimActivity {
  address: string;
  timestamp: number; // unix ms
  amount: string;
  txHash?: string;
}

// Contract Config
export interface ContractConfig {
  tokenContractId: string;
  vaultContractId: string;
  networkPassphrase: string;
  rpcUrl: string;
}

// Error Types
export type AppError =
  | 'WALLET_NOT_FOUND'
  | 'USER_REJECTED'
  | 'ALREADY_CLAIMED'
  | 'CAMPAIGN_INACTIVE'
  | 'TX_FAILED'
  | 'CONTRACT_NOT_INITIALIZED'
  | 'NETWORK_ERROR'
  | 'UNKNOWN';

export interface AppErrorInfo {
  code: AppError;
  message: string;
  detail?: string;
}
