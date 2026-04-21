export type FieldFormat = '11v11' | '8v8' | '7v7' | '5v5';
export type FieldView = 'full' | 'half';
export type FieldStyle = 'flat' | 'realistic';
export type Orientation = 'horizontal' | 'vertical';
export type ExportFormat = 'png' | 'gif';
export type ExportRatio = '1x' | '2x';
export type GifSpeed = 'slow' | 'standard' | 'fast';

export type LineType = 'run' | 'pass' | 'dribble' | 'shoot' | 'press';
export type PlayerStyle = 'dot' | 'card';
export type Team = 'home' | 'away';
export type FormationMode = 'preset' | 'custom';
export type AreaShape = 'rect' | 'circle' | 'ellipse';

export interface Player {
  id: string;
  number: number;
  name: string;
  position: string;
  team: Team;
  avatarLocalUri?: string | null;
  x: number; // percentage 0-100
  y: number; // percentage 0-100
}

export interface TacticsLine {
  id: string;
  type: LineType;
  fromId?: string;
  toId?: string;
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
}

export interface Ball {
  id: string;
  x: number;
  y: number;
}

export interface TextNote {
  id: string;
  text: string;
  x: number;
  y: number;
  style: 'title' | 'body' | 'emphasis';
}

export interface AreaObject {
  id: string;
  shape: AreaShape;
  x: number;
  y: number;
  width: number;
  height: number;
  strokeColor: string;
  fillColor: string;
  opacity: number;
}

export interface MatchMeta {
  title: string;
  score: string;
  minute: string;
  phaseLabel: string;
}

export interface ReferenceImage {
  id: string;
  name: string;
  localUri: string;
  opacity: number;
  scale: number;
  offsetX: number;
  offsetY: number;
  locked: boolean;
  visible: boolean;
}

export interface ExportConfig {
  format: ExportFormat;
  ratio: ExportRatio;
  gifSpeed: GifSpeed;
  includeTitle: boolean;
  includeStepInfo: boolean;
  includeMatchInfo: boolean;
  includeGhostTrail: boolean;
  includeReferenceImage: boolean;
  transparentBackground: boolean;
}

export interface StepFrame {
  id: string;
  label: string;
  description?: string;
  players: Player[];
  lines: TacticsLine[];
  ball: Ball;
  texts: TextNote[];
  areas?: AreaObject[];
}

export interface Formation {
  id: string;
  name: string;
  format: FieldFormat;
  positions: { x: number; y: number; position: string }[];
}

export type EditorTool = 'select' | 'player' | 'ball' | 'text' | 'zone' | 'line-run' | 'line-pass' | 'line-dribble' | 'line-shoot' | 'line-press';

export interface EditorState {
  projectName: string;
  fieldFormat: FieldFormat;
  fieldView: FieldView;
  fieldStyle: FieldStyle;
  matchMeta: MatchMeta;
  referenceImage: ReferenceImage | null;
  space?: import('@/types/workspace').Workspace;
  orientation: Orientation;
  activeFormationId: string | null;
  formationMode: FormationMode;
  currentTool: EditorTool;
  playerStyle: PlayerStyle;
  playerPlacementTeam: Team;
  selectedPlayerId: string | null;
  selectedLineId: string | null;
  selectedTextId: string | null;
  selectedAreaId: string | null;
  currentStepIndex: number;
  steps: StepFrame[];
  isPlaying: boolean;
}
