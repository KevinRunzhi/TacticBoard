import type { StepFrame } from '@/types/tactics';

export function buildStepLabel(index: number) {
  return `第 ${index + 1} 步`;
}

export function cloneStepFrame(step: StepFrame, index: number): StepFrame {
  return {
    ...step,
    id: step.id || `step-${index + 1}`,
    label: step.label || buildStepLabel(index),
    description: step.description ?? '',
    players: step.players.map((player) => ({ ...player })),
    lines: step.lines.map((line) => ({ ...line })),
    ball: { ...step.ball },
    texts: step.texts.map((text) => ({ ...text })),
    areas: (step.areas ?? []).map((area) => ({ ...area })),
  };
}
