import { beforeEach, describe, expect, it } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useEditorState } from '@/hooks/useEditorState';

describe('step management', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('duplicates the current step directly after the source step and keeps content cloned', () => {
    const { result } = renderHook(() => useEditorState(undefined, 'personal', 'new', {
      presetId: 'f-433',
    }));

    act(() => {
      result.current.setCurrentStepDescription('Original step description');
      result.current.addAreaAt(42, 35);
      result.current.duplicateCurrentStep();
    });

    expect(result.current.state.steps).toHaveLength(2);
    expect(result.current.state.currentStepIndex).toBe(1);
    expect(result.current.state.steps[0].label).toBe('第 1 步');
    expect(result.current.state.steps[1].label).toBe('第 2 步');
    expect(result.current.state.steps[1].description).toBe('Original step description');
    expect(result.current.state.steps[1].areas).toHaveLength(1);

    const duplicatedAreaId = result.current.state.steps[1].areas?.[0].id;
    expect(duplicatedAreaId).toBeDefined();

    act(() => {
      result.current.selectArea(duplicatedAreaId ?? null);
      result.current.updateSelectedArea((area) => ({ ...area, width: 30 }));
    });

    expect(result.current.state.steps[0].areas?.[0].width).not.toBe(30);
    expect(result.current.state.steps[1].areas?.[0].width).toBe(30);
  });

  it('deletes the current step and moves the active index to the nearest valid step', () => {
    const { result } = renderHook(() => useEditorState(undefined, 'personal', 'new', {
      presetId: 'f-433',
    }));

    act(() => {
      result.current.addStep();
      result.current.addStep();
    });

    expect(result.current.state.steps).toHaveLength(3);

    act(() => {
      result.current.setStep(1);
      result.current.deleteCurrentStep();
    });

    expect(result.current.state.steps).toHaveLength(2);
    expect(result.current.state.currentStepIndex).toBe(1);
    expect(result.current.state.steps[0].label).toBe('第 1 步');
    expect(result.current.state.steps[1].label).toBe('第 2 步');
  });

  it('never deletes the final remaining step', () => {
    const { result } = renderHook(() => useEditorState(undefined, 'personal', 'new'));

    act(() => {
      result.current.deleteCurrentStep();
    });

    expect(result.current.state.steps).toHaveLength(1);
    expect(result.current.state.currentStepIndex).toBe(0);
  });

  it('reorders the current step left and right while keeping the active step selected', () => {
    const { result } = renderHook(() => useEditorState(undefined, 'personal', 'new', {
      presetId: 'f-433',
    }));

    act(() => {
      result.current.setCurrentStepDescription('Step one');
      result.current.addStep();
    });

    act(() => {
      result.current.setCurrentStepDescription('Step two');
      result.current.addStep();
    });

    act(() => {
      result.current.setCurrentStepDescription('Step three');
      result.current.moveCurrentStep('left');
    });

    expect(result.current.state.currentStepIndex).toBe(1);
    expect(result.current.state.steps[1].description).toBe('Step three');

    act(() => {
      result.current.moveCurrentStep('left');
    });

    expect(result.current.state.currentStepIndex).toBe(0);
    expect(result.current.state.steps[0].description).toBe('Step three');

    act(() => {
      result.current.moveCurrentStep('right');
    });

    expect(result.current.state.currentStepIndex).toBe(1);
    expect(result.current.state.steps[1].description).toBe('Step three');
    expect(result.current.state.steps.map((step) => step.label)).toEqual(['第 1 步', '第 2 步', '第 3 步']);
  });
});
