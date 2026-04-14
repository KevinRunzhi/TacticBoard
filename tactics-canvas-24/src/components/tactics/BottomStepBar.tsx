import { Play, Pause, Plus, Copy, SkipBack, SkipForward, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';
import { StepFrame } from '@/types/tactics';

interface BottomStepBarProps {
  steps: StepFrame[];
  currentIndex: number;
  isPlaying: boolean;
  onStepChange: (index: number) => void;
  onTogglePlay: () => void;
  onAddStep: () => void;
  onDuplicateStep: () => void;
  onDeleteStep: () => void;
  onMoveStepLeft: () => void;
  onMoveStepRight: () => void;
  compact?: boolean;
}

export function BottomStepBar({
  steps,
  currentIndex,
  isPlaying,
  onStepChange,
  onTogglePlay,
  onAddStep,
  onDuplicateStep,
  onDeleteStep,
  onMoveStepLeft,
  onMoveStepRight,
  compact,
}: BottomStepBarProps) {
  const canMoveLeft = currentIndex > 0;
  const canMoveRight = currentIndex < steps.length - 1;
  const canDelete = steps.length > 1;

  return (
    <div className={`toolbar-bg border-t border-border flex items-center px-3 gap-3 shrink-0 ${compact ? 'h-[56px]' : 'h-[72px]'}`}>
      <div className="flex items-center gap-1">
        <StepButton icon={<SkipBack className="w-3.5 h-3.5" />} onClick={() => onStepChange(0)} tooltip="第一步" />
        <StepButton icon={<ChevronLeft className="w-3.5 h-3.5" />} onClick={() => onStepChange(Math.max(0, currentIndex - 1))} tooltip="上一步" />
        <button
          onClick={onTogglePlay}
          className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors"
        >
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
        </button>
        <StepButton icon={<ChevronRight className="w-3.5 h-3.5" />} onClick={() => onStepChange(Math.min(steps.length - 1, currentIndex + 1))} tooltip="下一步" />
        <StepButton icon={<SkipForward className="w-3.5 h-3.5" />} onClick={() => onStepChange(steps.length - 1)} tooltip="最后一步" />
      </div>

      <div className="w-px h-8 bg-border" />

      <div className="flex-1 flex items-center gap-2 overflow-x-auto scrollbar-thin py-1">
        {steps.map((step, i) => (
          <button
            key={step.id}
            onClick={() => onStepChange(i)}
            className={`shrink-0 flex flex-col items-center gap-1 px-3 py-1.5 rounded-lg transition-all ${
              i === currentIndex
                ? 'bg-primary/15 border border-primary/40'
                : 'border border-transparent hover:bg-secondary hover:border-border'
            }`}
          >
            <div className={`w-12 h-8 rounded-sm flex items-center justify-center text-[8px] ${
              i === currentIndex ? 'bg-pitch/40' : 'bg-secondary'
            }`}>
              <div className="flex gap-[1px]">
                {step.players.slice(0, 5).map((_, pi) => (
                  <div key={pi} className={`w-1 h-1 rounded-full ${i === currentIndex ? 'bg-primary' : 'bg-muted-foreground'}`} />
                ))}
              </div>
            </div>
            <span className={`text-[10px] ${
              i === currentIndex ? 'text-primary font-medium' : 'text-muted-foreground'
            }`}>
              {step.label}
            </span>
          </button>
        ))}

        <button
          onClick={onAddStep}
          className="shrink-0 w-12 h-[52px] rounded-lg border border-dashed border-border flex flex-col items-center justify-center gap-0.5 text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="text-[9px]">添加</span>
        </button>
      </div>

      <div className="w-px h-8 bg-border" />

      <div className="shrink-0 text-right">
        <div className="text-xs text-foreground font-medium">
          {currentIndex + 1} / {steps.length}
        </div>
        <div className="text-[10px] text-muted-foreground mt-0.5 max-w-[120px] truncate">
          {steps[currentIndex]?.description || '当前步骤暂无说明'}
        </div>
      </div>

      <div className="w-px h-8 bg-border" />

      <div className="flex items-center gap-1">
        <StepButton
          icon={<Copy className="w-3.5 h-3.5" />}
          onClick={onDuplicateStep}
          tooltip="复制当前步骤"
        />
        <StepButton
          icon={<ChevronLeft className="w-3.5 h-3.5" />}
          onClick={onMoveStepLeft}
          tooltip="当前步骤左移"
          disabled={!canMoveLeft}
        />
        <StepButton
          icon={<ChevronRight className="w-3.5 h-3.5" />}
          onClick={onMoveStepRight}
          tooltip="当前步骤右移"
          disabled={!canMoveRight}
        />
        <StepButton
          icon={<Trash2 className="w-3.5 h-3.5" />}
          onClick={onDeleteStep}
          tooltip="删除当前步骤"
          disabled={!canDelete}
        />
      </div>
    </div>
  );
}

function StepButton({
  icon,
  onClick,
  tooltip,
  disabled,
}: {
  icon: React.ReactNode;
  onClick: () => void;
  tooltip: string;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      title={tooltip}
      aria-label={tooltip}
      disabled={disabled}
      className="w-7 h-7 rounded flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-muted-foreground"
    >
      {icon}
    </button>
  );
}
