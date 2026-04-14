import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowUpDown,
  ChevronDown,
  Clock,
  Copy,
  ExternalLink,
  FileX2,
  FolderOpen,
  LayoutGrid,
  List,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Trash2,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from '@/components/ui/sonner';
import {
  deleteProject,
  duplicateProject,
  getDraftProjectForWorkspace,
  getDraftProjectId,
  getSavedProjectsForWorkspace,
  renameProject,
  type MockProject,
} from '@/data/mockProjects';

type ViewMode = 'grid' | 'list';
type SortBy = 'updated' | 'name' | 'created';
type FilterFormat = 'all' | '11人制' | '8人制' | '7人制' | '5人制';

const formatFilters: FilterFormat[] = ['all', '11人制', '8人制', '7人制', '5人制'];
const formatLabels: Record<FilterFormat, string> = {
  all: '全部',
  '11人制': '11人制',
  '8人制': '8人制',
  '7人制': '7人制',
  '5人制': '5人制',
};

const pitchVariants = [
  { players: [[3, 2], [5, 4], [8, 3], [11, 5], [7, 7]], lines: [[3, 2, 5, 4], [8, 3, 11, 5]] },
  { players: [[4, 3], [6, 2], [9, 6], [12, 4], [7, 5]], lines: [[4, 3, 6, 2], [9, 6, 7, 5]] },
  { players: [[3, 5], [6, 3], [10, 4], [8, 7], [5, 6]], lines: [[3, 5, 6, 3], [10, 4, 8, 7]] },
  { players: [[4, 2], [7, 5], [10, 3], [6, 6], [9, 7]], lines: [[4, 2, 7, 5]] },
  { players: [[3, 3], [5, 5], [8, 2], [11, 6], [9, 4]], lines: [[3, 3, 5, 5], [8, 2, 9, 4]] },
  { players: [[4, 4], [7, 2], [10, 5], [6, 7], [8, 3]], lines: [[4, 4, 7, 2], [10, 5, 6, 7]] },
];

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
            key={index}
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

function EmptyState({ type, onAction }: { type: 'empty' | 'no-results'; onAction?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-24">
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-border/30 bg-muted/30">
        {type === 'empty'
          ? <FolderOpen className="size-7 text-muted-foreground/25" />
          : <FileX2 className="size-7 text-muted-foreground/25" />}
      </div>
      <p className="mb-1.5 text-[15px] font-medium text-foreground/60">
        {type === 'empty' ? '还没有正式项目' : '没有找到匹配的项目'}
      </p>
      <p className="mb-6 max-w-xs text-center text-[12px] leading-relaxed text-muted-foreground/35">
        {type === 'empty'
          ? '创建你的第一个正式项目，开始本地编辑和继续保存。'
          : '尝试调整搜索关键词或筛选条件。'}
      </p>
      {type === 'empty' && onAction ? (
        <button
          onClick={onAction}
          className="flex h-9 items-center gap-2 rounded-lg bg-primary px-5 text-[13px] font-medium text-primary-foreground shadow-sm shadow-primary/20 transition-colors hover:bg-primary/90"
        >
          <Plus className="size-3.5" />
          新建项目
        </button>
      ) : null}
    </div>
  );
}

function openProject(navigate: ReturnType<typeof useNavigate>, project: MockProject) {
  navigate(`/editor/${project.id}`);
}

interface ProjectsSnapshot {
  draftProject: MockProject | null;
  savedProjects: MockProject[];
}

function readProjectsSnapshot(): ProjectsSnapshot {
  return {
    draftProject: getDraftProjectForWorkspace('personal'),
    savedProjects: getSavedProjectsForWorkspace('personal'),
  };
}

