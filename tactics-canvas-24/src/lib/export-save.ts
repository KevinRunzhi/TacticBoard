import { invoke } from "@tauri-apps/api/core";
import { saveFile, type SaveFileResult } from "@/lib/file-access";
import { getRuntimePlatform } from "@/lib/platform";

type ExportBinary = {
  fileName: string;
  format: "png" | "gif";
  bytes: Uint8Array;
};

export type ExportSaveResult = SaveFileResult | { status: "shared"; path?: string };

type ShareExportCommandInput = {
  fileName: string;
  bytes: number[];
};

type ShareExportCommandResult = {
  path?: string;
};

type ShareExportFileCommandInput = {
  path: string;
  mimeType: string;
};

function normalizeBridgeError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  try {
    return JSON.stringify(error);
  } catch {
    return "Unknown Android share error.";
  }
}

function ensureExtension(fileName: string, extension: "png" | "gif") {
  return fileName.toLowerCase().endsWith(`.${extension}`) ? fileName : `${fileName}.${extension}`;
}

async function shareExportBinary(binary: ExportBinary): Promise<ExportSaveResult> {
  if (binary.format !== "png") {
    return {
      status: "failed",
      reason: "Android 当前仅支持 PNG 系统分享导出。",
    };
  }

  try {
    const payload: ShareExportCommandInput = {
      fileName: ensureExtension(binary.fileName, binary.format),
      bytes: Array.from(binary.bytes),
    };
    const result = await invoke<ShareExportCommandResult>("prepare_share_export_binary", { payload });
    if (!result.path) {
      return {
        status: "failed",
        reason: "Android share export did not return a cache path.",
      };
    }

    const sharePayload: ShareExportFileCommandInput = {
      path: result.path,
      mimeType: "image/png",
    };
    await invoke("share_export_file", { payload: sharePayload });

    return { status: "shared", path: result.path };
  } catch (error) {
    return { status: "failed", reason: normalizeBridgeError(error) };
  }
}

export async function saveExportBinary(binary: ExportBinary): Promise<ExportSaveResult> {
  if (getRuntimePlatform() === "android-tauri") {
    return shareExportBinary(binary);
  }

  return saveFile({
    suggestedName: ensureExtension(binary.fileName, binary.format),
    mimeType: binary.format === "gif" ? "image/gif" : "image/png",
    bytes: binary.bytes,
    filters: [
      {
        name: binary.format === "gif" ? "GIF 图像" : "PNG 图像",
        extensions: [binary.format],
      },
    ],
  });
}
