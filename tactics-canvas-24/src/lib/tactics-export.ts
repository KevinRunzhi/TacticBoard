import { GIFEncoder, applyPalette, quantize } from 'gifenc';
import type {
  ExportConfig,
  FieldStyle,
  FieldView,
  MatchMeta,
  PlayerStyle,
  ReferenceImage,
  StepFrame,
  TacticsLine,
  GifSpeed,
} from '@/types/tactics';

export const EXPORT_VIEWBOX_WIDTH = 680;
export const EXPORT_VIEWBOX_HEIGHT_FULL = 1000;
export const EXPORT_VIEWBOX_HEIGHT_HALF = 520;
export const GIF_MAX_DURATION_MS = 15_000;
export const META_TEXT_SEPARATOR = ' / ';

const PADDING = 40;
const lineColors: Record<TacticsLine['type'], string> = {
  run: '#e6b422',
  pass: '#4d9ef7',
  dribble: '#2ecc71',
  shoot: '#e74c3c',
  press: '#9b59b6',
};

const GIF_SPEED_DELAY_MS: Record<GifSpeed, number> = {
  slow: 1200,
  standard: 900,
  fast: 650,
};

type RenderFrameOptions = {
  canvas: HTMLCanvasElement;
  projectName: string;
  matchMeta: MatchMeta;
  referenceImage: ReferenceImage | null;
  fieldView: FieldView;
  fieldStyle: FieldStyle;
  playerStyle: PlayerStyle;
  step: StepFrame;
  previousStep?: StepFrame | null;
  config: ExportConfig;
};

function getPitchHeight(fieldView: FieldView) {
  return fieldView === 'half' ? EXPORT_VIEWBOX_HEIGHT_HALF : EXPORT_VIEWBOX_HEIGHT_FULL;
}

function getPitchLayout(fieldView: FieldView) {
  const viewBoxHeight = getPitchHeight(fieldView);
  const pitchWidth = EXPORT_VIEWBOX_WIDTH - PADDING * 2;
  const pitchHeight = viewBoxHeight - PADDING * 2;

  return {
    viewBoxWidth: EXPORT_VIEWBOX_WIDTH,
    viewBoxHeight,
    pitchWidth,
    pitchHeight,
    centerX: PADDING + pitchWidth / 2,
    centerY: PADDING + pitchHeight / 2,
  };
}

function toCanvasX(pct: number, pitchWidth: number) {
  return PADDING + (pct / 100) * pitchWidth;
}

function toCanvasY(pct: number, pitchHeight: number) {
  return PADDING + (pct / 100) * pitchHeight;
}

function getMatchTitle(projectName: string, matchMeta: MatchMeta) {
  return matchMeta.title.trim() || projectName;
}

function getMatchInfoLine(matchMeta: MatchMeta) {
  return [matchMeta.score, matchMeta.minute, matchMeta.phaseLabel]
    .map((value) => value.trim())
    .filter(Boolean)
    .join(META_TEXT_SEPARATOR);
}

function getStepInfoLine(step: StepFrame) {
  const description = step.description?.trim();
  if (!description) {
    return step.label;
  }

  return `${step.label}${META_TEXT_SEPARATOR}${description}`;
}

export function getGifDelayMs(speed: GifSpeed) {
  return GIF_SPEED_DELAY_MS[speed];
}

export function getEstimatedGifDurationMs(stepCount: number, speed: GifSpeed) {
  return stepCount * getGifDelayMs(speed);
}

export function getGifConstraintMessage(stepCount: number, speed: GifSpeed) {
  const estimatedDuration = getEstimatedGifDurationMs(stepCount, speed);
  if (estimatedDuration <= GIF_MAX_DURATION_MS) {
    return null;
  }

  return `当前 GIF 预计时长约 ${Math.ceil(estimatedDuration / 1000)} 秒，已超过 15 秒上限。请减少步骤数量、降低清晰度或选择更快的播放速度。`;
}

function drawRoundedRect(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  context.beginPath();
  context.moveTo(x + radius, y);
  context.lineTo(x + width - radius, y);
  context.quadraticCurveTo(x + width, y, x + width, y + radius);
  context.lineTo(x + width, y + height - radius);
  context.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  context.lineTo(x + radius, y + height);
  context.quadraticCurveTo(x, y + height, x, y + height - radius);
  context.lineTo(x, y + radius);
  context.quadraticCurveTo(x, y, x + radius, y);
  context.closePath();
}

