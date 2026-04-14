import { beforeEach, describe, expect, it } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useEditorState } from '@/hooks/useEditorState';

describe('area objects', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('creates, edits, and persists area objects across save and reopen', () => {
    const { result } = renderHook(() => useEditorState(undefined, 'personal', 'new'));

    act(() => {
      result.current.addAreaAt(42, 28);
    });

    expect(result.current.currentStep.areas).toHaveLength(1);
    expect(result.current.state.selectedAreaId).toBe(result.current.currentStep.areas?.[0].id ?? null);

    act(() => {
      result.current.updateSelectedArea((area) => ({
        ...area,
        shape: 'ellipse',
        width: 24,
        height: 18,
        opacity: 0.35,
        strokeColor: '#ffffff',
        fillColor: '#22c55e',
      }));
    });

    let savedProjectId = '';
    act(() => {
      savedProjectId = result.current.saveProject();
    });

    const reopened = renderHook(() => useEditorState(savedProjectId, 'personal', 'project'));
    const reopenedArea = reopened.result.current.currentStep.areas?.[0];

    expect(reopenedArea).toMatchObject({
      shape: 'ellipse',
      width: 24,
      height: 18,
      opacity: 0.35,
      strokeColor: '#ffffff',
      fillColor: '#22c55e',
    });
  });
});
