import type { EditorState } from '@/types/tactics';

export function createEditorPersistenceFingerprint(state: EditorState) {
  return JSON.stringify({
    projectName: state.projectName,
    fieldFormat: state.fieldFormat,
    fieldView: state.fieldView,
    fieldStyle: state.fieldStyle,
    playerStyle: state.playerStyle,
    matchMeta: state.matchMeta,
    referenceImage: state.referenceImage,
    orientation: state.orientation,
    activeFormationId: state.activeFormationId,
    formationMode: state.formationMode,
    playerPlacementTeam: state.playerPlacementTeam,
    currentStepIndex: state.currentStepIndex,
    space: state.space,
    steps: state.steps,
  });
}
