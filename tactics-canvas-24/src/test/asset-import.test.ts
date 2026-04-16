import { beforeEach, describe, expect, it, vi } from "vitest";

const getRuntimePlatformMock = vi.fn(() => "web");
const openMock = vi.fn();
const readFileMock = vi.fn();

vi.mock("@/lib/platform", () => ({
  getRuntimePlatform: () => getRuntimePlatformMock(),
}));

vi.mock("@tauri-apps/plugin-dialog", () => ({
  open: (...args: unknown[]) => openMock(...args),
}));

vi.mock("@tauri-apps/plugin-fs", () => ({
  readFile: (...args: unknown[]) => readFileMock(...args),
}));

describe("asset import", () => {
  beforeEach(() => {
    getRuntimePlatformMock.mockReset();
    openMock.mockReset();
    readFileMock.mockReset();
    getRuntimePlatformMock.mockReturnValue("web");
  });

  it("reports native import as unavailable on web", async () => {
    const { canUseNativeImageImport, pickImageFile } = await import("@/lib/asset-import");

    expect(canUseNativeImageImport()).toBe(false);
    await expect(pickImageFile()).resolves.toEqual({
      status: "failed",
      reason: "Native image import is only available in the Windows desktop runtime.",
    });
  });

  it("returns cancelled when the native dialog is closed", async () => {
    getRuntimePlatformMock.mockReturnValue("windows-tauri");
    openMock.mockResolvedValueOnce(null);
    const { pickImageFile } = await import("@/lib/asset-import");

    await expect(pickImageFile()).resolves.toEqual({ status: "cancelled" });
  });

  it("converts a selected tauri path into a browser-compatible File", async () => {
    getRuntimePlatformMock.mockReturnValue("windows-tauri");
    openMock.mockResolvedValueOnce("C:/images/reference-board.png");
    readFileMock.mockResolvedValueOnce(new Uint8Array([1, 2, 3]));
    const { pickImageFile } = await import("@/lib/asset-import");

    const result = await pickImageFile();

    expect(readFileMock).toHaveBeenCalledWith("C:/images/reference-board.png");
    expect(result.status).toBe("selected");
    if (result.status !== "selected") {
      throw new Error("Expected selected result");
    }
    expect(result.file).toBeInstanceOf(File);
    expect(result.file.name).toBe("reference-board.png");
    expect(result.file.type).toBe("image/png");
    expect(result.file.size).toBe(3);
  });
});
