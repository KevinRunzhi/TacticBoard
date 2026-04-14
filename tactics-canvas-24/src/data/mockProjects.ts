import { buildPlayersForFormation, defaultSteps, getFormationsByFormat } from '@/data/mockData';
import type {
  AreaObject,
  EditorState,
  FieldFormat,
  FieldStyle,
  MatchMeta,
  PlayerStyle,
  ReferenceImage,
  StepFrame,
} from '@/types/tactics';
import { WORKSPACE_STORAGE_KEY, type Workspace } from '@/types/workspace';
import { EDITOR_PREFERENCES_STORAGE_KEY, getEditorPreferences } from '@/lib/editor-preferences';
import { normalizeProjectNameValue } from '@/lib/project-name';
import { cloneStepFrame } from '@/lib/step-frame';

export interface MockProject {
  id: string;
  name: string;
  format: FieldFormat;
  formatLabel: string;
  updatedAt: string;
  updatedAtIso: string;
  createdAt: string;
  createdAtIso: string;
  author: string;
  matchMeta: MatchMeta;
  referenceImage: ReferenceImage | null;
  steps: StepFrame[];
  space: Workspace;
  isDraft?: boolean;
}

export interface ProjectIndexEntry {
  id: string;
  name: string;
  format: FieldFormat;
  createdAtIso: string;
  updatedAtIso: string;
  author: string;
  space: Workspace;
}

interface StoredProjectRecord {
  id: string;
  state: EditorState;
  createdAtIso: string;
  updatedAtIso: string;
  author: string;
  space: Workspace;
}

interface StoredDraftRecord {
  savedAtIso: string;
  state: EditorState;
}

interface ProjectSeed {
  id: string;
  name: string;
  format: FieldFormat;
  stepCount: number;
  createdMinutesAgo: number;
  updatedMinutesAgo: number;
  author: string;
}

const PROJECT_INDEX_KEY = 'tactics-canvas:projects:index:v1';
const PROJECT_STORAGE_READY_KEY = 'tactics-canvas:projects:ready:v1';
const PROJECT_STORAGE_PREFIX = 'tactics-canvas:project:v1:';
const PROJECT_DRAFT_PREFIX = 'tactics-canvas:draft:project:v1:';
const NEW_PROJECT_DRAFT_KEY = 'tactics-canvas:draft:new:v1';
const LOCAL_DRAFT_PROJECT_ID = 'local-draft';
const DEFAULT_PROJECT_NAME = '新建战术板';
const DEFAULT_AUTHOR = '本地项目';

export interface LocalProjectDataSummary {
  projectCount: number;
  draftCount: number;
  totalBytes: number;
}

const formatLabels: Record<FieldFormat, string> = {
  '11v11': '11人制',
  '8v8': '8人制',
  '7v7': '7人制',
  '5v5': '5人制',
};

const projectSeeds: ProjectSeed[] = [
  {
    id: '1',
    name: 'U21 联赛 · 第三轮战术部署',
    format: '11v11',
    stepCount: 3,
    createdMinutesAgo: 3 * 24 * 60,
    updatedMinutesAgo: 20,
    author: '张伟',
  },
  {
    id: '2',
    name: '周末友谊赛 4-3-3 逼抢体系',
    format: '11v11',
    stepCount: 5,
    createdMinutesAgo: 7 * 24 * 60,
    updatedMinutesAgo: 2 * 60,
    author: '张伟',
  },
  {
    id: '3',
    name: '5 人制快攻套路合集',
    format: '5v5',
    stepCount: 4,
    createdMinutesAgo: 14 * 24 * 60,
    updatedMinutesAgo: 24 * 60,
    author: '张伟',
  },
  {
    id: '4',
    name: '角球防守站位',
    format: '11v11',
    stepCount: 2,
    createdMinutesAgo: 30 * 24 * 60,
    updatedMinutesAgo: 3 * 24 * 60,
    author: '张伟',
  },
  {
    id: '5',
    name: '8 人制 3-3-1 阵型教学',
    format: '8v8',
    stepCount: 6,
    createdMinutesAgo: 35 * 24 * 60,
    updatedMinutesAgo: 7 * 24 * 60,
    author: '张伟',
  },
];

