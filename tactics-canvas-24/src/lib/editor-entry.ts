import type { EditorEntryMode } from '@/hooks/useEditorState';

const NEW_EDITOR_SESSION_PARAM = 'session';
const NEW_EDITOR_SESSION_MARKER_PREFIX = 'tactics-canvas:editor:new-session:v1:';

function getNewEditorSessionStorageKey(sessionToken: string) {
  return `${NEW_EDITOR_SESSION_MARKER_PREFIX}${sessionToken}`;
}

export function createNewEditorSessionToken() {
  return `session-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function buildNewEditorLocation(options?: { presetId?: string | null }) {
  const params = new URLSearchParams();
  params.set('mode', 'new');
  params.set(NEW_EDITOR_SESSION_PARAM, createNewEditorSessionToken());

  if (options?.presetId) {
    params.set('presetId', options.presetId);
  }

  return `/editor?${params.toString()}`;
}

export function markNewEditorSessionActive(sessionToken: string) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(getNewEditorSessionStorageKey(sessionToken), 'active');
}

export function hasNewEditorSessionMarker(sessionToken: string) {
  if (typeof window === 'undefined') return false;
  return window.localStorage.getItem(getNewEditorSessionStorageKey(sessionToken)) === 'active';
}

export function resolveEditorEntryMode(options: {
  projectId?: string;
  rawMode?: string | null;
  presetId?: string | null;
  sessionToken?: string | null;
}): EditorEntryMode {
  const { projectId, rawMode, presetId, sessionToken } = options;

  if (projectId) {
    return 'project';
  }

  if (rawMode === 'new' && sessionToken && hasNewEditorSessionMarker(sessionToken)) {
    return 'resume';
  }

  if (rawMode === 'resume' && !presetId) {
    return 'resume';
  }

  return 'new';
}

export { NEW_EDITOR_SESSION_PARAM };
