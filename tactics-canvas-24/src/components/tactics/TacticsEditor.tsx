import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useEditorState, type EditorEntryMode } from '@/hooks/useEditorState';
import { useWorkspace } from '@/hooks/useWorkspace';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { hasMeaningfulProjectContent } from '@/data/mockProjects';
import type { ExportConfig, FieldFormat, ReferenceImage } from '@/types/tactics';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { normalizeProjectNameValue } from '@/lib/project-name';
import { createDefaultExportConfig } from '@/lib/export-config';
import { saveExportBinary } from '@/lib/export-save';
import { getGifConstraintMessage } from '@/lib/tactics-export';
import { toast } from '@/components/ui/sonner';
import { TopToolbar, type ToolbarSaveStatusTone } from './TopToolbar';
import { LeftPanel } from './LeftPanel';
import { PitchCanvas, type PitchCanvasHandle } from './PitchCanvas';
import { RightPanel } from './RightPanel';
import { BottomStepBar } from './BottomStepBar';
import { MobileToolbar } from './MobileToolbar';
import { MobileStepsDrawer } from './MobileStepsDrawer';
import { MobilePropertiesDrawer } from './MobilePropertiesDrawer';
import { MobileFormationsDrawer } from './MobileFormationsDrawer';
import { TabletLeftDrawer } from './TabletLeftDrawer';
import { TabletRightDrawer } from './TabletRightDrawer';
import { TabletToolStrip } from './TabletToolStrip';
import { MobileTopBar } from './MobileTopBar';
import { ExportConfigDialog } from './ExportConfigDialog';

interface TacticsEditorProps {
  projectId?: string;
  presetId?: string;
  mode?: EditorEntryMode;
}

type EditorSaveStatus = 'unsaved' | 'saving' | 'saved';
type EditorSaveKind = 'first' | 'update' | null;

interface EditorWorkbenchReturnState {
  editorReturn: {
    projectId: string;
    projectName: string;
    firstSave: boolean;
    savedOnReturn: boolean;
  };
}

interface EditorRouteState {
  editorSaveKind?: Exclude<EditorSaveKind, null>;
}

const formatLabels: Record<FieldFormat, string> = {
  '11v11': '11人制',
  '8v8': '8人制',
  '7v7': '7人制',
  '5v5': '5人制',
};

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== 'string') {
        reject(new Error('Imported image did not produce a data URL.'));
        return;
      }

      resolve(reader.result);
    };
    reader.onerror = () => {
      reject(new Error('Failed to read imported image.'));
    };
    reader.readAsDataURL(file);
  });
}

