export interface PitchViewportDimensions {
  containerWidth: number;
  containerHeight: number;
  canvasWidth: number;
  canvasHeight: number;
  displayWidth?: number;
  displayHeight?: number;
}

export interface PitchViewportPan {
  x: number;
  y: number;
}

const DEFAULT_FIT_MARGIN = 0;

export function calculatePitchFitZoom(
  dimensions: PitchViewportDimensions,
  margin = DEFAULT_FIT_MARGIN,
) {
  const { containerWidth, containerHeight, canvasWidth, canvasHeight } = dimensions;

  if (containerWidth <= 0 || containerHeight <= 0 || canvasWidth <= 0 || canvasHeight <= 0) {
    return 1;
  }

  const availableWidth = Math.max(containerWidth - margin * 2, 1);
  const availableHeight = Math.max(containerHeight - margin * 2, 1);
  const scaleWidth = availableWidth / canvasWidth;
  const scaleHeight = availableHeight / canvasHeight;

  return Math.min(scaleWidth, scaleHeight, 1);
}

export function calculatePitchFitSize(
  dimensions: PitchViewportDimensions,
  margin = DEFAULT_FIT_MARGIN,
) {
  const scale = calculatePitchFitZoom(dimensions, margin);

  return {
    scale,
    width: dimensions.canvasWidth * scale,
    height: dimensions.canvasHeight * scale,
  };
}

export function clampPitchPan(
  pan: PitchViewportPan,
  zoom: number,
  dimensions: PitchViewportDimensions,
): PitchViewportPan {
  const {
    containerWidth,
    containerHeight,
    canvasWidth,
    canvasHeight,
    displayWidth = canvasWidth,
    displayHeight = canvasHeight,
  } = dimensions;

  if (containerWidth <= 0 || containerHeight <= 0 || canvasWidth <= 0 || canvasHeight <= 0) {
    return pan;
  }

  const scaledWidth = displayWidth * zoom;
  const scaledHeight = displayHeight * zoom;
  const maxOffsetX = Math.max((scaledWidth - containerWidth) / 2, 0);
  const maxOffsetY = Math.max((scaledHeight - containerHeight) / 2, 0);

  return {
    x: clamp(pan.x, -maxOffsetX, maxOffsetX),
    y: clamp(pan.y, -maxOffsetY, maxOffsetY),
  };
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}
