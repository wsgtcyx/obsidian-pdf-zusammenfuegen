import { basename, dirname, extname, join } from "node:path";
import { readFile, writeFile } from "node:fs/promises";

import { PDFDocument } from "pdf-lib";

export class MergePdfError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MergePdfError";
  }
}

export const validatePdfSelection = (inputPaths: string[]): string[] => {
  if (inputPaths.length < 2) {
    throw new MergePdfError("Bitte wählen Sie mindestens zwei PDF-Dateien aus.");
  }

  const invalidPath = inputPaths.find((filePath) => extname(filePath).toLowerCase() !== ".pdf");
  if (invalidPath) {
    throw new MergePdfError(`Nur PDF-Dateien werden unterstützt: ${basename(invalidPath)}`);
  }

  return inputPaths;
};

export const createSuggestedOutputPath = (inputPaths: string[]): string => {
  const firstPath = inputPaths[0];
  const firstName = basename(firstPath, extname(firstPath));
  return join(dirname(firstPath), `${firstName}-merged.pdf`);
};

export const mergePdfFiles = async (inputPaths: string[]): Promise<Uint8Array> => {
  validatePdfSelection(inputPaths);

  const mergedDocument = await PDFDocument.create();

  for (const inputPath of inputPaths) {
    let fileBytes: Uint8Array;

    try {
      fileBytes = await readFile(inputPath);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Datei konnte nicht gelesen werden.";
      throw new MergePdfError(`Datei konnte nicht gelesen werden: ${basename(inputPath)}. ${message}`);
    }

    let sourceDocument: PDFDocument;

    try {
      sourceDocument = await PDFDocument.load(fileBytes);
    } catch {
      throw new MergePdfError(`Ungültige oder beschädigte PDF-Datei: ${basename(inputPath)}`);
    }

    const copiedPages = await mergedDocument.copyPages(sourceDocument, sourceDocument.getPageIndices());
    copiedPages.forEach((page) => mergedDocument.addPage(page));
  }

  return mergedDocument.save();
};

export const writeMergedPdf = async (targetPath: string, mergedBytes: Uint8Array): Promise<void> => {
  try {
    await writeFile(targetPath, mergedBytes);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Datei konnte nicht gespeichert werden.";
    throw new MergePdfError(`Ausgabedatei konnte nicht gespeichert werden. ${message}`);
  }
};
