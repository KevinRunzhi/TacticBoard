import { describe, expect, it, vi } from "vitest";

const saveFileMock = vi.fn();

vi.mock("@/lib/file-access", () => ({
  saveFile: (...args: unknown[]) => saveFileMock(...args),
}));

describe("export save", () => {
  it("adds a png extension and png filter when missing", async () => {
    saveFileMock.mockResolvedValueOnce({ status: "saved" });
    const { saveExportBinary } = await import("@/lib/export-save");

    await saveExportBinary({
      fileName: "demo-board",
      format: "png",
      bytes: new Uint8Array([1, 2, 3]),
    });

    expect(saveFileMock).toHaveBeenCalledWith({
      suggestedName: "demo-board.png",
      mimeType: "image/png",
      bytes: new Uint8Array([1, 2, 3]),
      filters: [{ name: "PNG 图像", extensions: ["png"] }],
    });
  });

  it("keeps the gif extension and gif filter when already present", async () => {
    saveFileMock.mockResolvedValueOnce({ status: "saved" });
    const { saveExportBinary } = await import("@/lib/export-save");

    await saveExportBinary({
      fileName: "demo-board.gif",
      format: "gif",
      bytes: new Uint8Array([4, 5, 6]),
    });

    expect(saveFileMock).toHaveBeenCalledWith({
      suggestedName: "demo-board.gif",
      mimeType: "image/gif",
      bytes: new Uint8Array([4, 5, 6]),
      filters: [{ name: "GIF 图像", extensions: ["gif"] }],
    });
  });
});
