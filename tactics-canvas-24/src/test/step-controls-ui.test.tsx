import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render } from '@testing-library/react';
import { BottomStepBar } from '@/components/tactics/BottomStepBar';
import type { StepFrame } from '@/types/tactics';

function createStep(id: string, label: string): StepFrame {
  return {
    id,
    label,
    description: '',
    players: [],
    lines: [],
    ball: { x: 50, y: 50 },
    texts: [],
    areas: [],
  };
}

describe('bottom step bar controls', () => {
  it('wires duplicate, move, and delete actions to the desktop step controls', () => {
    const onStepChange = vi.fn();
    const onTogglePlay = vi.fn();
    const onAddStep = vi.fn();
    const onDuplicateStep = vi.fn();
    const onDeleteStep = vi.fn();
    const onMoveStepLeft = vi.fn();
    const onMoveStepRight = vi.fn();

    const { container } = render(
      <BottomStepBar
        steps={[createStep('step-1', 'Step 1'), createStep('step-2', 'Step 2'), createStep('step-3', 'Step 3')]}
        currentIndex={1}
        isPlaying={false}
        onStepChange={onStepChange}
        onTogglePlay={onTogglePlay}
        onAddStep={onAddStep}
        onDuplicateStep={onDuplicateStep}
        onDeleteStep={onDeleteStep}
        onMoveStepLeft={onMoveStepLeft}
        onMoveStepRight={onMoveStepRight}
      />,
    );

    const stepButtons = container.querySelectorAll('button[title]');
    expect(stepButtons).toHaveLength(8);

    fireEvent.click(stepButtons[4]);
    fireEvent.click(stepButtons[5]);
    fireEvent.click(stepButtons[6]);
    fireEvent.click(stepButtons[7]);

    expect(onDuplicateStep).toHaveBeenCalledTimes(1);
    expect(onMoveStepLeft).toHaveBeenCalledTimes(1);
    expect(onMoveStepRight).toHaveBeenCalledTimes(1);
    expect(onDeleteStep).toHaveBeenCalledTimes(1);
  });

  it('disables impossible desktop step actions at the edges', () => {
    const { container } = render(
      <BottomStepBar
        steps={[createStep('step-1', 'Step 1')]}
        currentIndex={0}
        isPlaying={false}
        onStepChange={vi.fn()}
        onTogglePlay={vi.fn()}
        onAddStep={vi.fn()}
        onDuplicateStep={vi.fn()}
        onDeleteStep={vi.fn()}
        onMoveStepLeft={vi.fn()}
        onMoveStepRight={vi.fn()}
      />,
    );

    const stepButtons = container.querySelectorAll('button[title]');
    expect(stepButtons[5]).toBeDisabled();
    expect(stepButtons[6]).toBeDisabled();
    expect(stepButtons[7]).toBeDisabled();
  });
});
