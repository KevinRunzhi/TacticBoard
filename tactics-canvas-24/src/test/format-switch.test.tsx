import { beforeEach, describe, expect, it } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useEditorState } from '@/hooks/useEditorState';

describe('field format switching', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('keeps current objects and marks the formation custom when only switching format', () => {
    const { result } = renderHook(() => useEditorState(undefined, 'personal', 'new', {
      presetId: 'f-433',
    }));

    const originalPlayers = result.current.currentStep.players.map((player) => ({
      id: player.id,
      x: player.x,
      y: player.y,
      position: player.position,
    }));

    act(() => {
      result.current.setFieldFormat('8v8');
    });

    expect(result.current.state.fieldFormat).toBe('8v8');
    expect(result.current.state.formationMode).toBe('custom');
    expect(result.current.state.activeFormationId).toBeNull();
    expect(result.current.currentStep.players.map((player) => ({
      id: player.id,
      x: player.x,
      y: player.y,
      position: player.position,
    }))).toEqual(originalPlayers);
  });

  it('rebuilds players and clears transient drawings when regenerating for a new format', () => {
    const { result } = renderHook(() => useEditorState(undefined, 'personal', 'new', {
      presetId: 'f-433',
    }));

    act(() => {
      result.current.setCurrentStepDescription('旧步骤说明');
      result.current.addStep();
      result.current.regenerateFieldFormat('8v8');
    });

    expect(result.current.state.fieldFormat).toBe('8v8');
    expect(result.current.state.formationMode).toBe('preset');
    expect(result.current.state.activeFormationId).toBe('f8-331');
    expect(result.current.currentStep.players).toHaveLength(8);
    expect(result.current.currentStep.players.every((player) => player.team === 'home')).toBe(true);
    expect(result.current.currentStep.lines).toEqual([]);
    expect(result.current.currentStep.texts).toEqual([]);
    expect(result.current.currentStep.areas).toEqual([]);
    expect(result.current.currentStep.ball.x).toBe(50);
    expect(result.current.currentStep.ball.y).toBe(50);
  });

  it('rebuilds only the home team and clears transient content when applying a new formation', () => {
    const { result } = renderHook(() => useEditorState(undefined, 'personal', 'new', {
      presetId: 'f-433',
    }));

    act(() => {
      result.current.addAreaAt(42, 36);
      result.current.setCurrentStepDescription('保留步骤说明');
      result.current.applyFormation('f-442');
    });

    const homePlayers = result.current.currentStep.players.filter((player) => player.team === 'home');
    const awayPlayers = result.current.currentStep.players.filter((player) => player.team === 'away');

    expect(result.current.state.activeFormationId).toBe('f-442');
    expect(homePlayers).toHaveLength(11);
    expect(awayPlayers).toHaveLength(0);
    expect(result.current.currentStep.lines).toEqual([]);
    expect(result.current.currentStep.texts).toEqual([]);
    expect(result.current.currentStep.areas).toEqual([]);
    expect(result.current.currentStep.ball.x).toBe(50);
    expect(result.current.currentStep.ball.y).toBe(50);
  });

  it('creates a new step with cloned player objects instead of shared references', () => {
    const { result } = renderHook(() => useEditorState(undefined, 'personal', 'new', {
      presetId: 'f-433',
    }));

    act(() => {
      result.current.addStep();
    });

    const firstStepPlayerBeforeMove = result.current.state.steps[0].players[0];

    act(() => {
      result.current.movePlayer(firstStepPlayerBeforeMove.id, 12, 18);
    });

    expect(result.current.state.steps[0].players[0].x).not.toBe(12);
    expect(result.current.state.steps[0].players[0].y).not.toBe(18);
    expect(result.current.state.steps[1].players[0].x).toBe(12);
    expect(result.current.state.steps[1].players[0].y).toBe(18);
  });
});
