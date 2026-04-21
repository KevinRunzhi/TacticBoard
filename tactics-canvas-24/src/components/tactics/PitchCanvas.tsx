import { forwardRef, useRef, useState, useEffect, useCallback, useImperativeHandle } from 'react';
import {
  AreaObject,
  Ball,
  EditorTool,
  ExportConfig,
  FieldStyle,
  FieldView,
  MatchMeta,
  Player,
  PlayerStyle,
  ReferenceImage,
  StepFrame,
  TacticsLine,
  TextNote,
} from '@/types/tactics';
import { ZoomIn, ZoomOut, Maximize, RotateCcw, Hand, Mouse } from 'lucide-react';
import { applyExportConfigToSvg, createDefaultExportConfig, getExportScale } from '@/lib/export-config';
import { exportStepsAsGif, exportSvgAsPng, META_TEXT_SEPARATOR } from '@/lib/tactics-export';

interface PitchCanvasProps {
  projectName: string;
  currentTool: EditorTool;
  players: Player[];
  lines: TacticsLine[];
  ball: Ball;
  texts: TextNote[];
  areas: AreaObject[];
  allSteps: StepFrame[];
  currentStepIndex: number;
  matchMeta: MatchMeta;
  referenceImage: ReferenceImage | null;
  fieldView: FieldView;
  fieldStyle: FieldStyle;
  playerStyle: PlayerStyle;
  selectedPlayerId: string | null;
  selectedLineId: string | null;
  selectedTextId: string | null;
  selectedAreaId: string | null;
  onSelectPlayer: (id: string | null) => void;
  onSelectLine: (id: string | null) => void;
  onSelectText: (id: string | null) => void;
  onSelectArea: (id: string | null) => void;
  onAddPlayer: (x: number, y: number) => void;
  onAddText: (x: number, y: number) => void;
  onAddLine: (fromX: number, fromY: number, toX: number, toY: number) => void;
  onAddArea: (x: number, y: number) => void;
  onBeginPlayerMove?: () => void;
  onEndPlayerMove?: () => void;
  onMovePlayer: (id: string, x: number, y: number) => void;
  onMoveBall: (x: number, y: number) => void;
  onMoveArea: (id: string, x: number, y: number) => void;
  onMoveText: (id: string, x: number, y: number) => void;
  onZoomChange?: (zoomPercent: number) => void;
}

export interface PitchCanvasHandle {
  zoomIn: () => void;
  zoomOut: () => void;
  fitToView: () => void;
  resetView: () => void;
  exportPng: (fileName: string, config?: ExportConfig) => Promise<Uint8Array>;
  exportGif: (fileName: string, config?: ExportConfig) => Promise<Uint8Array>;
}

const lineColors: Record<string, string> = {
  run: '#e6b422',
  pass: '#4d9ef7',
  dribble: '#2ecc71',
  shoot: '#e74c3c',
  press: '#9b59b6',
};

const lineStyles: Record<string, string> = {
  run: '6,4',
  pass: '',
  dribble: '2,3',
  shoot: '',
  press: '8,3',
};

const MIN_ZOOM = 0.3;
const MAX_ZOOM = 3;
const LINE_HIT_STROKE_WIDTH = 14;

function SoccerBallGraphic({ cx, cy }: { cx: number; cy: number }) {
  return (
    <>
      <circle cx={cx} cy={cy} r={7} fill="#ffffff" stroke="#1f2937" strokeWidth={1} />
      <circle cx={cx} cy={cy} r={1.6} fill="#1f2937" />
      <circle cx={cx - 3.4} cy={cy - 2.4} r={1.2} fill="#1f2937" />
      <circle cx={cx + 3.4} cy={cy - 2.4} r={1.2} fill="#1f2937" />
      <circle cx={cx - 2.8} cy={cy + 3} r={1.1} fill="#1f2937" />
      <circle cx={cx + 2.8} cy={cy + 3} r={1.1} fill="#1f2937" />
    </>
  );
}

