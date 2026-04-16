import { Play, Pause, Plus, Copy, ChevronLeft, ChevronRight, Trash2, X } from 'lucide-react';
import { StepFrame } from '@/types/tactics';

interface MobileStepsDrawerProps {
  open: boolean;
  onClose: () => void;
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
}

export function MobileStepsDrawer({
  open,
  onClose,
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
}: MobileStepsDrawerProps) {
  if (!open) return null;

  const canMoveLeft = currentIndex > 0;
  const canMoveRight = currentIndex < steps.length - 1;
  const canDelete = steps.length > 1;

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative panel-bg border-t border-border rounded-t-2xl max-h-[55vh] flex flex-col">
        <div className="flex items-center justify-center pt-2 pb-1">
          <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
        </div>

        <div className="flex items-center justify-between px-4 py-2 border-b border-border">
          <span className="text-sm font-medium text-foreground">
            步骤 {currentIndex + 1} / {steps.length}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onStepChange(Math.max(0, currentIndex - 1))}
              aria-label="切换到上一步"
              title="切换到上一步"
              className="w-7 h-7 rounded flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={onTogglePlay}
              aria-label={isPlaying ? '暂停步骤播放' : '播放步骤'}
              title={isPlaying ? '暂停步骤播放' : '播放步骤'}
              className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
            </button>
            <button
              onClick={() => onStepChange(Math.min(steps.length - 1, currentIndex + 1))}
              aria-label="切换到下一步"
              title="切换到下一步"
              className="w-7 h-7 rounded flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              aria-label="关闭步骤抽屉"
              title="关闭步骤抽屉"
              className="w-7 h-7 rounded flex items-center justify-center text-muted-foreground hover:text-foreground ml-2"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="border-b border-border px-4 py-2">
          <div className="flex items-center gap-2">
            <ActionButton icon={<Copy className="w-4 h-4" />} label="复制" onClick={onDuplicateStep} />
            <ActionButton icon={<ChevronLeft className="w-4 h-4" />} label="左移" onClick={onMoveStepLeft} disabled={!canMoveLeft} />
            <ActionButton icon={<ChevronRight className="w-4 h-4" />} label="右移" onClick={onMoveStepRight} disabled={!canMoveRight} />
            <ActionButton icon={<Trash2 className="w-4 h-4" />} label="删除" onClick={onDeleteStep} disabled={!canDelete} danger />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3">
          <div className="grid grid-cols-3 gap-2">
            {steps.map((step, i) => (
              <button
                key={step.id}
                onClick={() => onStepChange(i)}
                className={`flex flex-col items-center gap-1.5 p-2.5 rounded-xl transition-all ${
                  i === currentIndex
                    ? 'bg-primary/15 border border-primary/40'
                    : 'border border-border hover:bg-secondary'
                }`}
              >
                <div className={`w-full aspect-[3/2] rounded-md flex items-center justify-center ${
                  i === currentIndex ? 'bg-pitch/30' : 'bg-secondary'
                }`}>
                  <div className="flex gap-[2px]">
                    {step.players.slice(0, 5).map((_, pi) => (
                      <div key={pi} className={`w-1.5 h-1.5 rounded-full ${i === currentIndex ? 'bg-primary' : 'bg-muted-foreground'}`} />
                    ))}
                  </div>
                </div>
                <span className={`text-xs ${i === currentIndex ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                  {step.label}
                </span>
              </button>
            ))}

            <button
              onClick={onAddStep}
              className="flex flex-col items-center justify-center gap-1 p-2.5 rounded-xl border border-dashed border-border text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span className="text-xs">添加</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ActionButton({
  icon,
  label,
  onClick,
  disabled,
  danger,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs transition-colors ${
        danger
          ? 'border-destructive/30 bg-destructive/10 text-destructive hover:bg-destructive/15'
          : 'border-border bg-secondary/30 text-foreground/80 hover:bg-secondary'
      } disabled:cursor-not-allowed disabled:opacity-40`}
    >
      {icon}
      {label}
    </button>
  );
}
