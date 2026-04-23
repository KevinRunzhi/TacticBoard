import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import { PitchCanvas } from '@/components/tactics/PitchCanvas';
import type { MatchMeta, StepFrame } from '@/types/tactics';

function installSvgMocks() {
  const identityMatrix = {
    inverse: () => identityMatrix,
  };

  Object.defineProperty(SVGSVGElement.prototype, 'createSVGPoint', {
    configurable: true,
    writable: true,
    value() {
      return {
        x: 0,
        y: 0,
        matrixTransform() {
          return { x: this.x, y: this.y };
        },
      };
    },
  });

  Object.defineProperty(SVGSVGElement.prototype, 'getScreenCTM', {
    configurable: true,
    writable: true,
    value() {
      return identityMatrix;
    },
  });
}

describe('pitch canvas initial zoom', () => {
  beforeAll(() => {
    installSvgMocks();
  });

  beforeEach(() => {
    window.localStorage.setItem('tactics_canvas_hint_shown', '1');
  });

  it('renders the fitted canvas at 100 percent while keeping the pitch flush with the viewport width', async () => {
    const clientWidthSpy = vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(360);
    const clientHeightSpy = vi.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockReturnValue(640);
    const requestAnimationFrameStub = vi
      .spyOn(window, 'requestAnimationFrame')
      .mockImplementation((callback: FrameRequestCallback) => {
        callback(0);
        return 1;
      });
    const cancelAnimationFrameStub = vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {});

    class ResizeObserverMock {
      constructor(private readonly callback: ResizeObserverCallback) {}

      observe() {
        this.callback([], this as unknown as ResizeObserver);
      }

      disconnect() {}

      unobserve() {}
    }

    vi.stubGlobal('ResizeObserver', ResizeObserverMock);

    const step: StepFrame = {
      id: 'step-1',
      label: 'Step 1',
      description: '',
      players: [],
      lines: [],
      ball: { x: 50, y: 50 },
      texts: [],
      areas: [],
    };

    const matchMeta: MatchMeta = {
      title: '',
      score: '',
      minute: '',
      phaseLabel: '',
    };

    const onZoomChange = vi.fn();

    const { container } = render(
      <PitchCanvas
        projectName="Training Board"
        currentTool="select"
        players={[]}
        lines={[]}
        ball={step.ball}
        texts={[]}
        areas={[]}
        allSteps={[step]}
        currentStepIndex={0}
        matchMeta={matchMeta}
        referenceImage={null}
        fieldView="full"
        fieldStyle="flat"
        playerStyle="dot"
        selectedPlayerId={null}
        selectedLineId={null}
        selectedTextId={null}
        selectedAreaId={null}
        onSelectPlayer={vi.fn()}
        onSelectLine={vi.fn()}
        onSelectText={vi.fn()}
        onSelectArea={vi.fn()}
        onAddPlayer={vi.fn()}
        onAddText={vi.fn()}
        onAddLine={vi.fn()}
        onAddArea={vi.fn()}
        onMovePlayer={vi.fn()}
        onMoveBall={vi.fn()}
        onMoveArea={vi.fn()}
        onMoveText={vi.fn()}
        onZoomChange={onZoomChange}
      />,
    );

    await waitFor(() => {
      expect(onZoomChange).toHaveBeenLastCalledWith(100);
    });

    const svg = container.querySelector('svg[viewBox="0 0 680 1000"]') as SVGSVGElement | null;
    const transformSurface = container.querySelector('div[style*="scale("]') as HTMLDivElement | null;
    expect(svg).not.toBeNull();
    expect(transformSurface).not.toBeNull();
    expect(parseFloat(svg!.style.width)).toBeCloseTo(360, 0);
    expect(transformSurface?.style.transform).toMatch(/scale\(1\)/);

    clientWidthSpy.mockRestore();
    clientHeightSpy.mockRestore();
    requestAnimationFrameStub.mockRestore();
    cancelAnimationFrameStub.mockRestore();
    vi.unstubAllGlobals();
  });
});
