import { beforeEach, describe, expect, it } from 'vitest';
import { applyExportConfigToSvg, createDefaultExportConfig, getExportScale } from '@/lib/export-config';

describe('export config utils', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('returns the expected scale for the export ratio', () => {
    expect(getExportScale({ ratio: '1x' })).toBe(1);
    expect(getExportScale({ ratio: '2x' })).toBe(2);
    expect(getExportScale()).toBe(2);
  });

  it('reads export defaults from editor preferences', () => {
    window.localStorage.setItem('tactics-canvas:preferences:v1', JSON.stringify({
      defaultFieldFormat: '11v11',
      defaultFieldStyle: 'realistic',
      defaultPlayerStyle: 'dot',
      defaultExportFormat: 'gif',
      defaultExportRatio: '1x',
    }));

    expect(createDefaultExportConfig()).toMatchObject({
      format: 'gif',
      ratio: '1x',
    });
  });

  it('keeps match banner content by default and skips reference image', () => {
    const svg = createSvgFixture();
    const nextSvg = applyExportConfigToSvg(svg, createDefaultExportConfig());

    expect(nextSvg.querySelector('[data-export-role="match-banner"]')).not.toBeNull();
    expect(nextSvg.querySelector('[data-export-role="reference-image"]')).toBeNull();
    expect(nextSvg.querySelector('[data-export-role="canvas-background"]')).not.toBeNull();
  });

  it('removes title or match info nodes according to the export toggles', () => {
    const titleHiddenSvg = applyExportConfigToSvg(createSvgFixture(), {
      ...createDefaultExportConfig(),
      includeTitle: false,
    });
    expect(titleHiddenSvg.querySelector('[data-export-role="match-title"]')).toBeNull();
    expect(titleHiddenSvg.querySelector('[data-export-role="match-info"]')).not.toBeNull();

    const matchHiddenSvg = applyExportConfigToSvg(createSvgFixture(), {
      ...createDefaultExportConfig(),
      includeMatchInfo: false,
    });
    expect(matchHiddenSvg.querySelector('[data-export-role="match-title"]')).not.toBeNull();
    expect(matchHiddenSvg.querySelector('[data-export-role="match-info"]')).toBeNull();

    const bannerHiddenSvg = applyExportConfigToSvg(createSvgFixture(), {
      ...createDefaultExportConfig(),
      includeTitle: false,
      includeMatchInfo: false,
    });
    expect(bannerHiddenSvg.querySelector('[data-export-role="match-banner"]')).toBeNull();
  });

  it('keeps the reference image node when the export toggle is enabled', () => {
    const nextSvg = applyExportConfigToSvg(createSvgFixture(), {
      ...createDefaultExportConfig(),
      includeReferenceImage: true,
    });

    expect(nextSvg.querySelector('[data-export-role="reference-image"]')).not.toBeNull();
  });

  it('removes transparent-only and optional export layers when toggles are disabled', () => {
    const nextSvg = applyExportConfigToSvg(createSvgFixture(), {
      ...createDefaultExportConfig(),
      transparentBackground: true,
      includeStepInfo: false,
      includeGhostTrail: false,
    });

    expect(nextSvg.querySelector('[data-export-role="canvas-background"]')).toBeNull();
    expect(nextSvg.querySelector('[data-export-role="step-info"]')).toBeNull();
    expect(nextSvg.querySelector('[data-export-role="ghost-trail"]')).toBeNull();
  });
});

function createSvgFixture() {
  const namespace = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(namespace, 'svg');
  const banner = document.createElementNS(namespace, 'g');
  banner.setAttribute('data-export-role', 'match-banner');

  const title = document.createElementNS(namespace, 'text');
  title.setAttribute('data-export-role', 'match-title');
  title.textContent = 'title';

  const matchInfo = document.createElementNS(namespace, 'text');
  matchInfo.setAttribute('data-export-role', 'match-info');
  matchInfo.textContent = 'meta';

  const referenceImage = document.createElementNS(namespace, 'image');
  referenceImage.setAttribute('data-export-role', 'reference-image');
  const background = document.createElementNS(namespace, 'rect');
  background.setAttribute('data-export-role', 'canvas-background');
  const stepInfo = document.createElementNS(namespace, 'text');
  stepInfo.setAttribute('data-export-role', 'step-info');
  const ghostTrail = document.createElementNS(namespace, 'path');
  ghostTrail.setAttribute('data-export-role', 'ghost-trail');

  banner.append(title, matchInfo);
  svg.append(background, banner, stepInfo, ghostTrail, referenceImage);
  return svg;
}
