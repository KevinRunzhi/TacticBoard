import { useState, type ReactNode } from 'react';
import {
  Circle,
  ListOrdered,
  Settings2,
  Shirt,
  Square,
  Target,
  TrendingUp,
  Type,
  Users,
} from 'lucide-react';
import { EditorTool, FieldFormat, Team } from '@/types/tactics';

interface MobileToolbarProps {
  currentTool: EditorTool;
  fieldFormat: FieldFormat;
  playerPlacementTeam: Team;
  onToolChange: (tool: EditorTool) => void;
  onPlayerPlacementTeamChange: (team: Team) => void;
  onOpenSteps: () => void;
  onOpenProperties: () => void;
  onOpenFormations: () => void;
}

type ToolCategory = 'player' | 'line' | 'text' | 'zone' | null;

const lineTools: { tool: EditorTool; label: string; color: string }[] = [
  { tool: 'line-run', label: '跑位', color: 'bg-line-run' },
  { tool: 'line-pass', label: '传球', color: 'bg-line-pass' },
  { tool: 'line-dribble', label: '带球', color: 'bg-line-dribble' },
  { tool: 'line-shoot', label: '射门', color: 'bg-line-shoot' },
  { tool: 'line-press', label: '逼抢', color: 'bg-line-press' },
];

