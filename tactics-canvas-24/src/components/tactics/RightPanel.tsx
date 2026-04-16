import { useRef } from 'react';
import {
  FileImage,
  FileText,
  Hash,
  ImageUp,
  ListOrdered,
  MapPin,
  Palette,
  RectangleHorizontal,
  Route,
  Shirt,
  Timer,
  Trash2,
  Type,
  User,
} from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import { canUseNativeImageImport, pickImageFile } from '@/lib/asset-import';
import { AreaObject, MatchMeta, Player, PlayerStyle, ReferenceImage, TacticsLine, TextNote } from '@/types/tactics';

interface RightPanelProps {
  projectName: string;
  selectedPlayer: Player | null;
  selectedLine: TacticsLine | null;
  selectedText: TextNote | null;
  selectedArea: AreaObject | null;
  playerStyle: PlayerStyle;
  matchMeta: MatchMeta;
  referenceImage: ReferenceImage | null;
  stepDescription: string;
  embedded?: boolean;
  onProjectNameChange: (projectName: string) => void;
  onMatchMetaChange: (field: keyof MatchMeta, value: string) => void;
  onStepDescriptionChange: (description: string) => void;
  onPlayerNameChange: (name: string) => void;
  onPlayerNumberChange: (number: number) => void;
  onPlayerPositionChange: (position: string) => void;
  onPlayerTeamChange: (team: Player['team']) => void;
  onDeletePlayer: () => void;
  onTextContentChange: (text: string) => void;
  onTextStyleChange: (style: TextNote['style']) => void;
  onTextXChange: (x: number) => void;
  onTextYChange: (y: number) => void;
  onDeleteText: () => void;
  onLineTypeChange: (type: TacticsLine['type']) => void;
  onLineFromXChange: (fromX: number) => void;
  onLineFromYChange: (fromY: number) => void;
  onLineToXChange: (toX: number) => void;
  onLineToYChange: (toY: number) => void;
  onDeleteLine: () => void;
  onAreaShapeChange: (shape: AreaObject['shape']) => void;
  onAreaWidthChange: (width: number) => void;
  onAreaHeightChange: (height: number) => void;
  onAreaOpacityChange: (opacity: number) => void;
  onAreaStrokeColorChange: (strokeColor: string) => void;
  onAreaFillColorChange: (fillColor: string) => void;
  onDeleteArea: () => void;
  onReferenceImageImport: (file: File) => void;
  onReferenceImageVisibilityChange: (visible: boolean) => void;
  onReferenceImageOpacityChange: (opacity: number) => void;
  onReferenceImageScaleChange: (scale: number) => void;
  onReferenceImageOffsetXChange: (offsetX: number) => void;
  onReferenceImageOffsetYChange: (offsetY: number) => void;
  onReferenceImageResetTransform: () => void;
  onReferenceImageRemove: () => void;
}

