import { beforeEach, describe, expect, it } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useEditorState } from '@/hooks/useEditorState';

describe('editor stress roundtrip', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('preserves a mixed editing session across save and reopen', () => {
    const { result } = renderHook(() => useEditorState(undefined, 'personal', 'new', {
      presetId: 'f-433',
    }));

    act(() => {
      result.current.setProjectName('Stress Session');
      result.current.setFieldView('half');
      result.current.setFieldStyle('flat');
      result.current.setPlayerStyle('card');
      result.current.setMatchMetaField('title', 'Weekend Review');
      result.current.setMatchMetaField('score', '3 - 1');
      result.current.setMatchMetaField('minute', "72'");
      result.current.setMatchMetaField('phaseLabel', 'Counter Press');
      result.current.addPlayerAt(18, 74);
      result.current.updateSelectedPlayer((player) => ({
        ...player,
        name: 'Anchor',
        number: 19,
        position: 'DM',
      }));
      result.current.addTextAt(46, 28);
      result.current.updateSelectedText((text) => ({
        ...text,
        text: 'Press Trigger',
        style: 'emphasis',
      }));
      result.current.addAreaAt(54, 34);
      result.current.updateSelectedArea((area) => ({
        ...area,
        shape: 'ellipse',
        width: 32,
        height: 18,
      }));
    });

    act(() => {
      result.current.setTool('line-run');
    });

    act(() => {
      result.current.addLineFromTool(18, 74, 42, 44);
      result.current.updateSelectedLine((line) => ({
        ...line,
        toX: 48,
        toY: 38,
      }));
      result.current.addStep();
      result.current.duplicateCurrentStep();
      result.current.moveCurrentStep('left');
      result.current.setCurrentStepDescription('Primary press trigger');
      result.current.moveBall(51, 41);
    });

    let savedProjectId = '';
    act(() => {
      savedProjectId = result.current.saveProject();
    });

    const reopened = renderHook(() => useEditorState(savedProjectId, 'personal', 'project'));

    expect(reopened.result.current.state.projectName).toBe('Stress Session');
    expect(reopened.result.current.state.fieldView).toBe('half');
    expect(reopened.result.current.state.fieldStyle).toBe('flat');
    expect(reopened.result.current.state.playerStyle).toBe('card');
    expect(reopened.result.current.state.activeFormationId).toBe('f-433');
    expect(reopened.result.current.state.formationMode).toBe('preset');
    expect(reopened.result.current.state.matchMeta).toMatchObject({
      title: 'Weekend Review',
      score: '3 - 1',
      minute: "72'",
      phaseLabel: 'Counter Press',
    });
    expect(reopened.result.current.state.steps).toHaveLength(3);
    expect(reopened.result.current.state.steps[1].description).toBe('Primary press trigger');
    expect(reopened.result.current.state.steps[1].lines).toHaveLength(1);
    expect(reopened.result.current.state.steps[1].texts[0]?.text).toBe('Press Trigger');
    expect(reopened.result.current.state.steps[1].areas?.[0]).toMatchObject({
      shape: 'ellipse',
      width: 32,
      height: 18,
    });
    expect(reopened.result.current.state.steps[1].ball).toMatchObject({
      x: 51,
      y: 41,
    });
    expect(reopened.result.current.state.steps[1].players.some((player) => (
      player.name === 'Anchor' && player.number === 19 && player.position === 'DM'
    ))).toBe(true);
  });
});
