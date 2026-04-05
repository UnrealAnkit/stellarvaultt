'use client';

import {
  StellarWalletsKit,
  WalletNetwork,
  FREIGHTER_ID,
  ALBEDO_ID,
  XBULL_ID,
  allowAllModules,
} from '@creit.tech/stellar-wallets-kit';
import { NETWORK_PASSPHRASE, RPC_URL } from './constants';

let kit: StellarWalletsKit | null = null;

export function getWalletKit(): StellarWalletsKit {
  if (!kit) {
    kit = new StellarWalletsKit({
      network:
        process.env.NEXT_PUBLIC_STELLAR_NETWORK === 'mainnet'
          ? WalletNetwork.PUBLIC
          : WalletNetwork.TESTNET,
      selectedWalletId: FREIGHTER_ID,
      modules: allowAllModules(),
    });
  }
  return kit;
}

export async function connectWallet(): Promise<{ address: string; name: string; icon: string }> {
  const walletKit = getWalletKit();

  return new Promise((resolve, reject) => {
    walletKit.openModal({
      onWalletSelected: async (option) => {
        try {
          walletKit.setWallet(option.id);
          const { address } = await walletKit.getAddress();
          resolve({
            address,
            name: option.name,
            icon: option.icon,
          });
        } catch (err) {
          reject(err);
        }
      },
      onClosed: () => {
        reject({ code: 'USER_REJECTED', message: 'Wallet modal closed.' });
      },
    });
  });
}

export async function disconnectWallet(): Promise<void> {
  kit = null;
}

export async function signTransaction(xdr: string, address: string): Promise<string> {
  const walletKit = getWalletKit();
  const { signedTxXdr } = await walletKit.signTransaction(xdr, {
    address,
    networkPassphrase: NETWORK_PASSPHRASE,
  });
  return signedTxXdr;
}

export async function getWalletAddress(): Promise<string | null> {
  try {
    const walletKit = getWalletKit();
    const { address } = await walletKit.getAddress();
    return address;
  } catch {
    return null;
  }
}
