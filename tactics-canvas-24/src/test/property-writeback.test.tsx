import { beforeEach, describe, expect, it } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useEditorState } from '@/hooks/useEditorState';

describe('property writeback', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('persists project name, step description, and selected player fields after save', () => {
    const { result } = renderHook(() => useEditorState(undefined, 'personal', 'new', {
      presetId: 'f-433',
    }));

    const initialPlayer = result.current.currentStep.players[0];
    expect(initialPlayer).toBeDefined();

    act(() => {
      result.current.setProjectName('属性写回测试项目');
      result.current.setCurrentStepDescription('右侧属性面板保存后的步骤说明');
      result.current.selectPlayer(initialPlayer.id);
      result.current.updateSelectedPlayer((player) => ({
        ...player,
        name: '测试球员',
        number: 88,
        position: 'CM',
      }));
    });

    let savedProjectId = '';
    act(() => {
      savedProjectId = result.current.saveProject();
    });

    const reopened = renderHook(() => useEditorState(savedProjectId, 'personal', 'project'));

    expect(reopened.result.current.state.projectName).toBe('属性写回测试项目');
    expect(reopened.result.current.currentStep.description).toBe('右侧属性面板保存后的步骤说明');
    expect(reopened.result.current.currentStep.players[0].name).toBe('测试球员');
    expect(reopened.result.current.currentStep.players[0].number).toBe(88);
    expect(reopened.result.current.currentStep.players[0].position).toBe('CM');
  });
});
