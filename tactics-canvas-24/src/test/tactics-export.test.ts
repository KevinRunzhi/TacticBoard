import { describe, expect, it, vi } from 'vitest';
import {
  GIF_MAX_DURATION_MS,
  createGifReadbackCanvas,
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

  it('creates a dedicated gif readback canvas with willReadFrequently enabled', () => {
    const getContext = vi.fn(() => ({ getImageData: vi.fn() }));
    const createdCanvas = {
      width: 0,
      height: 0,
      getContext,
    } as unknown as HTMLCanvasElement;
    const ownerDocument = {
      createElement: vi.fn(() => createdCanvas),
    } as unknown as Document;
    const sourceCanvas = {
      ownerDocument,
    } as unknown as HTMLCanvasElement;

    const result = createGifReadbackCanvas(sourceCanvas, 680, 1000);

    expect(ownerDocument.createElement).toHaveBeenCalledWith('canvas');
    expect(getContext).toHaveBeenCalledWith('2d', { willReadFrequently: true });
    expect(result.canvas.width).toBe(680);
    expect(result.canvas.height).toBe(1000);
    expect(result.context).toBeTruthy();
  });
});
