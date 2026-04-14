import { beforeEach, describe, expect, it } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useEditorState } from '@/hooks/useEditorState';
import { createBlankEditorState, saveDraftState, saveProjectState } from '@/data/mockProjects';

describe('editor entry semantics', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('starts a blank project for mode=new even when an unsaved draft exists', () => {
    const draftState = createBlankEditorState({
      projectName: '未命名草稿',
      fieldFormat: '8v8',
      space: 'personal',
    });

    saveDraftState(undefined, draftState);

    const { result } = renderHook(() => useEditorState(undefined, 'personal', 'new'));

    expect(result.current.state.projectName).toBe('新建战术板');
    expect(result.current.state.fieldFormat).toBe('11v11');
  });

  it('restores the unsaved draft for mode=resume', () => {
    const draftState = createBlankEditorState({
      projectName: '恢复中的草稿',
      fieldFormat: '7v7',
      space: 'personal',
    });

    saveDraftState(undefined, draftState);

    const { result } = renderHook(() => useEditorState(undefined, 'personal', 'resume'));

    expect(result.current.state.projectName).toBe('恢复中的草稿');
    expect(result.current.state.fieldFormat).toBe('7v7');
  });

  it('opens a saved project when projectId is provided', () => {
    const state = createBlankEditorState({
      projectName: '正式项目',
      fieldFormat: '5v5',
      space: 'personal',
    });

    const projectId = saveProjectState(undefined, state);

    const { result } = renderHook(() => useEditorState(projectId, 'personal', 'project'));

    expect(result.current.state.projectName).toBe('正式项目');
    expect(result.current.state.fieldFormat).toBe('5v5');
  });

  it('uses preset quick start as a forced new project and ignores resume draft', () => {
    const draftState = createBlankEditorState({
      projectName: '不应被恢复的草稿',
      fieldFormat: '5v5',
      space: 'personal',
    });

    saveDraftState(undefined, draftState);

    const { result } = renderHook(() => useEditorState(undefined, 'personal', 'new', {
      presetId: 'f-433',
    }));

    expect(result.current.state.projectName).toBe('新建战术板');
    expect(result.current.state.fieldFormat).toBe('11v11');
    expect(result.current.currentStep.players.length).toBeGreaterThan(0);
  });
});
