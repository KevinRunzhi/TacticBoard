import { beforeEach, describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import SettingsV2 from '@/pages/SettingsV2';
import {
  clearAllLocalProjectData,
  createBlankEditorState,
  getLocalProjectDataSummary,
  getProjectsForWorkspace,
  saveDraftState,
  saveProjectState,
} from '@/data/mockProjects';
import { createDefaultExportConfig } from '@/lib/export-config';
import { getEditorPreferences } from '@/lib/editor-preferences';
import { WORKSPACE_STORAGE_KEY } from '@/types/workspace';

describe('settings data management', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('clears projects, drafts, workspace storage, and editor preferences without reseeding sample data', () => {
    const savedState = createBlankEditorState({
      projectName: '设置页清理测试',
      space: 'personal',
    });

    const draftState = createBlankEditorState({
      projectName: '未命名草稿恢复',
      space: 'personal',
    });

    saveProjectState(undefined, savedState);
    saveDraftState(undefined, draftState);
    window.localStorage.setItem(WORKSPACE_STORAGE_KEY, 'team');
    window.localStorage.setItem('tactics-canvas:preferences:v1', JSON.stringify({
      defaultFieldFormat: '8v8',
      defaultFieldStyle: 'flat',
      defaultPlayerStyle: 'card',
      defaultExportFormat: 'gif',
      defaultExportRatio: '1x',
    }));

    expect(getLocalProjectDataSummary().projectCount).toBeGreaterThan(0);
    expect(getLocalProjectDataSummary().draftCount).toBeGreaterThan(0);

    clearAllLocalProjectData();

    expect(getLocalProjectDataSummary()).toEqual({
      projectCount: 0,
      draftCount: 0,
      totalBytes: expect.any(Number),
    });
    expect(window.localStorage.getItem(WORKSPACE_STORAGE_KEY)).toBeNull();
    expect(getProjectsForWorkspace('personal')).toEqual([]);
    expect(getEditorPreferences()).toEqual({
      defaultFieldFormat: '11v11',
      defaultFieldStyle: 'realistic',
      defaultPlayerStyle: 'dot',
      defaultExportFormat: 'png',
      defaultExportRatio: '2x',
    });
  });

  it('updates editor preferences from the settings page and applies them to new projects and export defaults', () => {
    render(<SettingsV2 />);

    fireEvent.click(screen.getByRole('button', { name: '8人制 适合青训和小场对抗。' }));
    fireEvent.click(screen.getByRole('button', { name: '简洁平面 减少视觉干扰，更适合快速讲解。' }));
    fireEvent.click(screen.getByRole('button', { name: '球衣卡片 更强调身份识别，适合演示展示。' }));

    fireEvent.click(screen.getAllByRole('button', { name: '导出偏好' })[0]);
    fireEvent.click(screen.getByRole('button', { name: 'GIF 动图 适合导出步骤播放结果。' }));
    fireEvent.click(screen.getByRole('button', { name: '标准清晰度 导出速度更快，适合日常分享。' }));

    expect(getEditorPreferences()).toEqual({
      defaultFieldFormat: '8v8',
      defaultFieldStyle: 'flat',
      defaultPlayerStyle: 'card',
      defaultExportFormat: 'gif',
      defaultExportRatio: '1x',
    });

    const blankState = createBlankEditorState();
    expect(blankState.fieldFormat).toBe('8v8');
    expect(blankState.fieldStyle).toBe('flat');
    expect(blankState.playerStyle).toBe('card');

    expect(createDefaultExportConfig()).toMatchObject({
      format: 'gif',
      ratio: '1x',
    });
  });
});
