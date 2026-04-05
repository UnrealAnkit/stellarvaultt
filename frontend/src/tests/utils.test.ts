import { describe, it, expect } from 'vitest';
import { formatTokenAmount, shortenAddress } from '@/lib/constants';

describe('formatTokenAmount', () => {
  it('formats whole tokens correctly', () => {
    expect(formatTokenAmount('10000000')).toBe('1');
    expect(formatTokenAmount('100000000000')).toBe('10000');
  });

  it('formats fractional tokens correctly', () => {
    expect(formatTokenAmount('15000000')).toBe('1.5');
    expect(formatTokenAmount('10050000')).toBe('1.005');
  });

  it('formats zero correctly', () => {
    expect(formatTokenAmount('0')).toBe('0');
  });

  it('handles large amounts', () => {
    // 1,000,000 tokens = 10,000,000,000,000 stroops
    expect(formatTokenAmount('10000000000000')).toBe('1000000');
  });

  it('handles BigInt input', () => {
    expect(formatTokenAmount(BigInt('10000000'))).toBe('1');
  });

  it('handles number input', () => {
    expect(formatTokenAmount(10000000)).toBe('1');
  });

  it('strips trailing zeros in fractional part', () => {
    // 1.5000000 SRT → show as 1.5
    expect(formatTokenAmount('15000000')).toBe('1.5');
  });
});

describe('shortenAddress', () => {
  const addr = 'GAAZI4TCR3TY5OJHCTJC2A4QSY6CJWJH5IAJTGKIN2ER7LBNVKOCCWN';

  it('shortens a long Stellar address', () => {
    const result = shortenAddress(addr, 6);
    expect(result).toContain('…');
    expect(result.length).toBeLessThan(addr.length);
  });

  it('preserves the first N characters', () => {
    const result = shortenAddress(addr, 6);
    expect(result.startsWith('GAAZI4')).toBe(true);
  });

  it('preserves the last N characters', () => {
    const result = shortenAddress(addr, 6);
    expect(result.endsWith('CCWN')).toBe(false); // 6 chars from end
    expect(result.endsWith(addr.slice(-6))).toBe(true);
  });

  it('returns the original string if it is too short', () => {
    const short = 'GAAZI';
    expect(shortenAddress(short, 6)).toBe(short);
  });

  it('handles empty string', () => {
    expect(shortenAddress('')).toBe('');
  });
});
