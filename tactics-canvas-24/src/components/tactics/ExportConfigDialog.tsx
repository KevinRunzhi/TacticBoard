import type { ExportConfig, ExportFormat, ExportRatio, GifSpeed } from '@/types/tactics';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { getEstimatedGifDurationMs, GIF_MAX_DURATION_MS } from '@/lib/tactics-export';

interface ExportConfigDialogProps {
  open: boolean;
  config: ExportConfig;
  canIncludeReferenceImage: boolean;
  canExportGif: boolean;
  stepCount: number;
  onOpenChange: (open: boolean) => void;
  onConfigChange: (config: ExportConfig) => void;
  onConfirm: () => void;
}

const formatOptions: Array<{
  value: ExportFormat;
  label: string;
  description: string;
}> = [
  {
    value: 'png',
    label: 'PNG 图片',
    description: '适合本地保存、发送和系统分享。',
  },
  {
    value: 'gif',
    label: 'GIF 动图',
    description: '按步骤顺序导出基础回合演示，不包含镜头动画和音频。',
  },
];

const ratioOptions: Array<{ value: ExportRatio; label: string; description: string }> = [
  { value: '1x', label: '标准清晰度', description: '导出尺寸与当前画布基准一致，速度更快。' },
  { value: '2x', label: '高清导出', description: '导出尺寸翻倍，更适合放大查看和投屏展示。' },
];

const gifSpeedOptions: Array<{ value: GifSpeed; label: string; description: string }> = [
  { value: 'slow', label: '慢', description: '更适合逐步讲解，每步停留更久。' },
  { value: 'standard', label: '标准', description: '适合大多数回合演示。' },
  { value: 'fast', label: '快', description: '适合步骤较多时控制总时长。' },
];

