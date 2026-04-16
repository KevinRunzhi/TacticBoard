import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ExportConfigDialog } from '@/components/tactics/ExportConfigDialog';
import { MobileStepsDrawer } from '@/components/tactics/MobileStepsDrawer';
import { TabletLeftDrawer } from '@/components/tactics/TabletLeftDrawer';
import { createDefaultExportConfig } from '@/lib/export-config';

describe('accessibility labels', () => {
  it('adds stable labels to export dialog checkboxes', () => {
    render(
      <ExportConfigDialog
        open
        config={createDefaultExportConfig()}
        canIncludeReferenceImage
        canExportGif
        stepCount={3}
        onOpenChange={vi.fn()}
        onConfigChange={vi.fn()}
        onConfirm={vi.fn()}
      />,
    );

    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes).toHaveLength(6);
    checkboxes.forEach((checkbox) => {
      expect(checkbox).toHaveAttribute('aria-label');
      expect(checkbox.getAttribute('aria-label')).toBeTruthy();
      expect(checkbox).toHaveAccessibleName();
    });
  });

  it('adds stable labels to drawer icon buttons', () => {
    render(
      <>
        <MobileStepsDrawer
          open
          onClose={vi.fn()}
          steps={[
            {
              id: 'step-1',
              label: '第 1 步',
              players: [],
              lines: [],
              ball: { id: 'ball-1', x: 50, y: 50 },
              texts: [],
            },
          ]}
          currentIndex={0}
          isPlaying={false}
          onStepChange={vi.fn()}
          onTogglePlay={vi.fn()}
          onAddStep={vi.fn()}
          onDuplicateStep={vi.fn()}
          onDeleteStep={vi.fn()}
          onMoveStepLeft={vi.fn()}
          onMoveStepRight={vi.fn()}
        />
        <TabletLeftDrawer
          open
          onClose={vi.fn()}
          currentTool="select"
          fieldFormat="11v11"
          playerPlacementTeam="home"
          onToolChange={vi.fn()}
          onPlayerPlacementTeamChange={vi.fn()}
          onApplyFormation={vi.fn()}
        />
      </>,
    );

    expect(screen.getByRole('button', { name: '切换到上一步' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '播放步骤' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '切换到下一步' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '关闭步骤抽屉' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '关闭工具抽屉' })).toBeInTheDocument();
  });
});
