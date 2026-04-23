import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import EditorPage from '@/pages/Index';
import { WorkspaceProvider } from '@/context/workspace-context.tsx';
import { clearAllLocalProjectData } from '@/data/mockProjects';
import * as mockProjects from '@/data/mockProjects';
import { routerFutureFlags } from '@/lib/platform';

function setDesktopMatchMedia() {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: query.includes('min-width: 1024px'),
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }));
}

function LocationProbe() {
  const location = useLocation();

  return <div data-testid="location-probe">{`${location.pathname}${location.search}`}</div>;
}

describe('editor save integrity', () => {
  beforeEach(() => {
    window.localStorage.clear();
    clearAllLocalProjectData();
    vi.restoreAllMocks();
    setDesktopMatchMedia();
  });

  it('marks a saved project dirty when only the placement team changes', async () => {
    render(
      <WorkspaceProvider>
        <MemoryRouter future={routerFutureFlags} initialEntries={['/editor?mode=new']}>
          <Routes>
            <Route path="/editor" element={<><LocationProbe /><EditorPage /></>} />
            <Route path="/editor/:projectId" element={<><LocationProbe /><EditorPage /></>} />
          </Routes>
        </MemoryRouter>
      </WorkspaceProvider>,
    );

    fireEvent.click(screen.getByLabelText('保存项目'));

    await waitFor(() => {
      expect(screen.getByText('首次已保存')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByTestId('location-probe').textContent).toMatch(/^\/editor\/project-/);
    });

    const awayTeamButtons = screen.getAllByRole('button', { name: '客队' });
    fireEvent.click(awayTeamButtons[awayTeamButtons.length - 1]);

    await waitFor(() => {
      expect(screen.getByText('有未保存修改')).toBeInTheDocument();
    });
  }, 10000);

  it('keeps the editor unsaved when persistence throws during save', async () => {
    vi.spyOn(mockProjects, 'saveProjectState').mockImplementation(() => {
      throw new Error('storage full');
    });

    render(
      <WorkspaceProvider>
        <MemoryRouter future={routerFutureFlags} initialEntries={['/editor?mode=new']}>
          <Routes>
            <Route path="/editor" element={<><LocationProbe /><EditorPage /></>} />
            <Route path="/editor/:projectId" element={<><LocationProbe /><EditorPage /></>} />
          </Routes>
        </MemoryRouter>
      </WorkspaceProvider>,
    );

    fireEvent.click(screen.getByLabelText('保存项目'));

    await waitFor(() => {
      expect(screen.getByText('未保存')).toBeInTheDocument();
    });

    expect(screen.queryByText('首次已保存')).not.toBeInTheDocument();
    expect(Object.keys(window.localStorage).some((key) => key.startsWith('tactics-canvas:project:v1:'))).toBe(false);
  });
});
