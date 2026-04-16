import { getRuntimePlatform } from "@/lib/platform";

export type SaveFileInput = {
  suggestedName: string;
  mimeType: string;
  bytes: Uint8Array;
  filters?: Array<{
    name: string;
    extensions: string[];
  }>;
};

export type SaveFileResult =
  | { status: "saved"; path?: string }
  | { status: "cancelled" }
  | { status: "failed"; reason: string };

function downloadBytes(input: SaveFileInput) {
  const blob = new Blob([input.bytes], { type: input.mimeType });
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = objectUrl;
  link.download = input.suggestedName;
  link.click();
  URL.revokeObjectURL(objectUrl);
}

export async function saveFile(input: SaveFileInput): Promise<SaveFileResult> {
  if (getRuntimePlatform() !== "windows-tauri") {
    downloadBytes(input);
    return { status: "saved" };
  }

  try {
    const [{ save }, { writeFile }] = await Promise.all([
      import("@tauri-apps/plugin-dialog"),
      import("@tauri-apps/plugin-fs"),
    ]);

    const selectedPath = await save({
      defaultPath: input.suggestedName,
      filters: input.filters,
      title: "保存文件",
    });

    if (!selectedPath) {
      return { status: "cancelled" };
    }

    await writeFile(selectedPath, input.bytes);
    return { status: "saved", path: selectedPath };
  } catch (error) {
    const reason = error instanceof Error ? error.message : "Unknown file save error.";
    return { status: "failed", reason };
  }
}
