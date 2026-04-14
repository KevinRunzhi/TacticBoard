import type {
  ExportFormat,
  ExportRatio,
  FieldFormat,
  FieldStyle,
  PlayerStyle,
} from '@/types/tactics';

export interface EditorPreferences {
  defaultFieldFormat: FieldFormat;
  defaultFieldStyle: FieldStyle;
  defaultPlayerStyle: PlayerStyle;
  defaultExportFormat: ExportFormat;
  defaultExportRatio: ExportRatio;
}

export const EDITOR_PREFERENCES_STORAGE_KEY = 'tactics-canvas:preferences:v1';

export const DEFAULT_EDITOR_PREFERENCES: EditorPreferences = {
  defaultFieldFormat: '11v11',
  defaultFieldStyle: 'realistic',
  defaultPlayerStyle: 'dot',
  defaultExportFormat: 'png',
  defaultExportRatio: '2x',
};

function normalizeFieldFormat(value: unknown): FieldFormat {
  return value === '8v8' || value === '7v7' || value === '5v5' ? value : '11v11';
}

function normalizeFieldStyle(value: unknown): FieldStyle {
  return value === 'flat' ? 'flat' : 'realistic';
}

function normalizePlayerStyle(value: unknown): PlayerStyle {
  return value === 'card' ? 'card' : 'dot';
}

function normalizeExportFormat(value: unknown): ExportFormat {
  return value === 'gif' ? 'gif' : 'png';
}

function normalizeExportRatio(value: unknown): ExportRatio {
  return value === '1x' ? '1x' : '2x';
}

function normalizePreferences(input: Partial<EditorPreferences> | null | undefined): EditorPreferences {
  return {
    defaultFieldFormat: normalizeFieldFormat(input?.defaultFieldFormat),
    defaultFieldStyle: normalizeFieldStyle(input?.defaultFieldStyle),
    defaultPlayerStyle: normalizePlayerStyle(input?.defaultPlayerStyle),
    defaultExportFormat: normalizeExportFormat(input?.defaultExportFormat),
    defaultExportRatio: normalizeExportRatio(input?.defaultExportRatio),
  };
}

export function getEditorPreferences(): EditorPreferences {
  if (typeof window === 'undefined') {
    return { ...DEFAULT_EDITOR_PREFERENCES };
  }

  const raw = window.localStorage.getItem(EDITOR_PREFERENCES_STORAGE_KEY);
  if (!raw) {
    return { ...DEFAULT_EDITOR_PREFERENCES };
  }

  try {
    return normalizePreferences(JSON.parse(raw) as Partial<EditorPreferences>);
  } catch {
    return { ...DEFAULT_EDITOR_PREFERENCES };
  }
}

export function saveEditorPreferences(preferences: Partial<EditorPreferences>): EditorPreferences {
  const normalized = normalizePreferences(preferences);

  if (typeof window !== 'undefined') {
    window.localStorage.setItem(EDITOR_PREFERENCES_STORAGE_KEY, JSON.stringify(normalized));
  }

  return normalized;
}

export function updateEditorPreferences(update: Partial<EditorPreferences>): EditorPreferences {
  const current = getEditorPreferences();
  return saveEditorPreferences({
    ...current,
    ...update,
  });
}

export function clearEditorPreferences() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(EDITOR_PREFERENCES_STORAGE_KEY);
}
