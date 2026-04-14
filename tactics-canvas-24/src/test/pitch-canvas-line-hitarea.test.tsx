import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { PitchCanvas } from '@/components/tactics/PitchCanvas';
import type { MatchMeta, StepFrame, TacticsLine } from '@/types/tactics';

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

describe('pitch canvas line hit area', () => {
  beforeAll(() => {
    installSvgMocks();
  });

  beforeEach(() => {
    window.localStorage.setItem('tactics_canvas_hint_shown', '1');
  });

  it('renders a transparent stroke hit area for each line', () => {
    const line: TacticsLine = {
      id: 'line-1',
      type: 'pass',
      fromX: 15,
      fromY: 25,
      toX: 65,
      toY: 70,
    };

    const step: StepFrame = {
      id: 'step-1',
      label: 'Step 1',
      description: '',
      players: [],
      lines: [line],
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

    const { container } = render(
      <PitchCanvas
        projectName="Training Board"
        currentTool="select"
        players={[]}
        lines={[line]}
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
        onAddLine={vi.fn()}
        onAddArea={vi.fn()}
        onMovePlayer={vi.fn()}
        onMoveBall={vi.fn()}
        onMoveArea={vi.fn()}
        onMoveText={vi.fn()}
      />,
    );

    const hitLine = container.querySelector('line[stroke="transparent"][stroke-width="14"]');
    expect(hitLine).not.toBeNull();
    expect(hitLine?.getAttribute('pointer-events')).toBe('stroke');
  });

  it('shows a line-tool hint and switches it after selecting the start point', () => {
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

    const { container } = render(
      <PitchCanvas
        projectName="Training Board"
        currentTool="line-pass"
        players={[]}
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
        onAddLine={vi.fn()}
        onAddArea={vi.fn()}
        onMovePlayer={vi.fn()}
        onMoveBall={vi.fn()}
        onMoveArea={vi.fn()}
        onMoveText={vi.fn()}
      />,
    );

    expect(screen.getByText('请点击球场选择起点')).toBeInTheDocument();

    const svg = container.querySelector('svg');
    expect(svg).not.toBeNull();

    fireEvent.click(svg!, { clientX: 120, clientY: 160 });

    expect(screen.getByText('请点击球场选择终点')).toBeInTheDocument();
  });
});
