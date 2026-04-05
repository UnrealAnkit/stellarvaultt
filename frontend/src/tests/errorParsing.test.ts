import { describe, it, expect } from 'vitest';
import { parseContractError } from '@/lib/stellar';

describe('parseContractError', () => {
  it('detects already claimed error', () => {
    const err = parseContractError('Error: already claimed');
    expect(err.code).toBe('ALREADY_CLAIMED');
    expect(err.message).toContain('already claimed');
  });

  it('detects campaign inactive error', () => {
    const err = parseContractError('campaign is not active');
    expect(err.code).toBe('CAMPAIGN_INACTIVE');
  });

  it('detects not initialized error', () => {
    const err = parseContractError('vault not initialized');
    expect(err.code).toBe('CONTRACT_NOT_INITIALIZED');
  });

  it('detects user rejection', () => {
    const err = parseContractError('User rejected the request');
    expect(err.code).toBe('USER_REJECTED');
  });

  it('detects network errors', () => {
    const err = parseContractError('network fetch failed');
    expect(err.code).toBe('NETWORK_ERROR');
  });

  it('falls back to UNKNOWN for unrecognized errors', () => {
    const err = parseContractError('some random error xyz');
    expect(err.code).toBe('UNKNOWN');
    expect(err.detail).toBe('some random error xyz');
  });

  it('handles empty string gracefully', () => {
    const err = parseContractError('');
    expect(err.code).toBe('UNKNOWN');
  });

  it('is case insensitive', () => {
    const err = parseContractError('ALREADY_CLAIMED');
    expect(err.code).toBe('ALREADY_CLAIMED');
  });
});
