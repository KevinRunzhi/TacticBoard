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

describe('pitch canvas touch drag', () => {
  beforeAll(() => {
    installSvgMocks();
  });

  beforeEach(() => {
    window.localStorage.setItem('tactics_canvas_hint_shown', '1');
  });

  it('moves a selected player from a single-finger touch drag on mobile', () => {
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

    const onMovePlayer = vi.fn();
    const onSelectPlayer = vi.fn();
    const onBeginPlayerMove = vi.fn();
    const onEndPlayerMove = vi.fn();

    const { container } = render(
      <PitchCanvas
        projectName="Training Board"
        currentTool="select"
        players={[player]}
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
        onSelectPlayer={onSelectPlayer}
        onSelectLine={vi.fn()}
        onSelectText={vi.fn()}
        onSelectArea={vi.fn()}
        onAddPlayer={vi.fn()}
        onAddText={vi.fn()}
        onAddLine={vi.fn()}
        onAddArea={vi.fn()}
        onBeginPlayerMove={onBeginPlayerMove}
        onEndPlayerMove={onEndPlayerMove}
        onMovePlayer={onMovePlayer}
        onMoveBall={vi.fn()}
        onMoveArea={vi.fn()}
        onMoveText={vi.fn()}
      />,
    );

    const root = container.firstElementChild as HTMLElement;
    const playerLabel = screen.getByText('7');

    fireEvent.touchStart(playerLabel, {
      touches: [{ clientX: 220, clientY: 280 }],
      changedTouches: [{ clientX: 220, clientY: 280 }],
    });

    fireEvent.touchMove(root, {
      touches: [{ clientX: 320, clientY: 420 }],
      changedTouches: [{ clientX: 320, clientY: 420 }],
    });

    fireEvent.touchEnd(root, {
      touches: [],
      changedTouches: [{ clientX: 320, clientY: 420 }],
    });

    expect(onBeginPlayerMove).toHaveBeenCalledTimes(1);
    expect(onSelectPlayer).toHaveBeenCalledWith('player-1');
    expect(onMovePlayer).toHaveBeenCalled();
    expect(onMovePlayer).toHaveBeenLastCalledWith('player-1', expect.any(Number), expect.any(Number));

    const [, x, y] = onMovePlayer.mock.calls.at(-1) as [string, number, number];
    expect(x).toBeGreaterThan(player.x);
    expect(y).toBeGreaterThan(player.y);
    expect(onEndPlayerMove).toHaveBeenCalledTimes(1);
  });
});
