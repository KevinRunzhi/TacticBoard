import { beforeEach, describe, expect, it } from 'vitest';
import { createBlankEditorState, saveDraftState } from '@/data/mockProjects';
import {
  buildNewEditorLocation,
  markNewEditorSessionActive,
  NEW_EDITOR_SESSION_PARAM,
  resolveEditorEntryMode,
} from '@/lib/editor-entry';

describe('editor entry recovery semantics', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('creates a fresh new-editor location with a stable recovery token', () => {
    const location = buildNewEditorLocation({ presetId: 'f-433' });
    const params = new URL(location, 'http://localhost').searchParams;

    expect(params.get('mode')).toBe('new');
    expect(params.get('presetId')).toBe('f-433');
    expect(params.get(NEW_EDITOR_SESSION_PARAM)).toBeTruthy();
  });

  it('keeps the first open of a fresh session on blank-new semantics even if another draft exists', () => {
    saveDraftState(undefined, createBlankEditorState({
      projectName: 'Existing Draft',
      space: 'personal',
    }));

    const location = buildNewEditorLocation();
    const sessionToken = new URL(location, 'http://localhost').searchParams.get(NEW_EDITOR_SESSION_PARAM);

    expect(resolveEditorEntryMode({
      rawMode: 'new',
      sessionToken,
    })).toBe('new');
  });

  it('re-enters the same new-editor session as resume after the session has been marked active', () => {
    const location = buildNewEditorLocation({ presetId: 'f-433' });
    const sessionToken = new URL(location, 'http://localhost').searchParams.get(NEW_EDITOR_SESSION_PARAM);

    expect(sessionToken).toBeTruthy();
    markNewEditorSessionActive(sessionToken!);

    expect(resolveEditorEntryMode({
      rawMode: 'new',
      presetId: 'f-433',
      sessionToken,
    })).toBe('resume');
  });
});
