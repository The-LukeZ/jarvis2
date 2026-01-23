// src/utils.test.ts
import { describe, it, expect } from 'vitest';
import { calculateReputation } from './utils';

describe('calculateReputation', () => {
  it('returns 10 for new user and single partner trade', () => {
    expect(calculateReputation(1, 1)).toBe(10);
  });

  it('applies diminishing returns: partner=2 yields 5', () => {
    expect(calculateReputation(2, 2)).toBe(5);
  });

  it('floors fractional inputs and enforces minimum of 1', () => {
    expect(calculateReputation(0.9, 0.9)).toBe(10);
    expect(calculateReputation(0.9, 0.9)).toBe(calculateReputation(1, 1));
  });

  it('does not apply concentration penalty when totalTrades <= 4', () => {
    // partner=4, total=4 -> diminishingFactor = 1/(1+log2(4)) = 1/3 -> 10/3 => ceil 4
    expect(calculateReputation(4, 4)).toBe(4);
  });

  it('applies concentration penalty after threshold and reduces score', () => {
    // total=10, partner=5 -> expected ceil(10 * 1/(1+log2(5)) * 0.75) = 3
    expect(calculateReputation(10, 5)).toBe(3);
  });

  it('returns 0 when partner concentration reaches or exceeds 80%', () => {
    // total=5, partner=4 => ratio = 0.8 => concentrationFactor = 0 -> score 0
    expect(calculateReputation(5, 4)).toBe(0);
  });

  it('returns 0 when partner concentration slightly exceeds 80%', () => {
    // total=11, partner=9 => ratio ~0.818 > 0.8 -> concentrationFactor clamped to 0
    expect(calculateReputation(11, 9)).toBe(0);
  });

  it('applies ceiling correctly on fractional results', () => {
    // total=3, partner=1 (no concentration) -> ceil to 10 because first trade with partner
    expect(calculateReputation(3, 1)).toBe(10);
  });

  it('handles large partner trade counts and still returns at least 1 (unless penalized to 0)', () => {
    // large numbers that result in a tiny positive score should ceil to 1
    expect(calculateReputation(2000, 1024)).toBe(1);
  });

  it('treats negative inputs as minimum 1 and returns full score for single partner', () => {
    expect(calculateReputation(-5, -3)).toBe(10);
  });

  it('floors inputs so fractional equivalence holds', () => {
    expect(calculateReputation(10.9, 5.9)).toBe(calculateReputation(10, 5));
  });

  it('throws when tradesWithPartner exceeds totalTradesUser', () => {
    expect(() => calculateReputation(3, 4)).toThrowError(TypeError);
  });
});