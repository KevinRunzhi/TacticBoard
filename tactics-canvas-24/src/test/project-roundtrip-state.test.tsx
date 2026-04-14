import { beforeEach, describe, expect, it } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { duplicateProject, saveDraftState } from '@/data/mockProjects';
import { useEditorState } from '@/hooks/useEditorState';

describe('project state roundtrip', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('preserves editor display and formation metadata when reopening a saved project', () => {
    const { result } = renderHook(() => useEditorState(undefined, 'personal', 'new', {
      presetId: 'f-433',
    }));

    act(() => {
      result.current.setFieldView('half');
      result.current.setFieldStyle('flat');
      result.current.setPlayerStyle('card');
      result.current.setPlayerPlacementTeam('away');
      result.current.setMatchMetaField('score', '2 - 1');
      result.current.setMatchMetaField('minute', "67'");
      result.current.setMatchMetaField('phaseLabel', '下半场压迫');
    });

    let savedProjectId = '';
    act(() => {
      savedProjectId = result.current.saveProject();
    });

    const reopened = renderHook(() => useEditorState(savedProjectId, 'personal', 'project'));

    expect(reopened.result.current.state.fieldView).toBe('half');
    expect(reopened.result.current.state.fieldStyle).toBe('flat');
    expect(reopened.result.current.state.playerStyle).toBe('card');
    expect(reopened.result.current.state.playerPlacementTeam).toBe('away');
    expect(reopened.result.current.state.activeFormationId).toBe('f-433');
    expect(reopened.result.current.state.formationMode).toBe('preset');
    expect(reopened.result.current.state.matchMeta).toMatchObject({
      score: '2 - 1',
      minute: "67'",
      phaseLabel: '下半场压迫',
    });
  });

  it('duplicates the currently visible project state instead of resetting project-level settings', () => {
    const { result } = renderHook(() => useEditorState(undefined, 'personal', 'new', {
      presetId: 'f-433',
    }));

    let savedProjectId = '';
    act(() => {
      savedProjectId = result.current.saveProject();
    });

    act(() => {
      result.current.setFieldView('half');
      result.current.setFieldStyle('flat');
      result.current.setPlayerStyle('card');
      result.current.setPlayerPlacementTeam('away');
      result.current.setMatchMetaField('score', '3 - 2');
      result.current.setMatchMetaField('phaseLabel', '定位球二点');
      result.current.addTextAt(42, 36);
    });

    saveDraftState(savedProjectId, result.current.state);

    const duplicatedProjectId = duplicateProject(savedProjectId);
    expect(duplicatedProjectId).toBeTruthy();

    const reopenedDuplicate = renderHook(() => useEditorState(duplicatedProjectId ?? undefined, 'personal', 'project'));

    expect(reopenedDuplicate.result.current.state.projectName).toContain('副本');
    expect(reopenedDuplicate.result.current.state.fieldView).toBe('half');
    expect(reopenedDuplicate.result.current.state.fieldStyle).toBe('flat');
    expect(reopenedDuplicate.result.current.state.playerStyle).toBe('card');
    expect(reopenedDuplicate.result.current.state.playerPlacementTeam).toBe('away');
    expect(reopenedDuplicate.result.current.state.activeFormationId).toBe('f-433');
    expect(reopenedDuplicate.result.current.state.formationMode).toBe('preset');
    expect(reopenedDuplicate.result.current.state.matchMeta).toMatchObject({
      score: '3 - 2',
      phaseLabel: '定位球二点',
    });
    expect(reopenedDuplicate.result.current.currentStep.texts).toHaveLength(1);
  });
});
