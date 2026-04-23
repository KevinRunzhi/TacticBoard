import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { MobilePropertiesDrawer } from '@/components/tactics/MobilePropertiesDrawer';
import { TabletRightDrawer } from '@/components/tactics/TabletRightDrawer';
import type { RightPanelProps } from '@/components/tactics/RightPanel';
import type { TacticsLine, TextNote } from '@/types/tactics';

function createBaseRightPanelProps(overrides?: Partial<Omit<RightPanelProps, 'embedded'>>) {
  return {
    projectName: '战术板',
    selectedPlayer: null,
    selectedLine: null,
    selectedText: null,
    selectedArea: null,
    playerStyle: 'dot',
    matchMeta: {
      title: '',
      score: '',
      minute: '',
      phaseLabel: '',
    },
    referenceImage: null,
    stepDescription: '',
    onProjectNameChange: vi.fn(),
    onMatchMetaChange: vi.fn(),
    onStepDescriptionChange: vi.fn(),
    onPlayerNameChange: vi.fn(),
    onPlayerNumberChange: vi.fn(),
    onPlayerPositionChange: vi.fn(),
    onPlayerTeamChange: vi.fn(),
    onPlayerAvatarImport: vi.fn(),
    onPlayerAvatarRemove: vi.fn(),
    onDeletePlayer: vi.fn(),
    onTextContentChange: vi.fn(),
    onTextStyleChange: vi.fn(),
    onTextXChange: vi.fn(),
    onTextYChange: vi.fn(),
    onDeleteText: vi.fn(),
    onLineTypeChange: vi.fn(),
    onLineFromXChange: vi.fn(),
    onLineFromYChange: vi.fn(),
    onLineToXChange: vi.fn(),
    onLineToYChange: vi.fn(),
    onDeleteLine: vi.fn(),
    onAreaShapeChange: vi.fn(),
    onAreaWidthChange: vi.fn(),
    onAreaHeightChange: vi.fn(),
    onAreaOpacityChange: vi.fn(),
    onAreaStrokeColorChange: vi.fn(),
    onAreaFillColorChange: vi.fn(),
    onDeleteArea: vi.fn(),
    onReferenceImageImport: vi.fn(),
    onReferenceImageVisibilityChange: vi.fn(),
    onReferenceImageOpacityChange: vi.fn(),
    onReferenceImageScaleChange: vi.fn(),
    onReferenceImageOffsetXChange: vi.fn(),
    onReferenceImageOffsetYChange: vi.fn(),
    onReferenceImageResetTransform: vi.fn(),
    onReferenceImageRemove: vi.fn(),
    ...overrides,
  } satisfies Omit<RightPanelProps, 'embedded'>;
}

describe('responsive properties drawers', () => {
  it('keeps text properties editable inside the mobile drawer', () => {
    const selectedText: TextNote = {
      id: 'text-1',
      text: '原始文本',
      x: 42,
      y: 57,
      style: 'body',
    };
    const onTextContentChange = vi.fn();

    render(
      <MobilePropertiesDrawer
        open
        onClose={vi.fn()}
        {...createBaseRightPanelProps({
          selectedText,
          onTextContentChange,
        })}
      />,
    );

    expect(screen.getByText('文本属性')).toBeInTheDocument();

    fireEvent.change(screen.getByDisplayValue('原始文本'), {
      target: { value: '更新后的文本' },
    });

    expect(onTextContentChange).toHaveBeenCalledWith('更新后的文本');
  });

  it('keeps line properties editable inside the tablet drawer without duplicating the title chrome', () => {
    const selectedLine: TacticsLine = {
      id: 'line-1',
      type: 'pass',
      fromX: 12,
      fromY: 18,
      toX: 64,
      toY: 72,
    };
    const onLineTypeChange = vi.fn();

    render(
      <TabletRightDrawer
        open
        onClose={vi.fn()}
        {...createBaseRightPanelProps({
          selectedLine,
          onLineTypeChange,
        })}
      />,
    );

    expect(screen.getAllByText('线路属性')).toHaveLength(1);

    fireEvent.change(screen.getByDisplayValue('传球'), {
      target: { value: 'shoot' },
    });

    expect(onLineTypeChange).toHaveBeenCalledWith('shoot');
  });
});