export function RightPanel({
  projectName,
  selectedPlayer,
  selectedLine,
  selectedText,
  selectedArea,
  playerStyle,
  matchMeta,
  referenceImage,
  stepDescription,
  embedded,
  onProjectNameChange,
  onMatchMetaChange,
  onStepDescriptionChange,
  onPlayerNameChange,
  onPlayerNumberChange,
  onPlayerPositionChange,
  onPlayerTeamChange,
  onDeletePlayer,
  onTextContentChange,
  onTextStyleChange,
  onTextXChange,
  onTextYChange,
  onDeleteText,
  onLineTypeChange,
  onLineFromXChange,
  onLineFromYChange,
  onLineToXChange,
  onLineToYChange,
  onDeleteLine,
  onAreaShapeChange,
  onAreaWidthChange,
  onAreaHeightChange,
  onAreaOpacityChange,
  onAreaStrokeColorChange,
  onAreaFillColorChange,
  onDeleteArea,
  onReferenceImageImport,
  onReferenceImageVisibilityChange,
  onReferenceImageOpacityChange,
  onReferenceImageScaleChange,
  onReferenceImageOffsetXChange,
  onReferenceImageOffsetYChange,
  onReferenceImageResetTransform,
  onReferenceImageRemove,
}: RightPanelProps) {
  let title = '项目属性';
  let content: React.ReactNode;

  if (selectedPlayer) {
    title = '球员属性';
    content = (
      <PlayerProperties
        player={selectedPlayer}
        style={playerStyle}
        onNameChange={onPlayerNameChange}
        onNumberChange={onPlayerNumberChange}
        onPositionChange={onPlayerPositionChange}
        onTeamChange={onPlayerTeamChange}
        onDelete={onDeletePlayer}
      />
    );
  } else if (selectedText) {
    title = '文本属性';
    content = (
      <TextProperties
        textNote={selectedText}
        onTextChange={onTextContentChange}
        onStyleChange={onTextStyleChange}
        onXChange={onTextXChange}
        onYChange={onTextYChange}
        onDelete={onDeleteText}
      />
    );
  } else if (selectedLine) {
    title = '线路属性';
    content = (
      <LineProperties
        line={selectedLine}
        onTypeChange={onLineTypeChange}
        onFromXChange={onLineFromXChange}
        onFromYChange={onLineFromYChange}
        onToXChange={onLineToXChange}
        onToYChange={onLineToYChange}
        onDelete={onDeleteLine}
      />
    );
  } else if (selectedArea) {
    title = '区域属性';
    content = (
      <AreaProperties
        area={selectedArea}
        onShapeChange={onAreaShapeChange}
        onWidthChange={onAreaWidthChange}
        onHeightChange={onAreaHeightChange}
        onOpacityChange={onAreaOpacityChange}
        onStrokeColorChange={onAreaStrokeColorChange}
        onFillColorChange={onAreaFillColorChange}
        onDelete={onDeleteArea}
      />
    );
  } else {
    content = (
      <ProjectProperties
        projectName={projectName}
        matchMeta={matchMeta}
        referenceImage={referenceImage}
        stepDescription={stepDescription}
        onProjectNameChange={onProjectNameChange}
        onMatchMetaChange={onMatchMetaChange}
        onStepDescriptionChange={onStepDescriptionChange}
        onReferenceImageImport={onReferenceImageImport}
        onReferenceImageVisibilityChange={onReferenceImageVisibilityChange}
        onReferenceImageOpacityChange={onReferenceImageOpacityChange}
        onReferenceImageScaleChange={onReferenceImageScaleChange}
        onReferenceImageOffsetXChange={onReferenceImageOffsetXChange}
        onReferenceImageOffsetYChange={onReferenceImageOffsetYChange}
        onReferenceImageResetTransform={onReferenceImageResetTransform}
        onReferenceImageRemove={onReferenceImageRemove}
      />
    );
  }

  if (embedded) {
    return <>{content}</>;
  }

  return (
    <div className="flex w-[280px] shrink-0 flex-col overflow-hidden border-l border-border panel-bg">
      <div className="shrink-0 border-b border-border px-3 py-2.5">
        <h3 className="text-xs font-medium text-foreground">{title}</h3>
      </div>

      <div className="flex-1 overflow-y-auto p-3 scrollbar-thin">
        {content}
      </div>
    </div>
  );
}