function drawPitchMarkings(
  context: CanvasRenderingContext2D,
  pitchWidth: number,
  pitchHeight: number,
  isHalf: boolean,
) {
  const lineColor = 'rgba(212, 227, 218, 0.75)';
  const lineWidth = 2;
  const centerX = PADDING + pitchWidth / 2;
  const centerY = PADDING + pitchHeight / 2;
  const penaltyAreaWidth = pitchWidth * 0.44;
  const penaltyAreaHeight = pitchHeight * 0.17;
  const goalAreaWidth = pitchWidth * 0.2;
  const goalAreaHeight = pitchHeight * 0.06;
  const goalWidth = pitchWidth * 0.12;

  context.save();
  context.strokeStyle = lineColor;
  context.lineWidth = lineWidth;
  context.lineJoin = 'round';

  context.strokeRect(PADDING, PADDING, pitchWidth, pitchHeight);

  if (!isHalf) {
    context.beginPath();
    context.moveTo(PADDING, centerY);
    context.lineTo(PADDING + pitchWidth, centerY);
    context.stroke();
  }

  context.beginPath();
  context.arc(centerX, isHalf ? PADDING : centerY, pitchHeight * 0.095, 0, Math.PI * 2);
  context.stroke();

  context.fillStyle = lineColor;
  context.beginPath();
  context.arc(centerX, isHalf ? PADDING : centerY, 3, 0, Math.PI * 2);
  context.fill();

  context.strokeRect(centerX - penaltyAreaWidth / 2, PADDING, penaltyAreaWidth, penaltyAreaHeight);
  context.strokeRect(centerX - goalAreaWidth / 2, PADDING, goalAreaWidth, goalAreaHeight);
  context.strokeRect(centerX - goalWidth / 2, PADDING - 8, goalWidth, 8);
  context.beginPath();
  context.arc(centerX, PADDING + penaltyAreaHeight * 0.7, 2.5, 0, Math.PI * 2);
  context.fill();
  context.beginPath();
  context.arc(centerX, PADDING + penaltyAreaHeight, pitchHeight * 0.095, Math.PI, 0);
  context.stroke();

  if (!isHalf) {
    context.strokeRect(centerX - penaltyAreaWidth / 2, PADDING + pitchHeight - penaltyAreaHeight, penaltyAreaWidth, penaltyAreaHeight);
    context.strokeRect(centerX - goalAreaWidth / 2, PADDING + pitchHeight - goalAreaHeight, goalAreaWidth, goalAreaHeight);
    context.strokeRect(centerX - goalWidth / 2, PADDING + pitchHeight, goalWidth, 8);
    context.beginPath();
    context.arc(centerX, PADDING + pitchHeight - penaltyAreaHeight * 0.7, 2.5, 0, Math.PI * 2);
    context.fill();
    context.beginPath();
    context.arc(centerX, PADDING + pitchHeight - penaltyAreaHeight, pitchHeight * 0.095, 0, Math.PI);
    context.stroke();
  }

  context.restore();
}

function drawArrowHead(
  context: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  color: string,
) {
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const arrowSize = 10;

  context.save();
  context.fillStyle = color;
  context.beginPath();
  context.moveTo(x2, y2);
  context.lineTo(
    x2 - arrowSize * Math.cos(angle - Math.PI / 6),
    y2 - arrowSize * Math.sin(angle - Math.PI / 6),
  );
  context.lineTo(
    x2 - arrowSize * Math.cos(angle + Math.PI / 6),
    y2 - arrowSize * Math.sin(angle + Math.PI / 6),
  );
  context.closePath();
  context.fill();
  context.restore();
}

