import {
  Undo2,
  Redo2,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Download,
  Save,
  MoreHorizontal,
  ChevronDown,
  MousePointer2,
  Eye,
  Home,
} from 'lucide-react';
import { FieldFormat, FieldView, FieldStyle, PlayerStyle } from '@/types/tactics';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export type ToolbarSaveStatusTone = 'warning' | 'success' | 'muted' | 'info';

interface TopToolbarProps {
  projectId?: string;
  projectName: string;
  saveStatusLabel: string;
  saveStatusTone: ToolbarSaveStatusTone;
  fieldFormat: FieldFormat;
  fieldView: FieldView;
  fieldStyle: FieldStyle;
  playerStyle: PlayerStyle;
  onFieldFormatChange: (format: FieldFormat) => void;
  onFieldViewChange: (view: FieldView) => void;
  onFieldStyleChange: (style: FieldStyle) => void;
  onPlayerStyleChange: (style: PlayerStyle) => void;
  canUndo: boolean;
  canRedo: boolean;
  zoomPercentage: number;
  onUndo: () => void;
  onRedo: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitToView: () => void;
  onSave: () => void;
  onExport: () => void;
  onReturnToWorkspace: () => void;
  compact?: boolean;
  onOpenLeftPanel?: () => void;
  onOpenRightPanel?: () => void;
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

const styleLabels: Record<FieldStyle, string> = {
  flat: '简洁平面',
  realistic: '草坪写实',
};

export function TopToolbar({
  projectName,
  saveStatusLabel,
  saveStatusTone,
  fieldFormat,
  fieldView,
  fieldStyle,
  playerStyle,
  onFieldFormatChange,
  onFieldViewChange,
  onFieldStyleChange,
  onPlayerStyleChange,
  canUndo,
  canRedo,
  zoomPercentage,
  onUndo,
  onRedo,
  onZoomIn,
  onZoomOut,
  onFitToView,
  onSave,
  onExport,
  onReturnToWorkspace,
  compact,
  onOpenLeftPanel,
  onOpenRightPanel,
}: TopToolbarProps) {
  return (
    <div className="toolbar-bg flex h-12 shrink-0 items-center gap-1 border-b border-border px-3">
      <button
        onClick={onReturnToWorkspace}
        aria-label="返回工作台"
        title="返回工作台"
        className="mr-1 flex h-7 w-7 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
      >
        <Home className="h-4 w-4" />
      </button>

      {compact && onOpenLeftPanel && (
        <button
          onClick={onOpenLeftPanel}
          title="打开工具面板"
          className="mr-1 flex h-7 w-7 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <MousePointer2 className="h-4 w-4" />
        </button>
      )}

      <div className="mr-4 flex min-w-0 items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded bg-primary">
          <span className="text-xs font-bold text-primary-foreground">T</span>
        </div>
        <span className="max-w-[180px] truncate text-sm font-medium text-foreground">{projectName}</span>
        <SaveStatusPill label={saveStatusLabel} tone={saveStatusTone} />
        {!compact && <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />}
      </div>

      <div className="mx-1 h-6 w-px bg-border" />

      <ToolbarDropdown
        label={formatLabels[fieldFormat]}
        options={Object.entries(formatLabels)}
        value={fieldFormat}
        onChange={(value) => onFieldFormatChange(value as FieldFormat)}
      />
      <ToolbarDropdown
        label={viewLabels[fieldView]}
        options={Object.entries(viewLabels)}
        value={fieldView}
        onChange={(value) => onFieldViewChange(value as FieldView)}
      />
      {!compact && (
        <ToolbarDropdown
          label={styleLabels[fieldStyle]}
          options={Object.entries(styleLabels)}
          value={fieldStyle}
          onChange={(value) => onFieldStyleChange(value as FieldStyle)}
        />
      )}

      <div className="mx-1 h-6 w-px bg-border" />

      {!compact && (
        <ToolbarButton
          icon={<Eye className="h-3.5 w-3.5" />}
          label={playerStyle === 'dot' ? '圆点' : '球衣'}
          onClick={() => onPlayerStyleChange(playerStyle === 'dot' ? 'card' : 'dot')}
        />
      )}

      {!compact && <div className="mx-1 h-6 w-px bg-border" />}

      {!compact && (
        <>
          <ToolbarIconButton icon={<Undo2 className="h-4 w-4" />} tooltip="撤销" onClick={onUndo} disabled={!canUndo} />
          <ToolbarIconButton icon={<Redo2 className="h-4 w-4" />} tooltip="重做" onClick={onRedo} disabled={!canRedo} />
        </>
      )}

      <div className="flex-1" />

      {!compact && (
        <>
          <ToolbarIconButton icon={<ZoomOut className="h-4 w-4" />} tooltip="缩小" onClick={onZoomOut} />
          <span className="min-w-[36px] px-1 text-center text-xs text-muted-foreground">{zoomPercentage}%</span>
          <ToolbarIconButton icon={<ZoomIn className="h-4 w-4" />} tooltip="放大" onClick={onZoomIn} />
          <ToolbarIconButton icon={<Maximize2 className="h-4 w-4" />} tooltip="适配屏幕" onClick={onFitToView} />
          <div className="mx-2 h-6 w-px bg-border" />
        </>
      )}

      <ToolbarIconButton icon={<Save className="h-4 w-4" />} tooltip="保存" ariaLabel="保存项目" onClick={onSave} />
      {!compact && (
        <button
          onClick={onExport}
          className="flex h-7 items-center gap-1.5 rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <Download className="h-3.5 w-3.5" />
          导出
        </button>
      )}

      {compact && onOpenRightPanel && (
        <button
          onClick={onOpenRightPanel}
          title="打开属性面板"
          className="flex h-7 w-7 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>
      )}
      {!compact && <ToolbarIconButton icon={<MoreHorizontal className="h-4 w-4" />} tooltip="更多" />}
    </div>
  );
}

function ToolbarIconButton({
  icon,
  tooltip,
  ariaLabel,
  onClick,
  disabled,
}: {
  icon: React.ReactNode;
  tooltip: string;
  ariaLabel?: string;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      title={tooltip}
      aria-label={ariaLabel ?? tooltip}
      onClick={onClick}
      disabled={disabled}
      className="flex h-7 w-7 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-muted-foreground"
    >
      {icon}
    </button>
  );
}

function ToolbarButton({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex h-7 items-center gap-1 rounded px-2 text-xs text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
    >
      {icon}
      {label}
    </button>
  );
}

function ToolbarDropdown({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: [string, string][];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex h-7 items-center gap-1 rounded px-2 text-xs text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground">
          {label}
          <ChevronDown className="h-3 w-3" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-[120px]">
        {options.map(([key, optionLabel]) => (
          <DropdownMenuItem
            key={key}
            onClick={() => onChange(key)}
            className={`text-xs ${key === value ? 'font-medium text-primary' : ''}`}
          >
            {optionLabel}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function SaveStatusPill({
  label,
  tone,
}: {
  label: string;
  tone: ToolbarSaveStatusTone;
}) {
  const toneClassName =
    tone === 'success'
      ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
      : tone === 'warning'
        ? 'border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300'
        : tone === 'info'
          ? 'border-sky-500/20 bg-sky-500/10 text-sky-700 dark:text-sky-300'
          : 'border-border/60 bg-muted/60 text-muted-foreground';

  return (
    <span className={`hidden rounded-full border px-2 py-0.5 text-[11px] font-medium sm:inline-flex ${toneClassName}`}>
      {label}
    </span>
  );
}
