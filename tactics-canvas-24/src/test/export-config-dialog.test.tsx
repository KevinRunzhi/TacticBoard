import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { ExportConfigDialog } from '@/components/tactics/ExportConfigDialog';
import { createDefaultExportConfig } from '@/lib/export-config';

describe('export config dialog', () => {
  it('updates format, ratio, toggles, and confirms export with the current config', () => {
    const handleOpenChange = vi.fn();
    const handleConfigChange = vi.fn();
    const handleConfirm = vi.fn();
    const config = createDefaultExportConfig();

    render(
      <ExportConfigDialog
        open
        config={config}
        canIncludeReferenceImage
        canExportGif
        stepCount={5}
        onOpenChange={handleOpenChange}
        onConfigChange={handleConfigChange}
        onConfirm={handleConfirm}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: /GIF 动图/i }));
    expect(handleConfigChange).toHaveBeenCalledWith({
      ...config,
      format: 'gif',
    });

    fireEvent.click(screen.getByRole('button', { name: /标准清晰度/i }));
    expect(handleConfigChange).toHaveBeenCalledWith({
      ...config,
      ratio: '1x',
    });

    fireEvent.click(screen.getByLabelText(/导出标题/));
    expect(handleConfigChange).toHaveBeenCalledWith({
      ...config,
      includeTitle: false,
    });

    fireEvent.click(screen.getByLabelText(/导出比赛信息/));
    expect(handleConfigChange).toHaveBeenCalledWith({
      ...config,
      includeMatchInfo: false,
    });

    fireEvent.click(screen.getByLabelText(/导出参考底图/));
    expect(handleConfigChange).toHaveBeenCalledWith({
      ...config,
      includeReferenceImage: true,
    });

    fireEvent.click(screen.getByRole('button', { name: '导出 PNG' }));
    expect(handleConfirm).toHaveBeenCalledTimes(1);
  });

  it('disables GIF and reference-image toggles when the environment cannot support them', () => {
    const handleConfigChange = vi.fn();

    render(
      <ExportConfigDialog
        open
        config={createDefaultExportConfig()}
        canIncludeReferenceImage={false}
        canExportGif={false}
        stepCount={5}
        onOpenChange={vi.fn()}
        onConfigChange={handleConfigChange}
        onConfirm={vi.fn()}
      />,
    );

    expect(screen.getByText(/GIF 首发优先支持桌面端/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /GIF 动图/i }));
    expect(handleConfigChange).not.toHaveBeenCalled();

    const checkbox = screen.getByLabelText(/导出参考底图/) as HTMLInputElement;
    expect(checkbox.disabled).toBe(true);
    fireEvent.click(checkbox);
    expect(handleConfigChange).not.toHaveBeenCalled();
  });

  it('shows the gif duration warning and disables confirm when the estimated duration exceeds the limit', () => {
    const config = {
      ...createDefaultExportConfig(),
      format: 'gif' as const,
      gifSpeed: 'slow' as const,
    };

    render(
      <ExportConfigDialog
        open
        config={config}
        canIncludeReferenceImage={false}
        canExportGif
        stepCount={20}
        onOpenChange={vi.fn()}
        onConfigChange={vi.fn()}
        onConfirm={vi.fn()}
      />,
    );

    expect(screen.getByText(/GIF 首发上限为 15 秒/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '导出 GIF' })).toBeDisabled();
  });
});