export const PitchCanvas = forwardRef<PitchCanvasHandle, PitchCanvasProps>(function PitchCanvas({
  projectName, currentTool, players, lines, ball, texts, areas, allSteps, currentStepIndex, matchMeta, referenceImage, fieldView, fieldStyle, playerStyle,
  selectedPlayerId, selectedLineId, selectedTextId, selectedAreaId,
  onSelectPlayer, onSelectLine, onSelectText, onSelectArea,
  onAddPlayer, onAddText, onAddLine, onAddArea,
  onBeginPlayerMove, onEndPlayerMove, onMovePlayer, onMoveBall, onMoveArea, onMoveText, onZoomChange,
}: PitchCanvasProps, ref) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [draggingPlayer, setDraggingPlayer] = useState<string | null>(null);
  const [draggingText, setDraggingText] = useState<string | null>(null);
  const [draggingArea, setDraggingArea] = useState<string | null>(null);
  const [draggingBall, setDraggingBall] = useState(false);
  const [pendingLineStart, setPendingLineStart] = useState<{ x: number; y: number } | null>(null);

  // Canvas transform state
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [spaceHeld, setSpaceHeld] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const panStart = useRef({ x: 0, y: 0, panX: 0, panY: 0 });
  const userAdjustedViewRef = useRef(false);

  const isRealistic = fieldStyle === 'realistic';
  const isHalf = fieldView === 'half';
  const isLineTool = currentTool.startsWith('line-');

  const vw = 680;
  const vh = isHalf ? 520 : 1000;
  const padding = 40;
  const pw = vw - padding * 2;
  const ph = vh - padding * 2;
  const referenceImageScale = referenceImage?.scale ?? 1;
  const referenceImageWidth = pw * referenceImageScale;
  const referenceImageHeight = ph * referenceImageScale;
  const referenceImageX = padding + (pw - referenceImageWidth) / 2 + ((referenceImage?.offsetX ?? 0) / 100) * pw;
  const referenceImageY = padding + (ph - referenceImageHeight) / 2 + ((referenceImage?.offsetY ?? 0) / 100) * ph;

  const toSvgX = (pct: number) => padding + (pct / 100) * pw;
  const toSvgY = (pct: number) => padding + (pct / 100) * ph;
  const toPercentPoint = useCallback((clientX: number, clientY: number) => {
    const svg = svgRef.current;
    if (!svg) return null;

    const point = svg.createSVGPoint();
    point.x = clientX;
    point.y = clientY;
    const svgPoint = point.matrixTransform(svg.getScreenCTM()!.inverse());

    return {
      x: Math.max(0, Math.min(100, ((svgPoint.x - padding) / pw) * 100)),
      y: Math.max(0, Math.min(100, ((svgPoint.y - padding) / ph) * 100)),
    };
  }, [padding, ph, pw]);

  useEffect(() => {
    if (!isLineTool) {
      setPendingLineStart(null);
    }
  }, [isLineTool]);

  // Fit to viewport: compute scale to fit SVG in container
  const fitToView = useCallback(() => {
    const container = containerRef.current;
    if (!container) {
      setZoom(1);
      setPan({ x: 0, y: 0 });
      return;
    }
    const cw = container.clientWidth;
    const ch = container.clientHeight;
    const margin = 24; // px padding around pitch
    const availW = cw - margin * 2;
    const availH = ch - margin * 2;
    const scaleW = availW / vw;
    const scaleH = availH / vh;
    const fitZoom = Math.min(scaleW, scaleH, 1); // never exceed 100%
    setZoom(fitZoom);
    setPan({ x: 0, y: 0 });
    userAdjustedViewRef.current = false;
  }, [vw, vh]);

  // Auto fit on mount and on fieldView change
  useEffect(() => {
    // Small delay to ensure container is measured
    const t = setTimeout(fitToView, 50);
    return () => clearTimeout(t);
  }, [fieldView, fitToView]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || typeof ResizeObserver === 'undefined') return;

    const observer = new ResizeObserver(() => {
      if (!userAdjustedViewRef.current) {
        fitToView();
      }
    });

    observer.observe(container);
    return () => observer.disconnect();
  }, [fitToView]);

  // First-time hint
  useEffect(() => {
    const key = 'tactics_canvas_hint_shown';
    if (!localStorage.getItem(key)) {
      setShowHint(true);
      localStorage.setItem(key, '1');
      const t = setTimeout(() => setShowHint(false), 5000);
      return () => clearTimeout(t);
    }
  }, []);

  // Spacebar hold for pan mode
  useEffect(() => {
    const onDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !e.repeat && !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)) {
        e.preventDefault();
        setSpaceHeld(true);
      }
    };
    const onUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setSpaceHeld(false);
        setIsPanning(false);
      }
    };
    window.addEventListener('keydown', onDown);
    window.addEventListener('keyup', onUp);
    return () => {
      window.removeEventListener('keydown', onDown);
      window.removeEventListener('keyup', onUp);
    };
  }, []);

  // Wheel zoom (desktop)
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = -e.deltaY * 0.001;
      userAdjustedViewRef.current = true;
      setZoom(z => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z + delta * z)));
    };
    container.addEventListener('wheel', onWheel, { passive: false });
    return () => container.removeEventListener('wheel', onWheel);
  }, []);

  // Touch zoom & pan
  const lastTouchDist = useRef<number | null>(null);
  const lastTouchCenter = useRef<{ x: number; y: number } | null>(null);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      lastTouchDist.current = Math.hypot(dx, dy);
      lastTouchCenter.current = {
        x: (e.touches[0].clientX + e.touches[1].clientX) / 2,
        y: (e.touches[0].clientY + e.touches[1].clientY) / 2,
      };
    } else if (
      e.touches.length === 1
      && !draggingPlayer
      && !draggingText
      && !draggingArea
      && !draggingBall
      && currentTool === 'select'
    ) {
      setIsPanning(true);
      panStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY, panX: pan.x, panY: pan.y };
    }
  }, [currentTool, draggingArea, draggingBall, draggingPlayer, draggingText, pan]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      e.preventDefault();
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.hypot(dx, dy);
      if (lastTouchDist.current) {
        const scale = dist / lastTouchDist.current;
        userAdjustedViewRef.current = true;
        setZoom(z => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z * scale)));
      }
      const center = {
        x: (e.touches[0].clientX + e.touches[1].clientX) / 2,
        y: (e.touches[0].clientY + e.touches[1].clientY) / 2,
      };
      if (lastTouchCenter.current) {
        userAdjustedViewRef.current = true;
        setPan(p => ({
          x: p.x + (center.x - lastTouchCenter.current!.x),
          y: p.y + (center.y - lastTouchCenter.current!.y),
        }));
      }
      lastTouchDist.current = dist;
      lastTouchCenter.current = center;
    } else if (e.touches.length === 1 && isPanning) {
      userAdjustedViewRef.current = true;
      setPan({
        x: panStart.current.panX + (e.touches[0].clientX - panStart.current.x),
        y: panStart.current.panY + (e.touches[0].clientY - panStart.current.y),
      });
    }
  }, [isPanning]);

  const handleTouchEnd = useCallback(() => {
    lastTouchDist.current = null;
    lastTouchCenter.current = null;
    setIsPanning(false);
  }, []);

  // Mouse pan: space+left click, middle click, or left click on empty canvas (no selected object)
  const handleContainerMouseDown = useCallback((e: React.MouseEvent) => {
    // Space + left click = pan
    if (spaceHeld && e.button === 0) {
      e.preventDefault();
      setIsPanning(true);
      panStart.current = { x: e.clientX, y: e.clientY, panX: pan.x, panY: pan.y };
      return;
    }
    // Middle click = pan
    if (e.button === 1) {
      e.preventDefault();
      setIsPanning(true);
      panStart.current = { x: e.clientX, y: e.clientY, panX: pan.x, panY: pan.y };
      return;
    }
    // Left click on empty area (container or SVG background) = pan when no player selected
    if (
      e.button === 0
      && currentTool === 'select'
      && !selectedPlayerId
      && !selectedLineId
      && !selectedTextId
      && !selectedAreaId
      && !draggingPlayer
      && !draggingText
      && !draggingArea
      && !draggingBall
    ) {
      setIsPanning(true);
      panStart.current = { x: e.clientX, y: e.clientY, panX: pan.x, panY: pan.y };
    }
  }, [currentTool, draggingArea, draggingBall, draggingPlayer, draggingText, pan, selectedAreaId, selectedLineId, selectedPlayerId, selectedTextId, spaceHeld]);

  const handleContainerMouseMove = useCallback((e: React.MouseEvent) => {
    if (isPanning) {
      userAdjustedViewRef.current = true;
      setPan({
        x: panStart.current.panX + (e.clientX - panStart.current.x),
        y: panStart.current.panY + (e.clientY - panStart.current.y),
      });
    }
  }, [isPanning]);

  const handleContainerMouseUp = useCallback(() => {
    setIsPanning(false);
  }, []);

  // Player drag handlers
  const handlePlayerMouseDown = (playerId: string) => (e: React.MouseEvent) => {
    if (spaceHeld) return; // space held = pan mode, don't drag player
    e.stopPropagation();
    setPendingLineStart(null);
    onBeginPlayerMove?.();
    setDraggingPlayer(playerId);
    onSelectPlayer(playerId);
  };

  const handleBallMouseDown = (e: React.MouseEvent) => {
    if (spaceHeld || currentTool !== 'ball') return;
    e.stopPropagation();
    setPendingLineStart(null);
    onBeginPlayerMove?.();
    setDraggingBall(true);
    onSelectPlayer(null);
    onSelectLine(null);
    onSelectText(null);
    onSelectArea(null);
  };

  const handleTextMouseDown = (textId: string) => (e: React.MouseEvent) => {
    if (spaceHeld) return;
    e.stopPropagation();
    setPendingLineStart(null);
    onBeginPlayerMove?.();
    setDraggingText(textId);
    onSelectText(textId);
  };

  const handleAreaMouseDown = (areaId: string) => (e: React.MouseEvent) => {
    if (spaceHeld) return;
    e.stopPropagation();
    setPendingLineStart(null);
    onBeginPlayerMove?.();
    setDraggingArea(areaId);
    onSelectArea(areaId);
  };

  const handleLineClick = (lineId: string) => (e: React.MouseEvent) => {
    e.stopPropagation();
    setPendingLineStart(null);
    onSelectLine(lineId);
  };

  const handleSvgMouseMove = (e: React.MouseEvent) => {
    const point = toPercentPoint(e.clientX, e.clientY);
    if (!point) return;

    if (draggingPlayer) {
      onMovePlayer(draggingPlayer, point.x, point.y);
    }

    if (draggingText) {
      onMoveText(draggingText, point.x, point.y);
    }

    if (draggingArea) {
      onMoveArea(draggingArea, point.x, point.y);
    }

    if (draggingBall) {
      onMoveBall(point.x, point.y);
    }
  };

  const handleSvgMouseUp = () => {
    setDraggingPlayer(null);
    setDraggingText(null);
    setDraggingArea(null);
    setDraggingBall(false);
    onEndPlayerMove?.();
  };

  const handleBgClick = (e: React.MouseEvent) => {
    if (spaceHeld) return;
    const point = toPercentPoint(e.clientX, e.clientY);

    if (!point) {
      setPendingLineStart(null);
      onSelectPlayer(null);
      onSelectLine(null);
      onSelectText(null);
      onSelectArea(null);
      return;
    }

    if (currentTool === 'player') {
      setPendingLineStart(null);
      onAddPlayer(point.x, point.y);
      return;
    }

    if (currentTool === 'ball') {
      setPendingLineStart(null);
      onSelectPlayer(null);
      onSelectLine(null);
      onSelectText(null);
      onSelectArea(null);
      onMoveBall(point.x, point.y);
      return;
    }

    if (currentTool === 'text') {
      setPendingLineStart(null);
      onAddText(point.x, point.y);
      return;
    }

    if (isLineTool) {
      if (!pendingLineStart) {
        onSelectPlayer(null);
        onSelectLine(null);
        onSelectText(null);
        onSelectArea(null);
        setPendingLineStart(point);
      } else {
        onAddLine(pendingLineStart.x, pendingLineStart.y, point.x, point.y);
        setPendingLineStart(null);
      }
      return;
    }

    if (currentTool === 'zone') {
      setPendingLineStart(null);
      onAddArea(point.x, point.y);
      return;
    }

    setPendingLineStart(null);
    onSelectPlayer(null);
    onSelectLine(null);
    onSelectText(null);
    onSelectArea(null);
  };

  // SVG mousedown on background for panning (space held or empty area with no selection)
  const handleSvgMouseDown = useCallback((e: React.MouseEvent) => {
    if (spaceHeld && e.button === 0) {
      e.preventDefault();
      e.stopPropagation();
      setIsPanning(true);
      panStart.current = { x: e.clientX, y: e.clientY, panX: pan.x, panY: pan.y };
      return;
    }
    // Left click on SVG background (no player hit) = pan
    if (e.button === 0 && !selectedPlayerId && !selectedLineId && !selectedTextId && !selectedAreaId && !draggingPlayer && !draggingText && !draggingArea && !draggingBall && currentTool !== 'zone' && !isLineTool && currentTool !== 'player' && currentTool !== 'ball' && currentTool !== 'text') {
      setIsPanning(true);
      panStart.current = { x: e.clientX, y: e.clientY, panX: pan.x, panY: pan.y };
    }
  }, [currentTool, draggingArea, draggingBall, draggingPlayer, draggingText, isLineTool, pan, selectedAreaId, selectedLineId, selectedPlayerId, selectedTextId, spaceHeld]);

  const zoomPercent = Math.round(zoom * 100);
  const lineToolHint = isLineTool
    ? (pendingLineStart ? '请点击球场选择终点' : '请点击球场选择起点')
    : null;
  const cursorStyle = currentTool === 'zone'
    ? 'crosshair'
    : spaceHeld
      ? (isPanning ? 'grabbing' : 'grab')
      : isPanning
        ? 'grabbing'
        : (!selectedPlayerId && !selectedLineId && !selectedTextId && !selectedAreaId ? 'grab' : 'default');

  useEffect(() => {
    onZoomChange?.(zoomPercent);
  }, [onZoomChange, zoomPercent]);

  useImperativeHandle(ref, () => ({
    zoomIn: () => {
      userAdjustedViewRef.current = true;
      setZoom((currentZoom) => Math.min(MAX_ZOOM, currentZoom + 0.15));
    },
    zoomOut: () => {
      userAdjustedViewRef.current = true;
      setZoom((currentZoom) => Math.max(MIN_ZOOM, currentZoom - 0.15));
    },
    fitToView,
    resetView: () => {
      userAdjustedViewRef.current = true;
      setZoom(1);
      setPan({ x: 0, y: 0 });
    },
    exportPng: async (fileName: string, config?: ExportConfig) => {
      const exportConfig = config ?? createDefaultExportConfig();
      const sourceSvg = svgRef.current;
      if (!sourceSvg) {
        throw new Error('Canvas SVG is not ready.');
      }

      const exportSvg = applyExportConfigToSvg(sourceSvg, exportConfig);
      return exportSvgAsPng({
        svg: exportSvg,
        scale: getExportScale(exportConfig),
      });
    },
    exportGif: async (fileName: string, config?: ExportConfig) => {
      const exportConfig = config ?? createDefaultExportConfig();
      const canvas = document.createElement('canvas');
      return exportStepsAsGif({
        canvas,
        projectName,
        matchMeta,
        referenceImage,
        fieldView,
        fieldStyle,
        playerStyle,
        steps: allSteps,
        config: exportConfig,
      });
    },
  }), [allSteps, fieldStyle, fieldView, fitToView, matchMeta, playerStyle, projectName, referenceImage]);

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-hidden bg-background/50 relative select-none"
      style={{ cursor: cursorStyle }}
      onMouseDown={handleContainerMouseDown}
      onMouseMove={handleContainerMouseMove}
      onMouseUp={handleContainerMouseUp}
      onMouseLeave={handleContainerMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* SVG canvas with transform */}
      <div
        className="w-full h-full flex items-center justify-center"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: 'center center',
          transition: isPanning || draggingPlayer || draggingText || draggingBall ? 'none' : 'transform 0.15s ease-out',
        }}
      >
        <svg
          ref={svgRef}
          viewBox={`0 0 ${vw} ${vh}`}
          className="drop-shadow-2xl"
          style={{
            width: `${vw}px`,
            height: `${vh}px`,
            maxWidth: 'none',
          }}
          preserveAspectRatio="xMidYMid meet"
          onMouseDown={handleSvgMouseDown}
          onMouseMove={handleSvgMouseMove}
          onMouseUp={handleSvgMouseUp}
          onMouseLeave={handleSvgMouseUp}
          onClick={handleBgClick}
        >
          {/* Defs */}
          <defs>
            {isRealistic && (
              <>
                <pattern id="grass" patternUnits="userSpaceOnUse" width="40" height="40">
                  <rect width="40" height="20" fill="hsl(142, 50%, 28%)" />
                  <rect y="20" width="40" height="20" fill="hsl(142, 50%, 26%)" />
                </pattern>
                <linearGradient id="pitchGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(145, 55%, 30%)" />
                  <stop offset="50%" stopColor="hsl(142, 50%, 26%)" />
                  <stop offset="100%" stopColor="hsl(145, 55%, 30%)" />
                </linearGradient>
              </>
            )}
            <marker id="arrowRun" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill={lineColors.run} />
            </marker>
            <marker id="arrowPass" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill={lineColors.pass} />
            </marker>
            <marker id="arrowDribble" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill={lineColors.dribble} />
            </marker>
            <marker id="arrowShoot" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill={lineColors.shoot} />
            </marker>
            <marker id="arrowPress" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill={lineColors.press} />
            </marker>
            <clipPath id="pitch-clip">
              <rect x={padding} y={padding} width={pw} height={ph} rx="2" />
            </clipPath>
          </defs>

          {/* Outer area */}
          <rect
            x="0"
            y="0"
            width={vw}
            height={vh}
            rx="8"
            fill={isRealistic ? 'hsl(145, 45%, 22%)' : 'hsl(152, 40%, 18%)'}
            data-export-role="canvas-background"
          />

          <MatchMetaBanner
            projectName={projectName}
            matchMeta={matchMeta}
            canvasWidth={vw}
          />

          {/* Pitch */}
          <rect x={padding} y={padding} width={pw} height={ph} rx="2"
            fill={isRealistic ? 'url(#pitchGrad)' : 'hsl(145, 55%, 32%)'}
          />
          {isRealistic && (
            <rect x={padding} y={padding} width={pw} height={ph} rx="2" fill="url(#grass)" opacity="0.3" />
          )}
          {referenceImage?.visible && referenceImage.localUri && (
            <image
              href={referenceImage.localUri}
              x={referenceImageX}
              y={referenceImageY}
              width={referenceImageWidth}
              height={referenceImageHeight}
              preserveAspectRatio="xMidYMid slice"
              opacity={referenceImage.opacity}
              data-export-role="reference-image"
              clipPath="url(#pitch-clip)"
            />
          )}

          {/* Field markings */}
          <PitchMarkings padding={padding} pw={pw} ph={ph} isHalf={isHalf} />

          {/* Areas */}
          {areas.map((area) => {
            const isSelected = selectedAreaId === area.id;
            const commonProps = {
              fill: area.fillColor,
              fillOpacity: area.opacity,
              stroke: area.strokeColor,
              strokeWidth: isSelected ? 2.5 : 1.5,
              strokeDasharray: isSelected ? '5,3' : undefined,
            };

            if (area.shape === 'circle') {
              const radius = Math.min(area.width, area.height) / 2;
              return (
                <circle
                  key={area.id}
                  cx={toSvgX(area.x)}
                  cy={toSvgY(area.y)}
                  r={(radius / 100) * Math.min(pw, ph)}
                  onMouseDown={handleAreaMouseDown(area.id)}
                  onClick={(event) => event.stopPropagation()}
                  style={{ cursor: spaceHeld ? 'grab' : 'move' }}
                  {...commonProps}
                />
              );
            }

            if (area.shape === 'ellipse') {
              return (
                <ellipse
                  key={area.id}
                  cx={toSvgX(area.x)}
                  cy={toSvgY(area.y)}
                  rx={(area.width / 100) * pw / 2}
                  ry={(area.height / 100) * ph / 2}
                  onMouseDown={handleAreaMouseDown(area.id)}
                  onClick={(event) => event.stopPropagation()}
                  style={{ cursor: spaceHeld ? 'grab' : 'move' }}
                  {...commonProps}
                />
              );
            }

            return (
              <rect
                key={area.id}
                x={toSvgX(area.x) - ((area.width / 100) * pw) / 2}
                y={toSvgY(area.y) - ((area.height / 100) * ph) / 2}
                width={(area.width / 100) * pw}
                height={(area.height / 100) * ph}
                rx="10"
                onMouseDown={handleAreaMouseDown(area.id)}
                onClick={(event) => event.stopPropagation()}
                style={{ cursor: spaceHeld ? 'grab' : 'move' }}
                {...commonProps}
              />
            );
          })}

          {/* Lines */}
          {lines.map(line => (
            <g key={line.id} onClick={handleLineClick(line.id)} style={{ cursor: 'pointer' }}>
              {selectedLineId === line.id ? (
                <line
                  x1={toSvgX(line.fromX)} y1={toSvgY(line.fromY)}
                  x2={toSvgX(line.toX)} y2={toSvgY(line.toY)}
                  stroke="hsl(var(--primary))"
                  strokeWidth={6}
                  opacity={0.18}
                  pointerEvents="none"
                />
              ) : null}
              <line
                x1={toSvgX(line.fromX)} y1={toSvgY(line.fromY)}
                x2={toSvgX(line.toX)} y2={toSvgY(line.toY)}
                stroke="transparent"
                strokeWidth={LINE_HIT_STROKE_WIDTH}
                pointerEvents="stroke"
              />
              <line
                x1={toSvgX(line.fromX)} y1={toSvgY(line.fromY)}
                x2={toSvgX(line.toX)} y2={toSvgY(line.toY)}
                stroke={lineColors[line.type]}
                strokeWidth={2.5}
                strokeDasharray={lineStyles[line.type]}
                markerEnd={`url(#arrow${line.type.charAt(0).toUpperCase() + line.type.slice(1)})`}
                opacity={0.85}
                pointerEvents="none"
              />
            </g>
          ))}

          {pendingLineStart ? (
            <circle
              cx={toSvgX(pendingLineStart.x)}
              cy={toSvgY(pendingLineStart.y)}
              r={7}
              fill="hsl(var(--primary))"
              opacity={0.75}
            />
          ) : null}

          {/* Text notes */}
          {texts.map(t => (
            <g key={t.id} onMouseDown={handleTextMouseDown(t.id)} onClick={(event) => { event.stopPropagation(); onSelectText(t.id); }} style={{ cursor: spaceHeld ? 'grab' : 'move' }}>
              {selectedTextId === t.id ? (
                <rect
                  x={toSvgX(t.x) - 34}
                  y={toSvgY(t.y) - 12}
                  width={68}
                  height={24}
                  rx={5}
                  fill="none"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  strokeDasharray="3,2"
                />
              ) : null}
              <rect x={toSvgX(t.x) - 30} y={toSvgY(t.y) - 8} width={60} height={16} rx={3} fill="hsla(0,0%,0%,0.6)" />
              <text x={toSvgX(t.x)} y={toSvgY(t.y) + 4} textAnchor="middle"
                fill={t.style === 'title' ? '#fff' : t.style === 'emphasis' ? '#e6b422' : '#ccc'}
                fontSize={t.style === 'title' ? 13 : 10}
                fontWeight={t.style === 'title' ? 700 : t.style === 'emphasis' ? 600 : 400}
              >{t.text}</text>
            </g>
          ))}

          {/* Ball */}
          <g onMouseDown={handleBallMouseDown} style={{ cursor: currentTool === 'ball' && !spaceHeld ? 'grab' : 'default' }}>
            <SoccerBallGraphic cx={toSvgX(ball.x)} cy={toSvgY(ball.y)} />
          </g>

          {/* Players */}
          {players.map(player => {
            const cx = toSvgX(player.x);
            const cy = toSvgY(player.y);
            const isSelected = selectedPlayerId === player.id;
            const isHome = player.team === 'home';
            const avatarClipId = `player-avatar-clip-${player.id}`;

            if (playerStyle === 'card') {
              return (
                <g key={player.id} onMouseDown={handlePlayerMouseDown(player.id)} style={{ cursor: spaceHeld ? 'grab' : 'grab' }} onClick={e => e.stopPropagation()}>
                  {isSelected && <rect x={cx - 16} y={cy - 22} width={32} height={40} rx={5} fill="none" stroke="hsl(var(--primary))" strokeWidth={2} strokeDasharray="3,2" />}
                  <rect x={cx - 14} y={cy - 20} width={28} height={36} rx={4}
                    fill={isHome ? 'hsl(210, 90%, 40%)' : 'hsl(0, 70%, 45%)'}
                    stroke={isHome ? 'hsl(210, 90%, 55%)' : 'hsl(0, 70%, 60%)'} strokeWidth={1}
                  />
                  {player.avatarLocalUri ? (
                    <>
                      <defs>
                        <clipPath id={avatarClipId}>
                          <circle cx={cx} cy={cy - 10} r={6.2} />
                        </clipPath>
                      </defs>
                      <circle cx={cx} cy={cy - 10} r={6.7} fill="rgba(255,255,255,0.18)" stroke="rgba(255,255,255,0.42)" strokeWidth={0.8} />
                      <image
                        href={player.avatarLocalUri}
                        x={cx - 6.2}
                        y={cy - 16.2}
                        width={12.4}
                        height={12.4}
                        preserveAspectRatio="xMidYMid slice"
                        clipPath={`url(#${avatarClipId})`}
                      />
                    </>
                  ) : null}
                  <text x={cx} y={player.avatarLocalUri ? cy + 2 : cy - 4} textAnchor="middle" fill="#fff" fontSize={12} fontWeight={700}>{player.number}</text>
                  <text x={cx} y={player.avatarLocalUri ? cy + 11 : cy + 10} textAnchor="middle" fill="hsla(0,0%,100%,0.8)" fontSize={6}>{player.name.slice(0, 2)}</text>
                </g>
              );
            }

            return (
              <g key={player.id} onMouseDown={handlePlayerMouseDown(player.id)} style={{ cursor: 'grab' }} onClick={e => e.stopPropagation()}>
                {isSelected && <circle cx={cx} cy={cy} r={16} fill="none" stroke="hsl(var(--primary))" strokeWidth={2} strokeDasharray="3,2" />}
                <circle cx={cx} cy={cy} r={12}
                  fill={isHome ? 'hsl(210, 90%, 56%)' : 'hsl(0, 80%, 58%)'}
                  stroke={isHome ? 'hsl(210, 90%, 70%)' : 'hsl(0, 80%, 72%)'} strokeWidth={1.5}
                />
                <text x={cx} y={cy + 4} textAnchor="middle" fill="#fff" fontSize={10} fontWeight={700}>{player.number}</text>
                <text x={cx} y={cy + 22} textAnchor="middle" fill="hsla(0,0%,100%,0.7)" fontSize={7}>
                  {player.name.length > 3 ? player.name.slice(0, 3) : player.name}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* First-time hint overlay */}
      {showHint && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-30 panel-bg border border-border rounded-lg px-4 py-2.5 shadow-lg flex items-center gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <Mouse className="w-3.5 h-3.5" />
            <span>滚轮缩放</span>
          </div>
          <div className="w-px h-4 bg-border" />
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <Hand className="w-3.5 h-3.5" />
            <span>拖动空白区域平移</span>
          </div>
          <button onClick={() => setShowHint(false)} className="text-muted-foreground hover:text-foreground text-xs ml-1">✕</button>
        </div>
      )}

      {/* Space held indicator */}
      {spaceHeld && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-30 panel-bg border border-primary/30 rounded-md px-3 py-1.5 shadow-lg">
          <span className="text-[11px] text-primary flex items-center gap-1.5">
            <Hand className="w-3.5 h-3.5" />
            画布平移模式
          </span>
        </div>
      )}

      {lineToolHint && !spaceHeld && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-30 panel-bg border border-primary/30 rounded-md px-3 py-1.5 shadow-lg">
          <span className="text-[11px] text-primary">{lineToolHint}</span>
        </div>
      )}

      {/* Zoom controls overlay */}
      <div className="absolute bottom-3 right-3 z-20 flex items-center gap-1 panel-bg border border-border rounded-lg p-1 shadow-lg">
        <button onClick={() => {
          userAdjustedViewRef.current = true;
          setZoom(z => Math.max(MIN_ZOOM, z - 0.15));
        }} title="缩小"
          className="w-7 h-7 rounded flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
          <ZoomOut className="w-3.5 h-3.5" />
        </button>
        <span className="text-[10px] text-muted-foreground min-w-[32px] text-center">{zoomPercent}%</span>
        <button onClick={() => {
          userAdjustedViewRef.current = true;
          setZoom(z => Math.min(MAX_ZOOM, z + 0.15));
        }} title="放大"
          className="w-7 h-7 rounded flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
          <ZoomIn className="w-3.5 h-3.5" />
        </button>
        <div className="w-px h-4 bg-border" />
        <button onClick={fitToView} title="适配屏幕"
          className="w-7 h-7 rounded flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
          <Maximize className="w-3.5 h-3.5" />
        </button>
        <button onClick={() => {
          userAdjustedViewRef.current = true;
          setZoom(1);
          setPan({ x: 0, y: 0 });
        }} title="100%"
          className="w-7 h-7 rounded flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
});
function PitchMarkings({ padding, pw, ph, isHalf }: { padding: number; pw: number; ph: number; isHalf: boolean }) {
  const lc = 'hsla(145, 30%, 65%, 0.6)';
  const lw = 1.5;
  const cx = padding + pw / 2;
  const cy = padding + ph / 2;
  const paW = pw * 0.44;
  const paH = ph * 0.17;
  const gaW = pw * 0.2;
  const gaH = ph * 0.06;
  const goalW = pw * 0.12;

  return (
    <g stroke={lc} strokeWidth={lw} fill="none">
      <rect x={padding} y={padding} width={pw} height={ph} />
      {!isHalf && <line x1={padding} y1={cy} x2={padding + pw} y2={cy} />}
      <circle cx={cx} cy={isHalf ? padding : cy} r={ph * 0.095} />
      <circle cx={cx} cy={isHalf ? padding : cy} r={3} fill={lc} />
      <rect x={cx - paW / 2} y={padding} width={paW} height={paH} />
      <rect x={cx - gaW / 2} y={padding} width={gaW} height={gaH} />
      <rect x={cx - goalW / 2} y={padding - 8} width={goalW} height={8} strokeWidth={2} stroke="hsla(0,0%,100%,0.4)" />
      <circle cx={cx} cy={padding + paH * 0.7} r={2.5} fill={lc} />
      <path d={`M ${cx - paW * 0.35} ${padding + paH} A ${ph * 0.095} ${ph * 0.095} 0 0 0 ${cx + paW * 0.35} ${padding + paH}`} />
      {!isHalf && (
        <>
          <rect x={cx - paW / 2} y={padding + ph - paH} width={paW} height={paH} />
          <rect x={cx - gaW / 2} y={padding + ph - gaH} width={gaW} height={gaH} />
          <rect x={cx - goalW / 2} y={padding + ph} width={goalW} height={8} strokeWidth={2} stroke="hsla(0,0%,100%,0.4)" />
          <circle cx={cx} cy={padding + ph - paH * 0.7} r={2.5} fill={lc} />
          <path d={`M ${cx - paW * 0.35} ${padding + ph - paH} A ${ph * 0.095} ${ph * 0.095} 0 0 1 ${cx + paW * 0.35} ${padding + ph - paH}`} />
        </>
      )}
      <path d={`M ${padding + 10} ${padding} A 10 10 0 0 0 ${padding} ${padding + 10}`} />
      <path d={`M ${padding + pw - 10} ${padding} A 10 10 0 0 1 ${padding + pw} ${padding + 10}`} />
      {!isHalf && (
        <>
          <path d={`M ${padding} ${padding + ph - 10} A 10 10 0 0 0 ${padding + 10} ${padding + ph}`} />
          <path d={`M ${padding + pw} ${padding + ph - 10} A 10 10 0 0 1 ${padding + pw - 10} ${padding + ph}`} />
        </>
      )}
    </g>
  );
}