function getProjectStorageKey(projectId: string) {
  return `${PROJECT_STORAGE_PREFIX}${projectId}`;
}

function getDraftStorageKey(projectId?: string) {
  return projectId ? `${PROJECT_DRAFT_PREFIX}${projectId}` : NEW_PROJECT_DRAFT_KEY;
}

function createProjectId() {
  return `project-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function createIsoMinutesAgo(minutesAgo: number) {
  return new Date(Date.now() - minutesAgo * 60 * 1000).toISOString();
}

function cloneStep(step: StepFrame, index: number): StepFrame {
  return {
    ...step,
    id: step.id || `step-${index + 1}`,
    label: step.label || `第 ${index + 1} 步`,
    description: step.description ?? '',
    players: step.players.map((player) => ({ ...player })),
    lines: step.lines.map((line) => ({ ...line })),
    ball: { ...step.ball },
    texts: step.texts.map((text) => ({ ...text })),
    areas: (step.areas ?? []).map((area) => ({ ...area })),
  };
}

export function cloneEditorState(state: EditorState): EditorState {
  return {
    ...state,
    matchMeta: { ...state.matchMeta },
    referenceImage: state.referenceImage ? { ...state.referenceImage } : null,
    steps: state.steps.map((step, index) => cloneStepFrame(step, index)),
  };
}

function createDefaultMatchMeta(): MatchMeta {
  return {
    title: '',
    score: '',
    minute: '',
    phaseLabel: '',
  };
}

function normalizeReferenceImage(referenceImage: ReferenceImage | null | undefined) {
  if (!referenceImage) return null;

  return {
    ...referenceImage,
    scale: referenceImage.scale ?? 1,
    offsetX: referenceImage.offsetX ?? 0,
    offsetY: referenceImage.offsetY ?? 0,
  };
}

function createEmptyStep(index = 0): StepFrame {
  return {
    id: `step-empty-${index + 1}`,
    label: `第 ${index + 1} 步`,
    description: '',
    players: [],
    lines: [],
    ball: {
      id: `ball-empty-${index + 1}`,
      x: 50,
      y: 50,
    },
    texts: [],
    areas: [],
  };
}

function buildFallbackStepsForFormat(format: FieldFormat, stepCount: number) {
  const fallbackFormation = getFormationsByFormat(format)[0];
  const baseStep = createEmptyStep(0);

  if (fallbackFormation) {
    baseStep.players = buildPlayersForFormation(fallbackFormation, 'home');
  }

  const steps = [baseStep];
  while (steps.length < stepCount) {
    steps.push(cloneStepFrame(baseStep, steps.length));
  }

  return steps;
}

export function buildProjectSteps(stepCount: number, format: FieldFormat = '11v11'): StepFrame[] {
  if (stepCount <= 0) {
    return [createEmptyStep()];
  }

  if (format !== '11v11') {
    return buildFallbackStepsForFormat(format, stepCount);
  }

  const base = defaultSteps.map((step, index) => cloneStepFrame(step, index));

  if (stepCount <= base.length) {
    return base.slice(0, stepCount);
  }

  const extended = [...base];
  while (extended.length < stepCount) {
    extended.push(cloneStepFrame(extended[extended.length - 1], extended.length));
  }

  return extended;
}

function normalizeWorkspace(_space?: string | null): Workspace {
  return 'personal';
}

function normalizeEditorState(state: EditorState): EditorState {
  const cloned = cloneEditorState(state);
  const steps = cloned.steps.length > 0
    ? cloned.steps.map((step, index) => cloneStepFrame(step, index))
    : [createEmptyStep()];
  const currentStepIndex = Math.min(Math.max(cloned.currentStepIndex, 0), steps.length - 1);

  return {
    ...cloned,
    projectName: normalizeProjectNameValue(cloned.projectName),
    matchMeta: {
      ...createDefaultMatchMeta(),
      ...(cloned.matchMeta ?? {}),
    },
    referenceImage: normalizeReferenceImage(cloned.referenceImage),
    space: normalizeWorkspace(cloned.space),
    currentTool: 'select',
    activeFormationId: cloned.activeFormationId ?? null,
    formationMode: cloned.formationMode ?? (cloned.activeFormationId ? 'preset' : 'custom'),
    selectedPlayerId: null,
    selectedLineId: null,
    selectedTextId: null,
    selectedAreaId: null,
    playerPlacementTeam: cloned.playerPlacementTeam ?? 'home',
    currentStepIndex,
    steps,
    isPlaying: false,
  };
}

export function hasMeaningfulProjectContent(state: EditorState) {
  const projectNameChanged = state.projectName.trim() !== '' && state.projectName.trim() !== DEFAULT_PROJECT_NAME;
  const hasMultipleSteps = state.steps.length > 1;

  const hasEditedStep = state.steps.some((step) => {
    const hasPlayers = step.players.length > 0;
    const hasLines = step.lines.length > 0;
    const hasTexts = step.texts.length > 0;
    const hasAreas = (step.areas ?? []).length > 0;
    const hasDescription = Boolean(step.description?.trim());
    const ballMoved = step.ball.x !== 50 || step.ball.y !== 50;

    return hasPlayers || hasLines || hasTexts || hasAreas || hasDescription || ballMoved;
  });

  const hasMatchMeta = Object.values(state.matchMeta ?? {}).some((value) => Boolean(value?.trim?.()));
  const hasReferenceImage = Boolean(state.referenceImage?.localUri);

  return projectNameChanged || hasMultipleSteps || hasEditedStep || hasMatchMeta || hasReferenceImage;
}

function parseStoredValue<T>(raw: string | null): T | null {
  if (!raw) return null;

  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function sortIndexEntries(entries: ProjectIndexEntry[]) {
  return [...entries].sort((a, b) => {
    if (a.updatedAtIso === b.updatedAtIso) {
      return a.name.localeCompare(b.name, 'zh-CN');
    }

    return b.updatedAtIso.localeCompare(a.updatedAtIso);
  });
}

function readProjectIndex() {
  if (typeof window === 'undefined') return [] as ProjectIndexEntry[];

  const parsed = parseStoredValue<ProjectIndexEntry[]>(window.localStorage.getItem(PROJECT_INDEX_KEY));
  return Array.isArray(parsed) ? sortIndexEntries(parsed) : [];
}

function writeProjectIndex(entries: ProjectIndexEntry[]) {
  if (typeof window === 'undefined') return;

  window.localStorage.setItem(PROJECT_INDEX_KEY, JSON.stringify(sortIndexEntries(entries)));
}

function getManagedProjectStorageKeys() {
  if (typeof window === 'undefined') return [] as string[];

  const keys: string[] = [];
  for (let index = 0; index < window.localStorage.length; index += 1) {
    const key = window.localStorage.key(index);
    if (!key) continue;

    if (
      key === PROJECT_INDEX_KEY ||
      key === PROJECT_STORAGE_READY_KEY ||
      key === NEW_PROJECT_DRAFT_KEY ||
      key === EDITOR_PREFERENCES_STORAGE_KEY ||
      key === WORKSPACE_STORAGE_KEY ||
      key.startsWith(PROJECT_STORAGE_PREFIX) ||
      key.startsWith(PROJECT_DRAFT_PREFIX)
    ) {
      keys.push(key);
    }
  }

  return keys;
}

function readProjectRecord(projectId: string) {
  if (typeof window === 'undefined') return null as StoredProjectRecord | null;

  const parsed = parseStoredValue<StoredProjectRecord>(window.localStorage.getItem(getProjectStorageKey(projectId)));
  if (!parsed || typeof parsed !== 'object' || !parsed.state) return null;

  return {
    ...parsed,
    state: normalizeEditorState(parsed.state),
    space: normalizeWorkspace(parsed.space ?? parsed.state.space),
  };
}

function writeProjectRecord(record: StoredProjectRecord) {
  if (typeof window === 'undefined') return;

  window.localStorage.setItem(
    getProjectStorageKey(record.id),
    JSON.stringify({
      ...record,
      space: normalizeWorkspace(record.space),
      state: normalizeEditorState(record.state),
    }),
  );
}

function removeProjectRecord(projectId: string) {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(getProjectStorageKey(projectId));
}

function readDraftRecord(projectId?: string) {
  if (typeof window === 'undefined') return null as StoredDraftRecord | null;

  const parsed = parseStoredValue<StoredDraftRecord>(window.localStorage.getItem(getDraftStorageKey(projectId)));
  if (!parsed || typeof parsed !== 'object' || !parsed.state) return null;

  return {
    savedAtIso: parsed.savedAtIso ?? new Date().toISOString(),
    state: normalizeEditorState(parsed.state),
  };
}

function writeDraftRecord(projectId: string | undefined, state: EditorState) {
  if (typeof window === 'undefined') return;

  const normalized = normalizeEditorState(state);
  if (!projectId && !hasMeaningfulProjectContent(normalized)) {
    window.localStorage.removeItem(getDraftStorageKey(projectId));
    return;
  }

  const payload: StoredDraftRecord = {
    savedAtIso: new Date().toISOString(),
    state: normalized,
  };

  window.localStorage.setItem(getDraftStorageKey(projectId), JSON.stringify(payload));
}

function removeDraftRecord(projectId?: string) {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(getDraftStorageKey(projectId));
}

function createSeedRecord(seed: ProjectSeed): StoredProjectRecord {
  const createdAtIso = createIsoMinutesAgo(seed.createdMinutesAgo);
  const updatedAtIso = createIsoMinutesAgo(seed.updatedMinutesAgo);
  const state = createBlankEditorState({
    projectName: seed.name,
    fieldFormat: seed.format,
    space: 'personal',
  });

  state.steps = buildProjectSteps(seed.stepCount, seed.format);

  return {
    id: seed.id,
    state: normalizeEditorState(state),
    createdAtIso,
    updatedAtIso,
    author: seed.author,
    space: 'personal',
  };
}

function ensureProjectStorage() {
  if (typeof window === 'undefined') return;

  const rawIndex = window.localStorage.getItem(PROJECT_INDEX_KEY);
  const parsedIndex = rawIndex !== null ? parseStoredValue<ProjectIndexEntry[]>(rawIndex) : null;
  const storageReady = window.localStorage.getItem(PROJECT_STORAGE_READY_KEY);

  if (storageReady) {
    if (Array.isArray(parsedIndex)) return;

    writeProjectIndex([]);
    return;
  }

  if (Array.isArray(parsedIndex)) {
    window.localStorage.setItem(PROJECT_STORAGE_READY_KEY, 'ready');
    return;
  }

  const seedRecords = projectSeeds.map((seed) => createSeedRecord(seed));
  const seedIndex = seedRecords.map((record) => ({
    id: record.id,
    name: record.state.projectName,
    format: record.state.fieldFormat,
    createdAtIso: record.createdAtIso,
    updatedAtIso: record.updatedAtIso,
    author: record.author,
    space: 'personal' as Workspace,
  }));

  seedRecords.forEach((record) => writeProjectRecord(record));
  writeProjectIndex(seedIndex);
  window.localStorage.setItem(PROJECT_STORAGE_READY_KEY, 'seeded');
}

function formatRelativeTime(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const diffMinutes = Math.max(0, Math.floor(diffMs / (60 * 1000)));

  if (diffMinutes < 1) return '刚刚保存';
  if (diffMinutes < 60) return `${diffMinutes} 分钟前`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} 小时前`;
  if (diffHours < 48) return '昨天';

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays} 天前`;

  const diffWeeks = Math.floor(diffDays / 7);
  if (diffWeeks < 5) return `${diffWeeks} 周前`;

  const diffMonths = Math.floor(diffDays / 30);
  return `${Math.max(diffMonths, 1)} 个月前`;
}

function toMockProject(record: StoredProjectRecord, overrides?: Partial<MockProject>): MockProject {
  const state = normalizeEditorState(record.state);

  return {
    id: record.id,
    name: state.projectName,
    format: state.fieldFormat,
    formatLabel: formatLabels[state.fieldFormat],
    updatedAt: formatRelativeTime(record.updatedAtIso),
    updatedAtIso: record.updatedAtIso,
    createdAt: formatRelativeTime(record.createdAtIso),
    createdAtIso: record.createdAtIso,
    author: record.author,
    matchMeta: { ...state.matchMeta },
    referenceImage: normalizeReferenceImage(state.referenceImage),
    steps: state.steps.map((step, index) => cloneStepFrame(step, index)),
    space: normalizeWorkspace(record.space),
    ...overrides,
  };
}

function getProjectRecordFromIndex(projectId?: string | null) {
  if (!projectId) return null;

  ensureProjectStorage();
  return readProjectRecord(projectId);
}

export function createBlankEditorState(options?: {
  projectName?: string;
  fieldFormat?: FieldFormat;
  fieldStyle?: FieldStyle;
  playerStyle?: PlayerStyle;
  space?: Workspace;
}): EditorState {
  const preferences = getEditorPreferences();

  return {
    projectName: options?.projectName ?? DEFAULT_PROJECT_NAME,
    fieldFormat: options?.fieldFormat ?? preferences.defaultFieldFormat,
    fieldView: 'full',
    fieldStyle: options?.fieldStyle ?? preferences.defaultFieldStyle,
    matchMeta: createDefaultMatchMeta(),
    referenceImage: null,
    orientation: 'vertical',
    activeFormationId: null,
    formationMode: 'custom',
    currentTool: 'select',
    playerStyle: options?.playerStyle ?? preferences.defaultPlayerStyle,
    playerPlacementTeam: 'home',
    selectedPlayerId: null,
    selectedLineId: null,
    selectedTextId: null,
    selectedAreaId: null,
    currentStepIndex: 0,
    steps: [createEmptyStep()],
    isPlaying: false,
    space: normalizeWorkspace(options?.space),
  };
}

export function createEditorStateFromProject(project: MockProject): EditorState {
  return normalizeEditorState({
    projectName: project.name,
    fieldFormat: project.format,
    fieldView: 'full',
    fieldStyle: 'realistic',
    matchMeta: { ...project.matchMeta },
    referenceImage: normalizeReferenceImage(project.referenceImage),
    orientation: 'vertical',
    activeFormationId: null,
    formationMode: 'custom',
    currentTool: 'select',
    playerStyle: 'dot',
    playerPlacementTeam: 'home',
    selectedPlayerId: null,
    selectedLineId: null,
    selectedTextId: null,
    selectedAreaId: null,
    currentStepIndex: 0,
    steps: project.steps.map((step, index) => cloneStepFrame(step, index)),
    isPlaying: false,
    space: normalizeWorkspace(project.space),
  });
}

export function loadProjectEditorState(projectId?: string | null): EditorState | null {
  ensureProjectStorage();

  if (!projectId || projectId === LOCAL_DRAFT_PROJECT_ID) {
    return null;
  }

  const record = readProjectRecord(projectId);
  return record ? cloneEditorState(record.state) : null;
}

export function loadSavedEditorState(projectId?: string): EditorState | null {
  ensureProjectStorage();
  return readDraftRecord(projectId)?.state ?? null;
}

export function saveDraftState(projectId: string | undefined, state: EditorState) {
  ensureProjectStorage();
  writeDraftRecord(projectId, state);
}

export function saveEditorState(projectId: string | undefined, state: EditorState) {
  saveDraftState(projectId, state);
}

export function saveProjectState(projectId: string | undefined, state: EditorState) {
  ensureProjectStorage();

  const nowIso = new Date().toISOString();
  const normalizedState = normalizeEditorState(state);
  const existingRecord = projectId ? readProjectRecord(projectId) : null;
  const nextId = existingRecord?.id ?? projectId ?? createProjectId();
  const nextRecord: StoredProjectRecord = {
    id: nextId,
    state: normalizedState,
    createdAtIso: existingRecord?.createdAtIso ?? nowIso,
    updatedAtIso: nowIso,
    author: existingRecord?.author ?? DEFAULT_AUTHOR,
    space: 'personal',
  };

  writeProjectRecord(nextRecord);

  const currentIndex = readProjectIndex().filter((entry) => entry.id !== nextId);
  currentIndex.push({
    id: nextId,
    name: normalizedState.projectName,
    format: normalizedState.fieldFormat,
    createdAtIso: nextRecord.createdAtIso,
    updatedAtIso: nextRecord.updatedAtIso,
    author: nextRecord.author,
    space: 'personal',
  });
  writeProjectIndex(currentIndex);

  removeDraftRecord(nextId);
  if (!projectId || projectId === LOCAL_DRAFT_PROJECT_ID) {
    removeDraftRecord(undefined);
  }

  return nextId;
}

export function getProjectForDisplay(projectId?: string | null): MockProject | null {
  ensureProjectStorage();

  if (projectId === LOCAL_DRAFT_PROJECT_ID) {
    const draft = readDraftRecord(undefined);
    if (!draft) return null;

    return toMockProject(
      {
        id: LOCAL_DRAFT_PROJECT_ID,
        state: draft.state,
        createdAtIso: draft.savedAtIso,
        updatedAtIso: draft.savedAtIso,
        author: DEFAULT_AUTHOR,
        space: 'personal',
      },
      { isDraft: true },
    );
  }

  const record = getProjectRecordFromIndex(projectId);
  if (!record) return null;

  const draft = readDraftRecord(record.id);
  if (!draft) return toMockProject(record);

  return toMockProject({
    ...record,
    state: draft.state,
    updatedAtIso: draft.savedAtIso,
  });
}

export function getMockProjectById(projectId?: string | null): MockProject | null {
  return getProjectForDisplay(projectId);
}

export function getProjectsForWorkspace(workspace: Workspace): MockProject[] {
  ensureProjectStorage();
  if (workspace !== 'personal') return [];

  const projects = readProjectIndex()
    .filter((entry) => normalizeWorkspace(entry.space) === 'personal')
    .map((entry) => getProjectForDisplay(entry.id))
    .filter((project): project is MockProject => Boolean(project));

  const newDraft = getProjectForDisplay(LOCAL_DRAFT_PROJECT_ID);
  const merged = newDraft ? [newDraft, ...projects] : projects;

  return merged.sort((a, b) => b.updatedAtIso.localeCompare(a.updatedAtIso));
}

export function getLatestProjectForWorkspace(workspace: Workspace) {
  return getProjectsForWorkspace(workspace)[0] ?? null;
}

export function getDraftProjectForWorkspace(workspace: Workspace) {
  if (workspace !== 'personal') return null;
  return getProjectForDisplay(LOCAL_DRAFT_PROJECT_ID);
}

export function getSavedProjectsForWorkspace(workspace: Workspace) {
  return getProjectsForWorkspace(workspace).filter((project) => !project.isDraft);
}

export function getLatestSavedProjectForWorkspace(workspace: Workspace) {
  return getSavedProjectsForWorkspace(workspace)[0] ?? null;
}

export function renameProject(projectId: string, nextName: string) {
  const trimmedName = nextName.trim();
  if (!trimmedName) return false;

  if (projectId === LOCAL_DRAFT_PROJECT_ID) {
    const draft = readDraftRecord(undefined);
    if (!draft) return false;

    writeDraftRecord(undefined, {
      ...draft.state,
      projectName: trimmedName,
    });
    return true;
  }

  const record = readProjectRecord(projectId);
  if (!record) return false;

  const nowIso = new Date().toISOString();
  const nextRecord: StoredProjectRecord = {
    ...record,
    updatedAtIso: nowIso,
    state: {
      ...record.state,
      projectName: trimmedName,
    },
  };
  writeProjectRecord(nextRecord);

  const draft = readDraftRecord(projectId);
  if (draft) {
    writeDraftRecord(projectId, {
      ...draft.state,
      projectName: trimmedName,
    });
  }

  const nextIndex = readProjectIndex().map((entry) => (
    entry.id === projectId
      ? {
          ...entry,
          name: trimmedName,
          updatedAtIso: nowIso,
        }
      : entry
  ));
  writeProjectIndex(nextIndex);

  return true;
}

export function duplicateProject(projectId: string) {
  ensureProjectStorage();

  const sourceProject = getProjectForDisplay(projectId);
  if (!sourceProject) return null;

  const sourceState = projectId === LOCAL_DRAFT_PROJECT_ID
    ? readDraftRecord(undefined)?.state ?? createEditorStateFromProject(sourceProject)
    : readDraftRecord(projectId)?.state
      ?? loadProjectEditorState(projectId)
      ?? createEditorStateFromProject(sourceProject);

  const nextState = cloneEditorState(sourceState);
  nextState.projectName = `${normalizeProjectNameValue(sourceState.projectName)} 副本`;

  return saveProjectState(undefined, nextState);
}

export function deleteProject(projectId: string) {
  ensureProjectStorage();

  if (projectId === LOCAL_DRAFT_PROJECT_ID) {
    removeDraftRecord(undefined);
    return true;
  }

  const record = readProjectRecord(projectId);
  if (!record) return false;

  removeProjectRecord(projectId);
  removeDraftRecord(projectId);
  writeProjectIndex(readProjectIndex().filter((entry) => entry.id !== projectId));

  return true;
}

export function getDraftProjectId() {
  return LOCAL_DRAFT_PROJECT_ID;
}

export function getLocalProjectDataSummary(): LocalProjectDataSummary {
  if (typeof window === 'undefined') {
    return {
      projectCount: 0,
      draftCount: 0,
      totalBytes: 0,
    };
  }

  const projectCount = readProjectIndex().length;
  const managedKeys = getManagedProjectStorageKeys();
  const draftCount = managedKeys.filter((key) => key === NEW_PROJECT_DRAFT_KEY || key.startsWith(PROJECT_DRAFT_PREFIX)).length;
  const totalBytes = managedKeys.reduce((total, key) => {
    const value = window.localStorage.getItem(key) ?? '';
    return total + new Blob([key, value]).size;
  }, 0);

  return {
    projectCount,
    draftCount,
    totalBytes,
  };
}

export function clearAllLocalProjectData() {
  if (typeof window === 'undefined') {
    return {
      removedProjectCount: 0,
      removedDraftCount: 0,
      removedKeyCount: 0,
    };
  }

  const { projectCount, draftCount } = getLocalProjectDataSummary();
  const managedKeys = getManagedProjectStorageKeys();

  managedKeys.forEach((key) => {
    window.localStorage.removeItem(key);
  });

  writeProjectIndex([]);
  window.localStorage.setItem(PROJECT_STORAGE_READY_KEY, 'cleared');

  return {
    removedProjectCount: projectCount,
    removedDraftCount: draftCount,
    removedKeyCount: managedKeys.length,
  };
}
