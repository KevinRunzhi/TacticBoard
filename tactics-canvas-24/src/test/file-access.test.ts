import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { saveFile } from "@/lib/file-access";

const saveDialogMock = vi.fn();
const writeFileMock = vi.fn();
const getRuntimePlatformMock = vi.fn(() => "web");

vi.mock("@/lib/platform", () => ({
  getRuntimePlatform: () => getRuntimePlatformMock(),
}));

vi.mock("@tauri-apps/plugin-dialog", () => ({
  save: (...args: unknown[]) => saveDialogMock(...args),
}));

vi.mock("@tauri-apps/plugin-fs", () => ({
  writeFile: (...args: unknown[]) => writeFileMock(...args),
}));

describe("file access", () => {
  const originalCreateObjectURL = URL.createObjectURL;
  const originalRevokeObjectURL = URL.revokeObjectURL;
  const originalCreateElement = document.createElement.bind(document);
  const clickSpy = vi.fn();

  beforeEach(() => {
    clickSpy.mockReset();
    saveDialogMock.mockReset();
    writeFileMock.mockReset();
    getRuntimePlatformMock.mockReset();
    getRuntimePlatformMock.mockReturnValue("web");

    Object.defineProperty(URL, "createObjectURL", {
      configurable: true,
      writable: true,
      value: vi.fn(() => "blob:test"),
    });
    Object.defineProperty(URL, "revokeObjectURL", {
      configurable: true,
      writable: true,
      value: vi.fn(() => undefined),
    });

    vi.spyOn(document, "createElement").mockImplementation(((tagName: string) => {
      if (tagName === "a") {
        return {
          click: clickSpy,
          href: "",
          download: "",
        } as unknown as HTMLAnchorElement;
      }

      return originalCreateElement(tagName);
    }) as typeof document.createElement);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    Object.defineProperty(URL, "createObjectURL", {
      configurable: true,
      writable: true,
      value: originalCreateObjectURL,
    });
    Object.defineProperty(URL, "revokeObjectURL", {
      configurable: true,
      writable: true,
      value: originalRevokeObjectURL,
    });
  });

  it("downloads bytes in web mode", async () => {
    const result = await saveFile({
      suggestedName: "demo.png",
      mimeType: "image/png",
      bytes: new Uint8Array([1, 2, 3]),
    });

    expect(result).toEqual({ status: "saved" });
    expect(URL.createObjectURL).toHaveBeenCalledTimes(1);
    expect(clickSpy).toHaveBeenCalledTimes(1);
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:test");
  });

  it("keeps android-tauri on the non-native download path until slice 3 replaces the result semantics", async () => {
    getRuntimePlatformMock.mockReturnValue("android-tauri");

    const result = await saveFile({
      suggestedName: "demo.png",
      mimeType: "image/png",
      bytes: new Uint8Array([9, 8, 7]),
    });

    expect(result).toEqual({ status: "saved" });
    expect(URL.createObjectURL).toHaveBeenCalledTimes(1);
    expect(clickSpy).toHaveBeenCalledTimes(1);
    expect(saveDialogMock).not.toHaveBeenCalled();
    expect(writeFileMock).not.toHaveBeenCalled();
  });

  it("returns cancelled when the tauri save dialog is closed", async () => {
    getRuntimePlatformMock.mockReturnValue("windows-tauri");
    saveDialogMock.mockResolvedValueOnce(null);

    const result = await saveFile({
      suggestedName: "demo.png",
      mimeType: "image/png",
      bytes: new Uint8Array([1, 2, 3]),
      filters: [{ name: "PNG 图像", extensions: ["png"] }],
    });

    expect(result).toEqual({ status: "cancelled" });
    expect(saveDialogMock).toHaveBeenCalledWith({
      defaultPath: "demo.png",
      filters: [{ name: "PNG 图像", extensions: ["png"] }],
      title: "保存文件",
    });
    expect(writeFileMock).not.toHaveBeenCalled();
  });

  it("writes bytes to the selected tauri path", async () => {
    getRuntimePlatformMock.mockReturnValue("windows-tauri");
    saveDialogMock.mockResolvedValueOnce("C:/exports/demo.gif");
    writeFileMock.mockResolvedValueOnce(undefined);

    const bytes = new Uint8Array([4, 5, 6]);
    const result = await saveFile({
      suggestedName: "demo.gif",
      mimeType: "image/gif",
      bytes,
      filters: [{ name: "GIF 图像", extensions: ["gif"] }],
    });

    expect(writeFileMock).toHaveBeenCalledWith("C:/exports/demo.gif", bytes);
    expect(result).toEqual({ status: "saved", path: "C:/exports/demo.gif" });
  });

  it("returns failed when tauri writeFile throws", async () => {
    getRuntimePlatformMock.mockReturnValue("windows-tauri");
    saveDialogMock.mockResolvedValueOnce("C:/exports/demo.png");
    writeFileMock.mockRejectedValueOnce(new Error("disk full"));

    const result = await saveFile({
      suggestedName: "demo.png",
      mimeType: "image/png",
      bytes: new Uint8Array([7, 8, 9]),
    });

    expect(result).toEqual({ status: "failed", reason: "disk full" });
  });
});
