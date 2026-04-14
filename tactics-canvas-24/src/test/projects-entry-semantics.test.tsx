import { beforeEach, describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ProjectsV2 from '@/pages/ProjectsV2';
import { clearAllLocalProjectData, createBlankEditorState, saveDraftState, saveProjectState } from '@/data/mockProjects';

describe('projects entry semantics', () => {
  beforeEach(() => {
    window.localStorage.clear();
    clearAllLocalProjectData();
  });

  it('separates the unsaved draft recovery area from the formal project list', () => {
    const draftState = createBlankEditorState({
      projectName: '战术草稿',
      fieldFormat: '7v7',
      space: 'personal',
    });
    const savedState = createBlankEditorState({
      projectName: '正式项目 B',
      fieldFormat: '11v11',
      space: 'personal',
    });

    saveProjectState(undefined, savedState);
    saveDraftState(undefined, draftState);

    render(
      <MemoryRouter>
        <ProjectsV2 />
      </MemoryRouter>,
    );

    expect(screen.getByText('继续未保存草稿')).toBeInTheDocument();
    expect(screen.getByText('放弃草稿')).toBeInTheDocument();
    expect(screen.getByText('1 个正式项目')).toBeInTheDocument();
    expect(screen.getByText('正式项目 B')).toBeInTheDocument();
  });
});
