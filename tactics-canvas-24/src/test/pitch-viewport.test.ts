import { describe, expect, it } from 'vitest';
import { calculatePitchFitSize, calculatePitchFitZoom, clampPitchPan } from '@/lib/pitch-viewport';

describe('pitch viewport helpers', () => {
  it('calculates a fit zoom that respects viewport margins', () => {
    const zoom = calculatePitchFitZoom({
      containerWidth: 360,
      containerHeight: 640,
      canvasWidth: 680,
      canvasHeight: 1000,
    });

    expect(zoom).toBeCloseTo(0.529, 2);
  });

  it('returns a fitted render size that matches the available viewport width', () => {
    const size = calculatePitchFitSize({
      containerWidth: 360,
      containerHeight: 640,
      canvasWidth: 680,
      canvasHeight: 1000,
    });

    expect(size.scale).toBeCloseTo(0.529, 2);
    expect(size.width).toBeCloseTo(360, 0);
    expect(size.height).toBeCloseTo(529, 0);
  });

  it('clamps pan so a zoomed pitch cannot be moved fully outside the viewport', () => {
    const clampedPan = clampPitchPan(
      { x: 999, y: -999 },
      1.2,
      {
        containerWidth: 360,
        containerHeight: 640,
        canvasWidth: 680,
        canvasHeight: 1000,
      },
    );

    expect(clampedPan).toEqual({
      x: 228,
      y: -280,
    });
  });

  it('keeps pan centered when the fitted pitch is smaller than the viewport', () => {
    const clampedPan = clampPitchPan(
      { x: 80, y: -40 },
      0.55,
      {
        containerWidth: 768,
        containerHeight: 1024,
        canvasWidth: 680,
        canvasHeight: 1000,
      },
    );

    expect(Math.abs(clampedPan.x)).toBe(0);
    expect(Math.abs(clampedPan.y)).toBe(0);
  });

  it('clamps pan using the fitted render size instead of the raw SVG width', () => {
    const clampedPan = clampPitchPan(
      { x: 200, y: 0 },
      1.4,
      {
        containerWidth: 360,
        containerHeight: 640,
        canvasWidth: 680,
        canvasHeight: 1000,
        displayWidth: 360,
        displayHeight: 529.4,
      },
    );

    expect(clampedPan.x).toBeCloseTo(72, 1);
  });
});