function PlayerProperties({
  player,
  style,
  onNameChange,
  onNumberChange,
  onPositionChange,
  onTeamChange,
  onDelete,
}: {
  player: Player;
  style: PlayerStyle;
  onNameChange: (name: string) => void;
  onNumberChange: (number: number) => void;
  onPositionChange: (position: string) => void;
  onTeamChange: (team: Player['team']) => void;
  onDelete: () => void;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-center py-4">
        <div className={`flex h-16 w-16 items-center justify-center rounded-full text-xl font-bold ${
          player.team === 'home' ? 'bg-team-home' : 'bg-team-away'
        } text-foreground`}>
          {player.number}
        </div>
      </div>

      <PropSection title="基础信息">
        <PropRow icon={<User className="h-3.5 w-3.5" />} label="姓名">
          <input value={player.name} onChange={(event) => onNameChange(event.target.value)} className="prop-input" />
        </PropRow>
        <PropRow icon={<Hash className="h-3.5 w-3.5" />} label="号码">
          <input
            type="number"
            value={player.number}
            onChange={(event) => onNumberChange(parseInteger(event.target.value, player.number))}
            className="prop-input w-16"
          />
        </PropRow>
        <PropRow icon={<MapPin className="h-3.5 w-3.5" />} label="位置">
          <input value={player.position} onChange={(event) => onPositionChange(event.target.value)} className="prop-input" />
        </PropRow>
        <PropRow icon={<Shirt className="h-3.5 w-3.5" />} label="队伍">
          <select
            value={player.team}
            onChange={(event) => onTeamChange(event.target.value as Player['team'])}
            className="prop-select"
          >
            <option value="home">主队</option>
            <option value="away">客队</option>
          </select>
        </PropRow>
      </PropSection>

      <PropSection title="显示信息">
        <PropRow label="显示样式">
          <div className="prop-select cursor-default">{style === 'dot' ? '圆点' : '球衣卡片'}</div>
        </PropRow>
      </PropSection>

      <PropSection title="坐标">
        <div className="grid grid-cols-2 gap-2">
          <LabeledReadOnly label="X" value={player.x.toFixed(1)} />
          <LabeledReadOnly label="Y" value={player.y.toFixed(1)} />
        </div>
      </PropSection>

      <DangerButton onClick={onDelete}>删除当前球员</DangerButton>
    </div>
  );
}

function TextProperties({
  textNote,
  onTextChange,
  onStyleChange,
  onXChange,
  onYChange,
  onDelete,
}: {
  textNote: TextNote;
  onTextChange: (text: string) => void;
  onStyleChange: (style: TextNote['style']) => void;
  onXChange: (x: number) => void;
  onYChange: (y: number) => void;
  onDelete: () => void;
}) {
  return (
    <div className="space-y-4">
      <PropSection title="文本内容">
        <PropRow icon={<Type className="h-3.5 w-3.5" />} label="内容">
          <textarea
            value={textNote.text}
            onChange={(event) => onTextChange(event.target.value)}
            className="prop-input min-h-[88px] resize-none"
            rows={4}
          />
        </PropRow>
        <PropRow icon={<Palette className="h-3.5 w-3.5" />} label="样式">
          <select value={textNote.style} onChange={(event) => onStyleChange(event.target.value as TextNote['style'])} className="prop-select">
            <option value="body">正文</option>
            <option value="title">标题</option>
            <option value="emphasis">强调</option>
          </select>
        </PropRow>
      </PropSection>

      <PropSection title="坐标">
        <div className="grid grid-cols-2 gap-2">
          <LabeledNumberInput label="X" value={textNote.x} min={0} max={100} step={0.5} onChange={onXChange} />
          <LabeledNumberInput label="Y" value={textNote.y} min={0} max={100} step={0.5} onChange={onYChange} />
        </div>
      </PropSection>

      <DangerButton onClick={onDelete}>删除当前文本</DangerButton>
    </div>
  );
}

function LineProperties({
  line,
  onTypeChange,
  onFromXChange,
  onFromYChange,
  onToXChange,
  onToYChange,
  onDelete,
}: {
  line: TacticsLine;
  onTypeChange: (type: TacticsLine['type']) => void;
  onFromXChange: (fromX: number) => void;
  onFromYChange: (fromY: number) => void;
  onToXChange: (toX: number) => void;
  onToYChange: (toY: number) => void;
  onDelete: () => void;
}) {
  return (
    <div className="space-y-4">
      <PropSection title="线路类型">
        <PropRow icon={<Route className="h-3.5 w-3.5" />} label="类型">
          <select value={line.type} onChange={(event) => onTypeChange(event.target.value as TacticsLine['type'])} className="prop-select">
            <option value="run">跑位</option>
            <option value="pass">传球</option>
            <option value="dribble">带球</option>
            <option value="shoot">射门</option>
            <option value="press">逼抢</option>
          </select>
        </PropRow>
      </PropSection>

      <PropSection title="起点">
        <div className="grid grid-cols-2 gap-2">
          <LabeledNumberInput label="X1" value={line.fromX} min={0} max={100} step={0.5} onChange={onFromXChange} />
          <LabeledNumberInput label="Y1" value={line.fromY} min={0} max={100} step={0.5} onChange={onFromYChange} />
        </div>
      </PropSection>

      <PropSection title="终点">
        <div className="grid grid-cols-2 gap-2">
          <LabeledNumberInput label="X2" value={line.toX} min={0} max={100} step={0.5} onChange={onToXChange} />
          <LabeledNumberInput label="Y2" value={line.toY} min={0} max={100} step={0.5} onChange={onToYChange} />
        </div>
      </PropSection>

      <DangerButton onClick={onDelete}>删除当前线路</DangerButton>
    </div>
  );
}

