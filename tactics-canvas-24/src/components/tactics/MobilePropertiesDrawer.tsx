import { X } from 'lucide-react';
import { AreaObject, MatchMeta, Player, PlayerStyle, ReferenceImage } from '@/types/tactics';
import { RightPanel } from './RightPanel';

interface MobilePropertiesDrawerProps {
  open: boolean;
  onClose: () => void;
  projectName: string;
  selectedPlayer: Player | null;
  selectedArea: AreaObject | null;
  playerStyle: PlayerStyle;
  matchMeta: MatchMeta;
  referenceImage: ReferenceImage | null;
  stepDescription: string;
  onProjectNameChange: (projectName: string) => void;
  onMatchMetaChange: (field: keyof MatchMeta, value: string) => void;
  onStepDescriptionChange: (description: string) => void;
  onPlayerNameChange: (name: string) => void;
  onPlayerNumberChange: (number: number) => void;
  onPlayerPositionChange: (position: string) => void;
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

export function MobilePropertiesDrawer({
  open,
  onClose,
  projectName,
  selectedPlayer,
  selectedArea,
  playerStyle,
  matchMeta,
  referenceImage,
  stepDescription,
  onProjectNameChange,
  onMatchMetaChange,
  onStepDescriptionChange,
  onPlayerNameChange,
  onPlayerNumberChange,
  onPlayerPositionChange,
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
}: MobilePropertiesDrawerProps) {
  if (!open) return null;

  const title = selectedPlayer ? '球员属性' : selectedArea ? '区域属性' : '项目属性';

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative flex max-h-[68vh] flex-col overflow-hidden rounded-t-2xl border-t border-border panel-bg">
        <div className="flex items-center justify-center pb-1 pt-2">
          <div className="h-1 w-10 rounded-full bg-muted-foreground/30" />
        </div>

        <div className="flex shrink-0 items-center justify-between border-b border-border px-4 py-2">
          <span className="text-sm font-medium text-foreground">{title}</span>
          <button
            onClick={onClose}
            aria-label="关闭属性抽屉"
            title="关闭属性抽屉"
            className="flex h-7 w-7 items-center justify-center rounded text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <RightPanel
            projectName={projectName}
            selectedPlayer={selectedPlayer}
            selectedArea={selectedArea}
            playerStyle={playerStyle}
            matchMeta={matchMeta}
            referenceImage={referenceImage}
            stepDescription={stepDescription}
            onProjectNameChange={onProjectNameChange}
            onMatchMetaChange={onMatchMetaChange}
            onStepDescriptionChange={onStepDescriptionChange}
            onPlayerNameChange={onPlayerNameChange}
            onPlayerNumberChange={onPlayerNumberChange}
            onPlayerPositionChange={onPlayerPositionChange}
            onAreaShapeChange={onAreaShapeChange}
            onAreaWidthChange={onAreaWidthChange}
            onAreaHeightChange={onAreaHeightChange}
            onAreaOpacityChange={onAreaOpacityChange}
            onAreaStrokeColorChange={onAreaStrokeColorChange}
            onAreaFillColorChange={onAreaFillColorChange}
            onDeleteArea={onDeleteArea}
            onReferenceImageImport={onReferenceImageImport}
            onReferenceImageVisibilityChange={onReferenceImageVisibilityChange}
            onReferenceImageOpacityChange={onReferenceImageOpacityChange}
            onReferenceImageScaleChange={onReferenceImageScaleChange}
            onReferenceImageOffsetXChange={onReferenceImageOffsetXChange}
            onReferenceImageOffsetYChange={onReferenceImageOffsetYChange}
            onReferenceImageResetTransform={onReferenceImageResetTransform}
            onReferenceImageRemove={onReferenceImageRemove}
            embedded
          />
        </div>
      </div>
    </div>
  );
}
