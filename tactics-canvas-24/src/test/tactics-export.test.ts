import { describe, expect, it } from 'vitest';
import {
  GIF_MAX_DURATION_MS,
  getEstimatedGifDurationMs,
  getGifConstraintMessage,
  getGifDelayMs,
} from '@/lib/tactics-export';

describe('tactics export utilities', () => {
  it('returns the expected delay for each gif speed', () => {
    expect(getGifDelayMs('slow')).toBe(1200);
    expect(getGifDelayMs('standard')).toBe(900);
    expect(getGifDelayMs('fast')).toBe(650);
  });

  it('estimates gif duration from step count and speed', () => {
    expect(getEstimatedGifDurationMs(5, 'standard')).toBe(4500);
    expect(getEstimatedGifDurationMs(10, 'fast')).toBe(6500);
  });

  it('returns a downgrade hint when the gif duration exceeds the first-phase limit', () => {
    const message = getGifConstraintMessage(20, 'slow');

    expect(message).toContain('15 秒上限');
    expect(getEstimatedGifDurationMs(20, 'slow')).toBeGreaterThan(GIF_MAX_DURATION_MS);
  });

  it('returns null when the gif duration is within the first-phase limit', () => {
    expect(getGifConstraintMessage(8, 'fast')).toBeNull();
  });
});
