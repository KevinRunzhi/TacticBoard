import { beforeEach, describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import DashboardV2 from '@/pages/DashboardV2';
import { clearAllLocalProjectData, createBlankEditorState, saveDraftState, saveProjectState } from '@/data/mockProjects';
import { routerFutureFlags } from '@/lib/platform';

describe('dashboard workbench entry', () => {
  beforeEach(() => {
    window.localStorage.clear();
    clearAllLocalProjectData();
  });

  it('shows the three main entry routes even when there is no local project yet', () => {
    render(
      <MemoryRouter future={routerFutureFlags}>
        <DashboardV2 />
      </MemoryRouter>,
    );

    expect(screen.getByText('战术工作台')).toBeInTheDocument();
    expect(screen.getByText('新建空白项目')).toBeInTheDocument();
    expect(screen.getByText('打开项目列表')).toBeInTheDocument();
    expect(screen.getByText('还没有可继续的项目')).toBeInTheDocument();
    expect(screen.getByText('当前共有 0 个正式项目')).toBeInTheDocument();
  });

  it('prioritizes the unsaved draft in the continue entry when both draft and saved project exist', () => {
    const draftState = createBlankEditorState({
      projectName: '未保存草稿',
      fieldFormat: '8v8',
      space: 'personal',
    });
    const savedState = createBlankEditorState({
      projectName: '正式项目 A',
      fieldFormat: '11v11',
      space: 'personal',
    });

    saveProjectState(undefined, savedState);
    saveDraftState(undefined, draftState);

    render(
      <MemoryRouter future={routerFutureFlags}>
        <DashboardV2 />
      </MemoryRouter>,
    );

    expect(screen.getByText('继续未保存草稿')).toBeInTheDocument();
    expect(screen.getByText(/当前同时存在未保存草稿和正式项目/)).toBeInTheDocument();
    expect(screen.getByText('正式项目 A')).toBeInTheDocument();
  });
});
