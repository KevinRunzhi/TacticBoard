import { X } from 'lucide-react';
import { RightPanel, type RightPanelProps } from './RightPanel';

interface TabletRightDrawerProps extends Omit<RightPanelProps, 'embedded'> {
  open: boolean;
  onClose: () => void;
}

export function TabletRightDrawer({
  open,
  onClose,
  selectedPlayer,
  selectedLine,
  selectedText,
  selectedArea,
  ...rightPanelProps
}: TabletRightDrawerProps) {
  if (!open) return null;

  const title = selectedPlayer
    ? '球员属性'
    : selectedLine
      ? '线路属性'
      : selectedText
        ? '文本属性'
        : selectedArea
          ? '区域属性'
          : '项目属性';

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative flex h-full w-[300px] flex-col border-l border-border shadow-2xl animate-in slide-in-from-right duration-200 panel-bg">
        <div className="flex shrink-0 items-center justify-between border-b border-border px-3 py-2">
          <span className="text-sm font-medium text-foreground">{title}</span>
          <button
            onClick={onClose}
            aria-label="关闭属性抽屉"
            title="关闭属性抽屉"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex-1 overflow-hidden">
          <RightPanel {...rightPanelProps} selectedPlayer={selectedPlayer} selectedLine={selectedLine} selectedText={selectedText} selectedArea={selectedArea} embedded />
        </div>
      </div>
    </div>
  );
}
