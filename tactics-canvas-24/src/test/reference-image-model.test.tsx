import { beforeEach, describe, expect, it } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useEditorState } from '@/hooks/useEditorState';

describe('reference image model', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('persists project-level reference image state after save and reopen', () => {
    const { result } = renderHook(() => useEditorState(undefined, 'personal', 'new'));

    act(() => {
      result.current.setReferenceImage({
        id: 'reference-1',
        name: 'pitch-map.png',
        localUri: 'data:image/png;base64,ZmFrZS1yZWZlcmVuY2U=',
        opacity: 0.45,
        scale: 1,
        offsetX: 0,
        offsetY: 0,
        locked: true,
        visible: true,
      });
      result.current.updateReferenceImage((referenceImage) => ({
        ...referenceImage,
        opacity: 0.6,
        visible: false,
        scale: 1.45,
        offsetX: 12,
        offsetY: -8,
      }));
    });

    let savedProjectId = '';
    act(() => {
      savedProjectId = result.current.saveProject();
    });

    const reopened = renderHook(() => useEditorState(savedProjectId, 'personal', 'project'));

    expect(reopened.result.current.state.referenceImage).toEqual({
      id: 'reference-1',
      name: 'pitch-map.png',
      localUri: 'data:image/png;base64,ZmFrZS1yZWZlcmVuY2U=',
      opacity: 0.6,
      scale: 1.45,
      offsetX: 12,
      offsetY: -8,
      locked: true,
      visible: false,
    });
  });
});
