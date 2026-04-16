import { beforeEach, describe, expect, it } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import DashboardV2 from '@/pages/DashboardV2';
import EditorPage from '@/pages/Index';
import { WorkspaceProvider } from '@/context/workspace-context.tsx';
import { clearAllLocalProjectData } from '@/data/mockProjects';
import { routerFutureFlags } from '@/lib/platform';

describe('editor save and return flow', () => {
  beforeEach(() => {
    window.localStorage.clear();
    clearAllLocalProjectData();
  });

  it('shows first-save feedback in the editor and on the workbench after returning', async () => {
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
  });
});