function AreaProperties({
  area,
  onShapeChange,
  onWidthChange,
  onHeightChange,
  onOpacityChange,
  onStrokeColorChange,
  onFillColorChange,
  onDelete,
}: {
  area: AreaObject;
  onShapeChange: (shape: AreaObject['shape']) => void;
  onWidthChange: (width: number) => void;
  onHeightChange: (height: number) => void;
  onOpacityChange: (opacity: number) => void;
  onStrokeColorChange: (strokeColor: string) => void;
  onFillColorChange: (fillColor: string) => void;
  onDelete: () => void;
}) {
  return (
    <div className="space-y-4">
      <PropSection title="区域形态">
        <PropRow icon={<RectangleHorizontal className="h-3.5 w-3.5" />} label="形状">
          <select value={area.shape} onChange={(event) => onShapeChange(event.target.value as AreaObject['shape'])} className="prop-select">
            <option value="rect">矩形</option>
            <option value="circle">圆形</option>
            <option value="ellipse">椭圆</option>
          </select>
        </PropRow>
      </PropSection>

      <PropSection title="尺寸">
        <div className="grid grid-cols-2 gap-2">
          <LabeledNumberInput label="宽度" value={area.width} min={6} max={100} step={1} onChange={onWidthChange} />
          <LabeledNumberInput label="高度" value={area.height} min={6} max={100} step={1} onChange={onHeightChange} />
        </div>
      </PropSection>

      <PropSection title="颜色与透明度">
        <PropRow icon={<Palette className="h-3.5 w-3.5" />} label="描边">
          <input type="color" value={normalizeColor(area.strokeColor)} onChange={(event) => onStrokeColorChange(event.target.value)} className="h-9 w-full cursor-pointer rounded-md border border-border bg-transparent p-1" />
        </PropRow>
        <PropRow icon={<Palette className="h-3.5 w-3.5" />} label="填充">
          <input type="color" value={normalizeColor(area.fillColor)} onChange={(event) => onFillColorChange(event.target.value)} className="h-9 w-full cursor-pointer rounded-md border border-border bg-transparent p-1" />
        </PropRow>
        <PropRow label="透明度">
          <div className="space-y-2">
            <input
              type="range"
              min={0.05}
              max={0.9}
              step={0.05}
              value={area.opacity}
              onChange={(event) => onOpacityChange(parseFloat(event.target.value))}
              className="w-full"
            />
            <div className="text-[11px] text-muted-foreground">{Math.round(area.opacity * 100)}%</div>
          </div>
        </PropRow>
      </PropSection>

      <PropSection title="位置">
        <div className="grid grid-cols-2 gap-2">
          <LabeledReadOnly label="X" value={area.x.toFixed(1)} />
          <LabeledReadOnly label="Y" value={area.y.toFixed(1)} />
        </div>
      </PropSection>

      <DangerButton onClick={onDelete}>删除当前区域</DangerButton>
    </div>
  );
}

