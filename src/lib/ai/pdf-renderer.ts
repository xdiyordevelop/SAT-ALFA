// Polyfill Promise.withResolvers for Node.js < 21.6 / 22 environments
if (typeof (Promise as any).withResolvers === 'undefined') {
  (Promise as any).withResolvers = function <T>() {
    let resolve!: (value: T | PromiseLike<T>) => void;
    let reject!: (reason?: any) => void;
    const promise = new Promise<T>((res, rej) => {
      resolve = res;
      reject = rej;
    });
    return { promise, resolve, reject };
  };
}

import { createCanvas, type Canvas } from 'canvas';
import fs from 'fs';
import path from 'path';

// pdfjs-dist legacy build for Node.js (no DOM required)
// @ts-ignore — legacy build has no types
import * as pdfjsLegacy from 'pdfjs-dist/legacy/build/pdf.mjs';

const pdfjsLib = pdfjsLegacy as any;

export interface BoundingBox {
  ymin: number; // 0-1000
  xmin: number; // 0-1000
  ymax: number; // 0-1000
  xmax: number; // 0-1000
}

export interface RenderedPage {
  buffer: Buffer;
  width: number;
  height: number;
}

import { execFile } from 'child_process';
import { promisify } from 'util';
import os from 'os';

const execFileAsync = promisify(execFile);

/**
 * Render a single PDF page to a PNG buffer.
 * Primary engine: Ghostscript (gs) — ultra-fast, handles all scanned/corrupted PDFs and embedded images.
 * Fallback engine: pdfjs-dist + canvas.
 * @param pdfPath - Absolute path to the PDF file on disk
 * @param pageNumber - 1-based page number
 * @param dpi - Resolution DPI (150 is ideal for web/sharp SAT diagrams, 200 for ultra-high)
 */
export async function renderPdfPage(
  pdfPath: string,
  pageNumber: number,
  dpiOrScale: number = 150
): Promise<RenderedPage> {
  // If scale like 2.0 or 3.0 is passed, convert to DPI (scale * 72)
  const dpi = dpiOrScale <= 10 ? Math.round(dpiOrScale * 72) : dpiOrScale;
  const { loadImage } = await import('canvas');

  // Try Ghostscript first (standard on Linux/servers, 10x faster, zero missing WASM issues)
  try {
    const tempOutputFile = path.join(os.tmpdir(), `sat_page_${Date.now()}_${pageNumber}.png`);
    const gsArgs = [
      '-dSAFER',
      '-dBATCH',
      '-dNOPAUSE',
      '-sDEVICE=png16m',
      `-r${dpi}`,
      `-dFirstPage=${pageNumber}`,
      `-dLastPage=${pageNumber}`,
      `-sOutputFile=${tempOutputFile}`,
      pdfPath,
    ];

    await execFileAsync('gs', gsArgs);

    if (fs.existsSync(tempOutputFile)) {
      const buffer = await fs.promises.readFile(tempOutputFile);
      await fs.promises.unlink(tempOutputFile).catch(() => {});

      const img = await loadImage(buffer);
      return { buffer, width: img.width, height: img.height };
    }
  } catch (gsErr: any) {
    console.warn('[PDFRenderer] Ghostscript render failed or not found, falling back to pdfjs:', gsErr.message);
  }

  // Fallback: pdfjs-dist + canvas
  const data = new Uint8Array(await fs.promises.readFile(pdfPath));
  const doc = await pdfjsLib.getDocument({ data, useSystemFonts: true }).promise;

  if (pageNumber < 1 || pageNumber > doc.numPages) {
    throw new Error(`Page ${pageNumber} out of range (1-${doc.numPages})`);
  }

  const page = await doc.getPage(pageNumber);
  const viewport = page.getViewport({ scale: dpi / 72 });

  const canvas = createCanvas(viewport.width, viewport.height) as any as Canvas;
  const ctx = canvas.getContext('2d');

  await page.render({
    canvasContext: ctx as any,
    viewport,
  }).promise;

  const buffer = canvas.toBuffer('image/png');

  page.cleanup();
  await doc.cleanup();
  await doc.destroy();

  return { buffer, width: viewport.width, height: viewport.height };
}

/**
 * Crop a region from a PNG buffer using 0-1000 coordinate bounding box.
 * This is the same coordinate system Gemini uses for spatial object detection.
 * @param pngBuffer - Source PNG image buffer
 * @param bbox - Bounding box in 0-1000 coordinates
 * @param paddingPercent - Extra padding around the crop (0.03 = 3%)
 */
export async function cropImageFromBuffer(
  pngBuffer: Buffer,
  bbox: BoundingBox,
  paddingPercent: number = 0.03
): Promise<Buffer> {
  // Load the source image into a canvas to get dimensions
  const { loadImage } = await import('canvas');
  const img = await loadImage(pngBuffer);
  const srcW = img.width;
  const srcH = img.height;

  // Convert 0-1000 coordinates to pixel coordinates with padding
  const padY = (bbox.ymax - bbox.ymin) * paddingPercent;
  const padX = (bbox.xmax - bbox.xmin) * paddingPercent;

  const ymin = Math.max(0, ((bbox.ymin - padY) / 1000) * srcH);
  const xmin = Math.max(0, ((bbox.xmin - padX) / 1000) * srcW);
  const ymax = Math.min(srcH, ((bbox.ymax + padY) / 1000) * srcH);
  const xmax = Math.min(srcW, ((bbox.xmax + padX) / 1000) * srcW);

  const cropW = Math.max(1, Math.round(xmax - xmin));
  const cropH = Math.max(1, Math.round(ymax - ymin));

  const canvas = createCanvas(cropW, cropH);
  const ctx = canvas.getContext('2d');

  // White background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, cropW, cropH);

  // Draw the cropped region
  ctx.drawImage(
    img as any,
    Math.round(xmin), Math.round(ymin), cropW, cropH,
    0, 0, cropW, cropH
  );

  return canvas.toBuffer('image/png');
}

/**
 * Save a PNG buffer as a question image file.
 * @returns URL path like `/uploads/questions/q-123456-abc.png`
 */
export async function saveQuestionImage(
  pngBuffer: Buffer,
  questionId: string
): Promise<string> {
  const questionsDir = path.join(process.cwd(), 'public', 'uploads', 'questions');
  await fs.promises.mkdir(questionsDir, { recursive: true });

  const filename = `q-${Date.now()}-${questionId.slice(0, 8)}.png`;
  const filePath = path.join(questionsDir, filename);

  await fs.promises.writeFile(filePath, pngBuffer);
  console.log(`[PDFRenderer] Saved question image: ${filePath} (${(pngBuffer.length / 1024).toFixed(1)} KB)`);

  return `/uploads/questions/${filename}`;
}
