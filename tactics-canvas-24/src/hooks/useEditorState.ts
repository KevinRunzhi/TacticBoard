import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import {
  AreaObject,
  EditorState,
  EditorTool,
  FieldFormat,
  FieldView,
  FieldStyle,
  LineType,
  MatchMeta,
  PlayerStyle,
  Player,
  Team,
  ReferenceImage,
  TacticsLine,
  TextNote,
} from '@/types/tactics';
import { buildPlayersForFormation, getFormationById, getFormationsByFormat } from '@/data/mockData';
import {
  cloneEditorState,
  createBlankEditorState,
  loadProjectEditorState,
  loadSavedEditorState,
  saveDraftState,
  saveProjectState,
} from '@/data/mockProjects';
import { cloneStepFrame } from '@/lib/step-frame';
import type { Workspace } from '@/types/workspace';

const PLAYBACK_INTERVAL_MS = 1200;
const HISTORY_LIMIT = 50;

function createAreaId() {
  return `area-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

function createPlayerId() {
  return `player-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

function createLineId() {
  return `line-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

function createTextId() {
  return `text-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

function getLineTypeFromTool(tool: EditorTool): LineType | null {
  if (!tool.startsWith('line-')) return null;
  return tool.slice(5) as LineType;
}

interface EditorSeed {
  presetId?: string | null;
}

export type EditorEntryMode = 'new' | 'resume' | 'project';
export type EditorEntrySource =
  | 'new-blank'
  | 'new-preset'
  | 'resume-draft'
  | 'project-saved'
  | 'project-draft';

interface InitialEditorSnapshot {
  state: EditorState;
  entrySource: EditorEntrySource;
}

function renumberStepFrames(steps: EditorState['steps']) {
  return steps.map((step, index) => ({
    ...step,
    label: `第 ${index + 1} 步`,
  }));
}

function buildInitialSnapshot(
  projectId: string | undefined,
  workspace: Workspace,
  mode: EditorEntryMode,
  seed?: EditorSeed,
) : InitialEditorSnapshot {
  if (projectId) {
    const savedState = loadSavedEditorState(projectId);
    if (savedState) {
      return {
        state: {
          ...savedState,
          space: savedState.space ?? workspace,
        },
        entrySource: 'project-draft',
      };
    }

    const projectState = loadProjectEditorState(projectId);

    return {
      state: projectState
        ? {
            ...projectState,
            space: projectState.space ?? workspace,
          }
        : createBlankEditorState({ space: workspace }),
      entrySource: 'project-saved',
    };
  }

  if (mode === 'resume') {
    const savedState = loadSavedEditorState(projectId);
    if (savedState) {
      return {
        state: {
          ...savedState,
          space: savedState.space ?? workspace,
        },
        entrySource: 'resume-draft',
      };
    }
  }

  if (seed?.presetId) {
    // Quick-start: presetId is a formation ID (e.g. 'f-433')
    const formats: FieldFormat[] = ['11v11', '8v8', '7v7', '5v5'];
    for (const fmt of formats) {
      const formation = getFormationById(fmt, seed.presetId);
      if (formation) {
        const blankState = createBlankEditorState({ space: workspace });
        const homePlayers = buildPlayersForFormation(formation, 'home');
        const step = blankState.steps[0];
        return {
          state: {
            ...blankState,
            fieldFormat: fmt,
            activeFormationId: formation.id,
            formationMode: 'preset',
            steps: [{
              ...step,
              players: homePlayers,
            }, ...blankState.steps.slice(1)],
          },
          entrySource: 'new-preset',
        };
      }
    }
  }

  return {
    state: createBlankEditorState({ space: workspace }),
    entrySource: 'new-blank',
  };
}

export function useEditorState(
  projectId: string | undefined,
  workspace: Workspace,
  mode: EditorEntryMode,
  seed?: EditorSeed,
) {
  const seedPresetId = seed?.presetId ?? null;
  const normalizedSeed = useMemo(
    () => ({
      presetId: seedPresetId,
    }),
    [seedPresetId],
  );
  const initialSnapshotRef = useRef<InitialEditorSnapshot | null>(null);
  if (!initialSnapshotRef.current) {
    initialSnapshotRef.current = buildInitialSnapshot(projectId, workspace, mode, seed);
  }
  const [state, setState] = useState<EditorState>(() => initialSnapshotRef.current?.state ?? createBlankEditorState({ space: workspace }));
  const [entrySource, setEntrySource] = useState<EditorEntrySource>(() => initialSnapshotRef.current?.entrySource ?? 'new-blank');
  const [undoStack, setUndoStack] = useState<EditorState[]>([]);
  const [redoStack, setRedoStack] = useState<EditorState[]>([]);
  const stateRef = useRef(state);
  const isDraggingPlayerRef = useRef(false);
  const hasInitializedAutosaveRef = useRef(false);
  const [dragAutosaveRevision, setDragAutosaveRevision] = useState(0);

  useEffect(() => {
    const nextSnapshot = buildInitialSnapshot(projectId, workspace, mode, normalizedSeed);
    setState(nextSnapshot.state);
    setEntrySource(nextSnapshot.entrySource);
    setUndoStack([]);
    setRedoStack([]);
    hasInitializedAutosaveRef.current = false;
  }, [mode, normalizedSeed, projectId, workspace]);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    if (!hasInitializedAutosaveRef.current) {
      hasInitializedAutosaveRef.current = true;
      return;
    }

    if (isDraggingPlayerRef.current) {
      return;
    }

    const timer = window.setTimeout(() => {
      saveDraftState(projectId, stateRef.current);
    }, 1500);

    return () => window.clearTimeout(timer);
  }, [
    dragAutosaveRevision,
    projectId,
    state.currentStepIndex,
    state.fieldFormat,
    state.fieldStyle,
    state.fieldView,
    state.matchMeta,
    state.orientation,
    state.playerPlacementTeam,
    state.playerStyle,
    state.projectName,
    state.referenceImage,
    state.space,
    state.steps,
  ]);

  const commitState = useCallback((updater: (currentState: EditorState) => EditorState) => {
    setState((currentState) => {
      const nextState = cloneEditorState(updater(currentState));

      setUndoStack((history) => [...history, cloneEditorState(currentState)].slice(-HISTORY_LIMIT));
      setRedoStack([]);

      return nextState;
    });
  }, []);

  const setTool = useCallback((tool: EditorTool) => {
    setState(s => ({ ...s, currentTool: tool }));
  }, []);

  const setPlayerPlacementTeam = useCallback((team: Team) => {
    setState((currentState) => (
      currentState.playerPlacementTeam === team
        ? currentState
        : { ...currentState, playerPlacementTeam: team }
    ));
  }, []);

  const selectPlayer = useCallback((id: string | null) => {
    setState(s => ({
      ...s,
      selectedPlayerId: id,
      selectedLineId: null,
      selectedTextId: null,
      selectedAreaId: null,
    }));
  }, []);

  const selectArea = useCallback((id: string | null) => {
    setState(s => ({
      ...s,
      selectedAreaId: id,
      selectedPlayerId: null,
      selectedLineId: null,
      selectedTextId: null,
    }));
  }, []);

  const selectLine = useCallback((id: string | null) => {
    setState(s => ({
      ...s,
      selectedLineId: id,
      selectedPlayerId: null,
      selectedTextId: null,
      selectedAreaId: null,
    }));
  }, []);

  const selectText = useCallback((id: string | null) => {
    setState(s => ({
      ...s,
      selectedTextId: id,
      selectedPlayerId: null,
      selectedLineId: null,
      selectedAreaId: null,
    }));
  }, []);

  const setStep = useCallback((index: number) => {
    setState(s => ({
      ...s,
      currentStepIndex: index,
      selectedPlayerId: null,
      selectedLineId: null,
      selectedTextId: null,
      selectedAreaId: null,
    }));
  }, []);

  const setProjectName = useCallback((projectName: string) => {
    commitState((currentState) => ({
      ...currentState,
      projectName,
    }));
  }, [commitState]);

  const setMatchMetaField = useCallback((field: keyof MatchMeta, value: string) => {
    commitState((currentState) => ({
      ...currentState,
      matchMeta: {
        ...currentState.matchMeta,
        [field]: value,
      },
    }));
  }, [commitState]);

  const setCurrentStepDescription = useCallback((description: string) => {
    commitState((currentState) => {
      const nextSteps = [...currentState.steps];
      nextSteps[currentState.currentStepIndex] = {
        ...nextSteps[currentState.currentStepIndex],
        description,
      };

      return {
        ...currentState,
        steps: nextSteps,
      };
    });
  }, [commitState]);

  const updateSelectedPlayer = useCallback((updater: (player: Player) => Player) => {
    commitState((currentState) => {
      if (!currentState.selectedPlayerId) return currentState;

      const nextSteps = [...currentState.steps];
      const nextStep = { ...nextSteps[currentState.currentStepIndex] };
      let didUpdate = false;

      nextStep.players = nextStep.players.map((player) => {
        if (player.id !== currentState.selectedPlayerId) return player;
        didUpdate = true;
        return updater(player);
      });

      if (!didUpdate) return currentState;

      nextSteps[currentState.currentStepIndex] = nextStep;
      return {
        ...currentState,
        steps: nextSteps,
      };
    });
  }, [commitState]);

  const addPlayerAt = useCallback((x: number, y: number) => {
    commitState((currentState) => {
      const nextSteps = [...currentState.steps];
      const nextStep = { ...nextSteps[currentState.currentStepIndex] };
      const team = currentState.playerPlacementTeam;
      const teamCount = nextStep.players.filter((player) => player.team === team).length;
      const nextPlayer: Player = {
        id: createPlayerId(),
        number: teamCount + 1,
        name: `${team === 'home' ? '主队' : '客队'}球员 ${teamCount + 1}`,
        position: 'SUB',
        team,
        x,
        y,
      };

      nextStep.players = [...nextStep.players, nextPlayer];
      nextSteps[currentState.currentStepIndex] = nextStep;

      return {
        ...currentState,
        selectedPlayerId: nextPlayer.id,
        selectedLineId: null,
        selectedTextId: null,
        selectedAreaId: null,
        playerPlacementTeam: team,
        steps: nextSteps,
      };
    });
  }, [commitState]);

  const removeSelectedPlayer = useCallback(() => {
    commitState((currentState) => {
      if (!currentState.selectedPlayerId) return currentState;

      const nextSteps = [...currentState.steps];
      const nextStep = { ...nextSteps[currentState.currentStepIndex] };
      const filteredPlayers = nextStep.players.filter((player) => player.id !== currentState.selectedPlayerId);
      if (filteredPlayers.length === nextStep.players.length) return currentState;

      nextStep.players = filteredPlayers;
      nextSteps[currentState.currentStepIndex] = nextStep;

      return {
        ...currentState,
        selectedPlayerId: null,
        steps: nextSteps,
      };
    });
  }, [commitState]);

  const addTextAt = useCallback((x: number, y: number) => {
    const nextText: TextNote = {
      id: createTextId(),
      text: '文本',
      x,
      y,
      style: 'body',
    };

    commitState((currentState) => {
      const nextSteps = [...currentState.steps];
      const nextStep = { ...nextSteps[currentState.currentStepIndex] };
      nextStep.texts = [...nextStep.texts, nextText];
      nextSteps[currentState.currentStepIndex] = nextStep;

      return {
        ...currentState,
        selectedTextId: nextText.id,
        selectedPlayerId: null,
        selectedLineId: null,
        selectedAreaId: null,
        steps: nextSteps,
      };
    });
  }, [commitState]);

  const updateSelectedText = useCallback((updater: (text: TextNote) => TextNote) => {
    commitState((currentState) => {
      if (!currentState.selectedTextId) return currentState;

      const nextSteps = [...currentState.steps];
      const nextStep = { ...nextSteps[currentState.currentStepIndex] };
      let didUpdate = false;

      nextStep.texts = nextStep.texts.map((text) => {
        if (text.id !== currentState.selectedTextId) return text;
        didUpdate = true;
        return updater(text);
      });

      if (!didUpdate) return currentState;

      nextSteps[currentState.currentStepIndex] = nextStep;
      return {
        ...currentState,
        steps: nextSteps,
      };
    });
  }, [commitState]);

  const removeSelectedText = useCallback(() => {
    commitState((currentState) => {
      if (!currentState.selectedTextId) return currentState;

      const nextSteps = [...currentState.steps];
      const nextStep = { ...nextSteps[currentState.currentStepIndex] };
      const filteredTexts = nextStep.texts.filter((text) => text.id !== currentState.selectedTextId);
      if (filteredTexts.length === nextStep.texts.length) return currentState;

      nextStep.texts = filteredTexts;
      nextSteps[currentState.currentStepIndex] = nextStep;

      return {
        ...currentState,
        selectedTextId: null,
        steps: nextSteps,
      };
    });
  }, [commitState]);

  const addLine = useCallback((lineType: LineType, fromX: number, fromY: number, toX: number, toY: number) => {
    const nextLine: TacticsLine = {
      id: createLineId(),
      type: lineType,
      fromX,
      fromY,
      toX,
      toY,
    };

    commitState((currentState) => {
      const nextSteps = [...currentState.steps];
      const nextStep = { ...nextSteps[currentState.currentStepIndex] };
      nextStep.lines = [...nextStep.lines, nextLine];
      nextSteps[currentState.currentStepIndex] = nextStep;

      return {
        ...currentState,
        selectedLineId: nextLine.id,
        selectedPlayerId: null,
        selectedTextId: null,
        selectedAreaId: null,
        steps: nextSteps,
      };
    });
  }, [commitState]);

  const addLineFromTool = useCallback((fromX: number, fromY: number, toX: number, toY: number) => {
    const lineType = getLineTypeFromTool(stateRef.current.currentTool);
    if (!lineType) return;
    addLine(lineType, fromX, fromY, toX, toY);
  }, [addLine]);

  const updateSelectedLine = useCallback((updater: (line: TacticsLine) => TacticsLine) => {
    commitState((currentState) => {
      if (!currentState.selectedLineId) return currentState;

      const nextSteps = [...currentState.steps];
      const nextStep = { ...nextSteps[currentState.currentStepIndex] };
      let didUpdate = false;

      nextStep.lines = nextStep.lines.map((line) => {
        if (line.id !== currentState.selectedLineId) return line;
        didUpdate = true;
        return updater(line);
      });

      if (!didUpdate) return currentState;

      nextSteps[currentState.currentStepIndex] = nextStep;
      return {
        ...currentState,
        steps: nextSteps,
      };
    });
  }, [commitState]);

  const removeSelectedLine = useCallback(() => {
    commitState((currentState) => {
      if (!currentState.selectedLineId) return currentState;

      const nextSteps = [...currentState.steps];
      const nextStep = { ...nextSteps[currentState.currentStepIndex] };
      const filteredLines = nextStep.lines.filter((line) => line.id !== currentState.selectedLineId);
      if (filteredLines.length === nextStep.lines.length) return currentState;

      nextStep.lines = filteredLines;
      nextSteps[currentState.currentStepIndex] = nextStep;

      return {
        ...currentState,
        selectedLineId: null,
        steps: nextSteps,
      };
    });
  }, [commitState]);

  const addAreaAt = useCallback((x: number, y: number) => {
    const nextArea: AreaObject = {
      id: createAreaId(),
      shape: 'rect',
      x,
      y,
      width: 18,
      height: 12,
      strokeColor: '#f8fafc',
      fillColor: '#38bdf8',
      opacity: 0.22,
    };

    commitState((currentState) => {
      const nextSteps = [...currentState.steps];
      const nextStep = { ...nextSteps[currentState.currentStepIndex] };
      nextStep.areas = [...(nextStep.areas ?? []), nextArea];
      nextSteps[currentState.currentStepIndex] = nextStep;

      return {
        ...currentState,
        selectedAreaId: nextArea.id,
        selectedPlayerId: null,
        selectedLineId: null,
        selectedTextId: null,
        steps: nextSteps,
      };
    });
  }, [commitState]);

  const updateSelectedArea = useCallback((updater: (area: AreaObject) => AreaObject) => {
    commitState((currentState) => {
      if (!currentState.selectedAreaId) return currentState;

      const nextSteps = [...currentState.steps];
      const nextStep = { ...nextSteps[currentState.currentStepIndex] };
      let didUpdate = false;

      nextStep.areas = (nextStep.areas ?? []).map((area) => {
        if (area.id !== currentState.selectedAreaId) return area;
        didUpdate = true;
        return updater(area);
      });

      if (!didUpdate) return currentState;

      nextSteps[currentState.currentStepIndex] = nextStep;
      return {
        ...currentState,
        steps: nextSteps,
      };
    });
  }, [commitState]);

  const removeSelectedArea = useCallback(() => {
    commitState((currentState) => {
      if (!currentState.selectedAreaId) return currentState;

      const nextSteps = [...currentState.steps];
      const nextStep = { ...nextSteps[currentState.currentStepIndex] };
      nextStep.areas = (nextStep.areas ?? []).filter((area) => area.id !== currentState.selectedAreaId);
      nextSteps[currentState.currentStepIndex] = nextStep;

      return {
        ...currentState,
        selectedAreaId: null,
        steps: nextSteps,
      };
    });
  }, [commitState]);

  const setReferenceImage = useCallback((referenceImage: ReferenceImage | null) => {
    commitState((currentState) => ({
      ...currentState,
      referenceImage: referenceImage ? { ...referenceImage } : null,
    }));
  }, [commitState]);

  const updateReferenceImage = useCallback((updater: (referenceImage: ReferenceImage) => ReferenceImage) => {
    commitState((currentState) => {
      if (!currentState.referenceImage) return currentState;

      return {
        ...currentState,
        referenceImage: updater(currentState.referenceImage),
      };
    });
  }, [commitState]);

  const setFieldFormat = useCallback((format: FieldFormat) => {
    commitState(s => ({
      ...s,
      fieldFormat: format,
      activeFormationId: null,
      formationMode: 'custom',
      selectedAreaId: null,
      selectedPlayerId: null,
      selectedLineId: null,
      selectedTextId: null,
    }));
  }, [commitState]);

  const regenerateFieldFormat = useCallback((format: FieldFormat) => {
    commitState((currentState) => {
      const defaultFormation = getFormationsByFormat(format)[0];
      if (!defaultFormation) {
        return {
          ...currentState,
          fieldFormat: format,
          activeFormationId: null,
          formationMode: 'custom',
        };
      }

      const rebuiltSteps = currentState.steps.map((step, index) => ({
        ...step,
        id: step.id || `step-${index + 1}`,
        label: step.label || `第 ${index + 1} 步`,
        players: buildPlayersForFormation(defaultFormation, 'home'),
        lines: [],
        texts: [],
        areas: [],
        ball: {
          ...step.ball,
          x: 50,
          y: 50,
        },
      }));

      return {
        ...currentState,
        fieldFormat: format,
        activeFormationId: defaultFormation.id,
        formationMode: 'preset',
        currentTool: 'select',
        selectedPlayerId: null,
        selectedLineId: null,
        selectedTextId: null,
        selectedAreaId: null,
        steps: rebuiltSteps,
      };
    });
  }, [commitState]);

  const setFieldView = useCallback((view: FieldView) => {
    commitState(s => ({ ...s, fieldView: view }));
  }, [commitState]);

  const setFieldStyle = useCallback((style: FieldStyle) => {
    commitState(s => ({ ...s, fieldStyle: style }));
  }, [commitState]);

  const setPlayerStyle = useCallback((style: PlayerStyle) => {
    commitState(s => ({ ...s, playerStyle: style }));
  }, [commitState]);

  const togglePlay = useCallback(() => {
    setState(s => ({ ...s, isPlaying: !s.isPlaying }));
  }, []);

  useEffect(() => {
    if (!state.isPlaying || state.steps.length <= 1) return;

    const timer = window.setInterval(() => {
      setState((currentState) => {
        if (!currentState.isPlaying) return currentState;

        const isLastStep = currentState.currentStepIndex >= currentState.steps.length - 1;
        if (isLastStep) {
          return { ...currentState, isPlaying: false };
        }

        return {
          ...currentState,
          currentStepIndex: currentState.currentStepIndex + 1,
          selectedPlayerId: null,
          selectedLineId: null,
          selectedTextId: null,
          selectedAreaId: null,
        };
      });
    }, PLAYBACK_INTERVAL_MS);

    return () => window.clearInterval(timer);
  }, [state.isPlaying, state.steps.length]);

  const addStep = useCallback(() => {
    commitState(s => {
      const currentStep = s.steps[s.currentStepIndex];
      const newStep = {
        ...cloneStepFrame(currentStep, s.steps.length),
        id: `step-${Date.now()}`,
        label: `第 ${s.steps.length + 1} 步`,
        description: '',
      };
      const newSteps = renumberStepFrames([...s.steps, newStep]);
      return {
        ...s,
        steps: newSteps,
        currentStepIndex: newSteps.length - 1,
        isPlaying: false,
        selectedPlayerId: null,
        selectedLineId: null,
        selectedTextId: null,
        selectedAreaId: null,
      };
    });
  }, [commitState]);

  const duplicateCurrentStep = useCallback(() => {
    commitState((currentState) => {
      const sourceStep = currentState.steps[currentState.currentStepIndex];
      if (!sourceStep) return currentState;

      const duplicatedStep = {
        ...cloneStepFrame(sourceStep, currentState.currentStepIndex + 1),
        id: `step-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      };

      const nextSteps = [...currentState.steps];
      nextSteps.splice(currentState.currentStepIndex + 1, 0, duplicatedStep);
      const reorderedSteps = renumberStepFrames(nextSteps);

      return {
        ...currentState,
        steps: reorderedSteps,
        currentStepIndex: currentState.currentStepIndex + 1,
        isPlaying: false,
        selectedPlayerId: null,
        selectedLineId: null,
        selectedTextId: null,
        selectedAreaId: null,
      };
    });
  }, [commitState]);

  const deleteCurrentStep = useCallback(() => {
    commitState((currentState) => {
      if (currentState.steps.length <= 1) return currentState;

      const nextSteps = currentState.steps.filter((_, index) => index !== currentState.currentStepIndex);
      const reorderedSteps = renumberStepFrames(nextSteps);
      const nextIndex = Math.min(currentState.currentStepIndex, reorderedSteps.length - 1);

      return {
        ...currentState,
        steps: reorderedSteps,
        currentStepIndex: nextIndex,
        isPlaying: false,
        selectedPlayerId: null,
        selectedLineId: null,
        selectedTextId: null,
        selectedAreaId: null,
      };
    });
  }, [commitState]);

  const moveCurrentStep = useCallback((direction: 'left' | 'right') => {
    commitState((currentState) => {
      const currentIndex = currentState.currentStepIndex;
      const targetIndex = direction === 'left' ? currentIndex - 1 : currentIndex + 1;

      if (targetIndex < 0 || targetIndex >= currentState.steps.length) {
        return currentState;
      }

      const nextSteps = [...currentState.steps];
      const [movedStep] = nextSteps.splice(currentIndex, 1);
      nextSteps.splice(targetIndex, 0, movedStep);
      const reorderedSteps = renumberStepFrames(nextSteps);

      return {
        ...currentState,
        steps: reorderedSteps,
        currentStepIndex: targetIndex,
        isPlaying: false,
        selectedPlayerId: null,
        selectedLineId: null,
        selectedTextId: null,
        selectedAreaId: null,
      };
    });
  }, [commitState]);

  const movePlayer = useCallback((playerId: string, x: number, y: number) => {
    setState(s => {
      const newSteps = [...s.steps];
      const step = { ...newSteps[s.currentStepIndex] };
      step.players = step.players.map(p =>
        p.id === playerId ? { ...p, x, y } : p
      );
      newSteps[s.currentStepIndex] = step;
      return { ...s, steps: newSteps };
    });
  }, []);

  const moveArea = useCallback((areaId: string, x: number, y: number) => {
    setState(s => {
      const newSteps = [...s.steps];
      const step = { ...newSteps[s.currentStepIndex] };
      step.areas = (step.areas ?? []).map((area) => (
        area.id === areaId ? { ...area, x, y } : area
      ));
      newSteps[s.currentStepIndex] = step;
      return { ...s, steps: newSteps };
    });
  }, []);

  const moveText = useCallback((textId: string, x: number, y: number) => {
    setState(s => {
      const newSteps = [...s.steps];
      const step = { ...newSteps[s.currentStepIndex] };
      step.texts = step.texts.map((text) => (
        text.id === textId ? { ...text, x, y } : text
      ));
      newSteps[s.currentStepIndex] = step;
      return { ...s, steps: newSteps };
    });
  }, []);

  const moveBall = useCallback((x: number, y: number) => {
    setState(s => {
      const newSteps = [...s.steps];
      const step = { ...newSteps[s.currentStepIndex] };
      step.ball = { ...step.ball, x, y };
      newSteps[s.currentStepIndex] = step;
      return { ...s, steps: newSteps };
    });
  }, []);

  const beginPlayerMove = useCallback(() => {
    if (isDraggingPlayerRef.current) return;

    isDraggingPlayerRef.current = true;
    setUndoStack((history) => [...history, cloneEditorState(stateRef.current)].slice(-HISTORY_LIMIT));
    setRedoStack([]);
  }, []);

  const endPlayerMove = useCallback(() => {
    if (!isDraggingPlayerRef.current) return;
    isDraggingPlayerRef.current = false;
    setDragAutosaveRevision((currentRevision) => currentRevision + 1);
  }, []);

  const undo = useCallback(() => {
    setUndoStack((history) => {
      if (history.length === 0) return history;

      const previousState = history[history.length - 1];
      setRedoStack((future) => [...future, cloneEditorState(stateRef.current)].slice(-HISTORY_LIMIT));
      setState(cloneEditorState(previousState));

      return history.slice(0, -1);
    });
  }, []);

  const redo = useCallback(() => {
    setRedoStack((future) => {
      if (future.length === 0) return future;

      const nextState = future[future.length - 1];
      setUndoStack((history) => [...history, cloneEditorState(stateRef.current)].slice(-HISTORY_LIMIT));
      setState(cloneEditorState(nextState));

      return future.slice(0, -1);
    });
  }, []);

  const saveDraft = useCallback(() => {
    saveDraftState(projectId, stateRef.current);
  }, [projectId]);

  const saveProject = useCallback(() => {
    return saveProjectState(projectId, {
      ...stateRef.current,
      space: workspace,
    });
  }, [projectId, workspace]);

  const applyFormation = useCallback((formationId: string) => {
    commitState((currentState) => {
      const formation = getFormationById(currentState.fieldFormat, formationId);
      if (!formation) return currentState;

      const newSteps = [...currentState.steps];
      const currentStep = { ...newSteps[currentState.currentStepIndex] };
      currentStep.players = buildPlayersForFormation(formation, 'home');
      currentStep.lines = [];
      currentStep.texts = [];
      currentStep.areas = [];
      currentStep.ball = { ...currentStep.ball, x: 50, y: 50 };
      newSteps[currentState.currentStepIndex] = currentStep;

      return {
        ...currentState,
        activeFormationId: formation.id,
        formationMode: 'preset',
        selectedPlayerId: null,
        selectedLineId: null,
        selectedTextId: null,
        selectedAreaId: null,
        currentTool: 'select',
        steps: newSteps,
      };
    });
  }, [commitState]);

  const currentStep = state.steps[state.currentStepIndex];

  return {
    state,
    entrySource,
    currentStep,
    canUndo: undoStack.length > 0,
    canRedo: redoStack.length > 0,
    setTool,
    setPlayerPlacementTeam,
    selectPlayer,
    selectLine,
    selectText,
    setStep,
    setProjectName,
    setMatchMetaField,
    setCurrentStepDescription,
    updateSelectedPlayer,
    addPlayerAt,
    removeSelectedPlayer,
    selectArea,
    addTextAt,
    updateSelectedText,
    removeSelectedText,
    addLineFromTool,
    updateSelectedLine,
    removeSelectedLine,
    addAreaAt,
    updateSelectedArea,
    removeSelectedArea,
    setReferenceImage,
    updateReferenceImage,
    setFieldFormat,
    setFieldView,
    setFieldStyle,
    setPlayerStyle,
    togglePlay,
    addStep,
    duplicateCurrentStep,
    deleteCurrentStep,
    moveCurrentStep,
    regenerateFieldFormat,
    movePlayer,
    moveBall,
    moveArea,
    moveText,
    beginPlayerMove,
    endPlayerMove,
    undo,
    redo,
    saveDraft,
    saveProject,
    applyFormation,
  };
}
