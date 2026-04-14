import { FieldFormat, Formation, StepFrame, Player, TacticsLine, Ball, Team, TextNote } from '@/types/tactics';

export const formations11: Formation[] = [
  {
    id: 'f-433', name: '4-3-3', format: '11v11',
    positions: [
      { x: 50, y: 92, position: 'GK' },
      { x: 15, y: 75, position: 'LB' }, { x: 38, y: 78, position: 'CB' },
      { x: 62, y: 78, position: 'CB' }, { x: 85, y: 75, position: 'RB' },
      { x: 30, y: 55, position: 'CM' }, { x: 50, y: 50, position: 'CM' },
      { x: 70, y: 55, position: 'CM' },
      { x: 18, y: 28, position: 'LW' }, { x: 50, y: 22, position: 'ST' },
      { x: 82, y: 28, position: 'RW' },
    ],
  },
  {
    id: 'f-4231', name: '4-2-3-1', format: '11v11',
    positions: [
      { x: 50, y: 92, position: 'GK' },
      { x: 15, y: 75, position: 'LB' }, { x: 38, y: 78, position: 'CB' },
      { x: 62, y: 78, position: 'CB' }, { x: 85, y: 75, position: 'RB' },
      { x: 35, y: 58, position: 'CDM' }, { x: 65, y: 58, position: 'CDM' },
      { x: 18, y: 38, position: 'LM' }, { x: 50, y: 35, position: 'CAM' },
      { x: 82, y: 38, position: 'RM' },
      { x: 50, y: 18, position: 'ST' },
    ],
  },
  {
    id: 'f-442', name: '4-4-2', format: '11v11',
    positions: [
      { x: 50, y: 92, position: 'GK' },
      { x: 15, y: 75, position: 'LB' }, { x: 38, y: 78, position: 'CB' },
      { x: 62, y: 78, position: 'CB' }, { x: 85, y: 75, position: 'RB' },
      { x: 15, y: 50, position: 'LM' }, { x: 38, y: 52, position: 'CM' },
      { x: 62, y: 52, position: 'CM' }, { x: 85, y: 50, position: 'RM' },
      { x: 38, y: 25, position: 'ST' }, { x: 62, y: 25, position: 'ST' },
    ],
  },
  {
    id: 'f-352', name: '3-5-2', format: '11v11',
    positions: [
      { x: 50, y: 92, position: 'GK' },
      { x: 25, y: 78, position: 'CB' }, { x: 50, y: 80, position: 'CB' },
      { x: 75, y: 78, position: 'CB' },
      { x: 10, y: 52, position: 'LWB' }, { x: 35, y: 55, position: 'CM' },
      { x: 50, y: 50, position: 'CDM' }, { x: 65, y: 55, position: 'CM' },
      { x: 90, y: 52, position: 'RWB' },
      { x: 38, y: 25, position: 'ST' }, { x: 62, y: 25, position: 'ST' },
    ],
  },
  {
    id: 'f-451', name: '4-5-1', format: '11v11',
    positions: [
      { x: 50, y: 92, position: 'GK' },
      { x: 15, y: 75, position: 'LB' }, { x: 38, y: 78, position: 'CB' },
      { x: 62, y: 78, position: 'CB' }, { x: 85, y: 75, position: 'RB' },
      { x: 15, y: 48, position: 'LM' }, { x: 35, y: 52, position: 'CM' },
      { x: 50, y: 45, position: 'CAM' }, { x: 65, y: 52, position: 'CM' },
      { x: 85, y: 48, position: 'RM' },
      { x: 50, y: 20, position: 'ST' },
    ],
  },
  {
    id: 'f-343', name: '3-4-3', format: '11v11',
    positions: [
      { x: 50, y: 92, position: 'GK' },
      { x: 25, y: 78, position: 'CB' }, { x: 50, y: 80, position: 'CB' },
      { x: 75, y: 78, position: 'CB' },
      { x: 15, y: 52, position: 'LM' }, { x: 38, y: 55, position: 'CM' },
      { x: 62, y: 55, position: 'CM' }, { x: 85, y: 52, position: 'RM' },
      { x: 20, y: 25, position: 'LW' }, { x: 50, y: 20, position: 'ST' },
      { x: 80, y: 25, position: 'RW' },
    ],
  },
  {
    id: 'f-4141', name: '4-1-4-1', format: '11v11',
    positions: [
      { x: 50, y: 92, position: 'GK' },
      { x: 15, y: 75, position: 'LB' }, { x: 38, y: 78, position: 'CB' },
      { x: 62, y: 78, position: 'CB' }, { x: 85, y: 75, position: 'RB' },
      { x: 50, y: 60, position: 'CDM' },
      { x: 15, y: 42, position: 'LM' }, { x: 38, y: 45, position: 'CM' },
      { x: 62, y: 45, position: 'CM' }, { x: 85, y: 42, position: 'RM' },
      { x: 50, y: 18, position: 'ST' },
    ],
  },
  {
    id: 'f-4321', name: '4-3-2-1', format: '11v11',
    positions: [
      { x: 50, y: 92, position: 'GK' },
      { x: 15, y: 75, position: 'LB' }, { x: 38, y: 78, position: 'CB' },
      { x: 62, y: 78, position: 'CB' }, { x: 85, y: 75, position: 'RB' },
      { x: 30, y: 55, position: 'CM' }, { x: 50, y: 52, position: 'CM' },
      { x: 70, y: 55, position: 'CM' },
      { x: 35, y: 35, position: 'AM' }, { x: 65, y: 35, position: 'AM' },
      { x: 50, y: 18, position: 'ST' },
    ],
  },
  {
    id: 'f-532', name: '5-3-2', format: '11v11',
    positions: [
      { x: 50, y: 92, position: 'GK' },
      { x: 10, y: 72, position: 'LWB' }, { x: 30, y: 78, position: 'CB' },
      { x: 50, y: 80, position: 'CB' }, { x: 70, y: 78, position: 'CB' },
      { x: 90, y: 72, position: 'RWB' },
      { x: 30, y: 50, position: 'CM' }, { x: 50, y: 48, position: 'CM' },
      { x: 70, y: 50, position: 'CM' },
      { x: 38, y: 25, position: 'ST' }, { x: 62, y: 25, position: 'ST' },
    ],
  },
];

