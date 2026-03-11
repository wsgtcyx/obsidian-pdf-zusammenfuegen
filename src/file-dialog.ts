import { createSuggestedOutputPath } from "./merge-service";
import { SaveTargetModal } from "./save-target-modal";

type ElectronDialog = {
  showOpenDialog: (options: {
    filters: { name: string; extensions: string[] }[];
    properties: string[];
    title: string;
    buttonLabel: string;
    defaultPath?: string;
  }) => Promise<{ canceled: boolean; filePaths: string[] }>;
  showSaveDialog: (options: {
    filters: { name: string; extensions: string[] }[];
    title: string;
    buttonLabel: string;
    defaultPath?: string;
  }) => Promise<{ canceled: boolean; filePath?: string }>;
};

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
type ElectronModuleShape = {
  dialog?: ElectronDialog;
  remote?: {
    dialog?: ElectronDialog;
  };
};

const getElectronDialog = (): ElectronDialog | null => {
  try {
    const electron = require("electron") as ElectronModuleShape;
    if (electron.remote?.dialog) {
      return electron.remote.dialog;
    }
    if (electron.dialog) {
      return electron.dialog;
    }
  } catch {
    // Ignore and try the next option.
  }

  try {
    const remote = require("@electron/remote") as { dialog?: ElectronDialog };
    if (remote.dialog) {
      return remote.dialog;
    }
  } catch {
    // Ignore fallback error.
  }

  return null;
};

const pickFilesWithInput = async (): Promise<string[]> => {
  const input = document.createElement("input");
  input.type = "file";
  input.multiple = true;
  input.accept = ".pdf,application/pdf";
  input.style.position = "fixed";
  input.style.left = "-9999px";
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
  const dialog = getElectronDialog();
  if (dialog) {
    const result = await dialog.showOpenDialog({
      title: "PDF-Dateien auswählen",
      buttonLabel: "Öffnen",
      filters: [{ name: "PDF-Dateien", extensions: ["pdf"] }],
      properties: ["openFile", "multiSelections"]
    });
    return result.canceled ? [] : result.filePaths;
  }

  return pickFilesWithInput();
};

export const pickSaveTarget = async (
  app: import("obsidian").App,
  inputPaths: string[]
): Promise<SaveTarget | null> => {
  const defaultPath = createSuggestedOutputPath(inputPaths);
  const dialog = getElectronDialog();

  if (dialog) {
    const result = await dialog.showSaveDialog({
      title: "Zusammengeführte PDF speichern",
      buttonLabel: "Speichern",
      defaultPath,
      filters: [{ name: "PDF-Dateien", extensions: ["pdf"] }]
    });
    if (!result.canceled && result.filePath) {
      return { kind: "path", path: result.filePath };
    }
  }

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
