import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, Clock, FileX2, FolderOpen, Plus, Sparkles, Zap } from 'lucide-react';
import {
  getDraftProjectForWorkspace,
  getLatestSavedProjectForWorkspace,
  getSavedProjectsForWorkspace,
  type MockProject,
} from '@/data/mockProjects';
import { getFormationsByFormat } from '@/data/mockData';
import { normalizeProjectNameValue } from '@/lib/project-name';
import type { FieldFormat } from '@/types/tactics';

const pitchVariants = [
  { players: [[3, 2], [5, 4], [8, 3], [11, 5], [7, 7]], lines: [[3, 2, 5, 4], [8, 3, 11, 5]] },
  { players: [[4, 3], [6, 2], [9, 6], [12, 4], [7, 5]], lines: [[4, 3, 6, 2], [9, 6, 7, 5]] },
  { players: [[3, 5], [6, 3], [10, 4], [8, 7], [5, 6]], lines: [[3, 5, 6, 3], [10, 4, 8, 7]] },
  { players: [[4, 2], [7, 5], [10, 3], [6, 6], [9, 7]], lines: [[4, 2, 7, 5]] },
  { players: [[3, 3], [5, 5], [8, 2], [11, 6], [9, 4]], lines: [[3, 3, 5, 5], [8, 2, 9, 4]] },
  { players: [[4, 4], [7, 2], [10, 5], [6, 7], [8, 3]], lines: [[4, 4, 7, 2], [10, 5, 6, 7]] },
];

const quickFormats: { format: FieldFormat; label: string }[] = [
  { format: '11v11', label: '11人制' },
  { format: '8v8', label: '8人制' },
  { format: '7v7', label: '7人制' },
  { format: '5v5', label: '5人制' },
];

interface WorkspaceSnapshot {
  draftProject: MockProject | null;
  latestSavedProject: MockProject | null;
  savedProjects: MockProject[];
}

interface DashboardLocationState {
  editorReturn?: {
    projectId: string;
    projectName: string;
    firstSave: boolean;
    savedOnReturn: boolean;
  };
}

function normalizeProjectName(name: string) {
  if (!name.trim()) {
    return '新建战术板';
  }

  return name.includes('新建') ? '新建战术板' : name;
}

function MiniPitch({ variant }: { variant: number }) {
  const current = pitchVariants[variant % pitchVariants.length];

  return (
    <div className="relative h-full w-full overflow-hidden bg-muted/40">
      <svg viewBox="0 0 16 10" className="absolute inset-0 h-full w-full">
        <rect x="1" y="1" width="14" height="8" rx="0.3" fill="none" stroke="hsl(var(--pitch-line))" strokeWidth="0.15" opacity="0.25" />
        <line x1="8" y1="1" x2="8" y2="9" stroke="hsl(var(--pitch-line))" strokeWidth="0.12" opacity="0.2" />
        <circle cx="8" cy="5" r="1.2" fill="none" stroke="hsl(var(--pitch-line))" strokeWidth="0.12" opacity="0.2" />
        <rect x="1" y="3" width="2" height="4" fill="none" stroke="hsl(var(--pitch-line))" strokeWidth="0.1" opacity="0.15" />
        <rect x="13" y="3" width="2" height="4" fill="none" stroke="hsl(var(--pitch-line))" strokeWidth="0.1" opacity="0.15" />
        {current.players.map((player, index) => (
          <circle
            key={index}
            cx={player[0]}
            cy={player[1]}
            r="0.35"
            fill={index < 3 ? 'hsl(var(--team-home))' : 'hsl(var(--team-away))'}
            opacity="0.5"
          />
        ))}
        {current.lines.map((line, index) => (
          <line
            key={`line-${index}`}
            x1={line[0]}
            y1={line[1]}
            x2={line[2]}
            y2={line[3]}
            stroke="hsl(var(--line-run))"
            strokeWidth="0.12"
            opacity="0.25"
            strokeDasharray="0.3,0.2"
          />
        ))}
      </svg>
    </div>
  );
}

function readWorkspaceSnapshot(): WorkspaceSnapshot {
  const savedProjects = getSavedProjectsForWorkspace('personal');

  return {
    draftProject: getDraftProjectForWorkspace('personal'),
    latestSavedProject: getLatestSavedProjectForWorkspace('personal'),
    savedProjects,
  };
}

