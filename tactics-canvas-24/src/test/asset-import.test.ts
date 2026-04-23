import { beforeEach, describe, expect, it, vi } from "vitest";

const getRuntimePlatformMock = vi.fn(() => "web");
const openMock = vi.fn();
const readFileMock = vi.fn();
const invokeMock = vi.fn();

vi.mock("@/lib/platform", () => ({
  getRuntimePlatform: () => getRuntimePlatformMock(),
}));

vi.mock("@tauri-apps/plugin-dialog", () => ({
  open: (...args: unknown[]) => openMock(...args),
}));

vi.mock("@tauri-apps/plugin-fs", () => ({
  readFile: (...args: unknown[]) => readFileMock(...args),
}));

vi.mock("@tauri-apps/api/core", () => ({
  invoke: (...args: unknown[]) => invokeMock(...args),
}));

describe("asset import", () => {
  beforeEach(() => {
    getRuntimePlatformMock.mockReset();
    openMock.mockReset();
    readFileMock.mockReset();
    invokeMock.mockReset();
    getRuntimePlatformMock.mockReturnValue("web");
  });

  it("reports native import as unavailable on web", async () => {
    const { canUseNativeImageImport, pickImageFile } = await import("@/lib/asset-import");

    expect(canUseNativeImageImport()).toBe(false);
    await expect(pickImageFile()).resolves.toEqual({
      status: "failed",
      reason: "Native image import is only available in the Windows desktop and Android runtimes.",
    });
  });

  it("enables native import on android-tauri and persists the imported bytes locally", async () => {
    getRuntimePlatformMock.mockReturnValue("android-tauri");
    openMock.mockResolvedValueOnce("content://media/external/images/media/42");
    readFileMock.mockResolvedValueOnce(
      new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 1, 2, 3]),
    );
    invokeMock.mockResolvedValueOnce({
      path: "/data/user/0/com.kevinrunzhi.tacticboard/files/imported-images/imported-image-1.png",
    });
    const { canUseNativeImageImport, pickImageFile } = await import("@/lib/asset-import");

    expect(canUseNativeImageImport()).toBe(true);
    const result = await pickImageFile();

    expect(openMock).toHaveBeenCalledWith({
      multiple: false,
      directory: false,
      title: "选择图片素材",
      filters: [{ name: "图片", extensions: ["png", "jpg", "jpeg", "webp", "bmp", "gif"] }],
    });
    expect(readFileMock).toHaveBeenCalledWith("content://media/external/images/media/42");
    expect(invokeMock).toHaveBeenCalledWith("persist_imported_image", {
      payload: {
        fileName: "42.png",
        bytes: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 1, 2, 3],
      },
    });
    expect(result.status).toBe("selected");
    if (result.status !== "selected") {
      throw new Error("Expected selected result");
    }
    expect(result.file).toBeInstanceOf(File);
    expect(result.file.name).toBe("42.png");
    expect(result.file.type).toBe("image/png");
  });

  it("returns cancelled when the native dialog is closed", async () => {
    getRuntimePlatformMock.mockReturnValue("windows-tauri");
    openMock.mockResolvedValueOnce(null);
    const { pickImageFile } = await import("@/lib/asset-import");

    await expect(pickImageFile()).resolves.toEqual({ status: "cancelled" });
    expect(readFileMock).not.toHaveBeenCalled();
    expect(invokeMock).not.toHaveBeenCalled();
  });

  it("converts a selected tauri path into a browser-compatible File and persists a local copy", async () => {
    getRuntimePlatformMock.mockReturnValue("windows-tauri");
    openMock.mockResolvedValueOnce("C:/images/reference-board.png");
    readFileMock.mockResolvedValueOnce(new Uint8Array([1, 2, 3]));
    invokeMock.mockResolvedValueOnce({
      path: "C:/Users/Kevin/AppData/Roaming/com.kevinrunzhi.tacticboard/imported-images/reference-board-1.png",
    });
    const { pickImageFile } = await import("@/lib/asset-import");

    const result = await pickImageFile();

    expect(readFileMock).toHaveBeenCalledWith("C:/images/reference-board.png");
    expect(invokeMock).toHaveBeenCalledWith("persist_imported_image", {
      payload: {
        fileName: "reference-board.png",
        bytes: [1, 2, 3],
      },
    });
    expect(result.status).toBe("selected");
    if (result.status !== "selected") {
      throw new Error("Expected selected result");
    }
    expect(result.file).toBeInstanceOf(File);
    expect(result.file.name).toBe("reference-board.png");
    expect(result.file.type).toBe("image/png");
    expect(result.file.size).toBe(3);
  });

  it("returns failed when the local persistence command rejects", async () => {
    getRuntimePlatformMock.mockReturnValue("android-tauri");
    openMock.mockResolvedValueOnce("content://media/external/images/media/42");
    readFileMock.mockResolvedValueOnce(new Uint8Array([0xff, 0xd8, 0xff, 1]));
    invokeMock.mockRejectedValueOnce(new Error("copy failed"));
    const { pickImageFile } = await import("@/lib/asset-import");

    await expect(pickImageFile()).resolves.toEqual({
      status: "failed",
      reason: "copy failed",
    });
  });
});