export function MobileToolbar({
  currentTool,
  fieldFormat: _fieldFormat,
  playerPlacementTeam,
  onToolChange,
  onPlayerPlacementTeamChange,
  onOpenSteps,
  onOpenProperties,
  onOpenFormations,
}: MobileToolbarProps) {
  const [expandedCategory, setExpandedCategory] = useState<ToolCategory>(null);

  const toggleCategory = (category: ToolCategory) => {
    setExpandedCategory((previous) => (previous === category ? null : category));
  };

  const isLineTool = currentTool.startsWith('line-');

  const entries: { key: ToolCategory | 'steps' | 'props' | 'select' | 'formations'; icon: ReactNode; label: string; active?: boolean }[] = [
    { key: 'select', icon: <Target className="h-4 w-4" />, label: '选择', active: currentTool === 'select' },
    { key: 'player', icon: <Users className="h-4 w-4" />, label: '对象', active: currentTool === 'player' || currentTool === 'ball' },
    { key: 'formations', icon: <Shirt className="h-4 w-4" />, label: '阵型' },
    { key: 'line', icon: <TrendingUp className="h-4 w-4" />, label: '线路', active: isLineTool },
    { key: 'zone', icon: <Square className="h-4 w-4" />, label: '区域', active: currentTool === 'zone' },
    { key: 'text', icon: <Type className="h-4 w-4" />, label: '文本', active: currentTool === 'text' },
    { key: 'steps', icon: <ListOrdered className="h-4 w-4" />, label: '步骤' },
    { key: 'props', icon: <Settings2 className="h-4 w-4" />, label: '属性' },
  ];

  return (
    <>
      {expandedCategory && (
        <div className="absolute bottom-[60px] left-0 right-0 z-40">
          <div className="absolute inset-0 -top-[100vh]" onClick={() => setExpandedCategory(null)} />
          <div className="relative max-h-[40vh] overflow-y-auto rounded-t-xl border-t border-border p-3 shadow-2xl panel-bg">
            {expandedCategory === 'player' && (
              <div className="space-y-3">
                <div className="space-y-2">
                  <h4 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">编辑对象</h4>
                  <div className="grid grid-cols-4 gap-2">
                    {([
                      ['select', '选择', Target],
                      ['player', '球员', Users],
                      ['ball', '足球', Circle],
                    ] as const).map(([tool, label, Icon]) => (
                      <button
                        key={tool}
                        onClick={() => {
                          onToolChange(tool);
                          setExpandedCategory(null);
                        }}
                        className={`flex flex-col items-center gap-1 rounded-lg border py-2.5 text-xs transition-colors ${
                          currentTool === tool
                            ? 'border-primary/30 bg-primary/20 text-primary'
                            : 'border-transparent text-muted-foreground hover:bg-secondary'
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">新增球员默认队伍</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {([
                      ['home', '主队'],
                      ['away', '客队'],
                    ] as const).map(([team, label]) => (
                      <button
                        key={team}
                        onClick={() => onPlayerPlacementTeamChange(team)}
                        className={`rounded-lg border px-3 py-2.5 text-xs font-medium transition-colors ${
                          playerPlacementTeam === team
                            ? 'border-primary/30 bg-primary/20 text-primary'
                            : 'border-border text-muted-foreground hover:bg-secondary hover:text-foreground'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
            {expandedCategory === 'line' && (
              <div className="space-y-2">
                <h4 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">线路类型</h4>
                <div className="grid grid-cols-3 gap-2">
                  {lineTools.map(({ tool, label, color }) => (
                    <button
                      key={tool}
                      onClick={() => {
                        onToolChange(tool);
                        setExpandedCategory(null);
                      }}
                      className={`flex items-center gap-2 rounded-lg border px-3 py-2.5 text-xs transition-colors ${
                        currentTool === tool
                          ? 'border-primary/30 bg-primary/20 text-primary'
                          : 'border-transparent text-muted-foreground hover:bg-secondary'
                      }`}
                    >
                      <div className={`h-0.5 w-4 rounded ${color}`} />
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {expandedCategory === 'text' && (
              <div className="space-y-2">
                <h4 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">文本工具</h4>
                <button
                  onClick={() => {
                    onToolChange('text');
                    setExpandedCategory(null);
                  }}
                  className={`flex w-full items-center gap-2 rounded-lg border px-3 py-2.5 text-xs transition-colors ${
                    currentTool === 'text'
                      ? 'border-primary/30 bg-primary/20 text-primary'
                      : 'border-transparent text-muted-foreground hover:bg-secondary'
                  }`}
                >
                  <Type className="h-4 w-4" />
                  添加文本注释
                </button>
              </div>
            )}
            {expandedCategory === 'zone' && (
              <div className="space-y-2">
                <h4 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">区域工具</h4>
                <button
                  onClick={() => {
                    onToolChange('zone');
                    setExpandedCategory(null);
                  }}
                  className={`flex w-full items-center gap-2 rounded-lg border px-3 py-2.5 text-xs transition-colors ${
                    currentTool === 'zone'
                      ? 'border-primary/30 bg-primary/20 text-primary'
                      : 'border-transparent text-muted-foreground hover:bg-secondary'
                  }`}
                >
                  <Square className="h-4 w-4" />
                  点击球场创建区域
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="relative z-50 flex h-[60px] shrink-0 items-center gap-1 overflow-x-auto border-t border-border px-1.5 toolbar-bg">
        {entries.map((entry) => (
          <button
            key={entry.key}
            onClick={() => {
              if (entry.key === 'steps') {
                onOpenSteps();
                setExpandedCategory(null);
                return;
              }

              if (entry.key === 'props') {
                onOpenProperties();
                setExpandedCategory(null);
                return;
              }

              if (entry.key === 'formations') {
                onOpenFormations();
                setExpandedCategory(null);
                return;
              }

              if (entry.key === 'select') {
                onToolChange('select');
                setExpandedCategory(null);
                return;
              }

              toggleCategory(entry.key as ToolCategory);
            }}
            className={`flex min-w-[40px] flex-1 basis-0 flex-col items-center gap-1 rounded-lg px-1.5 py-1.5 text-[10px] transition-colors ${
              entry.active || expandedCategory === entry.key
                ? 'text-primary'
                : 'text-muted-foreground hover:bg-secondary/70 hover:text-foreground'
            }`}
          >
            {entry.icon}
            <span>{entry.label}</span>
          </button>
        ))}
      </div>
    </>
  );
}
