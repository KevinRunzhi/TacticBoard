import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { useEditorState } from "@/hooks/useEditorState";

describe("player avatar model", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("persists player avatar state after save and reopen", () => {
    const { result } = renderHook(() => useEditorState(undefined, "personal", "new"));

    act(() => {
      result.current.addPlayerAt(50, 50);
    });

    const createdPlayerId = result.current.currentStep.players[0]?.id;
    expect(createdPlayerId).toBeTruthy();

    act(() => {
      result.current.selectPlayer(createdPlayerId ?? null);
      result.current.updateSelectedPlayer((player) => ({
        ...player,
        name: "头像球员",
        avatarLocalUri: "data:image/png;base64,ZmFrZS1hdmF0YXI=",
      }));
    });

    let savedProjectId = "";
    act(() => {
      savedProjectId = result.current.saveProject();
    });

    const reopened = renderHook(() => useEditorState(savedProjectId, "personal", "project"));
    const reopenedPlayer = reopened.result.current.state.steps[0]?.players[0];

    expect(reopenedPlayer?.name).toBe("头像球员");
    expect(reopenedPlayer?.avatarLocalUri).toBe("data:image/png;base64,ZmFrZS1hdmF0YXI=");
  });
});
