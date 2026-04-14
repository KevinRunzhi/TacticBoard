import { beforeEach, describe, expect, it } from 'vitest';
import { act, render, renderHook, screen } from '@testing-library/react';
import { LeftPanel } from '@/components/tactics/LeftPanel';
import { MobileToolbar } from '@/components/tactics/MobileToolbar';
import { TabletToolStrip } from '@/components/tactics/TabletToolStrip';
import { WorkspaceProvider } from '@/context/workspace-context.tsx';
import { useWorkspace } from '@/hooks/useWorkspace';

describe('main flow cleanup', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('keeps only implemented tool entries in the main editor chrome', () => {
    render(
      <>
        <LeftPanel
          currentTool="select"
          fieldFormat="11v11"
          onToolChange={() => {}}
          onApplyFormation={() => {}}
        />
        <MobileToolbar
          currentTool="select"
          fieldFormat="11v11"
          onToolChange={() => {}}
          onOpenSteps={() => {}}
          onOpenProperties={() => {}}
        />
        <TabletToolStrip
          onOpenTools={() => {}}
          onOpenFormations={() => {}}
          onOpenProperties={() => {}}
        />
      </>,
    );

    expect(screen.queryByRole('button', { name: '图层' })).not.toBeInTheDocument();
    expect(screen.queryByText('快捷操作')).not.toBeInTheDocument();
    expect(screen.queryByText('保存当前阵型')).not.toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: '区域' }).length).toBeGreaterThan(0);
  });

  it('forces the workspace context to personal only', () => {
    window.localStorage.setItem('tactics-canvas:workspace', 'team');

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <WorkspaceProvider>{children}</WorkspaceProvider>
    );

    const { result } = renderHook(() => useWorkspace(), { wrapper });

    expect(result.current.workspace).toBe('personal');

    act(() => {
      result.current.setWorkspace('personal');
    });

    expect(result.current.workspace).toBe('personal');
    expect(window.localStorage.getItem('tactics-canvas:workspace')).toBe('personal');
  });
});
