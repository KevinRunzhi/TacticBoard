import { beforeEach, describe, expect, it } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useEditorState } from '@/hooks/useEditorState';

describe('core object CRUD', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('adds and removes players in the current step', () => {
    const { result } = renderHook(() => useEditorState(undefined, 'personal', 'new'));

    act(() => {
      result.current.addPlayerAt(24, 38);
    });

    expect(result.current.currentStep.players).toHaveLength(1);
    expect(result.current.state.selectedPlayerId).toBe(result.current.currentStep.players[0].id);

    act(() => {
      result.current.removeSelectedPlayer();
    });

    expect(result.current.currentStep.players).toHaveLength(0);
    expect(result.current.state.selectedPlayerId).toBeNull();
  });

  it('adds players to the explicitly selected team and allows changing the selected player team', () => {
    const { result } = renderHook(() => useEditorState(undefined, 'personal', 'new'));

    act(() => {
      result.current.setPlayerPlacementTeam('away');
      result.current.addPlayerAt(24, 38);
    });

    expect(result.current.currentStep.players[0]).toMatchObject({
      team: 'away',
      number: 1,
      name: '客队球员 1',
    });

    act(() => {
      result.current.setPlayerPlacementTeam('home');
      result.current.addPlayerAt(32, 46);
    });

    expect(result.current.currentStep.players[1]).toMatchObject({
      team: 'home',
      number: 1,
      name: '主队球员 1',
    });

    act(() => {
      result.current.selectPlayer(result.current.currentStep.players[1].id);
      result.current.updateSelectedPlayer((player) => ({ ...player, team: 'away' }));
    });

    expect(result.current.currentStep.players[1].team).toBe('away');
  });

  it('creates, updates, and removes line objects from the active line tool', () => {
    const { result } = renderHook(() => useEditorState(undefined, 'personal', 'new'));

    act(() => {
      result.current.setTool('line-pass');
    });

    act(() => {
      result.current.addLineFromTool(10, 15, 60, 70);
    });

    expect(result.current.currentStep.lines).toHaveLength(1);
    expect(result.current.currentStep.lines[0]).toMatchObject({
      type: 'pass',
      fromX: 10,
      fromY: 15,
      toX: 60,
      toY: 70,
    });

    act(() => {
      result.current.updateSelectedLine((line) => ({
        ...line,
        type: 'shoot',
        toX: 72,
      }));
    });

    expect(result.current.currentStep.lines[0]).toMatchObject({
      type: 'shoot',
      toX: 72,
    });

    act(() => {
      result.current.removeSelectedLine();
    });

    expect(result.current.currentStep.lines).toHaveLength(0);
    expect(result.current.state.selectedLineId).toBeNull();
  });

  it('creates, updates, moves, and removes text notes', () => {
    const { result } = renderHook(() => useEditorState(undefined, 'personal', 'new'));

    act(() => {
      result.current.addTextAt(48, 52);
    });

    expect(result.current.currentStep.texts).toHaveLength(1);
    const textId = result.current.currentStep.texts[0].id;

    act(() => {
      result.current.updateSelectedText((textNote) => ({
        ...textNote,
        text: 'High press',
        style: 'emphasis',
      }));
      result.current.moveText(textId, 58, 61);
    });

    expect(result.current.currentStep.texts[0]).toMatchObject({
      text: 'High press',
      style: 'emphasis',
      x: 58,
      y: 61,
    });

    act(() => {
      result.current.removeSelectedText();
    });

    expect(result.current.currentStep.texts).toHaveLength(0);
    expect(result.current.state.selectedTextId).toBeNull();
  });

  it('moves the ball independently and persists object edits after save and reopen', () => {
    const { result } = renderHook(() => useEditorState(undefined, 'personal', 'new'));

    act(() => {
      result.current.addPlayerAt(20, 30);
      result.current.addTextAt(40, 50);
      result.current.moveBall(64, 28);
    });

    act(() => {
      result.current.setTool('line-run');
    });

    act(() => {
      result.current.addLineFromTool(12, 14, 34, 38);
    });

    let savedProjectId = '';
    act(() => {
      savedProjectId = result.current.saveProject();
    });

    const reopened = renderHook(() => useEditorState(savedProjectId, 'personal', 'project'));

    expect(reopened.result.current.currentStep.players).toHaveLength(1);
    expect(reopened.result.current.currentStep.texts).toHaveLength(1);
    expect(reopened.result.current.currentStep.lines).toHaveLength(1);
    expect(reopened.result.current.currentStep.ball).toMatchObject({
      x: 64,
      y: 28,
    });
  });
});
