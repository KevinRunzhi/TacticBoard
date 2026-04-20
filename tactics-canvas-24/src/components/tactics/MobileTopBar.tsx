import { useCallback, useRef } from 'react';
import { ChevronDown, Download, Home, Save } from 'lucide-react';
import { FieldFormat, FieldView } from '@/types/tactics';
import type { ToolbarSaveStatusTone } from './TopToolbar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface MobileTopBarProps {
  projectId?: string;
  projectName: string;
  saveStatusLabel: string;
  saveStatusTone: ToolbarSaveStatusTone;
  fieldFormat: FieldFormat;
  fieldView: FieldView;
  onFieldFormatChange: (format: FieldFormat) => void;
  onFieldViewChange: (view: FieldView) => void;
  onSave: () => void;
  onExport: () => void;
  onReturnToWorkspace: () => void;
}

const formatLabels: Record<FieldFormat, string> = {
  '11v11': '11人制',
  '8v8': '8人制',
  '7v7': '7人制',
  '5v5': '5人制',
};

const viewLabels: Record<FieldView, string> = {
  full: '全场',
  half: '半场',
};

export function MobileTopBar({
  projectName,
  saveStatusLabel,
  saveStatusTone,
  fieldFormat,
  fieldView,
  onFieldFormatChange,
  onFieldViewChange,
  onSave,
  onExport,
  onReturnToWorkspace,
}: MobileTopBarProps) {
  const lastTouchActivationRef = useRef<Record<string, number>>({});

  const triggerTouchAction = useCallback((key: string, action: () => void) => {
    const now = Date.now();
    const lastActivation = lastTouchActivationRef.current[key] ?? 0;
    if (now - lastActivation < 350) {
      return;
    }
    lastTouchActivationRef.current[key] = now;
    action();
  }, []);

  const buildTapHandlers = useCallback(
    (key: string, action: () => void) => ({
      onClick: () => {
        const now = Date.now();
        const lastActivation = lastTouchActivationRef.current[key] ?? 0;
        if (now - lastActivation < 350) {
          return;
        }
        action();
      },
      onPointerUp: (event: React.PointerEvent<HTMLButtonElement>) => {
        if (event.pointerType !== 'touch') {
          return;
        }
        event.preventDefault();
        triggerTouchAction(key, action);
      },
      onTouchEnd: (event: React.TouchEvent<HTMLButtonElement>) => {
        event.preventDefault();
        triggerTouchAction(key, action);
      },
    }),
    [triggerTouchAction],
  );

  return (
    <div className="toolbar-bg flex h-12 shrink-0 items-center gap-2 border-b border-border px-2.5">
      <button
        {...buildTapHandlers('return-to-workspace', onReturnToWorkspace)}
        aria-label="返回工作台"
        className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
      >
        <Home className="h-4 w-4" />
      </button>

      <div className="min-w-0 flex-1">
        <div className="truncate text-xs font-medium text-foreground">{projectName}</div>
        <div className={`mt-0.5 text-[10px] ${getStatusToneClassName(saveStatusTone)}`}>{saveStatusLabel}</div>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex h-8 items-center gap-1 rounded-lg px-2.5 text-[11px] text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground">
            {formatLabels[fieldFormat]}
            <ChevronDown className="h-2.5 w-2.5" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-[104px]">
          {Object.entries(formatLabels).map(([key, label]) => (
            <DropdownMenuItem
              key={key}
              onClick={() => onFieldFormatChange(key as FieldFormat)}
              className={`text-xs ${key === fieldFormat ? 'font-medium text-primary' : ''}`}
            >
              {label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex h-8 items-center gap-1 rounded-lg px-2.5 text-[11px] text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground">
            {viewLabels[fieldView]}
            <ChevronDown className="h-2.5 w-2.5" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-[96px]">
          {Object.entries(viewLabels).map(([key, label]) => (
            <DropdownMenuItem
              key={key}
              onClick={() => onFieldViewChange(key as FieldView)}
              className={`text-xs ${key === fieldView ? 'font-medium text-primary' : ''}`}
            >
              {label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <button
        {...buildTapHandlers('save-project', onSave)}
        aria-label="保存项目"
        className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
      >
        <Save className="h-3.5 w-3.5" />
      </button>

      <button
        {...buildTapHandlers('export-project', onExport)}
        aria-label="导出项目"
        className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
      >
        <Download className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

function getStatusToneClassName(tone: ToolbarSaveStatusTone) {
  if (tone === 'success') return 'text-emerald-600 dark:text-emerald-300';
  if (tone === 'warning') return 'text-amber-600 dark:text-amber-300';
  if (tone === 'info') return 'text-sky-600 dark:text-sky-300';
  return 'text-muted-foreground';
}