export const formations8: Formation[] = [
  {
    id: 'f8-331', name: '3-3-1', format: '8v8',
    positions: [
      { x: 50, y: 90, position: 'GK' },
      { x: 20, y: 72, position: 'CB' }, { x: 50, y: 75, position: 'CB' }, { x: 80, y: 72, position: 'CB' },
      { x: 20, y: 48, position: 'MF' }, { x: 50, y: 45, position: 'MF' }, { x: 80, y: 48, position: 'MF' },
      { x: 50, y: 22, position: 'ST' },
    ],
  },
  {
    id: 'f8-241', name: '2-4-1', format: '8v8',
    positions: [
      { x: 50, y: 90, position: 'GK' },
      { x: 30, y: 72, position: 'CB' }, { x: 70, y: 72, position: 'CB' },
      { x: 15, y: 48, position: 'LM' }, { x: 40, y: 50, position: 'CM' },
      { x: 60, y: 50, position: 'CM' }, { x: 85, y: 48, position: 'RM' },
      { x: 50, y: 22, position: 'ST' },
    ],
  },
];

export const formations7: Formation[] = [
  {
    id: 'f7-231', name: '2-3-1', format: '7v7',
    positions: [
      { x: 50, y: 90, position: 'GK' },
      { x: 28, y: 68, position: 'CB' }, { x: 72, y: 68, position: 'CB' },
      { x: 20, y: 46, position: 'LM' }, { x: 50, y: 42, position: 'CM' }, { x: 80, y: 46, position: 'RM' },
      { x: 50, y: 18, position: 'ST' },
    ],
  },
  {
    id: 'f7-321', name: '3-2-1', format: '7v7',
    positions: [
      { x: 50, y: 90, position: 'GK' },
      { x: 20, y: 68, position: 'CB' }, { x: 50, y: 72, position: 'CB' }, { x: 80, y: 68, position: 'CB' },
      { x: 35, y: 42, position: 'CM' }, { x: 65, y: 42, position: 'CM' },
      { x: 50, y: 18, position: 'ST' },
    ],
  },
  {
    id: 'f7-1311', name: '1-3-1-1', format: '7v7',
    positions: [
      { x: 50, y: 90, position: 'GK' },
      { x: 50, y: 72, position: 'CB' },
      { x: 20, y: 52, position: 'LM' }, { x: 50, y: 50, position: 'CM' }, { x: 80, y: 52, position: 'RM' },
      { x: 50, y: 35, position: 'AM' },
      { x: 50, y: 18, position: 'ST' },
    ],
  },
];

