import { getRuntimePlatform } from "@/lib/platform";

const IMAGE_DIALOG_FILTER = {
  name: "图片",
  extensions: ["png", "jpg", "jpeg", "webp", "bmp", "gif"],
};

const MIME_BY_EXTENSION: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".bmp": "image/bmp",
  ".gif": "image/gif",
};

export type PickImageFileResult =
  | { status: "selected"; file: File }
  | { status: "cancelled" }
  | { status: "failed"; reason: string };

function getExtension(fileName: string) {
  const lastDot = fileName.lastIndexOf(".");
  return lastDot >= 0 ? fileName.slice(lastDot).toLowerCase() : "";
}

function getFileNameFromPath(path: string) {
  const normalized = path.replace(/\\/g, "/");
  const segments = normalized.split("/");
  return segments[segments.length - 1] || "reference-image";
}

function inferMimeType(fileName: string) {
  return MIME_BY_EXTENSION[getExtension(fileName)] ?? "application/octet-stream";
}

export function canUseNativeImageImport() {
  return getRuntimePlatform() === "windows-tauri";
}

export async function pickImageFile(): Promise<PickImageFileResult> {
  if (!canUseNativeImageImport()) {
    return {
      status: "failed",
      reason: "Native image import is only available in the Windows desktop runtime.",
    };
  }

  try {
    const [{ open }, { readFile }] = await Promise.all([
      import("@tauri-apps/plugin-dialog"),
      import("@tauri-apps/plugin-fs"),
    ]);

    const selectedPath = await open({
      multiple: false,
      directory: false,
      title: "选择参考底图",
      filters: [IMAGE_DIALOG_FILTER],
    });

    if (!selectedPath || Array.isArray(selectedPath)) {
      return { status: "cancelled" };
    }

    const fileName = getFileNameFromPath(selectedPath);
    const mimeType = inferMimeType(fileName);
    const bytes = await readFile(selectedPath);
    const file = new File([bytes], fileName, { type: mimeType });

    return {
      status: "selected",
      file,
    };
  } catch (error) {
    return {
      status: "failed",
      reason: error instanceof Error ? error.message : "Unknown image import error.",
    };
  }
}