export function ExportConfigDialog({
  open,
  config,
  canIncludeReferenceImage,
  canExportGif,
  stepCount,
  onOpenChange,
  onConfigChange,
  onConfirm,
}: ExportConfigDialogProps) {
  const estimatedGifDuration = getEstimatedGifDurationMs(stepCount, config.gifSpeed);
  const exceedsGifLimit = config.format === 'gif' && estimatedGifDuration > GIF_MAX_DURATION_MS;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[min(88vh,760px)] w-[min(92vw,640px)] max-w-[640px] flex-col gap-0 overflow-hidden p-0">
        <DialogHeader className="shrink-0 border-b border-border/60 px-6 pb-4 pt-5">
          <DialogTitle>导出设置</DialogTitle>
          <DialogDescription>
            当前支持 PNG 图片导出，并在桌面端提供基础 GIF 导出。GIF 只基于步骤播放结果导出，不包含镜头动画和音频。
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
          <div className="space-y-4">
            <SectionTitle title="导出格式" />
            <div className="grid gap-2 sm:grid-cols-2">
              {formatOptions.map((option) => {
                const active = config.format === option.value;
                const disabled = option.value === 'gif' && !canExportGif;
                return (
                  <button
                    key={option.value}
                    type="button"
                    disabled={disabled}
                    onClick={() => onConfigChange({ ...config, format: option.value })}
                    className={`rounded-xl border px-4 py-3 text-left transition-colors ${
                      active
                        ? 'border-primary bg-primary/8'
                        : 'border-border bg-card hover:border-primary/40 hover:bg-primary/5'
                    } ${disabled ? 'cursor-not-allowed opacity-60 hover:border-border hover:bg-card' : ''}`}
                  >
                    <div className="text-sm font-medium text-foreground">{option.label}</div>
                    <div className="mt-1 text-xs leading-5 text-muted-foreground">{option.description}</div>
                    {disabled ? (
                      <div className="mt-2 text-[11px] text-amber-700 dark:text-amber-300">
                        GIF 首发优先支持桌面端，当前布局先仅开放 PNG。
                      </div>
                    ) : null}
                  </button>
                );
              })}
            </div>

            <SectionTitle title="导出清晰度" />
            <div className="space-y-2">
              {ratioOptions.map((option) => {
                const active = config.ratio === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => onConfigChange({ ...config, ratio: option.value })}
                    className={`w-full rounded-xl border px-4 py-3 text-left transition-colors ${
                      active
                        ? 'border-primary bg-primary/8'
                        : 'border-border bg-card hover:border-primary/40 hover:bg-primary/5'
                    }`}
                  >
                    <div className="text-sm font-medium text-foreground">{option.label}</div>
                    <div className="mt-1 text-xs text-muted-foreground">{option.description}</div>
                  </button>
                );
              })}
            </div>

            {config.format === 'gif' ? (
              <>
                <SectionTitle title="GIF 速度" />
                <div className="space-y-2 rounded-xl border border-border bg-card/60 p-3">
                  {gifSpeedOptions.map((option) => (
                    <ToggleChoiceRow
                      key={option.value}
                      active={config.gifSpeed === option.value}
                      label={option.label}
                      description={option.description}
                      onClick={() => onConfigChange({ ...config, gifSpeed: option.value })}
                    />
                  ))}
                  <div className={`rounded-lg border px-3 py-2 text-xs leading-5 ${
                    exceedsGifLimit
                      ? 'border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-200'
                      : 'border-border/60 bg-background/40 text-muted-foreground'
                  }`}>
                    预计总时长约 {Math.ceil(estimatedGifDuration / 1000)} 秒。GIF 首发上限为 15 秒，超出时请减少步骤数量、降低清晰度或选择更快的播放速度。
                  </div>
                </div>
              </>
            ) : null}

            <SectionTitle title="顶部信息条" />
            <div className="space-y-2 rounded-xl border border-border bg-card/60 p-3">
              <ToggleRow
                label="导出标题"
                description="控制顶部信息条左侧标题文字是否进入导出结果。"
                checked={config.includeTitle}
                onChange={(checked) => onConfigChange({ ...config, includeTitle: checked })}
              />
              <ToggleRow
                label="导出步骤信息"
                description="在导出结果底部追加当前步骤标签和步骤说明。"
                checked={config.includeStepInfo}
                onChange={(checked) => onConfigChange({ ...config, includeStepInfo: checked })}
              />
              <ToggleRow
                label="导出比赛信息"
                description="控制比分、分钟和阶段标签是否进入导出结果。"
                checked={config.includeMatchInfo}
                onChange={(checked) => onConfigChange({ ...config, includeMatchInfo: checked })}
              />
            </div>

            <SectionTitle title="辅助素材" />
            <div className="space-y-2 rounded-xl border border-border bg-card/60 p-3">
              <ToggleRow
                label="导出上一帧残影"
                description="默认不导出残影；开启后会带上上一帧球员与足球的低透明参考位置。"
                checked={config.includeGhostTrail}
                onChange={(checked) => onConfigChange({ ...config, includeGhostTrail: checked })}
              />
              <ToggleRow
                label="导出参考底图"
                description={canIncludeReferenceImage ? '默认不导出参考底图；开启后会按当前缩放和定位一起导出。' : '当前项目还没有参考底图，导入素材后才可开启。'}
                checked={config.includeReferenceImage}
                disabled={!canIncludeReferenceImage}
                onChange={(checked) => onConfigChange({ ...config, includeReferenceImage: checked })}
              />
              <ToggleRow
                label="透明背景"
                description="仅移除最外层画布背景，方便二次排版；球场本身仍会保留。"
                checked={config.transparentBackground}
                onChange={(checked) => onConfigChange({ ...config, transparentBackground: checked })}
              />
            </div>
          </div>
        </div>

        <DialogFooter className="sticky bottom-0 shrink-0 gap-2 border-t border-border/60 bg-background/95 px-6 py-4 backdrop-blur-sm sm:gap-2">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="h-9 rounded-lg border border-border bg-secondary px-4 text-sm font-medium text-foreground/80 transition-colors hover:bg-secondary/80"
          >
            取消
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="h-9 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={exceedsGifLimit}
          >
            {config.format === 'gif' ? '导出 GIF' : '导出 PNG'}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function SectionTitle({ title }: { title: string }) {
  return (
    <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
      {title}
    </div>
  );
}

function ToggleRow({
  label,
  description,
  checked,
  disabled,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className={`flex items-start justify-between gap-3 rounded-lg border border-border/50 bg-background/40 px-3 py-2 text-left ${disabled ? 'opacity-60' : ''}`}>
      <div className="min-w-0">
        <div className="text-sm font-medium text-foreground">{label}</div>
        <div className="mt-1 text-xs leading-5 text-muted-foreground">{description}</div>
      </div>
      <input
        type="checkbox"
        className="mt-1 h-4 w-4 shrink-0 accent-primary"
        checked={checked}
        disabled={disabled}
        onChange={(event) => {
          if (disabled) return;
          onChange(event.target.checked);
        }}
      />
    </label>
  );
}

function ToggleChoiceRow({
  active,
  label,
  description,
  onClick,
}: {
  active: boolean;
  label: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full rounded-lg border px-3 py-2 text-left transition-colors ${
        active
          ? 'border-primary bg-primary/8'
          : 'border-border/60 bg-background/40 hover:border-primary/40 hover:bg-primary/5'
      }`}
    >
      <div className="text-sm font-medium text-foreground">{label}</div>
      <div className="mt-1 text-xs leading-5 text-muted-foreground">{description}</div>
    </button>
  );
}
