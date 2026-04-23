import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Outlet, Route, Routes } from 'react-router-dom';
import { AppShellV2 } from '@/components/v2/AppShellV2';
import { MobileTopBar } from '@/components/tactics/MobileTopBar';
import { MobileToolbar } from '@/components/tactics/MobileToolbar';
import { TopToolbar } from '@/components/tactics/TopToolbar';

describe('mobile layout safe-area wiring', () => {
  it('applies safe-area classes to the mobile editor chrome', () => {
    const { container } = render(
      <>
        <MobileTopBar
          projectName="Safe Area"
          saveStatusLabel="未保存"
          saveStatusTone="warning"
          fieldFormat="11v11"
          fieldView="full"
          onFieldFormatChange={vi.fn()}
          onFieldViewChange={vi.fn()}
          onSave={vi.fn()}
          onExport={vi.fn()}
          onReturnToWorkspace={vi.fn()}
        />
        <MobileToolbar
          currentTool="select"
          fieldFormat="11v11"
          playerPlacementTeam="home"
          onToolChange={vi.fn()}
          onPlayerPlacementTeamChange={vi.fn()}
          onOpenSteps={vi.fn()}
          onOpenProperties={vi.fn()}
          onOpenFormations={vi.fn()}
        />
      </>,
    );

    const topBar = container.firstElementChild;
    expect(topBar).toHaveClass('safe-top');

    const bottomBar = container.lastElementChild;
    expect(bottomBar).not.toBeNull();
    expect(bottomBar).toHaveClass('min-h-[60px]');
    expect(bottomBar).toHaveClass('safe-bottom');
  });

  it('keeps the workspace shell on a dynamic viewport and preserves bottom safe-area spacing', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route element={<AppShellV2 />}>
            <Route path="/" element={<div>workspace-home</div>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    );

    const main = screen.getByRole('main');
    const shell = main.parentElement;

    expect(shell).toHaveClass('app-screen');
    expect(main).toHaveClass('pb-[calc(4rem+env(safe-area-inset-bottom,0px))]');

    const navigations = screen.getAllByRole('navigation');
    expect(navigations[1]).toHaveClass('safe-bottom');
  });

  it('uses a dedicated safe-area-aware shell for the tablet toolbar path', () => {
    const { container } = render(
      <TopToolbar
        projectName="Tablet Editor"
        saveStatusLabel="已保存"
        saveStatusTone="success"
        fieldFormat="11v11"
        fieldView="full"
        fieldStyle="realistic"
        playerStyle="card"
        onFieldFormatChange={vi.fn()}
        onFieldViewChange={vi.fn()}
        onFieldStyleChange={vi.fn()}
        onPlayerStyleChange={vi.fn()}
        canUndo
        canRedo
        zoomPercentage={100}
        onUndo={vi.fn()}
        onRedo={vi.fn()}
        onZoomIn={vi.fn()}
        onZoomOut={vi.fn()}
        onFitToView={vi.fn()}
        onSave={vi.fn()}
        onExport={vi.fn()}
        onReturnToWorkspace={vi.fn()}
        compact
      />,
    );

    expect(container.firstElementChild).toHaveClass('top-toolbar-shell');
  });
});