export default function ProjectsV2() {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<SortBy>('updated');
  const [filterFormat, setFilterFormat] = useState<FilterFormat>('all');
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [snapshot, setSnapshot] = useState<ProjectsSnapshot>(() => readProjectsSnapshot());

  const refreshProjects = useCallback(() => {
    setSnapshot(readProjectsSnapshot());
  }, []);

  useEffect(() => {
    refreshProjects();

    const handleFocus = () => refreshProjects();
    const handleStorage = () => refreshProjects();
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        refreshProjects();
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
  }, [refreshProjects]);

  const { draftProject, savedProjects } = snapshot;
  const hasAnyProject = Boolean(draftProject) || savedProjects.length > 0;
  const deleteProjectName = draftProject?.id === deleteTarget
    ? draftProject.name
    : (savedProjects.find((project) => project.id === deleteTarget)?.name ?? '该项目');

  const filtered = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return [...savedProjects]
      .filter((project) => {
        const matchSearch = normalizedSearch.length === 0 || project.name.toLowerCase().includes(normalizedSearch);
        const matchFormat = filterFormat === 'all' || project.formatLabel === filterFormat;
        return matchSearch && matchFormat;
      })
      .sort((left, right) => {
        if (sortBy === 'name') return left.name.localeCompare(right.name, 'zh-CN');
        if (sortBy === 'created') return right.createdAtIso.localeCompare(left.createdAtIso);
        return right.updatedAtIso.localeCompare(left.updatedAtIso);
      });
  }, [filterFormat, savedProjects, search, sortBy]);

  const handleRename = (project: MockProject) => {
    const nextName = window.prompt('请输入新的项目名称', project.name);
    if (!nextName || nextName.trim() === project.name) return;

    const renamed = renameProject(project.id, nextName);
    if (!renamed) {
      toast.error('重命名失败，请稍后重试');
      return;
    }

    toast.success('项目名称已更新', {
      description: nextName.trim(),
    });
    refreshProjects();
  };

  const handleCopy = (project: MockProject) => {
    const duplicatedId = duplicateProject(project.id);
    if (!duplicatedId) {
      toast.error('创建副本失败，请稍后重试');
      return;
    }

    toast.success('已创建项目副本', {
      description: `${project.name} 副本`,
    });
    refreshProjects();
  };

  const handleDelete = () => {
    if (!deleteTarget) return;

    const deleted = deleteProject(deleteTarget);
    if (!deleted) {
      toast.error('删除失败，请稍后重试');
      return;
    }

    if (selectedId === deleteTarget) {
      setSelectedId(null);
    }

    setDeleteTarget(null);
    toast.success('项目已删除');
    refreshProjects();
  };

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-6 sm:px-8 sm:py-10 lg:px-12">
      <div className="mb-6 flex items-center justify-between sm:mb-8">
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-foreground/90 sm:text-xl">我的项目</h1>
          <p className="mt-1 text-[12px] font-light text-muted-foreground/50 sm:text-[13px]">
            {savedProjects.length} 个正式项目
          </p>
        </div>
        <button
          onClick={() => navigate('/editor?mode=new')}
          className="flex h-8 items-center gap-1.5 rounded-lg bg-primary px-3.5 text-[12px] font-medium text-primary-foreground shadow-sm shadow-primary/20 transition-colors hover:bg-primary/90 sm:h-9 sm:gap-2 sm:px-5 sm:text-[13px]"
        >
          <Plus className="size-3.5" />
          <span className="hidden sm:inline">新建项目</span>
          <span className="sm:hidden">新建</span>
        </button>
      </div>

      {draftProject ? (
        <section className="mb-6 rounded-2xl border border-border/50 bg-card p-4 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
            <div className="overflow-hidden rounded-xl border border-border/30 bg-muted/40 lg:h-24 lg:w-36">
              <MiniPitch variant={0} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold text-foreground">继续未保存草稿</div>
              <div className="mt-1 text-xs leading-5 text-muted-foreground">
                {draftProject.name} · {draftProject.steps.length} 步骤 · {draftProject.updatedAt}
              </div>
              <div className="mt-2 text-[11px] text-muted-foreground/70">
                这是还没有保存为正式项目的本地草稿。继续编辑会恢复到上次自动保存的位置。
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => navigate('/editor?mode=resume')}
                className="rounded-lg bg-primary px-4 py-2 text-[12px] font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                继续编辑
              </button>
              <button
                onClick={() => setDeleteTarget(getDraftProjectId())}
                className="rounded-lg border border-border/50 bg-secondary px-4 py-2 text-[12px] font-medium text-foreground/75 transition-colors hover:bg-secondary/80"
              >
                放弃草稿
              </button>
            </div>
          </div>
        </section>
      ) : null}

      {savedProjects.length > 0 ? (
        <div className="mb-5 flex flex-wrap items-center gap-2 sm:mb-6 sm:gap-3">
          <div className="relative min-w-[160px] max-w-sm flex-1 sm:min-w-[200px]">
            <Search className="absolute left-2.5 top-1/2 size-3 -translate-y-1/2 text-muted-foreground/40" />
            <input
              placeholder="搜索项目..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="h-8 w-full rounded-md border border-border/30 bg-secondary/50 pl-7 pr-3 text-[11px] text-foreground/80 placeholder:text-muted-foreground/30 transition-all focus:bg-secondary focus:outline-none focus:ring-1 focus:ring-primary/30"
            />
          </div>

          <div className="flex items-center gap-1 overflow-x-auto scrollbar-thin">
            {formatFilters.map((format) => (
              <button
                key={format}
                onClick={() => setFilterFormat(format)}
                className={`h-7 whitespace-nowrap rounded-md px-2.5 text-[11px] font-medium transition-all duration-200 ${
                  filterFormat === format
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground/50 hover:bg-secondary/50 hover:text-foreground/70'
                }`}
              >
                {formatLabels[format]}
              </button>
            ))}
          </div>

          <div className="ml-auto flex items-center gap-1.5">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex h-7 items-center gap-1 rounded-md px-2.5 text-[11px] text-muted-foreground/50 transition-colors hover:bg-secondary/50 hover:text-foreground/70">
                  <ArrowUpDown className="size-3" />
                  <span className="hidden sm:inline">
                    {sortBy === 'updated' ? '最近编辑' : sortBy === 'name' ? '名称' : '创建时间'}
                  </span>
                  <ChevronDown className="size-2.5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-32 border-border/40 bg-popover">
                <DropdownMenuItem onClick={() => setSortBy('updated')} className="text-xs">最近编辑</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy('name')} className="text-xs">名称</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy('created')} className="text-xs">创建时间</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="hidden items-center overflow-hidden rounded-md border border-border/30 sm:flex">
              <button
                onClick={() => setViewMode('grid')}
                className={`flex h-7 w-7 items-center justify-center transition-colors ${
                  viewMode === 'grid' ? 'bg-secondary text-foreground/80' : 'text-muted-foreground/40 hover:text-foreground/60'
                }`}
              >
                <LayoutGrid className="size-3" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`flex h-7 w-7 items-center justify-center transition-colors ${
                  viewMode === 'list' ? 'bg-secondary text-foreground/80' : 'text-muted-foreground/40 hover:text-foreground/60'
                }`}
              >
                <List className="size-3" />
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {!hasAnyProject ? (
        <EmptyState type="empty" onAction={() => navigate('/editor?mode=new')} />
      ) : savedProjects.length === 0 ? (
        <EmptyState type="empty" onAction={() => navigate('/editor?mode=new')} />
      ) : filtered.length === 0 ? (
        <EmptyState type="no-results" />
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((project, index) => (
            <div
              key={project.id}
              onClick={() => setSelectedId(project.id)}
              className={`group cursor-pointer overflow-hidden rounded-xl border shadow-sm transition-all duration-300 ${
                selectedId === project.id
                  ? 'border-primary/30 bg-primary/[0.04] ring-1 ring-primary/20'
                  : 'border-border/40 bg-card hover:border-border/60 hover:bg-card/80'
              }`}
            >
              <button
                onClick={(event) => {
                  event.stopPropagation();
                  openProject(navigate, project);
                }}
                className="relative block h-28 w-full"
              >
                <MiniPitch variant={index} />
                <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/20">
                  <span className="flex items-center gap-1 text-[11px] font-medium text-white/80 opacity-0 transition-opacity group-hover:opacity-100">
                    <ExternalLink className="size-3" />
                    打开编辑
                  </span>
                </div>
              </button>
              <div className="p-3.5 pt-3">
                <div className="flex items-start justify-between gap-2">
                  <button
                    onClick={(event) => {
                      event.stopPropagation();
                      openProject(navigate, project);
                    }}
                    className="min-w-0 flex-1 text-left"
                  >
                    <p className="truncate text-[13px] font-medium text-foreground/80">{project.name}</p>
                  </button>
                  <ProjectActionsMenu
                    onOpen={() => openProject(navigate, project)}
                    onRename={() => handleRename(project)}
                    onCopy={() => handleCopy(project)}
                    onDelete={() => setDeleteTarget(project.id)}
                  />
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <span className="rounded border border-border/20 bg-muted/40 px-1.5 py-0.5 text-[10px] text-muted-foreground/40">
                    {project.formatLabel}
                  </span>
                  <span className="text-[10px] text-muted-foreground/35">{project.steps.length} 步骤</span>
                  <span className="ml-auto flex items-center gap-0.5 text-[10px] text-muted-foreground/30">
                    <Clock className="size-2.5" />
                    {project.updatedAt}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-1">
          {filtered.map((project, index) => (
            <div
              key={project.id}
              onClick={() => setSelectedId(project.id)}
              className={`group flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-3 transition-all duration-200 sm:gap-4 sm:px-4 ${
                selectedId === project.id
                  ? 'border-primary/20 bg-primary/[0.03]'
                  : 'border-transparent hover:border-border/30 hover:bg-secondary/30'
              }`}
            >
              <button
                onClick={(event) => {
                  event.stopPropagation();
                  openProject(navigate, project);
                }}
                className="h-10 w-14 shrink-0 overflow-hidden rounded-lg"
              >
                <MiniPitch variant={index} />
              </button>
              <button
                onClick={(event) => {
                  event.stopPropagation();
                  openProject(navigate, project);
                }}
                className="min-w-0 flex-1 text-left"
              >
                <p className="truncate text-[13px] font-medium text-foreground/80">{project.name}</p>
                <p className="mt-0.5 text-[10px] text-muted-foreground/35 sm:hidden">
                  {project.formatLabel} · {project.steps.length} 步骤 · {project.updatedAt}
                </p>
              </button>
              <span className="hidden shrink-0 rounded border border-border/20 bg-muted/40 px-1.5 py-0.5 text-[10px] text-muted-foreground/40 sm:inline">
                {project.formatLabel}
              </span>
              <span className="hidden w-14 shrink-0 text-center text-[10px] text-muted-foreground/35 sm:inline">
                {project.steps.length} 步骤
              </span>
              <span className="hidden w-20 shrink-0 items-center gap-1 text-[10px] text-muted-foreground/30 sm:flex">
                <Clock className="size-2.5" />
                {project.updatedAt}
              </span>
              <ProjectActionsMenu
                onOpen={() => openProject(navigate, project)}
                onRename={() => handleRename(project)}
                onCopy={() => handleCopy(project)}
                onDelete={() => setDeleteTarget(project.id)}
              />
            </div>
          ))}
        </div>
      )}

      <Dialog open={Boolean(deleteTarget)} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent className="max-w-sm overflow-hidden border-border/40 bg-popover p-0">
          <div className="h-1 bg-gradient-to-r from-destructive/60 via-destructive/40 to-transparent" />
          <div className="px-6 pb-6 pt-5">
            <DialogHeader className="mb-5">
              <DialogTitle className="text-base text-foreground/90">确认删除项目？</DialogTitle>
              <DialogDescription className="mt-1 text-[12px] font-light leading-relaxed text-muted-foreground/45">
                删除后无法恢复，“{deleteProjectName}”的本地内容都会被移除。
              </DialogDescription>
            </DialogHeader>
            <div className="flex gap-2">
              <button
                onClick={() => setDeleteTarget(null)}
                className="h-9 flex-1 rounded-lg border border-border/30 bg-secondary text-[13px] font-medium text-foreground/70 transition-colors hover:bg-secondary/80"
              >
                取消
              </button>
              <button
                onClick={handleDelete}
                className="h-9 flex-1 rounded-lg bg-destructive/90 text-[13px] font-medium text-destructive-foreground transition-colors hover:bg-destructive"
              >
                确认删除
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ProjectActionsMenu({
  onOpen,
  onRename,
  onCopy,
  onDelete,
}: {
  onOpen: () => void;
  onRename: () => void;
  onCopy: () => void;
  onDelete: () => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="h-6 w-6 shrink-0 rounded bg-secondary/60 backdrop-blur transition-all group-hover:opacity-100 hover:text-foreground/70 text-muted-foreground/50 opacity-0 flex items-center justify-center"
          onClick={(event) => event.stopPropagation()}
        >
          <MoreHorizontal className="size-3" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40 border-border/40 bg-popover">
        <DropdownMenuItem onClick={onOpen} className="gap-2 text-xs">
          <ExternalLink className="size-3.5" />
          打开
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onRename} className="gap-2 text-xs">
          <Pencil className="size-3.5" />
          重命名
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onCopy} className="gap-2 text-xs">
          <Copy className="size-3.5" />
          创建副本
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-border/30" />
        <DropdownMenuItem onClick={onDelete} className="gap-2 text-xs text-destructive focus:text-destructive">
          <Trash2 className="size-3.5" />
          删除
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