function drawBallGraphic(context: CanvasRenderingContext2D, x: number, y: number, alpha = 1) {
  context.save();
  context.globalAlpha = alpha;
  context.fillStyle = '#ffffff';
  context.strokeStyle = '#1f2937';
  context.lineWidth = 1;
  context.beginPath();
  context.arc(x, y, 7, 0, Math.PI * 2);
  context.fill();
  context.stroke();

  context.fillStyle = '#1f2937';
  [
    [0, 0, 1.6],
    [-3.4, -2.4, 1.2],
    [3.4, -2.4, 1.2],
    [-2.8, 3, 1.1],
    [2.8, 3, 1.1],
  ].forEach(([offsetX, offsetY, radius]) => {
    context.beginPath();
    context.arc(x + offsetX, y + offsetY, radius, 0, Math.PI * 2);
    context.fill();
  });
  context.restore();
}

function getReferenceImageBounds(referenceImage: ReferenceImage, pitchWidth: number, pitchHeight: number) {
  const width = pitchWidth * referenceImage.scale;
  const height = pitchHeight * referenceImage.scale;

  return {
    x: PADDING + (pitchWidth - width) / 2 + (referenceImage.offsetX / 100) * pitchWidth,
    y: PADDING + (pitchHeight - height) / 2 + (referenceImage.offsetY / 100) * pitchHeight,
    width,
    height,
  };
}

const imageCache = new Map<string, Promise<HTMLImageElement>>();

function loadImage(src: string) {
  const cached = imageCache.get(src);
  if (cached) {
    return cached;
  }

  const imagePromise = new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Failed to load export image asset.'));
    image.src = src;
  });

  imageCache.set(src, imagePromise);
  return imagePromise;
}

