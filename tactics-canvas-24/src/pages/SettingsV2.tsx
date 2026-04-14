import { useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  Download,
  Eye,
  HardDrive,
  Info,
  Monitor,
  Trash2,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from '@/components/ui/sonner';
import {
  clearAllLocalProjectData,
  getLocalProjectDataSummary,
  type LocalProjectDataSummary,
} from '@/data/mockProjects';
import {
  DEFAULT_EDITOR_PREFERENCES,
  getEditorPreferences,
  updateEditorPreferences,
  type EditorPreferences,
} from '@/lib/editor-preferences';
import type { ExportFormat, ExportRatio, FieldFormat, FieldStyle, PlayerStyle } from '@/types/tactics';

type SettingsSection = 'display' | 'export' | 'data' | 'about';

const sections: { id: SettingsSection; label: string; icon: typeof Eye }[] = [
  { id: 'display', label: '显示偏好', icon: Eye },
  { id: 'export', label: '导出偏好', icon: Download },
  { id: 'data', label: '本地数据', icon: HardDrive },
  { id: 'about', label: '关于', icon: Info },
];

const fieldFormatOptions: Array<{ value: FieldFormat; label: string; description: string }> = [
  { value: '11v11', label: '11人制', description: '默认以标准全场战术板开始。' },
  { value: '8v8', label: '8人制', description: '适合青训和小场对抗。' },
  { value: '7v7', label: '7人制', description: '适合训练课和简化战术演示。' },
  { value: '5v5', label: '5人制', description: '适合室内和快节奏小场比赛。' },
];

const fieldStyleOptions: Array<{ value: FieldStyle; label: string; description: string }> = [
  { value: 'realistic', label: '写实草坪', description: '保留草坪质感，更适合比赛复盘。' },
  { value: 'flat', label: '简洁平面', description: '减少视觉干扰，更适合快速讲解。' },
];

const playerStyleOptions: Array<{ value: PlayerStyle; label: string; description: string }> = [
  { value: 'dot', label: '圆点样式', description: '信息密度更高，适合战术摆盘。' },
  { value: 'card', label: '球衣卡片', description: '更强调身份识别，适合演示展示。' },
];

const exportFormatOptions: Array<{ value: ExportFormat; label: string; description: string }> = [
  { value: 'png', label: 'PNG 图片', description: '适合静态分享和截图。' },
  { value: 'gif', label: 'GIF 动图', description: '适合导出步骤播放结果。' },
];

const exportRatioOptions: Array<{ value: ExportRatio; label: string; description: string }> = [
  { value: '1x', label: '标准清晰度', description: '导出速度更快，适合日常分享。' },
  { value: '2x', label: '高清导出', description: '适合投屏和放大查看。' },
];

const SettingsV2 = () => {
  const [active, setActive] = useState<SettingsSection>('display');
  const [clearOpen, setClearOpen] = useState(false);
  const [summary, setSummary] = useState<LocalProjectDataSummary>(() => getLocalProjectDataSummary());
  const [preferences, setPreferences] = useState<EditorPreferences>(() => getEditorPreferences());

  useEffect(() => {
    setSummary(getLocalProjectDataSummary());
    setPreferences(getEditorPreferences());
  }, []);

  const usageText = useMemo(() => formatBytes(summary.totalBytes), [summary.totalBytes]);

  const refreshSummary = () => {
    setSummary(getLocalProjectDataSummary());
  };

  const updatePreferences = <K extends keyof EditorPreferences>(key: K, value: EditorPreferences[K]) => {
    const nextPreferences = updateEditorPreferences({ [key]: value });
    setPreferences(nextPreferences);
    toast.success('设置已保存', {
      description: '新的默认值会在后续新建项目和导出时生效。',
    });
  };

  const handleClearData = () => {
    const result = clearAllLocalProjectData();
    refreshSummary();
    setPreferences(getEditorPreferences());
    setClearOpen(false);
    toast.success('本地数据已清除', {
      description: `已移除 ${result.removedProjectCount} 个项目和 ${result.removedDraftCount} 个草稿。`,
    });
  };

  return (
    <div className="mx-auto max-w-[920px] px-4 py-6 sm:px-8 sm:py-10 lg:px-12">
      <h1 className="mb-1 text-lg font-semibold tracking-tight text-foreground/90 sm:text-xl">设置</h1>
      <p className="mb-6 text-[12px] font-light text-muted-foreground/60 sm:mb-8 sm:text-[13px]">
        当前页面只保留与本地单机版本一致的真实设置，不展示未接入的假开关。
      </p>

      <div className="-mx-1 mb-5 flex gap-1 overflow-x-auto px-1 pb-1 scrollbar-thin md:hidden">
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <button
              key={section.id}
              onClick={() => setActive(section.id)}
              className={`flex h-8 items-center gap-1.5 whitespace-nowrap rounded-lg px-3 text-[11px] font-medium transition-all duration-200 ${
                active === section.id
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground/60 hover:bg-secondary/50 hover:text-foreground/80'
              }`}
            >
              <Icon className="size-3" />
              {section.label}
            </button>
          );
        })}
      </div>

      <div className="flex gap-6 sm:gap-8">
        <nav className="hidden w-44 shrink-0 flex-col gap-0.5 md:flex">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <button
                key={section.id}
                onClick={() => setActive(section.id)}
                className={`flex h-9 items-center gap-2.5 rounded-lg px-3 text-left text-[12px] font-medium transition-all duration-200 ${
                  active === section.id
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground/60 hover:bg-secondary/50 hover:text-foreground/80'
                }`}
              >
                <Icon className="size-3.5" />
                {section.label}
              </button>
            );
          })}
        </nav>

        <div className="min-w-0 flex-1">
          {active === 'display' && (
            <DisplaySection
              preferences={preferences}
              onFieldFormatChange={(value) => updatePreferences('defaultFieldFormat', value)}
              onFieldStyleChange={(value) => updatePreferences('defaultFieldStyle', value)}
              onPlayerStyleChange={(value) => updatePreferences('defaultPlayerStyle', value)}
            />
          )}
          {active === 'export' && (
            <ExportSection
              preferences={preferences}
              onExportFormatChange={(value) => updatePreferences('defaultExportFormat', value)}
              onExportRatioChange={(value) => updatePreferences('defaultExportRatio', value)}
            />
          )}
          {active === 'data' && (
            <DataSection
              summary={summary}
              usageText={usageText}
              onOpenClearDialog={() => setClearOpen(true)}
            />
          )}
          {active === 'about' && <AboutSection />}
        </div>
      </div>

      <Dialog open={clearOpen} onOpenChange={setClearOpen}>
        <DialogContent className="max-w-sm overflow-hidden border-border/40 bg-popover p-0">
          <div className="h-1 bg-gradient-to-r from-destructive/60 via-destructive/40 to-transparent" />
          <div className="px-6 pb-6 pt-5">
            <DialogHeader className="mb-5">
              <DialogTitle className="text-base text-foreground/90">确认清除所有本地数据？</DialogTitle>
              <DialogDescription className="mt-1 text-[12px] font-light leading-relaxed text-muted-foreground/50">
                这会删除当前设备中的项目、草稿和本地设置。清除后不可恢复。
              </DialogDescription>
            </DialogHeader>
            <div className="flex gap-2">
              <button
                onClick={() => setClearOpen(false)}
                className="h-9 flex-1 rounded-lg border border-border/30 bg-secondary text-[13px] font-medium text-foreground/70 transition-colors hover:bg-secondary/80"
              >
                取消
              </button>
              <button
                onClick={handleClearData}
                className="h-9 flex-1 rounded-lg bg-destructive/90 text-[13px] font-medium text-destructive-foreground transition-colors hover:bg-destructive"
              >
                确认清除
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

