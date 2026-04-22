import { beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import DashboardV2 from '@/pages/DashboardV2';
import EditorPage from '@/pages/Index';
import { WorkspaceProvider } from '@/context/workspace-context.tsx';
import { clearAllLocalProjectData } from '@/data/mockProjects';
import { routerFutureFlags } from '@/lib/platform';

function installSvgMocks() {
  const identityMatrix = {
    inverse: () => identityMatrix,
  };

  Object.defineProperty(SVGSVGElement.prototype, 'createSVGPoint', {
    configurable: true,
    writable: true,
    value() {
      return {
        x: 0,
        y: 0,
        matrixTransform() {
          return { x: this.x, y: this.y };
        },
      };
    },
  });

  Object.defineProperty(SVGSVGElement.prototype, 'getScreenCTM', {
    configurable: true,
    writable: true,
    value() {
      return identityMatrix;
    },
  });
}

describe('mobile mainflow baseline', () => {
  beforeAll(() => {
    installSvgMocks();
  });

  beforeEach(() => {
    window.localStorage.clear();
    clearAllLocalProjectData();
    window.localStorage.setItem('tactics_canvas_hint_shown', '1');
  });

  it('completes the mobile touch-first baseline from workbench to save-return-reopen', async () => {
    const { container } = render(
      <WorkspaceProvider>
        <MemoryRouter future={routerFutureFlags} initialEntries={['/']}>
          <Routes>
            <Route path="/" element={<DashboardV2 />} />
            <Route path="/editor" element={<EditorPage />} />
            <Route path="/editor/:projectId" element={<EditorPage />} />
          </Routes>
        </MemoryRouter>
      </WorkspaceProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: /新建空白项目/ }));

    await waitFor(() => {
      expect(screen.getByLabelText(/保存项目/)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /阵型/ }));

    await waitFor(() => {
      expect(screen.getByText(/选择阵型/)).toBeInTheDocument();
    });

    expect(screen.getByRole('button', { name: '4-4-2' })).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText(/关闭阵型抽屉/));

    await waitFor(() => {
      expect(screen.queryByText(/选择阵型/)).not.toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /对象/ }));
    fireEvent.click(screen.getByRole('button', { name: /球员/ }));

    const pitchSvg = container.querySelector('svg[viewBox="0 0 680 1000"]');
    expect(pitchSvg).not.toBeNull();

    fireEvent.click(pitchSvg!, { clientX: 180, clientY: 240 });
    expect(screen.queryByText(/球员属性/)).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /属性/ }));

    await waitFor(() => {
      expect(screen.getByText(/球员属性/)).toBeInTheDocument();
    });

    fireEvent.change(screen.getByDisplayValue(/主队球员 1/), {
      target: { value: '测试球员' },
    });

    fireEvent.click(screen.getByLabelText(/关闭属性抽屉/));

    fireEvent.click(screen.getByRole('button', { name: /步骤/ }));

    await waitFor(() => {
      expect(screen.getByText(/步骤 1 \/ 1/)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /添加/ }));

    await waitFor(() => {
      expect(screen.getByText(/步骤 2 \/ 2/)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByLabelText(/关闭步骤抽屉/));
    fireEvent.touchEnd(screen.getByLabelText(/保存项目/));

    await waitFor(() => {
      expect(screen.getByText(/首次已保存/)).toBeInTheDocument();
    });

    fireEvent.touchEnd(screen.getByLabelText(/返回工作台/));

    await waitFor(() => {
      expect(screen.getByText(/首次保存成功/)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /继续编辑/ }));

    await waitFor(() => {
      expect(screen.getByLabelText(/保存项目/)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /步骤/ }));

    await waitFor(() => {
      expect(screen.getByText(/步骤 2 \/ 2/)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByLabelText(/关闭步骤抽屉/));
    fireEvent.mouseDown(screen.getByText(/测试球/), { clientX: 180, clientY: 240 });
    fireEvent.click(screen.getByRole('button', { name: /属性/ }));

    await waitFor(() => {
      expect(screen.getByDisplayValue('测试球员')).toBeInTheDocument();
    });
  }, 15000);
});
