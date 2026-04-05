import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  usePathname: () => '/',
}));

// Mock stellar-wallets-kit
vi.mock('stellar-wallets-kit', () => ({
  StellarWalletsKit: vi.fn().mockImplementation(() => ({
    openModal: vi.fn(),
    setWallet: vi.fn(),
    getAddress: vi.fn().mockResolvedValue({ address: 'GTEST123' }),
    signTransaction: vi.fn().mockResolvedValue({ signedTxXdr: 'signed-xdr' }),
  })),
  WalletNetwork: { TESTNET: 'TESTNET', PUBLIC: 'PUBLIC' },
  FREIGHTER_ID: 'freighter',
  ALBEDO_ID: 'albedo',
  XBULL_ID: 'xbull',
  allowAllModules: vi.fn().mockReturnValue([]),
}));

// Mock @stellar/stellar-sdk SorobanRpc
vi.mock('@stellar/stellar-sdk', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@stellar/stellar-sdk')>();
  return {
    ...actual,
    SorobanRpc: {
      ...actual.SorobanRpc,
      Server: vi.fn().mockImplementation(() => ({
        getAccount: vi.fn().mockResolvedValue({ id: 'GTEST', sequence: '100' }),
        simulateTransaction: vi.fn().mockResolvedValue({
          result: { retval: null },
          minResourceFee: '100',
        }),
        sendTransaction: vi.fn().mockResolvedValue({ status: 'PENDING', hash: 'testhash123' }),
        getTransaction: vi.fn().mockResolvedValue({ status: 'SUCCESS' }),
        getLatestLedger: vi.fn().mockResolvedValue({ sequence: 100000 }),
        getEvents: vi.fn().mockResolvedValue({ events: [] }),
      })),
      Api: {
        ...actual.SorobanRpc?.Api,
        isSimulationError: vi.fn().mockReturnValue(false),
        GetTransactionStatus: { SUCCESS: 'SUCCESS', FAILED: 'FAILED', NOT_FOUND: 'NOT_FOUND' },
      },
      assembleTransaction: vi.fn().mockReturnValue({ build: vi.fn().mockReturnValue({ toXDR: vi.fn().mockReturnValue('unsigned-xdr') }) }),
    },
  };
});