export function TacticsEditor({ projectId, presetId, mode = 'new' }: TacticsEditorProps) {
  const { workspace } = useWorkspace();
  const location = useLocation();
  const navigate = useNavigate();
  const {
    state,
    entrySource,
    currentStep,
    canUndo,
    canRedo,
    setTool,
    setPlayerPlacementTeam,
    selectPlayer,
    selectLine,
    selectText,
    selectArea,
    setStep,
    setProjectName,
    setMatchMetaField,
    setCurrentStepDescription,
    updateSelectedPlayer,
    addPlayerAt,
    removeSelectedPlayer,
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
    saveProject,
    applyFormation,
  } = useEditorState(projectId, workspace, mode, { presetId });

  const isTablet = useMediaQuery('(min-width: 768px) and (max-width: 1023px)');
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const pitchCanvasRef = useRef<PitchCanvasHandle>(null);
  const lastSavedFingerprintRef = useRef<string | null>(null);
  const pendingSaveKindRef = useRef<EditorSaveKind>(null);

  const [zoomPercentage, setZoomPercentage] = useState(100);
  const [leftDrawerOpen, setLeftDrawerOpen] = useState(false);
  const [rightDrawerOpen, setRightDrawerOpen] = useState(false);
  const [stepsDrawerOpen, setStepsDrawerOpen] = useState(false);
  const [propsDrawerOpen, setPropsDrawerOpen] = useState(false);
  const [formationsDrawerOpen, setFormationsDrawerOpen] = useState(false);
  const [pendingFieldFormat, setPendingFieldFormat] = useState<FieldFormat | null>(null);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [exportConfig, setExportConfig] = useState<ExportConfig>(() => createDefaultExportConfig());
  const [activeProjectId, setActiveProjectId] = useState<string | null>(projectId ?? null);
  const [saveStatus, setSaveStatus] = useState<EditorSaveStatus>('unsaved');
  const [lastSaveKind, setLastSaveKind] = useState<EditorSaveKind>(null);

  const selectedPlayer = state.selectedPlayerId
    ? currentStep.players.find((player) => player.id === state.selectedPlayerId) || null
    : null;
  const selectedLine = state.selectedLineId
    ? currentStep.lines.find((line) => line.id === state.selectedLineId) || null
    : null;
  const selectedText = state.selectedTextId
    ? currentStep.texts.find((text) => text.id === state.selectedTextId) || null
    : null;
  const selectedArea = state.selectedAreaId
    ? (currentStep.areas ?? []).find((area) => area.id === state.selectedAreaId) || null
    : null;
  const canIncludeReferenceImage = Boolean(state.referenceImage?.localUri);
  const canExportGif = isDesktop;
  const hasMeaningfulContent = useMemo(() => hasMeaningfulProjectContent(state), [state]);
  const hasFormalProject = Boolean(projectId || activeProjectId);
  const displayProjectName = normalizeProjectNameValue(state.projectName);
  const changeFingerprint = useMemo(
    () => JSON.stringify({
      projectName: state.projectName,
      fieldFormat: state.fieldFormat,
      fieldView: state.fieldView,
      fieldStyle: state.fieldStyle,
      playerStyle: state.playerStyle,
      matchMeta: state.matchMeta,
      referenceImage: state.referenceImage,
      currentStepIndex: state.currentStepIndex,
      steps: state.steps,
    }),
    [
      state.currentStepIndex,
      state.fieldFormat,
      state.fieldStyle,
      state.fieldView,
      state.matchMeta,
      state.playerStyle,
      state.projectName,
      state.referenceImage,
      state.steps,
    ],
  );

  useEffect(() => {
    if (!canIncludeReferenceImage && exportConfig.includeReferenceImage) {
      setExportConfig((currentConfig) => ({
        ...currentConfig,
        includeReferenceImage: false,
      }));
    }
  }, [canIncludeReferenceImage, exportConfig.includeReferenceImage]);

  useEffect(() => {
    if (!canExportGif && exportConfig.format === 'gif') {
      setExportConfig((currentConfig) => ({
        ...currentConfig,
        format: 'png',
      }));
    }
  }, [canExportGif, exportConfig.format]);

  useEffect(() => {
    const routeState = location.state as EditorRouteState | null;
    const routeSaveKind = routeState?.editorSaveKind ?? null;
    setActiveProjectId(projectId ?? null);
    if (entrySource === 'project-saved') {
      lastSavedFingerprintRef.current = changeFingerprint;
      setSaveStatus('saved');
      setLastSaveKind(routeSaveKind ?? pendingSaveKindRef.current ?? 'update');
    } else {
      lastSavedFingerprintRef.current = null;
      setSaveStatus('unsaved');
      setLastSaveKind(null);
    }
    pendingSaveKindRef.current = null;
  }, [changeFingerprint, entrySource, location.state, projectId]);

  useEffect(() => {
    const lastSavedFingerprint = lastSavedFingerprintRef.current;
    if (!lastSavedFingerprint) {
      return;
    }

    if (changeFingerprint === lastSavedFingerprint) {
      setSaveStatus((currentStatus) => (currentStatus === 'saving' ? currentStatus : 'saved'));
      return;
    }

    setSaveStatus((currentStatus) => (currentStatus === 'saving' ? currentStatus : 'unsaved'));
  }, [changeFingerprint]);

  const requestFieldFormatChange = useCallback((nextFormat: FieldFormat) => {
    if (nextFormat === state.fieldFormat) return;
    setPendingFieldFormat(nextFormat);
  }, [state.fieldFormat]);

  const closeFieldFormatDialog = useCallback(() => {
    setPendingFieldFormat(null);
  }, []);

  const confirmKeepObjectsAndSwitchFormat = useCallback(() => {
    if (!pendingFieldFormat) return;

    setFieldFormat(pendingFieldFormat);
    toast.success('已切换球场制式', {
      description: '当前对象内容已保留，阵型将标记为自定义。',
    });
    setPendingFieldFormat(null);
  }, [pendingFieldFormat, setFieldFormat]);

  const confirmRegenerateForFormat = useCallback(() => {
    if (!pendingFieldFormat) return;

    regenerateFieldFormat(pendingFieldFormat);
    toast.success('已按新制式重建阵型', {
      description: `${formatLabels[pendingFieldFormat]} 默认阵型已重新生成。`,
    });
    setPendingFieldFormat(null);
  }, [pendingFieldFormat, regenerateFieldFormat]);

  const saveStatusLabel = useMemo(() => {
    if (saveStatus === 'saving') {
      return '正在保存';
    }

    if (saveStatus === 'saved') {
      return lastSaveKind === 'first' ? '首次已保存' : '本地已保存';
    }

    return hasFormalProject ? '有未保存修改' : '未保存';
  }, [hasFormalProject, lastSaveKind, saveStatus]);

  const saveStatusTone = useMemo<ToolbarSaveStatusTone>(() => {
    if (saveStatus === 'saving') return 'info';
    if (saveStatus === 'saved' && lastSaveKind === 'first') return 'info';
    if (saveStatus === 'saved') return 'success';
    return hasFormalProject ? 'warning' : 'muted';
  }, [hasFormalProject, lastSaveKind, saveStatus]);

  const persistProject = useCallback((options?: {
    navigateAfterSave?: boolean;
    returnToWorkspace?: boolean;
  }) => {
    setSaveStatus('saving');

    const savedProjectId = saveProject();
    const firstSave = !projectId && !activeProjectId;
    const nextSaveKind: EditorSaveKind = firstSave ? 'first' : 'update';

    pendingSaveKindRef.current = nextSaveKind;
    lastSavedFingerprintRef.current = changeFingerprint;
    setActiveProjectId(savedProjectId);
    setSaveStatus('saved');
    setLastSaveKind(nextSaveKind);

    if (options?.returnToWorkspace) {
      navigate('/', {
        state: {
          editorReturn: {
            projectId: savedProjectId,
            projectName: displayProjectName,
            firstSave,
            savedOnReturn: true,
          },
        } satisfies EditorWorkbenchReturnState,
      });
      return savedProjectId;
    }

    if (options?.navigateAfterSave !== false && !projectId && savedProjectId) {
      navigate(`/editor/${savedProjectId}`, {
        replace: true,
        state: {
          editorSaveKind: nextSaveKind,
        } satisfies EditorRouteState,
      });
    }

    toast.success(firstSave ? '首次保存成功' : '项目已保存到本地', {
      description: firstSave ? '已创建本地项目，可返回工作台继续编辑。' : displayProjectName,
    });

    return savedProjectId;
  }, [activeProjectId, changeFingerprint, displayProjectName, navigate, projectId, saveProject]);

  const handleSave = useCallback(() => {
    persistProject();
  }, [persistProject]);

  const handleReturnToWorkspace = useCallback(() => {
    if (saveStatus === 'saving') {
      return;
    }

    const nextProjectId = activeProjectId ?? projectId ?? null;
    if (saveStatus === 'unsaved') {
      if (!nextProjectId && !hasMeaningfulContent) {
        navigate('/');
        return;
      }

      persistProject({
        navigateAfterSave: false,
        returnToWorkspace: true,
      });
      return;
    }

    if (nextProjectId) {
      navigate('/', {
        state: {
          editorReturn: {
            projectId: nextProjectId,
            projectName: displayProjectName,
            firstSave: lastSaveKind === 'first',
            savedOnReturn: false,
          },
        } satisfies EditorWorkbenchReturnState,
      });
      return;
    }

    navigate('/');
  }, [activeProjectId, displayProjectName, hasMeaningfulContent, lastSaveKind, navigate, persistProject, projectId, saveStatus]);

  const openExportDialog = useCallback(() => {
    setExportDialogOpen(true);
  }, []);

  const handleExportConfirm = useCallback(async () => {
    if (!pitchCanvasRef.current) {
      toast.error('当前画布尚未准备好，暂时无法导出');
      return;
    }

    if (exportConfig.format === 'gif') {
      const constraintMessage = getGifConstraintMessage(state.steps.length, exportConfig.gifSpeed);
      if (constraintMessage) {
        toast.error('GIF 导出参数需要调整', {
          description: constraintMessage,
        });
        return;
      }
    }

    try {
      const bytes =
        exportConfig.format === 'gif'
          ? await pitchCanvasRef.current.exportGif(displayProjectName, exportConfig)
          : await pitchCanvasRef.current.exportPng(displayProjectName, exportConfig);
      const saveResult = await saveExportBinary({
        fileName: displayProjectName,
        format: exportConfig.format,
        bytes,
      });
      if (saveResult.status === 'cancelled') {
        toast.message('已取消导出保存');
        return;
      }
      if (saveResult.status === 'failed') {
        toast.error('导出失败，请稍后重试', {
          description: saveResult.reason,
        });
        return;
      }
      setExportDialogOpen(false);
      if (saveResult.status === 'shared') {
        toast.success('已进入系统分享', {
          description: `${displayProjectName}.${exportConfig.format}`,
        });
      } else {
        toast.success('已导出当前战术板', {
          description: `${displayProjectName}.${exportConfig.format}`,
        });
      }
    } catch (error) {
      toast.error('导出失败，请稍后重试');
    }
  }, [displayProjectName, exportConfig, state.steps.length]);

  const handleReferenceImageImport = useCallback(async (file: File) => {
    try {
      const result = await readFileAsDataUrl(file);
      const nextImage: ReferenceImage = {
        id: `reference-${Date.now()}`,
        name: file.name,
        localUri: result,
        opacity: 0.45,
        scale: 1,
        offsetX: 0,
        offsetY: 0,
        locked: true,
        visible: true,
      };

      setReferenceImage(nextImage);
      toast.success('已导入参考底图', {
        description: file.name,
      });
    } catch {
      toast.error('参考底图导入失败，请重新选择图片');
    }
  }, [setReferenceImage]);

  const handlePlayerAvatarImport = useCallback(async (file: File) => {
    try {
      const result = await readFileAsDataUrl(file);
      updateSelectedPlayer((player) => ({
        ...player,
        avatarLocalUri: result,
      }));
      toast.success('已导入球员头像', {
        description: file.name,
      });
    } catch {
      toast.error('球员头像导入失败，请重新选择图片');
    }
  }, [updateSelectedPlayer]);

  const handlePlayerAvatarRemove = useCallback(() => {
    updateSelectedPlayer((player) => ({
      ...player,
      avatarLocalUri: undefined,
    }));
    toast.success('已移除球员头像');
  }, [updateSelectedPlayer]);

  const rightPanelProps = {
    projectName: displayProjectName,
    selectedPlayer,
    selectedLine,
    selectedText,
    selectedArea,
    playerStyle: state.playerStyle,
    playerPlacementTeam: state.playerPlacementTeam,
    matchMeta: state.matchMeta,
    referenceImage: state.referenceImage,
    stepDescription: currentStep.description || '',
    onProjectNameChange: setProjectName,
    onMatchMetaChange: setMatchMetaField,
    onStepDescriptionChange: setCurrentStepDescription,
    onPlayerNameChange: (name: string) => updateSelectedPlayer((player) => ({ ...player, name })),
    onPlayerNumberChange: (number: number) => updateSelectedPlayer((player) => ({ ...player, number })),
    onPlayerPositionChange: (position: string) => updateSelectedPlayer((player) => ({ ...player, position })),
    onPlayerTeamChange: (team: 'home' | 'away') => {
      setPlayerPlacementTeam(team);
      updateSelectedPlayer((player) => ({ ...player, team }));
    },
    onPlayerAvatarImport: handlePlayerAvatarImport,
    onPlayerAvatarRemove: handlePlayerAvatarRemove,
    onDeletePlayer: removeSelectedPlayer,
    onTextContentChange: (text: string) => updateSelectedText((textNote) => ({ ...textNote, text })),
    onTextStyleChange: (style: 'title' | 'body' | 'emphasis') => updateSelectedText((textNote) => ({ ...textNote, style })),
    onTextXChange: (x: number) => updateSelectedText((textNote) => ({ ...textNote, x })),
    onTextYChange: (y: number) => updateSelectedText((textNote) => ({ ...textNote, y })),
    onDeleteText: removeSelectedText,
    onLineTypeChange: (type: 'run' | 'pass' | 'dribble' | 'shoot' | 'press') => updateSelectedLine((line) => ({ ...line, type })),
    onLineFromXChange: (fromX: number) => updateSelectedLine((line) => ({ ...line, fromX })),
    onLineFromYChange: (fromY: number) => updateSelectedLine((line) => ({ ...line, fromY })),
    onLineToXChange: (toX: number) => updateSelectedLine((line) => ({ ...line, toX })),
    onLineToYChange: (toY: number) => updateSelectedLine((line) => ({ ...line, toY })),
    onDeleteLine: removeSelectedLine,
    onAreaShapeChange: (shape: 'rect' | 'circle' | 'ellipse') => updateSelectedArea((area) => ({ ...area, shape })),
    onAreaWidthChange: (width: number) => updateSelectedArea((area) => ({ ...area, width })),
    onAreaHeightChange: (height: number) => updateSelectedArea((area) => ({ ...area, height })),
    onAreaOpacityChange: (opacity: number) => updateSelectedArea((area) => ({ ...area, opacity })),
    onAreaStrokeColorChange: (strokeColor: string) => updateSelectedArea((area) => ({ ...area, strokeColor })),
    onAreaFillColorChange: (fillColor: string) => updateSelectedArea((area) => ({ ...area, fillColor })),
    onDeleteArea: removeSelectedArea,
    onReferenceImageImport: handleReferenceImageImport,
    onReferenceImageVisibilityChange: (visible: boolean) => updateReferenceImage((referenceImage) => ({ ...referenceImage, visible })),
    onReferenceImageOpacityChange: (opacity: number) => updateReferenceImage((referenceImage) => ({ ...referenceImage, opacity })),
    onReferenceImageScaleChange: (scale: number) => updateReferenceImage((referenceImage) => ({ ...referenceImage, scale })),
    onReferenceImageOffsetXChange: (offsetX: number) => updateReferenceImage((referenceImage) => ({ ...referenceImage, offsetX })),
    onReferenceImageOffsetYChange: (offsetY: number) => updateReferenceImage((referenceImage) => ({ ...referenceImage, offsetY })),
    onReferenceImageResetTransform: () => updateReferenceImage((referenceImage) => ({ ...referenceImage, scale: 1, offsetX: 0, offsetY: 0 })),
    onReferenceImageRemove: () => setReferenceImage(null),
  } as const;

  const canvasProps = {
    projectName: state.projectName,
    currentTool: state.currentTool,
    players: currentStep.players,
    lines: currentStep.lines,
    ball: currentStep.ball,
    texts: currentStep.texts,
    areas: currentStep.areas ?? [],
    allSteps: state.steps,
    currentStepIndex: state.currentStepIndex,
    matchMeta: state.matchMeta,
    referenceImage: state.referenceImage,
    fieldView: state.fieldView,
    fieldStyle: state.fieldStyle,
    playerStyle: state.playerStyle,
    selectedPlayerId: state.selectedPlayerId,
    selectedLineId: state.selectedLineId,
    selectedTextId: state.selectedTextId,
    selectedAreaId: state.selectedAreaId,
    onSelectPlayer: selectPlayer,
    onSelectLine: selectLine,
    onSelectText: selectText,
    onSelectArea: selectArea,
    onAddPlayer: addPlayerAt,
    onAddText: addTextAt,
    onAddLine: addLineFromTool,
    onAddArea: addAreaAt,
    onBeginPlayerMove: beginPlayerMove,
    onEndPlayerMove: endPlayerMove,
    onMovePlayer: movePlayer,
    onMoveBall: moveBall,
    onMoveArea: moveArea,
    onMoveText: moveText,
    onZoomChange: setZoomPercentage,
  } as const;

  if (isDesktop) {
    return (
      <>
        <div className="flex h-screen w-screen flex-col overflow-hidden">
          <TopToolbar
            projectId={projectId}
            projectName={displayProjectName}
            saveStatusLabel={saveStatusLabel}
            saveStatusTone={saveStatusTone}
            fieldFormat={state.fieldFormat}
            fieldView={state.fieldView}
            fieldStyle={state.fieldStyle}
            playerStyle={state.playerStyle}
            onFieldFormatChange={requestFieldFormatChange}
            onFieldViewChange={setFieldView}
            onFieldStyleChange={setFieldStyle}
            onPlayerStyleChange={setPlayerStyle}
            canUndo={canUndo}
            canRedo={canRedo}
            zoomPercentage={zoomPercentage}
            onUndo={undo}
            onRedo={redo}
            onZoomIn={() => pitchCanvasRef.current?.zoomIn()}
            onZoomOut={() => pitchCanvasRef.current?.zoomOut()}
            onFitToView={() => pitchCanvasRef.current?.fitToView()}
            onSave={handleSave}
            onExport={openExportDialog}
            onReturnToWorkspace={handleReturnToWorkspace}
          />
          <div className="flex flex-1 overflow-hidden">
            <LeftPanel
              currentTool={state.currentTool}
              fieldFormat={state.fieldFormat}
              playerPlacementTeam={state.playerPlacementTeam}
              onToolChange={setTool}
              onPlayerPlacementTeamChange={setPlayerPlacementTeam}
              onApplyFormation={applyFormation}
            />
            <PitchCanvas ref={pitchCanvasRef} {...canvasProps} />
            <RightPanel {...rightPanelProps} />
          </div>
          <BottomStepBar
            steps={state.steps}
            currentIndex={state.currentStepIndex}
            isPlaying={state.isPlaying}
            onStepChange={setStep}
            onTogglePlay={togglePlay}
            onAddStep={addStep}
            onDuplicateStep={duplicateCurrentStep}
            onDeleteStep={deleteCurrentStep}
            onMoveStepLeft={() => moveCurrentStep('left')}
            onMoveStepRight={() => moveCurrentStep('right')}
          />
        </div>
        <FieldFormatChangeDialog
          currentFormat={state.fieldFormat}
          pendingFormat={pendingFieldFormat}
          onClose={closeFieldFormatDialog}
          onKeepObjects={confirmKeepObjectsAndSwitchFormat}
          onRegenerate={confirmRegenerateForFormat}
        />
        <ExportConfigDialog
          open={exportDialogOpen}
          config={exportConfig}
          canIncludeReferenceImage={canIncludeReferenceImage}
          canExportGif={canExportGif}
          stepCount={state.steps.length}
          onOpenChange={setExportDialogOpen}
          onConfigChange={setExportConfig}
          onConfirm={handleExportConfirm}
        />
      </>
    );
  }

  if (isTablet) {
    return (
      <>
        <div className="flex h-screen w-screen flex-col overflow-hidden">
          <TopToolbar
            projectId={projectId}
            projectName={displayProjectName}
            saveStatusLabel={saveStatusLabel}
            saveStatusTone={saveStatusTone}
            fieldFormat={state.fieldFormat}
            fieldView={state.fieldView}
            fieldStyle={state.fieldStyle}
            playerStyle={state.playerStyle}
            onFieldFormatChange={requestFieldFormatChange}
            onFieldViewChange={setFieldView}
            onFieldStyleChange={setFieldStyle}
            onPlayerStyleChange={setPlayerStyle}
            canUndo={canUndo}
            canRedo={canRedo}
            zoomPercentage={zoomPercentage}
            onUndo={undo}
            onRedo={redo}
            onZoomIn={() => pitchCanvasRef.current?.zoomIn()}
            onZoomOut={() => pitchCanvasRef.current?.zoomOut()}
            onFitToView={() => pitchCanvasRef.current?.fitToView()}
            onSave={handleSave}
            onExport={openExportDialog}
            onReturnToWorkspace={handleReturnToWorkspace}
          />

          <div className="relative flex-1 overflow-hidden">
            <TabletToolStrip
              onOpenTools={() => setLeftDrawerOpen(true)}
              onOpenFormations={() => setLeftDrawerOpen(true)}
              onOpenProperties={() => setRightDrawerOpen(true)}
            />
            <PitchCanvas ref={pitchCanvasRef} {...canvasProps} />
          </div>

          <BottomStepBar
            steps={state.steps}
            currentIndex={state.currentStepIndex}
            isPlaying={state.isPlaying}
            onStepChange={setStep}
            onTogglePlay={togglePlay}
            onAddStep={addStep}
            onDuplicateStep={duplicateCurrentStep}
            onDeleteStep={deleteCurrentStep}
            onMoveStepLeft={() => moveCurrentStep('left')}
            onMoveStepRight={() => moveCurrentStep('right')}
            compact
          />

          <TabletLeftDrawer
            open={leftDrawerOpen}
            onClose={() => setLeftDrawerOpen(false)}
            currentTool={state.currentTool}
            fieldFormat={state.fieldFormat}
            playerPlacementTeam={state.playerPlacementTeam}
            onToolChange={(tool) => {
              setTool(tool);
              setLeftDrawerOpen(false);
            }}
            onPlayerPlacementTeamChange={setPlayerPlacementTeam}
            onApplyFormation={applyFormation}
          />
          <TabletRightDrawer
            open={rightDrawerOpen}
            onClose={() => setRightDrawerOpen(false)}
            {...rightPanelProps}
          />
        </div>
        <FieldFormatChangeDialog
          currentFormat={state.fieldFormat}
          pendingFormat={pendingFieldFormat}
          onClose={closeFieldFormatDialog}
          onKeepObjects={confirmKeepObjectsAndSwitchFormat}
          onRegenerate={confirmRegenerateForFormat}
        />
        <ExportConfigDialog
          open={exportDialogOpen}
          config={exportConfig}
          canIncludeReferenceImage={canIncludeReferenceImage}
          canExportGif={canExportGif}
          stepCount={state.steps.length}
          onOpenChange={setExportDialogOpen}
          onConfigChange={setExportConfig}
          onConfirm={handleExportConfirm}
        />
      </>
    );
  }

  return (
    <>
      <div className="relative flex h-screen w-screen flex-col overflow-hidden">
        <MobileTopBar
          projectId={projectId}
          projectName={displayProjectName}
          saveStatusLabel={saveStatusLabel}
          saveStatusTone={saveStatusTone}
          fieldFormat={state.fieldFormat}
          fieldView={state.fieldView}
          onFieldFormatChange={requestFieldFormatChange}
          onFieldViewChange={setFieldView}
          onSave={handleSave}
          onExport={openExportDialog}
          onReturnToWorkspace={handleReturnToWorkspace}
        />
        <div className="flex-1 overflow-hidden">
          <PitchCanvas ref={pitchCanvasRef} {...canvasProps} />
        </div>
        <MobileToolbar
          currentTool={state.currentTool}
          fieldFormat={state.fieldFormat}
          playerPlacementTeam={state.playerPlacementTeam}
          onToolChange={setTool}
          onPlayerPlacementTeamChange={setPlayerPlacementTeam}
          onOpenSteps={() => setStepsDrawerOpen(true)}
          onOpenProperties={() => setPropsDrawerOpen(true)}
          onOpenFormations={() => setFormationsDrawerOpen(true)}
        />

        <MobileStepsDrawer
          open={stepsDrawerOpen}
          onClose={() => setStepsDrawerOpen(false)}
          steps={state.steps}
          currentIndex={state.currentStepIndex}
          isPlaying={state.isPlaying}
          onStepChange={(index) => {
            setStep(index);
            setStepsDrawerOpen(false);
          }}
          onTogglePlay={togglePlay}
          onAddStep={addStep}
          onDuplicateStep={duplicateCurrentStep}
          onDeleteStep={deleteCurrentStep}
          onMoveStepLeft={() => moveCurrentStep('left')}
          onMoveStepRight={() => moveCurrentStep('right')}
        />
        <MobilePropertiesDrawer
          open={propsDrawerOpen}
          onClose={() => setPropsDrawerOpen(false)}
          {...rightPanelProps}
        />
        <MobileFormationsDrawer
          open={formationsDrawerOpen}
          fieldFormat={state.fieldFormat}
          onClose={() => setFormationsDrawerOpen(false)}
          onApplyFormation={applyFormation}
        />
      </div>
      <FieldFormatChangeDialog
        currentFormat={state.fieldFormat}
        pendingFormat={pendingFieldFormat}
        onClose={closeFieldFormatDialog}
        onKeepObjects={confirmKeepObjectsAndSwitchFormat}
        onRegenerate={confirmRegenerateForFormat}
      />
      <ExportConfigDialog
        open={exportDialogOpen}
        config={exportConfig}
        canIncludeReferenceImage={canIncludeReferenceImage}
        canExportGif={canExportGif}
        stepCount={state.steps.length}
        onOpenChange={setExportDialogOpen}
        onConfigChange={setExportConfig}
        onConfirm={handleExportConfirm}
      />
    </>
  );
}