export async function renderFrameToCanvas({
  canvas,
  projectName,
  matchMeta,
  referenceImage,
  fieldView,
  fieldStyle,
  playerStyle,
  step,
  previousStep,
  config,
}: RenderFrameOptions) {
  const layout = getPitchLayout(fieldView);
  const exportScale = config.ratio === '2x' ? 2 : 1;
  canvas.width = layout.viewBoxWidth * exportScale;
  canvas.height = layout.viewBoxHeight * exportScale;

  const context = canvas.getContext('2d');
  if (!context) {
    throw new Error('Unable to create export canvas context.');
  }

  context.save();
  context.scale(exportScale, exportScale);
  context.clearRect(0, 0, layout.viewBoxWidth, layout.viewBoxHeight);

  if (!config.transparentBackground) {
    context.fillStyle = fieldStyle === 'realistic' ? 'hsl(145, 45%, 22%)' : 'hsl(152, 40%, 18%)';
    drawRoundedRect(context, 0, 0, layout.viewBoxWidth, layout.viewBoxHeight, 8);
    context.fill();
  }

  if (config.includeTitle || config.includeMatchInfo) {
    context.save();
    context.fillStyle = 'rgba(5, 12, 16, 0.56)';
    drawRoundedRect(context, 20, 10, layout.viewBoxWidth - 40, 22, 8);
    context.fill();

    if (config.includeTitle) {
      context.fillStyle = '#f8fafc';
      context.font = '700 12px "Segoe UI", sans-serif';
      context.textBaseline = 'middle';
      context.fillText(getMatchTitle(projectName, matchMeta), 30, 22);
    }

    if (config.includeMatchInfo) {
      const metaLine = getMatchInfoLine(matchMeta);
      if (metaLine) {
        context.fillStyle = 'rgba(248, 250, 252, 0.82)';
        context.font = '500 10px "Segoe UI", sans-serif';
        context.textBaseline = 'middle';
        context.textAlign = 'right';
        context.fillText(metaLine, layout.viewBoxWidth - 30, 22);
        context.textAlign = 'left';
      }
    }
    context.restore();
  }

  if (fieldStyle === 'realistic') {
    const gradient = context.createLinearGradient(0, PADDING, 0, PADDING + layout.pitchHeight);
    gradient.addColorStop(0, 'hsl(145, 55%, 30%)');
    gradient.addColorStop(0.5, 'hsl(142, 50%, 26%)');
    gradient.addColorStop(1, 'hsl(145, 55%, 30%)');
    context.fillStyle = gradient;
  } else {
    context.fillStyle = 'hsl(145, 55%, 32%)';
  }
  context.fillRect(PADDING, PADDING, layout.pitchWidth, layout.pitchHeight);

  if (fieldStyle === 'realistic') {
    context.save();
    context.globalAlpha = 0.14;
    for (let stripeIndex = 0; stripeIndex < 8; stripeIndex += 1) {
      context.fillStyle = stripeIndex % 2 === 0 ? 'hsl(142, 55%, 34%)' : 'hsl(142, 50%, 26%)';
      context.fillRect(
        PADDING,
        PADDING + (layout.pitchHeight / 8) * stripeIndex,
        layout.pitchWidth,
        layout.pitchHeight / 8,
      );
    }
    context.restore();
  }

  if (config.includeReferenceImage && referenceImage?.visible && referenceImage.localUri) {
    const image = await loadImage(referenceImage.localUri);
    const bounds = getReferenceImageBounds(referenceImage, layout.pitchWidth, layout.pitchHeight);
    context.save();
    context.globalAlpha = referenceImage.opacity;
    context.beginPath();
    context.rect(PADDING, PADDING, layout.pitchWidth, layout.pitchHeight);
    context.clip();
    context.drawImage(image, bounds.x, bounds.y, bounds.width, bounds.height);
    context.restore();
  }

  drawPitchMarkings(context, layout.pitchWidth, layout.pitchHeight, fieldView === 'half');

  if (config.includeGhostTrail && previousStep) {
    context.save();
    previousStep.players.forEach((player) => {
      const x = toCanvasX(player.x, layout.pitchWidth);
      const y = toCanvasY(player.y, layout.pitchHeight);
      context.fillStyle = player.team === 'home' ? 'rgba(96, 165, 250, 0.22)' : 'rgba(248, 113, 113, 0.22)';
      context.strokeStyle = player.team === 'home' ? 'rgba(191, 219, 254, 0.5)' : 'rgba(254, 202, 202, 0.5)';
      context.lineWidth = 1.5;
      context.beginPath();
      context.arc(x, y, playerStyle === 'card' ? 14 : 12, 0, Math.PI * 2);
      context.fill();
      context.stroke();
    });

    drawBallGraphic(
      context,
      toCanvasX(previousStep.ball.x, layout.pitchWidth),
      toCanvasY(previousStep.ball.y, layout.pitchHeight),
      0.3,
    );
    context.restore();
  }

  step.areas?.forEach((area) => {
    const x = toCanvasX(area.x, layout.pitchWidth);
    const y = toCanvasY(area.y, layout.pitchHeight);
    const width = (area.width / 100) * layout.pitchWidth;
    const height = (area.height / 100) * layout.pitchHeight;

    context.save();
    context.fillStyle = area.fillColor;
    context.strokeStyle = area.strokeColor;
    context.globalAlpha = area.opacity;
    context.lineWidth = 1.5;

    if (area.shape === 'circle') {
      context.beginPath();
      context.arc(x, y, Math.min(width, height) / 2, 0, Math.PI * 2);
      context.fill();
      context.globalAlpha = 1;
      context.stroke();
      context.restore();
      return;
    }

    if (area.shape === 'ellipse') {
      context.beginPath();
      context.ellipse(x, y, width / 2, height / 2, 0, 0, Math.PI * 2);
      context.fill();
      context.globalAlpha = 1;
      context.stroke();
      context.restore();
      return;
    }

    drawRoundedRect(context, x - width / 2, y - height / 2, width, height, 10);
    context.fill();
    context.globalAlpha = 1;
    context.stroke();
    context.restore();
  });

  step.lines.forEach((line) => {
    const x1 = toCanvasX(line.fromX, layout.pitchWidth);
    const y1 = toCanvasY(line.fromY, layout.pitchHeight);
    const x2 = toCanvasX(line.toX, layout.pitchWidth);
    const y2 = toCanvasY(line.toY, layout.pitchHeight);

    context.save();
    context.strokeStyle = lineColors[line.type];
    context.lineWidth = 2.5;
    context.globalAlpha = 0.9;
    context.setLineDash(line.type === 'run' ? [6, 4] : line.type === 'dribble' ? [2, 3] : line.type === 'press' ? [8, 3] : []);
    context.beginPath();
    context.moveTo(x1, y1);
    context.lineTo(x2, y2);
    context.stroke();
    context.setLineDash([]);
    drawArrowHead(context, x1, y1, x2, y2, lineColors[line.type]);
    context.restore();
  });

  step.texts.forEach((text) => {
    const x = toCanvasX(text.x, layout.pitchWidth);
    const y = toCanvasY(text.y, layout.pitchHeight);

    context.save();
    context.fillStyle = 'rgba(0, 0, 0, 0.6)';
    drawRoundedRect(context, x - 30, y - 8, 60, 16, 3);
    context.fill();

    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillStyle = text.style === 'title' ? '#ffffff' : text.style === 'emphasis' ? '#e6b422' : '#d4d4d8';
    context.font = text.style === 'title' ? '700 13px "Segoe UI", sans-serif' : text.style === 'emphasis' ? '600 10px "Segoe UI", sans-serif' : '400 10px "Segoe UI", sans-serif';
    context.fillText(text.text, x, y);
    context.restore();
  });

  drawBallGraphic(
    context,
    toCanvasX(step.ball.x, layout.pitchWidth),
    toCanvasY(step.ball.y, layout.pitchHeight),
  );

  step.players.forEach((player) => {
    const x = toCanvasX(player.x, layout.pitchWidth);
    const y = toCanvasY(player.y, layout.pitchHeight);
    const isHome = player.team === 'home';

    context.save();
    if (playerStyle === 'card') {
      const width = 28;
      const height = 36;
      drawRoundedRect(context, x - 14, y - 20, width, height, 4);
      context.fillStyle = isHome ? 'hsl(210, 90%, 40%)' : 'hsl(0, 70%, 45%)';
      context.fill();
      context.strokeStyle = isHome ? 'hsl(210, 90%, 55%)' : 'hsl(0, 70%, 60%)';
      context.lineWidth = 1;
      context.stroke();

      context.fillStyle = '#ffffff';
      context.font = '700 12px "Segoe UI", sans-serif';
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.fillText(String(player.number), x, y - 3);

      context.fillStyle = 'rgba(255,255,255,0.82)';
      context.font = '500 6px "Segoe UI", sans-serif';
      context.fillText(player.name.slice(0, 2), x, y + 10);
      context.restore();
      return;
    }

    context.beginPath();
    context.arc(x, y, 12, 0, Math.PI * 2);
    context.fillStyle = isHome ? 'hsl(210, 90%, 56%)' : 'hsl(0, 80%, 58%)';
    context.fill();
    context.strokeStyle = isHome ? 'hsl(210, 90%, 70%)' : 'hsl(0, 80%, 72%)';
    context.lineWidth = 1.5;
    context.stroke();

    context.fillStyle = '#ffffff';
    context.font = '700 10px "Segoe UI", sans-serif';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(String(player.number), x, y + 0.5);

    context.fillStyle = 'rgba(255,255,255,0.72)';
    context.font = '500 7px "Segoe UI", sans-serif';
    context.fillText(player.name.length > 3 ? player.name.slice(0, 3) : player.name, x, y + 22);
    context.restore();
  });

  if (config.includeStepInfo) {
    context.save();
    context.fillStyle = 'rgba(5, 12, 16, 0.56)';
    drawRoundedRect(context, 20, layout.viewBoxHeight - 34, layout.viewBoxWidth - 40, 20, 8);
    context.fill();
    context.fillStyle = '#f8fafc';
    context.font = '500 10px "Segoe UI", sans-serif';
    context.textBaseline = 'middle';
    context.fillText(getStepInfoLine(step), 30, layout.viewBoxHeight - 24);
    context.restore();
  }

  context.restore();
}