function ProjectProperties({
  projectName,
  matchMeta,
  referenceImage,
  stepDescription,
  onProjectNameChange,
  onMatchMetaChange,
  onStepDescriptionChange,
  onReferenceImageImport,
  onReferenceImageVisibilityChange,
  onReferenceImageOpacityChange,
  onReferenceImageScaleChange,
  onReferenceImageOffsetXChange,
  onReferenceImageOffsetYChange,
  onReferenceImageResetTransform,
  onReferenceImageRemove,
}: {
  projectName: string;
  matchMeta: MatchMeta;
  referenceImage: ReferenceImage | null;
  stepDescription: string;
  onProjectNameChange: (projectName: string) => void;
  onMatchMetaChange: (field: keyof MatchMeta, value: string) => void;
  onStepDescriptionChange: (description: string) => void;
  onReferenceImageImport: (file: File) => void;
  onReferenceImageVisibilityChange: (visible: boolean) => void;
  onReferenceImageOpacityChange: (opacity: number) => void;
  onReferenceImageScaleChange: (scale: number) => void;
  onReferenceImageOffsetXChange: (offsetX: number) => void;
  onReferenceImageOffsetYChange: (offsetY: number) => void;
  onReferenceImageResetTransform: () => void;
  onReferenceImageRemove: () => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleReferenceImageButtonClick = async () => {
    if (!canUseNativeImageImport()) {
      fileInputRef.current?.click();
      return;
    }

    const result = await pickImageFile();
    if (result.status === 'selected') {
      onReferenceImageImport(result.file);
      return;
    }
    if (result.status === 'failed') {
      toast.error('参考底图导入失败，请重新选择图片', {
        description: result.reason,
      });
    }
  };

  return (
    <div className="space-y-4">
      <PropSection title="项目信息">
        <PropRow icon={<FileText className="h-3.5 w-3.5" />} label="项目名">
          <input value={projectName} onChange={(event) => onProjectNameChange(event.target.value)} className="prop-input" />
        </PropRow>
      </PropSection>

      <PropSection title="比赛信息">
        <PropRow icon={<FileText className="h-3.5 w-3.5" />} label="标题">
          <input value={matchMeta.title} onChange={(event) => onMatchMetaChange('title', event.target.value)} className="prop-input" placeholder="例如：周末友谊赛战术复盘" />
        </PropRow>
        <div className="grid grid-cols-2 gap-2">
          <LabeledInput label="比分" value={matchMeta.score} onChange={(value) => onMatchMetaChange('score', value)} placeholder="2 - 1" />
          <LabeledInput label="分钟" value={matchMeta.minute} onChange={(value) => onMatchMetaChange('minute', value)} placeholder="67'" />
        </div>
        <PropRow icon={<Timer className="h-3.5 w-3.5" />} label="阶段">
          <input value={matchMeta.phaseLabel} onChange={(event) => onMatchMetaChange('phaseLabel', event.target.value)} className="prop-input" placeholder="下半场 / 定位球 / 攻防转换" />
        </PropRow>
      </PropSection>

      <PropSection title="当前步骤">
        <PropRow icon={<ListOrdered className="h-3.5 w-3.5" />} label="说明">
          <textarea
            value={stepDescription}
            onChange={(event) => onStepDescriptionChange(event.target.value)}
            className="prop-input min-h-[88px] resize-none"
            rows={4}
          />
        </PropRow>
      </PropSection>

      <PropSection title="参考底图">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (!file) return;
            onReferenceImageImport(file);
            event.target.value = '';
          }}
        />

        <button
          onClick={() => {
            void handleReferenceImageButtonClick();
          }}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-border/60 bg-secondary/40 px-3 py-2 text-xs font-medium text-foreground/80 transition-colors hover:bg-secondary"
        >
          <ImageUp className="h-3.5 w-3.5" />
          {referenceImage ? '替换参考底图' : '导入参考底图'}
        </button>

        {referenceImage ? (
          <div className="space-y-3 rounded-xl border border-border/40 bg-card/60 p-3">
            <div className="flex items-start gap-2">
              <FileImage className="mt-0.5 h-3.5 w-3.5 text-muted-foreground" />
              <div className="min-w-0 flex-1">
                <div className="truncate text-xs font-medium text-foreground/85">{referenceImage.name}</div>
                <div className="mt-1 text-[11px] text-muted-foreground">
                  项目级素材，默认在编辑器中作为辅助参考显示。
                </div>
              </div>
            </div>

            <label className="flex items-center justify-between gap-2 text-xs text-foreground/80">
              <span>显示在画布中</span>
              <input
                type="checkbox"
                checked={referenceImage.visible}
                onChange={(event) => onReferenceImageVisibilityChange(event.target.checked)}
              />
            </label>

            <div className="space-y-2">
              <div className="text-xs text-foreground/80">透明度</div>
              <input
                type="range"
                min={0.1}
                max={0.9}
                step={0.05}
                value={referenceImage.opacity}
                onChange={(event) => onReferenceImageOpacityChange(parseFloat(event.target.value))}
                className="w-full"
              />
              <div className="text-[11px] text-muted-foreground">{Math.round(referenceImage.opacity * 100)}%</div>
            </div>

            <div className="space-y-2">
              <div className="text-xs text-foreground/80">缩放</div>
              <input
                type="range"
                min={1}
                max={3}
                step={0.05}
                value={referenceImage.scale}
                onChange={(event) => onReferenceImageScaleChange(parseFloat(event.target.value))}
                className="w-full"
              />
              <div className="text-[11px] text-muted-foreground">{referenceImage.scale.toFixed(2)}x</div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <LabeledSlider
                label="水平偏移"
                value={referenceImage.offsetX}
                min={-40}
                max={40}
                step={1}
                onChange={onReferenceImageOffsetXChange}
                suffix="%"
              />
              <LabeledSlider
                label="垂直偏移"
                value={referenceImage.offsetY}
                min={-40}
                max={40}
                step={1}
                onChange={onReferenceImageOffsetYChange}
                suffix="%"
              />
            </div>

            <button
              onClick={onReferenceImageResetTransform}
              className="w-full rounded-lg border border-border/60 bg-secondary/30 px-3 py-2 text-xs font-medium text-foreground/80 transition-colors hover:bg-secondary"
            >
              重置裁剪与定位
            </button>

            <DangerButton onClick={onReferenceImageRemove}>移除参考底图</DangerButton>
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-border/70 bg-muted/20 px-3 py-3 text-[11px] leading-5 text-muted-foreground">
            参考底图会复制到本地项目存储中，用于在画布中辅助对照跑位和站位。
          </div>
        )}
      </PropSection>
    </div>
  );
}

