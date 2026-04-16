import { X } from 'lucide-react';
import { EditorTool, FieldFormat, Team } from '@/types/tactics';
import { LeftPanel } from './LeftPanel';

interface TabletLeftDrawerProps {
  open: boolean;
  onClose: () => void;
  currentTool: EditorTool;
  fieldFormat: FieldFormat;
  playerPlacementTeam: Team;
  onToolChange: (tool: EditorTool) => void;
  onPlayerPlacementTeamChange: (team: Team) => void;
  onApplyFormation: (formationId: string) => void;
}

export function TabletLeftDrawer({
  open,
  onClose,
  currentTool,
  fieldFormat,
  playerPlacementTeam,
  onToolChange,
  onPlayerPlacementTeamChange,
  onApplyFormation,
}: TabletLeftDrawerProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-[280px] h-full panel-bg border-r border-border shadow-2xl flex flex-col animate-in slide-in-from-left duration-200">
        <div className="flex items-center justify-between px-3 py-2 border-b border-border shrink-0">
          <span className="text-sm font-medium text-foreground">工具面板</span>
          <button
            onClick={onClose}
            aria-label="关闭工具抽屉"
            title="关闭工具抽屉"
            className="w-7 h-7 rounded flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="flex-1 overflow-hidden">
          <LeftPanel
            currentTool={currentTool}
            fieldFormat={fieldFormat}
            playerPlacementTeam={playerPlacementTeam}
            onToolChange={(tool) => { onToolChange(tool); }}
            onPlayerPlacementTeamChange={onPlayerPlacementTeamChange}
            onApplyFormation={(formationId) => {
              onApplyFormation(formationId);
              onClose();
            }}
          />
        </div>
      </div>
    </div>
  );
}
