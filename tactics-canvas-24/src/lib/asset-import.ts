import { invoke } from "@tauri-apps/api/core";
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

const EXTENSION_BY_MIME: Record<string, string> = {
  "image/png": ".png",
  "image/jpeg": ".jpg",
  "image/webp": ".webp",
  "image/bmp": ".bmp",
  "image/gif": ".gif",
};

const NATIVE_IMPORT_UNAVAILABLE_REASON = "Native image import is only available in the Windows desktop and Android runtimes.";

type PersistImportedImageCommandInput = {
  fileName: string;
  bytes: number[];
};

type PersistImportedImageCommandResult = {
  path?: string;
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
  const lastSegment = normalized.split("/").at(-1)?.trim() ?? "";
  const decodedSegment = decodeURIComponent(lastSegment);
  return decodedSegment && decodedSegment !== "." && decodedSegment !== ".." ? decodedSegment : "imported-image";
}

function inferMimeType(fileName: string) {
  return MIME_BY_EXTENSION[getExtension(fileName)] ?? "application/octet-stream";
}

function sniffMimeType(bytes: Uint8Array) {
  if (
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  ) {
    return "image/png";
  }

  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return "image/jpeg";
  }

  if (
    bytes.length >= 12 &&
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  ) {
    return "image/webp";
  }

  if (bytes.length >= 2 && bytes[0] === 0x42 && bytes[1] === 0x4d) {
    return "image/bmp";
  }

  if (
    bytes.length >= 6 &&
    bytes[0] === 0x47 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x38 &&
    (bytes[4] === 0x37 || bytes[4] === 0x39) &&
    bytes[5] === 0x61
  ) {
    return "image/gif";
  }

  return null;
}

function ensureImportFileName(fileName: string, mimeType: string) {
  const trimmedName = fileName.trim() || "imported-image";
  if (getExtension(trimmedName)) {
    return trimmedName;
  }

  const extension = EXTENSION_BY_MIME[mimeType];
  return extension ? `${trimmedName}${extension}` : trimmedName;
}

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
    return "Unknown image import error.";
  }
}

export function canUseNativeImageImport() {
  const runtimePlatform = getRuntimePlatform();
  return runtimePlatform === "windows-tauri" || runtimePlatform === "android-tauri";
}

async function persistImportedImage(fileName: string, bytes: Uint8Array) {
  const payload: PersistImportedImageCommandInput = {
    fileName,
    bytes: Array.from(bytes),
  };

  const result = await invoke<PersistImportedImageCommandResult>("persist_imported_image", { payload });
  if (!result.path) {
    throw new Error("Imported image was not persisted to local storage.");
  }
}

async function pickNativeImageFile(): Promise<PickImageFileResult> {
  try {
    const [{ open }, { readFile }] = await Promise.all([
      import("@tauri-apps/plugin-dialog"),
      import("@tauri-apps/plugin-fs"),
    ]);

    const selectedPath = await open({
      multiple: false,
      directory: false,
      title: "选择图片素材",
      filters: [IMAGE_DIALOG_FILTER],
    });

    if (!selectedPath || Array.isArray(selectedPath)) {
      return { status: "cancelled" };
    }

    const bytes = await readFile(selectedPath);
    if (!bytes.length) {
      return {
        status: "failed",
        reason: "Selected image file is empty.",
      };
    }

    const sniffedMimeType = sniffMimeType(bytes);
    const fileName = ensureImportFileName(getFileNameFromPath(selectedPath), sniffedMimeType ?? inferMimeType(selectedPath));
    const mimeType = sniffedMimeType ?? inferMimeType(fileName);

    await persistImportedImage(fileName, bytes);

    return {
      status: "selected",
      file: new File([bytes], fileName, { type: mimeType }),
    };
  } catch (error) {
    return {
      status: "failed",
      reason: normalizeBridgeError(error),
    };
  }
}

export async function pickImageFile(): Promise<PickImageFileResult> {
  if (!canUseNativeImageImport()) {
    return {
      status: "failed",
      reason: NATIVE_IMPORT_UNAVAILABLE_REASON,
    };
  }

  return pickNativeImageFile();
}
