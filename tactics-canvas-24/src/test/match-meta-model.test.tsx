import { beforeEach, describe, expect, it } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useEditorState } from '@/hooks/useEditorState';

describe('match meta model', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('persists project-level match meta fields after save and reopen', () => {
    const { result } = renderHook(() => useEditorState(undefined, 'personal', 'new'));

    act(() => {
      result.current.setMatchMetaField('title', '周末友谊赛战术复盘');
      result.current.setMatchMetaField('score', '2 - 1');
      result.current.setMatchMetaField('minute', "67'");
      result.current.setMatchMetaField('phaseLabel', '下半场高位逼抢');
    });

    let savedProjectId = '';
    act(() => {
      savedProjectId = result.current.saveProject();
    });

    const reopened = renderHook(() => useEditorState(savedProjectId, 'personal', 'project'));

    expect(reopened.result.current.state.matchMeta).toEqual({
      title: '周末友谊赛战术复盘',
      score: '2 - 1',
      minute: "67'",
      phaseLabel: '下半场高位逼抢',
    });
  });
});
