import { beforeEach, describe, expect, it, vi } from "vitest";

const saveFileMock = vi.fn();
const invokeMock = vi.fn();
const getRuntimePlatformMock = vi.fn(() => "web");

vi.mock("@/lib/file-access", () => ({
  saveFile: (...args: unknown[]) => saveFileMock(...args),
}));

vi.mock("@tauri-apps/api/core", () => ({
  invoke: (...args: unknown[]) => invokeMock(...args),
}));

vi.mock("@/lib/platform", () => ({
  getRuntimePlatform: () => getRuntimePlatformMock(),
}));

describe("export save", () => {
  beforeEach(() => {
    saveFileMock.mockReset();
    invokeMock.mockReset();
    getRuntimePlatformMock.mockReset();
    getRuntimePlatformMock.mockReturnValue("web");
  });

  it("uses save semantics outside android-tauri", async () => {
    saveFileMock.mockResolvedValueOnce({ status: "saved" });
    getRuntimePlatformMock.mockReturnValue("web");
    const { saveExportBinary } = await import("@/lib/export-save");

    await saveExportBinary({
      fileName: "demo-board",
      format: "png",
      bytes: new Uint8Array([1, 2, 3]),
    });

    expect(invokeMock).not.toHaveBeenCalled();
    expect(saveFileMock).toHaveBeenCalledWith({
      suggestedName: "demo-board.png",
      mimeType: "image/png",
      bytes: new Uint8Array([1, 2, 3]),
      filters: [{ name: "PNG 图像", extensions: ["png"] }],
    });
  });

  it("adds a png extension and png filter when missing", async () => {
    saveFileMock.mockResolvedValueOnce({ status: "saved" });
    getRuntimePlatformMock.mockReturnValue("windows-tauri");
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
    getRuntimePlatformMock.mockReturnValue("windows-tauri");
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

  it("switches android png exports onto the share command and returns shared semantics", async () => {
    getRuntimePlatformMock.mockReturnValue("android-tauri");
    invokeMock.mockResolvedValueOnce({ path: "/data/user/0/com.kevinrunzhi.tacticboard/cache/export-share/demo-board.png" });
    invokeMock.mockResolvedValueOnce(undefined);
    const { saveExportBinary } = await import("@/lib/export-save");

    const result = await saveExportBinary({
      fileName: "demo-board",
      format: "png",
      bytes: new Uint8Array([7, 8, 9]),
    });

    expect(saveFileMock).not.toHaveBeenCalled();
    expect(invokeMock).toHaveBeenNthCalledWith(1, "prepare_share_export_binary", {
      payload: {
        fileName: "demo-board.png",
        bytes: [7, 8, 9],
      },
    });
    expect(invokeMock).toHaveBeenNthCalledWith(2, "share_export_file", {
      payload: {
        path: "/data/user/0/com.kevinrunzhi.tacticboard/cache/export-share/demo-board.png",
        mimeType: "image/png",
      },
    });
    expect(result).toEqual({
      status: "shared",
      path: "/data/user/0/com.kevinrunzhi.tacticboard/cache/export-share/demo-board.png",
    });
  });

  it("returns failed when the android share command rejects", async () => {
    getRuntimePlatformMock.mockReturnValue("android-tauri");
    invokeMock.mockRejectedValueOnce(new Error("share sheet unavailable"));
    const { saveExportBinary } = await import("@/lib/export-save");

    const result = await saveExportBinary({
      fileName: "demo-board",
      format: "png",
      bytes: new Uint8Array([2, 4, 6]),
    });

    expect(result).toEqual({
      status: "failed",
      reason: "share sheet unavailable",
    });
  });

  it("returns failed when android share preparation does not return a cache path", async () => {
    getRuntimePlatformMock.mockReturnValue("android-tauri");
    invokeMock.mockResolvedValueOnce({});
    const { saveExportBinary } = await import("@/lib/export-save");

    const result = await saveExportBinary({
      fileName: "demo-board",
      format: "png",
      bytes: new Uint8Array([2, 4, 6]),
    });

    expect(result).toEqual({
      status: "failed",
      reason: "Android share export did not return a cache path.",
    });
    expect(invokeMock).toHaveBeenCalledTimes(1);
  });

  it("fails android gif exports instead of falling back to browser download semantics", async () => {
    getRuntimePlatformMock.mockReturnValue("android-tauri");
    const { saveExportBinary } = await import("@/lib/export-save");

    const result = await saveExportBinary({
      fileName: "demo-board",
      format: "gif",
      bytes: new Uint8Array([5, 4, 3]),
    });

    expect(result).toEqual({
      status: "failed",
      reason: "Android 当前仅支持 PNG 系统分享导出。",
    });
    expect(saveFileMock).not.toHaveBeenCalled();
    expect(invokeMock).not.toHaveBeenCalled();
  });
});
