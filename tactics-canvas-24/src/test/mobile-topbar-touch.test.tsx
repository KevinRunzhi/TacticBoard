import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { MobileTopBar } from '@/components/tactics/MobileTopBar';

describe('mobile topbar touch interactions', () => {
  it('fires return, save, and export actions from touch handlers without double-firing the follow-up click', () => {
    const onReturnToWorkspace = vi.fn();
    const onSave = vi.fn();
    const onExport = vi.fn();

    render(
      <MobileTopBar
        projectName="Slice 2"
        saveStatusLabel="未保存"
        saveStatusTone="warning"
        fieldFormat="11v11"
        fieldView="full"
        onFieldFormatChange={vi.fn()}
        onFieldViewChange={vi.fn()}
        onSave={onSave}
        onExport={onExport}
        onReturnToWorkspace={onReturnToWorkspace}
      />,
    );

    const returnButton = screen.getByLabelText('返回工作台');
    fireEvent.touchEnd(returnButton);
    fireEvent.click(returnButton);
    expect(onReturnToWorkspace).toHaveBeenCalledTimes(1);

    const saveButton = screen.getByLabelText('保存项目');
    fireEvent.touchEnd(saveButton);
    fireEvent.click(saveButton);
    expect(onSave).toHaveBeenCalledTimes(1);

    const exportButton = screen.getByLabelText('导出项目');
    fireEvent.pointerUp(exportButton, { pointerType: 'touch' });
    fireEvent.click(exportButton);
    expect(onExport).toHaveBeenCalledTimes(1);
  });
});
