import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { PitchCanvas } from '@/components/tactics/PitchCanvas';
import type { MatchMeta, Player, StepFrame } from '@/types/tactics';

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

describe('pitch canvas line-start reset', () => {
  beforeAll(() => {
    installSvgMocks();
  });

  beforeEach(() => {
    window.localStorage.setItem('tactics_canvas_hint_shown', '1');
  });

  it('clears the pending line start when the user switches to selecting a player', () => {
    const player: Player = {
      id: 'player-1',
      number: 7,
      name: 'Kai',
      position: 'CM',
      team: 'home',
      x: 30,
      y: 40,
    };

    const step: StepFrame = {
      id: 'step-1',
      label: 'Step 1',
      description: '',
      players: [player],
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

    const onAddLine = vi.fn();

    const { container } = render(
      <PitchCanvas
        projectName="Training Board"
        currentTool="line-pass"
        players={[player]}
        lines={[]}
        ball={{ x: 50, y: 50 }}
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
        onAddLine={onAddLine}
        onAddArea={vi.fn()}
        onMovePlayer={vi.fn()}
        onMoveBall={vi.fn()}
        onMoveArea={vi.fn()}
        onMoveText={vi.fn()}
      />,
    );

    const svg = container.querySelector('svg');
    expect(svg).not.toBeNull();

    fireEvent.click(svg!, { clientX: 140, clientY: 160 });
    fireEvent.mouseDown(screen.getByText('7'), { clientX: 220, clientY: 280 });
    fireEvent.click(svg!, { clientX: 240, clientY: 320 });

    expect(onAddLine).not.toHaveBeenCalled();

    fireEvent.click(svg!, { clientX: 280, clientY: 360 });

    expect(onAddLine).toHaveBeenCalledTimes(1);
  });
});
