// One-time (idempotent) build step.
// Compresses every seed image into thumb/full/lqip derivatives and writes
// data/projects.json + data/manifest.json. Safe to re-run; unchanged images
// are simply re-encoded (fast) and IDs stay stable.

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { seed } from '../data/seed.js';
import { processOriginal } from '../src/images.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '..', 'data');

const manifest = {};
let done = 0;
let failed = 0;

async function ingest(relPath) {
  if (!relPath) return null;
  try {
    const entry = await processOriginal(relPath);
    manifest[entry.id] = entry;
    done += 1;
    process.stdout.write(`\r  processed ${done} images...`);
    return entry.id;
  } catch (err) {
    failed += 1;
    console.warn(`\n  ! skipped ${relPath}: ${err.message}`);
    return null;
  }
}

async function main() {
  console.log('Compressing images (thumb + full + blur placeholder)...');

  const projects = [];
  let order = 0;
  for (const p of seed.projects) {
    const coverId = await ingest(p.cover);
    const images = [];
    for (const src of p.images) {
      const id = await ingest(src);
      if (id) images.push({ id });
    }
    projects.push({
      id: p.id,
      title: p.title,
      caption: p.caption || '',
      link: p.link || '',
      cover: coverId,
      order: order++,
      images,
    });
  }

  const mosaic = [];
  for (const m of seed.mosaic) {
    const id = await ingest(m.src);
    if (id) mosaic.push({ id, projectId: m.projectId });
  }

  const profile = await ingest(seed.profile);
  const background = await ingest(seed.background);

  const data = { projects, mosaic, profile, background };

  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(path.join(DATA_DIR, 'projects.json'), JSON.stringify(data, null, 2));
  await fs.writeFile(path.join(DATA_DIR, 'manifest.json'), JSON.stringify(manifest, null, 2));

  console.log(`\nDone. ${done} images processed, ${failed} skipped.`);
  console.log('Wrote data/projects.json and data/manifest.json');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