function parseInteger(rawValue: string, fallback: number) {
  const parsed = Number(rawValue);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(0, Math.round(parsed));
}

function normalizeColor(value: string) {
  return /^#[0-9a-f]{6}$/i.test(value) ? value : '#38bdf8';
}

function PropSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="mb-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">{title}</h4>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function PropRow({
  icon,
  label,
  children,
}: {
  icon?: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-2">
      <div className="flex shrink-0 items-center gap-1.5 pt-2 text-xs text-secondary-foreground">
        {icon}
        {label}
      </div>
      <div className="flex-1">{children}</div>
    </div>
  );
}

function LabeledReadOnly({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <label className="mb-0.5 block text-[10px] text-muted-foreground">{label}</label>
      <input value={value} readOnly className="prop-input w-full" />
    </div>
  );
}

function LabeledNumberInput({
  label,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
}) {
  return (
    <div>
      <label className="mb-0.5 block text-[10px] text-muted-foreground">{label}</label>
      <input
        type="number"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => {
          const nextValue = Number.parseFloat(event.target.value);
          if (!Number.isFinite(nextValue)) {
            onChange(value);
            return;
          }
          onChange(Math.max(min, Math.min(max, nextValue)));
        }}
        className="prop-input w-full"
      />
    </div>
  );
}

function LabeledInput({
  label,
  value,
  placeholder,
  onChange,
}: {
  label: string;
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="mb-0.5 block text-[10px] text-muted-foreground">{label}</label>
      <input value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} className="prop-input w-full" />
    </div>
  );
}

function LabeledSlider({
  label,
  value,
  min,
  max,
  step,
  suffix,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  suffix?: string;
  onChange: (value: number) => void;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-[10px] text-muted-foreground">{label}</label>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(parseFloat(event.target.value))}
        className="w-full"
      />
      <div className="text-[11px] text-muted-foreground">{value}{suffix ?? ''}</div>
    </div>
  );
}

function DangerButton({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center justify-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs font-medium text-destructive transition-colors hover:bg-destructive/15"
    >
      <Trash2 className="h-3.5 w-3.5" />
      {children}
    </button>
  );
}
