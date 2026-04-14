import { beforeEach, describe, expect, it } from 'vitest';
import {
  clearAllLocalProjectData,
  cloneEditorState,
  createBlankEditorState,
  deleteProject,
  duplicateProject,
  getLocalProjectDataSummary,
  getProjectsForWorkspace,
  getSavedProjectsForWorkspace,
  renameProject,
  saveDraftState,
  saveProjectState,
} from '@/data/mockProjects';
import { normalizeProjectNameValue } from '@/lib/project-name';
import { cloneStepFrame } from '@/lib/step-frame';

describe('mock project storage', () => {
  beforeEach(() => {
    window.localStorage.clear();
    clearAllLocalProjectData();
  });

  it('renames, duplicates, and deletes saved projects against the real local index', () => {
    const baseState = createBlankEditorState({
      projectName: '主链路项目',
      space: 'personal',
    });

    const originalProjectId = saveProjectState(undefined, baseState);
    expect(renameProject(originalProjectId, '重命名后的项目')).toBe(true);

    const duplicatedProjectId = duplicateProject(originalProjectId);
    expect(duplicatedProjectId).toBeTruthy();

    expect(deleteProject(originalProjectId)).toBe(true);

    const projects = getSavedProjectsForWorkspace('personal');

    expect(projects).toHaveLength(1);
    expect(projects[0].id).toBe(duplicatedProjectId);
    expect(projects[0].name).toBe('重命名后的项目 副本');
  });

  it('keeps unnamed drafts separate from saved projects in the workspace listing', () => {
    const savedState = createBlankEditorState({
      projectName: '正式项目',
      space: 'personal',
    });
    const draftState = createBlankEditorState({
      projectName: '未保存草稿',
      space: 'personal',
    });

    saveProjectState(undefined, savedState);
    saveDraftState(undefined, draftState);

    const allProjects = getProjectsForWorkspace('personal');
    const savedProjects = getSavedProjectsForWorkspace('personal');

    expect(allProjects[0].isDraft).toBe(true);
    expect(allProjects[0].name).toBe('未保存草稿');
    expect(savedProjects).toHaveLength(1);
    expect(savedProjects[0].name).toBe('正式项目');
  });
  it('normalizes blank and legacy-corrupted default project names through the shared helper', () => {
    expect(normalizeProjectNameValue('')).toBe('新建战术板');
    expect(normalizeProjectNameValue('   ')).toBe('新建战术板');
    expect(normalizeProjectNameValue('閺傛澘缂?')).toBe('新建战术板');
  });

  it('uses UTF-8 byte size instead of raw character count for local data usage', () => {
    const savedState = createBlankEditorState({
      projectName: '中文项目',
      space: 'personal',
    });
    const draftState = createBlankEditorState({
      projectName: '战术草稿',
      space: 'personal',
    });

    saveProjectState(undefined, savedState);
    saveDraftState(undefined, draftState);

    const expectedTotalBytes = Array.from({ length: window.localStorage.length }).reduce((total, _, index) => {
      const key = window.localStorage.key(index);
      if (!key) return total;

      return total + new Blob([key, window.localStorage.getItem(key) ?? '']).size;
    }, 0);

    expect(getLocalProjectDataSummary().totalBytes).toBe(expectedTotalBytes);
  });

  it('shares the same step-frame cloning behavior between storage and editor utilities', () => {
    const baseState = createBlankEditorState({
      projectName: '共享步骤克隆',
      space: 'personal',
    });

    const unlabeledStep = {
      ...baseState.steps[0],
      label: '',
      description: 'shared clone',
    };

    const clonedFromLibrary = cloneStepFrame(unlabeledStep, 0);
    const clonedFromState = cloneEditorState({
      ...baseState,
      steps: [unlabeledStep],
    }).steps[0];

    expect(clonedFromState).toEqual(clonedFromLibrary);
    expect(clonedFromState.label).toBe('第 1 步');
  });
});
