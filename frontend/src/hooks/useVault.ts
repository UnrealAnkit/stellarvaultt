'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getCampaignInfo,
  getHasClaimed,
  getTokenBalance,
  getClaimHistory,
  getTotalClaims,
  buildClaimTx,
  submitAndPoll,
} from '@/lib/stellar';
import { fetchClaimEvents } from '@/lib/events';
import { signTransaction } from '@/lib/wallet';
import { POLL_INTERVAL } from '@/lib/constants';
import { parseContractError } from '@/lib/stellar';
import type { TxState } from '@/types';
import { useState } from 'react';

// ── Query Keys ────────────────────────────────────────────────────────────────

export const queryKeys = {
  campaign: ['campaign'] as const,
  hasClaimed: (addr: string) => ['hasClaimed', addr] as const,
  balance: (addr: string) => ['balance', addr] as const,
  claimHistory: ['claimHistory'] as const,
  totalClaims: ['totalClaims'] as const,
  events: ['events'] as const,
};

// ── Campaign Info ─────────────────────────────────────────────────────────────

export function useCampaignInfo() {
  return useQuery({
    queryKey: queryKeys.campaign,
    queryFn: getCampaignInfo,
    staleTime: 30_000,
    refetchInterval: POLL_INTERVAL,
    retry: 3,
  });
}

// ── Has Claimed ───────────────────────────────────────────────────────────────

export function useHasClaimed(address: string | null) {
  return useQuery({
    queryKey: queryKeys.hasClaimed(address ?? ''),
    queryFn: () => getHasClaimed(address!),
    enabled: !!address,
    staleTime: 10_000,
    refetchInterval: POLL_INTERVAL,
  });
}

// ── Token Balance ─────────────────────────────────────────────────────────────

export function useTokenBalance(address: string | null) {
  return useQuery({
    queryKey: queryKeys.balance(address ?? ''),
    queryFn: () => getTokenBalance(address!),
    enabled: !!address,
    staleTime: 10_000,
    refetchInterval: POLL_INTERVAL,
  });
}

// ── Total Claims ──────────────────────────────────────────────────────────────

export function useTotalClaims() {
  return useQuery({
    queryKey: queryKeys.totalClaims,
    queryFn: getTotalClaims,
    staleTime: 15_000,
    refetchInterval: POLL_INTERVAL,
  });
}

// ── Claim Activity (events) ───────────────────────────────────────────────────

export function useClaimEvents() {
  return useQuery({
    queryKey: queryKeys.events,
    queryFn: () => fetchClaimEvents(20),
    staleTime: POLL_INTERVAL,
    refetchInterval: POLL_INTERVAL,
    retry: 2,
  });
}

// ── Claim History (on-chain vec) ──────────────────────────────────────────────

export function useClaimHistory() {
  return useQuery({
    queryKey: queryKeys.claimHistory,
    queryFn: getClaimHistory,
    staleTime: 15_000,
    refetchInterval: POLL_INTERVAL,
  });
}

// ── Claim Mutation ────────────────────────────────────────────────────────────

export function useClaimReward(address: string | null) {
  const queryClient = useQueryClient();
  const [txState, setTxState] = useState<TxState>({
    status: 'idle',
    hash: null,
    error: null,
  });

  const mutation = useMutation({
    mutationFn: async () => {
      if (!address) throw new Error('No wallet connected');

      setTxState({ status: 'preparing', hash: null, error: null });

      // Build unsigned transaction XDR
      const unsignedXdr = await buildClaimTx(address);

      setTxState({ status: 'pending', hash: null, error: null });

      // Sign with wallet
      let signedXdr: string;
      try {
        signedXdr = await signTransaction(unsignedXdr, address);
      } catch (err: unknown) {
        throw parseContractError(
          err && typeof err === 'object' && 'message' in err
            ? String((err as { message: string }).message)
            : 'rejected',
        );
      }

      // Submit and poll for confirmation
      const hash = await submitAndPoll(signedXdr);
      return hash;
    },

    onSuccess: (hash) => {
      setTxState({ status: 'success', hash, error: null });
      // Invalidate relevant queries after successful claim
      queryClient.invalidateQueries({ queryKey: queryKeys.hasClaimed(address ?? '') });
      queryClient.invalidateQueries({ queryKey: queryKeys.balance(address ?? '') });
      queryClient.invalidateQueries({ queryKey: queryKeys.totalClaims });
      queryClient.invalidateQueries({ queryKey: queryKeys.campaign });
      queryClient.invalidateQueries({ queryKey: queryKeys.events });
      queryClient.invalidateQueries({ queryKey: queryKeys.claimHistory });
    },

    onError: (err: unknown) => {
      const errorInfo =
        err && typeof err === 'object' && 'code' in err
          ? (err as { code: string; message: string })
          : { code: 'UNKNOWN', message: String(err) };
      setTxState({
        status: 'failed',
        hash: null,
        error: errorInfo.message,
      });
    },
  });

  const reset = () => {
    setTxState({ status: 'idle', hash: null, error: null });
    mutation.reset();
  };

  return {
    claim: mutation.mutate,
    txState,
    reset,
    isLoading: mutation.isPending,
  };
}
