import { saveFile, type SaveFileResult } from "@/lib/file-access";

type ExportBinary = {
  fileName: string;
  format: "png" | "gif";
  bytes: Uint8Array;
};

function ensureExtension(fileName: string, extension: "png" | "gif") {
  return fileName.toLowerCase().endsWith(`.${extension}`) ? fileName : `${fileName}.${extension}`;
}

export async function saveExportBinary(binary: ExportBinary): Promise<SaveFileResult> {
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