function SectionHeader({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="mb-6">
      <h2 className="text-base font-semibold text-foreground/90">{title}</h2>
      <p className="mt-1 text-[11px] font-light text-muted-foreground/50">{desc}</p>
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border/40 bg-card p-4 shadow-sm">
      <p className="text-[11px] font-medium text-muted-foreground/60">{label}</p>
      <p className="mt-2 text-lg font-semibold tracking-tight text-foreground/90">{value}</p>
    </div>
  );
}

function SettingGroup({
  title,
  icon,
  children,
}: {
  title: string;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border/40 bg-card p-4 shadow-sm">
      <div className="mb-4 flex items-center gap-2 text-[13px] font-medium text-foreground/85">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-border/30 bg-muted/30 text-muted-foreground/70">
          {icon}
        </span>
        {title}
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function ChoiceCards<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: Array<{ value: T; label: string; description: string }>;
  onChange: (value: T) => void;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`rounded-xl border px-4 py-3 text-left transition-colors ${
              active
                ? 'border-primary bg-primary/8'
                : 'border-border bg-card hover:border-primary/40 hover:bg-primary/5'
            }`}
          >
            <div className="text-sm font-medium text-foreground">{option.label}</div>
            <div className="mt-1 text-xs leading-5 text-muted-foreground">{option.description}</div>
          </button>
        );
      })}
    </div>
  );
}

function DisplaySection({
  preferences,
  onFieldFormatChange,
  onFieldStyleChange,
  onPlayerStyleChange,
}: {
  preferences: EditorPreferences;
  onFieldFormatChange: (value: FieldFormat) => void;
  onFieldStyleChange: (value: FieldStyle) => void;
  onPlayerStyleChange: (value: PlayerStyle) => void;
}) {
  return (
    <div className="space-y-6">
      <SectionHeader
        title="显示偏好"
        desc="这些选项会影响后续新建项目的默认球场和展示样式，不会覆盖已经保存的旧项目。"
      />

      <SettingGroup title="默认球场制式" icon={<Monitor className="size-4" />}>
        <ChoiceCards
          value={preferences.defaultFieldFormat}
          options={fieldFormatOptions}
          onChange={onFieldFormatChange}
        />
      </SettingGroup>

      <SettingGroup title="默认球场风格" icon={<Eye className="size-4" />}>
        <ChoiceCards
          value={preferences.defaultFieldStyle}
          options={fieldStyleOptions}
          onChange={onFieldStyleChange}
        />
      </SettingGroup>

      <SettingGroup title="默认球员样式" icon={<Eye className="size-4" />}>
        <ChoiceCards
          value={preferences.defaultPlayerStyle}
          options={playerStyleOptions}
          onChange={onPlayerStyleChange}
        />
      </SettingGroup>
    </div>
  );
}