async function canvasToBlob(canvas: HTMLCanvasElement, type: string) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('Unable to create export blob.'));
        return;
      }

      resolve(blob);
    }, type);
  });
}

async function blobToBytes(blob: Blob) {
  return new Uint8Array(await blob.arrayBuffer());
}

export function createGifReadbackCanvas(sourceCanvas: HTMLCanvasElement, width: number, height: number) {
  const canvas =
    sourceCanvas.ownerDocument?.createElement('canvas') ?? document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (!context) {
    throw new Error('Unable to create GIF export canvas context.');
  }

  return {
    canvas,
    context,
  };
}

function getSvgExportSize(svg: SVGSVGElement) {
  const viewBox = svg.viewBox.baseVal;
  if (viewBox && viewBox.width > 0 && viewBox.height > 0) {
    return {
      width: viewBox.width,
      height: viewBox.height,
    };
  }

  const width = Number(svg.getAttribute('width'));
  const height = Number(svg.getAttribute('height'));

  if (Number.isFinite(width) && Number.isFinite(height) && width > 0 && height > 0) {
    return { width, height };
  }

  throw new Error('Unable to determine SVG export size.');
}

async function loadSvgImage(svgMarkup: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const blob = new Blob([svgMarkup], { type: 'image/svg+xml;charset=utf-8' });
    const objectUrl = URL.createObjectURL(blob);
    const image = new Image();

    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(image);
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Failed to rasterize SVG export.'));
    };

    image.src = objectUrl;
  });
}

