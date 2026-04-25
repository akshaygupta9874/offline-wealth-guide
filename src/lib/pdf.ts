import * as pdfjsLib from "pdfjs-dist";
// Vite worker import — bundles the worker correctly
import PdfWorker from "pdfjs-dist/build/pdf.worker.min.mjs?worker";

// Initialize worker once
pdfjsLib.GlobalWorkerOptions.workerPort = new PdfWorker();

export type PdfStatus =
  | { kind: "ok"; pageCount: number }
  | { kind: "needs_password" }
  | { kind: "wrong_password" }
  | { kind: "invalid" };

/**
 * Try to open a PDF. If `password` is provided, attempt to unlock with it.
 * Returns a discriminated status so the UI can react accordingly.
 */
export async function probePdf(file: File, password?: string): Promise<PdfStatus> {
  try {
    const buf = await file.arrayBuffer();
    const task = pdfjsLib.getDocument({
      data: new Uint8Array(buf),
      password: password ?? "",
    });

    const doc = await task.promise;
    const pageCount = doc.numPages;
    await doc.destroy();
    return { kind: "ok", pageCount };
  } catch (err: unknown) {
    const e = err as { name?: string; code?: number; message?: string };
    // pdf.js password errors
    // PasswordException codes: 1 = NEED_PASSWORD, 2 = INCORRECT_PASSWORD
    if (e?.name === "PasswordException") {
      if (e.code === 2) return { kind: "wrong_password" };
      return { kind: "needs_password" };
    }
    return { kind: "invalid" };
  }
}
