import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { RightPanel } from "@/components/tactics/RightPanel";
import type { MatchMeta } from "@/types/tactics";

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

describe("right panel reference image import", () => {
  beforeEach(() => {
    pickImageFileMock.mockReset();
    canUseNativeImageImportMock.mockReset();
    canUseNativeImageImportMock.mockReturnValue(false);
  });

  afterEach(() => {
    cleanup();
  });

  it("uses the native Windows picker when available", async () => {
    const importedFiles: File[] = [];
    const file = new File([new Uint8Array([1, 2, 3])], "reference.png", { type: "image/png" });

    canUseNativeImageImportMock.mockReturnValue(true);
    pickImageFileMock.mockResolvedValueOnce({ status: "selected", file });

    render(
      <RightPanel
        projectName="项目"
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
        onReferenceImageImport={(nextFile) => {
          importedFiles.push(nextFile);
        }}
        onReferenceImageVisibilityChange={() => {}}
        onReferenceImageOpacityChange={() => {}}
        onReferenceImageScaleChange={() => {}}
        onReferenceImageOffsetXChange={() => {}}
        onReferenceImageOffsetYChange={() => {}}
        onReferenceImageResetTransform={() => {}}
        onReferenceImageRemove={() => {}}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /导入参考底图/i }));

    expect(pickImageFileMock).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(importedFiles).toHaveLength(1));
    expect(importedFiles[0]).toBe(file);
  });
});
