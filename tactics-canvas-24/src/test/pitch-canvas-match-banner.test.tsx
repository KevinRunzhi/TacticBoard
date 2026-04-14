import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { render } from '@testing-library/react';
import { PitchCanvas } from '@/components/tactics/PitchCanvas';
import { META_TEXT_SEPARATOR } from '@/lib/tactics-export';
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

describe('pitch canvas match banner', () => {
  beforeAll(() => {
    installSvgMocks();
  });

  beforeEach(() => {
    window.localStorage.setItem('tactics_canvas_hint_shown', '1');
  });

  it('renders match meta with the same separator used by export output', () => {
    const step: StepFrame = {
      id: 'step-1',
      label: 'Step 1',
      description: '',
      players: [],
      lines: [],
      ball: { id: 'ball-1', x: 50, y: 50 },
      texts: [],
      areas: [],
    };

    const matchMeta: MatchMeta = {
      title: 'Weekend Press',
      score: '2 - 1',
      minute: "67'",
      phaseLabel: 'High Press',
    };

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
      />,
    );

    const matchInfoText = container.querySelector('[data-export-role="match-info"]');

    expect(matchInfoText?.textContent).toBe(`2 - 1${META_TEXT_SEPARATOR}67'${META_TEXT_SEPARATOR}High Press`);
  });
});