export async function exportSvgAsPng(options: {
  svg: SVGSVGElement;
  scale?: number;
}) {
  const { svg, scale = 1 } = options;
  const { width, height } = getSvgExportSize(svg);
  const nextSvg = svg.cloneNode(true) as SVGSVGElement;
  nextSvg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  nextSvg.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');
  nextSvg.setAttribute('width', String(width));
  nextSvg.setAttribute('height', String(height));

  const svgMarkup = new XMLSerializer().serializeToString(nextSvg);
  const image = await loadSvgImage(svgMarkup);
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(width * scale);
  canvas.height = Math.round(height * scale);

  const context = canvas.getContext('2d');
  if (!context) {
    throw new Error('Unable to create export canvas context.');
  }

  context.clearRect(0, 0, canvas.width, canvas.height);
  context.drawImage(image, 0, 0, canvas.width, canvas.height);

  const blob = await canvasToBlob(canvas, 'image/png');
  return blobToBytes(blob);
}

export async function exportStepAsPng(options: RenderFrameOptions) {
  await renderFrameToCanvas(options);
  const blob = await canvasToBlob(options.canvas, 'image/png');
  return blobToBytes(blob);
}

export async function exportStepsAsGif(
  options: Omit<RenderFrameOptions, 'step' | 'previousStep'> & { steps: StepFrame[] },
) {
  const constraintMessage = getGifConstraintMessage(options.steps.length, options.config.gifSpeed);
  if (constraintMessage) {
    throw new Error(constraintMessage);
  }

  const layout = getPitchLayout(options.fieldView);
  const exportScale = options.config.ratio === '2x' ? 2 : 1;
  const gifWidth = layout.viewBoxWidth * exportScale;
  const gifHeight = layout.viewBoxHeight * exportScale;
  const encoder = GIFEncoder();
  const { canvas: workingCanvas, context: readbackContext } = createGifReadbackCanvas(
    options.canvas,
    gifWidth,
    gifHeight,
  );
  const delay = getGifDelayMs(options.config.gifSpeed);
  const shouldUseAlpha = options.config.transparentBackground;

  for (let frameIndex = 0; frameIndex < options.steps.length; frameIndex += 1) {
    const step = options.steps[frameIndex];
    const previousStep = frameIndex > 0 ? options.steps[frameIndex - 1] : null;

    await renderFrameToCanvas({
      ...options,
      canvas: workingCanvas,
      step,
      previousStep,
    });

    const imageData = readbackContext.getImageData(0, 0, gifWidth, gifHeight).data;
    const format = shouldUseAlpha ? 'rgba4444' : 'rgb565';
    const palette = quantize(imageData, 256, shouldUseAlpha ? { format, oneBitAlpha: true } : { format });
    const index = applyPalette(imageData, palette, format);
    const transparentIndex = shouldUseAlpha
      ? palette.findIndex((entry) => entry.length === 4 && entry[3] === 0)
      : -1;

    encoder.writeFrame(index, gifWidth, gifHeight, {
      palette,
      delay,
      repeat: frameIndex === 0 ? 0 : undefined,
      transparent: transparentIndex >= 0,
      transparentIndex: transparentIndex >= 0 ? transparentIndex : 0,
    });
  }

  encoder.finish();
  const blob = new Blob([encoder.bytes()], { type: 'image/gif' });
  return blobToBytes(blob);
}