function FieldFormatChangeDialog({
  currentFormat,
  pendingFormat,
  onClose,
  onKeepObjects,
  onRegenerate,
}: {
  currentFormat: FieldFormat;
  pendingFormat: FieldFormat | null;
  onClose: () => void;
  onKeepObjects: () => void;
  onRegenerate: () => void;
}) {
  return (
    <Dialog open={Boolean(pendingFormat)} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>切换球场制式</DialogTitle>
          <DialogDescription>
            {pendingFormat
              ? `从 ${formatLabels[currentFormat]} 切换到 ${formatLabels[pendingFormat]} 时，系统不会自动删除、重排或映射现有对象。请选择接下来的处理方式。`
              : '请选择制式切换方式。'}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <button
            onClick={onKeepObjects}
            className="w-full rounded-xl border border-border bg-card px-4 py-3 text-left transition-colors hover:border-primary/40 hover:bg-primary/5"
          >
            <div className="text-sm font-medium text-foreground">仅切换球场制式并保留当前对象内容</div>
            <div className="mt-1 text-xs text-muted-foreground">当前阵型会标记为自定义，现有球员、线路、文本和步骤内容都会保留。</div>
          </button>
          <button
            onClick={onRegenerate}
            className="w-full rounded-xl border border-border bg-card px-4 py-3 text-left transition-colors hover:border-primary/40 hover:bg-primary/5"
          >
            <div className="text-sm font-medium text-foreground">按新制式重新生成阵型</div>
            <div className="mt-1 text-xs text-muted-foreground">会按目标制式的默认阵型重建全部步骤的球员站位，并重置线路、文本和足球位置。</div>
          </button>
        </div>
        <DialogFooter>
          <button
            onClick={onClose}
            className="h-9 rounded-lg border border-border bg-secondary px-4 text-sm font-medium text-foreground/80 transition-colors hover:bg-secondary/80"
          >
            取消切换
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
