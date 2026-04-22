import type { ComponentProps } from "react";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { RightPanel } from "@/components/tactics/RightPanel";
import type { MatchMeta, Player } from "@/types/tactics";

const pickImageFileMock = vi.fn();
const canUseNativeImageImportMock = vi.fn(() => false);

vi.mock("@/lib/asset-import", () => ({
  canUseNativeImageImport: () => canUseNativeImageImportMock(),
  pickImageFile: (...args: unknown[]) => pickImageFileMock(...args),
}));

const matchMeta: MatchMeta = {
  title: "",
  score: "",
  minute: "",
  phaseLabel: "",
};

function renderRightPanel(overrides?: Partial<ComponentProps<typeof RightPanel>>) {
  return render(
    <RightPanel
      projectName="椤圭洰"
      selectedPlayer={null}
      selectedLine={null}
      selectedText={null}
      selectedArea={null}
      playerStyle="dot"
      matchMeta={matchMeta}
      referenceImage={null}
      stepDescription=""
      onProjectNameChange={() => {}}
      onMatchMetaChange={() => {}}
      onStepDescriptionChange={() => {}}
      onPlayerNameChange={() => {}}
      onPlayerNumberChange={() => {}}
      onPlayerPositionChange={() => {}}
      onPlayerTeamChange={() => {}}
      onPlayerAvatarImport={() => {}}
      onPlayerAvatarRemove={() => {}}
      onDeletePlayer={() => {}}
      onTextContentChange={() => {}}
      onTextStyleChange={() => {}}
      onTextXChange={() => {}}
      onTextYChange={() => {}}
      onDeleteText={() => {}}
      onLineTypeChange={() => {}}
      onLineFromXChange={() => {}}
      onLineFromYChange={() => {}}
      onLineToXChange={() => {}}
      onLineToYChange={() => {}}
      onDeleteLine={() => {}}
      onAreaShapeChange={() => {}}
      onAreaWidthChange={() => {}}
      onAreaHeightChange={() => {}}
      onAreaOpacityChange={() => {}}
      onAreaStrokeColorChange={() => {}}
      onAreaFillColorChange={() => {}}
      onDeleteArea={() => {}}
      onReferenceImageImport={() => {}}
      onReferenceImageVisibilityChange={() => {}}
      onReferenceImageOpacityChange={() => {}}
      onReferenceImageScaleChange={() => {}}
      onReferenceImageOffsetXChange={() => {}}
      onReferenceImageOffsetYChange={() => {}}
      onReferenceImageResetTransform={() => {}}
      onReferenceImageRemove={() => {}}
      {...overrides}
    />,
  );
}

describe("right panel image import", () => {
  beforeEach(() => {
    pickImageFileMock.mockReset();
    canUseNativeImageImportMock.mockReset();
    canUseNativeImageImportMock.mockReturnValue(false);
  });

  afterEach(() => {
    cleanup();
  });

  it("uses the native picker for reference image import when available", async () => {
    const importedFiles: File[] = [];
    const file = new File([new Uint8Array([1, 2, 3])], "reference.png", { type: "image/png" });

    canUseNativeImageImportMock.mockReturnValue(true);
    pickImageFileMock.mockResolvedValueOnce({ status: "selected", file });

    renderRightPanel({
      onReferenceImageImport: (nextFile) => {
        importedFiles.push(nextFile);
      },
    });

    fireEvent.touchEnd(screen.getByRole("button", { name: "导入参考底图" }));

    expect(pickImageFileMock).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(importedFiles).toHaveLength(1));
    expect(importedFiles[0]).toBe(file);
  });

  it("uses the native picker for player avatar import when available", async () => {
    const importedFiles: File[] = [];
    const selectedPlayer: Player = {
      id: "player-1",
      name: "娴嬭瘯鐞冨憳",
      number: 9,
      position: "ST",
      team: "home",
      x: 50,
      y: 50,
    };
    const file = new File([new Uint8Array([9, 8, 7])], "avatar.jpg", { type: "image/jpeg" });

    canUseNativeImageImportMock.mockReturnValue(true);
    pickImageFileMock.mockResolvedValueOnce({ status: "selected", file });

    renderRightPanel({
      selectedPlayer,
      onPlayerAvatarImport: (nextFile) => {
        importedFiles.push(nextFile);
      },
    });

    fireEvent.touchEnd(screen.getByRole("button", { name: "导入球员头像" }));

    expect(pickImageFileMock).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(importedFiles).toHaveLength(1));
    expect(importedFiles[0]).toBe(file);
  });

  it("surfaces the primary player delete action below the basic-info rows", () => {
    const selectedPlayer: Player = {
      id: "player-1",
      name: "娴嬭瘯鐞冨憳",
      number: 9,
      position: "ST",
      team: "home",
      x: 50,
      y: 50,
    };

    renderRightPanel({
      selectedPlayer,
    });

    const primaryDeleteButton = screen.getByRole("button", { name: "删除球员" });

    expect(
      screen.getByDisplayValue("ST").compareDocumentPosition(primaryDeleteButton) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).not.toBe(0);
    expect(
      primaryDeleteButton.compareDocumentPosition(screen.getByText("显示样式")) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).not.toBe(0);
  });
});
