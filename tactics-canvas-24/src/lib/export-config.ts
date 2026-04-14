import type { ExportConfig, ExportRatio } from '@/types/tactics';
import { getEditorPreferences } from '@/lib/editor-preferences';

export const DEFAULT_EXPORT_CONFIG: ExportConfig = {
  format: 'png',
  ratio: '2x',
  gifSpeed: 'standard',
  includeTitle: true,
  includeStepInfo: false,
  includeMatchInfo: true,
  includeGhostTrail: false,
  includeReferenceImage: false,
  transparentBackground: false,
};

const EXPORT_SCALE_MAP: Record<ExportRatio, number> = {
  '1x': 1,
  '2x': 2,
};

export function createDefaultExportConfig(): ExportConfig {
  const preferences = getEditorPreferences();
  return {
    ...DEFAULT_EXPORT_CONFIG,
    format: preferences.defaultExportFormat,
    ratio: preferences.defaultExportRatio,
  };
}

export function getExportScale(config?: Pick<ExportConfig, 'ratio'>) {
  return EXPORT_SCALE_MAP[config?.ratio ?? DEFAULT_EXPORT_CONFIG.ratio];
}

export function applyExportConfigToSvg(svg: SVGSVGElement, config: ExportConfig) {
  const nextSvg = svg.cloneNode(true) as SVGSVGElement;

  if (config.transparentBackground) {
    nextSvg.querySelectorAll('[data-export-role="canvas-background"]').forEach((node) => node.remove());
  }

  if (!config.includeReferenceImage) {
    nextSvg.querySelectorAll('[data-export-role="reference-image"]').forEach((node) => node.remove());
  }

  if (!config.includeGhostTrail) {
    nextSvg.querySelectorAll('[data-export-role="ghost-trail"]').forEach((node) => node.remove());
  }

  if (!config.includeStepInfo) {
    nextSvg.querySelectorAll('[data-export-role="step-info"]').forEach((node) => node.remove());
  }

  if (!config.includeTitle && !config.includeMatchInfo) {
    nextSvg.querySelectorAll('[data-export-role="match-banner"]').forEach((node) => node.remove());
    return nextSvg;
  }

  if (!config.includeTitle) {
    nextSvg.querySelectorAll('[data-export-role="match-title"]').forEach((node) => node.remove());
  }

  if (!config.includeMatchInfo) {
    nextSvg.querySelectorAll('[data-export-role="match-info"]').forEach((node) => node.remove());
  }

  const hasTitle = nextSvg.querySelector('[data-export-role="match-title"]');
  const hasMatchInfo = nextSvg.querySelector('[data-export-role="match-info"]');
  if (!hasTitle && !hasMatchInfo) {
    nextSvg.querySelectorAll('[data-export-role="match-banner"]').forEach((node) => node.remove());
  }

  return nextSvg;
}
