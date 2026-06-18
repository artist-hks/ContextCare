import { spawn } from "child_process";
import { randomBytes } from "crypto";
import fs from "fs/promises";
import os from "os";
import path from "path";

export interface PdfMetric {
  label: string;
  value: number;
  unit: string;
  refMin: number;
  refMax: number;
  status: string;
}
export interface PdfNote {
  content: string;
  createdAt: string;
}
export interface PdfData {
  doctorName: string;
  specialization?: string | null;
  patientName: string;
  reportDate: string;
  metrics: PdfMetric[];
  notes: PdfNote[];
}

/**
 * Render the clinical PDF by invoking a standalone Node script in a clean
 * child process. @react-pdf/renderer's async yoga-layout WASM init does not
 * survive Next.js/webpack bundling, so we keep it fully out of the bundle.
 */
export async function buildPdf(data: PdfData): Promise<Buffer> {
  const tmp = os.tmpdir();
  const id = randomBytes(8).toString("hex");
  const inPath = path.join(tmp, `cc-pdf-in-${id}.json`);
  const outPath = path.join(tmp, `cc-pdf-out-${id}.pdf`);
  const script = path.join(process.cwd(), "scripts", "render-pdf.mjs");

  await fs.writeFile(inPath, JSON.stringify(data), "utf8");

  try {
    await new Promise<void>((resolve, reject) => {
      const child = spawn(process.execPath, [script, inPath, outPath], {
        stdio: ["ignore", "ignore", "pipe"],
      });
      let stderr = "";
      child.stderr.on("data", (d) => (stderr += d.toString()));
      child.on("error", reject);
      child.on("close", (code) => {
        if (code === 0) resolve();
        else reject(new Error(`PDF render exited with ${code}: ${stderr}`));
      });
    });

    return await fs.readFile(outPath);
  } finally {
    fs.unlink(inPath).catch(() => {});
    fs.unlink(outPath).catch(() => {});
  }
}
