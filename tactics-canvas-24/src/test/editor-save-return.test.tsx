import { beforeEach, describe, expect, it } from 'vitest';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import DashboardV2 from '@/pages/DashboardV2';
import EditorPage from '@/pages/Index';
import { WorkspaceProvider } from '@/context/workspace-context.tsx';
import { clearAllLocalProjectData } from '@/data/mockProjects';
import { routerFutureFlags } from '@/lib/platform';

const PROJECT_STORAGE_PREFIX = 'tactics-canvas:project:v1:';
const PROJECT_DRAFT_STORAGE_PREFIX = 'tactics-canvas:draft:project:v1:';

describe('editor save and return flow', () => {
  beforeEach(() => {
    window.localStorage.clear();
    clearAllLocalProjectData();
  });

  it('keeps a first-saved project clean when returning from the workbench', async () => {
    render(
      <WorkspaceProvider>
        <MemoryRouter future={routerFutureFlags} initialEntries={['/editor?mode=new']}>
          <Routes>
            <Route path="/" element={<DashboardV2 />} />
            <Route path="/editor" element={<EditorPage />} />
            <Route path="/editor/:projectId" element={<EditorPage />} />
          </Routes>
        </MemoryRouter>
      </WorkspaceProvider>,
    );

    fireEvent.click(screen.getByLabelText('保存项目'));

    await waitFor(() => {
      expect(screen.getByText('首次已保存')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByLabelText('返回工作台'));

    await waitFor(() => {
      expect(screen.getByText('首次保存成功')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: '继续编辑' }));

    await waitFor(() => {
      expect(screen.getByText('本地已保存')).toBeInTheDocument();
    });

    const projectStorageKey = Object.keys(window.localStorage).find((key) => key.startsWith(PROJECT_STORAGE_PREFIX));
    expect(projectStorageKey).toBeTruthy();
    const savedProjectId = projectStorageKey!.slice(PROJECT_STORAGE_PREFIX.length);

    await act(async () => {
      await new Promise((resolve) => window.setTimeout(resolve, 1700));
    });

    expect(window.localStorage.getItem(`${PROJECT_DRAFT_STORAGE_PREFIX}${savedProjectId}`)).toBeNull();

    fireEvent.click(screen.getByLabelText('返回工作台'));

    await waitFor(() => {
      expect(screen.getByText('已返回工作台')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: '继续编辑' }));

    await waitFor(() => {
      expect(screen.getByText('本地已保存')).toBeInTheDocument();
    });

    expect(screen.queryByText('有未保存修改')).not.toBeInTheDocument();
  }, 10000);
});
