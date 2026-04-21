import { beforeEach, describe, expect, it } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { createBlankEditorState, loadProjectEditorState, saveDraftState, saveProjectState } from '@/data/mockProjects';
import { useEditorState } from '@/hooks/useEditorState';

const NEW_DRAFT_STORAGE_KEY = 'tactics-canvas:draft:new:v1';
const PROJECT_DRAFT_STORAGE_PREFIX = 'tactics-canvas:draft:project:v1:';

function setDocumentVisibility(state: DocumentVisibilityState) {
  Object.defineProperty(document, 'visibilityState', {
    configurable: true,
    value: state,
  });
}

function dispatchHiddenLifecycle() {
  setDocumentVisibility('hidden');
  document.dispatchEvent(new Event('visibilitychange'));
}

describe('editor lifecycle recovery', () => {
  beforeEach(() => {
    window.localStorage.clear();
    setDocumentVisibility('visible');
  });

  it('flushes a new-project draft on visibility change and restores it through resume mode', () => {
    const { result, unmount } = renderHook(() => useEditorState(undefined, 'personal', 'new', {
      presetId: 'f-433',
    }));

    act(() => {
      result.current.setProjectName('Lifecycle Draft');
      result.current.addTextAt(42, 36);
      result.current.updateSelectedText((text) => ({
        ...text,
        text: 'Resume Marker',
      }));
    });

    act(() => {
      dispatchHiddenLifecycle();
    });

    const savedDraft = window.localStorage.getItem(NEW_DRAFT_STORAGE_KEY);
    expect(savedDraft).toContain('Lifecycle Draft');
    expect(savedDraft).toContain('Resume Marker');

    unmount();
    setDocumentVisibility('visible');

    const reopened = renderHook(() => useEditorState(undefined, 'personal', 'resume'));

    expect(reopened.result.current.state.projectName).toBe('Lifecycle Draft');
    expect(reopened.result.current.currentStep.texts[0]?.text).toBe('Resume Marker');
  });

  it('recovers unsaved project-draft changes and reference image after a lifecycle flush', () => {
    const projectId = saveProjectState(undefined, createBlankEditorState({
      projectName: 'Lifecycle Project',
      space: 'personal',
    }));

    const { result, unmount } = renderHook(() => useEditorState(projectId, 'personal', 'project'));

    act(() => {
      result.current.setProjectName('Lifecycle Project Draft');
      result.current.setReferenceImage({
        id: 'reference-1',
        name: 'recovery-board.png',
        localUri: 'data:image/png;base64,bGlmZWN5Y2xlLXJlZmVyZW5jZQ==',
        opacity: 0.5,
        scale: 1.2,
        offsetX: 8,
        offsetY: -6,
        locked: true,
        visible: true,
      });
    });

    act(() => {
      dispatchHiddenLifecycle();
    });

    unmount();
    setDocumentVisibility('visible');

    const reopened = renderHook(() => useEditorState(projectId, 'personal', 'project'));

    expect(reopened.result.current.state.projectName).toBe('Lifecycle Project Draft');
    expect(reopened.result.current.state.referenceImage).toEqual({
      id: 'reference-1',
      name: 'recovery-board.png',
      localUri: 'data:image/png;base64,bGlmZWN5Y2xlLXJlZmVyZW5jZQ==',
      opacity: 0.5,
      scale: 1.2,
      offsetX: 8,
      offsetY: -6,
      locked: true,
      visible: true,
    });
  });

  it('does not recreate the transient new-project draft after an explicit save', () => {
    const { result, unmount } = renderHook(() => useEditorState(undefined, 'personal', 'new'));

    act(() => {
      result.current.setProjectName('Saved Once');
    });

    let savedProjectId = '';
    act(() => {
      savedProjectId = result.current.saveProject();
    });

    expect(savedProjectId).toBeTruthy();
    expect(window.localStorage.getItem(NEW_DRAFT_STORAGE_KEY)).toBeNull();

    unmount();

    expect(window.localStorage.getItem(NEW_DRAFT_STORAGE_KEY)).toBeNull();
  });

  it('clears an equivalent saved-project draft instead of reopening as dirty', () => {
    const projectId = saveProjectState(undefined, createBlankEditorState({
      projectName: 'Saved Project',
      space: 'personal',
    }));
    const savedState = loadProjectEditorState(projectId);
    expect(savedState).toBeTruthy();

    saveDraftState(projectId, savedState!);
    expect(window.localStorage.getItem(`${PROJECT_DRAFT_STORAGE_PREFIX}${projectId}`)).toBeTruthy();

    const reopened = renderHook(() => useEditorState(projectId, 'personal', 'project'));

    expect(reopened.result.current.entrySource).toBe('project-saved');
    expect(window.localStorage.getItem(`${PROJECT_DRAFT_STORAGE_PREFIX}${projectId}`)).toBeNull();
  });

  it('does not create a project draft when a saved project is reopened without edits', async () => {
    const projectId = saveProjectState(undefined, createBlankEditorState({
      projectName: 'Stable Project',
      space: 'personal',
    }));

    renderHook(() => useEditorState(projectId, 'personal', 'project'));

    await act(async () => {
      await new Promise((resolve) => window.setTimeout(resolve, 1700));
    });

    expect(window.localStorage.getItem(`${PROJECT_DRAFT_STORAGE_PREFIX}${projectId}`)).toBeNull();
  });
});
