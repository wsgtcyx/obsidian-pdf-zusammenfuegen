import { createSuggestedOutputPath } from "./merge-service";
import { SaveTargetModal } from "./save-target-modal";

export type SaveTarget =
  | { kind: "path"; path: string }
  | { kind: "handle"; handle: FileSystemFileHandle };

type SaveFilePickerOptionsLike = {
  suggestedName?: string;
  types?: Array<{
    description?: string;
    accept: Record<string, string[]>;
  }>;
};

type BrowserFileWithPath = File & { path?: string };

const pickFilesWithInput = async (): Promise<string[]> => {
  const input = document.createElement("input");
  input.type = "file";
  input.multiple = true;
  input.accept = ".pdf,application/pdf";
  input.addClass("pdfzus-file-picker-input");
  document.body.appendChild(input);

  const selection = await new Promise<string[]>((resolve) => {
    input.addEventListener(
      "change",
      () => {
        const paths = Array.from(input.files ?? [])
          .map((file) => (file as BrowserFileWithPath).path)
          .filter((value): value is string => typeof value === "string" && value.length > 0);
        resolve(paths);
      },
      { once: true }
    );
    input.click();
  });

  input.remove();
  return selection;
};

export const pickPdfFiles = async (): Promise<string[]> => {
  return pickFilesWithInput();
};

export const pickSaveTarget = async (
  app: import("obsidian").App,
  inputPaths: string[]
): Promise<SaveTarget | null> => {
  const defaultPath = createSuggestedOutputPath(inputPaths);

  if ("showSaveFilePicker" in window) {
    try {
      const showSaveFilePicker = window.showSaveFilePicker as (
        options: SaveFilePickerOptionsLike
      ) => Promise<FileSystemFileHandle>;
      const handle = await showSaveFilePicker({
        suggestedName: defaultPath.split(/[\\/]/).pop(),
        types: [
          {
            description: "PDF-Dateien",
            accept: { "application/pdf": [".pdf"] }
          }
        ]
      });
      return { kind: "handle", handle };
    } catch {
      return null;
    }
  }

  return new Promise<SaveTarget | null>((resolve) => {
    new SaveTargetModal(app, defaultPath, (value) => {
      resolve(value ? { kind: "path", path: value } : null);
    }).open();
  });
};

export const writeToSaveTarget = async (target: SaveTarget, bytes: Uint8Array): Promise<void> => {
  if (target.kind !== "handle") {
    throw new Error("writeToSaveTarget erwartet ein FileSystem-Handle.");
  }

  const writable = await target.handle.createWritable();
  const arrayBuffer = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
  await writable.write(new Blob([arrayBuffer], { type: "application/pdf" }));
  await writable.close();
};
