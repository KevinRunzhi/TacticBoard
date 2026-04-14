import { beforeEach, describe, expect, it, vi, afterEach } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useEditorState } from '@/hooks/useEditorState';

const NEW_DRAFT_STORAGE_KEY = 'tactics-canvas:draft:new:v1';

describe('editor autosave during drag interactions', () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('skips autosave while dragging and saves once dragging ends', () => {
    const { result } = renderHook(() => useEditorState(undefined, 'personal', 'new', {
      presetId: 'f-433',
    }));

    const movingPlayerId = result.current.currentStep.players[0]?.id;
    expect(movingPlayerId).toBeTruthy();

    act(() => {
      result.current.beginPlayerMove();
      result.current.movePlayer(movingPlayerId!, 18, 24);
    });

    act(() => {
      vi.advanceTimersByTime(1600);
    });

    expect(window.localStorage.getItem(NEW_DRAFT_STORAGE_KEY)).toBeNull();

    act(() => {
      result.current.endPlayerMove();
    });

    act(() => {
      vi.advanceTimersByTime(1600);
    });

    const savedDraft = window.localStorage.getItem(NEW_DRAFT_STORAGE_KEY);
    expect(savedDraft).not.toBeNull();
    expect(savedDraft).toContain('"x":18');
    expect(savedDraft).toContain('"y":24');
  });
});