function MatchMetaBanner({
  projectName,
  matchMeta,
  canvasWidth,
}: {
  projectName: string;
  matchMeta: MatchMeta;
  canvasWidth: number;
}) {
  const title = matchMeta.title.trim() || projectName;
  const metaLine = [matchMeta.score, matchMeta.minute, matchMeta.phaseLabel]
    .map((value) => value.trim())
    .filter(Boolean)
    .join(META_TEXT_SEPARATOR);
  const bannerWidth = Math.min(canvasWidth - 40, 420);
  const bannerX = (canvasWidth - bannerWidth) / 2;
  const hasMetaLine = Boolean(metaLine);
  const bannerHeight = hasMetaLine ? 38 : 28;

  return (
    <g pointerEvents="none" data-export-role="match-banner">
      <rect
        x={bannerX}
        y="10"
        width={bannerWidth}
        height={bannerHeight}
        rx="10"
        fill="rgba(5, 12, 16, 0.64)"
      />
      <text
        x={canvasWidth / 2}
        y={hasMetaLine ? '24' : '28'}
        textAnchor="middle"
        fill="#f8fafc"
        fontSize={hasMetaLine ? '14' : '15'}
        fontWeight={700}
        data-export-role="match-title"
      >
        {title}
      </text>
      {hasMetaLine ? (
        <text
          x={canvasWidth / 2}
          y="38"
          textAnchor="middle"
          fill="rgba(248,250,252,0.84)"
          fontSize="11"
          fontWeight={500}
          data-export-role="match-info"
        >
          {metaLine}
        </text>
      ) : null}
    </g>
  );
}
