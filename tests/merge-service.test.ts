import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { PDFDocument } from "pdf-lib";

import {
  createSuggestedOutputPath,
  MergePdfError,
  mergePdfFiles,
  validatePdfSelection,
  writeMergedPdf
} from "../src/merge-service";

const createFixturePdf = async (outputPath: string, pageCount: number): Promise<void> => {
  const document = await PDFDocument.create();
  for (let index = 0; index < pageCount; index += 1) {
    document.addPage([595.28, 841.89]);
  }
  await writeFile(outputPath, await document.save());
};

test("mergePdfFiles merges pages from multiple PDFs", async () => {
  const root = await mkdtemp(join(tmpdir(), "pdfzus-merge-"));
  const first = join(root, "eins.pdf");
  const second = join(root, "zwei.pdf");
  const output = join(root, "merged.pdf");

  await createFixturePdf(first, 1);
  await createFixturePdf(second, 2);

  const mergedBytes = await mergePdfFiles([first, second]);
  await writeMergedPdf(output, mergedBytes);

  const mergedDocument = await PDFDocument.load(await readFile(output));
  assert.equal(mergedDocument.getPageCount(), 3);
});

test("validatePdfSelection rejects selections with fewer than two files", () => {
  assert.throws(() => validatePdfSelection(["/tmp/eins.pdf"]), MergePdfError);
});

test("validatePdfSelection rejects non-pdf files", () => {
  assert.throws(() => validatePdfSelection(["/tmp/eins.pdf", "/tmp/zwei.txt"]), MergePdfError);
});

test("mergePdfFiles rejects corrupt pdf data", async () => {
  const root = await mkdtemp(join(tmpdir(), "pdfzus-corrupt-"));
  const valid = join(root, "valid.pdf");
  const corrupt = join(root, "kaputt.pdf");

  await createFixturePdf(valid, 1);
  await writeFile(corrupt, "keine pdf", "utf8");

  await assert.rejects(() => mergePdfFiles([valid, corrupt]), MergePdfError);
});

test("createSuggestedOutputPath keeps unicode and spaces stable", () => {
  const result = createSuggestedOutputPath(["/tmp/Bewerbung März 2026.pdf", "/tmp/Zeugnis.pdf"]);
  assert.equal(result, "/tmp/Bewerbung März 2026-merged.pdf");
});
