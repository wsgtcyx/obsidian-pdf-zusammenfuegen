import { Notice, Plugin } from "obsidian";

import { pickPdfFiles, pickSaveTarget, type SaveTarget } from "./file-dialog";
import {
  createSuggestedOutputPath,
  MergePdfError,
  mergePdfFiles,
  validatePdfSelection,
  writeMergedPdf
} from "./merge-service";
import { OrderPdfModal } from "./order-modal";

const COMMAND_ID = "merge-pdf-files";

const orderPdfFiles = async (plugin: Plugin, inputPaths: string[]): Promise<string[] | null> =>
  new Promise((resolve) => {
    new OrderPdfModal(plugin.app, inputPaths, resolve).open();
  });

const saveMergedBytes = async (
  target: SaveTarget,
  mergedBytes: Uint8Array,
  fallbackWriter: (target: SaveTarget, bytes: Uint8Array) => Promise<void>
): Promise<void> => {
  if (target.kind === "path") {
    await writeMergedPdf(target.path, mergedBytes);
    return;
  }

  await fallbackWriter(target, mergedBytes);
};

export default class PdfZusMergePlugin extends Plugin {
  onload(): void {
    this.addCommand({
      id: COMMAND_ID,
      name: "Zusammenführen",
      callback: async () => {
        await this.runMergeFlow();
      }
    });
  }

  private async runMergeFlow(): Promise<void> {
    try {
      const selectedFiles = validatePdfSelection(await pickPdfFiles());
      const orderedFiles = await orderPdfFiles(this, selectedFiles);
      if (!orderedFiles) {
        return;
      }

      const target = await pickSaveTarget(this.app, orderedFiles);
      if (!target) {
        return;
      }

      const mergedBytes = await mergePdfFiles(orderedFiles);
      const { writeToSaveTarget } = await import("./file-dialog");
      await saveMergedBytes(target, mergedBytes, writeToSaveTarget);

      new Notice(`PDF-Dateien erfolgreich gespeichert: ${this.getTargetLabel(target, orderedFiles)}`);
    } catch (error) {
      const message = error instanceof MergePdfError
        ? error.message
        : error instanceof Error
          ? error.message
          : "Unbekannter Fehler beim Zusammenfügen.";
      new Notice(message, 8000);
    }
  }

  private getTargetLabel(target: SaveTarget, orderedFiles: string[]): string {
    if (target.kind === "path") {
      return target.path;
    }

    return createSuggestedOutputPath(orderedFiles);
  }
}