export const formations5: Formation[] = [
  {
    id: 'f5-22', name: '2-2', format: '5v5',
    positions: [
      { x: 50, y: 88, position: 'GK' },
      { x: 30, y: 65, position: 'DF' }, { x: 70, y: 65, position: 'DF' },
      { x: 30, y: 35, position: 'FW' }, { x: 70, y: 35, position: 'FW' },
    ],
  },
];

const homeNames = ['张伟', '李强', '王磊', '赵鹏', '陈浩', '刘洋', '杨帆', '黄涛', '周杰', '吴迪', '徐凯'];
const awayNames = ['马丁', '席尔瓦', '罗德里', '贝尔纳多', '哈兰德', '福登', '格里利什', '沃克', '迪亚斯', '阿坎吉', '埃德森'];

function createPlayersFromFormation(formation: Formation, team: Team, names: string[]): Player[] {
  return formation.positions.map((pos, i) => ({
    id: `${team}-${i}`,
    number: team === 'home' ? (i === 0 ? 1 : i + 1) : (i === 0 ? 1 : i + 1),
    name: names[i] || `球员${i + 1}`,
    position: pos.position,
    team,
    x: team === 'away' ? 100 - pos.x : pos.x,
    y: team === 'away' ? 100 - pos.y : pos.y,
  }));
}

export function getFormationsByFormat(format: FieldFormat): Formation[] {
  switch (format) {
    case '11v11':
      return formations11;
    case '8v8':
      return formations8;
    case '7v7':
      return formations7;
    case '5v5':
      return formations5;
    default:
      return formations11;
  }
}

export function getFormationById(format: FieldFormat, formationId: string): Formation | null {
  return getFormationsByFormat(format).find((formation) => formation.id === formationId) ?? null;
}

export function buildPlayersForFormation(formation: Formation, team: Team): Player[] {
  const names = team === 'home' ? homeNames : awayNames;
  return createPlayersFromFormation(formation, team, names);
}

const defaultFormation = formations11[0];
const homePlayers = createPlayersFromFormation(defaultFormation, 'home', homeNames);
const awayFormation = formations11[1];
const awayPlayers = createPlayersFromFormation(awayFormation, 'away', awayNames);

const defaultLines: TacticsLine[] = [
  { id: 'l1', type: 'pass', fromId: 'home-7', toId: 'home-9', fromX: 70, fromY: 55, toX: 50, toY: 22 },
  { id: 'l2', type: 'run', fromId: 'home-8', toId: undefined, fromX: 18, fromY: 28, toX: 30, toY: 15 },
  { id: 'l3', type: 'dribble', fromId: 'home-10', toId: undefined, fromX: 82, fromY: 28, toX: 72, toY: 18 },
];

const defaultBall: Ball = { id: 'ball-1', x: 70, y: 55 };

const defaultTexts: TextNote[] = [
  { id: 't1', text: '中路直塞', x: 58, y: 38, style: 'emphasis' },
];

export const defaultSteps: StepFrame[] = [
  {
    id: 'step-1',
    label: '第 1 步',
    description: '后场组织，右中场持球',
    players: [...homePlayers, ...awayPlayers],
    lines: defaultLines,
    ball: defaultBall,
    texts: defaultTexts,
    areas: [],
  },
  {
    id: 'step-2',
    label: '第 2 步',
    description: '中路直塞，前锋跑位接应',
    players: [...homePlayers.map(p => p.id === 'home-9' ? { ...p, y: 15 } : p), ...awayPlayers],
    lines: [
      { id: 'l4', type: 'shoot', fromId: 'home-9', toId: undefined, fromX: 50, fromY: 15, toX: 50, toY: 3 },
    ],
    ball: { id: 'ball-1', x: 50, y: 15 },
    texts: [
      { id: 't2', text: '射门！', x: 50, y: 8, style: 'title' },
    ],
  },
  {
    id: 'step-3',
    label: '第 3 步',
    description: '边路套边，下底传中',
    players: [...homePlayers.map(p => {
      if (p.id === 'home-8') return { ...p, x: 8, y: 15 };
      if (p.id === 'home-1') return { ...p, x: 10, y: 60 };
      return p;
    }), ...awayPlayers],
    lines: [
      { id: 'l5', type: 'run', fromX: 15, fromY: 75, toX: 8, toY: 15 },
      { id: 'l6', type: 'pass', fromX: 8, fromY: 15, toX: 50, toY: 18 },
    ],
    ball: { id: 'ball-1', x: 8, y: 15 },
    texts: [
      { id: 't3', text: '下底传中', x: 20, y: 15, style: 'body' },
    ],
  },
];
