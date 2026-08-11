// Image processing pipeline.
//
// Every source image is compressed ONCE into three derivatives:
//   - thumb.webp : small, used in galleries, project grids and previews
//   - full.webp  : larger, loaded only when a photo is actually opened
//   - lqip       : a tiny inline base64 blur placeholder shown instantly
//
// Derivatives live under server/media/<id>/ and are described in the
// manifest so we never re-process the same source twice.

import sharp from 'sharp';
import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const MEDIA_DIR = path.join(__dirname, '..', 'media');
// Originals shipped with the repo live in the sibling /images folder.
export const ORIGINALS_DIR = path.join(__dirname, '..', '..', 'images');

const THUMB_WIDTH = 700; // gallery + preview resolution
const FULL_WIDTH = 2200; // lightbox resolution
const LQIP_WIDTH = 20; // inline blur placeholder

sharp.cache(false);
sharp.concurrency(2);

export function mediaId(seed) {
  return crypto.createHash('sha1').update(seed).digest('hex').slice(0, 16);
}

async function exists(p) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

/**
 * Compress a single image (given as a Buffer) into the derivative set.
 * Returns a manifest entry. Idempotent when `id` already has files on disk.
 */
export async function processBuffer(buffer, id) {
  const outDir = path.join(MEDIA_DIR, id);
  await fs.mkdir(outDir, { recursive: true });

  const base = sharp(buffer, { failOn: 'none' }).rotate(); // respect EXIF orientation
  const meta = await base.metadata();
  const width = meta.width || FULL_WIDTH;
  const height = meta.height || FULL_WIDTH;

  const thumbPath = path.join(outDir, 'thumb.webp');
  const fullPath = path.join(outDir, 'full.webp');

  await sharp(buffer, { failOn: 'none' })
    .rotate()
    .resize({ width: THUMB_WIDTH, withoutEnlargement: true })
    .webp({ quality: 72 })
    .toFile(thumbPath);

  await sharp(buffer, { failOn: 'none' })
    .rotate()
    .resize({ width: FULL_WIDTH, withoutEnlargement: true })
    .webp({ quality: 82 })
    .toFile(fullPath);

  const lqipBuffer = await sharp(buffer, { failOn: 'none' })
    .rotate()
    .resize({ width: LQIP_WIDTH })
    .webp({ quality: 40 })
    .toBuffer();
  const lqip = `data:image/webp;base64,${lqipBuffer.toString('base64')}`;

  const aspect = width && height ? +(width / height).toFixed(4) : 1;

  return {
    id,
    thumb: `media/${id}/thumb.webp`,
    full: `media/${id}/full.webp`,
    lqip,
    width,
    height,
    aspect,
  };
}

/** Process a source file that already exists under /images (by relative path). */
export async function processOriginal(relPath) {
  const abs = path.join(ORIGINALS_DIR, relPath);
  if (!(await exists(abs))) {
    throw new Error(`Original not found: ${relPath}`);
  }
  const id = mediaId(relPath);
  const buffer = await fs.readFile(abs);
  const entry = await processBuffer(buffer, id);
  return { ...entry, source: relPath };
}

/** Process an uploaded buffer (admin). Uses a content hash so identical
 *  uploads dedupe automatically. */
export async function processUpload(buffer, originalName) {
  const hash = crypto.createHash('sha1').update(buffer).digest('hex').slice(0, 16);
  const id = mediaId(`upload:${hash}`);
  const entry = await processBuffer(buffer, id);
  return { ...entry, source: `upload/${originalName}` };
}