export default function DashboardV2() {
  const navigate = useNavigate();
  const location = useLocation();
  const [snapshot, setSnapshot] = useState<WorkspaceSnapshot>(() => readWorkspaceSnapshot());
  const [returnNotice, setReturnNotice] = useState<DashboardLocationState['editorReturn'] | null>(null);

  const refreshSnapshot = useCallback(() => {
    setSnapshot(readWorkspaceSnapshot());
  }, []);

  useEffect(() => {
    refreshSnapshot();

    const handleFocus = () => refreshSnapshot();
    const handleStorage = () => refreshSnapshot();
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        refreshSnapshot();
      }
    };

    window.addEventListener('focus', handleFocus);
    window.addEventListener('storage', handleStorage);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('storage', handleStorage);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [refreshSnapshot]);

  useEffect(() => {
    const state = location.state as DashboardLocationState | null;
    if (!state?.editorReturn) {
      return;
    }

    refreshSnapshot();
    setReturnNotice(state.editorReturn);
    navigate(location.pathname, { replace: true, state: null });
  }, [location.pathname, location.state, navigate, refreshSnapshot]);

  const { draftProject, latestSavedProject, savedProjects } = snapshot;
  const recentProjects = savedProjects.slice(0, 6);
  const highlightedProjectId = returnNotice?.projectId ?? null;

  const continueEntry = useMemo(() => {
    if (draftProject) {
      return {
        title: '继续未保存草稿',
        description: `上次自动保存的本地草稿，${draftProject.steps.length} 个步骤，${draftProject.updatedAt}`,
        hint: '会恢复到上次自动保存的位置',
        disabled: false,
        onClick: () => navigate('/editor?mode=resume'),
      };
    }

    if (latestSavedProject) {
      return {
        title: '继续最近项目',
        description: `${normalizeProjectNameValue(latestSavedProject.name)} · ${latestSavedProject.steps.length} 个步骤 · ${latestSavedProject.updatedAt}`,
        hint: '直接打开最近一次保存的正式项目',
        disabled: false,
        onClick: () => navigate(`/editor/${latestSavedProject.id}`),
      };
    }

    return {
      title: '还没有可继续的项目',
      description: '先新建一个空白项目，或者从阵型快捷开始进入编辑器。',
      hint: '保存后的项目会自动出现在这里',
      disabled: true,
      onClick: () => {},
    };
  }, [draftProject, latestSavedProject, navigate]);

  const noticeTitle = returnNotice?.firstSave
    ? '首次保存成功'
    : returnNotice?.savedOnReturn
      ? '已保存并返回工作台'
      : returnNotice
        ? '已返回工作台'
        : null;

  const noticeDescription = returnNotice?.firstSave
    ? `“${returnNotice.projectName}” 已创建为本地项目，现在可以从工作台继续编辑。`
    : returnNotice?.savedOnReturn
      ? `“${returnNotice.projectName}” 的最新内容已经保存到本地。`
      : returnNotice
        ? `“${returnNotice.projectName}” 已保存在本地，可随时重新打开。`
        : null;

  return (
    <div className="mx-auto max-w-[1200px] space-y-10 px-4 py-6 sm:space-y-12 sm:px-8 sm:py-10 lg:px-12">
      <section className="space-y-6 pt-1">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground/90">战术工作台</h1>
          <p className="mt-1.5 text-[13px] font-light text-muted-foreground/50">
            这里聚焦三条主入口：新建空白项目、继续上次编辑、打开最近的本地项目。
          </p>
        </div>

        {returnNotice && noticeTitle && noticeDescription ? (
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.08] px-4 py-4 text-left shadow-sm shadow-emerald-500/5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2 text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                  <Sparkles className="h-4 w-4" />
                  {noticeTitle}
                </div>
                <p className="mt-1 text-xs leading-5 text-emerald-800/85 dark:text-emerald-200/85">{noticeDescription}</p>
              </div>
              <button
                onClick={() => navigate(`/editor/${returnNotice.projectId}`)}
                className="inline-flex h-9 items-center justify-center rounded-lg bg-emerald-600 px-4 text-sm font-medium text-white transition-colors hover:bg-emerald-500"
              >
                继续编辑
              </button>
            </div>
          </div>
        ) : null}

        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <button
            onClick={() => navigate('/editor?mode=new')}
            className="rounded-2xl border border-primary/20 bg-primary/[0.08] p-4 text-left transition-colors hover:bg-primary/[0.12]"
          >
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm shadow-primary/20">
                <Plus className="h-4 w-4" />
              </div>
              <ArrowRight className="h-4 w-4 text-primary/70" />
            </div>
            <div className="mt-4 text-sm font-semibold text-foreground">新建空白项目</div>
            <div className="mt-1 text-xs leading-5 text-muted-foreground">
              直接进入空白编辑器，不恢复旧草稿，适合开始一个全新的本地项目。
            </div>
          </button>

          <button
            onClick={continueEntry.onClick}
            disabled={continueEntry.disabled}
            className={`rounded-2xl border p-4 text-left transition-colors ${
              continueEntry.disabled
                ? 'cursor-not-allowed border-border/40 bg-card/50 opacity-70'
                : 'border-border/50 bg-card hover:bg-card/80'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-foreground/75">
                <Clock className="h-4 w-4" />
              </div>
              <ArrowRight className={`h-4 w-4 ${continueEntry.disabled ? 'text-muted-foreground/20' : 'text-muted-foreground/50'}`} />
            </div>
            <div className="mt-4 text-sm font-semibold text-foreground">{continueEntry.title}</div>
            <div className="mt-1 text-xs leading-5 text-muted-foreground">{continueEntry.description}</div>
            <div className="mt-3 text-[11px] text-muted-foreground/70">{continueEntry.hint}</div>
          </button>

          <button
            onClick={() => navigate('/projects')}
            className="rounded-2xl border border-border/50 bg-card p-4 text-left transition-colors hover:bg-card/80"
          >
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-foreground/75">
                <FolderOpen className="h-4 w-4" />
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground/50" />
            </div>
            <div className="mt-4 text-sm font-semibold text-foreground">打开项目列表</div>
            <div className="mt-1 text-xs leading-5 text-muted-foreground">
              查看所有正式项目，并从最近编辑列表里重新进入已有内容。
            </div>
            <div className="mt-3 text-[11px] text-muted-foreground/70">当前共有 {savedProjects.length} 个正式项目</div>
          </button>
        </div>

        {draftProject && latestSavedProject ? (
          <div className="rounded-xl border border-border/40 bg-card/70 px-4 py-3 text-[12px] text-muted-foreground">
            当前同时存在未保存草稿和正式项目。
            <span className="text-foreground/80">“继续上次编辑”</span>
            会优先恢复草稿；如果你要打开正式项目，请直接从最近项目或项目列表进入。
          </div>
        ) : null}
      </section>

      <section>
        <h2 className="mb-4 text-[13px] font-medium tracking-wide text-foreground/70">
          <Zap className="-mt-0.5 mr-1.5 inline-block h-3.5 w-3.5 text-primary/60" />
          快捷开始 · 选择阵型
        </h2>
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          {quickFormats.map(({ format, label }) => {
            const formations = getFormationsByFormat(format).slice(0, 3);

            return (
              <div key={format} className="rounded-xl border border-border/40 bg-card p-3.5 shadow-sm">
                <p className="mb-2.5 text-[12px] font-medium text-foreground/75">{label}</p>
                <div className="space-y-1">
                  {formations.map((formation) => (
                    <button
                      key={formation.id}
                      onClick={() => navigate(`/editor?mode=new&presetId=${formation.id}`)}
                      className="h-7 w-full rounded-md px-2.5 text-left text-[11px] text-muted-foreground/60 transition-colors hover:bg-secondary/60 hover:text-foreground/80"
                    >
                      {formation.name}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-[13px] font-medium tracking-wide text-foreground/70">最近项目</h2>
          <button
            onClick={() => navigate('/projects')}
            className="text-[11px] text-muted-foreground/40 transition-colors hover:text-foreground/60"
          >
            查看全部
          </button>
        </div>

        {recentProjects.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-16">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-border/30 bg-muted/30">
              <FileX2 className="h-6 w-6 text-muted-foreground/25" />
            </div>
            <p className="mb-1 text-[14px] font-medium text-foreground/55">还没有正式项目</p>
            <p className="max-w-xs text-center text-[12px] text-muted-foreground/35">
              点上方“新建空白项目”开始第一张本地战术板；保存后就会出现在这里。
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {recentProjects.map((project, index) => (
              <button
                key={project.id}
                onClick={() => navigate(`/editor/${project.id}`)}
                className={`group overflow-hidden rounded-xl border bg-card text-left shadow-sm transition-all duration-300 hover:bg-card/80 ${
                  project.id === highlightedProjectId
                    ? 'border-emerald-500/40 ring-2 ring-emerald-500/20'
                    : 'border-border/40 hover:border-border/60'
                }`}
              >
                <div className="relative h-28">
                  <MiniPitch variant={index} />
                </div>
                <div className="p-3.5 pt-3">
                  <div className="flex items-start justify-between gap-3">
                    <p className="truncate text-[13px] font-medium text-foreground/80">{normalizeProjectNameValue(project.name)}</p>
                    {project.id === highlightedProjectId ? (
                      <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-700 dark:text-emerald-300">
                        刚保存
                      </span>
                    ) : null}
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="rounded border border-border/20 bg-muted/40 px-1.5 py-0.5 text-[10px] text-muted-foreground/40">
                      {project.formatLabel}
                    </span>
                    <span className="text-[10px] text-muted-foreground/35">{project.steps.length} 个步骤</span>
                    <span className="ml-auto flex items-center gap-0.5 text-[10px] text-muted-foreground/30">
                      <Clock className="h-2.5 w-2.5" />
                      {project.updatedAt}
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </section>

      <section className="pb-8">
        <div className="rounded-xl border border-border/30 bg-muted/20 px-4 py-3 text-center">
          <p className="text-[11px] font-light text-muted-foreground/35">
            所有项目和草稿都保存在本地设备，无需注册，默认离线可用。
          </p>
        </div>
      </section>
    </div>
  );
}
