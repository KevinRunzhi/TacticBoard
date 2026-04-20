import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { MobileFormationsDrawer } from '@/components/tactics/MobileFormationsDrawer';

describe('mobile formations drawer', () => {
  it('filters formations and applies the selected formation from the mobile drawer', () => {
    const onClose = vi.fn();
    const onApplyFormation = vi.fn();

    render(
      <MobileFormationsDrawer
        open
        fieldFormat="11v11"
        onClose={onClose}
        onApplyFormation={onApplyFormation}
      />,
    );

    expect(screen.getByRole('button', { name: '4-4-2' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '3-5-2' })).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText('搜索阵型...'), {
      target: { value: '4-4' },
    });

    expect(screen.getByRole('button', { name: '4-4-2' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '3-5-2' })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '4-4-2' }));

    expect(onApplyFormation).toHaveBeenCalledWith('f-442');
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
