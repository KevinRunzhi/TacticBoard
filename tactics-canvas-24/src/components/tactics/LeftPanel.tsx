import { useMemo, useState, type ReactNode } from 'react';
import {
  ChevronRight,
  Circle,
  Search,
  Shirt,
  Square,
  Target,
  TrendingUp,
  Type,
  Users,
} from 'lucide-react';
import { EditorTool, FieldFormat, Team } from '@/types/tactics';
import { getFormationsByFormat } from '@/data/mockData';

interface LeftPanelProps {
  currentTool: EditorTool;
  fieldFormat: FieldFormat;
  playerPlacementTeam: Team;
  onToolChange: (tool: EditorTool) => void;
  onPlayerPlacementTeamChange: (team: Team) => void;
  onApplyFormation: (formationId: string) => void;
}

type PanelTab = 'objects' | 'formations';

const lineTools: { tool: EditorTool; label: string; color: string }[] = [
  { tool: 'line-run', label: '跑位', color: 'bg-line-run' },
  { tool: 'line-pass', label: '传球', color: 'bg-line-pass' },
  { tool: 'line-dribble', label: '带球', color: 'bg-line-dribble' },
  { tool: 'line-shoot', label: '射门', color: 'bg-line-shoot' },
  { tool: 'line-press', label: '逼抢', color: 'bg-line-press' },
];

export function LeftPanel({
  currentTool,
  fieldFormat,
  playerPlacementTeam,
  onToolChange,
  onPlayerPlacementTeamChange,
  onApplyFormation,
}: LeftPanelProps) {
  const [activeTab, setActiveTab] = useState<PanelTab>('objects');
  const [formationSearch, setFormationSearch] = useState('');

  const formations = useMemo(
    () => getFormationsByFormat(fieldFormat).filter((formation) => (
      formation.name.toLowerCase().includes(formationSearch.toLowerCase())
    )),
    [fieldFormat, formationSearch],
  );

  return (
    <div className="flex w-[240px] shrink-0 flex-col overflow-hidden border-r border-border panel-bg">
      <div className="flex shrink-0 border-b border-border">
        {([
          ['objects', '对象', Users],
          ['formations', '阵型', Shirt],
        ] as const).map(([key, label, Icon]) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex flex-1 flex-col items-center gap-1 border-b-2 py-2.5 text-xs font-medium transition-colors ${
              activeTab === key
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-3 scrollbar-thin">
        {activeTab === 'objects' && (
          <ObjectsPanel
            currentTool={currentTool}
            playerPlacementTeam={playerPlacementTeam}
            onToolChange={onToolChange}
            onPlayerPlacementTeamChange={onPlayerPlacementTeamChange}
          />
        )}
        {activeTab === 'formations' && (
          <FormationsPanel
            formations={formations}
            searchValue={formationSearch}
            onSearchChange={setFormationSearch}
            onApplyFormation={onApplyFormation}
          />
        )}
      </div>
    </div>
  );
}

function ObjectsPanel({
  currentTool,
  playerPlacementTeam,
  onToolChange,
  onPlayerPlacementTeamChange,
}: {
  currentTool: EditorTool;
  playerPlacementTeam: Team;
  onToolChange: (tool: EditorTool) => void;
  onPlayerPlacementTeamChange: (team: Team) => void;
}) {
  return (
    <div className="space-y-4">
      <Section title="编辑对象">
        <div className="grid grid-cols-2 gap-1.5">
          {([
            ['select', '选择', Target],
            ['player', '球员', Users],
            ['ball', '足球', Circle],
            ['text', '文本', Type],
            ['zone', '区域', Square],
          ] as const).map(([tool, label, Icon]) => (
            <button
              key={tool}
              onClick={() => onToolChange(tool)}
              className={`flex flex-col items-center gap-1 rounded-md border px-1 py-2 text-xs transition-colors ${
                currentTool === tool
                  ? 'border-primary/30 bg-primary/20 text-primary'
                  : 'border-transparent text-muted-foreground hover:bg-secondary hover:text-foreground'
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>
      </Section>

      <Section title="新增球员默认队伍">
        <div className="grid grid-cols-2 gap-2">
          {([
            ['home', '主队'],
            ['away', '客队'],
          ] as const).map(([team, label]) => (
            <button
              key={team}
              onClick={() => onPlayerPlacementTeamChange(team)}
              className={`rounded-md border px-3 py-2 text-xs font-medium transition-colors ${
                playerPlacementTeam === team
                  ? 'border-primary/30 bg-primary/20 text-primary'
                  : 'border-border text-muted-foreground hover:bg-secondary hover:text-foreground'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </Section>

      <Section title="线路类型">
        <div className="space-y-1">
          {lineTools.map(({ tool, label, color }) => (
            <button
              key={tool}
              onClick={() => onToolChange(tool)}
              className={`flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-xs transition-colors ${
                currentTool === tool
                  ? 'bg-primary/20 text-primary'
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
              }`}
            >
              <div className={`h-0.5 w-3 rounded ${color}`} />
              <TrendingUp className="h-3.5 w-3.5" />
              {label}线路
            </button>
          ))}
        </div>
      </Section>

      <div className="rounded-lg border border-dashed border-border/70 bg-muted/20 px-3 py-2 text-[11px] leading-5 text-muted-foreground">
        选择“区域”工具后，可在球场空白处单击创建标记区域。图层和批量快捷操作仍放在后续版本。
      </div>
    </div>
  );
}

function FormationsPanel({
  formations,
  searchValue,
  onSearchChange,
  onApplyFormation,
}: {
  formations: { id: string; name: string }[];
  searchValue: string;
  onSearchChange: (value: string) => void;
  onApplyFormation: (formationId: string) => void;
}) {
  const [selected, setSelected] = useState<string | undefined>(formations[0]?.id);

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        <input
          placeholder="搜索阵型..."
          value={searchValue}
          onChange={(event) => onSearchChange(event.target.value)}
          className="h-8 w-full rounded-md bg-secondary pl-8 pr-3 text-xs text-foreground outline-none placeholder:text-muted-foreground focus:ring-1 focus:ring-primary"
        />
      </div>

      <Section title="内置阵型">
        <div className="space-y-1">
          {formations.map((formation) => (
            <button
              key={formation.id}
              onClick={() => {
                setSelected(formation.id);
                onApplyFormation(formation.id);
              }}
              className={`flex w-full items-center justify-between rounded-md border px-2.5 py-2 text-xs transition-colors ${
                selected === formation.id
                  ? 'border-primary/30 bg-primary/20 text-primary'
                  : 'border-transparent text-foreground hover:bg-secondary'
              }`}
            >
              <span className="font-medium">{formation.name}</span>
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          ))}
          {formations.length === 0 && (
            <div className="rounded-md border border-dashed border-border px-3 py-5 text-center text-xs text-muted-foreground">
              没有匹配的阵型
            </div>
          )}
        </div>
      </Section>

      <div className="rounded-lg border border-dashed border-border/70 bg-muted/20 px-3 py-2 text-[11px] leading-5 text-muted-foreground">
        自定义阵型保存会在后续版本开放。当前可以直接套用内置阵型继续编辑。
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <h3 className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">{title}</h3>
      {children}
    </div>
  );
}