function ExportSection({
  preferences,
  onExportFormatChange,
  onExportRatioChange,
}: {
  preferences: EditorPreferences;
  onExportFormatChange: (value: ExportFormat) => void;
  onExportRatioChange: (value: ExportRatio) => void;
}) {
  return (
    <div className="space-y-6">
      <SectionHeader
        title="导出偏好"
        desc="这里保存导出弹窗的默认格式和清晰度，后续打开导出面板时会优先使用。"
      />

      <SettingGroup title="默认导出格式" icon={<Download className="size-4" />}>
        <ChoiceCards
          value={preferences.defaultExportFormat}
          options={exportFormatOptions}
          onChange={onExportFormatChange}
        />
      </SettingGroup>

      <SettingGroup title="默认导出清晰度" icon={<Download className="size-4" />}>
        <ChoiceCards
          value={preferences.defaultExportRatio}
          options={exportRatioOptions}
          onChange={onExportRatioChange}
        />
      </SettingGroup>
    </div>
  );
}

function DataSection({
  summary,
  usageText,
  onOpenClearDialog,
}: {
  summary: LocalProjectDataSummary;
  usageText: string;
  onOpenClearDialog: () => void;
}) {
  return (
    <div className="space-y-6">
      <SectionHeader
        title="本地数据"
        desc="项目、草稿和默认设置都保存在当前设备，不依赖注册、账号或联网。"
      />
      <div className="grid gap-3 sm:grid-cols-3">
        <SummaryCard label="正式项目" value={`${summary.projectCount}`} />
        <SummaryCard label="草稿数量" value={`${summary.draftCount}`} />
        <SummaryCard label="本地占用" value={usageText} />
      </div>

      <div className="rounded-xl border border-destructive/15 bg-destructive/[0.03] p-4">
        <div className="flex items-start gap-3">
          <Trash2 className="mt-0.5 size-4 shrink-0 text-destructive/70" />
          <div className="min-w-0 flex-1">
            <p className="text-[12px] font-medium text-destructive/80 sm:text-[13px]">清除所有本地数据</p>
            <p className="mt-1 text-[10px] font-light leading-5 text-muted-foreground/55 sm:text-[11px]">
              这个操作会移除当前设备上的项目、草稿和本地设置，不会保留示例数据。
            </p>
          </div>
          <button
            onClick={onOpenClearDialog}
            className="shrink-0 rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-[11px] font-medium text-destructive/80 transition-colors hover:bg-destructive/20"
          >
            清除数据
          </button>
        </div>
      </div>
    </div>
  );
}

function AboutSection() {
  return (
    <div className="space-y-6">
      <SectionHeader
        title="关于"
        desc="当前版本信息与产品边界说明。"
      />
      <div className="space-y-3 rounded-xl border border-border/40 bg-card p-4 shadow-sm">
        <p className="text-[13px] font-medium text-foreground/85">TacticStudio v1.0.0</p>
        <p className="text-[11px] leading-5 text-muted-foreground/60">
          当前版本优先保证“新建 → 编辑 → 保存 → 项目管理 → 导出”这条主链路稳定可用。
        </p>
        <p className="text-[11px] leading-5 text-muted-foreground/60">
          默认首发面向 Windows 和 Android，本地安装、免注册、离线可用。
        </p>
        <p className="text-[11px] leading-5 text-muted-foreground/60">
          若要恢复初始默认值，可以使用上方“清除所有本地数据”，或重新选择新的默认项。
        </p>
      </div>

      <div className="rounded-xl border border-border/30 bg-muted/20 px-4 py-3">
        <p className="text-[11px] font-light leading-relaxed text-muted-foreground/55">
          默认初始值：{DEFAULT_EDITOR_PREFERENCES.defaultFieldFormat} / {DEFAULT_EDITOR_PREFERENCES.defaultFieldStyle === 'realistic' ? '写实草坪' : '简洁平面'} / {DEFAULT_EDITOR_PREFERENCES.defaultPlayerStyle === 'dot' ? '圆点样式' : '球衣卡片'}。
        </p>
      </div>
    </div>
  );
}

function formatBytes(value: number) {
  if (value <= 0) return '0 KB';
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;
  return `${(value / (1024 * 1024)).toFixed(1)} MB`;
}

export default SettingsV2;
