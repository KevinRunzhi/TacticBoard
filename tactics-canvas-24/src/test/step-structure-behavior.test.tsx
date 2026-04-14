import { beforeEach, describe, expect, it } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useEditorState } from '@/hooks/useEditorState';

describe('step structural behavior', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('stops playback and clears selection after add, duplicate, move, and delete step actions', () => {
    const { result } = renderHook(() => useEditorState(undefined, 'personal', 'new', {
      presetId: 'f-433',
    }));

    act(() => {
      result.current.addAreaAt(42, 35);
      result.current.togglePlay();
    });

    expect(result.current.state.isPlaying).toBe(true);
    expect(result.current.state.selectedAreaId).not.toBeNull();

    act(() => {
      result.current.addStep();
    });

    expect(result.current.state.isPlaying).toBe(false);
    expect(result.current.state.selectedAreaId).toBeNull();

    act(() => {
      result.current.selectArea(result.current.currentStep.areas?.[0]?.id ?? null);
      result.current.togglePlay();
      result.current.duplicateCurrentStep();
    });

    expect(result.current.state.isPlaying).toBe(false);
    expect(result.current.state.selectedAreaId).toBeNull();
    expect(result.current.state.steps).toHaveLength(3);

    act(() => {
      result.current.togglePlay();
      result.current.moveCurrentStep('left');
    });

    expect(result.current.state.isPlaying).toBe(false);
    expect(result.current.state.selectedAreaId).toBeNull();

    act(() => {
      result.current.togglePlay();
      result.current.deleteCurrentStep();
    });

    expect(result.current.state.isPlaying).toBe(false);
    expect(result.current.state.selectedAreaId).toBeNull();
    expect(result.current.state.steps).toHaveLength(2);
  });
});
