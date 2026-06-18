import sharp from "sharp";
import { createWorker, type Worker } from "tesseract.js";
import path from "path";
import fs from "fs";
import { createRequire } from "module";

const require = createRequire(import.meta.url);

// Locally bundled English traineddata (see tessdata/), so the (large) language
// model is read from disk instead of downloaded from a CDN at runtime.
const LANG_PATH = path.join(process.cwd(), "tessdata");

function resolveSafe(id: string): string | undefined {
  try {
    return require.resolve(id);
  } catch {
    return undefined;
  }
}

// Explicitly resolve tesseract.js' Node worker script + wasm core from
// node_modules. Without this, the bundled server context mis-resolves the
// worker path (e.g. to .next/worker-script/...) and the OCR worker crashes.
const NODE_WORKER = resolveSafe("tesseract.js/src/worker-script/node/index.js");
const CORE_DIR = (() => {
  const idx = resolveSafe("tesseract.js-core/index.js");
  return idx ? path.dirname(idx) : undefined;
})();

let workerPromise: Promise<Worker> | null = null;

async function getWorker(): Promise<Worker> {
  if (!workerPromise) {
    workerPromise = (async () => {
      const hasLocalLang = fs.existsSync(path.join(LANG_PATH, "eng.traineddata"));

      const options: Record<string, unknown> = {
        gzip: false,
        cacheMethod: "none",
      };
      if (hasLocalLang) options.langPath = LANG_PATH;
      if (NODE_WORKER) options.workerPath = NODE_WORKER;
      if (CORE_DIR) options.corePath = CORE_DIR;

      const worker = await createWorker("eng", 1, options as any);
      return worker;
    })();
  }
  return workerPromise;
}

/**
 * Preprocess an image buffer for OCR: grayscale + normalize + contrast boost.
 * The JS equivalent of grayscale/denoise/threshold.
 */
export async function preprocessImage(buffer: Buffer): Promise<Buffer> {
  return sharp(buffer)
    .rotate() // honor EXIF orientation
    .grayscale()
    .normalize()
    .linear(1.25, -20) // contrast boost
    .sharpen()
    .toFormat("png")
    .toBuffer();
}

/**
 * Run the full OCR pipeline and return the raw recognized text.
 */
export async function runOcr(buffer: Buffer): Promise<string> {
  const processed = await preprocessImage(buffer);
  const worker = await getWorker();
  const {
    data: { text },
  } = await worker.recognize(processed);
  return text;
}
